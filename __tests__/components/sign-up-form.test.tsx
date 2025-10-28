import { SignUpForm } from '@/components/sign-up-form'
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
const mockSignUp = jest.fn()
const mockSupabaseClient = {
    auth: {
        signUp: mockSignUp,
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

describe('SignUpForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders sign up form with all elements', () => {
        render(<SignUpForm />)

        expect(screen.getByText('Sign up')).toBeInTheDocument()
        expect(screen.getByText('Create a new account')).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByLabelText('Repeat Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
        expect(screen.getByText('Already have an account?')).toBeInTheDocument()
        expect(screen.getByText('Login')).toBeInTheDocument()
    })

    test('updates email, password, and repeat password fields when user types', async () => {
        const user = userEvent.setup({ delay: null })
        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
        const repeatPasswordInput = screen.getByLabelText('Repeat Password') as HTMLInputElement

        await user.type(emailInput, 'newuser@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'SecurePassword123!')

        expect(emailInput.value).toBe('newuser@abaco.finance')
        expect(passwordInput.value).toBe('SecurePassword123!')
        expect(repeatPasswordInput.value).toBe('SecurePassword123!')
    })

    test('submits form with correct credentials and redirects on success', async () => {
        const user = userEvent.setup({ delay: null })
        mockSignUp.mockResolvedValue({ error: null })

        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')
        const submitButton = screen.getByRole('button', { name: 'Sign up' })

        await user.type(emailInput, 'newuser@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'SecurePassword123!')
        await user.click(submitButton)

        expect(mockSignUp).toHaveBeenCalledWith({
            email: 'newuser@abaco.finance',
            password: 'SecurePassword123!',
            options: {
                emailRedirectTo: expect.stringContaining('/protected'),
            },
        })

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/auth/sign-up-success')
        })
    })

    test('displays error when passwords do not match', async () => {
        const user = userEvent.setup({ delay: null })
        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')
        const submitButton = screen.getByRole('button', { name: 'Sign up' })

        await user.type(emailInput, 'newuser@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'DifferentPassword123!')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
        })

        expect(mockSignUp).not.toHaveBeenCalled()
    })

    test('displays error message when sign up fails', async () => {
        const user = userEvent.setup({ delay: null })
        const errorMessage = 'User already exists'
        mockSignUp.mockResolvedValue({ error: { message: errorMessage } })

        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')
        const submitButton = screen.getByRole('button', { name: 'Sign up' })

        await user.type(emailInput, 'existing@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'SecurePassword123!')
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
        mockSignUp.mockReturnValue(pendingPromise)

        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')
        const submitButton = screen.getByRole('button', { name: 'Sign up' })

        await user.type(emailInput, 'newuser@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'SecurePassword123!')
        await user.click(submitButton)

        // Button should show loading state
        expect(screen.getByText('Creating an account...')).toBeInTheDocument()
        expect(submitButton).toBeDisabled()

        // Resolve the promise
        resolvePromise!({ error: null })

        await waitFor(() => {
            expect(screen.getByText('Sign up')).toBeInTheDocument()
            expect(submitButton).not.toBeDisabled()
        })
    })

    test('prevents form submission when required fields are empty', () => {
        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')

        expect(emailInput).toHaveAttribute('required')
        expect(passwordInput).toHaveAttribute('required')
        expect(repeatPasswordInput).toHaveAttribute('required')
    })

    test('has correct link for login page', () => {
        render(<SignUpForm />)

        const loginLink = screen.getByText('Login').closest('a')
        expect(loginLink).toHaveAttribute('href', '/auth/login')
    })

    test('applies custom className prop', () => {
        const customClass = 'custom-signup-form'
        const { container } = render(<SignUpForm className={customClass} />)

        const formContainer = container.firstChild as HTMLElement
        expect(formContainer).toHaveClass(customClass)
    })

    test('handles non-Error exceptions gracefully', async () => {
        const user = userEvent.setup()
        mockSignUp.mockRejectedValue('String error')

        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')
        const submitButton = screen.getByRole('button', { name: 'Sign up' })

        await user.type(emailInput, 'newuser@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'SecurePassword123!')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('An error occurred')).toBeInTheDocument()
        })
    })

    test('clears error message on new submission attempt', async () => {
        const user = userEvent.setup()
        // First submission with error
        mockSignUp.mockResolvedValueOnce({ error: { message: 'First error' } })

        render(<SignUpForm />)

        const emailInput = screen.getByLabelText('Email')
        const passwordInput = screen.getByLabelText('Password')
        const repeatPasswordInput = screen.getByLabelText('Repeat Password')
        const submitButton = screen.getByRole('button', { name: 'Sign up' })

        await user.type(emailInput, 'newuser@abaco.finance')
        await user.type(passwordInput, 'SecurePassword123!')
        await user.type(repeatPasswordInput, 'SecurePassword123!')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('First error')).toBeInTheDocument()
        })

        // Second submission should clear the error initially
        mockSignUp.mockResolvedValueOnce({ error: null })

        await user.click(submitButton)

        // Error should be cleared during the loading state
        await waitFor(() => {
            expect(screen.queryByText('First error')).not.toBeInTheDocument()
        })
    })

    test('form submission prevents default browser behavior', async () => {
        mockSignUp.mockResolvedValue({ error: null })

        render(<SignUpForm />)

        const form = screen.getByRole('button', { name: 'Sign up' }).closest('form')!
        const preventDefault = jest.fn()

        fireEvent.submit(form, { preventDefault })

        expect(preventDefault).toHaveBeenCalled()
    })
})