import { beforeEach, describe, expect, it, vi } from 'vitest'

const setEnv = (vars: Record<string, string | undefined>) => {
  for (const k of Object.keys(vars)) {
    if (vars[k] === undefined) delete (process.env as any)[k]
    else (process.env as any)[k] = vars[k] as string
  }
}

describe('supabase/client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('returns null client when not configured', async () => {
    setEnv({ SUPABASE_URL: undefined, SUPABASE_ANON_KEY: undefined })
    const mod = await import('../../supabase/client.js')
    expect(mod.getSupabaseClient()).toBeNull()
    expect(mod.supabase).toBeNull()
    expect(mod.isSupabaseConfigured()).toBe(false)
  })

  it('initializes createClient with expected options when configured', async () => {
    setEnv({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' })
    const fake = {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'does not exist' } }) }))
      }))
    }
    const createClient = vi.fn(() => fake)
    vi.doMock('@supabase/supabase-js', () => ({ createClient }))
    const mod = await import('../../supabase/client.js')
    expect(createClient).toHaveBeenCalledWith(
      'https://x.supabase.co',
      'anon',
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        })
      })
    )
    expect(mod.supabase).toBe(fake)
    expect(mod.isSupabaseConfigured()).toBe(true)
  })

  it('testSupabaseConnection interprets missing table as successful connectivity', async () => {
    setEnv({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' })
    const chain = { limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'relation "_test" does not exist' } }) }
    const fake = { from: vi.fn(() => ({ select: vi.fn(() => chain) })) }
    const createClient = vi.fn(() => fake)
    vi.doMock('@supabase/supabase-js', () => ({ createClient }))
    const mod = await import('../../supabase/client.js')
    await expect(mod.testSupabaseConnection()).resolves.toBe(true)
  })

  it('testSupabaseConnection returns false on other errors', async () => {
    setEnv({ SUPABASE_URL: 'https://x.supabase.co', SUPABASE_ANON_KEY: 'anon' })
    const chain = { limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'auth error' } }) }
    const fake = { from: vi.fn(() => ({ select: vi.fn(() => chain) })) }
    const createClient = vi.fn(() => fake)
    vi.doMock('@supabase/supabase-js', () => ({ createClient }))
    const mod = await import('../../supabase/client.js')
    await expect(mod.testSupabaseConnection()).resolves.toBe(false)
  })
})