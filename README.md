# Abel's Blog

Abel 的个人网站，用来记录生活、分享热爱，以及持续公开构建中的技术实验。

线上访问：[abels-blog.vercel.app](https://abels-blog.vercel.app)

## 网站内容

- 技术文章与项目复盘
- AI 工具、自动化和独立开发笔记
- Markdown / MDX 博客与标签归档
- RSS、站点地图和搜索
- 可交互的 Three.js 3D 机械键盘

## 3D 键盘

首页的键盘实验室根据正在使用的黑色 TKL 机械键盘重建，支持鼠标和实体键盘交互。

- 使用 Cherry-profile CAD 外壳还原键帽高度、梯形轮廓和行间雕刻曲线
- 按 19 mm 标准节距重建 TKL 布局及多倍键宽
- 金属机身与镜面 PVD 风格材质
- 金属雕刻 Enter、半透明树脂 Esc 和 F13 个性键帽
- 支持静态、呼吸、彩虹和涟漪 RGB 模式
- 键盘按压动画、轴下灯光响应和亮度调节
- 桌面端完整渲染，并针对低性能设备提供降级策略

## 技术栈

- [Astro](https://astro.build/)：静态站点、内容集合与页面构建
- [React](https://react.dev/)：交互组件
- [Three.js](https://threejs.org/)：3D 场景和材质渲染
- [React Three Fiber](https://r3f.docs.pmnd.rs/) / [Drei](https://github.com/pmndrs/drei)：React 3D 组件
- [MDX](https://mdxjs.com/)：博客内容
- [Vitest](https://vitest.dev/)：组件、布局与几何测试
- [Vercel](https://vercel.com/)：生产部署

## 本地运行

需要 Node.js 22.12 或更高版本。

```bash
git clone https://github.com/Plsbringmeadream/abels-blog.git
cd abels-blog
npm install
npm run dev
```

开发服务器默认运行在 `http://localhost:4321`。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动本地开发服务器 |
| `npm test` | 运行测试 |
| `npm run test:watch` | 监听文件并持续运行测试 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run preview` | 本地预览生产构建 |

## 项目结构

```text
public/
  keycap-art/       # 个性键帽与雕刻纹理
  models/           # Cherry-profile GLB 模型
scripts/            # 模型与纹理生成脚本
src/
  components/
    3d-keyboard/    # 3D 键盘场景、键帽、布局和交互
  content/blog/     # Markdown / MDX 文章
  layouts/          # 页面布局
  pages/            # Astro 路由
```

## 验证

当前 3D 键盘实现包含布局、几何、交互、RGB 和渲染策略测试。提交前建议运行：

```bash
npm test -- --run
npm run build
```

## 部署

项目部署在 Vercel。生产地址：

[https://abels-blog.vercel.app](https://abels-blog.vercel.app)

---

Built with Astro, React and Three.js.
