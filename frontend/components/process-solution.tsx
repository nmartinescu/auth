"use client"

import { useState, useEffect } from "react"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import GanttChart from "./gantt-chart"

interface ProcessSolutionProps {
  solution: any
  onBack: () => void
}

export default function ProcessSolution({ solution, onBack }: ProcessSolutionProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [graphicTable, setGraphicTable] = useState<any[]>([])

  useEffect(() => {
    if (solution?.data?.solution?.[stepIndex]?.graphicTable) {
      setGraphicTable(solution.data.solution[stepIndex].graphicTable)
    }
  }, [stepIndex, solution])

  if (!solution || !solution.data) {
    return <div className="text-center text-muted-foreground">No solution data available</div>
  }

  const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
    setStepIndex((prev) => {
      if (action === "next") return Math.min(prev + 1, solution.data.solution.length - 1)
      if (action === "prev") return Math.max(prev - 1, 0)
      if (action === "start") return 0
      if (action === "end") return Math.max(0, solution.data.solution.length - 1)
      return prev
    })
  }

  const solutionLength = solution.data.solution.length
  const currentStep = solution.data.solution[stepIndex]
  const explaination = currentStep?.explaination
  const timerInfo = currentStep?.timer
  const readyQueue = currentStep?.readyQueues
  const waitQueue = currentStep?.waitQueue
  const newQueue = currentStep?.newProcesses

  return (
    <main className="min-h-screen bg-background pb-16 pt-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Process Scheduling Results</h1>
          <p className="text-muted-foreground">
            Algorithm: <span className="font-medium text-foreground">{solution.data.algorithm}</span> | Total Processes:{" "}
            <span className="font-medium text-foreground">{solution.data.processes}</span> | Avg Waiting Time:{" "}
            <span className="font-medium text-foreground">{solution.data.metrics.averageWaitingTime}</span> | Avg
            Turnaround Time:{" "}
            <span className="font-medium text-foreground">{solution.data.metrics.averageTurnaroundTime}</span>
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Gantt Chart */}
            <GanttChart solution={solution} stepIndex={stepIndex} />

            {/* Process Table */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-lg">Process Scheduling Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-[400px] overflow-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                        <TableHead className="text-center font-semibold">PID</TableHead>
                        <TableHead className="text-center font-semibold">Arrival</TableHead>
                        <TableHead className="text-center font-semibold">Scheduled</TableHead>
                        <TableHead className="text-center font-semibold">End Time</TableHead>
                        <TableHead className="text-center font-semibold">Waiting</TableHead>
                        <TableHead className="text-center font-semibold">Turnaround</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {graphicTable?.map((proc: any) => (
                        <TableRow key={proc.pid} className="transition-colors hover:bg-secondary/30">
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              P{proc.pid}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">{proc.arrival ?? "—"}</TableCell>
                          <TableCell className="text-center">{proc.scheduledTime ?? "—"}</TableCell>
                          <TableCell className="text-center">{proc.endTime ?? "—"}</TableCell>
                          <TableCell className="text-center">{proc.waitingTime ?? "—"}</TableCell>
                          <TableCell className="text-center">{proc.turnaroundTime ?? "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleStepChange("start")}
                className="bg-transparent"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleStepChange("prev")} className="bg-transparent">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-4 text-sm text-muted-foreground">
                Step {stepIndex + 1} / {solutionLength}
              </span>
              <Button variant="outline" size="icon" onClick={() => handleStepChange("next")} className="bg-transparent">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleStepChange("end")} className="bg-transparent">
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={onBack} className="gap-2 bg-transparent">
                <ArrowLeft className="h-4 w-4" />
                Back to Configuration
              </Button>
            </div>
          </div>

          {/* Step Information Panel */}
          <div className="space-y-4">
            {/* Step Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Step {stepIndex + 1} / {solutionLength}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {explaination || "No explanation available."}
                </p>
              </CardContent>
            </Card>

            {/* Current Step Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Current Step Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timer</span>
                  <Badge variant="secondary">{timerInfo ?? "—"}</Badge>
                </div>

                <div>
                  <span className="text-sm text-muted-foreground">Ready Queues</span>
                  {Array.isArray(readyQueue) && readyQueue.length > 0 ? (
                    <div className="mt-1 space-y-1">
                      {readyQueue.map((queue: number[], idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Q{idx + 1}:</span>
                          <span className="text-foreground">
                            {Array.isArray(queue) && queue.length > 0 ? queue.join(", ") : "(empty)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground">—</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wait Queue</span>
                  <span className="text-sm text-foreground">
                    {Array.isArray(waitQueue) && waitQueue.length > 0 ? waitQueue.join(", ") : "(empty)"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Queue</span>
                  <span className="text-sm text-foreground">
                    {Array.isArray(newQueue) && newQueue.length > 0 ? newQueue.join(", ") : "(empty)"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Algorithm</span>
                  <Badge>{solution.data.algorithm}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Processes</span>
                  <span className="text-sm font-medium text-foreground">{solution.data.processes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Waiting Time</span>
                  <span className="text-sm font-medium text-foreground">
                    {solution.data.metrics.averageWaitingTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Turnaround</span>
                  <span className="text-sm font-medium text-foreground">
                    {solution.data.metrics.averageTurnaroundTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CPU Utilization</span>
                  <span className="text-sm font-medium text-foreground">{solution.data.metrics.cpuUtilization}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Throughput</span>
                  <span className="text-sm font-medium text-foreground">{solution.data.metrics.throughput}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
