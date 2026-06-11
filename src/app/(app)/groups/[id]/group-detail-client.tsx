'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Group, Goal, CheckIn, Profile } from '@/types'
import { timeAgo, getInitials } from '@/lib/utils'
import { GoalCard } from '@/components/goal-card'
import { CheckInModal } from '@/components/check-in-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Users, Lock } from 'lucide-react'

interface Props {
  group: Group & { group_members: (any & { profiles?: Profile })[] }
  goals: (Goal & { check_ins?: CheckIn[]; profiles?: Profile })[]
  feed: any[]
  leaderboard: any[]
  userId: string
}

export function GroupDetailClient({ group, goals, feed, leaderboard, userId }: Props) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [copied, setCopied] = useState(false)

  function copyInvite() {
    navigator.clipboard.writeText(group.invite_code ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isMember = group.group_members.some((m: any) => m.user_id === userId)

  return (
    <div className="space-y-6">
      {/* Group header */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{group.name}</h1>
                {group.is_private && <Lock size={16} className="text-muted-foreground" />}
              </div>
              {group.description && <p className="text-sm text-muted-foreground mt-1">{group.description}</p>}
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                <Users size={12} /> {group.group_members.length} members
              </p>
            </div>
            {isMember && (
              <Button size="sm" variant="secondary" className="gap-2 shrink-0" onClick={copyInvite}>
                <Copy size={14} /> {copied ? 'Copied!' : 'Invite link'}
              </Button>
            )}
          </div>
          {group.invite_code && isMember && (
            <div className="bg-muted rounded-md px-3 py-2 text-sm font-mono">
              Code: <span className="text-primary font-bold">{group.invite_code}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="leaderboard">
        <TabsList className="w-full">
          <TabsTrigger value="leaderboard" className="flex-1">Leaderboard</TabsTrigger>
          <TabsTrigger value="goals" className="flex-1">Goals</TabsTrigger>
          <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
          <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
        </TabsList>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm">This week's check-ins</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {leaderboard.map((entry: any, i: number) => (
                <div key={entry.user_id} className="flex items-center gap-3 py-1">
                  <span className="text-sm font-bold text-muted-foreground w-5 text-right">{i + 1}</span>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={entry.profiles?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(entry.profiles?.full_name)}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profile/${entry.profiles?.username}`} className="flex-1 text-sm font-medium hover:text-primary truncate">
                    {entry.profiles?.full_name ?? entry.profiles?.username}
                  </Link>
                  <span className="text-sm font-bold text-primary">{entry.weekCheckIns}</span>
                  <span className="text-xs text-muted-foreground">check-ins</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals */}
        <TabsContent value="goals" className="mt-4 space-y-3">
          {goals.map(g => (
            <GoalCard key={g.id} goal={g} onCheckIn={g.user_id === userId ? setSelectedGoal : undefined} showCheckIn={g.user_id === userId} />
          ))}
        </TabsContent>

        {/* Feed */}
        <TabsContent value="feed" className="mt-4 space-y-3">
          {feed.map((item: any) => {
            const actor = item.profiles
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={actor?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(actor?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <Link href={`/profile/${actor?.username}`} className="font-medium hover:text-primary">{actor?.full_name ?? actor?.username}</Link>
                        <span className="text-muted-foreground"> checked in</span>
                        {item.note && <span className="text-muted-foreground"> — {item.note}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{timeAgo(item.checked_in_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        {/* Members */}
        <TabsContent value="members" className="mt-4">
          <div className="space-y-2">
            {group.group_members.map((m: any) => (
              <Link key={m.user_id} href={`/profile/${m.profiles?.username}`}>
                <Card className="hover:border-primary/40 transition-colors">
                  <CardContent className="p-3 flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={m.profiles?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(m.profiles?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.profiles?.full_name ?? m.profiles?.username}</p>
                      <p className="text-xs text-muted-foreground">@{m.profiles?.username}</p>
                    </div>
                    {m.role === 'admin' && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <CheckInModal goal={selectedGoal} open={!!selectedGoal} onClose={() => setSelectedGoal(null)} userId={userId} />
    </div>
  )
}
