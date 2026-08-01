import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
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
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
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
    } else if (mode === 'sign-up') {
      setSignUpComplete(true)
    }
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full sm:max-w-sm">
        <CardHeader>
          <CardTitle className="font-heading">Karate Training Log</CardTitle>
          <CardDescription>
            {mode === 'sign-in' ? 'Sign in to your account' : 'Create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signUpComplete ? (
            <div className="flex flex-col gap-4">
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
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              {error && <p className="text-sm text-destructive">{error}</p>}
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
                {mode === 'sign-in' ? 'Create an account' : 'Already have an account? Sign in'}
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
