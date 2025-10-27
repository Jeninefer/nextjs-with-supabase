import { AuthButton } from '@/components/auth-button'
import { render, screen } from '@testing-library/react'

// Mock the Supabase server client
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn(),
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
    return function MockLink({ children, href, ...props }: any) {
        return <a href={href} {...props}>{children}</a>
    }
})

// Mock LogoutButton component
jest.mock('@/components/logout-button', () => ({
    LogoutButton: () => <button>Sign out</button>,
}))

// Mock UI Button component
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, asChild, variant, ...props }: any) => {
        if (asChild) {
            return <div data-variant={variant} {...props}>{children}</div>
        }
        return <button data-variant={variant} {...props}>{children}</button>
    },
}))

describe('AuthButton Component', () => {
    const mockCreateClient = require('@/lib/supabase/server').createClient

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('displays user email and logout button when user is authenticated', async () => {
        // Mock authenticated user
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({
                    data: {
                        claims: {
                            email: 'analyst@abaco.finance',
                            sub: '123',
                        },
                    },
                }),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        render(await AuthButton())

        expect(screen.getByText('Hey, analyst@abaco.finance!')).toBeInTheDocument()
        expect(screen.getByText('Sign out')).toBeInTheDocument()

        // Should not show sign in/up buttons
        expect(screen.queryByText('Sign in')).not.toBeInTheDocument()
        expect(screen.queryByText('Sign up')).not.toBeInTheDocument()
    })

    test('displays sign in and sign up buttons when user is not authenticated', async () => {
        // Mock unauthenticated user
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({
                    data: {
                        claims: null,
                    },
                }),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        render(await AuthButton())

        expect(screen.getByText('Sign in')).toBeInTheDocument()
        expect(screen.getByText('Sign up')).toBeInTheDocument()

        // Should not show user email or logout button
        expect(screen.queryByText(/Hey,/)).not.toBeInTheDocument()
        expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
    })

    test('displays sign in and sign up buttons when claims data is undefined', async () => {
        // Mock undefined claims data
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({
                    data: undefined,
                }),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        render(await AuthButton())

        expect(screen.getByText('Sign in')).toBeInTheDocument()
        expect(screen.getByText('Sign up')).toBeInTheDocument()
    })

    test('displays sign in and sign up buttons when getClaims returns no data', async () => {
        // Mock no data returned
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({}),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        render(await AuthButton())

        expect(screen.getByText('Sign in')).toBeInTheDocument()
        expect(screen.getByText('Sign up')).toBeInTheDocument()
    })

    test('sign in and sign up buttons have correct links', async () => {
        // Mock unauthenticated user
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({
                    data: {
                        claims: null,
                    },
                }),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        render(await AuthButton())

        const signInLink = screen.getByText('Sign in').closest('a')
        const signUpLink = screen.getByText('Sign up').closest('a')

        expect(signInLink).toHaveAttribute('href', '/auth/login')
        expect(signUpLink).toHaveAttribute('href', '/auth/sign-up')
    })

    test('applies correct styling classes to authenticated user view', async () => {
        // Mock authenticated user
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({
                    data: {
                        claims: {
                            email: 'analyst@abaco.finance',
                            sub: '123',
                        },
                    },
                }),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        const { container } = render(await AuthButton())

        const userContainer = container.querySelector('.flex.items-center.gap-4')
        expect(userContainer).toBeInTheDocument()
    })

    test('applies correct styling classes to unauthenticated user view', async () => {
        // Mock unauthenticated user
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockResolvedValue({
                    data: {
                        claims: null,
                    },
                }),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        const { container } = render(await AuthButton())

        const buttonContainer = container.querySelector('.flex.gap-2')
        expect(buttonContainer).toBeInTheDocument()
    })

    test('handles Supabase client creation errors gracefully', async () => {
        // Mock Supabase client creation error
        mockCreateClient.mockRejectedValue(new Error('Failed to create client'))

        await expect(AuthButton()).rejects.toThrow('Failed to create client')
    })

    test('handles getClaims errors gracefully', async () => {
        // Mock getClaims error
        const mockClient = {
            auth: {
                getClaims: jest.fn().mockRejectedValue(new Error('Failed to get claims')),
            },
        }
        mockCreateClient.mockResolvedValue(mockClient)

        await expect(AuthButton()).rejects.toThrow('Failed to get claims')
    })
})