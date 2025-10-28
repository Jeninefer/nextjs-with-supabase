import { LoginForm } from '@/components/login-form'
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

// Mock Next.js Link
jest.mock('next/link', () => {
    return function MockLink({ children, href, ...props }: any) {
        return <a href={href} {...props}>{children}</a>
    }
})

// Mock Supabase client
const mockSignInWithPassword = jest.fn()
const mockSupabaseClient = {
    auth: {
        signInWithPassword: mockSignInWithPassword,
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

describe('LoginForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders login form with all elements', () => {
        render(<LoginForm />)

        expect(screen.getByText('Login')).toBeInTheDocument()
        expect(screen.getByText('Enter your email below to login to your account')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
        expect(screen.getByText('Forgot your password?')).toBeInTheDocument()
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
        expect(screen.getByText('Sign up')).toBeInTheDocument()
    })

    test('updates email and password fields when user types', async () => {
        const user = userEvent.setup()
        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement

        await user.type(emailInput, 'analyst@abaco.finance')
        await user.type(passwordInput, 'password123')

        expect(emailInput.value).toBe('analyst@abaco.finance')
        expect(passwordInput.value).toBe('password123')
    })

    test('submits form with correct credentials and redirects on success', async () => {
        const user = userEvent.setup()
        mockSignInWithPassword.mockResolvedValue({ error: null })

        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Login' })

        await user.type(emailInput, 'analyst@abaco.finance')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        expect(mockSignInWithPassword).toHaveBeenCalledWith({
            email: 'analyst@abaco.finance',
            password: 'password123',
        })

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/protected')
        })
    })

    test('displays error message when login fails', async () => {
        const user = userEvent.setup()
        const errorMessage = 'Invalid email or password'
        mockSignInWithPassword.mockResolvedValue({ error: { message: errorMessage } })

        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Login' })

        await user.type(emailInput, 'analyst@abaco.finance')
        await user.type(passwordInput, 'wrongpassword')
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
        mockSignInWithPassword.mockReturnValue(pendingPromise)

        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Login' })

        await user.type(emailInput, 'analyst@abaco.finance')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        // Button should show loading state
        expect(screen.getByText('Logging in...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()

        // Resolve the promise
        resolvePromise!({ error: null })

        await waitFor(() => {
            expect(screen.getByText('Login')).toBeInTheDocument()
            expect(submitButton).not.toBeDisabled()
        })
    })

    test('prevents form submission when required fields are empty', () => {
        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')

        expect(emailInput).toHaveAttribute('required')
        expect(passwordInput).toHaveAttribute('required')
    })

    test('has correct links for forgot password and sign up', () => {
        render(<LoginForm />)

        const forgotPasswordLink = screen.getByText('Forgot your password?').closest('a')
        const signUpLink = screen.getByText('Sign up').closest('a')

        expect(forgotPasswordLink).toHaveAttribute('href', '/auth/forgot-password')
        expect(signUpLink).toHaveAttribute('href', '/auth/sign-up')
    })

    test('applies custom className prop', () => {
        const customClass = 'custom-login-form'
        const { container } = render(<LoginForm className={customClass} />)

        const formContainer = container.firstChild as HTMLElement
        expect(formContainer).toHaveClass(customClass)
    })

    test('handles non-Error exceptions gracefully', async () => {
        const user = userEvent.setup()
        mockSignInWithPassword.mockRejectedValue('String error')

        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Login' })

        await user.type(emailInput, 'analyst@abaco.finance')
        await user.type(passwordInput, 'password123')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
        })
    })

    test('clears error message on new submission attempt', async () => {
        const user = userEvent.setup()
        // First submission with error
        mockSignInWithPassword.mockResolvedValueOnce({ error: { message: 'First error' } })

        render(<LoginForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: 'Login' })

        await user.type(emailInput, 'analyst@abaco.finance')
        await user.type(passwordInput, 'wrongpassword')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('First error')).toBeInTheDocument()
        })

        // Second submission should clear the error initially
        mockSignInWithPassword.mockResolvedValueOnce({ error: null })

        await user.click(submitButton)

        // Error should be cleared during the loading state
        await waitFor(() => {
            expect(screen.queryByText('First error')).not.toBeInTheDocument()
        })
    })

    test('form submission prevents default browser behavior', async () => {
        mockSignInWithPassword.mockResolvedValue({ error: null })

        render(<LoginForm />)

        const form = screen.getByRole('button', { name: 'Login' }).closest('form')!
        const preventDefault = jest.fn()

        fireEvent.submit(form, { preventDefault })

        expect(preventDefault).toHaveBeenCalled()
    })
})