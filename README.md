# Kapium

我的新博客

## 功能特性

- **Markdown 转 HTML**: 使用 MD4C 库将 Markdown 文档转换为 HTML
- **文章元数据处理**: 自动提取并处理文章元数据（如标题、分类、标签等）
- **自动摘要生成**: 支持 `<!-- more -->` 标记或自动生成文章摘要
- **阅读时间计算**: 根据文章长度计算预估阅读时间
- **目录生成**: 自动生成基于标题的文章目录
- **链接缩略**: 提供文章链接的缩略功能
- **SEO 友好**: 生成适合搜索引擎优化的 HTML 结构

## 技术栈

### 后端（静态网站生成器）

- **编程语言**: C & C++
- **Markdown 解析库**: [MD4C](https://github.com/mity/md4c)
- **JSON 处理**: [nlohmann/json](https://github.com/nlohmann/json)

### 前端（用户界面）

- **框架**: React
- **路由**: Wouter
- **状态管理**: React Hooks (useState, useCallback)
- **样式**: Tailwind CSS
- **类型检查**: TypeScript

## 目录结构

```
kapium/
├── ssg/                    # 静态网站生成器源代码
│   ├── include/            # 头文件
│   ├── lib/                # 第三方库
│   │   ├── md4c/           # MD4C Markdown 解析库
│   │   └── nlohmm/         # JSON 库
│   └── src/                # 源代码文件
│       ├── main.cpp        # 主程序入口
│       ├── md4cCallback.cpp # Markdown 解析回调函数
│       └── post/           # 文章处理相关代码
├── sources/                # 原始内容文件
│   └── posts/              # 博客文章
└── frontend/               # 前端 React 代码
    ├── src/
    │   ├── components/     # 可复用组件
    │   ├── pages/          # 页面组件
    │   ├── hooks/          # 自定义 Hook
    │   ├── lib/            # 工具函数和工具库
    │   └── styles/         # 样式文件
    ├── public/             # 静态资源
    └── package.json        # 项目依赖配置
```

## 依赖项

- C++17 或更高版本的编译器
- OpenSSL 用于abbrlink生成（是的，很蠢）
- CMake 3.10 或更高版本
- Node.js v18+ (前端)
- Git（用于克隆子模块）