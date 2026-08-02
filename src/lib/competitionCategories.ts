// Official WKF competition category/division names (2026 rules, Appendix 2
// & 3) so athletes pick their division from the real list instead of
// free-typing it inconsistently ("U18 female -55" vs "Junior Female -55kg"
// vs...). Age-range parentheticals are dropped from the label ("Senior"
// instead of "Senior (18+ years)") - the age band name alone is what
// coaches/athletes actually say, and the full range just made the dropdown
// noisier without adding information.

export const KATA_CATEGORIES: string[] = [
  'Team Kata Senior Male',
  'Team Kata Senior Female',
  'Team Kata Cadet and Junior Male',
  'Team Kata Cadet and Junior Female',
  'Individual Kata Senior Male',
  'Individual Kata Senior Female',
  'Individual Kata U21 Male',
  'Individual Kata U21 Female',
  'Individual Kata Junior Male',
  'Individual Kata Junior Female',
  'Individual Cadet Kata Male',
  'Individual Cadet Kata Female',
  'Youth Kata U14 Male',
  'Youth Kata U14 Female',
]

interface KumiteAgeGroup {
  age: string
  male: string[]
  female: string[]
}

// Weight class strings: a bare number means "-N kg", a "+"-prefixed one
// means "+N kg" (the open/heavyweight class for that age group).
const KUMITE_AGE_GROUPS: KumiteAgeGroup[] = [
  { age: 'Senior', male: ['60', '67', '75', '84', '+84'], female: ['50', '55', '61', '68', '+68'] },
  { age: 'U21', male: ['60', '67', '75', '84', '+84'], female: ['50', '55', '61', '68', '+68'] },
  { age: 'Junior', male: ['55', '61', '68', '76', '+76'], female: ['48', '53', '59', '66', '+66'] },
  { age: 'Cadet', male: ['52', '57', '63', '70', '+70'], female: ['47', '54', '61', '+61'] },
  { age: 'U14', male: ['40', '45', '50', '55', '+55'], female: ['42', '47', '52', '+52'] },
]

function weightLabel(weight: string): string {
  return weight.startsWith('+') ? `+${weight.slice(1)} kg` : `-${weight} kg`
}

export const KUMITE_DIVISIONS: string[] = KUMITE_AGE_GROUPS.flatMap((group) => [
  ...group.male.map((w) => `Male ${group.age} ${weightLabel(w)}`),
  ...group.female.map((w) => `Female ${group.age} ${weightLabel(w)}`),
])
