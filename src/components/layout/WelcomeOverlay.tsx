import { Icon, type IconName } from '../ui/icon'
import { Button } from '../ui/button'

const SECTIONS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'dashboard',
    title: 'Dashboard',
    body: 'Your week at a glance: mat hours, journal streak, and your next competition countdown.',
  },
  {
    icon: 'event_note',
    title: 'Training Logs',
    body: 'Log every session: type, duration, what improved, what to work on. See it as a list, a chart, or a calendar.',
  },
  {
    icon: 'trophy',
    title: 'Competitions',
    body: 'Track every match: one-tap Win/Loss/Draw, or full scores and reflections when you want the detail.',
  },
  {
    icon: 'unfiltered',
    title: 'Unfiltered',
    body: 'A private space to check in on how training is actually going, beyond the stats.',
  },
  {
    icon: 'profile',
    title: 'Profile',
    body: 'Your records, technique portfolio, goals, and rank history, all in one place.',
  },
]

export function WelcomeOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    // Always dark, regardless of the user's theme preference/toggle -
    // the first screen anyone sees should be the app's real identity,
    // not whatever the OS happens to default to. `dark` scopes the
    // custom variant to this subtree (see @custom-variant in index.css),
    // independent of the <html> element's class.
    <div className="dark fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-10">
        <div>
          <span className="label-caps mb-1 block text-aka">Karate OS</span>
          <h1 className="font-heading-hero text-4xl">Welcome to your training log.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A quick look at what's here before you get started.
          </p>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="card-elevated flex items-start gap-3 border border-border bg-card p-4"
            >
              <Icon name={s.icon} className="mt-0.5 size-5 flex-shrink-0 text-aka" />
              <div>
                <p className="font-heading text-base">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onDismiss} className="glow-primary w-full">
          Get started
        </Button>
      </div>
    </div>
  )
}
