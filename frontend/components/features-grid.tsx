import Link from "next/link"
import { Cpu, MemoryStick, HardDrive, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Cpu,
    title: "CPU Scheduling",
    description:
      "Simulate and visualize various CPU scheduling algorithms including FCFS, SJF, Priority, and Round Robin with Gantt charts.",
    path: "/process",
    badge: "Most Popular",
  },
  {
    icon: MemoryStick,
    title: "Memory Management",
    description:
      "Explore memory allocation strategies like First Fit, Best Fit, and page replacement algorithms such as LRU and FIFO.",
    path: "/memory",
    badge: null,
  },
  {
    icon: HardDrive,
    title: "Disk Scheduling",
    description:
      "Learn disk scheduling algorithms like FCFS, SSTF, SCAN, C-SCAN, and LOOK with interactive head movement visualizations.",
    path: "/disk",
    badge: null,
  },
]

export function FeaturesGrid() {
  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
        <div className="mb-16 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent">Core Modules</h2>
          <p className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            Explore Operating System Concepts
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const IconComponent = feature.icon
            return (
              <Link
                key={feature.title}
                href={feature.path}
                className="group relative flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:border-muted-foreground/30 hover:shadow-md"
              >
                {feature.badge && (
                  <span className="absolute -top-3 right-6 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    {feature.badge}
                  </span>
                )}

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                  <IconComponent className="h-7 w-7 text-foreground" />
                </div>

                <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mb-8 flex-1 leading-relaxed text-muted-foreground">{feature.description}</p>

                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  Start Learning
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
