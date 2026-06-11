import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeaderboardsClient } from './leaderboards-client'

export default async function LeaderboardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all public profiles with their check-in counts and goals
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .limit(100)

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('user_id, checked_in_at, goal_id, goals(category)')
    .gte('checked_in_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { data: allCheckIns } = await supabase
    .from('check_ins')
    .select('user_id, checked_in_at')

  const { data: goals } = await supabase
    .from('goals')
    .select('user_id, is_active, target_value, id')
    .eq('visibility', 'public')

  return (
    <LeaderboardsClient
      profiles={profiles ?? []}
      recentCheckIns={checkIns ?? []}
      allCheckIns={allCheckIns ?? []}
      goals={goals ?? []}
      userId={user.id}
    />
  )
}
