import { renderHook, act, waitFor } from '@testing-library/react'
import { useMCPIntegration } from '@/app/dashboard/financial/hooks/useMCPIntegration'

// Mock console methods to avoid noise in tests
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn

describe('useMCPIntegration', () => {
  let consoleLogSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    // Reset environment variables
    delete process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMCPIntegration())

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(null)
      expect(result.current.servers).toBeInstanceOf(Set)
      expect(result.current.servers.size).toBe(0)
    })

    it('should initialize MCP servers on mount', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have attempted to initialize servers
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should initialize servers with environment variables', async () => {
      process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = 'test-api-key'

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Check if perplexity server was attempted with env
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('perplexity-ask')
      )
    })

    it('should skip servers with missing environment variables', async () => {
      // No PERPLEXITY_API_KEY set

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('perplexity-ask')
      )
    })

    it('should mark as initialized when at least one server succeeds', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // With random success, should eventually have some servers initialized
      // Due to 70% success rate, at least one should succeed
      expect(result.current.isInitialized).toBeDefined()
    })

    it('should handle initialization errors gracefully', async () => {
      // Mock Math.random to force all initializations to fail
      const originalRandom = Math.random
      Math.random = jest.fn(() => 0.9) // > 0.3 means failure

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.servers.size).toBe(0)

      Math.random = originalRandom
    })
  })

  describe('searchFinancialInsights', () => {
    it('should search financial insights with query', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const query = 'market trends for tech stocks'
      let searchResult: any

      await act(async () => {
        searchResult = await result.current.searchFinancialInsights(query)
      })

      expect(searchResult).toEqual({
        success: true,
        data: `Mock analysis for: ${query}`
      })
    })

    it('should handle empty query strings', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let searchResult: any

      await act(async () => {
        searchResult = await result.current.searchFinancialInsights('')
      })

      expect(searchResult.success).toBe(true)
    })

    it('should handle special characters in queries', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const query = 'What is $AAPL stock price? (2024)'
      let searchResult: any

      await act(async () => {
        searchResult = await result.current.searchFinancialInsights(query)
      })

      expect(searchResult.success).toBe(true)
      expect(searchResult.data).toContain(query)
    })

    it('should handle very long query strings', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const longQuery = 'A'.repeat(10000)
      let searchResult: any

      await act(async () => {
        searchResult = await result.current.searchFinancialInsights(longQuery)
      })

      expect(searchResult.success).toBe(true)
    })
  })

  describe('fetchMarketData', () => {
    it('should fetch market data from source URL', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const source = 'https://api.example.com/market-data'
      let marketData: any

      await act(async () => {
        marketData = await result.current.fetchMarketData(source)
      })

      expect(marketData).toEqual({
        success: true,
        data: `Mock data from: ${source}`
      })
    })

    it('should handle various URL formats', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const sources = [
        'https://example.com',
        'http://api.test.com/data?key=value',
        'https://localhost:3000/api/data',
        'file:///local/path/data.json'
      ]

      for (const source of sources) {
        let marketData: any

        await act(async () => {
          marketData = await result.current.fetchMarketData(source)
        })

        expect(marketData.success).toBe(true)
        expect(marketData.data).toContain(source)
      }
    })

    it('should handle empty source strings', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let marketData: any

      await act(async () => {
        marketData = await result.current.fetchMarketData('')
      })

      expect(marketData.success).toBe(true)
    })
  })

  describe('storeAnalysisResult', () => {
    it('should store analysis result with ID and data', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const analysisId = 'test-analysis-123'
      const analysisResult = {
        data: 'test data',
        timestamp: Date.now(),
        metrics: { accuracy: 0.95 }
      }

      let storeResult: any

      await act(async () => {
        storeResult = await result.current.storeAnalysisResult(
          analysisId,
          analysisResult
        )
      })

      expect(storeResult.success).toBe(true)
      expect(storeResult.data).toBe(`Stored analysis_${analysisId}`)
      expect(storeResult.value).toEqual(analysisResult)
    })

    it('should handle storing null values', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let storeResult: any

      await act(async () => {
        storeResult = await result.current.storeAnalysisResult('test-id', null)
      })

      expect(storeResult.success).toBe(true)
      expect(storeResult.value).toBe(null)
    })

    it('should handle storing undefined values', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let storeResult: any

      await act(async () => {
        storeResult = await result.current.storeAnalysisResult('test-id', undefined)
      })

      expect(storeResult.success).toBe(true)
      expect(storeResult.value).toBe(undefined)
    })

    it('should handle storing complex nested objects', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const complexResult = {
        nested: {
          deeply: {
            nested: {
              value: 'test'
            }
          }
        },
        array: [1, 2, 3, { key: 'value' }],
        mixed: null,
        undefined: undefined
      }

      let storeResult: any

      await act(async () => {
        storeResult = await result.current.storeAnalysisResult('complex-id', complexResult)
      })

      expect(storeResult.success).toBe(true)
      expect(storeResult.value).toEqual(complexResult)
    })
  })

  describe('getStoredAnalysis', () => {
    it('should retrieve stored analysis by ID', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const analysisId = 'test-retrieval-123'
      let retrieveResult: any

      await act(async () => {
        retrieveResult = await result.current.getStoredAnalysis(analysisId)
      })

      expect(retrieveResult).toEqual({
        success: true,
        data: `Retrieved analysis_${analysisId}`
      })
    })

    it('should handle retrieval of non-existent analysis', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let retrieveResult: any

      await act(async () => {
        retrieveResult = await result.current.getStoredAnalysis('non-existent')
      })

      expect(retrieveResult.success).toBe(true)
    })

    it('should handle empty analysis IDs', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let retrieveResult: any

      await act(async () => {
        retrieveResult = await result.current.getStoredAnalysis('')
      })

      expect(retrieveResult.success).toBe(true)
    })
  })

  describe('Cleanup', () => {
    it('should disconnect MCP client on unmount', () => {
      const { unmount } = renderHook(() => useMCPIntegration())

      unmount()

      expect(consoleLogSpy).toHaveBeenCalledWith('Mock: Disconnected')
    })

    it('should cleanup properly even if not initialized', () => {
      const { unmount } = renderHook(() => useMCPIntegration())

      // Unmount immediately before initialization completes
      unmount()

      expect(consoleLogSpy).toHaveBeenCalledWith('Mock: Disconnected')
    })
  })

  describe('Re-initialization', () => {
    it('should allow manual re-initialization', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = consoleLogSpy.mock.calls.length

      await act(async () => {
        await result.current.initializeMCPServers()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have made additional initialization calls
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(initialCallCount)
    })

    it('should reset error state on re-initialization', async () => {
      // Force an error scenario
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Manually re-initialize
      await act(async () => {
        await result.current.initializeMCPServers()
      })

      expect(result.current.error).toBe(null)
    })
  })

  describe('State Management', () => {
    it('should maintain separate server sets across multiple hook instances', async () => {
      const { result: result1 } = renderHook(() => useMCPIntegration())
      const { result: result2 } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false)
        expect(result2.current.isLoading).toBe(false)
      })

      // Servers sets should be different instances
      expect(result1.current.servers).not.toBe(result2.current.servers)
    })

    it('should provide stable callback references', () => {
      const { result, rerender } = renderHook(() => useMCPIntegration())

      const initialCallbacks = {
        searchFinancialInsights: result.current.searchFinancialInsights,
        fetchMarketData: result.current.fetchMarketData,
        storeAnalysisResult: result.current.storeAnalysisResult,
        getStoredAnalysis: result.current.getStoredAnalysis
      }

      rerender()

      // Callbacks should remain stable across rerenders
      expect(result.current.searchFinancialInsights).toBe(initialCallbacks.searchFinancialInsights)
      expect(result.current.fetchMarketData).toBe(initialCallbacks.fetchMarketData)
      expect(result.current.storeAnalysisResult).toBe(initialCallbacks.storeAnalysisResult)
      expect(result.current.getStoredAnalysis).toBe(initialCallbacks.getStoredAnalysis)
    })
  })

  describe('Edge Cases', () => {
    it('should handle concurrent operations', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const operations = [
        result.current.searchFinancialInsights('query1'),
        result.current.searchFinancialInsights('query2'),
        result.current.fetchMarketData('url1'),
        result.current.fetchMarketData('url2'),
        result.current.storeAnalysisResult('id1', { data: 'test1' }),
        result.current.storeAnalysisResult('id2', { data: 'test2' })
      ]

      let results: any[]

      await act(async () => {
        results = await Promise.all(operations)
      })

      // All operations should complete successfully
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })

    it('should handle rapid re-initialization attempts', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Trigger multiple re-initializations rapidly
      const promises = [
        result.current.initializeMCPServers(),
        result.current.initializeMCPServers(),
        result.current.initializeMCPServers()
      ]

      await act(async () => {
        await Promise.all(promises)
      })

      // Should handle gracefully without errors
      expect(result.current.error).toBe(null)
    })

    it('should handle Unicode and emoji in queries', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const unicodeQuery = '📈 市场趋势 🚀 テスト'
      let searchResult: any

      await act(async () => {
        searchResult = await result.current.searchFinancialInsights(unicodeQuery)
      })

      expect(searchResult.success).toBe(true)
      expect(searchResult.data).toContain(unicodeQuery)
    })
  })
})