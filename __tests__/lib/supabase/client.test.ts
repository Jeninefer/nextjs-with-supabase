import { createClient } from '@/lib/supabase/client'

// Mock the @supabase/ssr module
jest.mock('@supabase/ssr', () => ({
    createBrowserClient: jest.fn(() => ({
        auth: {
            signIn: jest.fn(),
            signOut: jest.fn(),
            getUser: jest.fn(),
            getClaims: jest.fn(),
        },
        from: jest.fn(() => ({
            select: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        })),
    })),
}))

describe('Supabase Browser Client', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('supabase client creates correctly', () => {
        const client = createClient()

        expect(client).toBeDefined()
        expect(client.auth).toBeDefined()
        expect(client.from).toBeDefined()
    })

    test('createClient uses correct environment variables', () => {
        const { createBrowserClient } = require('@supabase/ssr')

        createClient()

        expect(createBrowserClient).toHaveBeenCalledWith(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY
        )
    })

    test('createClient handles missing environment variables', () => {
        const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

        delete process.env.NEXT_PUBLIC_SUPABASE_URL
        delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY

        expect(() => createClient()).toThrow()

        // Restore environment variables
        process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = originalKey
    })

    test('client has expected auth methods', () => {
        const client = createClient()

        expect(typeof client.auth.signIn).toBe('function')
        expect(typeof client.auth.signOut).toBe('function')
        expect(typeof client.auth.getUser).toBe('function')
        expect(typeof client.auth.getClaims).toBe('function')
    })

    test('client has expected database methods', () => {
        const client = createClient()
        const table = client.from('test_table')

        expect(typeof table.select).toBe('function')
        expect(typeof table.insert).toBe('function')
        expect(typeof table.update).toBe('function')
        expect(typeof table.delete).toBe('function')
    })
})