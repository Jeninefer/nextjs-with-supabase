'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEnabledMCPServers } from '@/lib/mcp-config';

interface MCPIntegrationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  servers: Set<string>;
}

// Mock MCP client para evitar dependencias externas por ahora
const mockMCPClient = {
  initializeServer: async (name: string, command: string, args: string[], env?: Record<string, string>) => {
    try {
      console.log(`Mock: Initializing ${name} with ${command} ${args.join(' ')}`);
      
      // Simulate potential Google Cloud API errors for testing resilience
      // In production, real MCP servers might encounter these errors
      const enableErrorSimulation = process.env.NEXT_PUBLIC_ENABLE_MCP_ERROR_SIMULATION === 'true';
      let simulateError = false;
      if (enableErrorSimulation) {
        simulateError = Math.random() > 0.8;
      }
      
      if (simulateError) {
        // Simulate Google Cloud API errors that should be handled gracefully
        const errorMessages = [
          'Cloud Dataproc API has not been used',
          'API not enabled',
          'Insufficient permissions',
          'Network timeout'
        ];
        const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
        console.warn(`Mock: Simulated error for ${name}: ${randomError}`);
        return false;
      }
      
      return true; // Simulate success in all cases unless error simulation is enabled (then 80% success)
    } catch (error) {
      console.error(`Mock: Error initializing ${name}:`, error);
      return false;
    }
  },
  searchFinancialData: async (query: string) => {
    try {
      return { success: true, data: `Mock analysis for: ${query}` };
    } catch (error) {
      return { success: false, error: 'Service unavailable' };
    }
  },
  fetchMarketData: async (url: string) => {
    try {
      return { success: true, data: `Mock data from: ${url}` };
    } catch (error) {
      return { success: false, error: 'Service unavailable' };
    }
  },
  storeMemory: async (key: string, value: any) => {
    try {
      return { success: true, data: `Stored ${key}` };
    } catch (error) {
      return { success: false, error: 'Service unavailable' };
    }
  },
  getMemory: async (key: string) => {
    try {
      return { success: true, data: `Retrieved ${key}` };
    } catch (error) {
      return { success: false, error: 'Service unavailable' };
    }
  },
  disconnect: async () => {
    try {
      console.log('Mock: Disconnected');
    } catch (error) {
      console.error('Mock: Error during disconnect:', error);
    }
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
      // Get only enabled MCP servers from configuration
      const enabledServers = getEnabledMCPServers();
      
      if (enabledServers.length === 0) {
        console.log('No MCP servers enabled. Configure credentials in environment variables to enable servers.');
        setState(prev => ({
          ...prev,
          isInitialized: false,
          isLoading: false,
          servers: new Set()
        }));
        return;
      }

      const initializedServers = new Set<string>();

      // Initialize only enabled servers
      for (const { name: serverName, config } of enabledServers) {
        try {
          // Normalizar env a Record<string, string> o undefined
          const envToPass: Record<string, string> | undefined = config.env
            ? Object.fromEntries(
                Object.entries(config.env)
                  .filter(([_, v]) => v !== undefined)
                  .map(([k, v]) => [k, v as string])
              )
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
            console.log(`✅ Initialized MCP server: ${serverName}`);
          } else {
            console.warn(`⚠️ Failed to initialize MCP server: ${serverName}`);
          }
        } catch (serverError) {
          // Log individual server initialization failures but continue with others
          const errorMessage = serverError instanceof Error ? serverError.message : 'Unknown error';
          console.warn(`Failed to initialize ${serverName}: ${errorMessage}`);
          
          // Check if this is a Google Cloud API error
          if (errorMessage.includes('Dataproc') || errorMessage.includes('googleapis.com')) {
            console.info(
              `💡 Tip: ${serverName} requires Google Cloud API access. ` +
              'If you don\'t need this server, it will be automatically skipped. ' +
              'To enable it, ensure your Google Cloud project has the required APIs enabled.'
            );
          }
          // Continue with next server instead of failing completely
        }
      }

      setState(prev => ({
        ...prev,
        isInitialized: initializedServers.size > 0,
        isLoading: false,
        servers: initializedServers
      }));

      if (initializedServers.size > 0) {
        console.log(`✅ Successfully initialized ${initializedServers.size} MCP server(s):`, Array.from(initializedServers).join(', '));
      } else {
        console.log('⚠️ No MCP servers could be initialized. The application will work with limited features.');
      }

    } catch (error) {
      // Handle catastrophic failures gracefully
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize MCP servers';
      console.error('MCP initialization error:', errorMessage);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
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
