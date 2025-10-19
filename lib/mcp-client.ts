import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class AbacoMCPClient {
  private clients: Map<string, Client> = new Map();

  async initializeServer(serverName: string, command: string, args: string[], env?: Record<string, string>): Promise<boolean> {
    try {
      const transport = new StdioClientTransport({
        command,
        args,
        env: { ...process.env, ...env }
      });

      const client = new Client({
        name: `abaco-${serverName}`,
        version: '1.0.0'
      }, {
        capabilities: {
          tools: {}
        }
      });

      await client.connect(transport);
      this.clients.set(serverName, client);
      
      console.log(`✓ MCP Server '${serverName}' initialized successfully`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to initialize MCP server '${serverName}':`, error);
      return false;
    }
  }

  async searchFinancialData(query: string): Promise<MCPResponse> {
    const perplexityClient = this.clients.get('perplexity-ask');
    if (!perplexityClient) {
      return { success: false, error: 'Perplexity server not initialized' };
    }

    try {
      const response = await perplexityClient.callTool({
        name: 'ask_perplexity',
        arguments: {
          query: `Financial analysis: ${query}`,
          model: 'llama-3.1-sonar-large-128k-online'
        }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async fetchMarketData(url: string): Promise<MCPResponse> {
    const fetchClient = this.clients.get('fetch');
    if (!fetchClient) {
      return { success: false, error: 'Fetch server not initialized' };
    }

    try {
      const response = await fetchClient.callTool({
        name: 'fetch',
        arguments: { url }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async queryDatabase(sql: string): Promise<MCPResponse> {
    const postgresClient = this.clients.get('postgres');
    if (!postgresClient) {
      return { success: false, error: 'Postgres server not initialized' };
    }

    try {
      const response = await postgresClient.callTool({
        name: 'query',
        arguments: { sql }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async searchWeb(query: string): Promise<MCPResponse> {
    const searchClient = this.clients.get('web-search');
    if (!searchClient) {
      return { success: false, error: 'Web search server not initialized' };
    }

    try {
      const response = await searchClient.callTool({
        name: 'web_search',
        arguments: { query }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async storeMemory(key: string, value: any): Promise<MCPResponse> {
    const memoryClient = this.clients.get('memory');
    if (!memoryClient) {
      return { success: false, error: 'Memory server not initialized' };
    }

    try {
      const response = await memoryClient.callTool({
        name: 'create_memory',
        arguments: { key, value: JSON.stringify(value) }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getMemory(key: string): Promise<MCPResponse> {
    const memoryClient = this.clients.get('memory');
    if (!memoryClient) {
      return { success: false, error: 'Memory server not initialized' };
    }

    try {
      const response = await memoryClient.callTool({
        name: 'query_memory',
        arguments: { query: key }
      });

      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async disconnect(): Promise<void> {
    for (const [name, client] of this.clients) {
      try {
        await client.close();
        console.log(`✓ Disconnected from MCP server '${name}'`);
      } catch (error) {
        console.error(`✗ Error disconnecting from '${name}':`, error);
      }
    }
    this.clients.clear();
  }
}

// Singleton instance for the ABACO platform
export const abacoMCP = new AbacoMCPClient();
