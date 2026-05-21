/**
 * 布局存储和编辑模式管理的自定义 Hooks
 * @module hooks/useLayoutStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS } from '../config/storage';

const LAYOUT_KEY = STORAGE_KEYS.LAYOUT;
const EDIT_MODE_KEY = STORAGE_KEYS.EDIT_MODE;

/**
 * 默认布局配置 - 网址导航为主区域，其他卡片自动填充
 * @constant {Object} DEFAULT_LAYOUTS
 * @property {Array} lg - 大屏幕布局配置（12列网格）
 * @property {Array} md - 中等屏幕布局配置
 * @property {Array} sm - 小屏幕布局配置
 * @property {Array} xs - 超小屏幕布局配置（手机）
 */
export const DEFAULT_LAYOUTS = {
  // 大屏幕：网址导航占据主要区域，自动调整适应
  lg: [
    { i: 'bookmarks', x: 0, y: 0, w: 9, h: 10, minW: 3, minH: 4 }, // 网址导航占据主要空间（9列宽，10行高）
    { i: 'calendar', x: 0, y: 10, w: 3, h: 4, minW: 2, minH: 3 }, // 日历左下
    { i: 'todo', x: 3, y: 10, w: 3, h: 4, minW: 2, minH: 3 }, // 待办中下
    { i: 'countdown', x: 6, y: 10, w: 3, h: 4, minW: 2, minH: 3 }, // 倒计时右下
    { i: 'memo', x: 0, y: 14, w: 9, h: 4, minW: 3, minH: 3 }, // 备忘录在左侧
    { i: 'hotnews', x: 9, y: 0, w: 3, h: 5, minW: 2, minH: 3 }, // 热榜在右侧上方
    { i: 'weather', x: 9, y: 5, w: 3, h: 9, minW: 2, minH: 3 }, // 天气预报在右侧下方
  ],
  // 中等屏幕
  md: [
    { i: 'bookmarks', x: 0, y: 0, w: 12, h: 10 }, // 网址导航全宽，占据主要区域
    { i: 'calendar', x: 0, y: 10, w: 4, h: 4 }, // 日历左下
    { i: 'todo', x: 4, y: 10, w: 4, h: 4 }, // 待办中下
    { i: 'countdown', x: 8, y: 10, w: 4, h: 4 }, // 倒计时右下
    { i: 'memo', x: 0, y: 14, w: 12, h: 4 }, // 备忘录全宽
    { i: 'hotnews', x: 0, y: 18, w: 6, h: 5 }, // 热榜左下
    { i: 'weather', x: 6, y: 18, w: 6, h: 5 }, // 天气预报右下
  ],
  // 小屏幕
  sm: [
    { i: 'bookmarks', x: 0, y: 0, w: 12, h: 10 }, // 网址导航全宽，主要区域
    { i: 'calendar', x: 0, y: 10, w: 12, h: 4 }, // 日历全宽
    { i: 'todo', x: 0, y: 14, w: 12, h: 4 }, // 待办全宽
    { i: 'countdown', x: 0, y: 18, w: 12, h: 4 }, // 倒计时全宽
    { i: 'memo', x: 0, y: 22, w: 12, h: 4 }, // 备忘录全宽
    { i: 'hotnews', x: 0, y: 26, w: 12, h: 5 }, // 热榜全宽
    { i: 'weather', x: 0, y: 31, w: 12, h: 5 }, // 天气预报全宽
  ],
  // 超小屏幕（手机）
  xs: [
    { i: 'bookmarks', x: 0, y: 0, w: 12, h: 10 },
    { i: 'calendar', x: 0, y: 10, w: 12, h: 4 },
    { i: 'todo', x: 0, y: 14, w: 12, h: 4 },
    { i: 'countdown', x: 0, y: 18, w: 12, h: 4 },
    { i: 'memo', x: 0, y: 22, w: 12, h: 4 },
    { i: 'hotnews', x: 0, y: 26, w: 12, h: 5 },
    { i: 'weather', x: 0, y: 31, w: 12, h: 5 },
  ],
};

/**
 * 管理可拖拽网格的布局持久化和编辑模式状态
 * 初始值从 localStorage 惰性加载，避免额外渲染
 * @returns {Object} 布局管理对象
 * @returns {Object} returns.layouts - 当前布局配置（按屏幕尺寸分组）
 * @returns {boolean} returns.editMode - 是否处于编辑模式
 * @returns {Function} returns.setEditMode - 设置编辑模式的函数
 * @returns {Function} returns.onLayoutChange - 布局变化时的回调函数
 * @returns {Function} returns.resetLayout - 重置为默认布局的函数
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
