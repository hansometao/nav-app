import { useState, lazy, Suspense, memo, useRef, useCallback, useEffect } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useGreeting } from './hooks/useGreeting';
import { useTime } from './hooks/useTime';
import { useLayoutStorage } from './hooks/useLayoutStorage';
import { useTheme, THEMES } from './hooks/useTheme.jsx';
import Calendar from './components/Calendar';
import Countdown from './components/Countdown';
import TodoList from './components/TodoList';
import Memo from './components/Memo';
import LunarCalendar from './components/LunarCalendar';
import SettingsPanel from './components/SettingsPanel.jsx';
import FlatBookmarks from './components/FlatBookmarks';
import './App.css';

const AITools = lazy(() => import('./components/AITools'));
const Weather = lazy(() => import('./components/Weather'));
const HotNews = lazy(() => import('./components/HotNews'));

const DEFAULT_SE = { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' };

const MAIN_WIDGETS = [
  { key: 'hotnews',   title: '🔥 热榜资讯',   Comp: HotNews,    passProps: false },
  { key: 'weather',   title: '🌤 天气预报',   Comp: Weather,    passProps: false },
  { key: 'calendar',  title: '📅 日历',      Comp: Calendar,   passProps: false },
  { key: 'todo',      title: '✅ 待办事项',   Comp: TodoList,   passProps: false },
  { key: 'countdown', title: '⏱ 倒计时',    Comp: Countdown,  passProps: false },
  { key: 'memo',      title: '📝 备忘录',    Comp: Memo,       passProps: false },
];

const SHORTCUTS = [
  { key: 'Ctrl/Cmd + K', desc: '聚焦搜索框' },
  { key: 'Ctrl/Cmd + D', desc: '切换主题' },
  { key: 'Escape', desc: '关闭弹窗' },
  { key: '?', desc: '显示帮助' },
];

function ShortcutHelp({ onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="shortcut-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="键盘快捷键">
      <div className="shortcut-panel" onClick={e => e.stopPropagation()}>
        <div className="shortcut-header">
          <h2>⌨️ 键盘快捷键</h2>
          <button className="settings-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>
        <div className="shortcut-list">
          {SHORTCUTS.map(s => (
            <div key={s.key} className="shortcut-item">
              <kbd className="shortcut-key">{s.key}</kbd>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(function App() {
  const greeting = useGreeting();
  const { currentTime, formatTime, formatDate } = useTime();
  const { layouts, editMode, setEditMode, onLayoutChange, resetLayout } = useLayoutStorage();
  const { theme, toggleTheme } = useTheme();
  const [searchEngine, setSearchEngine] = useState(DEFAULT_SE);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const appRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('.search-input');
        if (input) input.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleToggleTheme();
      }
      if (e.key === 'Escape') {
        if (showSettings) setShowSettings(false);
        if (showShortcuts) setShowShortcuts(false);
      }
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.target.closest('input, textarea')) {
        e.preventDefault();
        setShowShortcuts(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSettings, showShortcuts, handleToggleTheme]);

  return (
    <div className="app" ref={appRef}>
      <header className={`app-header ${editMode ? 'edit-mode' : ''}`} role="banner">
        <div className="header-left">
          <h1 className="app-title">皮皮导航</h1>
          <span className="app-subtitle">你的智能起点</span>
        </div>
        <div className="header-right">
          <div className="header-time">
            <span className="time-display">{formatTime(currentTime)}</span>
            <span className="date-display">{formatDate(currentTime)}</span>
            <LunarCalendar date={currentTime} />
          </div>
          <div className="header-greeting">{greeting}</div>
          <div className="header-controls">
            <button
              className="btn-theme-toggle"
              onClick={toggleTheme}
              title={theme === THEMES.DARK ? '切换到亮色模式 (Ctrl+D)' : '切换到深色模式 (Ctrl+D)'}
              aria-label={theme === THEMES.DARK ? '切换到亮色模式' : '切换到深色模式'}
            >
              {theme === THEMES.DARK ? '☀️' : '🌙'}
            </button>
            <button
              className={`btn-edit-mode ${editMode ? 'active' : ''}`}
              onClick={() => setEditMode(!editMode)}
              title={editMode ? '锁定布局' : '编辑布局'}
            >
              {editMode ? '🔒 锁定' : '✏️ 编辑'}
            </button>
            {editMode && (
              <button className="btn-reset-layout" onClick={resetLayout} title="重置布局">🔄 重置</button>
            )}
          </div>
        </div>
      </header>

      <div className="top-search-section">
        <div className="search-container">
          <Suspense fallback={<div className="search-loading">加载中...</div>}>
            <AITools searchEngine={searchEngine} onSearchEngineChange={setSearchEngine} compact />
          </Suspense>
        </div>
      </div>

      <main className="app-main" role="main">
        {/* 平铺式网址导航 - 主要区域 */}
        <div className="flat-bookmarks-section">
          <Suspense fallback={<div className="loading-placeholder">加载中...</div>}>
            <FlatBookmarks />
          </Suspense>
        </div>

        {/* 其他组件 */}
        <div className="other-widgets-section">
          <Responsive
            className="draggable-grid"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
            rowHeight={40}
            containerPadding={[16, 16]}
            margin={[12, 12]}
            isDraggable={editMode}
            isResizable={editMode}
            isBounded={true}
            onLayoutChange={onLayoutChange}
            resizeHandles={['se', 'sw', 'nw', 'ne', 'n', 'e', 's', 'w']}
            draggableHandle=".widget-drag-handle"
            useCSSTransforms={true}
            compactType="vertical"
            preventCollision={false}
          >
            {MAIN_WIDGETS.map(({ key, title, Comp, passProps }) => (
              <div key={key} className="widget-container" data-widget={key}>
                <div className="widget-header-bar">
                  <span className="widget-drag-handle" title="拖拽移动">⋮⋮</span>
                  <span className="widget-title-label">{title}</span>
                  <div className="widget-header-spacer" />
                  {editMode && (
                    <span className="widget-resize-hint" title="拖拽边缘调整大小">⇲</span>
                  )}
                </div>
                <div className="widget-content">
                  <Suspense fallback={null}>
                    {passProps
                      ? <Comp searchEngine={searchEngine} onSearchEngineChange={setSearchEngine} />
                      : <Comp />}
                  </Suspense>
                </div>
              </div>
            ))}
          </Responsive>
        </div>
      </main>

      <footer className="app-footer" role="contentinfo">
        <button className="footer-settings-btn" onClick={() => setShowSettings(true)} title="设置">
          ⚙️ 设置
        </button>
        <button className="footer-settings-btn" onClick={() => setShowShortcuts(true)} title="快捷键帮助 (?)">
          ❓ 帮助
        </button>
        <p>皮皮导航 · 你的智能起点</p>
      </footer>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}
    </div>
  );
});
