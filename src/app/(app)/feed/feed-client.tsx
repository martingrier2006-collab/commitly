'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { timeAgo, getInitials, CATEGORY_BG } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Heart, MessageCircle, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'friends' | 'groups'

export function FeedClient({ initialFeed, userId }: { initialFeed: any[]; userId: string }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [showComments, setShowComments] = useState<Record<string, boolean>>({})
  const qc = useQueryClient()

  const { data: feed = initialFeed } = useQuery({
    queryKey: ['feed', filter],
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('check_ins')
        .select('*, profiles!check_ins_user_id_fkey(*), goals(*), likes(user_id), comments(id, body, created_at, profiles!comments_user_id_fkey(*))')
        .order('checked_in_at', { ascending: false })
        .limit(50)

      if (filter === 'friends') {
        const { data: follows } = await supabase.from('follows').select('following_id').eq('follower_id', userId)
        const ids = (follows ?? []).map((f: any) => f.following_id)
        query = query.in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
      }

      const { data } = await query
      return data ?? []
    },
    initialData: filter === 'all' ? initialFeed : undefined,
  })

  const { mutate: toggleLike } = useMutation({
    mutationFn: async ({ checkInId, liked }: { checkInId: string; liked: boolean }) => {
      const supabase = createClient()
      if (liked) {
        await supabase.from('likes').delete().eq('user_id', userId).eq('check_in_id', checkInId)
      } else {
        await supabase.from('likes').insert({ user_id: userId, check_in_id: checkInId })
        // Notify check-in owner
        const item = feed.find((f: any) => f.id === checkInId)
        if (item && item.user_id !== userId) {
          await supabase.from('notifications').insert({
            user_id: item.user_id, type: 'like', actor_id: userId,
            goal_id: item.goal_id, check_in_id: checkInId,
          })
        }
      }
    },
    onMutate: async ({ checkInId, liked }) => {
      await qc.cancelQueries({ queryKey: ['feed', filter] })
      const prev = qc.getQueryData(['feed', filter])
      qc.setQueryData(['feed', filter], (old: any[]) =>
        (old ?? []).map(item => item.id !== checkInId ? item : {
          ...item,
          likes: liked
            ? (item.likes ?? []).filter((l: any) => l.user_id !== userId)
            : [...(item.likes ?? []), { user_id: userId }],
        })
      )
      return { prev }
    },
    onError: (_, __, ctx) => qc.setQueryData(['feed', filter], (ctx as any)?.prev),
  })

  const { mutate: postComment } = useMutation({
    mutationFn: async ({ checkInId, goalId, ownerId }: { checkInId: string; goalId: string; ownerId: string }) => {
      const supabase = createClient()
      await supabase.from('comments').insert({
        user_id: userId, goal_id: goalId, check_in_id: checkInId,
        body: commentText[checkInId],
      })
      if (ownerId !== userId) {
        await supabase.from('notifications').insert({
          user_id: ownerId, type: 'comment', actor_id: userId,
          goal_id: goalId, check_in_id: checkInId,
        })
      }
    },
    onSuccess: (_, { checkInId }) => {
      setCommentText(prev => ({ ...prev, [checkInId]: '' }))
      qc.invalidateQueries({ queryKey: ['feed', filter] })
    },
  })

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
      </div>

      <Tabs value={filter} onValueChange={v => setFilter(v as Filter)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
          <TabsTrigger value="friends" className="flex-1">Friends</TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">Groups</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        {feed.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nothing here yet. Follow some people or join groups.</p>
        )}
        {feed.map((item: any) => {
          const actor = item.profiles
          const goal = item.goals
          const liked = (item.likes ?? []).some((l: any) => l.user_id === userId)
          const likeCount = (item.likes ?? []).length
          const commentCount = (item.comments ?? []).length
          const commentsOpen = showComments[item.id]

          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Link href={`/profile/${actor?.username}`}>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={actor?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(actor?.full_name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/profile/${actor?.username}`} className="text-sm font-semibold hover:text-primary">
                        {actor?.full_name ?? actor?.username}
                      </Link>
                      <span className="text-xs text-muted-foreground">checked in</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(item.checked_in_at)}</span>
                    </div>
                    {goal && (
                      <Link href={`/goals/${goal.id}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5">
                        <Flame size={11} /> {goal.title}
                        {goal.category && (
                          <Badge variant="secondary" className={cn("text-xs ml-1 py-0 px-1.5", CATEGORY_BG[goal.category])}>
                            {goal.category}
                          </Badge>
                        )}
                      </Link>
                    )}
                  </div>
                </div>

                {item.value != null && (
                  <p className="text-sm font-semibold text-primary pl-12">
                    {item.value} {goal?.target_unit ?? ''}
                  </p>
                )}
                {item.note && <p className="text-sm text-muted-foreground pl-12">{item.note}</p>}

                {/* Actions */}
                <div className="flex items-center gap-4 pl-12">
                  <button
                    onClick={() => toggleLike({ checkInId: item.id, liked })}
                    className={cn("flex items-center gap-1.5 text-xs transition-colors", liked ? "text-pink-400" : "text-muted-foreground hover:text-pink-400")}
                  >
                    <Heart size={14} fill={liked ? "currentColor" : "none"} /> {likeCount}
                  </button>
                  <button
                    onClick={() => setShowComments(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageCircle size={14} /> {commentCount}
                  </button>
                </div>

                {/* Comments */}
                {commentsOpen && (
                  <div className="pl-12 space-y-3">
                    {(item.comments ?? []).map((c: any) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <Avatar className="h-5 w-5 shrink-0">
                          <AvatarImage src={c.profiles?.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">{getInitials(c.profiles?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="text-xs">
                          <span className="font-medium">{c.profiles?.full_name ?? c.profiles?.username}</span>
                          <span className="text-muted-foreground ml-2">{c.body}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Textarea
                        value={commentText[item.id] ?? ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Add a comment…"
                        rows={1}
                        className="resize-none text-xs min-h-0 py-1.5"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="shrink-0"
                        onClick={() => postComment({ checkInId: item.id, goalId: item.goal_id, ownerId: item.user_id })}
                        disabled={!commentText[item.id]?.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
