import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { TrainingLog } from './pages/TrainingLog'
import { Competitions } from './pages/Competitions'
import { CompetitionDetail } from './pages/CompetitionDetail'
import { Dashboard } from './pages/Dashboard'
import { Records } from './pages/Records'
import { Techniques } from './pages/Techniques'
import { Resources } from './pages/Resources'
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
          path="/records"
          element={
            <AuthGate>
              <AppShell>
                <Records />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/techniques"
          element={
            <AuthGate>
              <AppShell>
                <Techniques />
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
