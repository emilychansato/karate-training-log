import { HoursChart } from '../components/dashboard/HoursChart'
import { RatingTrendChart } from '../components/dashboard/RatingTrendChart'
import { CompetitionTimeline } from '../components/dashboard/CompetitionTimeline'

export function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-heading text-lg">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HoursChart />
        <RatingTrendChart />
        <CompetitionTimeline />
      </div>
    </div>
  )
}
