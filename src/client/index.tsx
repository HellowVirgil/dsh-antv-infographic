/** DSH browser entry: registry renderer when available, DOM fallback otherwise. */
import type { Context } from '@deepseek-ai/cordis'
import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import type { Key, ReactNode } from 'react'
import { prefetchInfographicAsset } from './asset-loader.ts'
import { installDomFenceRenderer } from './dom-fence.tsx'
import {
  renderInfographicFence,
  type InfographicFenceContext,
} from './fence-render.tsx'
import { ensureInfographicStyles } from './styles.ts'

type FenceExtension = {
  registerFenceRenderer?: (
    language: string,
    renderer: (raw: string, key: Key, context?: InfographicFenceContext) => ReactNode,
  ) => () => void
}

export function apply(_ctx: Context): () => void {
  ensureInfographicStyles()
  prefetchInfographicAsset()
  const register = (primitives as unknown as FenceExtension).registerFenceRenderer
  const channel = typeof register === 'function' ? 'registry' : 'dom'
  console.info(`[dsh-antv-infographic] client active; fence-channel=${channel}`)
  if (typeof register === 'function') return register('infographic', renderInfographicFence)
  return installDomFenceRenderer()
}

export { renderInfographicFence }
export type { InfographicFenceContext }
