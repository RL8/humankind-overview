import { validatePassword, validateEmail, UserRole } from '@/lib/auth'

describe('Auth Utilities', () => {
  describe('validateEmail', () => {
    test('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    test('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test.example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    test('should return no errors for valid passwords', () => {
      const errors = validatePassword('ValidPass123!')
      expect(errors).toHaveLength(0)
    })

    test('should return error for password too short', () => {
      const errors = validatePassword('Short1!')
      expect(errors).toContain('Password must be at least 8 characters long')
    })

    test('should return error for password without lowercase', () => {
      const errors = validatePassword('UPPERCASE123!')
      expect(errors).toContain('Password must contain at least one lowercase letter')
    })

    test('should return error for password without uppercase', () => {
      const errors = validatePassword('lowercase123!')
      expect(errors).toContain('Password must contain at least one uppercase letter')
    })

    test('should return error for password without number', () => {
      const errors = validatePassword('ValidPassword!')
      expect(errors).toContain('Password must contain at least one number')
    })

    test('should return error for password without special character', () => {
      const errors = validatePassword('ValidPass123')
      expect(errors).toContain('Password must contain at least one special character (@$!%*?&)')
    })

    test('should return multiple errors for invalid password', () => {
      const errors = validatePassword('short')
      expect(errors.length).toBeGreaterThan(1)
      expect(errors).toContain('Password must be at least 8 characters long')
      expect(errors).toContain('Password must contain at least one uppercase letter')
      expect(errors).toContain('Password must contain at least one number')
      expect(errors).toContain('Password must contain at least one special character (@$!%*?&)')
    })
  })

  describe('UserRole', () => {
    test('should have correct role values', () => {
      expect(UserRole.COMPOSER).toBe('composer')
      expect(UserRole.PRINCIPAL).toBe('principal')
      expect(UserRole.CLIENT).toBe('client')
      expect(UserRole.ADMIN).toBe('admin')
    })

    test('should contain all expected roles', () => {
      const roles = Object.values(UserRole)
      expect(roles).toContain('composer')
      expect(roles).toContain('principal')
      expect(roles).toContain('client')
      expect(roles).toContain('admin')
      expect(roles).toHaveLength(4)
    })
  })
})
