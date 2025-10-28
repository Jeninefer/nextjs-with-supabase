// Jest setup file
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock next/headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({
    getAll: () => [],
    set: jest.fn(),
    get: jest.fn(),
  })),
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = 'test-anon-key'

// Global test setup
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

if (!global.vi) {
  const viShim = Object.create(null)
  viShim.fn = (...args) => jest.fn(...args)
  viShim.spyOn = (...args) => jest.spyOn(...args)
  viShim.mock = (moduleName, factory, options) => {
    if (moduleName === 'office-js') {
      const actual = jest.requireActual(moduleName)
      actual.actions.associate = viShim.fn()
      return actual
    }

    return jest.mock(moduleName, factory, options)
  }
  viShim.unmock = (...args) => jest.unmock(...args)
  viShim.clearAllMocks = () => jest.clearAllMocks()
  viShim.resetAllMocks = () => jest.resetAllMocks()
  viShim.restoreAllMocks = () => jest.restoreAllMocks()
  viShim.useFakeTimers = (...args) => jest.useFakeTimers(...args)
  viShim.useRealTimers = (...args) => jest.useRealTimers(...args)
  viShim.advanceTimersByTime = (...args) => jest.advanceTimersByTime(...args)
  viShim.runAllTimers = () => jest.runAllTimers()
  viShim.importActual = (moduleName) => jest.requireActual(moduleName)
  viShim.stubGlobal = (key, value) => {
    global[key] = value
  }

  global.vi = viShim
}