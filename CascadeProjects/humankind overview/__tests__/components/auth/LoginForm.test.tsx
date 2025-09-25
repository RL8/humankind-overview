import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import LoginForm from '@/components/auth/LoginForm'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('LoginForm', () => {
  const mockLogin = jest.fn()
  const mockClearError = jest.fn()
  const mockOnSuccess = jest.fn()
  const mockOnRegisterClick = jest.fn()
  const mockOnForgotPasswordClick = jest.fn()

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      clearError: mockClearError
    })
    
    jest.clearAllMocks()
  })

  test('renders login form correctly', () => {
    render(<LoginForm />)
    
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument()
  })

  test('displays validation errors for empty fields', async () => {
    render(<LoginForm />)
    
    const form = screen.getByTestId('login-form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
    
    expect(mockLogin).not.toHaveBeenCalled()
  })

  test('displays validation error for invalid email', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const form = screen.getByTestId('login-form')
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
    
    expect(mockLogin).not.toHaveBeenCalled()
  })

  test('submits form with valid data', async () => {
    mockLogin.mockResolvedValue(true)
    
    render(<LoginForm onSuccess={mockOnSuccess} />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
    
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('displays auth error from context', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: 'Invalid credentials',
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      clearError: mockClearError
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  test('shows loading state during login', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      login: mockLogin,
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      clearError: mockClearError
    })
    
    render(<LoginForm />)
    
    expect(screen.getByText('Signing In...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })

  test('calls register click handler', () => {
    render(<LoginForm onRegisterClick={mockOnRegisterClick} />)
    
    const registerLink = screen.getByText('Sign up')
    fireEvent.click(registerLink)
    
    expect(mockOnRegisterClick).toHaveBeenCalled()
  })

  test('calls forgot password click handler', () => {
    render(<LoginForm onForgotPasswordClick={mockOnForgotPasswordClick} />)
    
    const forgotPasswordLink = screen.getByText('Forgot your password?')
    fireEvent.click(forgotPasswordLink)
    
    expect(mockOnForgotPasswordClick).toHaveBeenCalled()
  })

  test('clears field errors when user starts typing', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText('Email Address')
    const form = screen.getByTestId('login-form')
    
    // Trigger validation error
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
    })
    
    // Start typing to clear error
    fireEvent.change(emailInput, { target: { value: 'test' } })
    
    await waitFor(() => {
      expect(screen.queryByText('Email is required')).not.toBeInTheDocument()
    })
  })
})
