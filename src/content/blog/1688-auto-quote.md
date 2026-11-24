---
title: '用 Playwright 把 1688 报价自动化了'
description: '给采购业务写的自动化工具：批量图搜 1688 相似商品，自动生成带缩略图的 Excel 报价单，支持断点续传和反检测。'
pubDate: 'Jun 25 2026'
heroImage: '../../assets/hero-1688-typing.webp'
tags: ['python', 'playwright', '自动化', '采购']
---

## 为什么做这个 / Why I Built This

做采购业务有个高频重复动作：客户发来一张商品图，我去 1688 拍立淘搜相似款，逐个记录价格、起订量、供应商，最后整理成报价单发回去。一单几十个 SKU 的话，一下午就没了。

Running a sourcing business involves one highly repetitive task: a client sends a product photo, I search 1688's image search for similar listings, record prices, MOQs and suppliers one by one, then compile everything into a quote sheet. With dozens of SKUs per order, that's an entire afternoon gone.

这种"看图 → 搜索 → 抄数据 → 填表"的流程，就是最适合自动化的形状。

This "look at image → search → copy data → fill spreadsheet" loop is exactly the shape of work that begs to be automated.

---

## 方案 / The Approach

核心是 Python + Playwright 驱动真实浏览器：

The core is Python + Playwright driving a real browser:

- **图片搜索**：自动把商品图上传到 1688 拍立淘，抓取视觉相似的商品列表
- **批量处理**：把待报价图片扔进 `inputs/` 目录，一条命令跑完全部
- **Excel 导出**：自动生成带商品缩略图的报价单，可以直接发给客户
- **断点续传**：批量任务中断后从上次位置继续，checkpoint 机制兜底

- **Image search**: auto-uploads product photos to 1688's visual search and scrapes similar listings
- **Batch mode**: drop images into `inputs/`, one command processes them all
- **Excel export**: generates a quote sheet with product thumbnails, ready to send to clients
- **Resume support**: checkpoint mechanism picks up where an interrupted batch left off

---

## 踩过的坑 / The Hard Parts

**反检测**是最大的坑。1688 对自动化浏览器很敏感，直接跑 Playwright 会被识别。最后做了一套组合拳：隐藏自动化痕迹、随机 User-Agent、注入 stealth 脚本。遇到验证码就暂停等人工处理，不硬刚。

**Anti-detection** was the biggest headache. 1688 is sensitive to automated browsers — vanilla Playwright gets flagged immediately. The fix was a combination: hiding automation fingerprints, randomized User-Agents, and stealth script injection. When a CAPTCHA appears, the tool pauses and waits for manual verification instead of fighting it.

**页面改版**是另一个现实问题。选择器全部外置到 `selectors.json`，1688 改版时只改配置不改代码。

**Page redesigns** are the other reality. All selectors live in an external `selectors.json`, so when 1688 ships a redesign, I update config instead of code.

---

## 双模式设计 / Dual-Mode Design

工具有两种运行模式：默认的**确定性模式**纯靠选择器抓取，零 API 费用；**AI 模式**接入 Claude，处理页面结构变化大、确定性抓取失败的场景。日常批量跑确定性模式，疑难杂症切 AI 模式。

The tool runs in two modes: the default **deterministic mode** relies purely on selectors with zero API cost; **AI mode** brings in Claude for cases where the page structure has shifted and deterministic scraping fails. Daily batches run deterministic; edge cases switch to AI.

---

## 收获 / Takeaways

一下午的工作变成了几分钟挂机。更重要的是验证了一个思路：**先把流程跑通到 90%，剩下 10%（验证码、改版）留给人工和配置**，比追求全自动更实际。

An afternoon of work became a few minutes of unattended runtime. More importantly, it validated an approach: **automate the flow to 90% and leave the last 10% (CAPTCHAs, redesigns) to humans and config** — far more practical than chasing full autonomy.
