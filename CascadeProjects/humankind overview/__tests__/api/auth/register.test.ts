/**
 * @jest-environment node
 */
import { POST } from '@/app/api/auth/register/route'
import { AuthService, UserRole } from '@/lib/auth'
import { NextRequest } from 'next/server'

// Mock the AuthService
jest.mock('@/lib/auth')
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should register user successfully', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
        role: UserRole.CLIENT,
        organization: 'Test Org'
      }
    }

    mockAuthService.register.mockResolvedValue({
      user: mockUser as any,
      error: null
    })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
        role: UserRole.CLIENT,
        organization: 'Test Org'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.message).toBe('Registration successful. Please check your email to confirm your account.')
    expect(data.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.CLIENT,
      organization: 'Test Org'
    })

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'ValidPass123!',
      name: 'Test User',
      role: UserRole.CLIENT,
      organization: 'Test Org'
    })
  })

  test('should return error for missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com'
        // Missing password, name, role
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Missing required fields: email, password, name, role')
    expect(mockAuthService.register).not.toHaveBeenCalled()
  })

  test('should return error for invalid role', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
        role: 'invalid-role'
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid role. Must be one of: composer, principal, client, admin')
    expect(mockAuthService.register).not.toHaveBeenCalled()
  })

  test('should return auth service error', async () => {
    mockAuthService.register.mockResolvedValue({
      user: null,
      error: {
        name: 'AuthError',
        message: 'Email already exists'
      } as any
    })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
        role: UserRole.CLIENT
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email already exists')
  })

  test('should handle registration without organization', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: {
        name: 'Test User',
        role: UserRole.COMPOSER
      }
    }

    mockAuthService.register.mockResolvedValue({
      user: mockUser as any,
      error: null
    })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
        role: UserRole.COMPOSER
        // No organization provided
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'ValidPass123!',
      name: 'Test User',
      role: UserRole.COMPOSER,
      organization: undefined
    })
  })

  test('should handle server errors', async () => {
    mockAuthService.register.mockRejectedValue(new Error('Database connection failed'))

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
        role: UserRole.CLIENT
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
