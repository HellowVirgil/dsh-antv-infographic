/**
 * DSH host half: teach the model the `infographic` fence and expose the lazy
 * AntV engine bundle through the host web server when that optional service
 * becomes available.
 */
import { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'

export const INFOGRAPHIC_SECTION_ORDER = 106

export const INFOGRAPHIC_SECTION_TEXT = `You can render a polished AntV SVG infographic inline in your reply by emitting one fenced block tagged \`infographic\`. The body is AntV Infographic DSL, not JSON:

\`\`\`infographic
infographic sequence-timeline-rounded-rect-node
data
  title 产品路线图
  sequences
    - label 调研
      desc 明确用户问题
    - label 发布
      desc 上线并验证
\`\`\`

Use it when visual storytelling is better than prose: timelines, steps, lists, comparisons, hierarchies, relations, charts, roadmaps, capability maps, or executive summaries. Do not use it for ordinary one-line answers, forms, buttons, or operational controls.

Rules:
- First body line must be \`infographic <template-name>\`; use exactly two spaces per indentation level.
- Prefer these families: \`list-*\`, \`sequence-*\`, \`compare-*\`, \`hierarchy-*\`, \`relation-*\`, \`chart-*\`.
- Data keys: list=\`lists\`, ordered steps=\`sequences\`, comparison=\`compares\`, hierarchy=\`root/children\`, chart=\`values\`, graph=\`nodes/relations\`; \`items\` is the generic fallback.
- Keep labels concise, preserve the user's language, normally use 3–10 primary items, and avoid repeating the same facts in prose and the infographic.
- Themes may be \`default\`, \`dark\`, \`hand-drawn\`, or \`antv\`. The browser plugin supplies editing and SVG/PNG export controls.
- Never place secrets, executable HTML/SVG, javascript URLs, file URLs, localhost/private-network URLs, or untrusted raw markup in the DSL.`

const ASSET_ROUTE_PATH = '/plugins/@omdsh-dev/dsh-antv-infographic/assets'

async function serveInfographicAsset(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405)
    res.end()
    return
  }
  let pathname: string
  try {
    pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://dsh.local').pathname)
  } catch {
    res.writeHead(400)
    res.end()
    return
  }
  if (pathname !== `${ASSET_ROUTE_PATH}/infographic.js`) {
    res.writeHead(404)
    res.end()
    return
  }
  try {
    const path = fileURLToPath(new URL('./assets/infographic.js', import.meta.url))
    const body = await readFile(path)
    res.writeHead(200, {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
    })
    if (req.method === 'HEAD') res.end()
    else res.end(body)
  } catch {
    res.writeHead(404)
    res.end()
  }
}

export const inject = ['systemPrompt']

export function apply(ctx: Context): void {
  ctx.systemPrompt.section({
    name: 'antv-infographic:fence',
    order: INFOGRAPHIC_SECTION_ORDER,
    text: INFOGRAPHIC_SECTION_TEXT,
  })

  let registered = false
  const registerAssetRoute = (provided?: { register(route: unknown): unknown }): void => {
    if (registered) return
    const webServer = provided ?? ctx.reflect.get('webServer', false) as { register(route: unknown): unknown } | undefined
    if (webServer === undefined) return
    webServer.register({
      kind: 'prefix',
      path: ASSET_ROUTE_PATH,
      handler: serveInfographicAsset,
    })
    registered = true
  }
  registerAssetRoute()
  ctx.on('internal/service', (name: string, value: unknown) => {
    if (name === 'webServer') registerAssetRoute(value as { register(route: unknown): unknown })
  })
}
