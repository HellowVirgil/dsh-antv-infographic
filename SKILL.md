---
name: antv-infographic
description: Generate AntV Infographic DSL for inline rendering in DSH. Use when the user asks for an infographic, timeline, roadmap, comparison, hierarchy, process, relation graph, capability map, visual summary, executive summary, or data story that benefits from a polished editable SVG.
---

# AntV Infographic for DSH

Generate one `infographic` fenced block when visual structure communicates the answer better than prose. Keep any necessary explanation short and outside the fence.

## Output contract

```infographic
infographic <template-name>
theme <optional-theme>
data
  title <title>
  desc <optional-description>
  <data-key>
    - label <item>
      desc <optional-description>
      value <optional-number>
      icon <optional-icon-keywords>
```

Rules:

- The first body line is always `infographic <template-name>`.
- Use exactly two spaces per indentation level; never use tabs.
- Use `key value`, not YAML colons.
- Array items start with `-`.
- Preserve the user's language.
- Prefer 3–10 primary items and concise labels.
- Do not wrap the DSL in JSON, HTML, SVG, or JavaScript.
- Do not include passwords, tokens, executable markup, private-network URLs, localhost URLs, `file:` URLs, or `javascript:` URLs.
- Do not generate fake buttons or forms. Use `dsh-ui` instead when the user needs operational interaction.

## Choose the structure first

| Intent | Template family | Data shape |
|---|---|---|
| Unordered capabilities or features | `list-*` | `lists` |
| Ordered steps, timeline, roadmap | `sequence-*` | `sequences` |
| Two-sided or SWOT comparison | `compare-*` | `compares` |
| Organization or taxonomy | `hierarchy-*` | `root` + recursive `children` |
| Flow or network relationships | `relation-*` | `nodes` + `relations` |
| Quantitative values or trends | `chart-*` | `values` |

Representative templates:

- `list-row-horizontal-icon-arrow`
- `list-grid-compact-card`
- `sequence-steps-simple`
- `sequence-timeline-rounded-rect-node`
- `sequence-ascending-steps`
- `compare-binary-horizontal-simple-fold`
- `compare-swot`
- `compare-quadrant-quarter-simple-card`
- `hierarchy-tree-curved-line-rounded-rect-node`
- `relation-dagre-flow-tb-simple-circle-node`
- `chart-column-simple`
- `chart-line-plain-text`
- `chart-bar-plain-text`

Themes: `default`, `dark`, `hand-drawn`, `antv`. Omit `theme` when the default is appropriate.

## Data patterns

### List

```infographic
infographic list-grid-compact-card
data
  title 核心能力
  lists
    - label 数据接入
      desc 统一连接多种来源
      icon database connection
    - label 智能分析
      desc 自动发现趋势与异常
      icon chart analysis
    - label 协同决策
      desc 将洞察转化为行动
      icon team decision
```

### Sequence or timeline

```infographic
infographic sequence-timeline-rounded-rect-node
data
  title 产品路线图
  sequences
    - label 第一阶段
      desc 用户调研与原型验证
    - label 第二阶段
      desc 小范围发布与指标验证
    - label 第三阶段
      desc 规模化推广
```

### Comparison

`compare-binary-*` templates require exactly two root items; put comparison points in each root's `children`.

```infographic
infographic compare-binary-horizontal-simple-fold
data
  title 两种方案对比
  compares
    - label 方案 A
      children
        - label 上线快
        - label 定制能力有限
    - label 方案 B
      children
        - label 扩展性强
        - label 初期成本较高
```

### Hierarchy

```infographic
infographic hierarchy-tree-curved-line-rounded-rect-node
data
  title 产品能力体系
  root
    label 智能平台
    children
      - label 数据层
        children
          - label 采集
          - label 治理
      - label 智能层
        children
          - label 分析
          - label 预测
```

### Relation graph

```infographic
infographic relation-dagre-flow-tb-simple-circle-node
data
  title 业务处理流程
  nodes
    - id input
      label 数据输入
    - id analyze
      label 智能分析
    - id action
      label 执行动作
  relations
    - from input
      to analyze
    - from analyze
      to action
```

### Chart

```infographic
infographic chart-column-simple
data
  title 季度收入
  values
    - label Q1
      value 128
    - label Q2
      value 164
    - label Q3
      value 191
    - label Q4
      value 226
```

## Final check

Before emitting the fence, verify:

1. The selected family matches the information structure.
2. The template name and data key agree.
3. Binary comparison has exactly two roots.
4. Relations reference existing node IDs.
5. The DSL contains no colons after keys and uses two-space indentation.
6. The same information is not repeated in a long prose section.
