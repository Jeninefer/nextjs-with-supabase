import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const importOpenAI = async () => await import('../../api/openai.js')

const setEnv = (vars: Record<string, string | undefined>) => {
  for (const k of Object.keys(vars)) {
    if (vars[k] === undefined) delete (process.env as any)[k]
    else (process.env as any)[k] = vars[k] as string
  }
}

describe('openai api', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    (globalThis.fetch as any)?.mockReset?.()
  })

  it('validateOpenAIConfig returns false when key missing', async () => {
    setEnv({ OPENAI_API_KEY: undefined })
    const mod = await importOpenAI()
    expect(mod.validateOpenAIConfig()).toBe(false)
  })

  it('chatCompletion posts to /chat/completions and returns JSON', async () => {
    setEnv({ OPENAI_API_KEY: 'sk-xyz' })
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'hi' } }] })
    })
    const mod = await importOpenAI()
    const res = await mod.chatCompletion([{ role: 'user', content: 'Hello' }], { temperature: 0.3, stream: false })
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer sk-xyz' })
      })
    )
    expect(res.choices[0].message.content).toBe('hi')
  })

  it('complete returns only message content', async () => {
    setEnv({ OPENAI_API_KEY: 'sk-xyz' })
    ;(fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'result text' } }] })
    })
    const mod = await importOpenAI()
    const out = await mod.complete('Prompt', 'Sys')
    expect(out).toBe('result text')
  })

  it('generateSlideContent parses JSON or falls back to text snippet', async () => {
    setEnv({ OPENAI_API_KEY: 'sk-xyz' })
    // First, JSON content
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: '{"title":"T","bullets":["a"]}' } }] })
    })
    const mod = await importOpenAI()
    const parsed = await mod.generateSlideContent('Topic', 1, 5)
    expect(parsed).toEqual(expect.objectContaining({ title: 'T' }))

    // Then, non-JSON (fallback path)
    vi.resetModules()
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'plain text result' } }] })
    })
    const mod2 = await importOpenAI()
    const fallback = await mod2.generateSlideContent('Topic', 1, 5)
    expect(fallback).toEqual(expect.objectContaining({ title: expect.any(String) }))
  })

  it('non-ok response throws OpenAI API error message', async () => {
    setEnv({ OPENAI_API_KEY: 'sk-xyz' })
    ;(fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Bad Request',
      json: async () => ({ error: { message: 'quota exceeded' } })
    })
    const mod = await importOpenAI()
    await expect(mod.chatCompletion([{ role: 'user', content: 'Hi' }]))
      .rejects.toThrow(/OpenAI API error: quota exceeded/)
  })
})