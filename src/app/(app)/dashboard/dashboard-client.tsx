'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { Goal, Profile, CheckIn } from '@/types'
import { calculateStreak } from '@/lib/streaks'
import { formatDate, timeAgo, getInitials, CATEGORY_BG } from '@/lib/utils'
import { GoalCard } from '@/components/goal-card'
import { CheckInModal } from '@/components/check-in-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Flame, Target, Calendar, Plus, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  initialGoals: Goal[]
  profile: Profile | null
  userId: string
  initialFeed: CheckIn[]
}

export function DashboardClient({ initialGoals, profile, userId, initialFeed }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const { data: goals = initialGoals } = useQuery({
    queryKey: ['goals', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('goals')
        .select('*, check_ins(*, profiles!check_ins_user_id_fkey(*))')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      return data ?? []
    },
    initialData: initialGoals,
  })

  // Compute stats
  const totalStreak = goals.reduce((max, g) => {
    const s = calculateStreak(g.check_ins ?? [])
    return s.current > max ? s.current : max
  }, 0)

  const today = new Date().toDateString()
  const dueTodayGoals = goals.filter(g => {
    const checkedToday = (g.check_ins ?? []).some((c: { checked_in_at: string }) => new Date(c.checked_in_at).toDateString() === today)
    return !checkedToday
  })

  const upcoming = goals
    .filter(g => g.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]}` : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link href="/goals/new"><Plus size={15} /> New goal</Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-orange-400">
              <Flame size={18} />
              <span className="text-2xl font-bold">{totalStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-primary">
              <Target size={18} />
              <span className="text-2xl font-bold">{goals.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Active goals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col gap-1">
            <div className={cn("flex items-center gap-2", dueTodayGoals.length > 0 ? "text-orange-400" : "text-emerald-400")}>
              <Calendar size={18} />
              <span className="text-2xl font-bold">{dueTodayGoals.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Due today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Your goals</h2>
            <Link href="/goals/new" className="text-xs text-primary hover:underline">+ Add goal</Link>
          </div>
          {goals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No goals yet.</p>
                <Button asChild className="mt-4" size="sm">
                  <Link href="/goals/new">Create your first goal</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {goals.map(goal => (
                <GoalCard key={goal.id} goal={goal} onCheckIn={setSelectedGoal} showCheckIn />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Upcoming deadlines */}
          {upcoming.length > 0 && (
            <Card>
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold">Upcoming deadlines</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {upcoming.map(g => (
                  <Link key={g.id} href={`/goals/${g.id}`} className="flex items-center justify-between text-sm hover:text-primary transition-colors">
                    <span className="truncate">{g.title}</span>
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">{formatDate(g.deadline!)}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Activity feed */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Activity
                <Link href="/feed" className="text-xs text-primary font-normal hover:underline">See all</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {initialFeed.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">
                  No activity yet.{' '}
                  <Link href="/feed" className="text-primary hover:underline">Follow people</Link>
                  {' '}to see their check-ins here.
                </p>
              )}
              {initialFeed.slice(0, 8).map(item => {
                const actor = (item as CheckIn & { profiles?: Profile }).profiles
                return (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarImage src={actor?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(actor?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs">
                        <Link href={`/profile/${actor?.username}`} className="font-medium hover:text-primary">
                          {actor?.full_name ?? actor?.username}
                        </Link>
                        {' '}checked in
                      </p>
                      {item.note && <p className="text-xs text-muted-foreground truncate">{item.note}</p>}
                      <p className="text-xs text-muted-foreground/60">{timeAgo(item.checked_in_at)}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <CheckInModal goal={selectedGoal} open={!!selectedGoal} onClose={() => setSelectedGoal(null)} userId={userId} />
    </div>
  )
}
