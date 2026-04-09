import { useState } from 'react'
import db from '../lib/db'

export function AuthScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    db.auth.signInWithMagicCode({ email })
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="max-w-md w-full px-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)] flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-medium text-[var(--text)]">Check your email</h2>
            <p className="text-[var(--text-dim)]">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-[var(--text-dim)]">
              Click the link in the email to sign in.
            </p>
            <button
              onClick={() => setSent(false)}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="max-w-md w-full px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif mb-2 text-[var(--text)]">Hemingway</h1>
          <p className="text-[var(--text-dim)]">A focused space for your ideas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text)] mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text)] placeholder:text-[var(--text-dim)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
          >
            Send magic link
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-dim)] mt-6">
          No password needed. We'll email you a link to sign in.
        </p>
      </div>
    </div>
  )
}
