import { motion } from 'framer-motion'
import { HoursChart } from '../components/dashboard/HoursChart'
import { MonthComparisonChart } from '../components/dashboard/MonthComparisonChart'
import { CountdownStat } from '../components/dashboard/CountdownStat'
import { CompetitionTimeline } from '../components/dashboard/CompetitionTimeline'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { NextCompetitionGoals } from '../components/dashboard/NextCompetitionGoals'
import { AnimatedNumber } from '../components/ui/animated-number'
import { useTrainingSessions } from '../hooks/useTrainingSessions'
import { computeSessionStats } from '../lib/trainingStats'
import { pageEnter } from '../lib/motion'

function TelemetryStat({
  label,
  value,
  suffix = '',
  accent,
}: {
  label: string
  value: number
  suffix?: string
  accent?: 'aka' | 'ao'
}) {
  return (
    <div>
      <p className="label-caps text-muted-foreground">{label}</p>
      <p
        className={`font-mono tabular-mono mt-1 text-3xl font-bold ${
          accent === 'aka' ? 'text-aka' : accent === 'ao' ? 'text-ao' : ''
        }`}
      >
        <AnimatedNumber value={value} decimals={suffix === 'h' ? 1 : 0} />
        <span className="text-base font-normal text-muted-foreground">{suffix}</span>
      </p>
    </div>
  )
}

export function Dashboard() {
  const { sessions } = useTrainingSessions()
  const stats = computeSessionStats(sessions, new Date())

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between"
        variants={pageEnter}
        initial="hidden"
        animate="show"
      >
        <div>
          <span className="label-caps mb-1 block text-aka">Dojo Dashboard</span>
          <h1 className="font-heading-hero text-4xl">This week, at a glance</h1>
        </div>
        <div className="flex gap-8">
          <TelemetryStat label="This week" value={stats.hoursThisWeek} suffix="h" accent="ao" />
          <CountdownStat />
        </div>
      </motion.div>

      {/* Bento grid: asymmetric so the primary chart reads first */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <HoursChart />
        </div>
        <div className="md:col-span-5">
          <MonthComparisonChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <RecentActivity />
        </div>
        <div className="md:col-span-1">
          <CompetitionTimeline />
        </div>
      </div>

      <NextCompetitionGoals />
    </div>
  )
}
