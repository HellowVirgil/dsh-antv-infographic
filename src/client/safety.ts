export const MAX_INFOGRAPHIC_SOURCE_LENGTH = 120_000

export interface SourceValidation {
  ok: boolean
  reason?: string | undefined
}

const PRIVATE_URL_PATTERNS = [
  /https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0)(?=[:/\s]|$)/i,
  /https?:\/\/10(?:\.\d{1,3}){3}(?=[:/\s]|$)/i,
  /https?:\/\/192\.168(?:\.\d{1,3}){2}(?=[:/\s]|$)/i,
  /https?:\/\/172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}(?=[:/\s]|$)/i,
  /https?:\/\/169\.254(?:\.\d{1,3}){2}(?=[:/\s]|$)/i,
  /https?:\/\/\[?::1\]?(?=[:/\s]|$)/i,
]

const DANGEROUS_PATTERNS: Array<[RegExp, string]> = [
  [/<\s*(?:script|iframe|object|embed|foreignobject|svg|symbol)\b/i, '不允许嵌入可执行 HTML/SVG'],
  [/\bdata\s*:\s*image\/svg\+xml/i, '不允许内嵌 SVG data URL'],
  [/\bref\s*:\s*remote(?:\s*:[^\s:]*)?\s*:/i, '不允许模型直接加载远程资源'],
  [/^\s*source\s+remote\s*$/im, '不允许模型直接加载远程资源'],
  [/\bjavascript\s*:/i, '不允许 javascript URL'],
  [/\bdata\s*:\s*text\/(?:html|javascript)/i, '不允许可执行 data URL'],
  [/\bfile\s*:/i, '不允许 file URL'],
  [/\b(?:onload|onclick|onerror|onmouseover|onfocus)\s*=/i, '不允许事件处理属性'],
]

/**
 * Narrow security boundary for model-authored DSL. AntV remains responsible
 * for syntax parsing; this guard prevents oversized input and the most useful
 * browser-side resource/execution primitives before the engine sees it.
 */
export function validateInfographicSource(source: string, settled = false): SourceValidation {
  if (source.length > MAX_INFOGRAPHIC_SOURCE_LENGTH) {
    return { ok: false, reason: `内容超过 ${MAX_INFOGRAPHIC_SOURCE_LENGTH.toLocaleString()} 字符限制` }
  }
  const trimmed = source.trimStart()
  if (trimmed === '') return { ok: false, reason: settled ? '围栏内容为空' : undefined }

  // During the first streamed characters, keep the stock code block visible.
  if (!/^infographic(?:\s|$)/i.test(trimmed)) {
    return { ok: false, reason: settled ? '第一行必须是 infographic <template-name>' : undefined }
  }

  for (const [pattern, reason] of DANGEROUS_PATTERNS) {
    if (pattern.test(source)) return { ok: false, reason }
  }
  for (const pattern of PRIVATE_URL_PATTERNS) {
    if (pattern.test(source)) return { ok: false, reason: '不允许访问 localhost 或私有网络资源' }
  }

  if (settled) {
    const firstLine = trimmed.split(/\r?\n/, 1)[0]?.trim() ?? ''
    if (!/^infographic\s+[^\s]+$/i.test(firstLine)) {
      return { ok: false, reason: '第一行缺少有效模板名' }
    }
    if (!/^data(?:\s|$)/m.test(trimmed)) {
      return { ok: false, reason: '缺少 data 数据块' }
    }
  }

  return { ok: true }
}
