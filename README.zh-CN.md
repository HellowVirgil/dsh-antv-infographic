<p align="center">
  🌐 简体中文 | <a href="./README.md">English</a>
</p>

<h1 align="center">dsh-antv-infographic</h1>

<p align="center">
  在 DeepSeek Harness（DSH）的模型回复中直接渲染可编辑、可导出的 <a href="https://github.com/antvis/Infographic">AntV Infographic</a> SVG。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-antv-infographic"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-antv-infographic?logo=npm&color=cb3837"></a>
  <a href="https://github.com/HellowVirgil/dsh-antv-infographic/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/HellowVirgil/dsh-antv-infographic/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/dsh-antv-infographic"><img alt="npm downloads" src="https://img.shields.io/npm/dm/dsh-antv-infographic?logo=npm"></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/npm/l/dsh-antv-infographic"></a>
</p>

模型输出 `infographic` fenced block，插件将其中的 AntV Infographic DSL 流式渲染为 SVG：

````markdown
```infographic
infographic sequence-timeline-rounded-rect-node
data
  title 产品路线图
  sequences
    - label 调研
      desc 明确用户问题
    - label 发布
      desc 上线并验证
```
````

## 能力

- 支持 AntV Infographic 的约 200 种模板
- AI 流式输出过程中逐步渲染
- 默认查看模式，可切换为本地编辑模式
- 支持 SVG、PNG 导出和 DSL 复制
- 新版 DSH 走 `fence-registry`，旧版自动使用 DOM fallback
- AntV 引擎按需加载，不阻塞 DSH 首屏
- 对模型生成内容限制大小，并拦截可执行标记、危险 URL 和私网资源
- 附带 `antv-infographic` Skill，指导模型选择模板和生成 DSL

## 安装

直接将已发布的包安装到 DSH profile：

```bash
dsh plugin --profile web add dsh-antv-infographic
```

安装完成后重启 `dsh web`，并在浏览器中执行硬刷新。

### 从源码安装

```bash
git clone https://github.com/HellowVirgil/dsh-antv-infographic.git
cd dsh-antv-infographic
pnpm install
pnpm run check
dsh plugin --profile web add "link:$PWD"
```

如果该 profile 已安装旧版本，先移除再添加：

```bash
dsh plugin --profile web remove dsh-antv-infographic
dsh plugin --profile web add "link:$PWD"
```

### 安装 Skill

```bash
mkdir -p ~/.agents/skills/antv-infographic
cp SKILL.md ~/.agents/skills/antv-infographic/SKILL.md
```

在新会话中输入：

```text
用 infographic 画一张 AI 产品从调研到规模化上线的路线图
```

浏览器控制台出现下面的日志表示客户端已激活：

```text
[dsh-antv-infographic] client active; fence-channel=registry
```

旧版宿主会显示 `fence-channel=dom`。

## 工作原理

插件由三部分组成：

1. Node 端插件向 DSH system prompt 注入 `infographic` DSL 使用约定。
2. 浏览器适配器识别 fenced block，并调用 AntV Infographic 渲染。
3. AntV 主引擎作为独立资源按需从插件自己的 HTTP 路由加载。

DSH 有 fence 注册表时直接注册渲染器；没有时，插件观察对话 DOM，将语言标签为 `infographic` 的代码块替换为同一套渲染组件。

## 适用边界

适合：路线图、时间线、流程、能力地图、层级关系、方案对比、数据叙事、汇报摘要。

不适合：表单、操作按钮、测验、复杂业务面板，以及需要将用户交互结果回传模型的场景。

## 开发

```bash
pnpm test
pnpm build
pnpm run verify:pack
```

入口：

- `src/plugin/index.ts`：prompt 与资源路由
- `src/client/index.tsx`：DSH 客户端注册
- `src/client/InfographicBlock.tsx`：AntV UI、编辑和导出
- `src/client/dom-fence.tsx`：旧版宿主 fallback
- `src/client/asset-infographic.ts`：按需加载的 AntV 引擎包

## License

MIT。AntV Infographic 也采用 MIT License。
