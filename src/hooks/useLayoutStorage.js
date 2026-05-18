import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../config/storage';

const LAYOUT_KEY = STORAGE_KEYS.LAYOUT;
const EDIT_MODE_KEY = STORAGE_KEYS.EDIT_MODE;

// 网格布局配置 - 不限制列宽，自由拖拽，自动适应
export const DEFAULT_LAYOUTS = {
  // 大屏幕：minW=1 不限制列宽，minH=2 最小高度
  lg: [
    { i: 'bookmarks', x: 0, y: 0,  w: 8,  h: 8, minW: 1, minH: 2 },
    { i: 'hotnews',   x: 8, y: 0,  w: 4,  h: 6, minW: 1, minH: 2 },
    { i: 'weather',   x: 8, y: 6,  w: 4,  h: 6, minW: 1, minH: 2 },
    { i: 'calendar',  x: 0, y: 8,  w: 4,  h: 5, minW: 1, minH: 2 },
    { i: 'todo',      x: 4, y: 8,  w: 4,  h: 5, minW: 1, minH: 2 },
    { i: 'countdown', x: 8, y: 12, w: 4,  h: 5, minW: 1, minH: 2 },
    { i: 'memo',      x: 0, y: 13, w: 8,  h: 5, minW: 1, minH: 2 },
  ],
  // 中等屏幕
  md: [
    { i: 'bookmarks', x: 0, y: 0,  w: 12, h: 8 },  // 网址导航全宽
    { i: 'hotnews',   x: 0, y: 8,  w: 6,  h: 6 },  // 热榜左
    { i: 'weather',   x: 6, y: 8,  w: 6,  h: 6 },  // 天气右
    { i: 'calendar',  x: 0, y: 14, w: 6,  h: 5 },  // 日历左
    { i: 'todo',      x: 6, y: 14, w: 6,  h: 5 },  // 待办右
    { i: 'countdown', x: 0, y: 19, w: 6,  h: 5 },  // 倒计时
    { i: 'memo',      x: 6, y: 19, w: 6,  h: 5 },  // 备忘录
  ],
  // 小屏幕
  sm: [
    { i: 'bookmarks', x: 0, y: 0,  w: 12, h: 8 },  // 网址导航全宽
    { i: 'hotnews',   x: 0, y: 8,  w: 12, h: 6 },  // 热榜全宽
    { i: 'weather',   x: 0, y: 14, w: 12, h: 6 },  // 天气全宽
    { i: 'calendar',  x: 0, y: 20, w: 12, h: 5 },  // 日历全宽
    { i: 'todo',      x: 0, y: 25, w: 12, h: 5 },  // 待办全宽
    { i: 'countdown', x: 0, y: 30, w: 12, h: 5 },  // 倒计时全宽
    { i: 'memo',      x: 0, y: 35, w: 12, h: 5 },  // 备忘录全宽
  ],
  // 超小屏幕（手机）
  xs: [
    { i: 'bookmarks', x: 0, y: 0,  w: 12, h: 8 },
    { i: 'hotnews',   x: 0, y: 8,  w: 12, h: 6 },
    { i: 'weather',   x: 0, y: 14, w: 12, h: 6 },
    { i: 'calendar',  x: 0, y: 20, w: 12, h: 5 },
    { i: 'todo',      x: 0, y: 25, w: 12, h: 5 },
    { i: 'countdown', x: 0, y: 30, w: 12, h: 5 },
    { i: 'memo',      x: 0, y: 35, w: 12, h: 5 },
  ],
};

/**
 * 管理可拖拽网格的布局持久化 + 编辑模式。
 * 初始值从 localStorage 惰性加载，避免额外渲染。
 */
export function useLayoutStorage() {
  const [layouts, setLayouts] = useState(() => {
    try {
      const saved = localStorage.getItem(LAYOUT_KEY);
      return saved ? { ...DEFAULT_LAYOUTS, ...JSON.parse(saved) } : DEFAULT_LAYOUTS;
    } catch {
      return DEFAULT_LAYOUTS;
    }
  });

  const [editMode, setEditMode] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(EDIT_MODE_KEY)) || false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(EDIT_MODE_KEY, JSON.stringify(editMode));
  }, [editMode]);

  const onLayoutChange = useCallback((_currentLayout, allLayouts) => {
    setLayouts(allLayouts);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(allLayouts));
  }, []);

  const resetLayout = useCallback(() => {
    if (confirm('确认重置为默认布局？')) {
      setLayouts(DEFAULT_LAYOUTS);
      localStorage.setItem(LAYOUT_KEY, JSON.stringify(DEFAULT_LAYOUTS));
    }
  }, []);

  return { layouts, editMode, setEditMode, onLayoutChange, resetLayout };
}
