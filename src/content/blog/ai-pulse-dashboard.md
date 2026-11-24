---
title: 'AI Pulse：做了个 AI 资讯聚合站，顺便学会了给内容做审计'
description: '用 Next.js 搭的 AI 行业资讯面板：热门话题、新闻、产品动态。最大的收获不是技术，是建立了一套内容真实性核查流程。'
pubDate: 'Jun 19 2026'
heroImage: '../../assets/hero-ai-pulse.webp'
tags: ['nextjs', 'AI', '独立开发']
---

## 项目 / The Project

AI 圈的信息太碎了：新模型发布、融资新闻、产品更新散落在各处。于是用 Next.js 搭了 **AI Pulse**——一个把热门话题、行业新闻、产品动态和洞察聚合到一起的资讯面板，白底玻璃拟态 + 紫蓝渐变的视觉方向。

AI news is scattered everywhere — model launches, funding rounds, product updates. So I built **AI Pulse** with Next.js: a dashboard aggregating trending topics, industry news, product updates and insights, with a white/glassmorphism/purple-blue visual direction.

---

## 意外的主线：内容审计 / The Unexpected Main Quest: Content Auditing

做着做着发现，聚合站最大的风险不是技术，是**内容是假的**。于是给项目建了一套自动化内容审计流程，每条新闻都要溯源核查。

Partway through, it became clear the biggest risk for an aggregator isn't technical — it's **publishing false content**. So the project grew an automated content audit workflow where every news item gets source-verified.

第一轮审计的结果很打脸：8 条新闻里只有 5 条通过核查，**3 条是假的或有严重误导性**，直接删除；13 个信源登记在册；3 个产品的数据被修正。

The first audit round was humbling: of 8 news items, only 5 survived verification — **3 were false or seriously misleading** and got removed; 13 sources were registered; 3 products had their data corrected.

通过核查的新闻长这样：OpenAI 发布 GPT-5（AP News）、Cursor 以 293 亿美元估值完成 23 亿美元 D 轮（CNBC）、ChatGPT 月活破 10 亿（DemandSage）——每条都必须有可点开的信源。

Surviving items look like: OpenAI launches GPT-5 (AP News), Cursor raises $2.3B at a $29.3B valuation (CNBC), ChatGPT crosses 1B MAU (DemandSage) — every item must have a clickable source.

---

## 设计也做了一轮审计 / Design Got Audited Too

内容之外还做了一轮设计审计。结论是典型的"半成品综合征"：方向对，但 spacing、字号、圆角这些 design token 不统一，页面之间缺乏视觉连贯性——看起来是个"搭得不错的原型"，而不是"完成的产品"。后续照着审计报告逐项修。

Design got the same treatment. The verdict was classic "prototype syndrome": right direction, but inconsistent design tokens (spacing, typography, radius) and weak visual cohesion between pages — it read as a "well-built prototype" rather than a "finished product." Fixes followed the audit report item by item.

---

## 收获 / Takeaways

这个项目教我的不是 Next.js，而是**把"审计"当成开发流程的一等公民**：内容要审计信源，设计要审计 token。AI 时代生成内容太容易了,验证内容才是护城河。

What this project taught me wasn't Next.js — it was treating **audits as a first-class part of the dev loop**: content gets source audits, design gets token audits. In the AI era, generating content is trivial; verifying it is the moat.
