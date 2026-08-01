import { motion } from 'framer-motion'
import { HoursChart } from '../components/dashboard/HoursChart'
import { RatingTrendChart } from '../components/dashboard/RatingTrendChart'
import { CompetitionTimeline } from '../components/dashboard/CompetitionTimeline'
import { RecentActivity } from '../components/dashboard/RecentActivity'
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
        <h1 className="font-heading-hero text-4xl italic">Training snapshot.</h1>
      </motion.div>

      {/* Bento grid: asymmetric so the primary chart reads first */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-7">
          <HoursChart />
        </div>
        <div className="md:col-span-5">
          <RatingTrendChart />
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
    </div>
  )
}
