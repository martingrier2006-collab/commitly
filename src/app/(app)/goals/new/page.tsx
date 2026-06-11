'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category, MetricType, Visibility } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES: Category[] = ['Fitness', 'Career', 'Investing', 'Academics', 'Personal', 'Other']
const METRICS: { value: MetricType; label: string }[] = [
  { value: 'boolean', label: 'Done / not done' },
  { value: 'number', label: 'Number (count, reps…)' },
  { value: 'streak', label: 'Streak (daily habit)' },
  { value: 'money', label: 'Money ($)' },
  { value: 'time', label: 'Time (hours)' },
  { value: 'weight', label: 'Weight (lbs/kg)' },
  { value: 'custom', label: 'Custom' },
]

export default function NewGoalPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '', description: '', category: '' as Category | '',
    metric_type: '' as MetricType | '', target_value: '',
    target_unit: '', deadline: '', visibility: 'public' as Visibility,
    wager_description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error } = await supabase.from('goals').insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      category: form.category || null,
      metric_type: form.metric_type || null,
      target_value: form.target_value ? parseFloat(form.target_value) : null,
      target_unit: form.target_unit || null,
      deadline: form.deadline || null,
      visibility: form.visibility,
      wager_description: form.wager_description || null,
    }).select().single()

    if (error) { setError(error.message); setLoading(false); return }
    router.push(`/goals/${data.id}`)
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/dashboard"><ArrowLeft size={16} /> Back</Link>
        </Button>
        <h1 className="text-xl font-bold">New goal</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">{error}</div>
            )}

            <div className="space-y-1.5">
              <Label>Goal title *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Run 5 days/week" required />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="What's this goal about?" rows={2} className="resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => set('category', v as Category)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Metric type</Label>
                <Select value={form.metric_type} onValueChange={v => set('metric_type', v as MetricType)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {METRICS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.metric_type && form.metric_type !== 'boolean' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target value</Label>
                  <Input type="number" value={form.target_value} onChange={e => set('target_value', e.target.value)} placeholder="100" />
                </div>
                <div className="space-y-1.5">
                  <Label>Unit</Label>
                  <Input value={form.target_unit} onChange={e => set('target_unit', e.target.value)} placeholder="sessions, lbs, $…" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Deadline</Label>
                <Input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Visibility</Label>
                <Select value={form.visibility} onValueChange={v => set('visibility', v as Visibility)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Wager / stakes (optional)</Label>
              <Input value={form.wager_description} onChange={e => set('wager_description', e.target.value)} placeholder="If I miss 3 days, I owe my roommate $20" />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create goal'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
