/**
 * Azure Cosmos DB Operation Tracing
 * Tracks database operations, request units, query performance, and partition key usage
 */

import { logger } from './structured-logger';
import { TraceSpan, TraceEvent } from './trace-context';

export interface CosmosDBOperation {
  operationType: 'create' | 'read' | 'update' | 'delete' | 'query' | 'upsert';
  duration: number;
  statusCode: number;
  requestCharge: number;
  totalRequestCharge?: number;
  itemCount?: number;
  documentId?: string;
  partitionKey?: string;
  query?: string;
  diagnosticString?: string;
  retryCount?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface PartitionKeyMetrics {
  key: string;
  operationCount: number;
  totalRUs: number;
  averageRUs: number;
  isHot: boolean; // Indicates unbalanced partition
}

export interface CosmosDBMetrics {
  totalOperations: number;
  totalRUsConsumed: number;
  averageOperationLatency: number;
  operationsByType: Record<string, number>;
  partitionKeyMetrics: Map<string, PartitionKeyMetrics>;
  errors: Map<string, number>;
  slowQueries: CosmosDBOperation[]; // queries > 100ms
}

export class CosmosDBTracer {
  private metrics: CosmosDBMetrics = {
    totalOperations: 0,
    totalRUsConsumed: 0,
    averageOperationLatency: 0,
    operationsByType: {},
    partitionKeyMetrics: new Map(),
    errors: new Map(),
    slowQueries: []
  };

  private operationHistory: CosmosDBOperation[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  /**
   * Track a Cosmos DB operation
   */
  trackOperation(operation: CosmosDBOperation): void {
    // Update metrics
    this.metrics.totalOperations++;
    this.metrics.totalRUsConsumed += operation.requestCharge;
    this.metrics.operationsByType[operation.operationType] =
      (this.metrics.operationsByType[operation.operationType] || 0) + 1;

    // Track partition key metrics
    if (operation.partitionKey) {
      this.trackPartitionKey(operation.partitionKey, operation.requestCharge);
    }

    // Track slow queries
    if (operation.operationType === 'query' && operation.duration > 100) {
      this.metrics.slowQueries.push(operation);
      logger.warn(`Slow query detected: ${operation.duration}ms`, {
        partitionKey: operation.partitionKey,
        rUs: operation.requestCharge,
        query: operation.query?.substring(0, 100)
      });
    }

    // Track errors
    if (operation.error) {
      const errorKey = `${operation.error.code}:${operation.error.message}`;
      this.metrics.errors.set(errorKey, (this.metrics.errors.get(errorKey) || 0) + 1);

      logger.error(`Cosmos DB operation failed: ${operation.operationType}`, new Error(operation.error.message), {
        statusCode: operation.statusCode,
        partitionKey: operation.partitionKey,
        retryCount: operation.retryCount
      });
    }

    // Update history
    this.operationHistory.push(operation);
    if (this.operationHistory.length > this.MAX_HISTORY_SIZE) {
      this.operationHistory.shift();
    }

    // Update average latency
    this.metrics.averageOperationLatency =
      this.operationHistory.reduce((sum, op) => sum + op.duration, 0) / this.operationHistory.length;

    this.logOperation(operation);
  }

  /**
   * Track partition key metrics
   */
  private trackPartitionKey(key: string, rus: number): void {
    const existing = this.metrics.partitionKeyMetrics.get(key) || {
      key,
      operationCount: 0,
      totalRUs: 0,
      averageRUs: 0,
      isHot: false
    };

    existing.operationCount++;
    existing.totalRUs += rus;
    existing.averageRUs = existing.totalRUs / existing.operationCount;

    // Simple hot partition detection: if a partition uses > 30% of total RUs with < 5% of operations
    const partitionPercentage = existing.totalRUs / (this.metrics.totalRUsConsumed + rus);
    const operationPercentage = existing.operationCount / (this.metrics.totalOperations + 1);
    existing.isHot = partitionPercentage > 0.3 && operationPercentage < 0.05;

    this.metrics.partitionKeyMetrics.set(key, existing);

    if (existing.isHot) {
      logger.warn(`Hot partition detected: ${key}`, {
        operationPercentage: (operationPercentage * 100).toFixed(2),
        rusPercentage: (partitionPercentage * 100).toFixed(2),
        averageRUs: existing.averageRUs
      });
    }
  }

  /**
   * Add event to trace span for Cosmos DB operation
   */
  addOperationEvent(span: TraceSpan, operation: CosmosDBOperation): void {
    const event: TraceEvent = {
      name: `cosmos_db_${operation.operationType}`,
      timestamp: Date.now(),
      duration: operation.duration,
      attributes: {
        operationType: operation.operationType,
        statusCode: operation.statusCode,
        requestCharge: operation.requestCharge,
        itemCount: operation.itemCount,
        documentId: operation.documentId,
        partitionKey: operation.partitionKey,
        retryCount: operation.retryCount,
        query: operation.query?.substring(0, 200) // Truncate long queries
      },
      status: operation.statusCode < 400 ? 'success' : 'error'
    };

    span.events.push(event);

    if (operation.error) {
      span.error = {
        message: operation.error.message,
        code: operation.error.code
      };
    }
  }

  /**
   * Log operation details
   */
  private logOperation(operation: CosmosDBOperation): void {
    logger.debug(`Cosmos DB operation: ${operation.operationType}`, {
      duration: operation.duration,
      statusCode: operation.statusCode,
      requestCharge: operation.requestCharge,
      partitionKey: operation.partitionKey,
      documentId: operation.documentId,
      itemCount: operation.itemCount
    });
  }

  /**
   * Get operation recommendations
   */
  getOptimizationRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for hot partitions
    let hotPartitions = 0;
    for (const metric of this.metrics.partitionKeyMetrics.values()) {
      if (metric.isHot) {
        hotPartitions++;
        recommendations.push(`Consider repartitioning "${metric.key}" - consuming ${(metric.totalRUs / this.metrics.totalRUsConsumed * 100).toFixed(1)}% of RUs`);
      }
    }

    // Check for slow queries
    if (this.metrics.slowQueries.length > 5) {
      recommendations.push(`${this.metrics.slowQueries.length} slow queries detected. Consider indexing strategy optimization.`);
    }

    // Check for high error rate
    const totalErrors = Array.from(this.metrics.errors.values()).reduce((a, b) => a + b, 0);
    const errorRate = totalErrors / this.metrics.totalOperations;
    if (errorRate > 0.05) {
      recommendations.push(`High error rate detected: ${(errorRate * 100).toFixed(1)}%. Review error logs for patterns.`);
    }

    // RU consumption analysis
    const avgRUsPerOp = this.metrics.totalRUsConsumed / this.metrics.totalOperations;
    if (avgRUsPerOp > 100) {
      recommendations.push(`High average RU consumption per operation: ${avgRUsPerOp.toFixed(1)}. Review query complexity.`);
    }

    return recommendations;
  }

