"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"

interface ProcessBlock {
  pid: number
  startTime: number
  endTime: number
  state: "RUNNING" | "READY" | "WAIT" | "NEW" | "DONE"
}

interface GanttChartProps {
  solution: any
  stepIndex: number
}

const stateColors: Record<string, { bg: string; label: string }> = {
  RUNNING: { bg: "bg-green-500", label: "Running" },
  READY: { bg: "bg-orange-500", label: "Ready Queue" },
  WAIT: { bg: "bg-red-500", label: "Wait Queue" },
  NEW: { bg: "bg-gray-500", label: "New" },
  DONE: { bg: "bg-blue-500", label: "Done" },
}

export default function GanttChart({ solution, stepIndex }: GanttChartProps) {
  const { processIds, maxTime, currentTime } = useMemo(() => {
    if (!solution?.data?.solution) {
      return { processIds: [], maxTime: 0, currentTime: 0 }
    }

    const allProcesses = new Set<number>()
    solution.data.solution.forEach((step: any) => {
      Object.keys(step.processStates || {}).forEach((pid) => {
        allProcesses.add(Number.parseInt(pid))
      })
    })

    return {
      processIds: Array.from(allProcesses).sort((a, b) => a - b),
      maxTime: Math.max(...solution.data.solution.map((step: any) => step.timer || 0)),
      currentTime: solution.data.solution[stepIndex]?.timer || 0,
    }
  }, [solution, stepIndex])

  const buildProcessTimeline = (pid: number): ProcessBlock[] => {
    const timeline: ProcessBlock[] = []
    let currentState = "NEW"
    let stateStartTime = 0

    for (let i = 0; i <= stepIndex; i++) {
      const step = solution.data.solution[i]
      const processState = step.processStates?.[pid]?.state
      const stepTime = step.timer || 0

      if (processState && processState !== currentState) {
        if (i > 0 && stateStartTime < stepTime) {
          timeline.push({
            pid,
            startTime: stateStartTime,
            endTime: stepTime,
            state: currentState as any,
          })
        }
        currentState = processState
        stateStartTime = stepTime
      }
    }

    if (stepIndex >= 0 && stateStartTime <= currentTime) {
      timeline.push({
        pid,
        startTime: stateStartTime,
        endTime: currentTime,
        state: currentState as any,
      })
    }

    return timeline.filter((block) => block.startTime < block.endTime)
  }

  if (!solution?.data?.solution) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-center text-muted-foreground">
        No solution data available
      </div>
    )
  }

  const timeScale = maxTime > 0 ? 100 / maxTime : 1

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 text-center text-lg font-semibold text-foreground">
        Process Gantt Chart - Timeline Visualization
      </h3>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap justify-center gap-4">
        {Object.entries(stateColors).map(([state, { bg, label }]) => (
          <div key={state} className="flex items-center gap-2">
            <div className={cn("h-4 w-4 rounded-sm", bg)} />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Time axis */}
          <div className="relative mb-2 ml-14 h-6">
            <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
            {Array.from({ length: maxTime + 1 }, (_, i) => (
              <div key={i} className="absolute flex flex-col items-center" style={{ left: `${i * timeScale}%` }}>
                <span className="text-xs text-muted-foreground">{i}</span>
                <div className="mt-1 h-1.5 w-px bg-border" />
              </div>
            ))}
          </div>

          {/* Process rows */}
          {processIds.map((pid) => {
            const timeline = buildProcessTimeline(pid)

            return (
              <div key={pid} className="mb-2 flex items-center">
                {/* Process label */}
                <div className="w-14 shrink-0 pr-2 text-right text-sm font-medium text-foreground">P{pid}</div>

                {/* Timeline bar */}
                <div className="relative h-10 flex-1 overflow-hidden rounded border border-border bg-secondary/50">
                  {/* Grid lines */}
                  {Array.from({ length: maxTime + 1 }, (_, i) => (
                    <div
                      key={`grid-${i}`}
                      className="absolute h-full w-px bg-border/50"
                      style={{ left: `${i * timeScale}%` }}
                    />
                  ))}

                  {/* Process state blocks */}
                  {timeline.map((block, index) => {
                    const width = Math.max(0.5, (block.endTime - block.startTime) * timeScale)
                    const left = block.startTime * timeScale

                    return (
                      <div
                        key={index}
                        className={cn(
                          "absolute flex h-full items-center justify-center border border-white/30 text-xs font-bold text-white",
                          stateColors[block.state]?.bg || "bg-gray-500",
                        )}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${block.state}: ${block.startTime}-${block.endTime}`}
                      >
                        {width > 3 && block.state.charAt(0)}
                      </div>
                    )
                  })}

                  {/* Current time indicator */}
                  <div
                    className="absolute z-10 h-full w-0.5 rounded bg-red-500"
                    style={{ left: `${currentTime * timeScale}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Current step info */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Current Time: {currentTime} | Step: {stepIndex + 1} / {solution.data.solution.length}
      </div>
    </div>
  )
}
