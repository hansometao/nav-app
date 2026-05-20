import { useState, lazy, Suspense, memo, useCallback, useEffect } from 'react';
import { useGreeting, useTime, useLayoutStorage, useTheme, useKeyboardShortcuts } from './hooks';
import { THEMES } from './hooks/useTheme.jsx';
import {
  Calendar,
  Countdown,
  TodoList,
  Memo,
  SettingsPanel,
  FlatBookmarks,
} from './components';
import { DEFAULT_SEARCH_ENGINE } from './constants';
import './styles';

const AITools = lazy(() => import('./components/AITools'));
const Weather = lazy(() => import('./components/Weather'));
const HotNews = lazy(() => import('./components/HotNews'));

const DEFAULT_SE = DEFAULT_SEARCH_ENGINE;

const SIDE_WIDGETS_LEFT = [
  { key: 'weather', title: '天气', Comp: Weather, passProps: false },
  { key: 'calendar', title: '日历', Comp: Calendar, passProps: false },
  { key: 'todo', title: '待办', Comp: TodoList, passProps: false },
];

const SIDE_WIDGETS_RIGHT = [
  { key: 'hotnews', title: '热榜', Comp: HotNews, passProps: false },
  { key: 'countdown', title: '倒计时', Comp: Countdown, passProps: false },
  { key: 'memo', title: '备忘', Comp: Memo, passProps: false },
];

const SHORTCUTS = [
  { key: 'Ctrl/Cmd + K', desc: '聚焦搜索框' },
  { key: 'Ctrl/Cmd + D', desc: '切换主题' },
  { key: 'Escape', desc: '关闭弹窗' },
  { key: '?', desc: '显示帮助' },
];

