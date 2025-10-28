'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  FinancialInsightResult,
  FinancialIntelligenceDataset,
  MarketIndicator,
} from '@/lib/data/financial-intelligence';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
  dataset: FinancialIntelligenceDataset | null;
}

const STORAGE_PREFIX = 'abaco:financial-intelligence';
const DATA_ENDPOINT = '/api/financial/intelligence';

type InsightSearchResult = {
  success: boolean;
  data: FinancialInsightResult[];
  message?: string;
};

type MarketDataResult = {
  success: boolean;
  data: MarketIndicator[];
  message?: string;
};

type StorageResult<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

async function fetchDataset(): Promise<FinancialIntelligenceDataset> {
  const response = await fetch(DATA_ENDPOINT, { cache: 'no-store' });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to load intelligence dataset: ${errorText || response.statusText}`);
  }

  return (await response.json()) as FinancialIntelligenceDataset;
}

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    servers: new Set(),
    dataset: null,
  });

  const loadDataset = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const dataset = await fetchDataset();
      const servers = new Set(dataset.dataSources.map((source) => `datasource:${source}`));
      setState({ isInitialized: true, isLoading: false, error: null, servers, dataset });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isInitialized: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load financial intelligence dataset',
      }));
    }
  }, []);

  useEffect(() => {
    void loadDataset();
  }, [loadDataset]);

  const initializeMCPServers = useCallback(async () => {
    await loadDataset();
  }, [loadDataset]);

  const normalizedInsights = useMemo(() => {
    if (!state.dataset) {
      return [] as { insight: FinancialInsightResult; searchable: string }[];
    }

    return state.dataset.insights.map((insight) => ({
      insight,
      searchable: `${insight.title} ${insight.summary} ${insight.tags.join(' ')}`.toLowerCase(),
    }));
  }, [state.dataset]);

  const searchFinancialInsights = useCallback(
    async (query: string): Promise<InsightSearchResult> => {
      if (!state.dataset) {
        return { success: false, data: [], message: 'Dataset not loaded yet' };
      }

      const normalizedQuery = query.trim().toLowerCase();
      if (!normalizedQuery) {
        return { success: true, data: state.dataset.insights.slice(0, 5) };
      }

      const matches = normalizedInsights
        .filter((entry) => entry.searchable.includes(normalizedQuery))
        .map((entry) => entry.insight)
        .slice(0, 10);

      return {
        success: true,
        data: matches,
        message: matches.length ? undefined : 'No insights match your query. Try another keyword.',
      };
    },
    [normalizedInsights, state.dataset]
  );

  const fetchMarketData = useCallback(
    async (identifier: string): Promise<MarketDataResult> => {
      if (!state.dataset) {
        return { success: false, data: [], message: 'Dataset not loaded yet' };
      }

      const normalized = identifier.trim().toLowerCase();
      const matches = state.dataset.marketIndicators.filter((indicator) => {
        return (
          indicator.id.toLowerCase() === normalized ||
          indicator.name.toLowerCase().includes(normalized) ||
          indicator.source.toLowerCase().includes(normalized)
        );
      });

      return {
        success: matches.length > 0,
        data: matches,
        message: matches.length ? undefined : 'No market indicators matched the identifier provided.',
      };
    },
    [state.dataset]
  );

  const storeAnalysisResult = useCallback(
    async (analysisId: string, result: unknown): Promise<StorageResult<{ savedAt: string }>> => {
      if (typeof window === 'undefined') {
        return { success: false, message: 'Storage is not available in this environment.' };
      }

      const savedAt = new Date().toISOString();
      const payload = { savedAt, result };
      window.localStorage.setItem(`${STORAGE_PREFIX}:${analysisId}`, JSON.stringify(payload));
      return { success: true, data: { savedAt } };
    },
    []
  );

  const getStoredAnalysis = useCallback(
    async (analysisId: string): Promise<StorageResult<{ savedAt: string; result: unknown }>> => {
      if (typeof window === 'undefined') {
        return { success: false, message: 'Storage is not available in this environment.' };
      }

      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:${analysisId}`);
      if (!raw) {
        return { success: false, message: 'No cached analysis found for the provided identifier.' };
      }

      try {
        return { success: true, data: JSON.parse(raw) };
      } catch (error) {
        console.error('Failed to parse cached analysis', error);
        return { success: false, message: 'Stored analysis data is corrupted.' };
      }
    },
    []
  );

  return {
    ...state,
    initializeMCPServers,
    searchFinancialInsights,
    fetchMarketData,
    storeAnalysisResult,
    getStoredAnalysis,
  };
}
