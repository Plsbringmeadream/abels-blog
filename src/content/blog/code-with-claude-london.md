---
title: 'Code with Claude · London:把 Claude Code 从「工具」变成「队友」'
description: 'Anthropic「Code with Claude」London 站一整天工作坊的内容纪要:提示词评测、Managed Agents、记忆与做梦、Routines、HTML 验证与 Claude Code 最佳实践。'
pubDate: 'Jul 15 2026'
heroImage: '../../assets/hero-cwc-london.jpg'
tags: ['claude-code', 'AI', 'agent', '笔记']
---

Anthropic 一整天现场工作坊的完整纪要——七场演讲,一条主线:**模型越强,agent 跑得越久,人的工作方式就得跟着变。**

> **全场主线**:模型越来越强 → agent 能跑更久、接更复杂的任务 → 人的**习惯必须改变**:少写死、多验证、给它记忆、让它主动干活。一句反复出现的话——*把 Claude Code 从 tool 变成 teammate。*

---

## 01 · 提示词实战:用评测驱动提示词

*Margo van Laar*

提示词仍是做 AI 系统的第一技能。核心不是凭感觉改,而是**用 eval 驱动 prompt**。

- 演示了「训练集 / 保留集(hold-out)」评测面板:每改一版 prompt(v0 → v1 → …)就跑一遍测试矩阵。
- 用绿 / 红格子直观看到每次改动是变好还是变坏,避免「改了 A 却坏了 B」。

## 02 · 生产级 Agent:用 Claude Managed Agents 造 "Stock Pilot"

*Will*

开场痛点:agent 上线跑得很好,几周后被要求改功能——怎么保证改了不崩?答案是 **eval 套件 + 子 agent**。

- 案例 **Stock Pilot**:中型户外用品零售商的库存 agent(250 SKU、3 仓库、90 天数据),能监控库存、预测需求、选供应商、下单、写周报。
- 把 17K token 的巨型 system prompt 迁移到 `Skills`,挂 `forecaster` 子 agent 做预测,用 `uv run evals --task F1/F2` 衡量每次改动。
- 原则:**主 agent 保持窄**(编排 + 策略),专门任务交给子 agent。

## 03 · 全生命周期:Claude Code 增强 SDLC 里的每个角色

*Google Cloud*

主题是一条流水线:**PM → UI/UX Designer → SWE → Security → Growth Marketer**,每个角色配不同能力。

- PM 用多模态;Designer 用 Plan Mode + Figma MCP;SWE 用子 agent 并行造 API / pipeline / dashboard。
- Security 用 Plugins / Hooks 做审计并自动 `/security-review`;Growth 用 BigQuery MCP。
- 落点:**Claude Code + Google Cloud**——Claude 直接跑在你自己的 GCP 项目里(IAM、region、billing 都在你这边)。

## 04 · 记忆与做梦:Agents that remember

*Kevin Chen*

痛点:今天的 agent **会话之间是隔离的**,记不住东西。

- **Memory Store**(新):挂在 session 上的「类文件系统」持久存储,模型能用 bash / grep 跨会话存取。无记忆时答不出,挂上后能 grep 出上次说过的内容。
- **Dreaming**(新):后台异步的**多 agent** 任务,回看历史 transcript 做事实核查、补细节、去重、建索引,把膨胀杂乱的记忆整理成更高效的「输出记忆库」(非破坏性,克隆后再改)。
- 三层结构:Session(单次)→ Memory Store(跨会话)→ Dreaming(长期整理增强)。约 95% token 命中缓存,可像 batch API 一样打折。

## 05 · 主动式 Agent:Build a proactive agent workflow

*Maya Nielsen*

痛点:想让 Claude Code 定时 / 按事件自动跑,以前要自己搭 cron、托管、鉴权一堆 infra。

- **Routines**(新,`/schedule`):只需定义 **prompt + 连哪些 repo + connector + 触发器**,托管、会话状态、连接器全由 Claude Code 基础设施处理,不依赖你的笔记本开着。
- 触发方式:定时(每周一 10 点)或事件(GitHub issue / PR、或自己 POST 到 webhook)。每个 routine 底层就是一个可**围观、打断、纠偏、续跑**的会话。
- 真实案例:源码合并到 main 就 diff 文档库、发现缺口自动开 PR 并 Slack 通知;还能用「生成器 + 评审 agent」双 routine 互审。

## 06 · 验证工作流:How we Claude Code,用 HTML 做规格与验证

*Arno*

基于 Tariq 的观点《HTML 文件不合理的有效性》:agent 跑得越久,越要**把验证前置做厚**,否则一步错烧掉大量 token。

- **消除歧义**——别让 agent 直接开做,先让它用 `ask_user_question` 反过来采访你提取需求。
- **用 HTML 而非 Markdown 做规格**——信息密度更高,能直接看 / 截图 / 用 Playwright MCP 交互(演示 4 种设计风格对比)。
- **把验证做进产物本身**——React 组件把状态发布到 DOM,agent 直接读「数据契约」跑验证、录回放存档。人可读面板 / agent 驱动 / CI headless 三种方式同一套逻辑。

顺带安利:auto mode(shift+tab)、effort 参数(推荐 xhigh)、fast mode、Opus 4.7(视觉模型更强)。

## 07 · 最佳实践:Claude Code Best Practices

*Cal(核心贡献者)*

心智模型:Claude Code 像**「一个什么都在终端里搞定的同事」**。底层是纯 agent——指令 + 强力工具 + 循环跑到自认完成,**不做代码索引 / embedding**,而是用 glob / grep / find 主动式搜索理解代码库。

- 场景:陌生代码库上手、当「思考搭档」出方案、0→1 造原型、补单测、写 commit / PR、大规模迁移、以及所有 CLI 工具(git / docker / bq)。
- `CLAUDE.md` 存跨会话 / 团队状态;权限管理(读放行、写才拦截、白名单加速)。
- 优先装 CLI 工具(如 `gh`)而非 MCP;上下文管理 `/clear` vs `/compact`。
- 规划 + TODO、test-driven 小步提交、截图辅助调试、多开并行、善用 Esc 打断 / 双击 Esc 回溯。

---

## 跨全场的四点共识

1. **Eval 是一切的地基。** 不管是调 prompt 还是改 agent,都靠评测衡量好坏。
2. **别过度约束模型**(Sutton 的「苦涩教训」)。模型比你更会从你身上提取需求,少写死、多让它采访你。
3. **子 agent + 记忆 + 主动触发**,是把「会写代码的工具」升级成「能独立干活的队友」的三块拼图。
4. 反复出现的新东西:**Managed Agents、Memory Store、Dreaming、Routines、Skills、Opus 4.7、auto / fast mode、xhigh effort**。

---

*本文为个人整理的内容纪要,基于 Anthropic「Code with Claude」London 站公开演讲录像重新提炼组织,非逐字转录。所有产品名与观点归属 Anthropic 及各位主讲人。*
