import { useState, useEffect, useCallback } from 'react';

/**
 * 防抖 Hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {any} - 防抖后的值
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 防抖回调 Hook
 * @param {Function} callback - 需要防抖的回调函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} - 防抖后的回调函数
 */
export function useDebouncedCallback(callback, delay = 300) {
  const [timeoutId, setTimeoutId] = useState(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );

  // 清理函数
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return debouncedCallback;
}

/**
 * 节流 Hook
 * @param {Function} callback - 需要节流的回调函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} - 节流后的回调函数
 */
export function useThrottle(callback, limit = 300) {
  const [lastRun, setLastRun] = useState(0);

  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRun >= limit) {
        setLastRun(now);
        callback(...args);
      }
    },
    [callback, lastRun, limit]
  );

  return throttledCallback;
}
