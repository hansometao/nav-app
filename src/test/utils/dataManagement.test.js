import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportAllData, importData, clearAllData } from '../../utils/dataManagement'
import { STORAGE_KEYS } from '../../config/storage'

describe('Data Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  describe('exportAllData', () => {
    it('should export all data to JSON file', () => {
      // Mock localStorage data
      localStorage.getItem.mockImplementation((key) => {
        const data = {
          [STORAGE_KEYS.TODO]: JSON.stringify([{ id: 1, text: 'Test' }]),
          [STORAGE_KEYS.BOOKMARKS]: JSON.stringify([{ id: 1, name: 'Google', url: 'https://google.com' }]),
        }
        return data[key] || null
      })

      const result = exportAllData()
      expect(result).toBe(true)
    })

    it('should handle empty localStorage', () => {
      localStorage.getItem.mockReturnValue(null)
      
      const result = exportAllData()
      expect(result).toBe(true)
    })
  })

  describe('importData', () => {
    it('should import valid data file', async () => {
      const validData = {
        appName: 'nav-app',
        version: '1.0',
        data: {
          [STORAGE_KEYS.TODO]: [{ id: 1, text: 'Test' }],
        },
      }

      const file = new File([JSON.stringify(validData)], 'backup.json', {
        type: 'application/json',
      })

      const result = await importData(file)
      expect(result.success).toBe(true)
      expect(result.count).toBe(1)
    })

    it('should reject invalid app name', async () => {
      const invalidData = {
        appName: 'wrong-app',
        data: {},
      }

      const file = new File([JSON.stringify(invalidData)], 'backup.json', {
        type: 'application/json',
      })

      await expect(importData(file)).rejects.toThrow('无效的备份文件格式')
    })

    it('should reject malformed JSON', async () => {
      const file = new File(['not valid json'], 'backup.json', {
        type: 'application/json',
      })

      await expect(importData(file)).rejects.toThrow('文件解析失败')
    })
  })

  describe('clearAllData', () => {
    it('should clear all data when confirmed', () => {
      window.confirm.mockReturnValue(true)
      
      clearAllData()
      
      // Should have called removeItem for each key
      expect(localStorage.removeItem).toHaveBeenCalled()
    })

    it('should not clear data when cancelled', () => {
      window.confirm.mockReturnValue(false)
      
      clearAllData()
      
      expect(localStorage.removeItem).not.toHaveBeenCalled()
    })
  })
})