'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  FinancialDashboardPayload,
  FinancialMetric,
  Insight,
  ProviderStatus,
  RiskOverview,
} from '@/lib/data/financial-intelligence';
import type { FinancialIntelligenceResponse } from '@/app/api/financial-intelligence/route';

interface IntegrationSummary {
  updatedAt: string | null;
  refreshIntervalMinutes: number;
  metadata?: FinancialIntelligenceResponse['metadata'];
}

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  dataset: FinancialDashboardPayload | null;
  summary: IntegrationSummary;
  servers: Set<string>;
}

interface MCPServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string | undefined>;
}

type StoredAnalysis<T = unknown> = {
  savedAt: string;
  value: T;
};

type InsightSearchResult = {
  success: boolean;
  matches: Insight[];
  total: number;
};

type MarketDataResult = {
  success: boolean;
  metric: FinancialMetric | null;
  growth: FinancialDashboardPayload['growth'];
};

const MCP_CONFIG: Record<string, MCPServerConfig> = {
  'perplexity-ask': {
    command: 'npx',
    args: ['-y', 'server-perplexity-ask'],
    env: {
      PERPLEXITY_API_KEY: process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY,
    },
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

const STORAGE_PREFIX = 'abaco-financial-analysis:';
const DATA_ENDPOINT = '/api/financial-intelligence';

const mockMCPClient = {
  async initializeServer(
    name: string,
    command: string,
    args: string[],
    env?: Record<string, string>,
  ): Promise<boolean> {
    console.info('[MCP] Initialising', name, command, args.join(' '), env ?? {});
    await new Promise((resolve) => setTimeout(resolve, 25));
    return true;
  },
  async searchFinancialData(
    dataset: FinancialDashboardPayload,
    query: string,
  ): Promise<InsightSearchResult> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return { success: true, matches: dataset.insights, total: dataset.insights.length };
    }

    const matches = dataset.insights.filter((insight) => {
      const haystack = [
        insight.title,
        insight.summary,
        insight.impact,
        insight.action,
        ...insight.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalized);
    });

    return { success: true, matches, total: dataset.insights.length };
  },
  async fetchMarketData(
    dataset: FinancialDashboardPayload,
    identifier: string,
  ): Promise<MarketDataResult> {
    const metric = dataset.metrics.find(
      (item) => item.id === identifier || item.label.toLowerCase() === identifier.toLowerCase(),
    );

    return {
      success: Boolean(metric),
      metric: metric ?? null,
      growth: dataset.growth,
    };
  },
  async storeMemory<T>(key: string, value: T): Promise<StoredAnalysis<T>> {
    const payload: StoredAnalysis<T> = {
      savedAt: new Date().toISOString(),
      value,
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(payload));
    }

    return payload;
  },
  async getMemory<T>(key: string): Promise<StoredAnalysis<T> | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as StoredAnalysis<T>;
    } catch (error) {
      console.warn('[MCP] Failed to parse stored analysis', error);
      return null;
    }
  },
  async disconnect(): Promise<void> {
    console.info('[MCP] Disconnected');
  },
};

interface ApiPayload extends FinancialDashboardPayload, FinancialIntelligenceResponse {}

async function fetchDataset(signal?: AbortSignal): Promise<ApiPayload> {
  const response = await fetch(DATA_ENDPOINT, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to load financial intelligence dataset (status ${response.status})`);
  }

  const payload = (await response.json()) as ApiPayload;
  return payload;
}

function sanitizeEnv(env?: Record<string, string | undefined>): Record<string, string> | undefined {
  if (!env) {
    return undefined;
  }

  const entries = Object.entries(env)
    .map(([key, value]) => [key, value?.trim()] as const)
    .filter(([, value]) => Boolean(value)) as Array<[string, string]>;

  if (!entries.length) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

const EMPTY_SUMMARY: IntegrationSummary = {
  updatedAt: null,
  refreshIntervalMinutes: 5,
};

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    dataset: null,
    summary: EMPTY_SUMMARY,
    servers: new Set(),
  });
  const datasetRef = useRef<FinancialDashboardPayload | null>(null);

  const initialise = useCallback(async () => {
    setState((previous) => ({ ...previous, isLoading: true, error: null }));

    try {
      const datasetWithMetadata = await fetchDataset();
      const dataset: FinancialDashboardPayload = {
        metrics: datasetWithMetadata.metrics,
        growth: datasetWithMetadata.growth,
        risk: datasetWithMetadata.risk,
        insights: datasetWithMetadata.insights,
        providers: datasetWithMetadata.providers,
        generatedAt: datasetWithMetadata.generatedAt,
      };

      datasetRef.current = dataset;

      const servers = new Set<string>();

      for (const [name, config] of Object.entries(MCP_CONFIG)) {
        const env = sanitizeEnv(config.env);
        if (config.env && !env) {
          console.warn(`[MCP] Skipping ${name} initialisation - missing environment variables.`);
          continue;
        }

        const initialised = await mockMCPClient.initializeServer(name, config.command, config.args, env);
        if (initialised) {
          servers.add(name);
        }
      }

      setState({
        isInitialized: true,
        isLoading: false,
        error: null,
        dataset,
        summary: {
          updatedAt: datasetWithMetadata.generatedAt ?? null,
          refreshIntervalMinutes: EMPTY_SUMMARY.refreshIntervalMinutes,
          metadata: datasetWithMetadata.metadata,
        },
        servers,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to initialise MCP integration';
      setState((previous) => ({ ...previous, isLoading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    initialise();
    return () => {
      void mockMCPClient.disconnect();
    };
  }, [initialise]);

  const searchFinancialInsights = useCallback(
    async (query: string) => {
      const dataset = datasetRef.current;
      if (!dataset) {
        return { success: false, matches: [], total: 0 } satisfies InsightSearchResult;
      }

      return mockMCPClient.searchFinancialData(dataset, query);
    },
    [],
  );

  const fetchMarketData = useCallback(
    async (identifier: string) => {
      const dataset = datasetRef.current;
      if (!dataset) {
        return { success: false, metric: null, growth: [] } satisfies MarketDataResult;
      }

      return mockMCPClient.fetchMarketData(dataset, identifier);
    },
    [],
  );

  const storeAnalysisResult = useCallback(async (analysisId: string, value: unknown) => {
    const key = `${STORAGE_PREFIX}${analysisId}`;
    return mockMCPClient.storeMemory(key, value);
  }, []);

  const getStoredAnalysis = useCallback(async (analysisId: string) => {
    const key = `${STORAGE_PREFIX}${analysisId}`;
    return mockMCPClient.getMemory(key);
  }, []);

  const metrics = useMemo(() => state.dataset?.metrics ?? [], [state.dataset]);
  const insights = useMemo(() => state.dataset?.insights ?? [], [state.dataset]);
  const growthSeries = useMemo(() => state.dataset?.growth ?? [], [state.dataset]);
  const riskProfile = useMemo<RiskOverview | null>(
    () => state.dataset?.risk ?? null,
    [state.dataset],
  );
  const providers = useMemo<ProviderStatus[]>(
    () => state.dataset?.providers ?? [],
    [state.dataset],
  );

  return {
    ...state,
    metrics,
    insights,
    growthSeries,
    riskProfile,
    providers,
    refresh: initialise,
    searchFinancialInsights,
    fetchMarketData,
    storeAnalysisResult,
    getStoredAnalysis,
  };
}
