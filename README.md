# Kapium

我的新博客

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg) ![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)

## 功能特性

- **Markdown 转 HTML**: 使用 MD4C 库将 Markdown 文档转换为 HTML
- **文章元数据处理**: 自动提取并处理文章元数据（如标题、分类、标签等）
- **自动摘要生成**: 支持 `<!-- more -->` 标记或自动生成文章摘要
- **阅读时间计算**: 根据文章长度计算预估阅读时间
- **目录生成**: 自动生成基于标题的文章目录
- **链接缩略**: 提供文章链接的缩略功能
- **SEO 友好**: 生成适合搜索引擎优化的 HTML 结构
- **代码高亮**: 集成 highlight.js 实现多种语言代码高亮
- **AI 摘要**: 支持通过 API 调用生成文章 AI 摘要

## 技术栈

### 后端（静态网站生成器）

- **编程语言**: C & C++
- **Markdown 解析库**: [MD4C](https://github.com/mity/md4c) - 快速、轻量级的 Markdown 解析器
- **JSON 处理**: [nlohmann/json](https://github.com/nlohmann/json) - C++ JSON 库
- **XML 生成**: tinyxml2 - 用于生成 sitemap.xml 和 RSS feed
- **文本处理**: 实现了 Markdown 到纯文本的转换，以及文章信息计算（如阅读时间）
- **链接生成**: OpenSSL 用于生成 abbrlink（短链接）

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

- **后端框架**: Actix-web (Rust) 或 JavaScript 云函数
- **部署方式**: Docker 容器化部署，或 Serverless 架构
- **API 接口**: 阿里云通义千问（qwen-long）
- **数据库**: MySQL（用于存储摘要信息）

## 目录结构

```
kapium/
├── ssg/                    # 静态网站生成器源代码
│   ├── include/            # 头文件
│   ├── lib/                # 第三方库
│   │   ├── md4c/           # MD4C Markdown 解析库
│   │   ├── nlohmann/       # JSON 库 (修复了README中错误的路径)
│   │   └── tinyxml2/       # XML 生成库
│   └── src/                # 源代码文件
│       ├── Main.cpp        # 主程序入口
│       ├── MdParserCallback.cpp # Markdown 解析回调函数
│       ├── PostData.cpp    # 文章数据处理
│       ├── PostInfoCalculate.cpp # 文章信息计算（如阅读时间）
│       ├── PostProcessor.cpp # 文章处理
│       └── XmlGenerator.cpp # XML 生成（如sitemap, RSS）
├── tools/                  # 辅助工具
│   ├── abbrlink/           # 生成文章短链接
│   └── summary/            # AI 摘要生成工具
├── sources/                # 原始内容文件
│   ├── posts/              # 博客文章
│   └── static/             # 静态资源
├── frontend/               # 前端 React 代码
│   ├── public/             # 静态资源
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hook
│   │   ├── lib/            # 工具函数和工具库
│   │   └── styles/         # 样式文件
│   ├── package.json        # 项目依赖配置
│   └── vite.config.ts      # Vite 配置文件
├── scripts/                # 处理脚本
│   └── src/
│       ├── code.js         # 代码高亮处理
│       └── math.js         # 数学公式处理
└── makefile                # 项目构建文件
```

## 依赖项

- C++17 或更高版本的编译器
- CMake 3.10 或更高版本
- Node.js v18+ (前端)
- Git（用于克隆子模块）
- OpenSSL（用于 abbrlink 生成）
- DASHSCOPE_API_KEY 环境变量（可选，用于 AI 摘要功能）

## 构建与安装

### 构建步骤

直接构建整个项目：
   ```bash
   make
   ```

### 特殊功能说明

- **AI 摘要**: 如果设置了 DASHSCOPE_API_KEY 环境变量，系统将自动为文章生成 AI 摘要
- **代码高亮**: 使用 highlight.js 实现多种语言的代码高亮
- **数学公式**: 支持 LaTeX 数学公式渲染
- **图片处理**: 支持文章内图片的自动处理和优化

## 部署

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

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进项目！