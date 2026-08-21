import { Context } from '@deepseek-ai/cordis'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import { describe, expect, it } from 'vitest'
import * as Plugin from '../src/plugin/index.ts'

async function createContext(): Promise<Context> {
  const ctx = new Context()
  await ctx.plugin(SystemPrompt)
  await ctx.plugin(Plugin)
  return ctx
}

describe('host plugin', () => {
  it('teaches the infographic fence and main template families', async () => {
    const ctx = await createContext()
    const prompt = await ctx.systemPrompt.assemble({})
    const section = prompt.sections.find(item => item.name === 'antv-infographic:fence')
    expect(section).toBeDefined()
    const text = typeof section?.text === 'string' ? section.text : ''
    expect(text).toContain('```infographic')
    for (const family of ['list-*', 'sequence-*', 'compare-*', 'hierarchy-*', 'relation-*', 'chart-*']) {
      expect(text).toContain(family)
    }
  })

  it('registers the lazy asset route even when webServer binds later', async () => {
    const ctx = await createContext()
    const routes: unknown[] = []
    ctx.provide('webServer', { register: (route: unknown) => routes.push(route) })
    expect(routes).toEqual([
      expect.objectContaining({
        kind: 'prefix',
        path: '/plugins/@omdsh-dev/dsh-antv-infographic/assets',
      }),
    ])
  })
})
