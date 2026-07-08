---
title: '这个博客是怎么来的'
description: '记录这个个人博客的诞生过程：从零开始，用 Astro 搞建，部署到 Vercel。'
pubDate: 'Apr 07 2026'
heroImage: '../../assets/hero-first-post.gif'
tags: ['astro', '博客', 'vercel']
---

## 起因 / Why I Started

2026 年 4 月初，我决定搞一个属于自己的个人博客。原因很简单——想有个地方记录自己的想法、折腾过的项目，以及日常的一些零碎感受。与其把内容散落在各个平台，不如有个自己掌控的空间。

In early April 2026, I decided to build my own personal blog. The reason was simple: I wanted a place to document my thoughts, side projects, and everyday observations — somewhere I actually own, rather than scattered across various platforms.

---

## 项目架构 / Project Architecture

整个项目基于以下技术栈搞建：

The project is built on the following stack:

### 框架 / Framework：Astro

选择 [Astro](https://astro.build) 作为核心框架。Astro 的核心理念是“零 JS 优先”——页面默认输出纹静态 HTML，只有需要交互的部分才会加载 JavaScript。对于博客这种内容为主的场景，再合适不过。

I chose [Astro](https://astro.build) as the core framework. Astro's philosophy is "zero JS by default" — pages ship as pure static HTML, with JavaScript loaded only where interaction is needed. For a content-first site like a blog, it's a perfect fit.

### 内容管理 / Content：Markdown & MDX

博客文章全部以 Markdown（`.md`）或 MDX（`.mdx`）格式存放在 `src/content/blog/` 目录下。Astro 内置的 Content Collections API 提供了类型安全的内容管理，让每篇文章都有结构化的 frontmatter（标题、日期、描述、封面图等）。

All blog posts are written in Markdown (`.md`) or MDX (`.mdx`) and stored under `src/content/blog/`. Astro's built-in Content Collections API provides type-safe content management, with structured frontmatter for each post (title, date, description, hero image, etc.).

### 样式 / Styling：原生 CSS

没有引入额外的 CSS 框架，样式全部用原生 CSS 写在各组件的 `<style>` 标签中。Astro 的 scoped CSS 机制保证了样式不会互相污染。

No CSS frameworks were added — all styles are written in plain CSS inside each component's `<style>` block. Astro's scoped CSS keeps styles isolated by default.

### 部署 / Deployment：Vercel

项目托管在 GitHub 私有仓库，通过 Vercel 自动部署。每次向 `main` 分支推送代码，Vercel 会自动触发构建并发布新版本，整个流程无需任何手动操作。

The project is hosted in a private GitHub repository and deployed automatically via Vercel. Every push to the `main` branch triggers a new build and deployment — fully automated, zero manual steps.

---

## 目录结构 / Project Structure

```
astro-blog/
├── public/               # 静态资源（favicon、头像等）
├── src/
│   ├── assets/           # 图片资源（由 Astro 优化处理）
│   ├── components/       # 公共组件（Header、Footer、BaseHead 等）
│   ├── content/
│   │   └── blog/         # 博客文章（.md / .mdx）
│   ├── layouts/          # 页面布局模板
│   ├── pages/            # 路由页面（index、about、blog）
│   └── styles/           # 全局样式
├── astro.config.mjs      # Astro 配置
└── package.json
```

---

## 后记 / Closing Thoughts

这个博客从立项到第一次部署，前后只花了几天时间。Astro 的开发体验非常顺畅，文档清晰，上手快。后续打算继续完善样式、增加搜索功能，以及持续更新内容。

From idea to first deployment, the whole thing took just a few days. Astro's developer experience is smooth, the docs are clear, and the learning curve is gentle. Going forward, I plan to keep refining the design, add a search feature, and — most importantly — actually keep writing.
