'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Notification } from '@/types'
import { timeAgo, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Bell, Heart, MessageCircle, UserPlus, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_ICONS: Record<string, React.ReactNode> = {
  like: <Heart size={14} className="text-pink-400" />,
  comment: <MessageCircle size={14} className="text-blue-400" />,
  follow: <UserPlus size={14} className="text-emerald-400" />,
  streak_risk: <Flame size={14} className="text-orange-400" />,
  goal_complete: <Flame size={14} className="text-yellow-400" />,
  recap: <Bell size={14} className="text-purple-400" />,
}

const TYPE_TEXT: Record<string, string> = {
  like: 'liked your check-in',
  comment: 'commented on your check-in',
  follow: 'started following you',
  streak_risk: 'Your streak is at risk!',
  goal_complete: 'You completed a goal!',
  recap: 'Weekly recap ready',
}

export function NotificationsClient({ notifications, userId }: { notifications: any[]; userId: string }) {
  const qc = useQueryClient()

  const { mutate: markAllRead } = useMutation({
    mutationFn: async () => {
      const supabase = createClient()
      await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell size={22} /> Notifications
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => markAllRead()}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="text-muted-foreground text-sm py-12 text-center">No notifications yet.</p>
      )}

      <div className="space-y-2">
        {notifications.map(n => {
          const actor = n.actor
          const href = n.goal_id ? `/goals/${n.goal_id}` : n.actor ? `/profile/${n.actor.username}` : '#'

          return (
            <Link key={n.id} href={href}>
              <Card className={cn("hover:border-primary/40 transition-colors", !n.is_read && "border-primary/20 bg-primary/5")}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={actor?.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{getInitials(actor?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 bg-card rounded-full p-0.5">
                      {TYPE_ICONS[n.type] ?? <Bell size={12} />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      {actor && (
                        <span className="font-medium">{actor.full_name ?? actor.username} </span>
                      )}
                      <span className="text-muted-foreground">{TYPE_TEXT[n.type] ?? n.type}</span>
                    </p>
                    {n.goals && (
                      <p className="text-xs text-muted-foreground truncate">on "{n.goals.title}"</p>
                    )}
                    <p className="text-xs text-muted-foreground/60">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
