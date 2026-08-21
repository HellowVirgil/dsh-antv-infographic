import {
  Component,
  useLayoutEffect,
  useRef,
  useState,
  type ErrorInfo,
  type Key,
  type ReactNode,
} from 'react'
import { CodeBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import { InfographicBlock } from './InfographicBlock.tsx'
import { validateInfographicSource } from './safety.ts'

export interface InfographicFenceContext {
  readonly source?: {
    readonly id: string
    readonly order: readonly [number, number, number]
  }
}

class RenderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  override state = { failed: false }

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('[dsh-antv-infographic] renderer failed:', error.message, info.componentStack)
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return <div className="dsh-antv-infographic__error" role="alert">信息图渲染器发生异常，请展开 DSL 检查内容或重新生成。</div>
    }
    return this.props.children
  }
}

function FenceFallback({ raw, reason }: { raw: string; reason?: string | undefined }): ReactNode {
  const ref = useRef<HTMLDivElement | null>(null)
  const [settled, setSettled] = useState(false)
  useLayoutEffect(() => {
    const node = ref.current
    if (node !== null && node.closest('[data-streaming]') === null) setSettled(true)
  }, [raw])
  return (
    <div ref={ref}>
      {settled && reason !== undefined && (
        <div className="dsh-antv-infographic__error" role="alert">
          Infographic fence 无法渲染：{reason}
        </div>
      )}
      <CodeBlock code={`${raw}\n`} lang="infographic" />
    </div>
  )
}

export function renderInfographicFenceNode(
  raw: string,
  key: Key,
  settled: boolean,
): ReactNode | null {
  const validation = validateInfographicSource(raw, settled)
  if (!validation.ok) {
    if (!settled) return null
    return <FenceFallback key={key} raw={raw} reason={validation.reason} />
  }
  return (
    <RenderBoundary key={key}>
      <InfographicBlock source={raw} settled={settled} />
    </RenderBoundary>
  )
}

export function renderInfographicFence(
  raw: string,
  key: Key,
  context?: InfographicFenceContext,
): ReactNode {
  const settled = context?.source !== undefined
  const validation = validateInfographicSource(raw, settled)
  if (!validation.ok) {
    return <FenceFallback key={key} raw={raw} reason={validation.reason} />
  }
  return (
    <RenderBoundary key={context?.source?.id ?? key}>
      <InfographicBlock source={raw} settled={settled ? true : undefined} />
    </RenderBoundary>
  )
}
