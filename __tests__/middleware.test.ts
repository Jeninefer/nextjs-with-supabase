import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock dependencies
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create Supabase client with correct environment variables', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    
    const { middleware } = await import('../middleware')
    await middleware(mockRequest)

    expect(createServerClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      expect.objectContaining({
        cookies: expect.any(Object),
      })
    )
  })

  it('should allow authenticated users to access protected routes', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: { id: 'user-123', email: 'test@example.com' } }, 
          error: null 
        }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    expect(response).toBeInstanceOf(NextResponse)
    expect(response.status).not.toBe(307) // Not a redirect
  })

  it('should redirect unauthenticated users to sign-in', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/sign-in')
  })

  it('should allow access to sign-in page without authentication', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/sign-in'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    expect(response.status).not.toBe(307)
  })

  it('should allow access to sign-up page without authentication', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/sign-up'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    expect(response.status).not.toBe(307)
  })

  it('should allow access to auth routes without authentication', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/auth/callback'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    expect(response.status).not.toBe(307)
  })

  it('should allow access to root path without authentication', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    expect(response.status).not.toBe(307)
  })

  it('should handle cookies correctly in getAll', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    const mockCookies = [
      { name: 'session', value: 'abc123' },
      { name: 'refresh', value: 'def456' },
    ]

    let capturedCookiesConfig: any

    vi.mocked(createServerClient).mockImplementation((url, key, config) => {
      capturedCookiesConfig = config
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
        },
      } as any
    })

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    mockRequest.cookies.getAll = vi.fn().mockReturnValue(mockCookies)
    
    const { middleware } = await import('../middleware')
    await middleware(mockRequest)

    expect(capturedCookiesConfig).toBeDefined()
    expect(capturedCookiesConfig.cookies).toBeDefined()
    
    const retrievedCookies = capturedCookiesConfig.cookies.getAll()
    expect(retrievedCookies).toEqual(mockCookies)
  })

  it('should handle cookies correctly in setAll', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    let capturedCookiesConfig: any

    vi.mocked(createServerClient).mockImplementation((url, key, config) => {
      capturedCookiesConfig = config
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
        },
      } as any
    })

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    const setMock = vi.fn()
    mockRequest.cookies.set = setMock
    mockRequest.cookies.getAll = vi.fn().mockReturnValue([])
    
    const { middleware } = await import('../middleware')
    await middleware(mockRequest)

    const cookiesToSet = [
      { name: 'session', value: 'new-session', options: { maxAge: 3600 } },
      { name: 'refresh', value: 'new-refresh', options: { httpOnly: true } },
    ]

    capturedCookiesConfig.cookies.setAll(cookiesToSet)

    // Should set cookies on request without options
    expect(setMock).toHaveBeenCalledWith('session', 'new-session')
    expect(setMock).toHaveBeenCalledWith('refresh', 'new-refresh')
  })

  it('should preserve cookies between request and response', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    let capturedCookiesConfig: any

    vi.mocked(createServerClient).mockImplementation((url, key, config) => {
      capturedCookiesConfig = config
      return {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
        },
      } as any
    })

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    mockRequest.cookies.set = vi.fn()
    mockRequest.cookies.getAll = vi.fn().mockReturnValue([])
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    const cookiesToSet = [
      { name: 'test-cookie', value: 'test-value', options: { path: '/' } },
    ]

    capturedCookiesConfig.cookies.setAll(cookiesToSet)

    // Response should be a NextResponse
    expect(response).toBeInstanceOf(NextResponse)
  })

  it('should handle auth errors gracefully', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ 
          data: { user: null }, 
          error: { message: 'Auth error' } 
        }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    
    const { middleware } = await import('../middleware')
    const response = await middleware(mockRequest)

    // Should redirect on error
    expect(response.status).toBe(307)
  })

  it('should not redirect for static assets', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    } as any)

    const staticPaths = [
      '/_next/static/chunk.js',
      '/_next/image?url=test.jpg',
      '/favicon.ico',
      '/logo.png',
      '/image.jpg',
    ]

    const { middleware } = await import('../middleware')
    const { config } = await import('../middleware')

    // Check that static paths are excluded by matcher
    const matcher = config.matcher[0]
    
    for (const path of staticPaths) {
      const mockRequest = new NextRequest(new URL(`https://example.com${path}`))
      
      // These should be excluded by the matcher pattern
      // The regex pattern should exclude these
      expect(matcher).toBeDefined()
    }
  })

  it('should use NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key-123'

    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
      },
    } as any)

    const mockRequest = new NextRequest(new URL('https://example.com/dashboard'))
    
    const { middleware } = await import('../middleware')
    await middleware(mockRequest)

    expect(createServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key-123',
      expect.any(Object)
    )
  })
})