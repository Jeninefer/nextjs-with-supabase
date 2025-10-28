'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  FinancialDashboardPayload,
  FinancialMetric,
  GrowthPoint,
  Insight,
  ProviderStatus,
  RiskOverview
} from '@/lib/data/financial-intelligence';

interface MCPIntegrationState {
  data: FinancialDashboardPayload | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

const API_ENDPOINT = '/api/financial-intelligence';

export function useMCPIntegration() {
  const [state, setState] = useState<MCPIntegrationState>({
    data: null,
    isInitialized: false,
    isLoading: false,
    error: null,
    servers: new Set<string>()
  });

  const loadDataset = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(API_ENDPOINT, { cache: 'no-store' });

      if (!response.ok) {
        throw new Error(`Failed to load financial intelligence dataset: ${response.status}`);
      }

      const payload: FinancialDashboardPayload & { generatedAt?: string } = await response.json();

      const onlineProviders = new Set(
        (payload.providers ?? [])
          .filter(provider => provider.status === 'online')
          .map(provider => provider.id)
      );

      setState({
        data: payload,
        isInitialized: true,
        isLoading: false,
        error: null,
        servers: onlineProviders
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unable to load intelligence dataset'
      }));
    }
  }, []);

  useEffect(() => {
    void loadDataset();

    const interval = setInterval(() => {
      void loadDataset();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [loadDataset]);

  const getMetric = useCallback(
    (id: string): FinancialMetric | undefined => state.data?.metrics.find(metric => metric.id === id),
    [state.data]
  );

  const growthSeries = useMemo<GrowthPoint[]>(() => state.data?.growth ?? [], [state.data]);

  const getInsight = useCallback(
    (id: string): Insight | undefined => state.data?.insights.find(insight => insight.id === id),
    [state.data]
  );

  const riskProfile = useMemo<RiskOverview | null>(() => state.data?.risk ?? null, [state.data]);

  const providers = useMemo<ProviderStatus[]>(() => state.data?.providers ?? [], [state.data]);

  return {
    ...state,
    refresh: loadDataset,
    metrics: state.data?.metrics ?? [],
    growthSeries,
    insights: state.data?.insights ?? [],
    riskProfile,
    providers,
    getMetric,
    getInsight
  };
}
