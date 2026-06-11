'use client'

import { useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const MESSAGES: Record<number, string> = {
  7:   "One week straight. Most people don't make it here.",
  14:  "Two weeks. You're building a real habit.",
  30:  "30 days. That's discipline.",
  50:  "50 days in. This is who you are now.",
  100: "100 days. Legendary.",
}

interface Props {
  streak: number
  goalTitle: string
  open: boolean
  onClose: () => void
}

export function MilestoneModal({ streak, goalTitle, open, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const t = setTimeout(onClose, 6000)
    return () => clearTimeout(t)
  }, [open, onClose])

  function copyShare() {
    navigator.clipboard?.writeText(
      `🔥 ${streak}-day streak on "${goalTitle}" — committing publicly on Commitly`
    )
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose() }}>
      <DialogContent className="sm:max-w-xs text-center">
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-6xl animate-bounce">🔥</div>
          <div>
            <p className="text-6xl font-black text-orange-400 leading-none">{streak}</p>
            <p className="text-xl font-semibold mt-1">day streak</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {MESSAGES[streak] ?? `${streak} days on "${goalTitle}". Keep going.`}
          </p>
          <div className="flex gap-2 w-full pt-2">
            <Button variant="secondary" className="flex-1 text-xs" onClick={copyShare}>
              Copy to share
            </Button>
            <Button className="flex-1 text-xs" onClick={onClose}>
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
