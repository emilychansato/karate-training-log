// Official WKF competition category/division names (2026 rules, Appendix 2
// & 3) so athletes pick their division from the real list instead of
// free-typing it inconsistently ("U18 female -55" vs "Junior Female -55kg"
// vs...). Kata categories are age/gender only; kumite divisions also carry
// a weight class.

export const KATA_CATEGORIES: string[] = [
  'Team Kata Senior Male (16+ years)',
  'Team Kata Senior Female (16+ years)',
  'Team Kata Cadet and Junior Male (14 - <18 years)',
  'Team Kata Cadet and Junior Female (14 - <18 years)',
  'Individual Kata Senior Male (16+ years)',
  'Individual Kata Senior Female (16+ years)',
  'Individual Kata U21 (18 - <21) Male',
  'Individual Kata U21 (18 - <21) Female',
  'Individual Kata Junior Male (16 - <18 years)',
  'Individual Kata Junior Female (16 - <18 years)',
  'Individual Cadet Kata Male (14 - <16 years)',
  'Individual Cadet Kata Female (14 - <16 years)',
  'Youth Kata U14 Male (12 - <14 years)',
  'Youth Kata U14 Female (12 - <14 years)',
]

interface KumiteAgeGroup {
  age: string
  male: string[]
  female: string[]
}

// Weight class strings: a bare number means "-N kg", a "+"-prefixed one
// means "+N kg" (the open/heavyweight class for that age group).
const KUMITE_AGE_GROUPS: KumiteAgeGroup[] = [
  { age: 'Senior (18+ years)', male: ['60', '67', '75', '84', '+84'], female: ['50', '55', '61', '68', '+68'] },
  { age: 'U21 (18 to <21 years)', male: ['60', '67', '75', '84', '+84'], female: ['50', '55', '61', '68', '+68'] },
  { age: 'Junior (16 to <18 years)', male: ['55', '61', '68', '76', '+76'], female: ['48', '53', '59', '66', '+66'] },
  { age: 'Cadet (14 to <16 years)', male: ['52', '57', '63', '70', '+70'], female: ['47', '54', '61', '+61'] },
  { age: 'U14 (12 to <14 years)', male: ['40', '45', '50', '55', '+55'], female: ['42', '47', '52', '+52'] },
]

function weightLabel(weight: string): string {
  return weight.startsWith('+') ? `+${weight.slice(1)} kg` : `-${weight} kg`
}

export const KUMITE_DIVISIONS: string[] = KUMITE_AGE_GROUPS.flatMap((group) => [
  ...group.male.map((w) => `Male ${group.age} ${weightLabel(w)}`),
  ...group.female.map((w) => `Female ${group.age} ${weightLabel(w)}`),
])
