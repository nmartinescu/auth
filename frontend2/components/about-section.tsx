import { Lightbulb, Code, GraduationCap, Zap } from "lucide-react"

const benefits = [
  {
    icon: Code,
    title: "Visual Learning",
    description: "See algorithms in action with real-time animations and step-by-step breakdowns.",
  },
  {
    icon: GraduationCap,
    title: "Self-Paced",
    description: "Learn at your own speed with no time limits or pressure.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get immediate results and understand algorithm behavior instantly.",
  },
]

export function AboutSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <Lightbulb className="h-8 w-8 text-accent" />
          </div>

          <h2 className="mb-6 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Learn by Doing</h2>

          <p className="text-lg leading-relaxed text-muted-foreground lg:text-xl">
            This simulator provides an interactive environment to understand fundamental operating system concepts.
            Experiment with different algorithms, visualize their behavior, and test your knowledge with built-in
            assessments.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {benefits.map((benefit) => {
            const IconComponent = benefit.icon
            return (
              <div key={benefit.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <IconComponent className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
