import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateStreak } from '@/lib/streaks'
import { sendStreakRiskEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map(users.map(u => [u.id, u.email ?? null]))

  const since = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString()
  const { data: goals } = await supabase
    .from('goals')
    .select('id, user_id, title, check_ins(user_id, checked_in_at)')
    .eq('is_active', true)
    .gte('check_ins.checked_in_at', since)

  if (!goals) return NextResponse.json({ sent: 0 })

  const usersAtRisk = new Map<string, { goalTitles: string[]; streak: number }>()

  for (const goal of goals) {
    const checkIns = (goal.check_ins ?? []) as { checked_in_at: string }[]
    const streak = calculateStreak(checkIns)
    if (!streak.atRisk || streak.current === 0) continue

    const existing = usersAtRisk.get(goal.user_id) ?? { goalTitles: [], streak: 0 }
    usersAtRisk.set(goal.user_id, {
      goalTitles: [...existing.goalTitles, goal.title],
      streak: Math.max(existing.streak, streak.current),
    })
  }

  let sent = 0
  for (const [userId, { goalTitles, streak }] of usersAtRisk) {
    const email = emailMap.get(userId)
    if (!email) continue
    try {
      await sendStreakRiskEmail(email, goalTitles, streak)
      sent++
    } catch (err) {
      console.error('streak-risk email failed', userId, err)
    }
  }

  return NextResponse.json({ sent, atRisk: usersAtRisk.size })
}
