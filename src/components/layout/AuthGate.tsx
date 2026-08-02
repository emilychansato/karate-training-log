import { type ReactNode, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { WelcomeOverlay } from './WelcomeOverlay'

function welcomeSeenKey(userId: string) {
  return `karate-welcome-seen:${userId}`
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const hasSeenWelcome = dismissed || localStorage.getItem(welcomeSeenKey(user.id)) === 'true'

  if (!hasSeenWelcome) {
    return (
      <WelcomeOverlay
        onDismiss={() => {
          localStorage.setItem(welcomeSeenKey(user.id), 'true')
          setDismissed(true)
        }}
      />
    )
  }

  return <>{children}</>
}
