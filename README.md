# dsh-antv-infographic

Render editable and exportable [AntV Infographic](https://github.com/antvis/Infographic) SVGs directly inside DeepSeek Harness (DSH) replies.

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
- Includes an `antv-infographic` Skill that guides template selection and DSL generation

## Local installation

```bash
git clone https://github.com/HellowVirgil/dsh-antv-infographic.git
cd dsh-antv-infographic
pnpm install
pnpm run check
dsh plugin --profile web add link:$PWD
```

If the profile already contains an older version, remove it before adding the local link again:

```bash
dsh plugin --profile web remove dsh-antv-infographic
dsh plugin --profile web add link:$PWD
```

Install the Skill:

```bash
mkdir -p ~/.agents/skills/antv-infographic
cp SKILL.md ~/.agents/skills/antv-infographic/SKILL.md
```

Restart `dsh web`, hard-refresh the browser, and try this prompt in a new session:

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
