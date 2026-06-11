import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl tracking-tight text-gradient">Commitly</span>
        <div className="flex gap-3">
          <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
          <Button asChild><Link href="/signup">Get started</Link></Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 gap-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full border border-primary/20">
          <Zap size={14} /> Public accountability that actually works
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight max-w-3xl leading-tight">
          Commit publicly.<br />
          <span className="text-gradient">No excuses.</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl">
          The accountability platform for ambitious students and young professionals.
          Set goals, check in daily, compete with peers, and build unstoppable habits.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Button size="lg" asChild className="gap-2">
            <Link href="/signup">Start for free <ArrowRight size={16} /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/leaderboards">See leaderboards</Link>
          </Button>
        </div>
      </main>

      {/* Features */}
      <section className="border-t border-border px-6 py-20">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "10-second check-ins", desc: "Quick modal. One tap. Done. No friction between you and your streak." },
            { icon: Users, title: "Group accountability", desc: "Create squads with friends. Weekly leaderboards. No room to slack." },
            { icon: TrendingUp, title: "Public leaderboards", desc: "Global, friend, and group rankings across every category." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 p-6 rounded-lg border border-border bg-card">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-sm text-muted-foreground">
        © 2025 Commitly. Built for the grind.
      </footer>
    </div>
  )
}