  /**
   * Get metrics summary
   */
  getMetrics(): CosmosDBMetrics {
    return {
      ...this.metrics,
      partitionKeyMetrics: this.metrics.partitionKeyMetrics,
      errors: this.metrics.errors
    };
  }

  /**
   * Reset metrics (useful for testing or periodic resets)
   */
  reset(): void {
    this.metrics = {
      totalOperations: 0,
      totalRUsConsumed: 0,
      averageOperationLatency: 0,
      operationsByType: {},
      partitionKeyMetrics: new Map(),
      errors: new Map(),
      slowQueries: []
    };
    this.operationHistory = [];
  }

  /**
   * Get recent operations (for diagnostics)
   */
  getRecentOperations(limit: number = 10): CosmosDBOperation[] {
    return this.operationHistory.slice(-limit);
  }

  /**
   * Export metrics for monitoring
   */
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalOperations: this.metrics.totalOperations,
        totalRUsConsumed: this.metrics.totalRUsConsumed,
        averageLatency: this.metrics.averageOperationLatency,
        operationsByType: this.metrics.operationsByType
      },
      partitionKeys: Array.from(this.metrics.partitionKeyMetrics.values()),
      errors: Object.fromEntries(this.metrics.errors),
      slowQueryCount: this.metrics.slowQueries.length,
      recommendations: this.getOptimizationRecommendations()
    };
  }
}

// Export singleton instance
export const cosmosDbTracer = new CosmosDBTracer();