// nav-app 存储键配置
// 统一管理的 localStorage 键名，避免冲突和占位符问题

export const STORAGE_KEYS = {
  // 布局相关
  LAYOUT: 'nav_app_layout',
  EDIT_MODE: 'nav_app_edit_mode',

  // 组件数据
  TODO: 'nav_app_todos_v1',
  MEMO: 'nav_app_memos_v1',
  BOOKMARKS: 'nav_app_bookmarks_v1',
  COUNTDOWN: 'nav_app_countdowns_v1',
  CALENDAR: 'nav_app_events_v1',
  WEATHER: 'nav_app_weather_cache_v1',

  HOTNEWS: 'nav_app_hotnews_cache_v1',

  // 用户偏好
  SEARCH_ENGINE: 'nav_app_search_engine_v1',
  CUSTOM_ENGINES: 'nav_app_custom_engines_v1',
};

// 缓存配置
export const CACHE_CONFIG = {
  WEATHER_DURATION: 10 * 60 * 1000, // 天气缓存 10 分钟
  NEWS_DURATION: 5 * 60 * 1000, // 热榜缓存 5 分钟
};
