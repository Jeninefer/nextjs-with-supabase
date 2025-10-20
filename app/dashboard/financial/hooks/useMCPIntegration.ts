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
  initializeServer: async (name: string, command: string, args: string[], env?: Record<string, string>) => {
    console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}`);
    return Math.random() > 0.3; // Simula éxito en 70% de casos
  },
  searchFinancialData: async (query: string) => ({ success: true, data: `Mock analysis for: ${query}` }),
  fetchMarketData: async (url: string) => ({ success: true, data: `Mock data from: ${url}` }),
  storeMemory: async (key: string, value: any) => ({ success: true, data: `Stored ${key}` }),
  getMemory: async (key: string) => ({ success: true, data: `Retrieved ${key}` }),
  disconnect: async () => console.log('Mock: Disconnected')
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
    if (!state.servers.has('perplexity-ask')) {
      return { success: false, error: 'Perplexity server not available' };
    }
    return await mockMCPClient.searchFinancialData(query);
  }, [state.servers]);

  const fetchMarketData = useCallback(async (source: string) => {
    if (!state.servers.has('fetch')) {
      return { success: false, error: 'Fetch server not available' };
    }
    return await mockMCPClient.fetchMarketData(source);
  }, [state.servers]);

  const storeAnalysisResult = useCallback(async (analysisId: string, result: any) => {
    if (!state.servers.has('memory')) {
      return { success: false, error: 'Memory server not available' };
    }
    return await mockMCPClient.storeMemory(`analysis_${analysisId}`, result);
  }, [state.servers]);

  const getStoredAnalysis = useCallback(async (analysisId: string) => {
    if (!state.servers.has('memory')) {
      return { success: false, error: 'Memory server not available' };
    }
    return await mockMCPClient.getMemory(`analysis_${analysisId}`);
  }, [state.servers]);

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
