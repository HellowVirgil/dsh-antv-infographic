# dsh-antv-infographic

Render editable and exportable [AntV Infographic](https://github.com/antvis/Infographic) SVGs directly inside DeepSeek Harness replies.

The model emits an `infographic` fenced block containing AntV's AI-friendly DSL. This plugin progressively renders it, exposes local editing controls, and exports SVG or PNG.

## Local installation

```bash
git clone https://github.com/HellowVirgil/dsh-antv-infographic.git
cd dsh-antv-infographic
pnpm install
pnpm run check
dsh plugin --profile web add link:$PWD
```

Copy `SKILL.md` to `~/.agents/skills/antv-infographic/SKILL.md`, restart `dsh web`, and hard-refresh the browser.

See [README.zh-CN.md](./README.zh-CN.md) for architecture, usage, and development details.

## License

MIT.
