// filepath: /lib/cosmosdb/client.ts
import { CosmosClient, Container } from '@azure/cosmos'

let cosmosClient: CosmosClient | null = null

export function getCosmosClient(): CosmosClient {
  if (!cosmosClient) {
    const endpoint = process.env.AZURE_COSMOS_DB_ENDPOINT
    const key = process.env.AZURE_COSMOS_DB_KEY
    
    if (!endpoint || !key) {
      throw new Error('Azure Cosmos DB configuration missing: AZURE_COSMOS_DB_ENDPOINT and AZURE_COSMOS_DB_KEY are required')
    }

    cosmosClient = new CosmosClient({
      endpoint,
      key,
      connectionPolicy: {
        requestTimeout: 30000,
        retryOptions: {
          maxRetryAttemptCount: 3,
          fixedRetryIntervalInMilliseconds: 1000,
          maxWaitTimeInSeconds: 30
        }
      }
    })

    console.log('🔍 [AI Toolkit Trace] Cosmos DB client initialized', {
      timestamp: new Date().toISOString(),
      endpoint: endpoint.replace(/[?&].*/, ''), // Remove query params for security
      platform: 'abaco_financial_intelligence'
    })
  }

  return cosmosClient
}

export async function getContainer(databaseName: string, containerName: string): Promise<Container> {
  const client = getCosmosClient()
  const database = client.database(databaseName)
  return database.container(containerName)
}
