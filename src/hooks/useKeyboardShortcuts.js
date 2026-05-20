import { useEffect, useCallback } from 'react';

const SHORTCUTS = {
  'Ctrl+K': { action: 'focusSearch', description: '聚焦搜索框' },
  'Ctrl+D': { action: 'toggleTheme', description: '切换主题' },
  Escape: { action: 'closeModal', description: '关闭弹窗' },
  '?': { action: 'showHelp', description: '显示快捷键帮助' },
};

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
