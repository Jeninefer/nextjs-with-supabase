import { CosmosClient, CosmosClientOptions, Container, Database } from '@azure/cosmos';

interface CosmosConfig {
  endpoint: string;
  key: string;
  databaseName: string;
  containerName: string;
}

interface DiagnosticInfo {
  operation: string;
  latency: number;
  statusCode: number;
  requestCharge?: number;
  diagnosticString?: string;
}

class FinancialCosmosClient {
  private readonly client: CosmosClient;
  private database: Database | null = null;
  private container: Container | null = null;
  private config: CosmosConfig;
  private diagnosticLogger: (info: DiagnosticInfo) => void;

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

  private defaultDiagnosticLogger = (info: DiagnosticInfo): void => {
    if (info.latency > 100 || ![200, 201, 204].includes(info.statusCode)) {
      console.warn(`[COSMOS_DIAGNOSTIC] ${info.operation}`, {
        latency: `${info.latency}ms`,
        statusCode: info.statusCode,
        requestCharge: info.requestCharge,
        diagnostic: info.diagnosticString
      });
    }
  };

  async getContainer(): Promise<Container> {
    if (!this.container) {
      if (!this.database) {
        this.database = this.client.database(this.config.databaseName);
      }
      this.container = this.database.container(this.config.containerName);
    }
    return this.container;
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
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: number }).code : 500;
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
    await this.client.dispose();
  }
}

let cosmosClient: FinancialCosmosClient | null = null;

export const getCosmosClient = (diagnosticLogger?: (info: DiagnosticInfo) => void): FinancialCosmosClient => {
  if (!cosmosClient) {
    const config: CosmosConfig = {
      endpoint: process.env.COSMOS_DB_ENDPOINT!,
      key: process.env.COSMOS_DB_KEY!,
      databaseName: process.env.COSMOS_DB_DATABASE || 'abaco-financial',
      containerName: process.env.COSMOS_DB_CONTAINER || 'financial-intelligence'
    };
    
    cosmosClient = new FinancialCosmosClient(config, diagnosticLogger);
  }
  
  return cosmosClient;
};

export type { DiagnosticInfo };
