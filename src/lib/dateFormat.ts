const WEEKDAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseIso(iso: string): Date | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatFriendly(iso: string): string {
  const date = parseIso(iso)
  if (!date) return ''
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
  return `${weekday}, ${MONTH_NAMES[date.getMonth()].slice(0, 3)} ${date.getDate()}`
}

export { WEEKDAY_SHORT, MONTH_NAMES }
