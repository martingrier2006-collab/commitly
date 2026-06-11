'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile, Goal } from '@/types'
import { getInitials, formatDate } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import { Shield, Users, Target, BarChart3, CheckSquare } from 'lucide-react'

interface Props {
  profiles: Profile[]
  goals: any[]
  checkIns: { checked_in_at: string; user_id: string }[]
  groups: any[]
  userCount: number
  goalCount: number
  groupCount: number
}

function buildDailyChart(checkIns: { checked_in_at: string }[], days = 30) {
  const counts: Record<string, number> = {}
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    counts[d.toISOString().split('T')[0]] = 0
  }
  for (const ci of checkIns) {
    const key = ci.checked_in_at.split('T')[0]
    if (key in counts) counts[key]++
  }
  return Object.entries(counts).map(([date, count]) => ({ date: date.slice(5), count }))
}

function retentionRate(checkIns: { checked_in_at: string; user_id: string }[]) {
  const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const userCheckInDays = new Map<string, Set<string>>()
  for (const ci of checkIns) {
    if (new Date(ci.checked_in_at) >= since7) {
      if (!userCheckInDays.has(ci.user_id)) userCheckInDays.set(ci.user_id, new Set())
      userCheckInDays.get(ci.user_id)!.add(ci.checked_in_at.split('T')[0])
    }
  }
  const retained = Array.from(userCheckInDays.values()).filter(days => days.size >= 3).length
  return userCheckInDays.size === 0 ? 0 : Math.round((retained / userCheckInDays.size) * 100)
}

export function AdminClient({ profiles, goals, checkIns, groups, userCount, goalCount, groupCount }: Props) {
  const [userSearch, setUserSearch] = useState('')
  const [goalSearch, setGoalSearch] = useState('')
  const [deletedUsers, setDeletedUsers] = useState<Set<string>>(new Set())
  const [deletedGoals, setDeletedGoals] = useState<Set<string>>(new Set())

  const chartData = buildDailyChart(checkIns)
  const retention = retentionRate(checkIns)

  const { mutate: banUser } = useMutation({
    mutationFn: async (userId: string) => {
      const supabase = createClient()
      await supabase.from('profiles').update({ is_public: false } as any).eq('id', userId)
    },
    onSuccess: (_, userId) => setDeletedUsers(prev => new Set([...prev, userId])),
  })

  const { mutate: deleteGoal } = useMutation({
    mutationFn: async (goalId: string) => {
      const supabase = createClient()
      await supabase.from('goals').update({ is_active: false }).eq('id', goalId)
    },
    onSuccess: (_, goalId) => setDeletedGoals(prev => new Set([...prev, goalId])),
  })

  const filteredProfiles = profiles.filter(p =>
    p.username.includes(userSearch.toLowerCase()) ||
    (p.full_name ?? '').toLowerCase().includes(userSearch.toLowerCase())
  )
  const filteredGoals = goals.filter(g =>
    g.title.toLowerCase().includes(goalSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield size={22} className="text-primary" />
        <h1 className="text-2xl font-bold">Admin</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total users', value: userCount },
          { icon: Target, label: 'Total goals', value: goalCount },
          { icon: CheckSquare, label: 'Check-ins (30d)', value: checkIns.length },
          { icon: BarChart3, label: 'Retention (7d)', value: `${retention}%` },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Check-ins per day (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="oklch(1 0 0 / 30%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="oklch(1 0 0 / 30%)" />
              <Tooltip
                contentStyle={{ background: 'oklch(0.12 0.02 264)', border: '1px solid oklch(1 0 0 / 10%)', borderRadius: 6, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="count" stroke="oklch(0.6 0.2 264)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Users */}
        <TabsContent value="users" className="mt-4 space-y-3">
          <Input
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            placeholder="Search users…"
            className="max-w-sm"
          />
          <div className="space-y-2">
            {filteredProfiles.map(p => !deletedUsers.has(p.id) && (
              <Card key={p.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={p.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(p.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.full_name ?? p.username}</p>
                    <p className="text-xs text-muted-foreground">@{p.username} · {p.school_or_company ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.is_admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                    <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => banUser(p.id)}>
                      Ban
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Goals */}
        <TabsContent value="goals" className="mt-4 space-y-3">
          <Input
            value={goalSearch}
            onChange={e => setGoalSearch(e.target.value)}
            placeholder="Search goals…"
            className="max-w-sm"
          />
          <div className="space-y-2">
            {filteredGoals.map(g => !deletedGoals.has(g.id) && (
              <Card key={g.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{g.title}</p>
                    <p className="text-xs text-muted-foreground">
                      by @{g.profiles?.username} · {g.category ?? 'No category'} · {formatDate(g.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 text-xs px-2" asChild>
                      <Link href={`/goals/${g.id}`}>View</Link>
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 text-xs px-2" onClick={() => deleteGoal(g.id)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
