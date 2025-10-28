'use client';

import { useCallback, useEffect, useState } from 'react';

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
const memoryStore = new Map<string, unknown>();
const mockMCPClient = {
  initializeServer: async (name: string, command: string, args: string[]) => {
    console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}`);
    return Math.random() > 0.3; // Simula éxito en 70% de casos
  },
  searchFinancialData: async (query: string) => ({ success: true, data: `Mock analysis for: ${query}` }),
  fetchMarketData: async (url: string) => ({ success: true, data: `Mock data from: ${url}` }),
  storeMemory: async (key: string, value: unknown) => {
    memoryStore.set(key, value);
    return { success: true, data: `Stored ${key}` };
  },
  getMemory: async (key: string) => ({ success: true, data: memoryStore.get(key) }),
  disconnect: async () => {
    memoryStore.clear();
    console.log('Mock: Disconnected');
  }
};

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set()
  });

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

        // Usar mock client por ahora
        // Fix: mockMCPClient.initializeServer expects 3 arguments, not 4.
        const success = await mockMCPClient.initializeServer(
          serverName,
          config.command,
          config.args
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

  const searchFinancialInsights = useCallback((query: string) => {
    return mockMCPClient.searchFinancialData(query);
  }, []);

  const fetchMarketData = useCallback((source: string) => {
    return mockMCPClient.fetchMarketData(source);
  }, []);

  const storeAnalysisResult = useCallback((analysisId: string, result: unknown) => {
    return mockMCPClient.storeMemory(`analysis_${analysisId}`, result);
  }, []);

  const getStoredAnalysis = useCallback((analysisId: string) => {
    return mockMCPClient.getMemory(`analysis_${analysisId}`);
  }, []);

  useEffect(() => {
    initializeMCPServers();
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
    getStoredAnalysis
  };
}
