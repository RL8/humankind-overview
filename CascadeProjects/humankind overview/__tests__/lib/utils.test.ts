import { 
  formatDate, 
  formatDateTime, 
  capitalize, 
  truncateText, 
  generateSlug, 
  isValidEmail,
  cn 
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = '2024-01-15T10:30:00Z'
      const formatted = formatDate(date)
      expect(formatted).toBe('January 15, 2024')
    })

    it('formats Date object correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toBe('January 15, 2024')
    })
  })

  describe('formatDateTime', () => {
    it('formats datetime string correctly', () => {
      const date = '2024-01-15T10:30:00Z'
      const formatted = formatDateTime(date)
      expect(formatted).toMatch(/Jan 15, 2024/)
    })
  })

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
      expect(capitalize('HELLO')).toBe('HELLO')
      expect(capitalize('')).toBe('')
    })
  })

  describe('truncateText', () => {
    it('truncates text when longer than max length', () => {
      const text = 'This is a very long text that should be truncated'
      expect(truncateText(text, 20)).toBe('This is a very long ...')
    })

    it('returns original text when shorter than max length', () => {
      const text = 'Short text'
      expect(truncateText(text, 20)).toBe('Short text')
    })
  })

  describe('generateSlug', () => {
    it('generates slug from text', () => {
      expect(generateSlug('Hello World!')).toBe('hello-world')
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces')
      expect(generateSlug('Special@Characters#')).toBe('specialcharacters')
    })
  })

  describe('isValidEmail', () => {
    it('validates email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@invalid.com')).toBe(false)
    })
  })

  describe('cn (className utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })
  })
})

