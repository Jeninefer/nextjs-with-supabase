import { LogoutButton } from '@/components/logout-button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js router
const mockPush = jest.fn()
const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
}

jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
}))

// Mock Supabase client
const mockSignOut = jest.fn()
const mockSupabaseClient = {
    auth: {
        signOut: mockSignOut,
    },
}

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabaseClient,
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, ...props }: any) => (
        <button onClick={onClick} {...props}>
            {children}
        </button>
    ),
}))

describe('LogoutButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders logout button with text', () => {
        render(<LogoutButton />)

        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    })

    test('signs out user and redirects to login on button click', async () => {
        const user = userEvent.setup({ delay: null })
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        await user.click(logoutButton)

        expect(mockSignOut).toHaveBeenCalled()

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/login')
        })
    })

    test('calls signOut method on Supabase client', async () => {
        const user = userEvent.setup({ delay: null })
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        await user.click(logoutButton)

        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalledTimes(1)
        })
    })

    test('button is clickable and functional', () => {
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        expect(logoutButton).toBeEnabled()

        fireEvent.click(logoutButton)

        expect(mockSignOut).toHaveBeenCalled()
    })

    test('handles signOut successfully', async () => {
        const user = userEvent.setup({ delay: null })
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        await user.click(logoutButton)

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/login')
        })
    })

    test('calls signOut only once per click', async () => {
        const user = userEvent.setup({ delay: null })
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        await user.click(logoutButton)

        // Should call signOut exactly once
        await waitFor(() => {
            expect(mockSignOut).toHaveBeenCalledTimes(1)
        })
    })

    test('button remains visible and functional after render', () => {
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        expect(logoutButton).toBeVisible()
        expect(logoutButton).not.toBeDisabled()
    })

    test('multiple clicks are handled correctly', async () => {
        const user = userEvent.setup({ delay: null })
        mockSignOut.mockResolvedValue({ error: null })

        render(<LogoutButton />)

        const logoutButton = screen.getByRole('button', { name: 'Logout' })

        await user.click(logoutButton)
        await user.click(logoutButton)

        // Both clicks should attempt logout
        expect(mockSignOut).toHaveBeenCalledTimes(2)
    })
})