import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

describe('Supabase Server Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create server client with cookies adapter', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([
        { name: 'cookie1', value: 'value1' },
        { name: 'cookie2', value: 'value2' },
      ]),
      set: vi.fn(),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    const client = await createClient()

    expect(cookies).toHaveBeenCalled()
    expect(createServerClient).toHaveBeenCalled()
    
    const callArgs = vi.mocked(createServerClient).mock.calls[0]
    expect(callArgs[0]).toBe(process.env.NEXT_PUBLIC_SUPABASE_URL)
    expect(callArgs[1]).toBe(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    expect(callArgs[2]).toHaveProperty('cookies')
  })

  it('should handle cookie store with getAll method', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const testCookies = [
      { name: 'session', value: 'abc123' },
      { name: 'refresh', value: 'def456' },
    ]

    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue(testCookies),
      set: vi.fn(),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = vi.mocked(createServerClient).mock.calls[0][2]
    const adapter = cookiesConfig.cookies
    
    const retrievedCookies = adapter.getAll()
    expect(retrievedCookies).toEqual(testCookies)
    expect(mockCookieStore.getAll).toHaveBeenCalled()
  })

  it('should handle setAll in cookies adapter', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = vi.mocked(createServerClient).mock.calls[0][2]
    const adapter = cookiesConfig.cookies

    const cookiesToSet = [
      { name: 'session', value: 'new-session', options: { maxAge: 3600 } },
      { name: 'refresh', value: 'new-refresh', options: { httpOnly: true } },
    ]

    adapter.setAll(cookiesToSet)

    expect(mockCookieStore.set).toHaveBeenCalledTimes(2)
    expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'new-session', { maxAge: 3600 })
    expect(mockCookieStore.set).toHaveBeenCalledWith('refresh', 'new-refresh', { httpOnly: true })
  })

  it('should handle cookies as array-like object', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const arrayCookies = [
      { name: 'cookie1', value: 'value1' },
      { name: 'cookie2', value: 'value2' },
    ]

    vi.mocked(cookies).mockResolvedValue(arrayCookies as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = vi.mocked(createServerClient).mock.calls[0][2]
    const adapter = cookiesConfig.cookies
    
    const retrievedCookies = adapter.getAll()
    expect(retrievedCookies).toEqual(arrayCookies)
  })

  it('should return empty array when cookie store is invalid', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    vi.mocked(cookies).mockResolvedValue(null as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = vi.mocked(createServerClient).mock.calls[0][2]
    const adapter = cookiesConfig.cookies
    
    const retrievedCookies = adapter.getAll()
    expect(retrievedCookies).toEqual([])
  })

  it('should silently handle setAll errors', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn().mockImplementation(() => {
        throw new Error('Cannot set cookies in Server Component')
      }),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = vi.mocked(createServerClient).mock.calls[0][2]
    const adapter = cookiesConfig.cookies

    // Should not throw
    expect(() => {
      adapter.setAll([{ name: 'test', value: 'value' }])
    }).not.toThrow()
  })

  it('should handle cookie store as promise', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([{ name: 'test', value: 'value' }]),
      set: vi.fn(),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    const client = await createClient()

    expect(client).toBeDefined()
    expect(createServerClient).toHaveBeenCalled()
  })

  it('should use correct environment variables', async () => {
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')

    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://custom.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'custom-anon-key'

    const mockCookieStore = {
      getAll: vi.fn().mockReturnValue([]),
      set: vi.fn(),
    }

    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any)
    vi.mocked(createServerClient).mockReturnValue({ auth: {} } as any)

    const { createClient } = await import('../server')
    await createClient()

    expect(createServerClient).toHaveBeenCalledWith(
      'https://custom.supabase.co',
      'custom-anon-key',
      expect.any(Object)
    )
  })
})