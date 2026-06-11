'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Profile } from '@/types'
import { calculateStreak } from '@/lib/streaks'
import { getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Flame, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type Metric = 'checkins7d' | 'streak' | 'total'
type Category = 'All' | 'Fitness' | 'Career' | 'Investing' | 'Academics' | 'Personal'
const CATEGORIES: Category[] = ['All', 'Fitness', 'Career', 'Investing', 'Academics', 'Personal']

interface Props {
  profiles: Profile[]
  recentCheckIns: any[]
  allCheckIns: any[]
  goals: any[]
  userId: string
}

interface Entry {
  profile: Profile
  stat: number
  rank: number
}

function computeEntries(
  profiles: Profile[],
  recentCheckIns: any[],
  allCheckIns: any[],
  metric: Metric,
  category: Category
): Entry[] {
  const entries = profiles.map(p => {
    let stat = 0
    if (metric === 'checkins7d') {
      stat = recentCheckIns.filter(c => {
        if (c.user_id !== p.id) return false
        if (category !== 'All' && c.goals?.category !== category) return false
        return true
      }).length
    } else if (metric === 'total') {
      stat = allCheckIns.filter(c => c.user_id === p.id).length
    } else if (metric === 'streak') {
      const userCIs = allCheckIns.filter(c => c.user_id === p.id).map(c => ({ ...c, checked_in_at: c.checked_in_at }))
      stat = calculateStreak(userCIs as any).current
    }
    return { profile: p, stat, rank: 0 }
  })

  return entries
    .sort((a, b) => b.stat - a.stat)
    .filter(e => e.stat > 0)
    .map((e, i) => ({ ...e, rank: i + 1 }))
    .slice(0, 50)
}

const RANK_COLORS = ['text-yellow-400', 'text-slate-300', 'text-amber-600']

export function LeaderboardsClient({ profiles, recentCheckIns, allCheckIns, goals, userId }: Props) {
  const [metric, setMetric] = useState<Metric>('checkins7d')
  const [category, setCategory] = useState<Category>('All')

  const entries = computeEntries(profiles, recentCheckIns, allCheckIns, metric, category)

  const metricLabel: Record<Metric, string> = {
    checkins7d: 'Check-ins (7d)',
    streak: 'Current streak',
    total: 'Total check-ins',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy size={22} className="text-yellow-400" /> Leaderboards
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={metric} onValueChange={v => setMetric(v as Metric)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checkins7d">Check-ins (7 days)</SelectItem>
            <SelectItem value="streak">Current streak</SelectItem>
            <SelectItem value="total">Total check-ins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={v => setCategory(v as Category)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-muted-foreground text-sm py-8 text-center">No data yet. Start checking in!</p>
        )}
        {entries.map(({ profile, stat, rank }) => (
          <Link key={profile.id} href={`/profile/${profile.username}`}>
            <Card className={cn("hover:border-primary/40 transition-colors", profile.id === userId && "border-primary/30 bg-primary/5")}>
              <CardContent className="p-3 flex items-center gap-3">
                <span className={cn("text-sm font-bold w-7 text-center", RANK_COLORS[rank - 1] ?? 'text-muted-foreground')}>
                  {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                </span>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {profile.full_name ?? profile.username}
                    {profile.id === userId && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                  </p>
                  {profile.school_or_company && (
                    <p className="text-xs text-muted-foreground truncate">{profile.school_or_company}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary flex items-center gap-1 justify-end">
                    {metric === 'streak' && <Flame size={14} className="text-orange-400" />}
                    {stat}
                  </p>
                  <p className="text-xs text-muted-foreground">{metricLabel[metric]}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
