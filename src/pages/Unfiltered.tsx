import { useJournalEntries } from '../hooks/useJournalEntries'
import { useProfileNotes } from '../hooks/useProfileNotes'
import { CheckInCard } from '../components/journal/CheckInCard'
import { WhyITrain } from '../components/journal/WhyITrain'
import { ForYou } from '../components/journal/ForYou'
import { MonthOverview } from '../components/journal/MonthOverview'

export function Unfiltered() {
  const { entries, loading: entriesLoading, checkIn } = useJournalEntries()
  const { whyITrain, saveWhyITrain } = useProfileNotes()

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-border pb-6">
        <span className="label-caps mb-1 block text-aka">Karate OS</span>
        <h1 className="font-heading-hero text-4xl">Unfiltered</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Private to you. Never shown alongside your training or competition data.
        </p>
      </div>

      {!entriesLoading && <CheckInCard entries={entries} checkIn={checkIn} />}

      <WhyITrain whyITrain={whyITrain} saveWhyITrain={saveWhyITrain} />

      <ForYou />

      {!entriesLoading && <MonthOverview entries={entries} />}
    </div>
  )
}
