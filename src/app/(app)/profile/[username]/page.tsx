import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ProfileClient } from './profile-client'

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  const [{ data: goals }, { count: followerCount }, { count: followingCount }, { data: followRow }] = await Promise.all([
    supabase.from('goals').select('*, check_ins(*)').eq('user_id', profile.id).eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).single(),
  ])

  return (
    <ProfileClient
      profile={profile}
      goals={goals ?? []}
      followerCount={followerCount ?? 0}
      followingCount={followingCount ?? 0}
      isFollowing={!!followRow}
      isOwner={user.id === profile.id}
      currentUserId={user.id}
    />
  )
}
