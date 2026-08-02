import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfileNotes } from '../hooks/useProfileNotes'
import { SegmentedControl } from '../components/ui/segmented-control'
import { AboutCard } from '../components/profile/AboutCard'
import { RecordsPanel } from '../components/profile/RecordsPanel'
import { TechniquesPanel } from '../components/profile/TechniquesPanel'
import { WeightPanel } from '../components/profile/WeightPanel'

export function Profile() {
  const { user, signOut } = useAuth()
  const { profileInfo, saveProfileInfo } = useProfileNotes()
  const [tab, setTab] = useState<'records' | 'techniques' | 'weight'>('records')

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

      <AboutCard profileInfo={profileInfo} saveProfileInfo={saveProfileInfo} />

      <SegmentedControl
        name="profile-tab"
        options={[
          { value: 'records', label: 'RECORDS' },
          { value: 'techniques', label: 'TECHNIQUES' },
          { value: 'weight', label: 'WEIGHT' },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-sm"
      />

      {tab === 'records' && <RecordsPanel />}
      {tab === 'techniques' && <TechniquesPanel />}
      {tab === 'weight' && <WeightPanel />}
    </div>
  )
}
