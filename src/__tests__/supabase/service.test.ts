import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('supabase/service', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
  })

  it('returns error objects when not configured', async () => {
    vi.doMock('../../supabase/client.js', () => ({
      supabase: null,
      isSupabaseConfigured: () => false
    }))
    const svc = await import('../../supabase/service.js')
    await expect(svc.auth.signIn('a','b')).resolves.toEqual({ error: { message: 'Supabase not configured' } })
    await expect(svc.db.select('t')).resolves.toEqual({ data: null, error: { message: 'Supabase not configured' } })
    expect(svc.storage.getPublicUrl('b','p')).toBeNull()
  })

  it('delegates to supabase client methods when configured', async () => {
    const authApi = {
      signUp: vi.fn().mockResolvedValue({ user: { id: '1' }, session: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ user: { id: '1' }, session: { token: 't' } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { token: 'x' } }, error: null })
    }
    const fromChain = {
      select: vi.fn().mockResolvedValue({ data: [1], error: null }),
      insert: vi.fn(function (this: any) { return { select: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) } }),
      update: vi.fn(function (this: any) { return { match: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }) } }),
      delete: vi.fn(function (this: any) { return { match: vi.fn().mockResolvedValue({ data: null, error: null }) } })
    }
    const supabase = {
      auth: authApi,
      from: vi.fn(() => fromChain as any),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: { path: 'ok' }, error: null }),
          download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://u' } }),
          remove: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      }
    } as any

    vi.doMock('../../supabase/client.js', () => ({
      supabase,
      isSupabaseConfigured: () => true
    }))
    const svc = await import('../../supabase/service.js')

    // auth
    await expect(svc.auth.signUp('e','p')).resolves.toEqual({ user: { id: '1' }, session: null })
    await expect(svc.auth.signIn('e','p')).resolves.toEqual({ user: { id: '1' }, session: { token: 't' } })
    await expect(svc.auth.signOut()).resolves.toEqual({ error: null })
    await expect(svc.auth.getCurrentUser()).resolves.toEqual({ user: { id: '1' }, error: null })
    await expect(svc.auth.getSession()).resolves.toEqual({ session: { token: 'x' }, error: null })

    // db helpers
    await expect(svc.db.select('t')).resolves.toEqual({ data: [1], error: null })
    await expect(svc.db.insert('t', { a: 1 })).resolves.toEqual({ data: [{ id: 1 }], error: null })
    await expect(svc.db.update('t', { a: 2 }, { id: 1 })).resolves.toEqual({ data: [{ id: 1 }], error: null })
    await expect(svc.db.delete('t', { id: 1 })).resolves.toEqual({ data: null, error: null })

    // storage
    await expect(svc.storage.upload('b','p', new Blob())).resolves.toEqual({ data: { path: 'ok' }, error: null })
    await expect(svc.storage.download('b','p')).resolves.toEqual({ data: expect.any(Blob), error: null })
    expect(svc.storage.getPublicUrl('b','p')).toBe('https://u')
    await expect(svc.storage.delete('b',['p'])).resolves.toEqual({ data: null, error: null })
  })
})