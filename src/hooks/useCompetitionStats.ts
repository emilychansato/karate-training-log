import { useCompetitionResults } from './useCompetitionResults'
import {
  computeOpponentHistory,
  computePersonalRecords,
  computeDivisionHistory,
} from '../lib/competitionStats'

export function useCompetitionStats() {
  const { results, loading } = useCompetitionResults()

  return {
    loading,
    opponents: computeOpponentHistory(results),
    records: computePersonalRecords(results),
    divisionHistory: computeDivisionHistory(results),
  }
}
