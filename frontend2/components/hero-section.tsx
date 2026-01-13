import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, BookOpen, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_75%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-28 lg:py-40">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm">
            <Sparkles className="h-4 w-4 text-accent" />
            Interactive Learning Platform
          </div>

          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Operating System
            <span className="mt-3 block bg-gradient-to-r from-muted-foreground to-foreground bg-clip-text text-transparent">
              Simulator
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Master core operating system concepts through hands-on simulations and real-time visualizations. Learn CPU
            scheduling, memory management, and disk algorithms interactively.
          </p>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8 text-base shadow-lg">
              <Link href="/process">
                <Play className="h-4 w-4" />
                Start Simulating
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2 px-8 text-base bg-transparent">
              <Link href="/test">
                <BookOpen className="h-4 w-4" />
                Take a Test
              </Link>
            </Button>
          </div>

          <p className="mt-12 text-sm text-muted-foreground">Free to use · No signup required · Educational purpose</p>
        </div>
      </div>
    </section>
  )
}
