import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cn, hasEnvVars } from '../utils'

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('foo', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    const result = cn('foo', false && 'bar', 'baz')
    expect(result).toBe('foo baz')
  })

  it('should handle undefined and null values', () => {
    const result = cn('foo', undefined, null, 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle empty strings', () => {
    const result = cn('foo', '', 'bar')
    expect(result).toBe('foo bar')
  })

  it('should handle arrays of classes', () => {
    const result = cn(['foo', 'bar'], 'baz')
    expect(result).toBe('foo bar baz')
  })

  it('should merge tailwind classes with twMerge', () => {
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })

  it('should handle object notation', () => {
    const result = cn({ foo: true, bar: false, baz: true })
    expect(result).toBe('foo baz')
  })

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      { 'conditional-true': true, 'conditional-false': false },
      ['array-1', 'array-2'],
      undefined,
      'final-class'
    )
    expect(result).toContain('base-class')
    expect(result).toContain('conditional-true')
    expect(result).not.toContain('conditional-false')
    expect(result).toContain('array-1')
    expect(result).toContain('array-2')
    expect(result).toContain('final-class')
  })

  it('should return empty string when no arguments', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle only falsy values', () => {
    const result = cn(false, null, undefined, '')
    expect(result).toBe('')
  })
})

describe('hasEnvVars constant', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should be true when all required env vars are set', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key-123'
    
    // Re-import to get fresh evaluation
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(true)
  })

  it('should be false when SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key-123'
    
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(false)
  })

  it('should be false when SUPABASE_ANON_KEY is missing', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(false)
  })

  it('should be false when env vars are empty strings', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ''
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ''
    
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(false)
  })

  it('should be false when env vars are whitespace only', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = '   '
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '\t\n'
    
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(false)
  })

  it('should be false when one var is valid and one is whitespace', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '   '
    
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(false)
  })

  it('should handle undefined env vars', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = undefined
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined
    
    const { hasEnvVars: freshHasEnvVars } = require('../utils')
    expect(freshHasEnvVars).toBe(false)
  })
})