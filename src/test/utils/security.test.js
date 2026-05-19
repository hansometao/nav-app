import { describe, it, expect } from 'vitest'
import { validateBookmark, sanitizeHtml, isValidUrl, sanitizeText } from '../../utils/security'

describe('Security Utils', () => {
  describe('validateBookmark', () => {
    it('should validate a correct bookmark', () => {
      const bookmark = {
        name: 'Test Site',
        url: 'https://example.com',
        category: 'Test'
      }
      const result = validateBookmark(bookmark)
      expect(result).toEqual({
        name: 'Test Site',
        url: 'https://example.com',
        icon: '🔖',
        category: 'Test'
      })
    })

    it('should normalize URL without protocol', () => {
      const bookmark = {
        name: 'Test Site',
        url: 'example.com',
        category: 'Test'
      }
      const result = validateBookmark(bookmark)
      expect(result).toEqual({
        name: 'Test Site',
        url: 'https://example.com',
        icon: '🔖',
        category: 'Test'
      })
    })

    it('should return null for invalid URL', () => {
      const bookmark = {
        name: 'Test Site',
        url: 'not a valid url',
        category: 'Test'
      }
      const result = validateBookmark(bookmark)
      expect(result).toBeNull()
    })

    it('should return null for empty name', () => {
      const bookmark = {
        name: '',
        url: 'https://example.com',
        category: 'Test'
      }
      const result = validateBookmark(bookmark)
      expect(result).toBeNull()
    })

    it('should return null for missing fields', () => {
      expect(validateBookmark({})).toBeNull()
      expect(validateBookmark(null)).toBeNull()
      expect(validateBookmark(undefined)).toBeNull()
    })
  })

  describe('sanitizeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeHtml(input)
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Hello')
    })

    it('should handle special characters', () => {
      const input = '<div>Test & "quote"</div>'
      const result = sanitizeHtml(input)
      expect(result).toBe('&lt;div&gt;Test &amp; &quot;quote&quot;&lt;/div&gt;')
    })

    it('should return empty string for non-string input', () => {
      expect(sanitizeHtml(null)).toBe('')
      expect(sanitizeHtml(undefined)).toBe('')
      expect(sanitizeHtml(123)).toBe('')
    })
  })

  describe('sanitizeText', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello'
      const result = sanitizeText(input)
      expect(result).toBe('alert("xss")Hello')
    })

    it('should trim whitespace', () => {
      const input = '  Hello World  '
      const result = sanitizeText(input)
      expect(result).toBe('Hello World')
    })

    it('should return empty string for non-string input', () => {
      expect(sanitizeText(null)).toBe('')
      expect(sanitizeText(undefined)).toBe('')
    })
  })

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('https://sub.domain.com/path')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
    })
  })
})