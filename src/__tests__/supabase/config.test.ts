import { describe, expect, it, vi } from 'vitest'

const importCfg = async () => await import('../../supabase/config.js')

const setEnv = (vars: Record<string, string | undefined>) => {
  for (const k of Object.keys(vars)) {
    if (vars[k] === undefined) delete (process.env as any)[k]
    else (process.env as any)[k] = vars[k] as string
  }
}

describe('supabase/config', () => {
  it('validateSupabaseConfig false when missing', async () => {
    setEnv({ SUPABASE_URL: undefined, SUPABASE_ANON_KEY: undefined })
    const mod = await importCfg()
    expect(mod.validateSupabaseConfig()).toBe(false)
  })

  it('validateSupabaseConfig true when both present', async () => {
    setEnv({ SUPABASE_URL: 'https://proj.supabase.co', SUPABASE_ANON_KEY: 'anon-123' })
    const mod = await importCfg()
    expect(mod.validateSupabaseConfig()).toBe(true)
    expect(mod.default).toEqual({ url: 'https://proj.supabase.co', anonKey: 'anon-123' })
  })
})