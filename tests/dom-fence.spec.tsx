import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/client/InfographicBlock.tsx', () => ({
  InfographicBlock: ({ source }: { source: string }) => <div data-testid="dom-infographic">{source}</div>,
}))

import { installDomFenceRenderer } from '../src/client/dom-fence.tsx'

function codeBlock(raw: string, language: string, streaming = false): {
  row: HTMLElement
  block: HTMLElement
  label: HTMLElement
  code: HTMLElement
} {
  const row = document.createElement('div')
  if (streaming) row.setAttribute('data-streaming', '')
  const block = document.createElement('div')
  block.className = 'md-code-block'
  const banner = document.createElement('div')
  const label = document.createElement('span')
  label.textContent = language
  const copy = document.createElement('button')
  copy.textContent = '复制'
  banner.append(label, copy)
  const pre = document.createElement('pre')
  const code = document.createElement('code')
  code.textContent = raw
  pre.appendChild(code)
  block.append(banner, pre)
  row.appendChild(block)
  return { row, block, label, code }
}

async function tick(): Promise<void> {
  await new Promise(resolve => window.setTimeout(resolve, 30))
}

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('DOM fallback', () => {
  it('takes over a settled infographic fence', async () => {
    const { row, block } = codeBlock(
      'infographic sequence-steps-simple\ndata\n  sequences\n    - label A',
      'infographic',
    )
    document.body.appendChild(row)
    const dispose = installDomFenceRenderer()
    try {
      await tick()
      expect(block.style.display).toBe('none')
      expect(row.querySelector('.dsh-antv-infographic-dom')?.textContent).toContain('sequence-steps-simple')
    } finally {
      dispose()
    }
  })

  it('ignores other fenced languages', async () => {
    const { row, block } = codeBlock('const x = 1', 'ts')
    document.body.appendChild(row)
    const dispose = installDomFenceRenderer()
    try {
      await tick()
      expect(block.style.display).toBe('')
      expect(row.querySelector('.dsh-antv-infographic-dom')).toBeNull()
    } finally {
      dispose()
    }
  })

  it('renders an unlabeled streaming block with banner actions once its DSL header is complete', async () => {
    const { row, block } = codeBlock('infographic sequence-steps-simple\nda', '', true)
    document.body.appendChild(row)
    const dispose = installDomFenceRenderer()
    try {
      await tick()
      expect(block.style.display).toBe('none')
      expect(row.querySelector('.dsh-antv-infographic-dom')).not.toBeNull()
    } finally {
      dispose()
    }
  })

  it('keeps an incomplete streaming DSL header as the stock code block', async () => {
    const { row, block } = codeBlock('infographic sequence-step', '', true)
    document.body.appendChild(row)
    const dispose = installDomFenceRenderer()
    try {
      await tick()
      expect(block.style.display).toBe('')
      expect(row.querySelector('.dsh-antv-infographic-dom')).toBeNull()
    } finally {
      dispose()
    }
  })

  it('restores a content-detected streaming block when its settled label is not infographic', async () => {
    const { row, block, label } = codeBlock(
      'infographic sequence-steps-simple\ndata\n  sequences\n    - label A',
      '',
      true,
    )
    document.body.appendChild(row)
    const dispose = installDomFenceRenderer()
    try {
      await tick()
      expect(block.style.display).toBe('none')

      label.textContent = 'text'
      row.removeAttribute('data-streaming')
      await tick()

      expect(block.style.display).toBe('')
      expect(row.querySelector('.dsh-antv-infographic-dom')).toBeNull()
    } finally {
      dispose()
    }
  })

  it('restores the original code block on dispose', async () => {
    const { row, block } = codeBlock(
      'infographic sequence-steps-simple\ndata\n  sequences\n    - label A',
      'infographic',
    )
    document.body.appendChild(row)
    const dispose = installDomFenceRenderer()
    await tick()
    dispose()
    expect(block.style.display).toBe('')
    expect(row.querySelector('.dsh-antv-infographic-dom')).toBeNull()
  })
})
