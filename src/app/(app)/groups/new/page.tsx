'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'

export default function NewGroupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: group, error: gErr } = await supabase
      .from('groups')
      .insert({ name, description: description || null, created_by: user.id, is_private: isPrivate })
      .select()
      .single()

    if (gErr) { setError(gErr.message); setLoading(false); return }

    await supabase.from('group_members').insert({ group_id: group.id, user_id: user.id, role: 'admin' })
    router.push(`/groups/${group.id}`)
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/groups"><ArrowLeft size={16} /> Back</Link>
        </Button>
        <h1 className="text-xl font-bold">Create group</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md border border-destructive/20">{error}</div>}
            <div className="space-y-1.5">
              <Label>Group name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Vandy IB Grind" required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What's this group about?" rows={3} className="resize-none" />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium">Private group</p>
                <p className="text-xs text-muted-foreground">Only invite-link members can join</p>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create group'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
