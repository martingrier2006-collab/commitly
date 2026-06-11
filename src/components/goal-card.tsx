'use client'

import Link from 'next/link'
import { Goal, CheckIn } from '@/types'
import { calculateStreak, getStreakCalendar } from '@/lib/streaks'
import { CATEGORY_BG, progressPercent, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Flame, Calendar, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  goal: Goal & { check_ins?: CheckIn[] }
  onCheckIn?: (goal: Goal) => void
  showCheckIn?: boolean
}

export function GoalCard({ goal, onCheckIn, showCheckIn = true }: Props) {
  const checkIns = goal.check_ins ?? []
  const streak = calculateStreak(checkIns)
  const totalCheckIns = checkIns.length
  const progress = progressPercent(totalCheckIns, goal.target_value)

  const checkedInToday = checkIns.some(c => {
    const d = new Date(c.checked_in_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })

  return (
    <Card className={cn(
      "transition-all hover:border-primary/30",
      streak.atRisk && "border-orange-500/50"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {goal.category && (
                <Badge variant="secondary" className={cn("text-xs", CATEGORY_BG[goal.category])}>
                  {goal.category}
                </Badge>
              )}
              {streak.atRisk && (
                <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-400 border-0">
                  ⚠ Streak at risk
                </Badge>
              )}
            </div>
            <Link href={`/goals/${goal.id}`} className="font-semibold hover:text-primary transition-colors line-clamp-1">
              {goal.title}
            </Link>
            {goal.deadline && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar size={11} /> Due {formatDate(goal.deadline)}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              streak.current > 0 ? "text-orange-400" : "text-muted-foreground"
            )}>
              <Flame size={14} />
              {streak.current}
            </div>
            <p className="text-xs text-muted-foreground">{totalCheckIns} check-ins</p>
          </div>
        </div>

        {goal.target_value && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{totalCheckIns} / {goal.target_value} {goal.target_unit ?? ''}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {showCheckIn && onCheckIn && (
          <Button
            size="sm"
            variant={checkedInToday ? "secondary" : "default"}
            className="w-full h-8 text-xs"
            onClick={() => onCheckIn(goal)}
            disabled={checkedInToday}
          >
            {checkedInToday ? '✓ Checked in today' : '+ Check in'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
