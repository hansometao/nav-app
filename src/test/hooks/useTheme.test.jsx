import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ThemeProvider, useTheme, THEMES } from '../../hooks/useTheme';

const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>;

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should default to dark theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe(THEMES.DARK);
  });

  it('should toggle theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe(THEMES.LIGHT);
    expect(document.documentElement.getAttribute('data-theme')).toBe(THEMES.LIGHT);
  });

  it('should set light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setLightTheme();
    });

    expect(result.current.theme).toBe(THEMES.LIGHT);
  });

  it('should set dark theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setDarkTheme();
    });

    expect(result.current.theme).toBe(THEMES.DARK);
  });

  it('should save theme to localStorage', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.setLightTheme();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('nav_app_theme', THEMES.LIGHT);
  });

  it('should load theme from localStorage', () => {
    localStorage.getItem.mockReturnValue(THEMES.LIGHT);

    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBe(THEMES.LIGHT);
  });
});
