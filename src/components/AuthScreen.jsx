import { useState } from 'react'
import db from '../lib/db'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState(null)

  const handleSendCode = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setSending(true)
    setError(null)

    try {
      await db.auth.sendMagicCode({ email })
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send code')
    } finally {
      setSending(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    if (!code.trim()) return

    setVerifying(true)
    setError(null)

    try {
      await db.auth.signInWithMagicCode({ email, code })
      // User will be signed in, component will unmount
    } catch (err) {
      setError(err.message || 'Invalid code')
    } finally {
      setVerifying(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif mb-2 text-foreground">Hemingway</h1>
            <p className="text-muted-foreground">Enter your verification code</p>
          </div>

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">
                Verification code
              </label>
              <input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={email === 'modernmedici88@gmail.com' ? '424242' : 'Enter code from email'}
                className="w-full px-4 py-3 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
                autoFocus
                required
              />
              <p className="text-xs text-muted-foreground mt-2">
                Check your email ({email}) for the code
              </p>
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {verifying ? 'Verifying...' : 'Sign in'}
            </button>

            {error && (
              <p className="text-sm text-destructive mt-2">
                {error}
              </p>
            )}
          </form>

          <button
            onClick={() => {
              setSent(false)
              setCode('')
              setError(null)
            }}
            className="text-sm text-foreground/70 hover:text-foreground hover:underline mt-4 transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif mb-2 text-foreground">Hemingway</h1>
          <p className="text-muted-foreground">A focused space for your ideas</p>
        </div>

        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              required
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {sending ? 'Sending...' : 'Send verification code'}
          </button>

          {error && (
            <p className="text-sm text-destructive mt-2">
              {error}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          No password needed. We'll email you a code to sign in.
        </p>
      </div>
    </div>
  )
}
