import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: goals }, { data: profile }, { data: feedCheckIns }] = await Promise.all([
    supabase
      .from('goals')
      .select('*, check_ins(*, profiles!check_ins_user_id_fkey(*))')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('check_ins')
      .select('*, profiles!check_ins_user_id_fkey(*), goals(*), likes(user_id), comments(id)')
      .order('checked_in_at', { ascending: false })
      .limit(20),
  ])

  return (
    <DashboardClient
      initialGoals={goals ?? []}
      profile={profile}
      userId={user.id}
      initialFeed={feedCheckIns ?? []}
    />
  )
}
