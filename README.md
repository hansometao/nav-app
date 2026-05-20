# 皮皮导航 (Pipi Nav)

一款现代化的导航应用，集成了多种实用工具和信息服务。

## ✨ 功能特性

- 🔍 **智能搜索** - 支持多搜索引擎切换（百度、Bing、GitHub、知乎）
- 📌 **书签管理** - 分类管理、热门书签追踪、Favicon自动获取
- ⛈️ **天气预报** - 实时天气 + 5天天气预报，支持多城市切换
- 📅 **日历组件** - 农历显示、节日节气、事件管理
- 📰 **热榜资讯** - 聚合多个平台的热搜榜单
- ✅ **待办事项** - 分类管理、优先级、截止日期
- ⏱️ **倒计时** - 一次性/每日循环倒计时、计时器
- 📝 **备忘录** - 彩色便签、网格布局
- 🌓 **主题切换** - 深色/浅色模式
- ⌨️ **快捷键支持** - 键盘快捷操作
- 📱 **响应式设计** - 完美适配各种设备

## 🚀 快速开始

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

### 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 pnpm
pnpm dev
```

访问 http://localhost:5173 查看应用

### 构建生产版本

```bash
# 使用 npm
npm run build

# 或使用 pnpm
pnpm build
```

构建产物将输出到 `dist` 目录

### 预览生产版本

```bash
# 使用 npm
npm run preview

# 或使用 pnpm
pnpm preview
```

## 📦 可用脚本

| 命令 | 描述 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览生产版本 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run format` | 运行 Prettier 格式化 |
| `npm run test` | 运行测试 |

## 🧪 测试

项目使用 Vitest 进行单元测试：

```bash
# 运行所有测试
npm run test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## 📁 项目结构

```
nav-app/
├── public/                  # 静态资源
├── src/
│   ├── components/         # React 组件
│   │   ├── calendar/       # 日历相关组件
│   │   ├── weather/        # 天气相关组件
│   │   ├── AITools.jsx     # AI工具和搜索
│   │   ├── Bookmarks.jsx   # 书签管理
│   │   ├── Calendar.jsx     # 日历
│   │   ├── Countdown.jsx    # 倒计时
│   │   ├── FlatBookmarks.jsx # 网址导航
│   │   ├── HotNews.jsx      # 热榜
│   │   ├── Memo.jsx         # 备忘录
│   │   ├── SettingsPanel.jsx # 设置面板
│   │   ├── TodoList.jsx     # 待办事项
│   │   ├── Weather.jsx      # 天气
│   │   └── ...
│   ├── config/             # 配置文件
│   ├── constants/          # 常量定义
│   ├── hooks/             # 自定义 Hooks
│   ├── styles/            # 样式文件
│   ├── test/              # 测试文件
│   ├── utils/             # 工具函数
│   ├── App.css            # 主样式文件
│   ├── App.jsx            # 主应用组件
│   ├── index.css           # 全局样式
│   └── main.jsx           # 入口文件
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── vite.config.js         # Vite 配置
├── vitest.config.js       # Vitest 配置
├── eslint.config.js       # ESLint 配置
└── README.md              # 项目文档
```

## 🎨 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **测试框架**: Vitest
- **代码规范**: ESLint + Prettier
- **样式**: CSS3 + CSS Variables

## 📝 数据存储

应用使用浏览器的 `localStorage` 存储以下数据：

- 用户偏好设置（主题等）
- 书签数据
- 分类数据
- 访问统计
- 搜索历史
- 待办事项
- 备忘录
- 倒计时

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + K` | 聚焦搜索框 |
| `Ctrl/Cmd + D` | 切换主题 |
| `Escape` | 关闭弹窗 |
| `?` | 显示帮助 |

## 🌐 外部 API

天气数据来源：[中国天气网](https://www.weather.com.cn/)

## 📄 License

MIT License
