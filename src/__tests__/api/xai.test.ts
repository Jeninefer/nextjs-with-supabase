import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const importXAI = async () => await import('../../api/xai.js')

const setEnv = (vars: Record<string, string | undefined>) => {
  for (const k of Object.keys(vars)) {
    if (vars[k] === undefined) delete (process.env as any)[k]
    else (process.env as any)[k] = vars[k] as string
  }
}

describe('xai api', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    (globalThis.fetch as any)?.mockReset?.()
  })

  it('validateXAIConfig returns false when key missing', async () => {
    setEnv({ XAI_API_KEY: undefined })
    const mod = await importXAI()
    expect(mod.validateXAIConfig()).toBe(false)
  })

  it('complete uses /chat/completions and returns message content', async () => {
    setEnv({ XAI_API_KEY: 'xai-abc' })
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hello from grok' } }] })
    })
    const mod = await importXAI()
    const out = await mod.complete('Tell me a joke')
    expect(fetch).toHaveBeenCalledWith(
      'https://api.x.ai/v1/chat/completions',
      expect.any(Object)
    )
    expect(out).toBe('hello from grok')
  })

  it('non-ok response throws xAI error', async () => {
    setEnv({ XAI_API_KEY: 'xai-abc' })
    ;(fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: { message: 'invalid key' } })
    })
    const mod = await importXAI()
    await expect(mod.chatCompletion([{ role: 'user', content: 'Hi' }]))
      .rejects.toThrow(/xAI API error: invalid key/)
  })
})