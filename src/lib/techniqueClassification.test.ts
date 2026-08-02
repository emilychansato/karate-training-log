import { describe, it, expect } from 'vitest'
import { classifyKumiteTechnique } from './techniqueClassification'

describe('classifyKumiteTechnique', () => {
  it('classifies a bare technique name as a single technique', () => {
    expect(classifyKumiteTechnique('Mae geri')).toBe('Single technique')
    expect(classifyKumiteTechnique('Kizami tsuki')).toBe('Single technique')
  })

  it('classifies a "Double X" name as a double technique', () => {
    expect(classifyKumiteTechnique('Double gyaku tsuki')).toBe('Double technique')
  })

  it('classifies a two-step chain as a double technique', () => {
    expect(classifyKumiteTechnique('Kizami tsuki → Gyaku tsuki')).toBe('Double technique')
    expect(classifyKumiteTechnique('Gyaku tsuki (body) → Front leg mawashi geri jodan')).toBe(
      'Double technique'
    )
  })

  it('classifies a three-or-more-step chain as a combo', () => {
    expect(
      classifyKumiteTechnique('Kizami tsuki → Gyaku tsuki → Ura mawashi geri (rear leg)')
    ).toBe('Combo')
    expect(
      classifyKumiteTechnique(
        'Jodan age uke/Tate uke → Kizami mawashi geri → Chudan gyaku tsuki'
      )
    ).toBe('Combo')
    expect(
      classifyKumiteTechnique('Chudan mae geri + Gedan barai → Kizami tsuki/Tate tsuki')
    ).toBe('Combo')
  })
})
