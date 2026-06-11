import { CheckIn, StreakInfo } from '@/types'
import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

export function calculateStreak(checkIns: Pick<CheckIn, 'checked_in_at'>[]): StreakInfo {
  if (!checkIns.length) {
    return { current: 0, longest: 0, atRisk: false }
  }

  const sorted = [...checkIns]
    .map(c => startOfDay(parseISO(c.checked_in_at)))
    .sort((a, b) => b.getTime() - a.getTime())

  // Deduplicate by calendar day
  const uniqueDays: Date[] = []
  for (const d of sorted) {
    if (!uniqueDays.length || differenceInCalendarDays(uniqueDays[uniqueDays.length - 1], d) !== 0) {
      uniqueDays.push(d)
    }
  }

  const today = startOfDay(new Date())
  let current = 0
  let longest = 0
  let streak = 0

  for (let i = 0; i < uniqueDays.length; i++) {
    const expected = i === 0 ? today : uniqueDays[i - 1]
    const diff = differenceInCalendarDays(expected, uniqueDays[i])

    if (i === 0 && diff > 1) {
      // most recent check-in was more than 1 day ago — streak is 0
      break
    }

    if (diff <= 1) {
      streak++
      if (streak > longest) longest = streak
    } else {
      if (streak > longest) longest = streak
      streak = 1
    }
  }

  current = streak

  // Streak at risk: no check-in today AND it's past 6pm local time
  const checkedInToday = uniqueDays.length > 0 && differenceInCalendarDays(today, uniqueDays[0]) === 0
  const hour = new Date().getHours()
  const atRisk = !checkedInToday && hour >= 18 && current > 0

  return { current, longest, atRisk }
}

export function getStreakCalendar(checkIns: Pick<CheckIn, 'checked_in_at'>[], days = 30): Map<string, boolean> {
  const map = new Map<string, boolean>()
  const today = startOfDay(new Date())

  for (let i = 0; i < days; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    map.set(d.toISOString().split('T')[0], false)
  }

  for (const c of checkIns) {
    const key = c.checked_in_at.split('T')[0]
    if (map.has(key)) map.set(key, true)
  }

  return map
}
