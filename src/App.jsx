import { useState, lazy, Suspense, memo, useRef } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { useGreeting } from './hooks/useGreeting';
import { useTime } from './hooks/useTime';
import { useLayoutStorage } from './hooks/useLayoutStorage';
import { STORAGE_KEYS } from './config/storage';
import './App.css';

// 懒加载所有组件以保持一致性
const AITools = lazy(() => import('./components/AITools'));
const Weather = lazy(() => import('./components/Weather'));
const Bookmarks = lazy(() => import('./components/Bookmarks'));
const HotNews = lazy(() => import('./components/HotNews'));
const Calendar = lazy(() => import('./components/Calendar'));
const Countdown = lazy(() => import('./components/Countdown'));
const TodoList = lazy(() => import('./components/TodoList'));
const Memo = lazy(() => import('./components/Memo'));
const LunarCalendar = lazy(() => import('./components/LunarCalendar'));

// 统一的搜索引擎配置（与 AITools 组件保持一致）
const SEARCH_ENGINES = [
  { name: 'Google', url: 'https://www.google.com/search?q=', icon: '🔍' },
  { name: '百度', url: 'https://www.baidu.com/s?wd=', icon: '🐻' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: '🟦' },
];

// 默认使用 Bing 作为搜索引擎
const DEFAULT_SE = SEARCH_ENGINES[2];

// 主体区域组件映射（不包含搜索，搜索独立在顶部）
const MAIN_WIDGETS = [
  { key: 'bookmarks', title: '🔖 网址导航',   Comp: Bookmarks,  passProps: false },
  { key: 'hotnews',   title: '🔥 热榜资讯',   Comp: HotNews,    passProps: false },
  { key: 'weather',   title: '🌤 天气预报',   Comp: Weather,    passProps: false },
  { key: 'calendar',  title: '📅 日历',      Comp: Calendar,   passProps: false },
  { key: 'todo',      title: '✅ 待办事项',   Comp: TodoList,   passProps: false },
  { key: 'countdown', title: '⏱ 倒计时',    Comp: Countdown,  passProps: false },
  { key: 'memo',      title: '📝 备忘录',    Comp: Memo,       passProps: false },
];

export default memo(function App() {
  const greeting = useGreeting();
  const { currentTime, formatTime, formatDate } = useTime();
  const { layouts, editMode, setEditMode, onLayoutChange, resetLayout } = useLayoutStorage();
  
  // 从 localStorage 读取保存的搜索引擎配置
  const [searchEngine, setSearchEngine] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEARCH_ENGINE);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 验证保存的配置是否有效
        const found = SEARCH_ENGINES.find(se => se.name === parsed.name);
        if (found) return found;
      }
    } catch {
      // 如果读取失败，使用默认值
    }
    return DEFAULT_SE;
  });
  
  // 保存搜索引擎配置到 localStorage
  const handleSearchEngineChange = (engine) => {
    setSearchEngine(engine);
    try {
      localStorage.setItem(STORAGE_KEYS.SEARCH_ENGINE, JSON.stringify(engine));
    } catch {
      // 忽略保存错误
    }
  };
  
  const appRef = useRef(null);

  return (
    <div className="app" ref={appRef}>
      {/* 顶部 Header */}
      <header className={`app-header ${editMode ? 'edit-mode' : ''}`}>
        <div className="header-left">
          <h1 className="app-title">皮皮导航</h1>
          <span className="app-subtitle">你的智能起点</span>
        </div>
        <div className="header-right">
          <div className="header-time">
            <span className="time-display">{formatTime(currentTime)}</span>
            <span className="date-display">{formatDate(currentTime)}</span>
            <Suspense fallback={null}>
              <LunarCalendar date={currentTime} />
            </Suspense>
          </div>
          <div className="header-greeting">{greeting}</div>
          <div className="header-controls">
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

      {/* 顶部搜索区域 - 独立于网格布局 */}
      <div className="top-search-section">
        <div className="search-container">
          <Suspense fallback={<div className="search-loading">加载中...</div>}>
            <AITools searchEngine={searchEngine} onSearchEngineChange={handleSearchEngineChange} compact />
          </Suspense>
        </div>
      </div>

      {/* 主体区域 - 可拖拽网格 */}
      <main className="app-main">
        <Responsive
          className="draggable-grid"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={{ lg: 12, md: 12, sm: 12, xs: 12 }}
          rowHeight={36}
          containerPadding={[12, 12]}
          margin={[10, 10]}
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
            <div key={key} className="widget-container">
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
      </main>

      {/* 底部 Footer */}
      <footer className="app-footer">
        <p>皮皮导航 · 你的智能起点 🐦</p>
      </footer>
    </div>
  );
});
