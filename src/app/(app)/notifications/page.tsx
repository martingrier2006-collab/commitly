import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NotificationsClient } from './notifications-client'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(*), goals(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Mark as read after loading
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false)

  return <NotificationsClient notifications={notifications ?? []} userId={user.id} />
}
