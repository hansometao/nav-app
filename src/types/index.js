/**
 * Nav-App 类型定义
 */

/**
 * 书签类型
 */
export interface Bookmark {
  id: number;
  name: string;
  url: string;
  favicon?: string;
  icon?: string;
  category: string;
  createdAt: number;
}

/**
 * 分类类型
 */
export interface Category {
  name: string;
  icon: string;
}

/**
 * 待办事项类型
 */
export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
}

/**
 * 备忘录类型
 */
export interface Memo {
  id: number;
  title: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 日历事件类型
 */
export interface CalendarEvent {
  date: string;
  title: string;
}

/**
 * 倒计时类型
 */
export interface Countdown {
  id: number;
  label: string;
  type: 'once' | 'daily';
  target?: string;
  hour?: number;
  minute?: number;
  color: string;
}

/**
 * 搜索引擎类型
 */
export interface SearchEngine {
  name: string;
  url: string;
  icon: string;
}

/**
 * AI工具类型
 */
export interface AITool {
  name: string;
  url: string;
  icon: string;
  desc: string;
}

/**
 * 快捷链接类型
 */
export interface QuickLink {
  name: string;
  url: string;
  icon: string;
}

/**
 * 热榜条目类型
 */
export interface HotNewsItem {
  id: string | number;
  title: string;
  url: string;
  heat?: number;
  author?: string;
}

/**
 * 平台类型
 */
export interface Platform {
  key: string;
  name: string;
  icon: string;
  color: string;
}

/**
 * 平台分类类型
 */
export interface PlatformCategory {
  key: string;
  name: string;
  icon: string;
  rid?: number;
  type?: string;
}

/**
 * 城市类型
 */
export interface City {
  name: string;
  code: string;
  custom?: boolean;
}

/**
 * 天气数据类型
 */
export interface WeatherData {
  temp: string;
  WS: string;
  SD: string;
  WSE: string;
  WD: string;
  time?: string;
  AP?: string;
  weather?: string;
}

/**
 * 天气预报类型
 */
export interface ForecastData {
  temp1: string;
  temp2: string;
}

/**
 * 布局项类型
 */
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

/**
 * 布局类型
 */
export interface Layouts {
  lg: LayoutItem[];
  md: LayoutItem[];
  sm: LayoutItem[];
  xs: LayoutItem[];
}

/**
 * 主题类型
 */
export type Theme = 'dark' | 'light';

/**
 * 导出数据类型
 */
export interface ExportData {
  version: string;
  exportTime: string;
  appName: string;
  data: Record<string, unknown>;
}

/**
 * 导入结果类型
 */
export interface ImportResult {
  success: boolean;
  count: number;
  message: string;
}

/**
 * Props类型定义
 */
export interface AIToolsProps {
  searchEngine: SearchEngine;
  onSearchEngineChange: (engine: SearchEngine) => void;
  compact?: boolean;
}

export interface BookmarksProps {}

export interface CalendarProps {}

export interface CountdownProps {}

export interface TodoListProps {}

export interface MemoProps {}

export interface WeatherProps {}

export interface HotNewsProps {}

export interface SettingsPanelProps {
  onClose: () => void;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export interface TimeProviderProps {
  children: React.ReactNode;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export interface LayoutStorageReturn {
  layouts: Layouts;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onLayoutChange: (layout: Layouts) => void;
  resetLayout: () => void;
}
