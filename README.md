# Hanyiask Blog

极简技术博客，AI Product Manager 的个人商业名片。

## 🚀 快速开始

```bash
# 安装依赖（如果还没装）
npm install

# 本地预览
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## ✍️ 如何写新文章

1. 在 `src/content/blog/` 目录下创建一个 `.md` 文件
2. 文件顶部添加 Frontmatter 元数据：

```markdown
---
title: "文章标题"
description: "文章简短描述"
pubDate: 2026-04-15
tags: ["标签1", "标签2"]
---

这里是正文...
```

3. 保存后运行 `npm run dev`，访问 `http://localhost:4321` 预览
4. 构建后推送到 GitHub，Cloudflare Pages 会自动部署

## 📁 目录结构

```
src/
├── content/
│   └── blog/           ← 所有文章放这里
├── components/
│   ├── Header.astro    ← 导航栏
│   └── Footer.astro    ← 页脚
├── layouts/
│   └── BaseLayout.astro ← 基础布局
├── pages/
│   ├── index.astro     ← 首页
│   ├── about.astro      ← 关于我
│   └── blog/
│       ├── index.astro  ← 文章列表
│       └── [slug].astro ← 文章详情
└── styles/
    └── global.css      ← 全局样式
```

## ☁️ 部署到 Cloudflare Pages

1. 将项目推送到 GitHub
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
4. 选择你的 GitHub 仓库
5. 设置构建命令：`npm run build`
6. 设置构建输出目录：`dist`
7. 点击 **Deploy**

之后每次推送到 `main` 分支，都会自动触发构建和部署。

## 🔧 技术栈

- **框架**: Astro v6 (静态站点生成)
- **样式**: TailwindCSS v4
- **内容**: Markdown / MDX
- **部署**: Cloudflare Pages
- **域名**: hi@hanyiask.com（需配置）

## 📝 写作规范

- 使用中文写作
- 代码块使用三个反引号 ``` 包裹
- 标签用英文小写，如 `ai`, `product`, `tooling`
- 日期格式：`YYYY-MM-DD`
