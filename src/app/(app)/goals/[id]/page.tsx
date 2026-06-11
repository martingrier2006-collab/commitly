import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { GoalDetailClient } from './goal-detail-client'

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: goal, error } = await supabase
    .from('goals')
    .select('*, profiles(*), check_ins(*, profiles!check_ins_user_id_fkey(*), likes(user_id), comments(*, profiles!comments_user_id_fkey(*)))')
    .eq('id', id)
    .single()

  if (error) console.error('Goal fetch error:', JSON.stringify(error))
  if (!goal) notFound()

  return <GoalDetailClient goal={goal} userId={user.id} />
}
