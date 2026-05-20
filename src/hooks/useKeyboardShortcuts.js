import { useEffect, useCallback } from 'react';

/**
 * 键盘快捷键相关的自定义 Hooks
 * @module hooks/useKeyboardShortcuts
 */

/** @constant {Object} SHORTCUTS - 快捷键配置映射 */
const SHORTCUTS = {
  'Ctrl+K': { action: 'focusSearch', description: '聚焦搜索框' },
  'Ctrl+D': { action: 'toggleTheme', description: '切换主题' },
  Escape: { action: 'closeModal', description: '关闭弹窗' },
  '?': { action: 'showHelp', description: '显示快捷键帮助' },
};

/**
 * 全局键盘快捷键监听 Hook
 * @param {Object} handlers - 快捷键处理函数映射
 * @param {Function} [handlers.focusSearch] - 聚焦搜索框的回调
 * @param {Function} [handlers.toggleTheme] - 切换主题的回调
 * @param {Function} [handlers.closeModal] - 关闭弹窗的回调
 * @param {Function} [handlers.showHelp] - 显示帮助的回调
 * @example
 * useKeyboardShortcuts({
 *   focusSearch: () => inputRef.current?.focus(),
 *   toggleTheme: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark'),
 * });
 */
export function useKeyboardShortcuts(handlers = {}) {
  const handleKeyDown = useCallback(
    e => {
      const key = [];

      if (e.ctrlKey || e.metaKey) key.push('Ctrl');
      if (e.shiftKey) key.push('Shift');
      if (e.altKey) key.push('Alt');

      if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
        key.push(e.key.toUpperCase());
      }

      const shortcut = key.join('+');
      const shortcutInfo = SHORTCUTS[shortcut];

      if (shortcutInfo && handlers[shortcutInfo.action]) {
        e.preventDefault();
        handlers[shortcutInfo.action]();
      }

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (handlers.showHelp) {
          handlers.showHelp();
        }
      }
    },
    [handlers]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function getShortcuts() {
  return Object.entries(SHORTCUTS).map(([key, info]) => ({
    key,
    ...info,
  }));
}
