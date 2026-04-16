import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

// Detect if the user is on Safari (not Chrome-based browsers like Arc)
function isSafari() {
  const ua = navigator.userAgent.toLowerCase()
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium')
}

export default function SafariBanner() {
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    setShouldShow(isSafari())
  }, [])

  if (!shouldShow) return null

  return (
    <div className="bg-accent/30 border-b border-border/10">
      <div className="max-w-5xl mx-auto px-6 py-2.5">
        <div className="flex items-start gap-2.5">
          <AlertCircle size={18} className="text-foreground/40 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-sans font-medium text-foreground/80 mb-0.5">
              Safari's privacy settings may prevent some features from working
            </p>
            <p className="text-xs font-sans text-muted-foreground/70">
              For the best experience, we recommend using Chrome, Firefox, or Arc.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
