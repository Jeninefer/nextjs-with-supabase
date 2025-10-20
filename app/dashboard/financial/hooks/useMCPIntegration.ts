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

  // Mapping from server ids to display names
  const SERVER_DISPLAY_NAMES: Record<string, string> = {
    'perplexity-ask': 'Perplexity',
    'fetch': 'Fetch',
    'memory': 'Memory'
  };

  // Helper to title-case server ids (splitting on hyphens/underscores)
  function toDisplayName(serverId: string): string {
    if (SERVER_DISPLAY_NAMES[serverId]) return SERVER_DISPLAY_NAMES[serverId];
    return serverId
      .split(/[-_]/)
      .map(token => token.charAt(0).toUpperCase() + token.slice(1))
      .join(' ');
  }

  // Helper to check server availability
  const checkServer = useCallback((serverName: string) => {
    if (!state.servers.has(serverName)) {
      return { success: false, error: `${toDisplayName(serverName)} server not available` };
    }
    return null;
  }, [state.servers]);

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
    return await mockMCPClient.getMemory(`analysis_${analysisId}`);
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
