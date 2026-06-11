import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// --- Profiles ---
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// --- Goals ---
export async function getGoals(userId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*, profiles(*), check_ins(count)')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getGoal(goalId: string) {
  const { data, error } = await supabase
    .from('goals')
    .select('*, profiles(*), check_ins(*, profiles!check_ins_user_id_fkey(*), likes(*, profiles(*)), comments(*, profiles!comments_user_id_fkey(*)))')
    .eq('id', goalId)
    .single()
  if (error) throw error
  return data
}

export async function createGoal(goal: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGoal(goalId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()
  if (error) throw error
  return data
}

// --- Check-ins ---
export async function createCheckIn(checkIn: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('check_ins')
    .insert(checkIn)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getCheckIns(goalId: string) {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*, profiles!check_ins_user_id_fkey(*), likes(*, profiles(*)), comments(*, profiles!comments_user_id_fkey(*))')
    .eq('goal_id', goalId)
    .order('checked_in_at', { ascending: false })
  if (error) throw error
  return data
}

// --- Feed ---
export async function getFeedCheckIns(userId: string, filter: 'all' | 'friends' | 'groups' = 'all') {
  let query = supabase
    .from('check_ins')
    .select('*, profiles!check_ins_user_id_fkey(*), goals(*), likes(user_id), comments(id)')
    .order('checked_in_at', { ascending: false })
    .limit(50)

  if (filter === 'friends') {
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    const ids = (follows ?? []).map((f: { following_id: string }) => f.following_id)
    query = query.in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
  } else if (filter === 'groups') {
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId)
    const groupIds = (memberships ?? []).map((m: { group_id: string }) => m.group_id)
    const { data: groupGoals } = await supabase
      .from('goals')
      .select('id')
      .in('group_id', groupIds.length ? groupIds : ['00000000-0000-0000-0000-000000000000'])
    const goalIds = (groupGoals ?? []).map((g: { id: string }) => g.id)
    query = query.in('goal_id', goalIds.length ? goalIds : ['00000000-0000-0000-0000-000000000000'])
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// --- Follows ---
export async function followUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .insert({ follower_id: followerId, following_id: followingId })
  if (error) throw error
}

export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
  if (error) throw error
}

export async function isFollowing(followerId: string, followingId: string) {
  const { data } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single()
  return !!data
}

export async function getFollowCounts(userId: string) {
  const [{ count: followers }, { count: following }] = await Promise.all([
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId),
  ])
  return { followers: followers ?? 0, following: following ?? 0 }
}

// --- Likes ---
export async function likeCheckIn(userId: string, checkInId: string) {
  const { error } = await supabase
    .from('likes')
    .insert({ user_id: userId, check_in_id: checkInId })
  if (error) throw error
}

export async function unlikeCheckIn(userId: string, checkInId: string) {
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('user_id', userId)
    .eq('check_in_id', checkInId)
  if (error) throw error
}

// --- Comments ---
export async function addComment(comment: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select('*, profiles(*)')
    .single()
  if (error) throw error
  return data
}

// --- Groups ---
export async function getGroups(userId: string) {
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)
  const ids = (memberships ?? []).map((m: { group_id: string }) => m.group_id)
  if (!ids.length) return []
  const { data, error } = await supabase
    .from('groups')
    .select('*, profiles(*), group_members(count)')
    .in('id', ids)
  if (error) throw error
  return data
}

export async function getGroup(groupId: string) {
  const { data, error } = await supabase
    .from('groups')
    .select('*, profiles(*), group_members(*, profiles(*))')
    .eq('id', groupId)
    .single()
  if (error) throw error
  return data
}

export async function getPublicGroups() {
  const { data, error } = await supabase
    .from('groups')
    .select('*, profiles(*), group_members(count)')
    .eq('is_private', false)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data
}

export async function createGroup(group: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('groups')
    .insert(group)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function joinGroupByCode(inviteCode: string, userId: string) {
  const { data: group, error: gErr } = await supabase
    .from('groups')
    .select('id')
    .eq('invite_code', inviteCode)
    .single()
  if (gErr || !group) throw new Error('Invalid invite code')
  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId, role: 'member' })
  if (error) throw error
  return group
}

// --- Notifications ---
export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(*), goals(*), check_ins(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  if (error) throw error
}

export async function createNotification(notif: Record<string, unknown>) {
  const { error } = await supabase.from('notifications').insert(notif)
  if (error) console.error('notification error', error)
}

// --- Leaderboard ---
export async function getLeaderboard(
  metric: 'streak' | 'checkins' | 'completed' | 'rate',
  scope: 'global' | 'friends',
  category: string,
  userId: string
) {
  // For MVP, fetch profiles and compute stats from check_ins + goals
  let profileIds: string[] | null = null

  if (scope === 'friends') {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
    profileIds = (data ?? []).map((f: { following_id: string }) => f.following_id)
    profileIds.push(userId)
  }

  let profilesQuery = supabase.from('profiles').select('*').eq('is_public', true)
  if (profileIds) profilesQuery = profilesQuery.in('id', profileIds)

  const { data: profiles, error } = await profilesQuery.limit(100)
  if (error) throw error

  return profiles ?? []
}
