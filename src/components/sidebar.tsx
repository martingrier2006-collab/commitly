'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard, Flame, Users, BarChart3, Bell, Settings,
  LogOut, Plus, Rss, Shield, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/feed', icon: Rss, label: 'Feed' },
  { href: '/leaderboards', icon: BarChart3, label: 'Leaderboards' },
  { href: '/groups', icon: Users, label: 'Groups' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
]

export function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const content = (
    <div className="flex flex-col h-full py-6 px-4 gap-2">
      {/* Logo */}
      <Link href="/dashboard" className="px-3 mb-4 flex items-center gap-2" onClick={() => setOpen(false)}>
        <span className="text-xl font-bold text-gradient">Commitly</span>
      </Link>

      {/* New Goal */}
      <Button asChild size="sm" className="mx-1 mb-2 gap-2">
        <Link href="/goals/new" onClick={() => setOpen(false)}>
          <Plus size={15} /> New goal
        </Link>
      </Button>

      {/* Nav links */}
      <nav className="flex-1 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
        {profile?.is_admin && (
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
              pathname.startsWith('/admin')
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Shield size={17} /> Admin
          </Link>
        )}
      </nav>

      {/* Profile */}
      {profile && (
        <div className="border-t border-border pt-4 space-y-1">
          <Link
            href={`/profile/${profile.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-secondary transition-colors"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile.full_name ?? profile.username}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border"
        onClick={() => setOpen(v => !v)}
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="sm:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 border-r border-border bg-card z-40 transition-transform duration-200",
          "hidden sm:block",
          open && "!block"
        )}
      >
        {content}
      </aside>
    </>
  )
}
