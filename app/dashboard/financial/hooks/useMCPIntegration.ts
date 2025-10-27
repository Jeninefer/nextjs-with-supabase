'use client';

import { useState, useEffect, useCallback } from 'react';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

type MCPConfigEntry =
  | { command: string; args: string[]; env?: Record<string, string | undefined> }
  | { command: string; args: string[] };

type MCPErrorResult = { success: false; error: string };

type MCPResult<T = unknown> = MCPErrorResult | { success: true; data: T };

function hasEnvConfig(x: unknown): x is { env: Record<string, string | undefined> } {
  return typeof x === 'object' && x !== null && 'env' in x && typeof (x as { env?: unknown }).env === 'object';
}

const mockMCPClient = {
  initializeServer: async (name: string, command: string, args: string[], env?: Record<string, string>) => {
    console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}`);
    if (env) {
      console.debug('[MCP] Environment snapshot', { name, providedEnvKeys: Object.keys(env) });
    }
    return Math.random() > 0.3;
  },
  searchFinancialData: async (query: string): Promise<MCPResult<string>> => ({
    success: true,
    data: `Mock analysis for: ${query}`,
  }),
  fetchMarketData: async (url: string): Promise<MCPResult<string>> => ({
    success: true,
    data: `Mock data from: ${url}`,
  }),
  storeMemory: async (key: string, value: unknown): Promise<MCPResult<string>> => ({
    success: true,
    data: `Stored ${key} with value type ${typeof value}`,
  }),
  getMemory: async (key: string): Promise<MCPResult<string>> => ({
    success: true,
    data: `Retrieved ${key}`,
  }),
  disconnect: async () => {
    console.log('Mock: Disconnected');
  },
} as const;

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set(),
  });

  const checkServer = useCallback(
    (serverName: string): MCPErrorResult | null => {
      if (!state.isInitialized) {
        return {
          success: false as const,
          error: 'MCP servers are not initialized yet. Call initializeMCPServers first.',
        };
      }

      if (!state.servers.has(serverName)) {
        return {
          success: false as const,
          error: `MCP server "${serverName}" is not initialized.`,
        };
      }

      return null;
    },
    [state.isInitialized, state.servers],
  );

  const initializeMCPServers = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const mcpConfig: Record<string, MCPConfigEntry> = {
        'perplexity-ask': {
          command: 'npx',
          args: ['-y', 'server-perplexity-ask'],
          env: { PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY },
        },
        fetch: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-fetch'],
        },
        memory: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-memory'],
        },
      };

      console.debug('[MCP] Initializing servers', {
        configuredServers: Object.keys(mcpConfig),
        hasPerplexityKey: Boolean(process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY),
      });

      const initializedServers = new Set<string>();

      for (const [serverName, configRaw] of Object.entries(mcpConfig)) {
        const config = configRaw as MCPConfigEntry;

        if (hasEnvConfig(config)) {
          const envValues = Object.values(config.env);
          if (!envValues.length || !envValues.every((value) => typeof value === 'string' && value.length > 0)) {
            console.warn(`Skipping ${serverName} - missing environment variables`);
            continue;
          }
        }

        const envToPass: Record<string, string> | undefined = hasEnvConfig(config)
          ? Object.fromEntries(
              Object.entries(config.env).map(([key, value]) => [key, value ?? '']),
            )
          : undefined;

        const success = await mockMCPClient.initializeServer(
          serverName,
          config.command,
          config.args,
          envToPass,
        );

        if (success) {
          initializedServers.add(serverName);
        }
      }

      setState((prev) => ({
        ...prev,
        isInitialized: initializedServers.size > 0,
        isLoading: false,
        servers: initializedServers,
        error: initializedServers.size > 0 ? null : 'Failed to initialize any MCP servers',
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize MCP servers',
      }));
    }
  }, []);

  const searchFinancialInsights = useCallback(
    async (query: string): Promise<MCPResult<string>> => {
      const serverCheck = checkServer('perplexity-ask');
      if (serverCheck) return serverCheck;
      return await mockMCPClient.searchFinancialData(query);
    },
    [checkServer],
  );

  const fetchMarketData = useCallback(
    async (source: string): Promise<MCPResult<string>> => {
      const serverCheck = checkServer('fetch');
      if (serverCheck) return serverCheck;
      return await mockMCPClient.fetchMarketData(source);
    },
    [checkServer],
  );

  const storeAnalysisResult = useCallback(
    async (analysisId: string, result: unknown): Promise<MCPResult<string>> => {
      const serverCheck = checkServer('memory');
      if (serverCheck) return serverCheck;
      return await mockMCPClient.storeMemory(`analysis_${analysisId}`, result);
    },
    [checkServer],
  );

  const getStoredAnalysis = useCallback(
    async (analysisId: string): Promise<MCPResult<string>> => {
      const serverCheck = checkServer('memory');
      if (serverCheck) return serverCheck;
      return await mockMCPClient.getMemory(`analysis_${analysisId}`);
    },
    [checkServer],
  );

  useEffect(() => {
    void initializeMCPServers();
    return () => {
      void mockMCPClient.disconnect();
    };
  }, [initializeMCPServers]);

  return {
    ...state,
    initializeMCPServers,
    searchFinancialInsights,
    fetchMarketData,
    storeAnalysisResult,
    getStoredAnalysis,
  };
}
