# 皮皮导航 (Pipi Nav) Code Wiki

## 目录

- [项目概述](#项目概述)
- [项目架构](#项目架构)
- [主要模块职责](#主要模块职责)
- [关键类与函数说明](#关键类与函数说明)
- [依赖关系](#依赖关系)
- [项目运行方式](#项目运行方式)
- [数据存储机制](#数据存储机制)
- [主题系统](#主题系统)
- [组件清单](#组件清单)

---

## 项目概述

**项目名称**: 皮皮导航 (Pipi Nav)  
**项目类型**: React 单页应用 (SPA)  
**技术栈**: React 19 + Vite + Vitest  
**定位**: 现代化的导航应用，集成多种实用工具和信息服务

### 核心功能模块

| 模块 | 功能描述 |
|------|----------|
| 智能搜索 | 多搜索引擎切换（百度、Bing、GitHub、知乎） |
| 书签管理 | 分类管理、热门书签追踪、Favicon自动获取 |
| 天气预报 | 实时天气 + 5天天气预报，支持多城市切换 |
| 日历组件 | 农历显示、节日节气、事件管理 |
| 热榜资讯 | 聚合多个平台的热搜榜单 |
| 待办事项 | 分类管理、优先级、截止日期 |
| 倒计时 | 一次性/每日循环倒计时、计时器 |
| 备忘录 | 彩色便签、网格布局 |

---

## 项目架构

### 目录结构

```
nav-app/
├── public/                      # 静态公共资源
│   ├── favicon.svg             # 网站图标
│   └── icons.svg               # SVG 图标集合
├── src/
│   ├── components/             # React 组件
│   │   ├── calendar/          # 日历子组件
│   │   │   ├── CalendarHeader.jsx
│   │   │   ├── EditableEventForm.jsx
│   │   │   ├── EventForm.jsx
│   │   │   ├── MonthView.jsx
│   │   │   ├── TodayCard.jsx
│   │   │   └── index.js
│   │   ├── weather/            # 天气子组件
│   │   │   ├── WeatherForecast.jsx
│   │   │   └── index.js
│   │   ├── AITools.jsx         # AI工具和搜索组件
│   │   ├── Bookmarks.jsx       # 书签管理组件
│   │   ├── Calendar.jsx        # 日历组件
│   │   ├── CalendarPopup.jsx   # 日历弹窗
│   │   ├── CalendarWidget.jsx  # 日历小部件
│   │   ├── Countdown.jsx       # 倒计时组件
│   │   ├── ErrorBoundary.jsx   # 错误边界
│   │   ├── ErrorMessage.jsx    # 错误消息组件
│   │   ├── FlatBookmarks.jsx   # 扁平化书签组件
│   │   ├── HotNews.jsx         # 热榜组件
│   │   ├── LunarCalendar.css   # 农历日历样式
│   │   ├── LunarCalendar.jsx   # 农历日历组件
│   │   ├── Memo.jsx            # 备忘录组件
│   │   ├── SettingsPanel.jsx   # 设置面板
│   │   ├── TodoList.jsx        # 待办事项组件
│   │   ├── Weather.jsx         # 天气组件
│   │   └── index.js            # 组件导出
│   ├── config/                 # 配置文件
│   │   ├── index.js
│   │   └── storage.js          # 存储键配置
│   ├── constants/              # 常量定义
│   │   └── index.js            # 搜索、分类、图标常量
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── index.js
│   │   ├── useDebounce.js      # 防抖 Hook
│   │   ├── useGreeting.js      # 问候语 Hook
│   │   ├── useKeyboardShortcuts.js  # 快捷键 Hook
│   │   ├── useLayoutStorage.js # 布局存储 Hook
│   │   ├── useTheme.jsx        # 主题 Hook
│   │   └── useTime.jsx         # 时间 Hook
│   ├── styles/                 # 样式文件
│   │   ├── components.css      # 组件样式
│   │   ├── unified-components.css  # 统一组件样式
│   │   └── index.js
│   ├── test/                   # 测试文件
│   │   ├── hooks/
│   │   │   └── useTheme.test.jsx
│   │   ├── utils/
│   │   │   ├── dataManagement.test.js
│   │   │   └── security.test.js
│   │   └── setup.js
│   ├── types/                  # 类型定义
│   │   └── index.js
│   ├── utils/                  # 工具函数
│   │   ├── apiErrorHandler.js  # API 错误处理
│   │   ├── dataManagement.js   # 数据管理
│   │   ├── favicon.js          # Favicon 获取
│   │   ├── icons.jsx           # SVG 图标组件
│   │   ├── index.js
│   │   ├── lunarCalendar.js    # 农历计算
│   │   └── security.js         # 安全工具
│   ├── App.css                 # 主应用样式
│   ├── App.jsx                 # 主应用组件
│   ├── index.css               # 全局样式
│   └── main.jsx                # 入口文件
├── index.html                  # HTML 模板
├── package.json                # 项目配置
├── vite.config.js              # Vite 配置
├── vitest.config.js            # Vitest 配置
└── eslint.config.js            # ESLint 配置
```

---

## 主要模块职责

### 1. 入口层 (main.jsx)

**职责**: 应用初始化和 Provider 注入

```
App → ThemeProvider → TimeProvider → ErrorBoundary → App Component
```

**核心逻辑**:
- 使用 `StrictMode` 包裹应用
- 按层级注入 `ThemeProvider`、`TimeProvider`
- 最外层包裹 `ErrorBoundary` 捕获渲染错误

### 2. 应用层 (App.jsx)

**职责**: 主布局和状态管理

**主要功能**:
- 渲染头部区域（时间、问候语、主题切换、布局编辑）
- 渲染搜索栏区域
- 渲染主内容区（三栏布局：左侧小部件、中间书签、右侧小部件）
- 管理弹窗状态（设置面板、快捷键帮助、移动端抽屉）

**状态管理**:
| 状态 | 用途 |
|------|------|
| `editMode` | 布局编辑模式 |
| `searchEngine` | 当前搜索引擎 |
| `showSettings` | 设置面板显示 |
| `showShortcuts` | 快捷键帮助显示 |
| `collapsedWidgets` | 小部件折叠状态 |
| `showMobileDrawer` | 移动端抽屉显示 |

### 3. 组件层

#### 3.1 AITools.jsx

**职责**: 智能搜索和AI工具入口

**功能**:
- 多搜索引擎切换（百度、Bing、GitHub、知乎）
- 搜索历史记录（localStorage，最多10条）
- AI工具快捷链接（ChatGPT、Claude、DeepSeek等）
- 快捷链接（Google、GitHub、YouTube等）

**状态**:
- `query`: 搜索关键词
- `showHistory`: 是否显示搜索历史
- `searchHistory`: 搜索历史数组

#### 3.2 Bookmarks.jsx / FlatBookmarks.jsx

**职责**: 书签管理和展示

**功能**:
- 书签 CRUD 操作
- 分类管理（增删改、图标选择）
- 书签搜索（按名称、URL、分类）
- 排序方式（名称、访问量、创建时间）
- 批量操作（多选、移动、删除）
- 右键菜单
- 拖拽排序
- 常用书签快速访问
- 自动获取Favicon
- 访问统计

#### 3.3 Weather.jsx

**职责**: 天气信息展示

**功能**:
- 支持40+中国城市
- 自定义城市添加
- 实时天气数据
- 5天天气预报
- 天气缓存（10分钟）
- 模拟数据备用

**数据来源**: 中国天气网 API

#### 3.4 Calendar.jsx / CalendarWidget.jsx

**职责**: 日历显示和交互

**功能**:
- 今日信息展示（阳历、农历、干支纪年）
- 节日和节气标记
- 点击弹出完整日历

#### 3.5 CalendarPopup.jsx

**职责**: 完整日历弹窗

**功能**:
- 月视图和年视图切换
- 日历导航（上一月、下一月、上一年、下一年）
- 事件管理（添加、删除、颜色选择）
- 节日和节气显示
- 农历日期显示
- 选中日期详情面板

**数据存储**: `nav_app_calendar` → localStorage

#### 3.6 TodoList.jsx

**职责**: 待办事项管理

**功能**:
- 待办 CRUD
- 分类筛选（全部、工作、生活、学习、其他）
- 状态筛选（全部、未完成、已完成、今日、过期）
- 优先级设置（高、中、低）
- 截止日期设置
- 排序（创建时间、优先级、截止日期）
- 全选/取消全选
- 清除已完成

**分类配置**:
```javascript
[
  { id: 'all', label: '全部', color: '#6c63ff' },
  { id: 'work', label: '工作', color: '#f87171' },
  { id: 'life', label: '生活', color: '#34d399' },
  { id: 'study', label: '学习', color: '#60a5fa' },
  { id: 'other', label: '其他', color: '#a78bfa' }
]
```

#### 3.7 HotNews.jsx

**职责**: 热搜榜单聚合

**支持平台**:
| 平台 | 标识 | 颜色 |
|------|------|------|
| 知乎 | zhihu | #0084ff |
| B站 | bilibili | #00a1d6 |
| 微博 | weibo | #e6162d |
| 抖音 | douyin | #000000 |
| 头条 | toutiao | #d81e06 |

**功能**:
- 平台切换
- 新闻列表展示
- 访问量显示
- 自动刷新（5分钟缓存）
- 模拟数据备用

#### 3.8 Countdown.jsx

**职责**: 倒计时工具

**功能**:
- 一次性倒计时（指定日期时间）
- 每日循环倒计时（每日定点）
- 快捷预设（下班、午休、晚饭、睡觉）
- 计时器功能
- 颜色自定义
- 实时更新（每秒）

#### 3.9 Memo.jsx

**职责**: 备忘录/便签功能

**功能**:
- 便签 CRUD
- 颜色选择（8种预设颜色）
- 标题和内容分离
- 网格布局展示
- 时间戳显示

**颜色预设**:
```javascript
['#ffd700', '#ff6b6b', '#69db7c', '#74c0fc', '#da77f2', '#ff922b', '#20c997', '#748ffc']
```

#### 3.10 SettingsPanel.jsx

**职责**: 应用设置面板

**功能**:
- 主题切换（深色/亮色）
- 数据导出（JSON格式）
- 数据导入
- 数据清除（危险操作，需二次确认）

#### 3.11 ErrorBoundary.jsx

**职责**: 错误边界，捕获子组件渲染错误

**功能**:
- 捕获 JavaScript 错误
- 降级 UI 显示
- 重置和刷新选项
- 开发环境显示详细错误信息

#### 3.12 ErrorMessage.jsx

**职责**: 通用错误消息组件

**功能**:
- 支持多种类型（error、warning、info）
- 重试按钮
- 自定义消息显示

---

## 关键类与函数说明

### Hooks

#### useTime.jsx

```javascript
// 时间上下文 Provider
<TimeProvider> → 提供时间状态

// 时间 Hook
useTime() → { currentTime, formatTime, formatDate }
```

**核心函数**:
| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `formatTime` | `date?` | `"HH:mm:ss"` | 格式化时间 |
| `formatDate` | `date?` | `"YYYY年MM月DD日 星期X"` | 格式化日期 |

#### useTheme.jsx

```javascript
// 主题上下文
<ThemeProvider> → { theme, toggleTheme, setLightTheme, setDarkTheme }

// 主题 Hook
useTheme() → { theme, toggleTheme, setLightTheme, setDarkTheme }

// 主题常量
THEMES.DARK  // 'dark'
THEMES.LIGHT // 'light'
```

**存储键**: `nav_app_theme`

**特性**:
- 自动检测系统主题偏好
- localStorage 持久化
- 监听系统主题变化

#### useGreeting.js

```javascript
useGreeting() → string
```

**规则**:
| 时间段 | 问候语 |
|--------|--------|
| 0:00 - 6:00 | 夜深了 🌙 |
| 6:00 - 9:00 | 早上好 🌅 |
| 9:00 - 12:00 | 上午好 ☀️ |
| 12:00 - 14:00 | 中午好 🌞 |
| 14:00 - 18:00 | 下午好 🌤 |
| 18:00 - 24:00 | 晚上好 🌆 |

#### useDebounce.js

```javascript
// 值防抖
useDebounce(value, delay) → debouncedValue

// 回调防抖
useDebouncedCallback(callback, delay) → debouncedCallback

// 节流
useThrottle(callback, limit) → throttledCallback
```

#### useKeyboardShortcuts.js

```javascript
useKeyboardShortcuts({
  focusSearch,    // Ctrl/Cmd + K
  toggleTheme,   // Ctrl/Cmd + D
  closeModal,     // Escape
  showHelp        // ?
})
```

#### useLayoutStorage.js

```javascript
useLayoutStorage() → { layouts, editMode, setEditMode, onLayoutChange, resetLayout }
```

**布局配置**:
```javascript
DEFAULT_LAYOUTS = {
  lg: [...],  // 大屏幕（≥1200px）
  md: [...],  // 中等屏幕（≥996px）
  sm: [...],  // 小屏幕（≥768px）
  xs: [...]   // 超小屏幕（<768px）
}
```

### 工具函数

#### lunarCalendar.js

**核心函数**:

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getLunarYearInfo` | `year: number` | `{tianGan, diZhi, shengXiao, ganZhi}` | 获取农历年信息 |
| `solarToLunar` | `date: Date` | `{year, month, day, isLeap, monthName, dayName, ...}` | 阳历转农历 |
| `getJieQi` | `date: Date` | `string \| null` | 获取二十四节气 |
| `getLunarInfo` | `date: Date` | `{yearGanZhi, yearShengXiao, currentJieQi, ...}` | 获取完整农历信息 |
| `formatLunarDisplay` | `date: Date` | `{main, sub, full}` | 格式化农历显示 |

**常量数据**:
- `TIAN_GAN`: 天干数组 `['甲', '乙', '丙', ...]`
- `DI_ZHI`: 地支数组 `['子', '丑', '寅', ...]`
- `SHENG_XIAO`: 生肖数组 `['鼠', '牛', '虎', ...]`
- `LUNAR_MONTH_NAME`: 农历月份名 `['正', '二', '三', ...]`
- `LUNAR_DAY_NAME`: 农历日期名 `['初一', '初二', ...]`
- `JIE_QI`: 二十四节气 `['小寒', '大寒', '立春', ...]`

#### security.js

**核心函数**:

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `isValidUrl` | `string` | `boolean` | 验证 URL 合法性 |
| `normalizeUrl` | `url` | `string` | 标准化 URL（添加 https://） |
| `sanitizeHtml` | `str` | `string` | HTML 实体转义 |
| `sanitizeText` | `str` | `string` | 移除 HTML 标签 |
| `validateBookmark` | `bookmark` | `Object \| null` | 验证书签数据 |
| `escapeHtmlAttr` | `str` | `string` | HTML 属性值转义 |

#### apiErrorHandler.js

**核心函数**:

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `analyzeError` | `error` | `ErrorTypes` | 分析错误类型 |
| `getErrorMessage` | `error, fallbackMessage` | `string` | 获取用户友好错误消息 |
| `fetchWithTimeout` | `url, options, timeout` | `Promise` | 带超时的 fetch |
| `withRetry` | `fn, maxRetries, delay` | `Promise` | 重试机制包装器 |
| `apiRequest` | `url, options` | `Promise` | API 请求包装器 |

**错误类型**:
```javascript
ErrorTypes = {
  NETWORK: 'network',    // 网络错误
  TIMEOUT: 'timeout',    // 超时错误
  SERVER: 'server',      // 服务器错误（5xx）
  CLIENT: 'client',      // 客户端错误（4xx）
  UNKNOWN: 'unknown'     // 未知错误
}
```

#### dataManagement.js

**核心函数**:

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `exportAllData` | - | `boolean` | 导出所有数据为 JSON |
| `importData` | `file` | `Promise<{success, count, message}>` | 导入数据 |
| `clearAllData` | - | - | 清除所有数据并刷新 |

**导出格式**:
```javascript
{
  version: '1.0',
  exportTime: 'ISO时间戳',
  appName: 'nav-app',
  data: {
    nav_app_todos_v1: [...],
    nav_app_memos_v1: [...],
    // ...
  }
}
```

#### favicon.js

**核心函数**:

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getFavicon` | `url` | `Promise<string>` | 获取网站 Favicon |
| `clearFaviconCache` | - | - | 清除 Favicon 缓存 |

**Favicon 服务优先级**:
1. faviconkit.com
2. Google Favicon API
3. icon.horse
4. DuckDuckGo Icons
5. allesedv.com

**备用方案**: 生成渐变色首字母 SVG 图标

#### icons.jsx

**SVG 图标映射**: `SVG_ICONS` 对象包含 40+ SVG 图标定义

**核心函数**:

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `Icon` | `{name, size, className, color}` | `ReactNode` | SVG 图标组件 |
| `getWeatherIcon` | `code` | `string` | 天气代码转图标名 |
| `iconToString` | `name` | `string` | 图标转 data URI |

**常用图标名**:
`sun`, `cloud`, `cloudSun`, `cloudRain`, `cloudSnow`, `cloudLightning`, `moon`, `wind`, `cloudFog`, `calendar`, `checkCircle`, `plus`, `minus`, `x`, `clock`, `list`, `fileText`, `bookmark`, `news`, `trash`, `edit`, `star`, `refreshCw`, `info`, `alertCircle`, `alertTriangle`, `chevronLeft`, `chevronRight` 等

---

## 依赖关系

### 生产依赖

```
react@19.2.6          # React 核心库
react-dom@19.2.6     # React DOM 渲染
react-grid-layout@2.2.3  # 可拖拽网格布局
react-icons@5.6.0    # 图标库（备用）
```

### 开发依赖

```
vite@8.0.12                    # 构建工具
@vitejs/plugin-react@6.0.1     # Vite React 插件
vitest@4.1.6                   # 测试框架
@testing-library/react@16.3.2  # React 测试库
@testing-library/jest-dom@6.9.1 # Jest DOM 匹配器
@testing-library/user-event@14.6.1  # 用户事件模拟
eslint@10.3.0                  # 代码检查
eslint-config-prettier@10.1.8  # Prettier ESLint 配置
eslint-plugin-prettier@5.5.5   # ESLint Prettier 插件
eslint-plugin-react-hooks@7.1.1 # React Hooks 规则
eslint-plugin-react-refresh@0.5.2  # React Fast Refresh
prettier@3.8.3                 # 代码格式化
jsdom@29.1.1                   # DOM 模拟环境
```

### 组件依赖图

```
App.jsx
├── useGreeting (hook)
├── useTime (hook)
├── useLayoutStorage (hook)
├── useTheme (hook)
├── useKeyboardShortcuts (hook)
├── AITools (lazy)
├── Weather (lazy)
├── HotNews (lazy)
├── CalendarWidget
│   ├── Calendar
│   │   └── CalendarPopup
│   │       └── lunarCalendar (utils)
│   └── LunarCalendar
├── TodoList
│   └── icons (utils)
├── Countdown
│   └── icons (utils)
├── Memo
│   └── icons (utils)
├── FlatBookmarks
│   ├── security (utils)
│   ├── favicon (utils)
│   └── useDebounce (hook)
├── SettingsPanel
│   ├── useTheme (hook)
│   └── dataManagement (utils)
└── ErrorBoundary
```

### 数据流依赖

```
localStorage
├── nav_app_theme              → useTheme.jsx
├── nav_app_layout             → useLayoutStorage.jsx
├── nav_app_edit_mode          → useLayoutStorage.jsx
├── nav_app_todos_v1           → TodoList.jsx
├── nav_app_memos_v1           → Memo.jsx
├── nav_app_bookmarks_v1       → Bookmarks.jsx / FlatBookmarks.jsx
├── nav_app_categories_v1      → Bookmarks.jsx / FlatBookmarks.jsx
├── nav_app_bookmark_stats_v1  → Bookmarks.jsx / FlatBookmarks.jsx
├── nav_app_countdowns_v1      → Countdown.jsx
├── nav_app_events_v1          → CalendarPopup.jsx
├── nav_app_weather_cache_v1   → Weather.jsx
├── nav_app_hotnews_cache_v1   → HotNews.jsx
└── nav_app_custom_city_v1     → Weather.jsx
```

---

## 项目运行方式

### 环境要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0 或 **pnpm**: >= 7.0.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm（推荐）
pnpm install
```

### 开发环境

```bash
# 启动开发服务器
npm run dev
# 访问 http://localhost:5173
```

### 生产构建

```bash
# 构建生产版本
npm run build
# 输出目录: dist/

# 预览生产版本
npm run preview
```

### 代码质量

```bash
# ESLint 检查
npm run lint

# 自动修复 ESLint 问题
npm run lint:fix

# Prettier 格式化
npm run format

# Prettier 格式检查
npm run format:check
```

### 测试

```bash
# 运行所有测试
npm run test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

---

## 数据存储机制

### localStorage 存储键

| 键名 | 数据类型 | 说明 |
|------|----------|------|
| `nav_app_theme` | `string` | 主题设置 (dark/light) |
| `nav_app_layout` | `JSON` | 网格布局配置 |
| `nav_app_edit_mode` | `boolean` | 编辑模式状态 |
| `nav_app_todos_v1` | `JSON[]` | 待办事项列表 |
| `nav_app_memos_v1` | `JSON[]` | 备忘录列表 |
| `nav_app_bookmarks_v1` | `JSON[]` | 书签列表 |
| `nav_app_categories_v1` | `JSON[]` | 书签分类列表 |
| `nav_app_bookmark_stats_v1` | `JSON` | 书签访问统计 |
| `nav_app_countdowns_v1` | `JSON[]` | 倒计时列表 |
| `nav_app_events_v1` | `JSON[]` | 日历事件列表 |
| `nav_app_weather_cache_v1` | `JSON` | 天气数据缓存 |
| `nav_app_hotnews_cache_v1` | `JSON` | 热榜数据缓存 |
| `nav_app_custom_city_v1` | `JSON` | 自定义城市 |
| `navAppSearchHistory` | `string[]` | 搜索历史 |
| `nav_app_search_history` | `string[]` | 书签搜索历史 |

### 缓存策略

| 数据类型 | 缓存时间 | 说明 |
|----------|----------|------|
| 天气数据 | 10 分钟 | `CACHE_CONFIG.WEATHER_DURATION` |
| 热榜数据 | 5 分钟 | `CACHE_CONFIG.NEWS_DURATION` |
| 其他数据 | 永久 | 需用户手动清除或覆盖 |

### 数据导出格式

```json
{
  "version": "1.0",
  "exportTime": "2026-05-20T10:30:00.000Z",
  "appName": "nav-app",
  "data": {
    "nav_app_todos_v1": [...],
    "nav_app_memos_v1": [...],
    "nav_app_bookmarks_v1": [...],
    "nav_app_countdowns_v1": [...],
    "nav_app_events_v1": [...],
    "nav_app_layout": {...},
    "nav_app_edit_mode": false
  }
}
```

---

## 主题系统

### 主题架构

```
App
└── ThemeProvider
    └── theme: 'dark' | 'light'
        └── document.documentElement.setAttribute('data-theme', theme)
```

### CSS 变量

**暗色主题** (`data-theme="dark"`):

```css
:root,
[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-tertiary: #0f3460;
  --text-primary: #eaeaea;
  --text-secondary: #a0a0a0;
  --accent-500: #6c63ff;
  --accent-soft: rgba(108, 99, 255, 0.2);
  --border: #2a2a4a;
  /* ... */
}
```

**亮色主题** (`data-theme="light"`):

```css
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --accent-500: #6c63ff;
  --accent-soft: rgba(108, 99, 255, 0.1);
  --border: #dee2e6;
  /* ... */
}
```

### 主题切换

```javascript
// 切换主题
toggleTheme() → setTheme(prev => prev === 'dark' ? 'light' : 'dark')

// 设置特定主题
setLightTheme() → setTheme('light')
setDarkTheme() → setTheme('dark')
```

---

## 组件清单

### 主组件

| 组件名 | 文件路径 | 功能 |
|--------|----------|------|
| `App` | `App.jsx` | 主应用组件 |
| `AITools` | `AITools.jsx` | 搜索和AI工具 |
| `Bookmarks` | `Bookmarks.jsx` | 完整书签管理 |
| `FlatBookmarks` | `FlatBookmarks.jsx` | 扁平化书签 |
| `Calendar` | `Calendar.jsx` | 日历卡片 |
| `CalendarWidget` | `CalendarWidget.jsx` | 日历小部件 |
| `CalendarPopup` | `CalendarPopup.jsx` | 日历弹窗 |
| `TodoList` | `TodoList.jsx` | 待办事项 |
| `Weather` | `Weather.jsx` | 天气组件 |
| `HotNews` | `HotNews.jsx` | 热榜资讯 |
| `Countdown` | `Countdown.jsx` | 倒计时 |
| `Memo` | `Memo.jsx` | 备忘录 |
| `SettingsPanel` | `SettingsPanel.jsx` | 设置面板 |
| `LunarCalendar` | `LunarCalendar.jsx` | 农历日历条 |
| `ErrorBoundary` | `ErrorBoundary.jsx` | 错误边界 |
| `ErrorMessage` | `ErrorMessage.jsx` | 错误消息 |

### 子组件 (calendar/)

| 组件名 | 功能 |
|--------|------|
| `CalendarHeader` | 日历头部导航 |
| `MonthView` | 月视图 |
| `TodayCard` | 今日卡片 |
| `EventForm` | 事件表单 |
| `EditableEventForm` | 可编辑事件表单 |

### 子组件 (weather/)

| 组件名 | 功能 |
|--------|------|
| `WeatherForecast` | 天气预报组件 |

### 工具组件

| 组件 | 功能 |
|------|------|
| `Icon` | SVG 图标组件 |
| `WidgetItem` | 小部件包装器 |
| `MobileWidgetItem` | 移动端小部件 |
| `ShortcutHelp` | 快捷键帮助面板 |

---

## 附录

### 快捷键映射

| 快捷键 | 功能 | 处理函数 |
|--------|------|----------|
| `Ctrl/Cmd + K` | 聚焦搜索框 | `focusSearch` |
| `Ctrl/Cmd + D` | 切换主题 | `toggleTheme` |
| `Escape` | 关闭弹窗 | `closeModal` |
| `?` | 显示帮助 | `showHelp` |

### 搜索引擎配置

```javascript
const SEARCH_ENGINES = [
  { name: '百度', url: 'https://www.baidu.com/s?wd=', favicon: '...' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=', favicon: '...' },
  { name: 'GitHub', url: 'https://github.com/search?q=', favicon: '...' },
  { name: '知乎', url: 'https://www.zhihu.com/search?type=content&q=', favicon: '...' }
]
```

### 默认分类

```javascript
[
  { name: '常用网站', icon: 'globe' },
  { name: '工作学习', icon: 'briefcase' },
  { name: 'AI 工具', icon: 'cpu' },
  { name: '娱乐生活', icon: 'play' },
  { name: '开发工具', icon: 'wrench' }
]
```

### 二十四节气

```
小寒 → 大寒 → 立春 → 雨水 → 惊蛰 → 春分 → 清明 → 谷雨 →
立夏 → 小满 → 芒种 → 夏至 → 小暑 → 大暑 → 立秋 → 处暑 →
白露 → 秋分 → 寒露 → 霜降 → 立冬 → 小雪 → 大雪 → 冬至
```

---

**文档版本**: 1.0  
**最后更新**: 2026-05-20  
**项目名称**: 皮皮导航 (Pipi Nav)
