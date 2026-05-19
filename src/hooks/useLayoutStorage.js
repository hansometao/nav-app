import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../config/storage';

const LAYOUT_KEY = STORAGE_KEYS.LAYOUT;
const EDIT_MODE_KEY = STORAGE_KEYS.EDIT_MODE;

// 网格布局配置 - 网址导航为主区域，其他卡片自动填充
export const DEFAULT_LAYOUTS = {
  // 大屏幕：网址导航占据主要区域，自动调整适应
  lg: [
    { i: 'bookmarks', x: 0, y: 0,  w: 9,  h: 10, minW: 3, minH: 4 }, // 网址导航占据主要空间（9列宽，10行高）
    { i: 'hotnews',   x: 9, y: 0,  w: 3,  h: 5,  minW: 2, minH: 3 }, // 热榜在右侧
    { i: 'weather',   x: 9, y: 5,  w: 3,  h: 5,  minW: 2, minH: 3 }, // 天气在右侧下方
    { i: 'calendar',  x: 0, y: 10, w: 3,  h: 4,  minW: 2, minH: 3 }, // 日历左下
    { i: 'todo',      x: 3, y: 10, w: 3,  h: 4,  minW: 2, minH: 3 }, // 待办中下
    { i: 'countdown', x: 6, y: 10, w: 3,  h: 4,  minW: 2, minH: 3 }, // 倒计时右下
    { i: 'memo',      x: 0, y: 14, w: 12, h: 4,  minW: 3, minH: 3 }, // 备忘录全宽底部
  ],
  // 中等屏幕
  md: [
    { i: 'bookmarks', x: 0, y: 0,  w: 12, h: 10 }, // 网址导航全宽，占据主要区域
    { i: 'hotnews',   x: 0, y: 10, w: 6,  h: 5 }, // 热榜左下
    { i: 'weather',   x: 6, y: 10, w: 6,  h: 5 }, // 天气右下
    { i: 'calendar',  x: 0, y: 15, w: 4,  h: 4 }, // 日历左下
    { i: 'todo',      x: 4, y: 15, w: 4,  h: 4 }, // 待办中下
    { i: 'countdown', x: 8, y: 15, w: 4,  h: 4 }, // 倒计时右下
    { i: 'memo',      x: 0, y: 19, w: 12, h: 4 }, // 备忘录全宽
  ],
  // 小屏幕
  sm: [
    { i: 'bookmarks', x: 0, y: 0,  w: 12, h: 10 }, // 网址导航全宽，主要区域
    { i: 'hotnews',   x: 0, y: 10, w: 12, h: 5 }, // 热榜全宽
    { i: 'weather',   x: 0, y: 15, w: 12, h: 5 }, // 天气全宽
    { i: 'calendar',  x: 0, y: 20, w: 12, h: 4 }, // 日历全宽
    { i: 'todo',      x: 0, y: 24, w: 12, h: 4 }, // 待办全宽
    { i: 'countdown', x: 0, y: 28, w: 12, h: 4 }, // 倒计时全宽
    { i: 'memo',      x: 0, y: 32, w: 12, h: 4 }, // 备忘录全宽
  ],
  // 超小屏幕（手机）
  xs: [
    { i: 'bookmarks', x: 0, y: 0,  w: 12, h: 10 },
    { i: 'hotnews',   x: 0, y: 10, w: 12, h: 5 },
    { i: 'weather',   x: 0, y: 15, w: 12, h: 5 },
    { i: 'calendar',  x: 0, y: 20, w: 12, h: 4 },
    { i: 'todo',      x: 0, y: 24, w: 12, h: 4 },
    { i: 'countdown', x: 0, y: 28, w: 12, h: 4 },
    { i: 'memo',      x: 0, y: 32, w: 12, h: 4 },
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
