// filepath: /lib/tracing/cosmos-db-tracer.ts
// ABACO Financial Intelligence Platform - Azure Cosmos DB Tracer
// Following AI Toolkit best practices with HPK optimization

export interface PartitionKeyMetrics {
  partitionKey: string;
  operationCount: number;
  totalRUs: number;
  averageLatency: number;
  errorCount: number;
  lastAccessTime: Date;
}

export interface CosmosDBMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  averageLatency: number;
  totalRUsConsumed: number;
  partitionKeyMetrics: Map<string, PartitionKeyMetrics>;
  hotPartitions: string[];
}

export class CosmosDBTracer {
  private metrics: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    totalLatency: number;
    totalRUsConsumed: number;
    partitionKeyMetrics: Map<string, PartitionKeyMetrics>;
  } = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    totalLatency: 0,
    totalRUsConsumed: 0,
    partitionKeyMetrics: new Map()
  };

  constructor(
    private tenantId: string = 'abaco_financial',
    private platform: string = 'abaco_financial_intelligence'
  ) {}

  traceOperation(
    operation: string,
    partitionKey: string,
    latency: number,
    ruConsumed: number,
    success: boolean
  ): void {
    // Update total metrics
    this.metrics.totalOperations++;
    this.metrics.totalLatency += latency;
    this.metrics.totalRUsConsumed += ruConsumed;

    if (success) {
      this.metrics.successfulOperations++;
    } else {
      this.metrics.failedOperations++;
    }

    // Update partition-specific metrics
    const existing = this.metrics.partitionKeyMetrics.get(partitionKey) || {
      partitionKey,
      operationCount: 0,
      totalRUs: 0,
      averageLatency: 0,
      errorCount: 0,
      lastAccessTime: new Date()
    };

    existing.operationCount++;
    existing.totalRUs += ruConsumed;
    existing.averageLatency = (existing.averageLatency * (existing.operationCount - 1) + latency) / existing.operationCount;
    existing.lastAccessTime = new Date();
    
    if (!success) {
      existing.errorCount++;
    }

    this.metrics.partitionKeyMetrics.set(partitionKey, existing);

    // AI Toolkit tracing for Cosmos DB operations
    console.log('🔍 [AI Toolkit Trace] Cosmos DB operation', {
      operation,
      partitionKey,
      latency,
      ruConsumed,
      success,
      tenantId: this.tenantId,
      platform: this.platform,
      timestamp: new Date().toISOString()
    });
  }

  getMetrics(): CosmosDBMetrics {
    return {
      totalOperations: this.metrics.totalOperations,
      successfulOperations: this.metrics.successfulOperations,
      failedOperations: this.metrics.failedOperations,
      averageLatency: this.metrics.totalOperations > 0 
        ? this.metrics.totalLatency / this.metrics.totalOperations 
        : 0,
      totalRUsConsumed: this.metrics.totalRUsConsumed,
      partitionKeyMetrics: this.metrics.partitionKeyMetrics,
      hotPartitions: this.getHotPartitions()
    };
  }

  private getHotPartitions(): string[] {
    const threshold = this.metrics.totalOperations * 0.1; // 10% of total operations
    return Array.from(this.metrics.partitionKeyMetrics.entries())
      .filter(([_, metrics]) => metrics.operationCount > threshold)
      .map(([partitionKey, _]) => partitionKey)
      .slice(0, 5); // Top 5 hot partitions
  }

  // Azure Cosmos DB HPK optimization helper
  generateOptimalPartitionKey(
    tenantId: string,
    entityType: string,
    date: string = new Date().toISOString().split('T')[0]
  ): string {
    return `${tenantId}/${entityType}/${date}`;
  }
}
