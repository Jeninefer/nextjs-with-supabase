import '@testing-library/jest-dom/vitest'

// Optional: quiet noisy warnings during negative-path tests
const silent = ['Supabase', 'OpenAI', 'Figma', 'xAI', 'Supabase URL', 'Anon Key']
const origWarn = console.warn
beforeAll(() => {
  vi.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
    const s = String(args[0] ?? '')
    if (silent.some(k => s.includes(k))) return
    // uncomment to see warnings during debug:
    // origWarn(...args)
  })
})
afterAll(() => {
  ;(console.warn as unknown as jest.Mock)?.mockRestore?.()
  console.warn = origWarn
})