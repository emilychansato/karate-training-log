// Kumite techniques in the catalog are stored under one broad category
// ("kumite_combo") whether they're a single strike ("Mae geri") or a
// chained combination ("Kizami tsuki → Uraken yokomawashi uchi → Mae-ashi
// mawashi geri"). Splitting on the separators the seed data actually uses
// (→, /, +) counts how many moves are chained, which is a much more
// honest label than calling every single technique a "combo".
const SEPARATORS = /[→/+]/

export function classifyKumiteTechnique(name: string): string {
  const steps = name
    .split(SEPARATORS)
    .map((s) => s.trim())
    .filter(Boolean)

  if (steps.length >= 3) return 'Combo'
  if (steps.length === 2) return 'Double technique'
  if (/\bdouble\b/i.test(name)) return 'Double technique'
  return 'Single technique'
}
