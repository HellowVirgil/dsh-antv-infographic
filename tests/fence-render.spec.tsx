import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/client/InfographicBlock.tsx', () => ({
  InfographicBlock: ({ source }: { source: string }) => <div data-testid="infographic">{source}</div>,
}))

import { renderInfographicFence } from '../src/client/fence-render.tsx'

afterEach(cleanup)

const VALID = `infographic list-grid-compact-card
data
  lists
    - label A
    - label B`

describe('registry fence renderer', () => {
  it('renders a valid settled fence', () => {
    render(<>{renderInfographicFence(VALID, 'k1', { source: { id: 's1', order: [1, 0, 0] } })}</>)
    expect(screen.getByTestId('infographic').textContent).toContain('list-grid-compact-card')
  })

  it('keeps invalid source visible and explains the problem', () => {
    render(<>{renderInfographicFence('not infographic', 'k2', { source: { id: 's2', order: [2, 0, 0] } })}</>)
    expect(screen.getByRole('alert').textContent).toContain('第一行')
    expect(document.body.textContent).toContain('not infographic')
  })

  it('rejects executable markup before mounting the renderer', () => {
    render(<>{renderInfographicFence(`${VALID}\n  desc <script>alert(1)</script>`, 'k3', { source: { id: 's3', order: [3, 0, 0] } })}</>)
    expect(screen.queryByTestId('infographic')).toBeNull()
    expect(screen.getByRole('alert').textContent).toContain('HTML/SVG')
  })
})
