'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Goal, CheckIn, Profile } from '@/types'
import { calculateStreak, getStreakCalendar } from '@/lib/streaks'
import { timeAgo, getInitials, formatDate, CATEGORY_BG, progressPercent } from '@/lib/utils'
import { CheckInModal } from '@/components/check-in-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Flame, Heart, MessageCircle, ArrowLeft, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  goal: Goal & { check_ins?: (CheckIn & { profiles?: Profile; likes?: { user_id: string }[]; comments?: (Comment & { profiles?: Profile })[] })[] }
  userId: string
}

export function GoalDetailClient({ goal, userId }: Props) {
  const qc = useQueryClient()
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  const checkIns = goal.check_ins ?? []
  const streak = calculateStreak(checkIns)
  const calendar = getStreakCalendar(checkIns, 30)
  const calendarEntries = Array.from(calendar.entries()).reverse()
  const progress = progressPercent(checkIns.length, goal.target_value)

  const { mutate: toggleLike } = useMutation({
    mutationFn: async ({ checkInId, liked }: { checkInId: string; liked: boolean }) => {
      const supabase = createClient()
      if (liked) {
        await supabase.from('likes').delete().eq('user_id', userId).eq('check_in_id', checkInId)
      } else {
        await supabase.from('likes').insert({ user_id: userId, check_in_id: checkInId })
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goal', goal.id] }),
  })

  const { mutate: postComment } = useMutation({
    mutationFn: async (checkInId: string) => {
      const supabase = createClient()
      await supabase.from('comments').insert({
        user_id: userId,
        goal_id: goal.id,
        check_in_id: checkInId,
        body: commentText[checkInId],
      })
    },
    onSuccess: (_, checkInId) => {
      setCommentText(prev => ({ ...prev, [checkInId]: '' }))
      qc.invalidateQueries({ queryKey: ['goal', goal.id] })
    },
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/dashboard"><ArrowLeft size={16} /> Back</Link>
        </Button>
      </div>

      {/* Goal header */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              {goal.category && (
                <Badge variant="secondary" className={cn("text-xs", CATEGORY_BG[goal.category])}>{goal.category}</Badge>
              )}
              <h1 className="text-2xl font-bold">{goal.title}</h1>
              {goal.description && <p className="text-muted-foreground text-sm">{goal.description}</p>}
              {goal.deadline && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={11} /> Deadline: {formatDate(goal.deadline)}
                </p>
              )}
              {goal.wager_description && (
                <p className="text-xs text-amber-400/90 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20">
                  Stakes: {goal.wager_description}
                </p>
              )}
            </div>
            <div className="text-center shrink-0">
              <div className="text-3xl font-bold text-orange-400 flex items-center gap-1">
                <Flame size={24} /> {streak.current}
              </div>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </div>

          {goal.target_value && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{checkIns.length} / {goal.target_value} {goal.target_unit ?? ''}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {userId === goal.user_id && (
            <Button onClick={() => setCheckInOpen(true)} className="w-full gap-2">
              <Flame size={15} /> Check in now
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Streak heatmap */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm">Last 30 days</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="flex flex-wrap gap-1">
            {calendarEntries.map(([date, hit]) => (
              <div
                key={date}
                title={date}
                className={cn(
                  "w-6 h-6 rounded-sm transition-colors",
                  hit ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Longest streak: {streak.longest} days</p>
        </CardContent>
      </Card>

      {/* Check-ins list */}
      <div className="space-y-3">
        <h2 className="font-semibold">Check-ins ({checkIns.length})</h2>
        {checkIns.length === 0 && (
          <p className="text-muted-foreground text-sm">No check-ins yet.</p>
        )}
        {checkIns.map(ci => {
          const actor = ci.profiles
          const liked = (ci.likes ?? []).some(l => l.user_id === userId)
          const likeCount = (ci.likes ?? []).length

          return (
            <Card key={ci.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={actor?.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(actor?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${actor?.username}`} className="text-sm font-medium hover:text-primary">
                        {actor?.full_name ?? actor?.username}
                      </Link>
                      <span className="text-xs text-muted-foreground">{timeAgo(ci.checked_in_at)}</span>
                    </div>
                    {ci.value != null && (
                      <p className="text-sm font-semibold text-primary">{ci.value} {goal.target_unit ?? ''}</p>
                    )}
                    {ci.note && <p className="text-sm text-muted-foreground">{ci.note}</p>}
                  </div>
                </div>

                {/* Likes & comments */}
                <div className="flex items-center gap-4 pt-1">
                  <button
                    onClick={() => toggleLike({ checkInId: ci.id, liked })}
                    className={cn("flex items-center gap-1.5 text-xs transition-colors", liked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400")}
                  >
                    <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likeCount}
                  </button>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MessageCircle size={14} /> {(ci.comments ?? []).length}
                  </span>
                </div>

                {/* Comments */}
                {(ci.comments ?? []).length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-border">
                    {(ci.comments ?? []).map((c: any) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarImage src={c.profiles?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">{getInitials(c.profiles?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-xs font-medium">{c.profiles?.full_name ?? c.profiles?.username}</span>
                          <span className="text-xs text-muted-foreground ml-2">{c.body}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add comment */}
                <div className="flex gap-2">
                  <Textarea
                    value={commentText[ci.id] ?? ''}
                    onChange={e => setCommentText(prev => ({ ...prev, [ci.id]: e.target.value }))}
                    placeholder="Add a comment…"
                    rows={1}
                    className="resize-none text-xs min-h-0 py-1.5"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="shrink-0"
                    onClick={() => postComment(ci.id)}
                    disabled={!commentText[ci.id]?.trim()}
                  >
                    Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CheckInModal goal={goal} open={checkInOpen} onClose={() => setCheckInOpen(false)} userId={userId} />
    </div>
  )
}
