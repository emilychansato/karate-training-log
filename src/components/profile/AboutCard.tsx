import { useState } from 'react'
import type { ProfileInfo } from '../../hooks/useProfileNotes'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { SegmentedControl } from '../ui/segmented-control'
import { Icon } from '../ui/icon'

export function AboutCard({
  profileInfo,
  saveProfileInfo,
}: {
  profileInfo: ProfileInfo
  saveProfileInfo: (fields: {
    beltRank?: string
    clubName?: string
    primaryDiscipline?: 'kata' | 'kumite'
  }) => Promise<{ error: string | null }>
}) {
  const [editing, setEditing] = useState(false)
  const [beltRank, setBeltRank] = useState(profileInfo.beltRank ?? '')
  const [clubName, setClubName] = useState(profileInfo.clubName ?? '')
  const [primaryDiscipline, setPrimaryDiscipline] = useState<'kata' | 'kumite' | ''>(
    profileInfo.primaryDiscipline ?? ''
  )

  const hasInfo = profileInfo.beltRank || profileInfo.clubName || profileInfo.primaryDiscipline

  async function handleSave() {
    const { error } = await saveProfileInfo({
      beltRank: beltRank || undefined,
      clubName: clubName || undefined,
      primaryDiscipline: primaryDiscipline || undefined,
    })
    if (!error) setEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-lg">
          <Icon name="profile" />
          About
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="beltRank">Belt rank</Label>
              <Input
                id="beltRank"
                placeholder="e.g. Brown, 1st Kyu, 2nd Dan"
                value={beltRank}
                onChange={(e) => setBeltRank(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="clubName">Dojo / club</Label>
              <Input
                id="clubName"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Primary discipline</Label>
              <SegmentedControl
                name="primary-discipline"
                options={[
                  { value: 'kata', label: 'KATA' },
                  { value: 'kumite', label: 'KUMITE' },
                ]}
                value={primaryDiscipline}
                onChange={setPrimaryDiscipline}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="glow-primary" onClick={handleSave}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : hasInfo ? (
          <div className="flex flex-col gap-2">
            {profileInfo.beltRank && (
              <p className="text-sm">
                <span className="label-caps text-muted-foreground">Belt rank</span> {profileInfo.beltRank}
              </p>
            )}
            {profileInfo.clubName && (
              <p className="text-sm">
                <span className="label-caps text-muted-foreground">Dojo / club</span> {profileInfo.clubName}
              </p>
            )}
            {profileInfo.primaryDiscipline && (
              <p className="text-sm">
                <span className="label-caps text-muted-foreground">Primary discipline</span>{' '}
                {profileInfo.primaryDiscipline}
              </p>
            )}
            <Button size="sm" variant="ghost" className="w-fit" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-fit" onClick={() => setEditing(true)}>
            + Add belt rank, dojo, discipline
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
