import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { SegmentedControl } from '../components/ui/segmented-control'
import { RecordsPanel } from '../components/profile/RecordsPanel'
import { TechniquesPanel } from '../components/profile/TechniquesPanel'

export function Profile() {
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState<'records' | 'techniques'>('records')

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

      <SegmentedControl
        name="profile-tab"
        options={[
          { value: 'records', label: 'RECORDS' },
          { value: 'techniques', label: 'TECHNIQUES' },
        ]}
        value={tab}
        onChange={setTab}
        className="max-w-xs"
      />

      {tab === 'records' ? <RecordsPanel /> : <TechniquesPanel />}
    </div>
  )
}
