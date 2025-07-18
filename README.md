 # BrowseBase

> 链接，像盲盒一样简单 | 资源导航

BrowseBase 是一个基于 React + TypeScript + Vite 的现代化资源导航网站，支持多种资源分类、标签筛选、资源预览和管理后台。你可以像打开盲盒一样发现和分享有趣的链接，打造你的专属资源库。

## 项目特性

- 🗂️ 资源分类与标签筛选，支持多种资源类型（如 AI 工具、教程、网站等）
- 🎁 盲盒式资源发现体验
- 🔍 支持资源搜索与分页浏览
- 📝 管理后台可增删改查资源（需管理员登录）
- 🌈 响应式布局与优雅动画，支持深色/复古主题切换
- 🔒 支持邮箱密码、Magic Link 及 Google OAuth 管理员登录
- 🌐 多语言支持（i18n）
- 📊 集成 Google Analytics 统计
- ⚡ 基于 Vite 极速开发，Tailwind CSS 样式管理

## 技术栈

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase（认证与数据）
- React Router v7
- ESLint + TypeScript 严格模式

## 目录结构

```
BrowseBase/
├── public/                # 静态资源
├── src/
│   ├── components/        # UI 组件
│   ├── pages/             # 页面（Home, Admin, Login, About 等）
│   ├── data/              # 模拟数据
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── services/          # 资源服务（API 调用）
│   ├── hooks/             # 自定义 Hook
│   ├── lib/               # 第三方库封装
│   ├── styles/            # 样式文件
│   ├── i18n/              # 国际化
│   ├── App.tsx            # 应用主入口
│   ├── main.tsx           # 挂载入口
│   └── index.css          # 全局样式
├── index.html             # HTML 模板
├── package.json           # 项目依赖与脚本
├── vite.config.ts         # Vite 配置
└── ...
```

## 安装与启动

1. 安装依赖

```bash
npm install
```

2. 启动开发服务器

```bash
npm run dev
```

3. 构建生产版本

```bash
npm run build
```

4. 预览生产版本

```bash
npm run preview
```

## 自部署指南

### 1. 初始化 Supabase 数据库

- 在 Supabase 控制台新建项目。
- 打开 SQL Editor，将本项目根目录下的 `schema.sql` 文件内容全部复制粘贴并运行，自动创建表结构和安全策略（RLS Policies）。
- 可在 Table Editor 检查表和策略是否生效。

### 2. 配置环境变量

- 在项目根目录新建 `.env.local` 文件，内容如下：

```
VITE_SUPABASE_URL=你的-supabase-url
VITE_SUPABASE_ANON_KEY=你的-supabase-anon-key
```

- 这两个值可在 Supabase 项目设置 > API 页面获取。

### 3. 启动本地开发/生产部署

- 本地开发：
  ```bash
  npm install
  npm run dev
  ```
- 构建生产版本：
  ```bash
  npm run build
  npm run preview
  ```
- 你可以将 `dist/` 目录部署到 Vercel、Netlify、Cloudflare Pages 等静态托管平台。

### 4. 管理员账号设置

- 在 `public.profiles` 表中插入一条管理员账号记录，或将已有用户的 `role` 字段改为 `admin`。
- 例如：
  ```sql
  update public.profiles set role = 'admin' where email = '你的管理员邮箱';
  ```
- 管理员可通过登录页进入后台管理。

### 5. 其他注意事项

- 若需自定义策略或表结构，请同步修改 `schema.sql` 并重新导入。
- 生产环境建议定期备份数据库。
- 如遇 Supabase 访问报错，优先检查 RLS 策略和 API Key 配置。

## 核心页面说明

- **首页（Home）**：
  - 展示所有资源，支持分类、标签筛选与分页浏览。
  - 盲盒模式可随机发现资源。
  - 响应式布局，适配移动端。

- **管理后台（Admin）**：
  - 需管理员登录（支持密码、Magic Link、Google OAuth）。
  - 支持资源的增删改查、搜索、分页。
  - 支持分类、标签筛选。

- **登录页（Login）**：
  - 支持多种登录方式，管理员权限校验。

- **关于页（About）**：
  - 展示项目介绍、联系方式等。

## 数据结构（简要）

```typescript
// 分类
interface Category {
  id: string;
  name: string;
  disabled?: boolean;
  icon?: string;
}
// 标签
interface Tag {
  id: string;
  name: string;
  description: string;
}
// 资源
interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  rating: number;
  reviews: number;
}
```

## 开发规范

- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 组件采用函数式编程
- 样式统一使用 Tailwind CSS
- 新增类型请补充到 `types/` 目录
- API 调用需做好错误处理
- 状态管理遵循 React 最佳实践

## 注意事项

- 需配置 `.env.local` 以接入 Supabase 等后端服务
- 管理员账号需在数据库 `profiles` 表中设置 `role=admin`
- 生产环境请注意安全性与数据备份

## 贡献与反馈

欢迎提交 Issue 或 PR 参与改进！如有建议或问题请联系作者。

---


## 自部署指南

### 1. 初始化 Supabase 数据库

- 在 Supabase 控制台新建项目。
- 打开 SQL Editor，将本项目根目录下的 `schema.sql` 文件内容全部复制粘贴并运行，自动创建表结构和安全策略（RLS Policies）。
- 可在 Table Editor 检查表和策略是否生效。

### 2. 配置环境变量

- 在项目根目录新建 `.env.local` 文件，内容如下：

```
VITE_SUPABASE_URL=你的-supabase-url
VITE_SUPABASE_ANON_KEY=你的-supabase-anon-key
```

- 这两个值可在 Supabase 项目设置 > API 页面获取。

### 3. 启动本地开发/生产部署

- 本地开发：
  ```bash
  npm install
  npm run dev
  ```
- 构建生产版本：
  ```bash
  npm run build
  npm run preview
  ```
- 你可以将 `dist/` 目录部署到 Vercel、Netlify、Cloudflare Pages 等静态托管平台。

### 4. 管理员账号设置

- 在 `public.profiles` 表中插入一条管理员账号记录，或将已有用户的 `role` 字段改为 `admin`。
- 例如：
  ```sql
  update public.profiles set role = 'admin' where email = '你的管理员邮箱';
  ```
- 管理员可通过登录页进入后台管理。

### 5. 其他注意事项

- 若需自定义策略或表结构，请同步修改 `schema.sql` 并重新导入。
- 生产环境建议定期备份数据库。
- 如遇 Supabase 访问报错，优先检查 RLS 策略和 API Key 配置。
