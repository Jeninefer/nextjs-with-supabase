import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Extend vitest matchers
expect.extend({})

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock Next.js environment
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'