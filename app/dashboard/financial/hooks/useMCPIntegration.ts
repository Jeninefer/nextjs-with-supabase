'use client';

import { useCallback, useEffect, useState } from 'react';

import { getFinancialIntelligenceSnapshot } from '@/lib/data/financial-intelligence';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

type MCPConfigEntry =
  | { command: string; args: string[]; env?: Record<string, string | undefined> }
  | { command: string; args: string[] };

function hasEnvConfig(entry: MCPConfigEntry): entry is { command: string; args: string[]; env: Record<string, string | undefined> } {
  return 'env' in entry;
}

const memoryStore = new Map<string, unknown>();

const DEFAULT_SERVERS: Record<string, MCPConfigEntry> = {
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

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set(),
  });

  const initializeMCPServers = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const initializedServers = new Set<string>();

      for (const [serverName, config] of Object.entries(DEFAULT_SERVERS)) {
        if (hasEnvConfig(config)) {
          const envValues = Object.values(config.env ?? {});
          if (envValues.some(value => !value)) {
            console.warn(`Skipping ${serverName} - missing environment variables`);
            continue;
          }
        }

        initializedServers.add(serverName);
      }

      setState({
        isInitialized: initializedServers.size > 0,
        isLoading: false,
        error: null,
        servers: initializedServers,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize MCP servers',
      }));
    }
  }, []);

  const searchFinancialInsights = useCallback(async (query: string) => {
    const snapshot = getFinancialIntelligenceSnapshot();
    const trimmedQuery = query.trim().toLowerCase();

    const results = snapshot.insights.filter(insight => {
      if (!trimmedQuery) {
        return true;
      }
      const haystack = `${insight.title} ${insight.summary} ${insight.tags.join(' ')}`.toLowerCase();
      return haystack.includes(trimmedQuery);
    });

    return { success: true, data: results } as const;
  }, []);

  const fetchMarketData = useCallback(async (source: string) => {
    const snapshot = getFinancialIntelligenceSnapshot();

    switch (source) {
      case 'metrics':
        return { success: true, data: snapshot.metrics } as const;
      case 'growth':
        return { success: true, data: snapshot.growth } as const;
      case 'risk':
        return { success: true, data: snapshot.risk } as const;
      default:
        return { success: true, data: snapshot } as const;
    }
  }, []);

  const storeAnalysisResult = useCallback(async (analysisId: string, result: unknown) => {
    const key = `analysis_${analysisId}`;
    memoryStore.set(key, {
      storedAt: new Date().toISOString(),
      payload: result,
    });
    return { success: true } as const;
  }, []);

  const getStoredAnalysis = useCallback(async (analysisId: string) => {
    const key = `analysis_${analysisId}`;
    return { success: true, data: memoryStore.get(key) ?? null } as const;
  }, []);

  useEffect(() => {
    initializeMCPServers();

    return () => {
      memoryStore.clear();
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
