import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './pages/Login'
import { AuthGate } from './components/layout/AuthGate'
import { AppShell } from './components/layout/AppShell'

function DashboardStub() {
  return <p>Dashboard — built in Task 13</p>
}
function TrainingLogStub() {
  return <p>Training Log — built in Task 10</p>
}
function CompetitionsStub() {
  return <p>Competitions — built in Task 12</p>
}

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
                <DashboardStub />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/log"
          element={
            <AuthGate>
              <AppShell>
                <TrainingLogStub />
              </AppShell>
            </AuthGate>
          }
        />
        <Route
          path="/competitions"
          element={
            <AuthGate>
              <AppShell>
                <CompetitionsStub />
              </AppShell>
            </AuthGate>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
