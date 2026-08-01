import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { TrainingLog } from './pages/TrainingLog'
import { Competitions } from './pages/Competitions'
import { Dashboard } from './pages/Dashboard'
import { Records } from './pages/Records'
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
          path="/records"
          element={
            <AuthGate>
              <AppShell>
                <Records />
              </AppShell>
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
