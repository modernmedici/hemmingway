import { AlertCircle } from 'lucide-react'

export default function EditLockBanner({ editorName }) {
  return (
    <div className="bg-accent/20 border border-border/15 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle size={18} className="text-foreground/30 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-sans font-medium text-foreground/70 mb-1">
            {editorName} is editing this post
          </p>
          <p className="text-xs font-sans text-muted-foreground/60">
            You'll see their changes in real time. The post will be editable when they're done.
          </p>
        </div>
      </div>
    </div>
  )
}
