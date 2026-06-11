import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReEngagementEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 })

  const now = Date.now()
  let sent = 0

  for (const user of users) {
    if (!user.email) continue

    const daysSinceSignup = Math.floor(
      (now - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (![2, 4, 7].includes(daysSinceSignup)) continue

    // Don't email if they've checked in recently
    const { count } = await supabase
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('checked_in_at', new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString())

    if (count !== 0) continue

    try {
      await sendReEngagementEmail(user.email, daysSinceSignup as 2 | 4 | 7)
      sent++
    } catch (err) {
      console.error('re-engagement email failed', user.id, err)
    }
  }

  return NextResponse.json({ sent })
}
