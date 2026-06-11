'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

export function JoinGroupForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: group, error: gErr } = await supabase
      .from('groups')
      .select('id')
      .eq('invite_code', code.trim().toUpperCase())
      .single()

    if (gErr || !group) {
      setError('Invalid invite code')
      setLoading(false)
      return
    }

    const { error: joinErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id, role: 'member' })

    if (joinErr && !joinErr.message.includes('duplicate')) {
      setError(joinErr.message)
      setLoading(false)
      return
    }

    router.push(`/groups/${group.id}`)
    router.refresh()
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <form onSubmit={handleJoin} className="flex gap-2">
          <Input
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter invite code…"
            className="uppercase"
          />
          <Button type="submit" variant="secondary" disabled={loading || !code.trim()}>
            Join
          </Button>
        </form>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </CardContent>
    </Card>
  )
}
