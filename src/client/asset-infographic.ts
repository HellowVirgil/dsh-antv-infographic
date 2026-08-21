/** Lazy browser engine registered for the small DSH client adapter. */
import { Infographic } from '@antv/infographic'

interface AssetGlobal {
  __DshAntvInfographicAssets__?: Record<string, unknown>
}

const host = globalThis as unknown as AssetGlobal
const assets = host.__DshAntvInfographicAssets__ ?? (host.__DshAntvInfographicAssets__ = {})
assets.infographic = { Infographic }
