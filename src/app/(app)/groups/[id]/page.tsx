import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { GroupDetailClient } from './group-detail-client'

export default async function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: group } = await supabase
    .from('groups')
    .select('*, profiles(*), group_members(*, profiles(*))')
    .eq('id', id)
    .single()

  if (!group) notFound()

  const memberIds = group.group_members.map((m: any) => m.user_id)

  const [{ data: groupGoals }, { data: groupFeed }] = await Promise.all([
    supabase.from('goals').select('*, check_ins(*), profiles(*)').in('user_id', memberIds).eq('is_active', true),
    supabase
      .from('check_ins')
      .select('*, profiles(*), goals(*), likes(user_id), comments(id)')
      .in('user_id', memberIds)
      .order('checked_in_at', { ascending: false })
      .limit(30),
  ])

  // Compute weekly leaderboard
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const leaderboard = group.group_members.map((m: any) => {
    const weekCheckIns = (groupFeed ?? []).filter((c: any) =>
      c.user_id === m.user_id && new Date(c.checked_in_at) >= weekAgo
    ).length
    return { ...m, weekCheckIns }
  }).sort((a: any, b: any) => b.weekCheckIns - a.weekCheckIns)

  return (
    <GroupDetailClient
      group={group}
      goals={groupGoals ?? []}
      feed={groupFeed ?? []}
      leaderboard={leaderboard}
      userId={user.id}
    />
  )
}