function ShortcutHelp({ onClose }) {
  useEffect(() => {
    const handleEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="shortcut-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="键盘快捷键"
    >
      <div className="shortcut-panel" onClick={e => e.stopPropagation()}>
        <div className="shortcut-header">
          <h2>⌨️ 键盘快捷键</h2>
          <button className="settings-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
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

const WidgetItem = ({
  widgetKey,
  title,
  Comp,
  passProps,
  searchEngine,
  onSearchEngineChange,
  collapsedWidgets,
  onToggleWidget,
}) => (
  <div
    className={`widget-container ${collapsedWidgets[widgetKey] ? 'collapsed' : ''}`}
    data-widget={widgetKey}
  >
    <div className="widget-header-bar" onClick={() => onToggleWidget(widgetKey)}>
      <span className="widget-title-label">{title}</span>
      <button
        className="widget-toggle-btn"
        aria-label={collapsedWidgets[widgetKey] ? '展开' : '折叠'}
      >
        {collapsedWidgets[widgetKey] ? '▶' : '▼'}
      </button>
    </div>
    <div className={`widget-content ${collapsedWidgets[widgetKey] ? 'hidden' : ''}`}>
      <Suspense fallback={null}>
        {passProps ? (
          <Comp searchEngine={searchEngine} onSearchEngineChange={onSearchEngineChange} />
        ) : (
          <Comp />
        )}
      </Suspense>
    </div>
  </div>
);

const MobileWidgetItem = ({
  widgetKey,
  title,
  Comp,
  passProps,
  searchEngine,
  onSearchEngineChange,
  collapsedWidgets,
  onToggleWidget,
}) => (
  <div className="mobile-widget-item">
    <div className="mobile-widget-header" onClick={() => onToggleWidget(widgetKey)}>
      <span>{title}</span>
      <span>{collapsedWidgets[widgetKey] ? '▶' : '▼'}</span>
    </div>
    {!collapsedWidgets[widgetKey] && (
      <div className="mobile-widget-content">
        <Suspense fallback={null}>
          {passProps ? (
            <Comp searchEngine={searchEngine} onSearchEngineChange={onSearchEngineChange} />
          ) : (
            <Comp />
          )}
        </Suspense>
      </div>
    )}
  </div>
);

export default memo(function App() {
  const greeting = useGreeting();
  const { currentTime, formatTime, formatDate } = useTime();
  const { editMode, setEditMode, resetLayout } = useLayoutStorage();
  const { theme, toggleTheme } = useTheme();
  const [searchEngine, setSearchEngine] = useState(DEFAULT_SE);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [collapsedWidgets, setCollapsedWidgets] = useState({});
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const toggleWidgetCollapse = useCallback(widgetKey => {
    setCollapsedWidgets(prev => ({
      ...prev,
      [widgetKey]: !prev[widgetKey],
    }));
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setShowMobileDrawer(false);
  }, []);

  useKeyboardShortcuts({
    focusSearch: () => {
      const input = document.querySelector('.search-input');
      if (input) input.focus();
    },
    toggleTheme: () => {
      toggleTheme();
    },
    closeModal: () => {
      if (showSettings) setShowSettings(false);
      if (showShortcuts) setShowShortcuts(false);
    },
    showHelp: () => {
      setShowShortcuts(true);
    },
  });

  return (
    <div className="app">
      <header className={`app-header ${editMode ? 'edit-mode' : ''}`} role="banner">
        <div className="header-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setShowMobileDrawer(true)}
            aria-label="打开菜单"
          >
            ☰
          </button>
          <h1 className="app-title">皮皮导航</h1>
          <span className="app-subtitle">你的智能起点</span>
        </div>
        <div className="header-right">
          <div className="header-time">
            <span className="time-display">{formatTime(currentTime)}</span>
            <span className="date-display">{formatDate(currentTime)}</span>
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
              <button className="btn-reset-layout" onClick={resetLayout} title="重置布局">
                🔄 重置
              </button>
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
        <div className="main-layout-container">
          <aside className="side-widgets side-left">
            <div className="side-grid">
              {SIDE_WIDGETS_LEFT.map(widget => (
                <WidgetItem
                  key={widget.key}
                  widgetKey={widget.key}
                  title={widget.title}
                  Comp={widget.Comp}
                  passProps={widget.passProps}
                  searchEngine={searchEngine}
                  onSearchEngineChange={setSearchEngine}
                  collapsedWidgets={collapsedWidgets}
                  onToggleWidget={toggleWidgetCollapse}
                />
              ))}
            </div>
          </aside>

          <div className="main-content">
            <div className="flat-bookmarks-section">
              <Suspense fallback={<div className="loading-placeholder">加载中...</div>}>
                <FlatBookmarks />
              </Suspense>
            </div>
          </div>

          <aside className="side-widgets side-right">
            <div className="side-grid">
              {SIDE_WIDGETS_RIGHT.map(widget => (
                <WidgetItem
                  key={widget.key}
                  widgetKey={widget.key}
                  title={widget.title}
                  Comp={widget.Comp}
                  passProps={widget.passProps}
                  searchEngine={searchEngine}
                  onSearchEngineChange={setSearchEngine}
                  collapsedWidgets={collapsedWidgets}
                  onToggleWidget={toggleWidgetCollapse}
                />
              ))}
            </div>
          </aside>
        </div>
      </main>

      <footer className="app-footer" role="contentinfo">
        <button className="footer-settings-btn" onClick={() => setShowSettings(true)} title="设置">
          ⚙️ 设置
        </button>
        <button
          className="footer-settings-btn"
          onClick={() => setShowShortcuts(true)}
          title="快捷键帮助 (?)"
        >
          ❓ 帮助
        </button>
        <p>皮皮导航 · 你的智能起点</p>
      </footer>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showShortcuts && <ShortcutHelp onClose={() => setShowShortcuts(false)} />}

      {showMobileDrawer && (
        <div className="mobile-drawer-overlay" onClick={closeMobileDrawer}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <h2>功能菜单</h2>
              <button
                className="mobile-drawer-close"
                onClick={closeMobileDrawer}
                aria-label="关闭菜单"
              >
                ✕
              </button>
            </div>
            <div className="mobile-drawer-content">
              <div className="mobile-widget-section">
                <h3>左侧小部件</h3>
                {SIDE_WIDGETS_LEFT.map(widget => (
                  <MobileWidgetItem
                    key={widget.key}
                    widgetKey={widget.key}
                    title={widget.title}
                    Comp={widget.Comp}
                    passProps={widget.passProps}
                    searchEngine={searchEngine}
                    onSearchEngineChange={setSearchEngine}
                    collapsedWidgets={collapsedWidgets}
                    onToggleWidget={toggleWidgetCollapse}
                  />
                ))}
              </div>
              <div className="mobile-widget-section">
                <h3>右侧小部件</h3>
                {SIDE_WIDGETS_RIGHT.map(widget => (
                  <MobileWidgetItem
                    key={widget.key}
                    widgetKey={widget.key}
                    title={widget.title}
                    Comp={widget.Comp}
                    passProps={widget.passProps}
                    searchEngine={searchEngine}
                    onSearchEngineChange={setSearchEngine}
                    collapsedWidgets={collapsedWidgets}
                    onToggleWidget={toggleWidgetCollapse}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
