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
import { AuthGate } from './components/layout/AuthGate'
import { AppShell } from './components/layout/AppShell'

function App() {
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
