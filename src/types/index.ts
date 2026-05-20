/**
 * 项目类型定义文件
 * @module types
 */

/** 主题类型 */
export type ThemeType = 'light' | 'dark';

/** 书签数据类型 */
export interface Bookmark {
  id: number;
  name: string;
  url: string;
  favicon?: string;
  category: string;
  createdAt: number;
}

/** 分类数据类型 */
export interface Category {
  name: string;
  icon: string;
}

/** 待办任务类型 */
export interface Todo {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

/** 备忘录类型 */
export interface Memo {
  id: number;
  content: string;
  createdAt: number;
  updatedAt: number;
}

/** 倒计时事件类型 */
export interface CountdownEvent {
  id: number;
  title: string;
  targetDate: string;
  createdAt: number;
}

/** 日历事件类型 */
export interface CalendarEvent {
  id: number;
  date: string;
  title: string;
  color: string;
  time?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/** 天气数据类型 */
export interface WeatherData {
  city: string;
  temp: number | string;
  WD: string;
  WS: string;
  SD: string;
  AP: number | string;
  weather: string;
  temp1?: string;
  temp2?: string;
}

/** 天气预报数据类型 */
export interface ForecastData {
  date: string;
  dayName: string;
  tempHigh: string;
  tempLow: string;
  weather: string;
  wind: string;
  windLevel: string;
}

/** 农历信息类型 */
export interface LunarInfo {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  monthName: string;
  dayName: string;
  fullLunar: string;
  yearGanZhi: string;
  yearShengXiao: string;
  currentJieQi: string | null;
  lunarDateStr: string;
  eraStr: string;
  zodiacStr: string;
}

/** 搜索历史类型 */
export interface SearchHistory {
  query: string;
  timestamp: number;
}

/** 布局配置类型 */
export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

/** 布局配置映射类型 */
export interface Layouts {
  lg: LayoutItem[];
  md: LayoutItem[];
  sm: LayoutItem[];
  xs: LayoutItem[];
}

/** 存储键名类型 */
export interface StorageKeys {
  TODO: string;
  MEMO: string;
  BOOKMARKS: string;
  COUNTDOWN: string;
  CALENDAR: string;
  LAYOUT: string;
  EDIT_MODE: string;
  WEATHER: string;
  SEARCH_HISTORY: string;
  THEME: string;
}

/** 搜索引擎类型 */
export interface SearchEngine {
  name: string;
  url: string;
  favicon: string;
}

/** 快捷键处理函数类型 */
export interface KeyboardShortcutHandlers {
  focusSearch?: () => void;
  toggleTheme?: () => void;
  closeModal?: () => void;
  showHelp?: () => void;
}

/** 错误类型 */
export type ErrorType = 'network' | 'timeout' | 'server' | 'client' | 'unknown';

/** API响应类型 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
