import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { pageEnter, shake, springy } from '../lib/motion'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '../components/ui/card'

export function Login() {
  const { user, signIn, signUp } = useAuth()
  const reducedMotion = useReducedMotion()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shakeError, setShakeError] = useState(false)
  const [signUpComplete, setSignUpComplete] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } =
      mode === 'sign-in' ? await signIn(email, password) : await signUp(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      if (!reducedMotion) {
        setShakeError(true)
        setTimeout(() => setShakeError(false), 400)
      }
    } else if (mode === 'sign-up') {
      setSignUpComplete(true)
    }
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div
        className="w-full sm:max-w-sm"
        initial={reducedMotion ? undefined : 'hidden'}
        animate={reducedMotion ? undefined : shakeError ? 'shake' : 'show'}
        variants={{ ...pageEnter, ...shake }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <span className="label-caps mb-1 block text-aka">Karate OS</span>
            <CardTitle className="font-heading text-3xl">Training Log</CardTitle>
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={reducedMotion ? undefined : { opacity: 0, x: mode === 'sign-in' ? -8 : 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, x: mode === 'sign-in' ? 8 : -8 }}
                transition={{ duration: 0.18 }}
              >
                <CardDescription>
                  {mode === 'sign-in' ? 'Sign in to your account' : 'Create a new account'}
                </CardDescription>
              </motion.div>
            </AnimatePresence>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {signUpComplete ? (
                <motion.div
                  key="confirm"
                  initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springy}
                  className="flex flex-col gap-4"
                >
                  <p className="text-sm">
                    Check your email to confirm your account before signing in.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('sign-in')
                      setSignUpComplete(false)
                    }}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Back to sign in
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={springy}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                        className="text-sm text-destructive"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting
                      ? mode === 'sign-in'
                        ? 'Signing in…'
                        : 'Signing up…'
                      : mode === 'sign-in'
                        ? 'Sign in'
                        : 'Sign up'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode((m) => (m === 'sign-in' ? 'sign-up' : 'sign-in'))
                      setError(null)
                    }}
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    {mode === 'sign-in'
                      ? 'Create an account'
                      : 'Already have an account? Sign in'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
