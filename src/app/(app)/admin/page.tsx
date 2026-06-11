import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminClient } from './admin-client'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const [
    { data: profiles, count: userCount },
    { data: goals, count: goalCount },
    { data: checkIns },
    { data: groups, count: groupCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
    supabase.from('goals').select('*, profiles(username, full_name)', { count: 'exact' }).order('created_at', { ascending: false }).limit(100),
    supabase.from('check_ins').select('checked_in_at, user_id').gte('checked_in_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    supabase.from('groups').select('*', { count: 'exact' }),
  ])

  return (
    <AdminClient
      profiles={profiles ?? []}
      goals={goals ?? []}
      checkIns={checkIns ?? []}
      groups={groups ?? []}
      userCount={userCount ?? 0}
      goalCount={goalCount ?? 0}
      groupCount={groupCount ?? 0}
    />
  )
}
