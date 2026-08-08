import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { TrainingLog } from './pages/TrainingLog'
import { Competitions } from './pages/Competitions'
import { CompetitionDetail } from './pages/CompetitionDetail'
import { Dashboard } from './pages/Dashboard'
import { Profile } from './pages/Profile'
import { OpponentDetail } from './pages/OpponentDetail'
import { Unfiltered } from './pages/Unfiltered'
import { TechniqueDetail } from './pages/TechniqueDetail'
import { Resources } from './pages/Resources'
import { TournamentPrep } from './pages/TournamentPrep'
import { ClubsAndFriends } from './pages/ClubsAndFriends'
import { ClubDetail } from './pages/ClubDetail'
import { AuthGate } from './components/layout/AuthGate'
import { AppShell } from './components/layout/AppShell'
import { WelcomeOverlay } from './components/layout/WelcomeOverlay'

const WELCOME_SEEN_KEY = 'karate-welcome-seen'

function App() {
  const [welcomeSeen, setWelcomeSeen] = useState(
    () => localStorage.getItem(WELCOME_SEEN_KEY) === 'true'
  )

  // Shown before login/signup, not after - a first-time visitor should
  // see what the app is before being asked to create an account, not
  // after. One flag, not per-user, since there's no user yet at this point.
  if (!welcomeSeen) {
    return (
      <WelcomeOverlay
        onDismiss={() => {
          localStorage.setItem(WELCOME_SEEN_KEY, 'true')
          setWelcomeSeen(true)
        }}
      />
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <AuthGate>
              <AppShell>
                <Dashboard />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/log"
          element={
            <AuthGate>
              <AppShell>
                <TrainingLog />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/competitions"
          element={
            <AuthGate>
              <AppShell>
                <Competitions />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/competitions/:id"
          element={
            <AuthGate>
              <AppShell>
                <CompetitionDetail />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/unfiltered"
          element={
            <AuthGate>
              <AppShell>
                <Unfiltered />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGate>
              <AppShell>
                <Profile />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/profile/opponents/:name"
          element={
            <AuthGate>
              <AppShell>
                <OpponentDetail />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/techniques/:id"
          element={
            <AuthGate>
              <AppShell>
                <TechniqueDetail />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/competitions/upcoming/:id"
          element={
            <AuthGate>
              <AppShell>
                <TournamentPrep />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/clubs"
          element={
            <AuthGate>
              <AppShell>
                <ClubsAndFriends />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/clubs/:id"
          element={
            <AuthGate>
              <AppShell>
                <ClubDetail />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/resources"
          element={
            <AuthGate>
              <AppShell>
                <Resources />
              </AppShell>
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
