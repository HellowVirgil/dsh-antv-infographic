import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react'
import {
  loadInfographicAsset,
  type InfographicEngine,
  type InfographicInstance,
} from './asset-loader.ts'
import { validateInfographicSource } from './safety.ts'

export interface InfographicBlockProps {
  source: string
  /** DOM fallback knows this exactly; registry rendering may infer it. */
  settled?: boolean | undefined
}

function describeError(value: unknown): string {
  if (Array.isArray(value)) {
    const messages = value.map(describeError).filter(Boolean)
    return messages.slice(0, 4).join('\n')
  }
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  if (value !== null && typeof value === 'object') {
    const candidate = value as { message?: unknown; reason?: unknown }
    if (typeof candidate.message === 'string') return candidate.message
    if (typeof candidate.reason === 'string') return candidate.reason
  }
  return '信息图语法不完整或无法渲染'
}

function downloadDataUrl(url: string, extension: 'png' | 'svg'): void {
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `dsh-infographic-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function InfographicBlock({ source, settled }: InfographicBlockProps): ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const instanceRef = useRef<InfographicInstance | null>(null)
  const settledRef = useRef(false)
  const [isSettled, setIsSettled] = useState(settled ?? false)
  const [engine, setEngine] = useState<InfographicEngine | null>(null)
  const [editable, setEditable] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyExport, setBusyExport] = useState<'png' | 'svg' | null>(null)
  const [copied, setCopied] = useState(false)
  const visualTheme = /^theme\s+dark\s*$/im.test(source) ? 'dark' : 'light'

  useLayoutEffect(() => {
    if (settled !== undefined) {
      setIsSettled(settled)
      return
    }
    const node = rootRef.current
    if (node !== null && node.closest('[data-streaming]') === null) setIsSettled(true)
  }, [settled, source])

  useEffect(() => {
    settledRef.current = isSettled
  }, [isSettled])

  useEffect(() => {
    let active = true
    void loadInfographicAsset().then(
      loaded => {
        if (active) setEngine(loaded)
      },
      reason => {
        if (active) setError(describeError(reason))
      },
    )
    return () => {
      active = false
    }
  }, [])

  const renderInto = useCallback((instance: InfographicInstance, nextSource: string): void => {
    const validation = validateInfographicSource(nextSource, settledRef.current)
    if (!validation.ok) {
      if (settledRef.current && validation.reason !== undefined) setError(validation.reason)
      return
    }
    try {
      instance.render(nextSource)
      if (instance.rendered) {
        setReady(true)
        setError(null)
      } else if (settledRef.current) {
        setError('DSL 尚未形成可渲染的信息图，请检查模板名、data 块和数据项')
      }
    } catch (reason) {
      if (settledRef.current) setError(describeError(reason))
    }
  }, [])

  useEffect(() => {
    const container = canvasRef.current
    if (engine === null || container === null) return
    setReady(false)
    setError(null)
    const instance = new engine.Infographic({
      container,
      width: '100%',
      padding: 20,
      editable,
    })
    const onRendered = (): void => {
      setReady(true)
      setError(null)
    }
    const onError = (...args: unknown[]): void => {
      if (settledRef.current) setError(describeError(args.length === 1 ? args[0] : args))
    }
    instance.on('rendered', onRendered)
    instance.on('error', onError)
    instanceRef.current = instance
    renderInto(instance, source)
    return () => {
      instance.off('rendered', onRendered)
      instance.off('error', onError)
      instance.destroy()
      if (instanceRef.current === instance) instanceRef.current = null
    }
  }, [editable, engine, renderInto])

  useEffect(() => {
    const instance = instanceRef.current
    if (instance !== null) renderInto(instance, source)
  }, [isSettled, renderInto, source])

  const exportImage = async (type: 'png' | 'svg'): Promise<void> => {
    const instance = instanceRef.current
    if (instance === null || !ready) return
    setBusyExport(type)
    try {
      const url = await instance.toDataURL({ type, removeBackground: false })
      downloadDataUrl(url, type)
    } catch (reason) {
      setError(`导出失败：${describeError(reason)}`)
    } finally {
      setBusyExport(null)
    }
  }

  const copySource = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('复制失败：浏览器没有授予剪贴板权限')
    }
  }

  return (
    <div
      ref={rootRef}
      className="dsh-antv-infographic"
      data-ready={ready ? 'true' : 'false'}
      data-infographic-theme={visualTheme}
    >
      <div className="dsh-antv-infographic__toolbar">
        <span className="dsh-antv-infographic__brand">AntV Infographic</span>
        <button
          type="button"
          className="dsh-antv-infographic__button"
          aria-pressed={editable}
          disabled={engine === null}
          onClick={() => setEditable(value => !value)}
          title="允许选择、拖动、缩放和双击编辑文字"
        >
          {editable ? '完成编辑' : '编辑'}
        </button>
        <button
          type="button"
          className="dsh-antv-infographic__button"
          disabled={!ready || busyExport !== null}
          onClick={() => void exportImage('svg')}
        >
          {busyExport === 'svg' ? '导出中…' : 'SVG'}
        </button>
        <button
          type="button"
          className="dsh-antv-infographic__button"
          disabled={!ready || busyExport !== null}
          onClick={() => void exportImage('png')}
        >
          {busyExport === 'png' ? '导出中…' : 'PNG'}
        </button>
        <button
          type="button"
          className="dsh-antv-infographic__button"
          onClick={() => void copySource()}
        >
          {copied ? '已复制' : '复制 DSL'}
        </button>
      </div>

      {error !== null && <div className="dsh-antv-infographic__error" role="alert">{error}</div>}

      <div className="dsh-antv-infographic__viewport">
        {!ready && error === null && (
          <div className="dsh-antv-infographic__status">
            {engine === null ? '正在加载 AntV 信息图引擎…' : '正在生成信息图…'}
          </div>
        )}
        <div ref={canvasRef} className="dsh-antv-infographic__canvas" />
      </div>

      <details className="dsh-antv-infographic__source">
        <summary>查看 Infographic DSL</summary>
        <pre>{source}</pre>
      </details>
    </div>
  )
}
