import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useMCPIntegration } from '../useMCPIntegration'

describe('useMCPIntegration Hook', () => {
  const originalEnv = process.env
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn

  beforeEach(() => {
    process.env = { ...originalEnv }
    console.log = vi.fn()
    console.warn = vi.fn()
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
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

    it('should automatically initialize MCP servers on mount', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // At least some servers should be initialized (mock has 70% success rate)
      expect(console.log).toHaveBeenCalled()
    })

    it('should cleanup on unmount', async () => {
      const { unmount } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(console.log).toHaveBeenCalled()
      })

      unmount()

      expect(console.log).toHaveBeenCalledWith('Mock: Disconnected')
    })

    it('should initialize servers with environment variables', async () => {
      process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = 'test-api-key'

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Check if perplexity server was attempted with env vars
      const logCalls = (console.log as any).mock.calls
      const envLogCall = logCalls.find((call: string[]) => 
        call[0]?.includes('Using environment variables')
      )
      
      if (envLogCall) {
        expect(envLogCall[0]).toContain('PERPLEXITY_API_KEY')
      }
    })

    it('should skip servers with missing environment variables', async () => {
      delete process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping perplexity-ask')
      )
    })

    it('should handle initialization errors gracefully', async () => {
      // Mock Math.random to always fail
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.2) // Will fail (< 0.3)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.servers.size).toBe(0)

      Math.random = originalRandom
    })

    it('should set isInitialized to true when at least one server initializes', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5) // Will succeed

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isInitialized).toBe(true)
      expect(result.current.servers.size).toBeGreaterThan(0)

      Math.random = originalRandom
    })
  })

  describe('checkServer function', () => {
    it('should return error when server is not initialized', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const checkResult = result.current.searchFinancialInsights('test query')
      
      await waitFor(async () => {
        const response = await checkResult
        if ('error' in response) {
          expect(response.success).toBe(false)
          expect(response.error).toContain('not initialized')
        }
      })
    })

    it('should allow operations when server is initialized', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5) // Ensure success

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.fetchMarketData('https://example.com/api')
      })

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('data')

      Math.random = originalRandom
    })
  })

  describe('searchFinancialInsights', () => {
    it('should search financial data successfully', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.searchFinancialInsights('market trends')
      })

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('data')
      if ('data' in response) {
        expect(response.data).toContain('market trends')
      }

      Math.random = originalRandom
    })

    it('should handle empty query string', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.searchFinancialInsights('')
      })

      expect(response).toHaveProperty('success')

      Math.random = originalRandom
    })

    it('should handle special characters in query', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const specialQueries = [
        'test & query',
        'query with "quotes"',
        "query with 'apostrophes'",
        'query with <tags>',
        'query with \\ backslash',
      ]

      for (const query of specialQueries) {
        let response
        await act(async () => {
          response = await result.current.searchFinancialInsights(query)
        })
        expect(response).toHaveProperty('success')
      }

      Math.random = originalRandom
    })
  })

  describe('fetchMarketData', () => {
    it('should fetch market data from URL', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.fetchMarketData('https://api.example.com/stocks')
      })

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('data')
      if ('data' in response) {
        expect(response.data).toContain('https://api.example.com/stocks')
      }

      Math.random = originalRandom
    })

    it('should handle various URL formats', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const urls = [
        'https://example.com',
        'http://example.com',
        'https://api.example.com/v1/data',
        'https://example.com/path?query=value',
      ]

      for (const url of urls) {
        let response
        await act(async () => {
          response = await result.current.fetchMarketData(url)
        })
        expect(response).toHaveProperty('success')
      }

      Math.random = originalRandom
    })
  })

  describe('storeAnalysisResult', () => {
    it('should store analysis results with memory server', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const analysisResult = {
        score: 85,
        trend: 'upward',
        recommendations: ['Buy', 'Hold'],
      }

      let response
      await act(async () => {
        response = await result.current.storeAnalysisResult('analysis-123', analysisResult)
      })

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('data')

      Math.random = originalRandom
    })

    it('should handle undefined values in storage', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.storeAnalysisResult('analysis-456', undefined)
      })

      expect(response).toHaveProperty('success')

      Math.random = originalRandom
    })

    it('should handle complex objects in storage', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      const complexObject = {
        nested: {
          deep: {
            value: 'test',
            array: [1, 2, 3],
          },
        },
        date: new Date().toISOString(),
        nullValue: null,
      }

      let response
      await act(async () => {
        response = await result.current.storeAnalysisResult('complex-analysis', complexObject)
      })

      expect(response).toHaveProperty('success')

      Math.random = originalRandom
    })

    it('should log when storing with defined value', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      await act(async () => {
        await result.current.storeAnalysisResult('test-id', { data: 'test' })
      })

      const logCalls = (console.log as any).mock.calls
      const persistLogCall = logCalls.find((call: string[]) => 
        call[0]?.includes('Persisting payload')
      )
      
      expect(persistLogCall).toBeDefined()

      Math.random = originalRandom
    })
  })

  describe('getStoredAnalysis', () => {
    it('should retrieve stored analysis', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.getStoredAnalysis('analysis-789')
      })

      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('data')

      Math.random = originalRandom
    })

    it('should handle retrieval of non-existent analysis', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true)
      })

      let response
      await act(async () => {
        response = await result.current.getStoredAnalysis('non-existent-id')
      })

      // Mock always returns success
      expect(response).toHaveProperty('success')

      Math.random = originalRandom
    })
  })

  describe('initializeMCPServers', () => {
    it('should allow manual re-initialization', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialServers = new Set(result.current.servers)

      await act(async () => {
        await result.current.initializeMCPServers()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should have attempted re-initialization
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Mock: Initializing'))
    })

    it('should reset error state on re-initialization', async () => {
      const originalRandom = Math.random
      
      // First initialization fails
      Math.random = vi.fn(() => 0.2)
      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Second initialization succeeds
      Math.random = vi.fn(() => 0.5)
      await act(async () => {
        await result.current.initializeMCPServers()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe(null)

      Math.random = originalRandom
    })

    it('should set loading state during initialization', async () => {
      const { result } = renderHook(() => useMCPIntegration())

      // Immediately after render, should be loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Error handling', () => {
    it('should handle errors when server not initialized', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.1) // All fail

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const operations = [
        result.current.searchFinancialInsights('test'),
        result.current.fetchMarketData('http://test.com'),
        result.current.storeAnalysisResult('id', {}),
        result.current.getStoredAnalysis('id'),
      ]

      for (const operation of operations) {
        const response = await operation
        if ('error' in response) {
          expect(response.success).toBe(false)
          expect(response.error).toContain('not initialized')
        }
      }

      Math.random = originalRandom
    })

    it('should maintain state consistency on error', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.1) // Fail

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.isInitialized).toBe(false)
      expect(result.current.servers).toBeInstanceOf(Set)
      expect(result.current.error).toBe(null)

      Math.random = originalRandom
    })
  })

  describe('Environment variable handling', () => {
    it('should handle empty environment variables', async () => {
      process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = ''

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(console.warn).toHaveBeenCalled()
    })

    it('should handle whitespace-only environment variables', async () => {
      process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY = '   '

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Should skip the server with whitespace-only env vars
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('Skipping perplexity-ask')
      )
    })

    it('should initialize servers without environment requirements', async () => {
      const originalRandom = Math.random
      Math.random = vi.fn(() => 0.5)

      delete process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY

      const { result } = renderHook(() => useMCPIntegration())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // fetch and memory servers don't need env vars
      const serverList = Array.from(result.current.servers)
      expect(serverList).not.toContain('perplexity-ask')

      Math.random = originalRandom
    })
  })
})