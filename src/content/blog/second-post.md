---
title: 'Claude Code 实战日记：用 AI 命令行工具改变我的开发方式'
description: '我的 Claude Code 学习日记，持续更新中。'
pubDate: 'Apr 05 2026'
heroImage: '../../assets/hero-second-post.png'
tags: ['ai', 'claude-code', '开发']
---

> 📝 本文为进行时文章，持续更新中。记录我学习和使用 Claude Code 的真实过程。

## 什么是 Claude Code？

Claude Code 是 Anthropic 推出的命令行 AI 开发工具。和直接在对话框里说话不同，它可以直接读取修改文件、执行命令、操作电脑〔——或者说，就是把 Claude 变成一个真正能干活的 AI Agent。

Claude Code is Anthropic's command-line AI development tool. Unlike a chat interface, it can read and modify files, run commands, and operate directly on your machine — essentially turning Claude into an AI agent that actually gets things done.

---

## 安装过程 / Installation

**前置条件**：需要已安装 Node.js（建议 v18+）和 npm。

**Prerequisites**: Node.js (v18+ recommended) and npm.

### 第一步：全局安装

通过 npm 全局安装 Claude Code：

```bash
npm install -g @anthropic-ai/claude-code
```

安装完成后，验证安装是否成功：

```bash
claude --version
```

### 第二步：登录认证

在命令行输入：

```bash
claude
```

首次运行时会跳出授权流程，按提示完成 Anthropic 账号登录即可。登录后会生成本地认证信息，后续无需重复登录。

On first run, it will launch an authorization flow. Log in with your Anthropic account and the credentials will be saved locally for future sessions.

---

## 已掌握的技能 / Skills So Far

### 定时任务：每日推送 AI 资讯

目前完成的第一个实战项目：一个每天早上 8 点自动抓取并推送 AI 资讯的定时任务。整个工作流是用 Claude Code 的 `/remote-control` 命令实现的。

The first real project I built: a scheduled task that automatically fetches and pushes daily AI news at 8:00 AM every day. The entire workflow was built using Claude Code's `/remote-control` command.

**实现思路：**

1. 在 Claude Code 中输入 `/remote-control`，启动远程控制模式
2. 通过对话描述需求：每天 8 点自动抓取当天的 AI 行业资讯并发送
3. Claude Code 自动生成了完整的工作流脚本，包括定时调度和内容抓取逻辑

**Implementation approach:**

1. Enter `/remote-control` in Claude Code to start remote control mode
2. Describe the requirement via conversation: fetch today's AI industry news at 8 AM daily and send it out
3. Claude Code automatically generated the complete workflow script, including scheduling and content-fetching logic

这个项目让我真正感受到了 AI Agent 的威力——我只需要描述想要什么， Claude Code 就帮我把它搞定了。

This project made me truly appreciate the power of AI agents — I just described what I wanted, and Claude Code figured out the rest.

---

## 展望 / What's Next

这篇文章会随着我学习进度持续更新。后续计划探索的方向包括：更复杂的多步骤任务、与外部 API 的集成、以及 Claude Code 在实际开发流程中的应用。

This post will keep being updated as I learn more. Things I plan to explore next: more complex multi-step tasks, integrations with external APIs, and using Claude Code in real development workflows.
