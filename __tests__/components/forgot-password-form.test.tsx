import { ForgotPasswordForm } from '@/components/forgot-password-form'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js Link
jest.mock('next/link', () => {
    return function MockLink({ children, href, ...props }: any) {
        return <a href={href} {...props}>{children}</a>
    }
})

// Mock Supabase client
const mockResetPasswordForEmail = jest.fn()
const mockSupabaseClient = {
    auth: {
        resetPasswordForEmail: mockResetPasswordForEmail,
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

describe('ForgotPasswordForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders forgot password form with all elements', () => {
        render(<ForgotPasswordForm />)

        expect(screen.getByText('Reset Your Password')).toBeInTheDocument()
        expect(screen.getByText("Type in your email and we'll send you a link to reset your password")).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Send reset email' })).toBeInTheDocument()
        expect(screen.getByText('Already have an account?')).toBeInTheDocument()
        expect(screen.getByText('Login')).toBeInTheDocument()
    })

    test('updates email field when user types', async () => {
        const user = userEvent.setup()
        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement

        await user.type(emailInput, 'user@abaco.finance')

        expect(emailInput.value).toBe('user@abaco.finance')
    })

    test('sends reset password email on successful submission', async () => {
        const user = userEvent.setup()
        mockResetPasswordForEmail.mockResolvedValue({ error: null })

        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: 'Send reset email' })

        await user.type(emailInput, 'user@abaco.finance')
        await user.click(submitButton)

        expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
            'user@abaco.finance',
            {
                redirectTo: expect.stringContaining('/auth/update-password'),
            }
        )

        await waitFor(() => {
            expect(screen.getByText('Check Your Email')).toBeInTheDocument()
            expect(screen.getByText('Password reset instructions sent')).toBeInTheDocument()
        })
    })

    test('displays success message after sending reset email', async () => {
        const user = userEvent.setup()
        mockResetPasswordForEmail.mockResolvedValue({ error: null })

        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: 'Send reset email' })

        await user.type(emailInput, 'user@abaco.finance')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Check Your Email')).toBeInTheDocument()
            expect(screen.getByText('If you registered using your email and password, you will receive a password reset email.')).toBeInTheDocument()
        })
    })

    test('displays error message when reset password fails', async () => {
        const user = userEvent.setup()
        const errorMessage = 'User not found'
        mockResetPasswordForEmail.mockResolvedValue({ error: { message: errorMessage } })

        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: 'Send reset email' })

        await user.type(emailInput, 'nonexistent@abaco.finance')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument()
        })
    })

    test('shows loading state during form submission', async () => {
        const user = userEvent.setup()
        let resolvePromise: (value: any) => void
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve
        })
        mockResetPasswordForEmail.mockReturnValue(pendingPromise)

        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: 'Send reset email' })

        await user.type(emailInput, 'user@abaco.finance')
        await user.click(submitButton)

        // Button should show loading state
        expect(screen.getByText('Sending...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()

        // Resolve the promise
        resolvePromise!({ error: null })

        await waitFor(() => {
            expect(screen.getByText('Check Your Email')).toBeInTheDocument()
        })
    })

    test('prevents form submission when email field is empty', () => {
        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email')

        expect(emailInput).toHaveAttribute('required')
    })

    test('has correct link for login page', () => {
        render(<ForgotPasswordForm />)

        const loginLink = screen.getByText('Login').closest('a')
        expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    test('applies custom className prop', () => {
        const customClass = 'custom-forgot-password'
        const { container } = render(<ForgotPasswordForm className={customClass} />)

        const formContainer = container.firstChild as HTMLElement
        expect(formContainer).toHaveClass(customClass)
    })

    test('handles non-Error exceptions gracefully', async () => {
        const user = userEvent.setup()
        mockResetPasswordForEmail.mockRejectedValue('String error')

        render(<ForgotPasswordForm />)

        const emailInput = screen.getByLabelText('Email')
        const submitButton = screen.getByRole('button', { name: 'Send reset email' })

        await user.type(emailInput, 'user@abaco.finance')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
        })
    })

    test('form submission prevents default browser behavior', async () => {
        mockResetPasswordForEmail.mockResolvedValue({ error: null })

        render(<ForgotPasswordForm />)

        const form = screen.getByRole('button', { name: 'Send reset email' }).closest('form')!
        const preventDefault = jest.fn()

        fireEvent.submit(form, { preventDefault })

        expect(preventDefault).toHaveBeenCalled()
    })
})