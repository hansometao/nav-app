import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  analyzeError,
  getErrorMessage,
  fetchWithTimeout,
  withRetry,
  apiRequest,
  ErrorTypes,
} from '../../utils/apiErrorHandler';

describe('apiErrorHandler', () => {
  describe('ErrorTypes', () => {
    it('should have correct error type constants', () => {
      expect(ErrorTypes.NETWORK).toBe('network');
      expect(ErrorTypes.TIMEOUT).toBe('timeout');
      expect(ErrorTypes.SERVER).toBe('server');
      expect(ErrorTypes.CLIENT).toBe('client');
      expect(ErrorTypes.UNKNOWN).toBe('unknown');
    });
  });

  describe('analyzeError', () => {
    it('should return UNKNOWN for null error', () => {
      expect(analyzeError(null)).toBe(ErrorTypes.UNKNOWN);
    });

    it('should return UNKNOWN for undefined error', () => {
      expect(analyzeError(undefined)).toBe(ErrorTypes.UNKNOWN);
    });

    it('should detect network errors', () => {
      const error = new TypeError('Failed to fetch');
      expect(analyzeError(error)).toBe(ErrorTypes.NETWORK);
    });

    it('should detect timeout errors', () => {
      const error = new DOMException('The user aborted a request', 'AbortError');
      expect(analyzeError(error)).toBe(ErrorTypes.TIMEOUT);
    });

    it('should detect timeout errors from message', () => {
      const error = new Error('timeout');
      expect(analyzeError(error)).toBe(ErrorTypes.TIMEOUT);
    });

    it('should detect server errors (5xx)', () => {
      const error = new Error('Server error');
      error.status = 500;
      expect(analyzeError(error)).toBe(ErrorTypes.SERVER);
    });

    it('should detect client errors (4xx)', () => {
      const error = new Error('Bad request');
      error.status = 400;
      expect(analyzeError(error)).toBe(ErrorTypes.CLIENT);
    });

    it('should return UNKNOWN for unrecognized errors', () => {
      const error = new Error('Some other error');
      expect(analyzeError(error)).toBe(ErrorTypes.UNKNOWN);
    });
  });

  describe('getErrorMessage', () => {
    it('should return network error message', () => {
      const error = new TypeError('Failed to fetch');
      expect(getErrorMessage(error)).toBe('网络连接失败，请检查网络设置');
    });

    it('should return timeout error message', () => {
      const error = new DOMException('The user aborted a request', 'AbortError');
      expect(getErrorMessage(error)).toBe('请求超时，请稍后重试');
    });

    it('should return server error message', () => {
      const error = new Error('Server error');
      error.status = 500;
      expect(getErrorMessage(error)).toBe('服务器暂时不可用，请稍后重试');
    });

    it('should return client error message', () => {
      const error = new Error('Bad request');
      error.status = 400;
      expect(getErrorMessage(error)).toBe('请求参数错误');
    });

    it('should return unknown error message for unrecognized errors', () => {
      const error = new Error('Some other error');
      expect(getErrorMessage(error)).toBe('发生未知错误，请稍后重试');
    });

    it('should return fallback message when provided', () => {
      const error = new Error('Some error');
      expect(getErrorMessage(error, 'Custom error message')).toBe('Custom error message');
    });
  });

  describe('fetchWithTimeout', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return a promise', () => {
      const result = fetchWithTimeout('http://example.com');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should accept custom timeout', () => {
      const result = fetchWithTimeout('http://example.com', {}, 5000);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, 2, 100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(result).toBe('success');
    });

    it('should retry on failure', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('first failure'))
        .mockRejectedValueOnce(new Error('second failure'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, 2, 10);

      expect(fn).toHaveBeenCalledTimes(3);
      expect(result).toBe('success');
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('failure'));

      await expect(withRetry(fn, 2, 10)).rejects.toThrow('failure');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry on client errors', async () => {
      const error = new Error('Client error');
      error.status = 400;
      const fn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(fn, 2, 100)).rejects.toThrow('Client error');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});