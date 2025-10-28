'use client';

import { useCallback, useEffect, useState } from 'react';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

type MCPConfigEntry = {
  command: string;
  args: string[];
  env?: Record<string, string | undefined>;
};

type MCPServerInitialization = {
  success: boolean;
  reason?: string;
};

type NormalizedEnv = Record<string, string> | undefined;

function hasEnvConfig(value: MCPConfigEntry): value is MCPConfigEntry & { env: Record<string, string | undefined> } {
  return typeof value.env === 'object' && value.env !== null;
}

const registeredServers = new Map<string, { command: string; args: string[]; env?: NormalizedEnv }>();
const mockMemory = new Map<string, unknown>();

const mockMCPClient = {
  async initializeServer(name: string, command: string, args: string[], env?: NormalizedEnv): Promise<MCPServerInitialization> {
    if (env && Object.values(env).some(value => value.length === 0)) {
      return { success: false, reason: `Missing environment configuration for ${name}` };
    }

    registeredServers.set(name, { command, args, env });
    console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}${env ? ` (env: ${Object.keys(env).join(', ')})` : ''}`);
    return { success: true };
  },
  async searchFinancialData(query: string) {
    return { success: true, data: `Mock analysis for: ${query}` };
  },
  async fetchMarketData(source: string) {
    return { success: true, data: `Mock data from: ${source}` };
  },
  async storeMemory(key: string, value: unknown) {
    mockMemory.set(key, value);
    return { success: true, data: value };
  },
  async getMemory(key: string) {
    return {
      success: mockMemory.has(key),
      data: mockMemory.get(key) ?? null
    };
  },
  async disconnect() {
    registeredServers.clear();
    mockMemory.clear();
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
      const initializationErrors: string[] = [];

      // Bucle con type guards y normalización segura
      for (const [serverName, config] of Object.entries(mcpConfig)) {
        if (hasEnvConfig(config)) {
          // Verificar variables de entorno
          const envValues = Object.values(config.env);
          if (!envValues.length || !envValues.every(v => typeof v === 'string' && v.length > 0)) {
            const reason = `Skipping ${serverName} - missing environment variables`;
            console.warn(reason);
            initializationErrors.push(reason);
            continue;
          }
        }

        // Normalizar env a Record<string, string> o undefined
        const envToPass: NormalizedEnv = hasEnvConfig(config)
          ? Object.fromEntries(
              Object.entries(config.env).filter((entry): entry is [string, string] => {
                const [, value] = entry;
                return typeof value === 'string' && value.length > 0;
              })
            )
          : undefined;

        const { success, reason } = await mockMCPClient.initializeServer(
          serverName,
          config.command,
          config.args,
          envToPass
        );

        if (success) {
          initializedServers.add(serverName);
        } else {
          initializationErrors.push(reason ?? `Failed to initialize ${serverName}`);
        }
      }

      setState(prev => ({
        ...prev,
        isInitialized: initializedServers.size > 0,
        isLoading: false,
        servers: initializedServers,
        error: initializationErrors.length > 0 ? initializationErrors.join('; ') : null
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
    return await mockMCPClient.searchFinancialData(query);
  }, []);

  const fetchMarketData = useCallback(async (source: string) => {
    return await mockMCPClient.fetchMarketData(source);
  }, []);

  // Fix: mockMCPClient.storeMemory expects 1 argument, not 2.
  const storeAnalysisResult = useCallback(async (analysisId: string, result: unknown) => {
    return await mockMCPClient.storeMemory(`analysis_${analysisId}`, result);
  }, []);

  const getStoredAnalysis = useCallback(async (analysisId: string) => {
    return mockMCPClient.getMemory(`analysis_${analysisId}`);
  }, []);

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
