// 搜索相关
export const DEFAULT_SEARCH_ENGINE = {
  name: 'Bing',
  url: 'https://www.bing.com/search?q=',
  favicon: 'https://www.bing.com/favicon.ico',
};

// 存储键名
export const STORAGE_KEYS = {
  BOOKMARKS: 'nav_app_bookmarks_v1',
  CATEGORIES: 'nav_app_categories_v1',
  STATS: 'nav_app_bookmark_stats_v1',
};

// 默认分类
export const DEFAULT_CATEGORIES = [
  { name: '常用网站', icon: '🌐' },
  { name: '工作学习', icon: '💼' },
  { name: 'AI 工具', icon: '🤖' },
  { name: '娱乐生活', icon: '🎮' },
  { name: '开发工具', icon: '🛠' },
];

// 默认书签
export const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com', favicon: '', category: '常用网站' },
  { name: '百度', url: 'https://www.baidu.com', favicon: '', category: '常用网站' },
  { name: 'Bilibili', url: 'https://www.bilibili.com', favicon: '', category: '常用网站' },
  { name: '知乎', url: 'https://www.zhihu.com', favicon: '', category: '常用网站' },
  { name: '微博', url: 'https://weibo.com', favicon: '', category: '常用网站' },
  { name: 'YouTube', url: 'https://youtube.com', favicon: '', category: '常用网站' },
  { name: 'GitHub', url: 'https://github.com', favicon: '', category: '工作学习' },
  { name: '掘金', url: 'https://juejin.cn', favicon: '', category: '工作学习' },
  { name: 'CSDN', url: 'https://www.csdn.net', favicon: '', category: '工作学习' },
  { name: 'StackOverflow', url: 'https://stackoverflow.com', favicon: '', category: '工作学习' },
  { name: 'ChatGPT', url: 'https://chat.openai.com', favicon: '', category: 'AI 工具' },
  { name: 'Claude', url: 'https://claude.ai', favicon: '', category: 'AI 工具' },
  { name: 'DeepSeek', url: 'https://chat.deepseek.com', favicon: '', category: 'AI 工具' },
  { name: 'Kimi', url: 'https://kimi.moonshot.cn', favicon: '', category: 'AI 工具' },
  { name: 'Netflix', url: 'https://www.netflix.com', favicon: '', category: '娱乐生活' },
  { name: 'Spotify', url: 'https://open.spotify.com', favicon: '', category: '娱乐生活' },
  { name: '淘宝', url: 'https://www.taobao.com', favicon: '', category: '娱乐生活' },
  { name: 'Vercel', url: 'https://vercel.com', favicon: '', category: '开发工具' },
  { name: 'Netlify', url: 'https://www.netlify.com', favicon: '', category: '开发工具' },
  { name: 'CodePen', url: 'https://codepen.io', favicon: '', category: '开发工具' },
];

// 图标选项
export const ICON_OPTIONS = [
  '📁',
  '🌐',
  '💼',
  '🤖',
  '🎮',
  '🛠',
  '📚',
  '🎵',
  '🛒',
  '✈️',
  '🏠',
  '📷',
  '🔧',
  '🎓',
  '❤️',
  '🔖',
  '⭐',
  '💻',
  '📱',
  '📺',
];

// 侧边栏小部件
export const SIDE_WIDGETS_LEFT = [
  { key: 'weather', title: '天气' },
  { key: 'calendar', title: '日历' },
  { key: 'todo', title: '待办' },
];

export const SIDE_WIDGETS_RIGHT = [
  { key: 'hotnews', title: '热榜' },
  { key: 'countdown', title: '倒计时' },
  { key: 'memo', title: '备忘' },
];
