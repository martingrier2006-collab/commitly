'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function OnboardPage() {
  const router = useRouter()
  const [schoolOrCompany, setSchoolOrCompany] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('profiles').update({ school_or_company: schoolOrCompany, bio }).eq('id', user.id)
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="text-2xl font-bold text-gradient">Commitly</span>
          <p className="text-muted-foreground mt-1">Let's set up your profile</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>One more thing</CardTitle>
            <CardDescription>Tell your accountability circle who you are.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school">School or company</Label>
                <Input
                  id="school"
                  value={schoolOrCompany}
                  onChange={e => setSchoolOrCompany(e.target.value)}
                  placeholder="Vanderbilt University / Goldman Sachs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Grinding toward IB. No days off."
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Saving…' : 'Finish setup'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
                Skip for now
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
