import { WifiOff, RefreshCw } from 'lucide-react'
import db from '../lib/db'

export default function ConnectionBanner() {
  const status = db.useConnectionStatus()

  if (status !== 'closed' && status !== 'errored') return null

  return (
    <div className="bg-destructive/10 border-b border-destructive/20">
      <div className="max-w-5xl mx-auto px-6 py-2.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <WifiOff size={16} className="text-destructive/70 flex-shrink-0" />
            <p className="text-sm font-sans font-medium text-foreground/80">
              Connection lost. Changes may not save until reconnected.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            <RefreshCw size={12} />
            Reload
          </button>
        </div>
      </div>
    </div>
  )
}
