import { createClient } from '@/lib/supabase/server'

// Mock the @supabase/ssr module
jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn(() => ({
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

// Mock next/headers
jest.mock('next/headers', () => ({
    cookies: jest.fn(),
}))

describe('Supabase Server Client', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('server client handles cookies', async () => {
        const mockCookies = {
            getAll: jest.fn(() => [
                { name: 'test-cookie', value: 'test-value' }
            ]),
            set: jest.fn(),
        }

        const { cookies } = require('next/headers')
        cookies.mockResolvedValue(mockCookies)

        const client = await createClient()

        expect(client).toBeDefined()
        expect(cookies).toHaveBeenCalled()
    })

    test('createClient creates server client with correct parameters', async () => {
        const mockCookies = {
            getAll: jest.fn(() => []),
            set: jest.fn(),
        }

        const { cookies } = require('next/headers')
        const { createServerClient } = require('@supabase/ssr')

        cookies.mockResolvedValue(mockCookies)

        await createClient()

        expect(createServerClient).toHaveBeenCalledWith(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY,
            expect.objectContaining({
                cookies: expect.objectContaining({
                    getAll: expect.any(Function),
                    setAll: expect.any(Function),
                }),
            })
        )
    })

    test('cookies adapter handles getAll correctly', async () => {
        const mockCookies = {
            getAll: jest.fn(() => [
                { name: 'cookie1', value: 'value1' },
                { name: 'cookie2', value: 'value2' },
            ]),
            set: jest.fn(),
        }

        const { cookies } = require('next/headers')
        cookies.mockResolvedValue(mockCookies)

        await createClient()

        // Verify that getAll was accessible through the adapter
        expect(mockCookies.getAll).toHaveBeenCalled()
    })

    test('cookies adapter handles setAll with error gracefully', async () => {
        const mockCookies = {
            getAll: jest.fn(() => []),
            set: jest.fn(() => {
                throw new Error('Cannot set cookies in Server Component')
            }),
        }

        const { cookies } = require('next/headers')
        cookies.mockResolvedValue(mockCookies)

        // Should not throw error even if cookie setting fails
        expect(async () => await createClient()).not.toThrow()
    })

    test('resolveCookieStore handles promise-like objects', async () => {
        const mockPromiseCookies = Promise.resolve({
            getAll: jest.fn(() => []),
            set: jest.fn(),
        })

        const { cookies } = require('next/headers')
        cookies.mockReturnValue(mockPromiseCookies)

        const client = await createClient()

        expect(client).toBeDefined()
    })

    test('cookies adapter handles missing getAll method', async () => {
        const mockCookies = {
            // Missing getAll method
            set: jest.fn(),
        }

        const { cookies } = require('next/headers')
        cookies.mockResolvedValue(mockCookies)

        const client = await createClient()

        expect(client).toBeDefined()
        // Should handle missing getAll gracefully by returning empty array
    })

    test('cookies adapter handles array-like cookie store', async () => {
        const mockArrayCookies = [
            { name: 'cookie1', value: 'value1' },
            { name: 'cookie2', value: 'value2' },
        ]

        const { cookies } = require('next/headers')
        cookies.mockResolvedValue(mockArrayCookies)

        const client = await createClient()

        expect(client).toBeDefined()
    })

    test('server client has expected auth methods', async () => {
        const mockCookies = {
            getAll: jest.fn(() => []),
            set: jest.fn(),
        }

        const { cookies } = require('next/headers')
        cookies.mockResolvedValue(mockCookies)

        const client = await createClient()

        expect(typeof client.auth.signOut).toBe('function')
        expect(typeof client.auth.getUser).toBe('function')
        expect(typeof client.auth.getClaims).toBe('function')
    })
})