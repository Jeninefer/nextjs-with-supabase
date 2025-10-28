import { renderHook, waitFor } from '@testing-library/react';
import { useMCPIntegration } from '@/app/dashboard/financial/hooks/useMCPIntegration';
import { financialIntelligence } from '@/lib/data/financial-intelligence';

// Mock fetch
global.fetch = jest.fn();

describe('useMCPIntegration Hook', () => {
  const mockFetchSuccess = () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => financialIntelligence,
      text: async () => '',
    });
  };

  const mockFetchError = (errorMessage = 'Network error') => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: errorMessage,
      text: async () => errorMessage,
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Initial State and Loading', () => {
    test('starts with loading state', () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.dataset).toBeNull();
    });

    test('loads dataset on mount', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.dataset).toEqual(financialIntelligence);
      expect(result.current.error).toBeNull();
    });

    test('fetches from correct endpoint', async () => {
      mockFetchSuccess();
      renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/financial/intelligence', { cache: 'no-store' });
      });
    });
  });

  describe('Error Handling', () => {
    test('handles fetch errors gracefully', async () => {
      mockFetchError('Server error');
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(false);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toContain('Failed to load intelligence dataset');
      expect(result.current.dataset).toBeNull();
    });

    test('handles network failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network failure'));
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Servers State', () => {
    test('populates servers from data sources', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.servers.size).toBeGreaterThan(0);
      financialIntelligence.dataSources.forEach(source => {
        expect(result.current.servers.has(`datasource:${source}`)).toBe(true);
      });
    });
  });

  describe('searchFinancialInsights', () => {
    test('returns insights matching query', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const searchResult = await result.current.searchFinancialInsights('credit');
      
      expect(searchResult.success).toBe(true);
      expect(searchResult.data.length).toBeGreaterThan(0);
      expect(searchResult.message).toBeUndefined();
    });

    test('returns first 5 insights when query is empty', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const searchResult = await result.current.searchFinancialInsights('');
      
      expect(searchResult.success).toBe(true);
      expect(searchResult.data.length).toBeLessThanOrEqual(5);
    });

    test('handles query not matching any insights', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const searchResult = await result.current.searchFinancialInsights('nonexistent-keyword-xyz123');
      
      expect(searchResult.success).toBe(true);
      expect(searchResult.data.length).toBe(0);
      expect(searchResult.message).toBeTruthy();
    });

    test('returns error when dataset not loaded', async () => {
      mockFetchError();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      const searchResult = await result.current.searchFinancialInsights('query');
      
      expect(searchResult.success).toBe(false);
      expect(searchResult.data.length).toBe(0);
      expect(searchResult.message).toBe('Dataset not loaded yet');
    });

    test('searches are case-insensitive', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const result1 = await result.current.searchFinancialInsights('CREDIT');
      const result2 = await result.current.searchFinancialInsights('credit');
      
      expect(result1.data.length).toBe(result2.data.length);
    });

    test('limits results to 10 insights', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const searchResult = await result.current.searchFinancialInsights('a');
      
      expect(searchResult.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('fetchMarketData', () => {
    test('returns market indicators matching identifier', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const marketResult = await result.current.fetchMarketData('prime-rate');
      
      expect(marketResult.success).toBe(true);
      expect(marketResult.data.length).toBeGreaterThan(0);
    });

    test('matches by name substring', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const marketResult = await result.current.fetchMarketData('prime');
      
      expect(marketResult.success).toBe(true);
      expect(marketResult.data.length).toBeGreaterThan(0);
    });

    test('returns error when no match found', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const marketResult = await result.current.fetchMarketData('nonexistent-indicator');
      
      expect(marketResult.success).toBe(false);
      expect(marketResult.data.length).toBe(0);
      expect(marketResult.message).toBeTruthy();
    });

    test('returns error when dataset not loaded', async () => {
      mockFetchError();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      const marketResult = await result.current.fetchMarketData('prime');
      
      expect(marketResult.success).toBe(false);
      expect(marketResult.message).toBe('Dataset not loaded yet');
    });
  });

  describe('storeAnalysisResult', () => {
    test('stores analysis result in localStorage', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const analysisData = { metric: 'test', value: 123 };
      const storeResult = await result.current.storeAnalysisResult('test-id', analysisData);
      
      expect(storeResult.success).toBe(true);
      expect(storeResult.data?.savedAt).toBeTruthy();
      
      const stored = localStorage.getItem('abaco:financial-intelligence:test-id');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.result).toEqual(analysisData);
    });

    test('includes timestamp when storing', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const beforeTime = new Date().toISOString();
      const storeResult = await result.current.storeAnalysisResult('test-id', { test: true });
      const afterTime = new Date().toISOString();
      
      expect(storeResult.data?.savedAt).toBeTruthy();
      expect(storeResult.data!.savedAt >= beforeTime).toBe(true);
      expect(storeResult.data!.savedAt <= afterTime).toBe(true);
    });
  });

  describe('getStoredAnalysis', () => {
    test('retrieves stored analysis from localStorage', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const analysisData = { metric: 'test', value: 456 };
      await result.current.storeAnalysisResult('retrieve-test', analysisData);
      
      const retrieveResult = await result.current.getStoredAnalysis('retrieve-test');
      
      expect(retrieveResult.success).toBe(true);
      expect(retrieveResult.data?.result).toEqual(analysisData);
      expect(retrieveResult.data?.savedAt).toBeTruthy();
    });

    test('returns error when analysis not found', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const retrieveResult = await result.current.getStoredAnalysis('nonexistent-id');
      
      expect(retrieveResult.success).toBe(false);
      expect(retrieveResult.message).toContain('No cached analysis found');
    });

    test('handles corrupted data gracefully', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      localStorage.setItem('abaco:financial-intelligence:corrupted', 'not-valid-json{');
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const retrieveResult = await result.current.getStoredAnalysis('corrupted');
      
      expect(retrieveResult.success).toBe(false);
      expect(retrieveResult.message).toContain('corrupted');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('initializeMCPServers', () => {
    test('reinitializes and reloads dataset', async () => {
      mockFetchSuccess();
      const { result } = renderHook(() => useMCPIntegration());
      
      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const callCount = (global.fetch as jest.Mock).mock.calls.length;
      
      await result.current.initializeMCPServers();
      
      expect(global.fetch).toHaveBeenCalledTimes(callCount + 1);
    });
  });
});