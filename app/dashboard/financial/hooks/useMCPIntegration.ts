'use client';

import { useState, useEffect, useCallback } from 'react';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

// Tipos para configuración MCP
type MCPConfigEntry =
  | { command: string; args: string[]; env?: Record<string, string | undefined> }
  | { command: string; args: string[] };

// Type guard para env
function hasEnvConfig(x: unknown): x is { env: Record<string, string | undefined> } {
  return typeof x === 'object' && x !== null && 'env' in x && typeof (x as any).env === 'object';
}

// Mock MCP client para evitar dependencias externas por ahora
const mockMCPClient = {
  initializeServer: async (
    name: string,
    command: string,
    args: string[],
    env?: Record<string, string>
  ) => {
    console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}`);
    if (env && Object.keys(env).length > 0) {
      console.log(`Mock: Using environment variables ${JSON.stringify(env)}`);
    }
    return Math.random() > 0.3; // Simula éxito en 70% de casos
  },
  searchFinancialData: async (query: string) => ({ success: true, data: `Mock analysis for: ${query}` }),
  fetchMarketData: async (url: string) => ({ success: true, data: `Mock data from: ${url}` }),
  storeMemory: async (key: string, value: unknown) => {
    if (value !== undefined) {
      console.log(`Mock: Persisting payload for ${key}`);
    }

    return { success: true, data: `Stored ${key}` };
  },
  getMemory: async (key: string) => ({ success: true, data: `Retrieved ${key}` }),
  disconnect: async () => console.log('Mock: Disconnected')
};

/**
 * React hook that manages initialization, state, and access to mock MCP servers used for financial queries, market fetching, and memory storage.
 *
 * Exposes state reflecting whether any MCP servers have been initialized, a loading flag, an error message, and the set of initialized server names, along with actions to initialize servers and perform MCP-backed operations.
 *
 * @returns An object with:
 * - `isInitialized` — `true` if at least one MCP server was successfully initialized, `false` otherwise.
 * - `isLoading` — `true` while server initialization is in progress, `false` otherwise.
 * - `error` — an error message string when initialization failed, or `null`.
 * - `servers` — a Set of initialized server names.
 * - `initializeMCPServers` — function to (re)attempt initialization of configured MCP servers.
 * - `searchFinancialInsights` — function accepting a query string and returning the result or an object with `success: false` and `error` if the required server is not initialized.
 * - `fetchMarketData` — function accepting a source string and returning the fetched market data or a server-check error object.
 * - `storeAnalysisResult` — function accepting an `analysisId` and a result payload to persist to memory, or a server-check error object.
 * - `getStoredAnalysis` — function accepting an `analysisId` and returning the stored payload or a server-check error object.
 */
export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set()
  });

  const checkServer = useCallback(
    (serverName: string) => {
      if (!state.servers.has(serverName)) {
        return {
          success: false,
          error: `Server ${serverName} is not initialized`
        } as const;
      }

      return null;
    },
    [state.servers]
  );

  const initializeMCPServers = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const mcpConfig: Record<string, MCPConfigEntry> = {
        'perplexity-ask': {
          command: 'npx',
          args: ['-y', 'server-perplexity-ask'],
          env: { PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY }
        },
        'fetch': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-fetch']
        },
        'memory': {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-memory']
        }
      };

      const initializedServers = new Set<string>();

      // Bucle con type guards y normalización segura
      for (const [serverName, configRaw] of Object.entries(mcpConfig)) {
        const config = configRaw as MCPConfigEntry;

        if (hasEnvConfig(config)) {
          // Verificar variables de entorno
          const envValues = Object.values(config.env);
          if (!envValues.length || !envValues.every(v => typeof v === 'string' && v.length > 0)) {
            console.warn(`Skipping ${serverName} - missing environment variables`);
            continue;
          }
        }

        // Normalizar env a Record<string, string> o undefined
        const envToPass: Record<string, string> | undefined = hasEnvConfig(config)
          ? Object.fromEntries(Object.entries(config.env).map(([k, v]) => [k, v ?? '']))
          : undefined;

        // Usar mock client por ahora
        const success = await mockMCPClient.initializeServer(
          serverName,
          config.command,
          config.args,
          envToPass
        );

        if (success) {
          initializedServers.add(serverName);
        }
      }

      setState(prev => ({
        ...prev,
        isInitialized: initializedServers.size > 0,
        isLoading: false,
        servers: initializedServers
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize MCP servers'
      }));
    }
  }, []);

  const searchFinancialInsights = useCallback(async (query: string) => {
    const serverCheck = checkServer('perplexity-ask');
    if (serverCheck) return serverCheck;
    return await mockMCPClient.searchFinancialData(query);
  }, [checkServer]);

  const fetchMarketData = useCallback(async (source: string) => {
    const serverCheck = checkServer('fetch');
    if (serverCheck) return serverCheck;
    return await mockMCPClient.fetchMarketData(source);
  }, [checkServer]);

  const storeAnalysisResult = useCallback(async (analysisId: string, result: any) => {
    const serverCheck = checkServer('memory');
    if (serverCheck) return serverCheck;
    return await mockMCPClient.storeMemory(`analysis_${analysisId}`, result);
  }, [checkServer]);

  const getStoredAnalysis = useCallback(async (analysisId: string) => {
    const serverCheck = checkServer('memory');
    if (serverCheck) return serverCheck;
    return mockMCPClient.getMemory(`analysis_${analysisId}`);
  }, [checkServer]);

  useEffect(() => {
    initializeMCPServers();
    return () => {
      mockMCPClient.disconnect();
    };
  }, [initializeMCPServers]);

  return {
    ...state,
    initializeMCPServers,
    searchFinancialInsights,
    fetchMarketData,
    storeAnalysisResult,
    getStoredAnalysis
  };
}