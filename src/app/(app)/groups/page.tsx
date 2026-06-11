import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Users, Lock } from 'lucide-react'
import { JoinGroupForm } from './join-group-form'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase.from('group_members').select('group_id').eq('user_id', user.id)
  const myGroupIds = (memberships ?? []).map((m: any) => m.group_id)

  const [{ data: myGroups }, { data: publicGroups }] = await Promise.all([
    myGroupIds.length
      ? supabase.from('groups').select('*, profiles(*), group_members(count)').in('id', myGroupIds)
      : Promise.resolve({ data: [] }),
    supabase.from('groups').select('*, profiles(*), group_members(count)').eq('is_private', false)
      .not('id', 'in', myGroupIds.length ? `(${myGroupIds.join(',')})` : '()')
      .limit(10),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button asChild size="sm" className="gap-2">
          <Link href="/groups/new"><Plus size={15} /> New group</Link>
        </Button>
      </div>

      <JoinGroupForm />

      {/* My groups */}
      <section className="space-y-3">
        <h2 className="font-semibold">My groups</h2>
        {(!myGroups || myGroups.length === 0) ? (
          <p className="text-muted-foreground text-sm">You haven't joined any groups yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {myGroups.map((g: any) => (
              <Link key={g.id} href={`/groups/${g.id}`}>
                <Card className="hover:border-primary/40 transition-colors h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">{g.name}</h3>
                      {g.is_private && <Lock size={13} className="text-muted-foreground shrink-0 mt-0.5" />}
                    </div>
                    {g.description && <p className="text-xs text-muted-foreground line-clamp-2">{g.description}</p>}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users size={11} /> {(g.group_members?.[0]?.count ?? 0)} members
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Discover */}
      {publicGroups && publicGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-semibold">Discover groups</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {publicGroups.map((g: any) => (
              <Link key={g.id} href={`/groups/${g.id}`}>
                <Card className="hover:border-primary/40 transition-colors h-full">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{g.name}</h3>
                    {g.description && <p className="text-xs text-muted-foreground line-clamp-2">{g.description}</p>}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users size={11} /> {(g.group_members?.[0]?.count ?? 0)} members
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
