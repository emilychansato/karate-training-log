/** Location strings from WKF/KBC ingestion come in two shapes -
 * "City, Country" and "City (Country)" - so country extraction has to
 * handle both. Falls back to null when neither pattern matches, rather
 * than guessing. */
export function extractCountry(location: string | null): string | null {
  if (!location) return null

  const parenMatch = location.match(/\(([^)]+)\)\s*$/)
  if (parenMatch) return parenMatch[1].trim()

  const parts = location.split(',')
  if (parts.length > 1) return parts[parts.length - 1].trim()

  return null
}
