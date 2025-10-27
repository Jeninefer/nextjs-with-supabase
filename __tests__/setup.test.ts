/**
 * Basic setup test to verify Jest is working correctly
 */

/// <reference types="jest" />

describe('Test Environment Setup', () => {
    test('Jest is working correctly', () => {
        expect(true).toBe(true)
    })

    test('Environment variables are loaded', () => {
        expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
        expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY).toBeDefined()
    })

    test('TypeScript types are working', () => {
        const testString: string = 'Hello World'
        const testNumber: number = 42
        const testBoolean: boolean = true

        expect(testString).toBe('Hello World')
        expect(testNumber).toBe(42)
        expect(testBoolean).toBe(true)
    })
})