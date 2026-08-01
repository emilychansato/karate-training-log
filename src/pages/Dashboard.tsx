import { motion } from 'framer-motion'
import { HoursChart } from '../components/dashboard/HoursChart'
import { RatingTrendChart } from '../components/dashboard/RatingTrendChart'
import { CompetitionTimeline } from '../components/dashboard/CompetitionTimeline'
import { pageEnter } from '../lib/motion'

export function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <motion.div
        className="border-b border-border pb-6"
        variants={pageEnter}
        initial="hidden"
        animate="show"
      >
        <span className="label-caps mb-1 block text-aka">Dojo Dashboard</span>
        <h1 className="font-heading text-4xl italic">Welcome back, Athlete.</h1>
      </motion.div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <HoursChart />
        <RatingTrendChart />
        <CompetitionTimeline />
      </div>
    </div>
  )
}
