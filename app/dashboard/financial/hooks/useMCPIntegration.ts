'use client';

import { useState, useEffect, useCallback } from 'react';
import { abacoMCP, MCPResponse } from '@/lib/mcp-client';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

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
      const mcpConfig = {
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

      for (const [serverName, config] of Object.entries(mcpConfig)) {
        if (config.env && !Object.values(config.env).every(Boolean)) {
          console.warn(`Skipping ${serverName} - missing environment variables`);
          continue;
        }

        const success = await abacoMCP.initializeServer(
          serverName,
          config.command,
          config.args,
          config.env
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

  const searchFinancialInsights = useCallback(async (query: string): Promise<MCPResponse> => {
    if (!state.servers.has('perplexity-ask')) {
      return { success: false, error: 'Perplexity server not available' };
    }

    const enhancedQuery = `
      Financial Analysis Query: ${query}
      
      Context: ABACO Financial Intelligence Platform
      Focus: Lending portfolio analytics, risk assessment, growth projections
      
      Please provide insights on:
      - Market trends
      - Risk factors
      - Growth opportunities
      - Regulatory considerations
      
      Format response for financial dashboard integration.
    `;

    return await abacoMCP.searchFinancialData(enhancedQuery);
  }, [state.servers]);

  const fetchMarketData = useCallback(async (source: string): Promise<MCPResponse> => {
    if (!state.servers.has('fetch')) {
      return { success: false, error: 'Fetch server not available' };
    }

    return await abacoMCP.fetchMarketData(source);
  }, [state.servers]);

  const storeAnalysisResult = useCallback(async (analysisId: string, result: any): Promise<MCPResponse> => {
    if (!state.servers.has('memory')) {
      return { success: false, error: 'Memory server not available' };
    }

    return await abacoMCP.storeMemory(`analysis_${analysisId}`, {
      timestamp: new Date().toISOString(),
      result,
      platform: 'ABACO'
    });
  }, [state.servers]);

  const getStoredAnalysis = useCallback(async (analysisId: string): Promise<MCPResponse> => {
    if (!state.servers.has('memory')) {
      return { success: false, error: 'Memory server not available' };
    }

    return await abacoMCP.getMemory(`analysis_${analysisId}`);
  }, [state.servers]);

  useEffect(() => {
    initializeMCPServers();

    return () => {
      abacoMCP.disconnect();
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
