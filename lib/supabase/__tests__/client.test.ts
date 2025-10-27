import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createBrowserClient } from '@supabase/ssr'

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(),
}))

describe('Supabase Browser Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
    vi.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should create browser client with correct environment variables', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const mockClient = { auth: {}, from: vi.fn() }
    vi.mocked(createBrowserClient).mockReturnValue(mockClient as any)

    const { createClient } = await import('../client')
    const client = createClient()

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key'
    )
    expect(client).toBe(mockClient)
  })

  it('should use NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'my-anon-key-123'

    vi.mocked(createBrowserClient).mockReturnValue({} as any)

    const { createClient } = await import('../client')
    createClient()

    expect(createBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'my-anon-key-123'
    )
  })

  it('should handle missing environment variables', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    vi.mocked(createBrowserClient).mockReturnValue({} as any)

    const { createClient } = await import('../client')
    
    // Should still call with undefined values (non-null assertion in source)
    expect(() => createClient()).not.toThrow()
  })

  it('should create a new client instance on each call', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

    const mockClient1 = { id: 1 }
    const mockClient2 = { id: 2 }
    
    vi.mocked(createBrowserClient)
      .mockReturnValueOnce(mockClient1 as any)
      .mockReturnValueOnce(mockClient2 as any)

    const { createClient } = await import('../client')
    const client1 = createClient()
    const client2 = createClient()

    expect(client1).toBe(mockClient1)
    expect(client2).toBe(mockClient2)
    expect(createBrowserClient).toHaveBeenCalledTimes(2)
  })

  it('should work with different URL formats', async () => {
    const testUrls = [
      'https://abc.supabase.co',
      'https://xyz.supabase.in',
      'http://localhost:54321',
    ]

    for (const url of testUrls) {
      vi.clearAllMocks()
      process.env.NEXT_PUBLIC_SUPABASE_URL = url
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      vi.mocked(createBrowserClient).mockReturnValue({} as any)

      const { createClient } = await import('../client')
      createClient()

      expect(createBrowserClient).toHaveBeenCalledWith(url, 'test-key')
    }
  })
})