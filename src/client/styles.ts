const STYLE_ID = '@omdsh-dev/dsh-antv-infographic'

const CSS = `
.dsh-antv-infographic{--dai-bg:color-mix(in srgb,currentColor 4%,transparent);--dai-border:color-mix(in srgb,currentColor 16%,transparent);--dai-muted:color-mix(in srgb,currentColor 62%,transparent);position:relative;margin:10px 0 14px;border:1px solid var(--dai-border);border-radius:12px;background:var(--dai-bg);overflow:hidden;color:inherit}
.dsh-antv-infographic__toolbar{display:flex;align-items:center;gap:6px;min-height:40px;padding:6px 8px;border-bottom:1px solid var(--dai-border);background:color-mix(in srgb,currentColor 3%,transparent)}
.dsh-antv-infographic__brand{font-size:12px;font-weight:650;margin-right:auto;opacity:.72;letter-spacing:.01em}
.dsh-antv-infographic__button{appearance:none;border:1px solid var(--dai-border);border-radius:7px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:1;padding:7px 9px;cursor:pointer;transition:background .15s,border-color .15s,opacity .15s}
.dsh-antv-infographic__button:hover:not(:disabled){background:color-mix(in srgb,currentColor 8%,transparent);border-color:color-mix(in srgb,currentColor 30%,transparent)}
.dsh-antv-infographic__button[aria-pressed=true]{background:color-mix(in srgb,#1677ff 18%,transparent);border-color:color-mix(in srgb,#1677ff 52%,transparent)}
.dsh-antv-infographic__button:disabled{cursor:not-allowed;opacity:.4}
.dsh-antv-infographic__viewport{position:relative;min-height:180px;padding:16px;overflow:auto;background:#fff;color:#172033;color-scheme:light}
.dsh-antv-infographic[data-infographic-theme=dark] .dsh-antv-infographic__viewport{background:#111318;color:#f3f4f6;color-scheme:dark}
.dsh-antv-infographic__canvas{min-width:320px;display:flex;justify-content:center;align-items:flex-start}
.dsh-antv-infographic__canvas>svg{display:block;max-width:100%;height:auto}
.dsh-antv-infographic__status{display:flex;min-height:148px;align-items:center;justify-content:center;text-align:center;color:var(--dai-muted);font-size:13px;padding:16px}
.dsh-antv-infographic__error{margin:10px;padding:9px 11px;border-radius:8px;border:1px solid rgba(239,68,68,.36);background:rgba(239,68,68,.10);color:#dc2626;font-size:12px;line-height:1.55;white-space:pre-wrap}
.dsh-antv-infographic__source{border-top:1px solid var(--dai-border)}
.dsh-antv-infographic__source>summary{cursor:pointer;padding:8px 12px;font-size:12px;color:var(--dai-muted);user-select:none}
.dsh-antv-infographic__source pre{max-height:260px;overflow:auto;margin:0;padding:12px;background:rgba(0,0,0,.05);font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word}
.dsh-antv-infographic-dom{min-width:0}
@media (prefers-color-scheme:dark){.dsh-antv-infographic__source pre{background:rgba(255,255,255,.04)}.dsh-antv-infographic__error{color:#fca5a5}}
`

export function ensureInfographicStyles(): void {
  if (typeof document === 'undefined') return
  if (document.head.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) !== null) return
  const style = document.createElement('style')
  style.dataset.pluginCss = STYLE_ID
  style.textContent = CSS
  document.head.appendChild(style)
}
