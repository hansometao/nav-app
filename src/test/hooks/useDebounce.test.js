import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useThrottle } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on multiple rapid changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'first' },
    });

    rerender({ value: 'second' });
    rerender({ value: 'third' });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe('third');
  });

  it('should use default delay of 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback invocations', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current();
    result.current();
    result.current();

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current('arg1', 'arg2');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should clear timeout on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

    result.current();
    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should throttle callback invocations', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, 300));

    result.current();
    result.current();
    result.current();

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    result.current();
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    result.current();
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should use default limit of 300ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback));

    result.current();
    act(() => vi.advanceTimersByTime(200));
    result.current();

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(150));
    result.current();

    expect(callback).toHaveBeenCalledTimes(2);
  });
});