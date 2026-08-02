import type { ReactNode } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useTheme } from '../theme/ThemeProvider'
import { Icon, type IconName } from '../ui/icon'
import { snappy, pageEnter } from '../../lib/motion'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex size-9 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-foreground"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="size-4" />
    </button>
  )
}

const NAV_ITEMS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/log', label: 'Logs', icon: 'event_note' },
  { to: '/competitions', label: 'Comps', icon: 'trophy' },
  { to: '/unfiltered', label: 'Unfiltered', icon: 'unfiltered' },
  { to: '/profile', label: 'Profile', icon: 'profile' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const { signOut } = useAuth()
  const location = useLocation()
  const reducedMotion = useReducedMotion()

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* TopAppBar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon name="sports_martial_arts" />
          <h1 className="text-sm font-bold uppercase tracking-widest">Karate OS</h1>
        </div>
        <nav className="hidden md:flex md:items-center md:gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={scrollToTop}
              className={({ isActive }) =>
                `label-caps relative px-3 py-2 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-underline"
                      className="absolute inset-x-3 -bottom-[1px] h-[2px] bg-aka"
                      transition={snappy}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link
            to="/resources"
            aria-label="Resources"
            className="flex size-9 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <Icon name="resources" className="size-4" />
          </Link>
          <ThemeToggle />
          <button
            onClick={() => signOut()}
            className="label-caps text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 p-4 pb-24 md:pb-8">
        <motion.div
          key={location.pathname}
          initial={reducedMotion ? undefined : 'hidden'}
          animate={reducedMotion ? undefined : 'show'}
          variants={pageEnter}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-background md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={scrollToTop}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-1 py-2.5 ${
                isActive ? 'text-aka' : 'text-muted-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-x-2 top-0 h-[2px] bg-aka"
                    transition={snappy}
                  />
                )}
                <motion.span whileTap={{ scale: 0.8 }} transition={snappy}>
                  <Icon name={item.icon} filled={isActive} />
                </motion.span>
                <span className="label-caps text-[9px] tracking-widest">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
