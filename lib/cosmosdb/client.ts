// Note: Install @azure/cosmos package when ready to use actual Cosmos DB
// npm install @azure/cosmos

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
      console.warn(`[MOCK_COSMOS_DIAGNOSTIC] ${info.operation}`, {
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
          
          this.diagnosticLogger({
            operation: 'create_document',
            latency,
            statusCode: 201,
            requestCharge: 5.2,
            diagnosticString: `Mock document created: ${document.id}`
          });

          return {
            resource: { ...document, _etag: `"${Date.now()}"` },
            statusCode: 201,
            requestCharge: 5.2,
            diagnostics: { toString: () => `Mock creation for ${document.id}` }
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
      
      this.diagnosticLogger({
        operation,
        latency,
        statusCode: response.statusCode,
        requestCharge: response.requestCharge,
        diagnosticString: response.diagnostics?.toString()
      });
      
      return response.resource;
    } catch (error: unknown) {
      const latency = Date.now() - startTime;
      let errorCode = 500;
      if (error instanceof Error && 'code' in error) {
        const rawCode = (error as any).code;
        if (typeof rawCode === 'number') {
          errorCode = rawCode;
        } else if (typeof rawCode === 'string' && !isNaN(Number(rawCode))) {
          errorCode = Number(rawCode);
        }
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      this.diagnosticLogger({
        operation,
        latency,
        statusCode: errorCode,
        diagnosticString: errorMessage
      });
      
      throw error;
    }
  }

  async close(): Promise<void> {
    console.log('[MOCK_COSMOS] Client connection closed');
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

// When ready to use actual Azure Cosmos DB, uncomment and install @azure/cosmos:
/*
import { CosmosClient, CosmosClientOptions, Container, Database } from '@azure/cosmos';

class FinancialCosmosClient {
  private readonly client: CosmosClient;
  private database: Database | null = null;
  private container: Container | null = null;
  private readonly config: CosmosConfig;
  private readonly diagnosticLogger: (info: DiagnosticInfo) => void;

  constructor(config: CosmosConfig, diagnosticLogger?: (info: DiagnosticInfo) => void) {
    this.config = config;
    this.diagnosticLogger = diagnosticLogger || this.defaultDiagnosticLogger;
    
    const clientOptions: CosmosClientOptions = {
      connectionPolicy: {
        requestTimeout: 30000,
        retryOptions: {
          maxRetryAttemptCount: 3,
          fixedRetryIntervalInMilliseconds: 1000,
          maxRetryWaitTimeInSeconds: 30
        }
      },
      userAgentSuffix: 'AbacoFinancialIntelligence/1.0'
    };

    this.client = new CosmosClient({
      endpoint: config.endpoint,
      key: config.key,
      ...clientOptions
    });
  }

  // ... rest of implementation
}
*/
