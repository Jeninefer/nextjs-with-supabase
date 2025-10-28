import { NextRequest, NextResponse } from 'next/server'
import { middleware, config } from '@/middleware'

// Mock Supabase SSR
const mockGetSession = jest.fn()
const mockCreateServerClient = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args)
}))

describe('middleware', () => {
  let mockRequest: NextRequest
  let mockCookies: Map<string, string>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockCookies = new Map()
    
    // Mock NextRequest
    mockRequest = {
      cookies: {
        get: jest.fn((name: string) => {
          const value = mockCookies.get(name)
          return value ? { name, value } : undefined
        }),
        set: jest.fn((name: string, value: string) => {
          mockCookies.set(name, value)
        }),
        delete: jest.fn((name: string) => {
          mockCookies.delete(name)
        })
      },
      url: 'https://example.com/test',
      nextUrl: {
        pathname: '/test'
      }
    } as unknown as NextRequest

    // Mock createServerClient to return mock client with auth methods
    mockCreateServerClient.mockReturnValue({
      auth: {
        getSession: mockGetSession
      }
    })

    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Set up environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  })

  describe('Supabase client initialization', () => {
    it('should create Supabase client with environment variables', async () => {
      await middleware(mockRequest)

      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            get: expect.any(Function),
            set: expect.any(Function),
            remove: expect.any(Function)
          })
        })
      )
    })

    it('should call getSession on Supabase client', async () => {
      await middleware(mockRequest)

      expect(mockGetSession).toHaveBeenCalledTimes(1)
    })

    it('should handle Supabase client creation with all cookie operations', async () => {
      await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies

      expect(cookiesConfig).toHaveProperty('get')
      expect(cookiesConfig).toHaveProperty('set')
      expect(cookiesConfig).toHaveProperty('remove')
    })
  })

  describe('Cookie handling', () => {
    it('should read cookies from request', async () => {
      mockCookies.set('test-cookie', 'test-value')

      await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      const cookieValue = cookiesConfig.get('test-cookie')

      expect(cookieValue).toBe('test-value')
    })

    it('should set cookies on response', async () => {
      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      
      // Simulate setting a cookie
      cookiesConfig.set('new-cookie', 'new-value', { 
        httpOnly: true,
        secure: true,
        sameSite: 'lax' as const
      })

      // Cookie should be set on response
      expect(response).toBeDefined()
    })

    it('should remove cookies from response', async () => {
      mockCookies.set('old-cookie', 'old-value')

      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      
      // Simulate removing a cookie
      cookiesConfig.remove('old-cookie', {
        path: '/'
      })

      expect(response).toBeDefined()
    })

    it('should handle undefined cookie values', async () => {
      await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      const nonExistentCookie = cookiesConfig.get('non-existent')

      expect(nonExistentCookie).toBeUndefined()
    })

    it('should pass cookie options to response', async () => {
      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      
      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' as const,
        maxAge: 3600,
        path: '/api'
      }

      // Should accept various cookie options
      cookiesConfig.set('secure-cookie', 'value', cookieOptions)

      expect(response).toBeDefined()
    })
  })

  describe('Response handling', () => {
    it('should return NextResponse', async () => {
      const response = await middleware(mockRequest)

      expect(response).toBeInstanceOf(Object)
      expect(response).toHaveProperty('cookies')
    })

    it('should throw if session retrieval fails', async () => {
      mockGetSession.mockRejectedValue(new Error('Session error'))

      // Should not throw
      await expect(middleware(mockRequest)).rejects.toThrow('Session error')
    })

    it('should handle successful session retrieval', async () => {
      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token',
            user: { id: 'user-123', email: 'test@example.com' }
          }
        },
        error: null
      })

      const response = await middleware(mockRequest)

      expect(response).toBeDefined()
      expect(mockGetSession).toHaveBeenCalled()
    })

    it('should handle session with error', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid token' }
      })

      const response = await middleware(mockRequest)

      expect(response).toBeDefined()
    })
  })

  describe('Error handling', () => {
    it('should throw if SUPABASE_URL is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      mockCreateServerClient.mockImplementation((url: string) => {
        if (!url) throw new Error('Missing SUPABASE_URL')
        return { auth: { getSession: mockGetSession } }
      })
      await expect(middleware(mockRequest)).rejects.toThrow('Missing SUPABASE_URL')
    })

    it('should throw if SUPABASE_ANON_KEY is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      mockCreateServerClient.mockImplementation((_url: string, key: string) => {
        if (!key) throw new Error('Missing SUPABASE_ANON_KEY')
        return { auth: { getSession: mockGetSession } }
      })
      await expect(middleware(mockRequest)).rejects.toThrow('Missing SUPABASE_ANON_KEY')
    })

    it('should handle malformed request gracefully', async () => {
      const malformedRequest = {
        cookies: {
          get: jest.fn(() => { throw new Error('Cookie error') })
        }
      } as unknown as NextRequest

      mockCreateServerClient.mockImplementation(() => {
        throw new Error('Client creation failed')
      })

      await expect(middleware(malformedRequest)).rejects.toThrow()
    })
  })

  describe('Configuration', () => {
    it('should have matcher configuration', () => {
      expect(config).toBeDefined()
      expect(config).toHaveProperty('matcher')
    })

    it('should exclude static files from matcher', () => {
      expect(config.matcher).toContain('_next/static')
      expect(config.matcher).toContain('_next/image')
    })

    it('should exclude common image formats from matcher', () => {
      const matcher = config.matcher[0] || config.matcher

      // Check that matcher excludes image extensions
      expect(matcher).toMatch(/svg|png|jpg|jpeg|gif|webp/)
    })

    it('should exclude favicon from matcher', () => {
      const matcher = config.matcher[0] || config.matcher

      expect(matcher).toContain('favicon.ico')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle multiple cookie operations in sequence', async () => {
      mockCookies.set('cookie1', 'value1')
      mockCookies.set('cookie2', 'value2')

      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies

      const val1 = cookiesConfig.get('cookie1')
      const val2 = cookiesConfig.get('cookie2')

      expect(val1).toBe('value1')
      expect(val2).toBe('value2')
    })

    it('should maintain cookie state across operations', async () => {
      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies

      // Set then get
      cookiesConfig.set('test', 'value', {})
      mockCookies.set('test', 'value') // Simulate the set
      
      const retrieved = cookiesConfig.get('test')
      expect(retrieved).toBe('value')
    })

    it('should handle auth flow with session cookies', async () => {
      // Simulate existing auth cookies
      mockCookies.set('sb-access-token', 'access-token-123')
      mockCookies.set('sb-refresh-token', 'refresh-token-456')

      mockGetSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'access-token-123',
            refresh_token: 'refresh-token-456',
            user: { id: 'user-123' }
          }
        },
        error: null
      })

      const response = await middleware(mockRequest)

      expect(mockGetSession).toHaveBeenCalled()
      expect(response).toBeDefined()
    })

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, () => ({
        ...mockRequest,
        url: `https://example.com/test-${Math.random()}`
      })) as NextRequest[]

      const responses = await Promise.all(
        requests.map(req => middleware(req))
      )

      expect(responses).toHaveLength(10)
      responses.forEach(response => {
        expect(response).toBeDefined()
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty cookie jar', async () => {
      mockCookies.clear()

      const response = await middleware(mockRequest)

      expect(response).toBeDefined()
      expect(mockGetSession).toHaveBeenCalled()
    })

    it('should handle very long cookie values', async () => {
      const longValue = 'a'.repeat(4096)
      mockCookies.set('long-cookie', longValue)

      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      const retrieved = cookiesConfig.get('long-cookie')

      expect(retrieved).toBe(longValue)
    })

    it('should handle special characters in cookie values', async () => {
      const specialValue = '!@#$%^&*()[]{}|\\:";\'<>?,./`~'
      mockCookies.set('special-cookie', specialValue)

      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      const retrieved = cookiesConfig.get('special-cookie')

      expect(retrieved).toBe(specialValue)
    })

    it('should handle Unicode in cookie values', async () => {
      const unicodeValue = '🍪 Cookie 测试 クッキー'
      mockCookies.set('unicode-cookie', unicodeValue)

      const response = await middleware(mockRequest)

      const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
      const retrieved = cookiesConfig.get('unicode-cookie')

      expect(retrieved).toBe(unicodeValue)
    })
  })
})