'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Profile, Goal, CheckIn } from '@/types'
import { calculateStreak } from '@/lib/streaks'
import { getInitials } from '@/lib/utils'
import { GoalCard } from '@/components/goal-card'
import { CheckInModal } from '@/components/check-in-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Building2, Users, Target, Flame, CheckSquare } from 'lucide-react'

interface Props {
  profile: Profile
  goals: (Goal & { check_ins?: CheckIn[] })[]
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isOwner: boolean
  currentUserId: string
}

export function ProfileClient({ profile, goals, followerCount, followingCount, isFollowing: initFollowing, isOwner, currentUserId }: Props) {
  const qc = useQueryClient()
  const [following, setFollowing] = useState(initFollowing)
  const [followers, setFollowers] = useState(followerCount)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const { mutate: toggleFollow } = useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      if (following) {
        await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', profile.id)
      } else {
        await supabase.from('follows').insert({ follower_id: currentUserId, following_id: profile.id })
        await supabase.from('notifications').insert({
          user_id: profile.id, type: 'follow', actor_id: currentUserId,
        })
      }
    },
    onMutate: () => {
      setFollowing(f => !f)
      setFollowers(n => following ? n - 1 : n + 1)
    },
    onError: () => {
      setFollowing(f => !f)
      setFollowers(n => following ? n + 1 : n - 1)
    },
  })

  // Compute overall stats
  const totalCheckIns = goals.reduce((s, g) => s + (g.check_ins?.length ?? 0), 0)
  const longestStreak = goals.reduce((max, g) => {
    const s = calculateStreak(g.check_ins ?? [])
    return s.longest > max ? s.longest : max
  }, 0)
  const completedGoals = goals.filter(g => {
    if (!g.target_value) return false
    return (g.check_ins?.length ?? 0) >= g.target_value
  }).length

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-xl">{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold">{profile.full_name ?? profile.username}</h1>
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                  {profile.school_or_company && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Building2 size={13} /> {profile.school_or_company}
                    </p>
                  )}
                </div>
                {!isOwner && (
                  <Button
                    size="sm"
                    variant={following ? "secondary" : "default"}
                    onClick={() => toggleFollow()}
                    className="shrink-0"
                  >
                    {following ? 'Following' : 'Follow'}
                  </Button>
                )}
                {isOwner && (
                  <Button size="sm" variant="secondary" asChild>
                    <Link href="/settings">Edit profile</Link>
                  </Button>
                )}
              </div>

              {profile.bio && <p className="text-sm mt-2">{profile.bio}</p>}

              <div className="flex gap-4 mt-3 text-sm">
                <span><strong>{followers}</strong> <span className="text-muted-foreground">followers</span></span>
                <span><strong>{followingCount}</strong> <span className="text-muted-foreground">following</span></span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Target, label: 'Active goals', value: goals.length },
              { icon: CheckSquare, label: 'Completed', value: completedGoals },
              { icon: Flame, label: 'Best streak', value: longestStreak },
              { icon: CheckSquare, label: 'Check-ins', value: totalCheckIns },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Goals */}
      <div className="space-y-3">
        <h2 className="font-semibold">Goals ({goals.length})</h2>
        {goals.length === 0 && (
          <p className="text-muted-foreground text-sm">No public goals yet.</p>
        )}
        {goals.map(g => (
          <GoalCard key={g.id} goal={g} onCheckIn={isOwner ? setSelectedGoal : undefined} showCheckIn={isOwner} />
        ))}
      </div>

      {isOwner && (
        <CheckInModal goal={selectedGoal} open={!!selectedGoal} onClose={() => setSelectedGoal(null)} userId={currentUserId} />
      )}
    </div>
  )
}
