import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { WelcomeOverlay } from '../components/layout/WelcomeOverlay'
import { markWelcomeSeen } from '../lib/welcome'

export function Welcome() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <WelcomeOverlay
      onDismiss={() => {
        markWelcomeSeen()
        navigate('/login')
      }}
    />
  )
}
