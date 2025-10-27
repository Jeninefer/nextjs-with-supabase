import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const importFigma = async () => await import('../../api/figma.js')

const setEnv = (vars: Record<string, string | undefined>) => {
  for (const k of Object.keys(vars)) {
    if (vars[k] === undefined) delete (process.env as any)[k]
    else (process.env as any)[k] = vars[k] as string
  }
}

describe('figma api', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    (globalThis.fetch as any)?.mockReset?.()
  })

  it('validateFigmaConfig returns false when token missing', async () => {
    setEnv({ FIGMA_ACCESS_TOKEN: undefined })
    const mod = await importFigma()
    expect(mod.validateFigmaConfig()).toBe(false)
  })

  it('getFile calls API with token and returns JSON', async () => {
    setEnv({ FIGMA_ACCESS_TOKEN: 'token-abc', FIGMA_FILE_KEY: 'file123' })
    ;(fetch as any).mockResolvedValue({ ok: true, json: async () => ({ ok: 1 }) })
    const mod = await importFigma()
    const json = await mod.getFile('file123')
    expect(json).toEqual({ ok: 1 })
    expect(fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/files/file123',
      expect.objectContaining({
        headers: expect.objectContaining({ 'X-Figma-Token': 'token-abc' })
      })
    )
  })

  it('getImages builds correct query params', async () => {
    setEnv({ FIGMA_ACCESS_TOKEN: 'token-abc' })
    ;(fetch as any).mockResolvedValue({ ok: true, json: async () => ({}) })
    const mod = await importFigma()
    await mod.getImages('fk', ['1', '2'], { scale: 2, format: 'svg', svg_include_id: true, svg_simplify_stroke: false })
    expect(fetch).toHaveBeenCalledWith(
      'https://api.figma.com/v1/images/fk?ids=1,2&scale=2&format=svg&svg_include_id=true&svg_simplify_stroke=false',
      expect.any(Object)
    )
  })

  it('non-ok response throws with status text', async () => {
    setEnv({ FIGMA_ACCESS_TOKEN: 'token-abc' })
    ;(fetch as any).mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request', json: async () => ({}) })
    const mod = await importFigma()
    await expect(mod.getComments('fk')).rejects.toThrow(/Figma API error: 400 Bad Request/)
  })

  it('getFrame finds frame by name in nested tree', async () => {
    setEnv({ FIGMA_ACCESS_TOKEN: 'token-abc' })
    const tree = {
      document: {
        type: 'DOCUMENT',
        children: [
          { type: 'FRAME', name: 'Other', id: '10' },
          { type: 'CANVAS', children: [{ type: 'FRAME', name: 'Target', id: '42' }] }
        ]
      }
    }
    ;(fetch as any).mockResolvedValue({ ok: true, json: async () => tree })
    const mod = await importFigma()
    const frame = await mod.getFrame('fk', 'Target')
    expect(frame).toEqual(expect.objectContaining({ id: '42', name: 'Target', type: 'FRAME' }))
  })

  it('extractText collects all TEXT nodes', async () => {
    setEnv({ FIGMA_ACCESS_TOKEN: 'token-abc' })
    const tree = {
      document: {
        type: 'DOCUMENT',
        children: [
          { type: 'TEXT', id: 't1', name: 'A', characters: 'hello', style: {} },
          { type: 'FRAME', children: [{ type: 'TEXT', id: 't2', name: 'B', characters: 'world', style: {} }] }
        ]
      }
    }
    ;(fetch as any).mockResolvedValue({ ok: true, json: async () => tree })
    const mod = await importFigma()
    const list = await mod.extractText('fk')
    expect(list.map(x => x.id)).toEqual(['t1', 't2'])
  })
})