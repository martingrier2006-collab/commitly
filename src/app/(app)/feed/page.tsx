import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedClient } from './feed-client'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: checkIns } = await supabase
    .from('check_ins')
    .select('*, profiles!check_ins_user_id_fkey(*), goals(*), likes(user_id), comments(id, body, created_at, profiles!comments_user_id_fkey(*))')
    .order('checked_in_at', { ascending: false })
    .limit(50)

  return <FeedClient initialFeed={checkIns ?? []} userId={user.id} />
}
