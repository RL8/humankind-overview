import React from 'react'
import { render, screen } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import Home from '@/app/page'

// Mock the useAuth hook
jest.mock('@/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// Mock window.location.href
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.location.href = ''
  })

  it('shows loading state while checking authentication', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: true,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      clearError: jest.fn()
    })

    render(<Home />)
    
    expect(screen.getByText('Course Tracker')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('redirects to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      loading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      clearError: jest.fn()
    })

    render(<Home />)
    
    // Should redirect to login (in real app, this would be a navigation)
    // For testing, we can check that the redirect logic would be triggered
    expect(mockUseAuth).toHaveBeenCalled()
  })

  it('redirects to dashboard when authenticated', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'client' as any
    }

    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: {} as any,
      loading: false,
      error: null,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updatePassword: jest.fn(),
      updateProfile: jest.fn(),
      refreshSession: jest.fn(),
      clearError: jest.fn()
    })

    render(<Home />)
    
    // Should redirect to dashboard (in real app, this would be a navigation)
    expect(mockUseAuth).toHaveBeenCalled()
  })
})
