import { UpdatePasswordForm } from '@/components/update-password-form'
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
const mockUpdateUser = jest.fn()
const mockSupabaseClient = {
    auth: {
        updateUser: mockUpdateUser,
    },
}

jest.mock('@/lib/supabase/client', () => ({
    createClient: () => mockSupabaseClient,
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, disabled, type, className, ...props }: any) => (
        <button disabled={disabled} type={type} className={className} {...props}>
            {children}
        </button>
    ),
}))

jest.mock('@/components/ui/card', () => ({
    Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
    CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
    CardDescription: ({ children, ...props }: any) => <div data-testid="card-description" {...props}>{children}</div>,
    CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
    CardTitle: ({ children, className, ...props }: any) => <h1 className={className} {...props}>{children}</h1>,
}))

jest.mock('@/components/ui/input', () => ({
    Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor, ...props }: any) => <label htmlFor={htmlFor} {...props}>{children}</label>,
}))

describe('UpdatePasswordForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders update password form with all elements', () => {
        render(<UpdatePasswordForm />)

        expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
        expect(screen.getByText('Please enter your new password below.')).toBeInTheDocument()
        expect(screen.getByLabelText('New password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Save new password' })).toBeInTheDocument()
    })

    test('updates password field when user types', async () => {
        const user = userEvent.setup({ delay: null })
        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password') as HTMLInputElement

        await user.type(passwordInput, 'NewSecurePassword123!')

        expect(passwordInput.value).toBe('NewSecurePassword123!')
    })

    test('submits form with new password and redirects on success', async () => {
        const user = userEvent.setup({ delay: null })
        mockUpdateUser.mockResolvedValue({ error: null })

        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await user.type(passwordInput, 'NewSecurePassword123!')
        await user.click(submitButton)

        expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewSecurePassword123!' })

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/protected')
        })
    })

    test('displays error message when password update fails', async () => {
        const user = userEvent.setup({ delay: null })
        const errorMessage = 'Password update failed'
        mockUpdateUser.mockResolvedValue({ error: { message: errorMessage } })

        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await user.type(passwordInput, 'NewSecurePassword123!')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })
    })

    test('shows loading state during form submission', async () => {
        const user = userEvent.setup({ delay: null })
        let resolvePromise: (value: any) => void
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve
        })
        mockUpdateUser.mockReturnValue(pendingPromise)

        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await user.type(passwordInput, 'NewSecurePassword123!')
        await user.click(submitButton)

        // Button should show loading state
        expect(screen.getByText('Saving...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()

        // Resolve the promise
        resolvePromise!({ error: null })

        await waitFor(() => {
            expect(screen.getByText('Save new password')).toBeInTheDocument()
            expect(submitButton).not.toBeDisabled()
        })
    })

    test('prevents form submission when password field is empty', () => {
        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password')

        expect(passwordInput).toHaveAttribute('required')
    })

    test('applies custom className prop', () => {
        const customClass = 'custom-update-password'
        const { container } = render(<UpdatePasswordForm className={customClass} />)

        const formContainer = container.firstChild as HTMLElement
        expect(formContainer).toHaveClass(customClass)
    })

    test('handles non-Error exceptions gracefully', async () => {
        const user = userEvent.setup({ delay: null })
        mockUpdateUser.mockRejectedValue('String error')

        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await user.type(passwordInput, 'NewSecurePassword123!')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
        })
    })

    test('clears error message on new submission attempt', async () => {
        const user = userEvent.setup({ delay: null })
        // First submission with error
        mockUpdateUser.mockResolvedValueOnce({ error: { message: 'First error' } })

        render(<UpdatePasswordForm />)

        const passwordInput = screen.getByLabelText('New password')
        const submitButton = screen.getByRole('button', { name: 'Save new password' })

        await user.type(passwordInput, 'NewSecurePassword123!')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('First error')).toBeInTheDocument()
        })

        // Second submission should clear the error initially
        mockUpdateUser.mockResolvedValueOnce({ error: null })

        await user.click(submitButton)

        // Error should be cleared during the loading state
        await waitFor(() => {
            expect(screen.queryByText('First error')).not.toBeInTheDocument()
        })
    })

    test('form submission prevents default browser behavior', async () => {
        mockUpdateUser.mockResolvedValue({ error: null })

        render(<UpdatePasswordForm />)

        const form = screen.getByRole('button', { name: 'Save new password' }).closest('form')!
        const preventDefault = jest.fn()

        fireEvent.submit(form, { preventDefault })

        expect(preventDefault).toHaveBeenCalled()
    })
})