import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 防抖和节流相关的自定义 Hooks
 * @module hooks/useDebounce
 */

/**
 * 创建一个防抖值，延迟更新直到指定时间内没有新的变化
 * @param {any} value - 需要防抖的值
 * @param {number} [delay=300] - 延迟时间（毫秒）
 * @returns {any} - 防抖后的值
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 300);
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
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * 节流 Hook
 * @param {Function} callback - 需要节流的回调函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} - 节流后的回调函数
 */
export function useThrottle(callback, limit = 300) {
  const lastRunRef = useRef(0);

  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastRunRef.current >= limit) {
        lastRunRef.current = now;
        callback(...args);
      }
    },
    [callback, limit]
  );

  return throttledCallback;
}
