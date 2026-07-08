---
title: '给采购业务搭了官网和自建后台'
description: 'abelsourcing.com 的建站记录：纯静态 HTML 官网 + VPS 上自托管的线索管理后台，不依赖第三方 SaaS。'
pubDate: 'Jun 30 2026'
heroImage: '../../assets/hero-abelsourcing.jpg'
tags: ['建站', '独立开发', '搞钱', 'SEO']
---

## 一个网站，两个部分 / One Site, Two Halves

这个月把采购业务的线上门面搭起来了：[abelsourcing.com](https://abelsourcing.com)。它分两部分——对外的营销官网，和对内的管理后台。

This month I built the online presence for my sourcing business: abelsourcing.com. It has two halves — a public marketing site, and an internal admin backend.

---

## 官网：能不用框架就不用 / The Website: No Framework Needed

官网是**纯静态 HTML**：首页、服务页、关于、联系方式、品类落地页，加上 SEO 博客文章。共享一份 `style.css` 和 `main.js`，没有构建步骤，部署就是往 Cloudflare 传文件。

The marketing site is **plain static HTML**: homepage, services, about, contact, category landing pages, plus SEO blog articles. One shared `style.css` and `main.js`, no build step — deploying means uploading files to Cloudflare.

对内容型营销站来说，这个技术选型的好处是：加载快、零依赖、永远不会因为框架升级而坏掉。写文章就是写 HTML，改样式就是改 CSS，简单到无聊，但业务网站要的就是无聊。

For a content-driven marketing site, this stack means fast loads, zero dependencies, and nothing that breaks when a framework ships a major version. Writing an article means writing HTML. Boring — and boring is exactly what a business site should be.

---

## 后台：把 SaaS 的钱省了 / The Backend: Skipping the SaaS Tax

有意思的是后台。线索管理这件事，市面上的 CRM 都太重（也太贵），所以在 VPS 上自建了一个轻量后台：

The interesting half is the backend. Every CRM out there felt too heavy (and too expensive) for lead management, so I self-hosted a lightweight admin on a VPS:

- **线索捕获 API**：官网联系表单直接打到自己的接口，存 SQLite
- **跟进工作流**：线索状态流转、跟进笔记、到期跟进提醒面板
- **自托管分析**：缓存 GA4 和 Search Console 数据，流量、获客、内容、转化各一页
- **客户调研 + 外联邮件草稿**的工作流页面，CSV 一键导出

- **Lead capture API**: the site's contact form posts straight to my own endpoint, stored in SQLite
- **Follow-up workflow**: lead status transitions, notes, and a due-follow-up dashboard
- **Self-hosted analytics**: cached GA4 and Search Console data — traffic, acquisition, content, conversions
- **Customer research and outreach-draft** workflow pages, with one-click CSV export

一个密码保护的 Node 应用，SQLite 存储,PM2 守护。没有月费,数据全在自己手里。

One password-protected Node app, SQLite storage, kept alive by PM2. No monthly fees, and the data stays mine.

---

## 收获 / Takeaways

工具链的每一环都在为业务服务，而不是反过来。**静态官网负责被搜到，自建后台负责不丢单**——这套组合的维护成本几乎为零，对一人公司刚刚好。

Every link in this toolchain serves the business, not the other way around. **The static site gets found; the self-hosted backend makes sure no lead slips through** — near-zero maintenance, which is exactly right for a company of one.
