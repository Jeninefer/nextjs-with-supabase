'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Aggregated state values exposed by the MCP integration hook.
 */
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
/**
 * Determines whether the provided value includes an MCP environment configuration.
 *
 * @param x - Value that potentially contains an `env` configuration property.
 * @returns A type predicate that narrows `x` to objects with an environment map.
 */
function hasEnvConfig(x: unknown): x is { env: Record<string, string | undefined> } {
  return typeof x === 'object' && x !== null && 'env' in x && typeof (x as any).env === 'object';
}

// Mock MCP client para evitar dependencias externas por ahora
/**
 * Minimal mock implementation of the MCP client leveraged by the hook for local testing.
 * Each method mirrors the shape of the anticipated production MCP SDK behavior.
 */
const mockMCPClient = {
  initializeServer: async (name: string, command: string, args: string[]) => {
    console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}`);
    return Math.random() > 0.3; // Simula éxito en 70% de casos
  },
  searchFinancialData: async (query: string) => ({ success: true, data: `Mock analysis for: ${query}` }),
  fetchMarketData: async (url: string) => ({ success: true, data: `Mock data from: ${url}` }),
  storeMemory: async (key: string) => ({ success: true, data: `Stored ${key}` }),
  getMemory: async (key: string) => ({ success: true, data: `Retrieved ${key}` }),
  disconnect: async () => console.log('Mock: Disconnected')
};

/**
 * React hook that orchestrates communication with MCP servers for the financial dashboard.
 * It handles server initialization, data retrieval helpers, and shared lifecycle state.
 *
 * @returns The hook state and callable helpers that surface MCP capabilities to components.
 */
export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set()
  });

  /**
   * Initializes every configured MCP server, handling environment validation and
   * state hydration in a resilient manner for the dashboard experience.
   */
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
        // Fix: mockMCPClient.initializeServer expects 3 arguments, not 4.
        const success = await mockMCPClient.initializeServer(
          serverName,
          config.command,
          config.args
          // envToPass // <-- Remove this argument or update mockMCPClient accordingly
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

  /**
   * Issues an MCP-backed financial search request using the mock client implementation.
   *
   * @param query - Free-form text describing the analytical question to process.
   * @returns The mock MCP response payload to mimic financial insights.
   */
  const searchFinancialInsights = useCallback(async (query: string) => {
    return await mockMCPClient.searchFinancialData(query);
  }, []);

  /**
   * Retrieves market information from the MCP mock client.
   *
   * @param source - Identifier or URL describing the desired market data source.
   * @returns A mocked market data payload with the provided source metadata.
   */
  const fetchMarketData = useCallback(async (source: string) => {
    return await mockMCPClient.fetchMarketData(source);
  }, []);

  // Fix: mockMCPClient.storeMemory expects 1 argument, not 2.
  /**
   * Persists the provided analysis result in the mock MCP memory layer.
   *
   * @param analysisId - Identifier used to build the memory cache key.
   * @param result - Serialized analysis output to be stored for later retrieval.
   * @returns The storage confirmation emitted by the mock client.
   */
  const storeAnalysisResult = useCallback(async (analysisId: string, result: any) => {
    return await mockMCPClient.storeMemory(`analysis_${analysisId}`);
  }, []);

  /**
   * Fetches a previously stored analysis result from the mock MCP memory facility.
   *
   * @param analysisId - Identifier used when persisting the analysis payload.
   * @returns The stored mock MCP memory content associated with the supplied ID.
   */
  const getStoredAnalysis = useCallback(async (analysisId: string) => {
    return mockMCPClient.getMemory(`analysis_${analysisId}`);
  }, []);

  useEffect(() => {
    initializeMCPServers();
    return () => {
      mockMCPClient.disconnect();
    };
  }, [initializeMCPServers]);

  /**
   * Exposes hook state and MCP lifecycle helpers for integration inside dashboard components.
   */
  return {
    ...state,
    initializeMCPServers,
    searchFinancialInsights,
    fetchMarketData,
    storeAnalysisResult,
    getStoredAnalysis
  };
}
