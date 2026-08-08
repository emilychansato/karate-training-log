import { describe, it, expect } from 'vitest'
import { extractCountry } from './eventLocation'

describe('extractCountry', () => {
  it('extracts the country from "City, Country" format', () => {
    expect(extractCountry('Argel, Algeria')).toBe('Algeria')
  })

  it('extracts the country from "City (Country)" format', () => {
    expect(extractCountry('Bielsko-Biala (Poland)')).toBe('Poland')
  })

  it('extracts the last comma-separated segment for multi-part locations', () => {
    expect(extractCountry('Mexico City, CDMX, Mexico')).toBe('Mexico')
    expect(extractCountry('Dallas, TX, USA')).toBe('USA')
  })

  it('returns null when there is no comma or parenthetical', () => {
    expect(extractCountry('Vancouver')).toBeNull()
  })

  it('returns null for a null location', () => {
    expect(extractCountry(null)).toBeNull()
  })
})
