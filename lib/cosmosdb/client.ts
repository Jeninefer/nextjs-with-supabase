// Note: Install @azure/cosmos package when ready to use actual Cosmos DB
// npm install @azure/cosmos

import { cosmosDbTracer } from '../tracing/cosmos-db-tracer';
import { logger } from '../tracing/structured-logger';

interface CosmosConfig {
  endpoint: string;
  key: string;
  databaseName: string;
  containerName: string;
}

export interface DiagnosticInfo {
  operation: string;
  latency: number;
  statusCode: number;
  requestCharge?: number;
  diagnosticString?: string;
}

// Mock implementation for development - replace with actual Azure Cosmos DB when available
class MockCosmosClient {
  private readonly config: CosmosConfig;
  private readonly diagnosticLogger: (info: DiagnosticInfo) => void;

  constructor(config: CosmosConfig, diagnosticLogger?: (info: DiagnosticInfo) => void) {
    this.config = config;
    this.diagnosticLogger = diagnosticLogger || this.defaultDiagnosticLogger;
  }

  private readonly defaultDiagnosticLogger = (info: DiagnosticInfo): void => {
    if (info.latency > 100 || ![200, 201, 204].includes(info.statusCode)) {
      logger.warn(`Cosmos DB operation latency exceeded threshold`, {
        operation: info.operation,
        latency: `${info.latency}ms`,
        statusCode: info.statusCode,
        requestCharge: info.requestCharge,
        diagnostic: info.diagnosticString
      });
    }
  };

  async getContainer(): Promise<{ items: { create: (doc: any, options?: any) => Promise<any> } }> {
    // Mock container for development
    return {
      items: {
        create: async (document: any, options?: any) => {
          const startTime = Date.now();

          // Simulate network latency
          await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 10));

          const latency = Date.now() - startTime;
          const requestCharge = 5.2;

          // Track in distributed tracing system
          const partitionKey = options?.partitionKey || document.userId || 'unknown';
          cosmosDbTracer.trackOperation({
            operationType: 'create',
            duration: latency,
            statusCode: 201,
            requestCharge,
            itemCount: 1,
            documentId: document.id,
            partitionKey
          });

          this.diagnosticLogger({
            operation: 'create_document',
            latency,
            statusCode: 201,
            requestCharge,
            diagnosticString: `Document created: ${document.id}`
          });

          logger.debug('Cosmos DB document created', {
            documentId: document.id,
            partitionKey,
            latency,
            requestCharge
          });

          return {
            resource: { ...document, _etag: `"${Date.now()}"` },
            statusCode: 201,
            requestCharge,
            diagnostics: { toString: () => `Creation for ${document.id}` }
          };
        }
      }
    };
  }

  async executeWithDiagnostics<T>(
    operation: string,
    fn: () => Promise<{ resource: T; statusCode: number; requestCharge?: number; diagnostics?: unknown }>
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const response = await fn();
      const latency = Date.now() - startTime;
      const requestCharge = response.requestCharge || 0;

      // Track in distributed tracing system
      cosmosDbTracer.trackOperation({
        operationType: operation.includes('query') ? 'query' : 'read',
        duration: latency,
        statusCode: response.statusCode,
        requestCharge,
        diagnosticString: response.diagnostics?.toString()
      });

      this.diagnosticLogger({
        operation,
        latency,
        statusCode: response.statusCode,
        requestCharge,
        diagnosticString: response.diagnostics?.toString()
      });

      logger.debug(`Cosmos DB operation completed: ${operation}`, {
        latency,
        statusCode: response.statusCode,
        requestCharge
      });

      return response.resource;
    } catch (error: unknown) {
      const latency = Date.now() - startTime;
      const errorCode = Number((error as any)?.code) || 500;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Track error in distributed tracing system
      cosmosDbTracer.trackOperation({
        operationType: operation.includes('query') ? 'query' : 'read',
        duration: latency,
        statusCode: errorCode,
        requestCharge: 0,
        error: {
          code: (error as any)?.code || 'UNKNOWN_ERROR',
          message: errorMessage
        }
      });

      this.diagnosticLogger({
        operation,
        latency,
        statusCode: errorCode,
        diagnosticString: errorMessage
      });

      logger.error(`Cosmos DB operation failed: ${operation}`, error instanceof Error ? error : new Error(errorMessage), {
        statusCode: errorCode,
        latency
      });

      throw error;
    }
  }

  async close(): Promise<void> {
    logger.info('Cosmos DB client connection closed');
  }
}

let cosmosClient: MockCosmosClient | null = null;

export const getCosmosClient = (diagnosticLogger?: (info: DiagnosticInfo) => void): MockCosmosClient => {
  if (!cosmosClient) {
    const config: CosmosConfig = {
      endpoint: process.env.COSMOS_DB_ENDPOINT || 'https://localhost:8081',
      key: process.env.COSMOS_DB_KEY || 'mock-key',
      databaseName: process.env.COSMOS_DB_DATABASE || 'abaco-financial',
      containerName: process.env.COSMOS_DB_CONTAINER || 'financial-intelligence'
    };

    cosmosClient = new MockCosmosClient(config, diagnosticLogger);
  }

  return cosmosClient;
};

// Export metrics for monitoring
export const getCosmosDBMetrics = () => {
  return cosmosDbTracer.exportMetrics();
};

// When ready to use actual Azure Cosmos DB, see the official documentation and provide a full implementation here:
// https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/sdk-node
