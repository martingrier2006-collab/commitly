'use client'

import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Goal } from '@/types'
import { calculateStreak } from '@/lib/streaks'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MilestoneModal } from '@/components/milestone-modal'
import { Flame, CheckCircle, ImagePlus, X } from 'lucide-react'

interface Props {
  goal: Goal | null
  open: boolean
  onClose: () => void
  userId: string
}

const MILESTONES = new Set([7, 14, 30, 50, 100])

export function CheckInModal({ goal, open, onClose, userId }: Props) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [milestone, setMilestone] = useState<number | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function clearFile() {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function reset() {
    setValue('')
    setNote('')
    setFile(null)
    setPreview(null)
    setDone(false)
    setMilestone(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleClose() {
    reset()
    onClose()
  }

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const supabase = createClient()

      let proofUrl: string | null = null

      if (file) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${userId}/${goal!.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage
          .from('proofs')
          .upload(path, file, { upsert: false })
        if (!uploadErr) {
          const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path)
          proofUrl = publicUrl
        }
      }

      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          goal_id: goal!.id,
          user_id: userId,
          value: value ? parseFloat(value) : null,
          note: note || null,
          proof_url: proofUrl,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ['goals', userId] })
      qc.invalidateQueries({ queryKey: ['check_ins', goal?.id] })
      qc.invalidateQueries({ queryKey: ['feed'] })

      // Fetch fresh check-ins to accurately detect milestone
      const supabase = createClient()
      const { data: freshCheckIns } = await supabase
        .from('check_ins')
        .select('checked_in_at')
        .eq('goal_id', goal!.id)
        .eq('user_id', userId)
        .order('checked_in_at', { ascending: false })

      const { current: newStreak } = calculateStreak(freshCheckIns ?? [])
      const hit = MILESTONES.has(newStreak) ? newStreak : null

      setMilestone(hit)
      setDone(true)

      if (!hit) {
        setTimeout(() => {
          reset()
          onClose()
        }, 1200)
      }
    },
  })

  if (!goal) return null

  const needsValue = goal.metric_type !== 'boolean'

  return (
    <>
      <Dialog open={open && !milestone} onOpenChange={v => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flame size={18} className="text-orange-400" />
              Check in
            </DialogTitle>
          </DialogHeader>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <CheckCircle size={48} className="text-emerald-400" />
              <p className="font-semibold text-lg">Checked in!</p>
              <p className="text-sm text-muted-foreground">Streak extended. Keep going.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm">{goal.title}</p>
                {goal.target_unit && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target: {goal.target_value} {goal.target_unit}
                  </p>
                )}
              </div>

              {needsValue && (
                <div className="space-y-1.5">
                  <Label>
                    {goal.metric_type === 'money' ? 'Amount ($)' :
                     goal.metric_type === 'weight' ? `Weight (${goal.target_unit ?? 'lbs'})` :
                     goal.metric_type === 'time' ? 'Hours' : 'Value'}
                  </Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={e => setValue(e.target.value)}
                    placeholder={goal.target_value?.toString() ?? '0'}
                    autoFocus
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Note <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Brief note for your feed…"
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Proof upload */}
              <div className="space-y-1.5">
                <Label>Proof <span className="text-muted-foreground font-normal">(optional)</span></Label>
                {preview ? (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="proof"
                      className="w-full h-32 object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-1.5 right-1.5 bg-black/70 rounded-full p-0.5 hover:bg-black/90"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                  >
                    <ImagePlus size={20} />
                    <span className="text-xs">Upload photo</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => mutate()}
                disabled={isPending || (needsValue && !value)}
              >
                {isPending ? 'Submitting…' : 'Submit check-in'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MilestoneModal
        streak={milestone ?? 0}
        goalTitle={goal.title}
        open={!!milestone}
        onClose={() => {
          setMilestone(null)
          reset()
          onClose()
        }}
      />
    </>
  )
}
