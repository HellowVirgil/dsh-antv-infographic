import { describe, expect, it } from 'vitest'
import {
  MAX_INFOGRAPHIC_SOURCE_LENGTH,
  validateInfographicSource,
} from '../src/client/safety.ts'

const VALID = `infographic sequence-steps-simple
data
  sequences
    - label 第一步
    - label 第二步`

describe('validateInfographicSource', () => {
  it('accepts a complete AntV DSL document', () => {
    expect(validateInfographicSource(VALID, true)).toEqual({ ok: true })
  })

  it('accepts a streaming prefix after the DSL header appears', () => {
    expect(validateInfographicSource('infographic sequence-steps-simple\nda', false)).toEqual({ ok: true })
  })

  it('requires data after the stream settles', () => {
    const result = validateInfographicSource('infographic sequence-steps-simple', true)
    expect(result.ok).toBe(false)
    expect(result.reason).toContain('data')
  })

  it.each([
    'javascript:alert(1)',
    '<script>alert(1)</script>',
    '<svg onload=alert(1)>',
    'data:image/svg+xml,%3Csvg%3E',
    'ref:remote:svg:https://example.com/icon.svg',
    'file:///etc/passwd',
    'http://127.0.0.1:3000/private',
    'http://192.168.1.2/secret',
  ])('rejects dangerous model-authored content: %s', fragment => {
    const result = validateInfographicSource(`${VALID}\n  desc ${fragment}`, true)
    expect(result.ok).toBe(false)
    expect(result.reason).toBeDefined()
  })

  it('rejects object-style remote resource configuration', () => {
    const source = `${VALID}\nresource\n  source remote\n  data https://example.com/icon.svg`
    expect(validateInfographicSource(source, true).ok).toBe(false)
  })

  it('caps source size', () => {
    const source = `infographic list-row-simple-horizontal-arrow\ndata\n  title ${'x'.repeat(MAX_INFOGRAPHIC_SOURCE_LENGTH)}`
    expect(validateInfographicSource(source, true).ok).toBe(false)
  })
})
