import { describe, it, expect } from 'vitest'
import { KATA_CATEGORIES, KUMITE_DIVISIONS } from './competitionCategories'

describe('competitionCategories', () => {
  it('has all 14 official WKF kata categories, each unique', () => {
    expect(KATA_CATEGORIES).toHaveLength(14)
    expect(new Set(KATA_CATEGORIES).size).toBe(14)
  })

  it('has 48 kumite weight divisions across all 5 age groups, each unique', () => {
    expect(KUMITE_DIVISIONS).toHaveLength(48)
    expect(new Set(KUMITE_DIVISIONS).size).toBe(48)
  })

  it('formats open weight classes with a leading + rather than -', () => {
    expect(KUMITE_DIVISIONS).toContain('Male Senior (18+ years) +84 kg')
    expect(KUMITE_DIVISIONS).toContain('Female U14 (12 to <14 years) +52 kg')
  })

  it('formats a known middle-weight division exactly as WKF publishes it', () => {
    expect(KUMITE_DIVISIONS).toContain('Male Senior (18+ years) -67 kg')
    expect(KUMITE_DIVISIONS).toContain('Female Junior (16 to <18 years) -53 kg')
  })
})
