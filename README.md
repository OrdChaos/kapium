# Kapium

我的新博客

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)

## 功能说明

- ✨ **智能摘要**: 自动或手动 AI 摘要生成
- 🎨 **主题切换**: 内置深色/浅色主题
- 📊 **浏览统计**: 集成 Umami 分析
- 🔍 **SEO 优化**: 自动生成 Sitemap 和 RSS Feed
- ⚡ **高性能**: 静态生成 + 客户端优化

## 技术栈

### 后端（静态网站生成器）

- **编程语言**: C & C++
- **Markdown 解析库**: [MD4C](https://github.com/mity/md4c) - 快速、轻量级的 Markdown 解析器
- **JSON 处理**: [nlohmann/json](https://github.com/nlohmann/json) - C++ JSON 库
- **XML 生成**: [tinyxml2](https://github.com/leethomason/tinyxml2) - 用于生成 sitemap.xml 和 RSS feed
- **文本处理**: 实现了 Markdown 到纯文本的转换，以及文章信息计算（如阅读时间）

### 前端

- **框架**: React (v18+)
- **路由**: Wouter - 轻量级路由解决方案
- **UI 库**: 
  - Radix UI Primitives - 无障碍、可定制的组件
  - Shadcn/ui - 美观的 React 组件集合
  - Lucide React - 一致的图标集
- **状态管理**: React Hooks (useState, useCallback)
- **样式**: Tailwind CSS - 实用优先的 CSS 框架
- **类型检查**: TypeScript
- **构建工具**: Vite
- **UI 组件**:
  - Sonner - 通知组件
  - Framer Motion - 动画效果
  - Vaul - 可滑动的抽屉组件
  - Client-only - 代码分割和客户端特定功能

### AI 摘要

- **连接**：使用 OpenSSL 与 [cpp-httplib](https://github.com/yhirose/cpp-httplib) 连接
- **API 接口**: 阿里云通义千问（qwen-long）

### 依赖项

- C++ 17+
- make
- Node.js v18+
- Git
- OpenSSL

### 项目结构

```
kapium/
├── frontend/          # React 前端应用
├── ssg/               # 静态生成器核心（C++）
├── tools/             # 工具集
│   ├── abbrlink/      # 链接缩略工具
│   └── summary/       # AI 摘要生成
├── scripts/           # 预处理脚本（Node.js）
└── sources/           # 博客内容源文件
    └── posts/         # Markdown 文章
```

## 构建与安装

### 环境配置

修改`frontend/.env`中的信息。

创建 `.env.local` 文件（可选）：

```env
# AI 摘要功能
DASHSCOPE_API_KEY=your_key_here
```

### 构建步骤

初始化：

  ```bash
  git clone https://github.com/Kapium/kapium.git
  cd kapium
  make init
  ```

直接构建整个项目：

   ```bash
   make
   ```

预览：

  ```bash
  make preview
  ```

### 部署

构建完成后，前端文件位于 `frontend/dist/` 目录。

## 许可证

本项目采用分层授权模式：

### 1. 软件代码
本项目的源代码（包括但不限于 `C++` 源文件、头文件及构建脚本）遵循 **[MIT License](LICENSE)**。

### 2. 博客文章与内容
本仓库中所有博客文章、文档及相关多媒体素材均遵循 **[CC BY-NC-SA 4.0](LICENSE-CONTENT)** (署名-非商业性使用-相同方式共享) 协议。

### 3. 第三方组件声明
本项目集成了以下优秀的开源库，其版权及许可归原作者所有：

| 组件名称 | 许可证 | 用途 |
| :--- | :--- | :--- |
| [tinyxml2](https://github.com/leethomason/tinyxml2) | zlib License | XML 解析 |
| [nlohmann/json](https://github.com/nlohmann/json) | MIT License | JSON 处理 |
| [md4c](https://github.com/mity/md4c) | MIT License | Markdown 解析 |
| [cpp-httplib](https://github.com/yhirose/cpp-httplib) | MIT License | HTTP 服务/客户端 |

另外，在预处理脚本`scripts/src`中，使用了[Shiki](https://shiki.style/)与[pangu.js](https://github.com/vinta/pangu.js)

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目！
