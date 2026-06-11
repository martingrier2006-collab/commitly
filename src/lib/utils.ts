import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function progressPercent(checkIns: number, target: number | null): number {
  if (!target || target === 0) return 0
  return Math.min(100, Math.round((checkIns / target) * 100))
}

export const CATEGORY_COLORS: Record<string, string> = {
  Fitness: 'text-emerald-400',
  Career: 'text-blue-400',
  Investing: 'text-yellow-400',
  Academics: 'text-purple-400',
  Personal: 'text-pink-400',
  Other: 'text-gray-400',
}

export const CATEGORY_BG: Record<string, string> = {
  Fitness: 'bg-emerald-400/10 text-emerald-400',
  Career: 'bg-blue-400/10 text-blue-400',
  Investing: 'bg-yellow-400/10 text-yellow-400',
  Academics: 'bg-purple-400/10 text-purple-400',
  Personal: 'bg-pink-400/10 text-pink-400',
  Other: 'bg-gray-400/10 text-gray-400',
}
