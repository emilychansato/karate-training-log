import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard' },
  { to: '/log', label: 'Training Log' },
  { to: '/competitions', label: 'Competitions' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      {/* Desktop sidebar - hidden on mobile */}
      <nav className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-border md:p-4 md:gap-1">
        <p className="px-2 pb-4 font-heading text-sm">Karate Training Log</p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `px-2 py-1.5 text-sm ${
                isActive ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={() => signOut()}
          className="mt-auto px-2 py-1.5 text-left text-sm text-muted-foreground"
        >
          Sign out
        </button>
      </nav>

      <main className="flex-1 p-4 pb-20 md:pb-4 overflow-x-auto">{children}</main>

      {/* Mobile bottom tab bar - hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 flex border-t border-border bg-background md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-xs ${
                isActive ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
