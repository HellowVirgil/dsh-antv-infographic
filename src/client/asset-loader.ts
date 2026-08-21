const PLUGIN_ID = '@omdsh-dev/dsh-antv-infographic'
const ASSET_DIR = `/plugins/${PLUGIN_ID}/assets`

interface BootGraphLike {
  entries?: Array<{ id?: string; rev?: string }>
}

interface AssetGlobal {
  __DshAntvInfographicAssets__?: Record<string, unknown>
}

export function infographicAssetUrl(): string {
  const graph = (window as unknown as { __DSH_BOOT__?: BootGraphLike }).__DSH_BOOT__
  const rev = graph?.entries?.find(entry => entry.id === PLUGIN_ID)?.rev
  const suffix = rev === undefined ? '' : `?rev=${encodeURIComponent(rev)}`
  return `${ASSET_DIR}/infographic.js${suffix}`
}

let pending: Promise<InfographicEngine> | undefined

export interface InfographicInstance {
  readonly rendered: boolean
  render(source?: string | Record<string, unknown>): void
  toDataURL(options?: { type?: 'png' | 'svg'; removeBackground?: boolean }): Promise<string>
  on(event: string, listener: (...args: unknown[]) => void): void
  off(event: string, listener: (...args: unknown[]) => void): void
  destroy(): void
}

export interface InfographicEngine {
  Infographic: new (options: Record<string, unknown>) => InfographicInstance
}

export function loadInfographicAsset(): Promise<InfographicEngine> {
  if (pending !== undefined) return pending
  const existing = (window as unknown as AssetGlobal).__DshAntvInfographicAssets__?.infographic as InfographicEngine | undefined
  if (existing?.Infographic !== undefined) {
    pending = Promise.resolve(existing)
    return pending
  }
  pending = new Promise<InfographicEngine>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = infographicAssetUrl()
    script.async = true
    script.onload = () => {
      const assets = (window as unknown as AssetGlobal).__DshAntvInfographicAssets__ ?? {}
      const engine = assets.infographic as InfographicEngine | undefined
      if (engine?.Infographic === undefined) {
        reject(new Error('AntV 引擎脚本已加载，但没有注册 Infographic API'))
        return
      }
      resolve(engine)
    }
    script.onerror = () => reject(new Error('AntV 引擎加载失败，请确认插件资源路由可用并重启 dsh web'))
    document.head.appendChild(script)
  })
  return pending
}

export function prefetchInfographicAsset(): void {
  if (typeof document === 'undefined') return
  const href = infographicAssetUrl()
  if (document.head.querySelector(`link[rel="prefetch"][href="${href}"]`) !== null) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'script'
  link.href = href
  document.head.appendChild(link)
}
