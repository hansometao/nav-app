import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGreeting } from '../../hooks/useGreeting';

describe('useGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "夜深了 🌙" between 00:00 and 05:59', () => {
    const date = new Date();
    date.setHours(2, 30, 0, 0);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useGreeting());
    expect(result.current).toBe('夜深了 🌙');
  });

  it('should return "早上好 🌅" between 06:00 and 08:59', () => {
    const date = new Date();
    date.setHours(7, 30, 0, 0);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useGreeting());
    expect(result.current).toBe('早上好 🌅');
  });

  it('should return "上午好 ☀️" between 09:00 and 11:59', () => {
    const date = new Date();
    date.setHours(10, 30, 0, 0);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useGreeting());
    expect(result.current).toBe('上午好 ☀️');
  });

  it('should return "中午好 🌞" between 12:00 and 13:59', () => {
    const date = new Date();
    date.setHours(13, 0, 0, 0);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useGreeting());
    expect(result.current).toBe('中午好 🌞');
  });

  it('should return "下午好 🌤" between 14:00 and 17:59', () => {
    const date = new Date();
    date.setHours(16, 30, 0, 0);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useGreeting());
    expect(result.current).toBe('下午好 🌤');
  });

  it('should return "晚上好 🌆" between 18:00 and 23:59', () => {
    const date = new Date();
    date.setHours(20, 30, 0, 0);
    vi.setSystemTime(date);

    const { result } = renderHook(() => useGreeting());
    expect(result.current).toBe('晚上好 🌆');
  });
});