<p align="center">
  🌐 <a href="./README.zh-CN.md">简体中文</a> | English
</p>

<h1 align="center">dsh-antv-infographic</h1>

<p align="center">
  Render editable and exportable <a href="https://github.com/antvis/Infographic">AntV Infographic</a> SVGs directly inside DeepSeek Harness (DSH) replies.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/dsh-antv-infographic"><img alt="npm version" src="https://img.shields.io/npm/v/dsh-antv-infographic?logo=npm&color=cb3837"></a>
  <a href="https://github.com/HellowVirgil/dsh-antv-infographic/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/HellowVirgil/dsh-antv-infographic/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/dsh-antv-infographic"><img alt="npm downloads" src="https://img.shields.io/npm/dm/dsh-antv-infographic?logo=npm"></a>
  <a href="./LICENSE"><img alt="MIT License" src="https://img.shields.io/npm/l/dsh-antv-infographic"></a>
</p>

## Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/HellowVirgil/dsh-antv-infographic/main/docs/images/infographic-preview.jpg" alt="dsh-antv-infographic rendering an editable AntV Infographic inside DSH" width="100%">
</p>

<p align="center">
  <sub>Actual DSH rendering with progressive generation, local editing, SVG/PNG export, and DSL copying.</sub>
</p>

The model emits an `infographic` fenced block, and the plugin progressively renders the AntV Infographic DSL as SVG:

````markdown
```infographic
infographic sequence-timeline-rounded-rect-node
data
  title Product roadmap
  sequences
    - label Research
      desc Identify the user problem
    - label Launch
      desc Release and validate
```
````

## Features

- Supports roughly 200 AntV Infographic templates
- Progressively renders while the model streams its response
- Starts in view mode and can switch to local editing mode
- Exports SVG or PNG and copies the source DSL
- Uses the DSH `fence-registry` when available, with a DOM fallback for older hosts
- Lazy-loads the AntV engine without blocking the initial DSH page load
- Limits model-generated source size and blocks executable markup, dangerous URLs, and private-network resources
- Includes an optional `antv-infographic` Skill with richer template-selection and DSL-generation guidance

## Installation

Install the published package directly into a DSH profile:

```bash
dsh plugin --profile web add dsh-antv-infographic
```

This command installs everything required for DSH to generate and render `infographic` blocks. A separate Skill installation is not required.

Restart `dsh web` and hard-refresh the browser after installation.

### Install from source

```bash
git clone https://github.com/HellowVirgil/dsh-antv-infographic.git
cd dsh-antv-infographic
pnpm install
pnpm run check
dsh plugin --profile web add "link:$PWD"
```

If the profile already contains an older version, remove it before adding the local link again:

```bash
dsh plugin --profile web remove dsh-antv-infographic
dsh plugin --profile web add "link:$PWD"
```

### Optional: Install the Skill

The plugin already injects the essential DSL contract into the DSH system prompt. Install the Skill only if your agent environment discovers `~/.agents/skills` and you want more detailed template guidance and examples for complex infographics.

From a source checkout:

```bash
mkdir -p ~/.agents/skills/antv-infographic
cp SKILL.md ~/.agents/skills/antv-infographic/SKILL.md
```

Or download the packaged Skill directly from GitHub:

```bash
mkdir -p ~/.agents/skills/antv-infographic
curl -fsSL https://raw.githubusercontent.com/HellowVirgil/dsh-antv-infographic/main/SKILL.md \
  -o ~/.agents/skills/antv-infographic/SKILL.md
```

Try this prompt in a new session:

```text
Use infographic to create a roadmap from product research to scaled launch.
```

The following browser console message confirms that the client is active:

```text
[dsh-antv-infographic] client active; fence-channel=registry
```

Older hosts display `fence-channel=dom` instead.

## How it works

The plugin has three parts:

1. The Node.js plugin injects the `infographic` DSL contract into the DSH system prompt.
2. The browser adapter recognizes fenced blocks and renders them with AntV Infographic.
3. The main AntV engine is served as a separate resource and loaded on demand from the plugin's HTTP route.

When DSH provides a fence registry, the plugin registers a renderer directly. Otherwise, it observes the conversation DOM and replaces `infographic` code blocks with the same rendering component.

## Scope

Best for roadmaps, timelines, processes, capability maps, hierarchies, comparisons, data stories, and executive summaries.

Not intended for forms, operational buttons, quizzes, complex business panels, or interactions whose results must be sent back to the model.

## Development

```bash
pnpm test
pnpm build
pnpm run verify:pack
```

Main entry points:

- `src/plugin/index.ts`: prompt injection and asset route
- `src/client/index.tsx`: DSH client registration
- `src/client/InfographicBlock.tsx`: AntV UI, editing, and export
- `src/client/dom-fence.tsx`: fallback for older hosts
- `src/client/asset-infographic.ts`: lazy AntV engine bundle

## License

MIT. AntV Infographic is also licensed under MIT.
