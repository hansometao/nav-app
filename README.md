# 皮皮导航 (nav-app)

一个现代化、功能丰富的个人导航页面应用，基于 React + Vite 构建。

## ✨ 特性

### 核心功能
- **🔍 智能搜索** - 支持多个搜索引擎（百度、Bing、GitHub、知乎），一键切换
- **📌 书签管理** - 分类管理网址书签，支持添加、编辑、删除、自定义图标
- **🤖 AI 工具导航** - 聚合主流 AI 工具入口，快速访问
- **⛈️ 天气查询** - 实时天气信息，支持城市搜索（中国气象局数据）
- **📰 热点资讯** - 聚合多平台热榜（知乎、B站、微博、抖音、头条）
- **📅 日历** - 农历日历，支持事件管理、节日标记
- **✅ 待办事项** - 任务管理，支持优先级、分类、筛选
- **⏱️ 倒计时** - 重要日期倒计时、计时器功能
- **📝 备忘录** - 快速记录想法和笔记

### 用户体验
- **🌓 深色/浅色主题** - 一键切换，自动记忆偏好
- **⌨️ 键盘快捷键** - 高效操作，Ctrl+K 聚焦搜索，Ctrl+D 切换主题
- **📱 响应式设计** - 适配桌面端、平板、手机
- **💾 数据持久化** - 本地存储，支持导入导出备份
- **🎨 流畅动画** - 精心设计的过渡动画和交互反馈

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
nav-app/
├── src/
│   ├── components/          # React 组件
│   │   ├── calendar/        # 日历相关组件（可复用子组件）
│   │   ├── AITools.jsx     # AI 工具和搜索组件
│   │   ├── Bookmarks.jsx   # 书签管理组件
│   │   ├── Calendar.jsx    # 日历组件
│   │   ├── Countdown.jsx   # 倒计时组件
│   │   ├── ErrorMessage.jsx # 统一错误提示组件
│   │   ├── FlatBookmarks.jsx # 扁平化书签展示
│   │   ├── HotNews.jsx     # 热榜组件
│   │   ├── LunarCalendar.jsx # 农历显示
│   │   ├── Memo.jsx        # 备忘录组件
│   │   ├── SettingsPanel.jsx # 设置面板
│   │   ├── TodoList.jsx    # 待办事项组件
│   │   └── Weather.jsx     # 天气组件
│   ├── hooks/              # 自定义 React Hooks
│   │   ├── useGreeting.js      # 问候语
│   │   ├── useKeyboardShortcuts.js # 键盘快捷键
│   │   ├── useLayoutStorage.js  # 布局存储
│   │   ├── useTheme.jsx         # 主题管理
│   │   └── useTime.jsx         # 时间管理
│   ├── utils/              # 工具函数
│   │   ├── apiErrorHandler.js  # API 错误处理
│   │   ├── dataManagement.js   # 数据导入导出
│   │   ├── favicon.js          # Favicon 获取
│   │   ├── icons.jsx           # 图标组件
│   │   ├── lunarCalendar.js    # 农历计算
│   │   └── security.js         # 安全工具
│   ├── config/             # 配置文件
│   │   └── storage.js     # 存储键配置
│   ├── test/               # 测试文件
│   │   ├── hooks/          # Hooks 测试
│   │   └── utils/         # 工具函数测试
│   ├── App.css            # 主样式文件
│   ├── App.jsx            # 主应用组件
│   ├── index.css          # 全局样式
│   └── main.jsx           # 应用入口
├── public/                # 公共资源
├── eslint.config.js       # ESLint 配置
├── vite.config.js         # Vite 配置
└── package.json
```

## 🧪 测试

运行单元测试：

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test

# 生成测试覆盖率报告
npm run test:coverage
```

测试框架使用 Vitest + React Testing Library。

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + K` | 聚焦搜索框 |
| `Ctrl/Cmd + D` | 切换深色/浅色主题 |
| `Escape` | 关闭弹窗/面板 |
| `?` | 显示快捷键帮助 |

## 🎨 自定义配置

### 修改默认书签

编辑 `src/components/FlatBookmarks.jsx` 中的 `DEFAULT_BOOKMARKS` 数组：

```javascript
const DEFAULT_BOOKMARKS = [
  { name: 'Google', url: 'https://www.google.com', favicon: '', category: '常用网站' },
  // 添加更多...
];
```

### 添加新的搜索引擎

编辑 `src/components/AITools.jsx` 中的 `SEARCH_ENGINES` 数组：

```javascript
const SEARCH_ENGINES = [
  { name: '百度', url: 'https://www.baidu.com/s?wd=', favicon: '...' },
  // 添加更多...
];
```

### 添加天气城市

编辑 `src/components/Weather.jsx` 中的 `CITY_DB` 数组，添加新的城市代码。

## 🔧 开发指南

### 代码规范

项目使用 ESLint 进行代码检查：

```bash
npm run lint
```

### 提交代码

1. 确保所有测试通过：`npm test`
2. 确保没有 lint 错误：`npm run lint`
3. 提交前运行构建确认：`npm run build`

### 添加新组件

1. 在 `src/components/` 目录下创建新组件
2. 如果是复杂组件，考虑拆分到子目录
3. 遵循现有组件的命名和导入规范

### 添加新 Hook

1. 在 `src/hooks/` 目录下创建
2. 使用 `use` 前缀命名
3. 导出 Hook 函数和必要的常量

## 📦 依赖说明

### 主要依赖

- **react** ^19.2.6 - UI 框架
- **react-dom** ^19.2.6 - React DOM 渲染
- **react-grid-layout** ^2.2.3 - 拖拽布局
- **react-icons** ^5.6.0 - 图标库

### 开发依赖

- **vite** ^8.0.12 - 构建工具
- **@vitejs/plugin-react** ^6.0.1 - Vite React 插件
- **vitest** ^4.1.6 - 测试框架
- **@testing-library/react** ^16.3.2 - React 测试工具

## 🌐 API 数据源

- **天气数据**: 中国气象局 / 中国天气网
- **热榜数据**: 
  - 知乎: oioweb.cn API
  - B站: bilibili API
  - 微博: oioweb.cn API
  - 其他: Mock 数据

## 📄 许可证

本项目仅供个人学习使用。

## 🙏 致谢

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [react-icons](https://react-icons.github.io/react-icons/)
- [Vitest](https://vitest.dev/)
