import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfileNotes } from '../hooks/useProfileNotes'
import { SegmentedControl } from '../components/ui/segmented-control'
import { Icon } from '../components/ui/icon'
import { AboutCard } from '../components/profile/AboutCard'
import { RecordsPanel } from '../components/profile/RecordsPanel'
import { TechniquesPanel } from '../components/profile/TechniquesPanel'
import { GoalsPanel } from '../components/profile/GoalsPanel'
import { RankPanel } from '../components/profile/RankPanel'

export function Profile() {
  const { user, signOut } = useAuth()
  const { profileInfo, saveProfileInfo } = useProfileNotes()
  const [tab, setTab] = useState<'records' | 'techniques' | 'goals' | 'rank'>('records')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between border-b border-border pb-6">
        <div>
          <span className="label-caps mb-1 block text-aka">Karate OS</span>
          <h1 className="font-heading-hero text-4xl">Profile</h1>
          {user?.email && <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>}
        </div>
        <button
          onClick={() => signOut()}
          className="label-caps text-muted-foreground hover:text-foreground"
        >
          Sign out
        </button>
      </div>

      <Link
        to="/clubs"
        className="glow-aka card-elevated flex items-center gap-3 border border-border bg-card p-4 transition-colors duration-150 hover:border-aka"
      >
        <Icon name="users" className="size-6 flex-shrink-0 text-aka" />
        <div className="flex-1">
          <p className="font-heading text-lg">Clubs &amp; Friends</p>
          <p className="text-xs text-muted-foreground">Connect with teammates and training partners</p>
        </div>
        <Icon name="chevron_down" className="size-4 flex-shrink-0 -rotate-90 text-muted-foreground" />
      </Link>

      <AboutCard profileInfo={profileInfo} saveProfileInfo={saveProfileInfo} />

      <SegmentedControl
        name="profile-tab"
        options={[
          { value: 'records', label: 'RECORDS' },
          { value: 'techniques', label: 'TECHNIQUES' },
          { value: 'goals', label: 'GOALS' },
          { value: 'rank', label: 'RANK' },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-md"
      />

      {tab === 'records' && <RecordsPanel />}
      {tab === 'techniques' && <TechniquesPanel />}
      {tab === 'goals' && <GoalsPanel />}
      {tab === 'rank' && <RankPanel />}
    </div>
  )
}
