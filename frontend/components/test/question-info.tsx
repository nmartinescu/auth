"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuestionInfoProps, SchedulingQuestion, MemoryQuestion, DiskQuestion, IOOperation } from "@/types/test"

const formatIOOperations = (io: IOOperation[]) => {
  if (!io || io.length === 0) return "None"
  return io.map((op) => `I/O at ${op.start} for ${op.duration}ms`).join(", ")
}

export function QuestionInfo({ question }: QuestionInfoProps) {
  if (question.type === "scheduling") {
    const q = question as SchedulingQuestion
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-wrap gap-2">
            <span>
              Algorithm: {q.algorithm}
              {q.quantum ? ` (Quantum = ${q.quantum})` : ""}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{q.description}</p>

          <div>
            <h4 className="font-semibold mb-3">Process Information:</h4>
            <div className="border rounded-md overflow-hidden">
              <div className="grid grid-cols-4 bg-muted font-semibold text-sm">
                <div className="p-3 border-r">Process ID</div>
                <div className="p-3 border-r">Arrival Time</div>
                <div className="p-3 border-r">Burst Time</div>
                <div className="p-3">I/O Operations</div>
              </div>
              {q.processes.map((process, index) => (
                <div key={process.id} className={`grid grid-cols-4 text-sm ${index > 0 ? "border-t" : ""}`}>
                  <div className="p-3 border-r font-medium">P{process.id}</div>
                  <div className="p-3 border-r">{process.arrivalTime}</div>
                  <div className="p-3 border-r">{process.burstTime}</div>
                  <div className="p-3">{formatIOOperations(process.io)}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (question.type === "memory") {
    const q = question as MemoryQuestion
    return (
      <Card>
        <CardHeader>
          <CardTitle>Memory Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{q.description}</p>

          <div className="border rounded-md p-4 space-y-3">
            <p>
              <strong>Frame Count:</strong> {q.frameCount}
            </p>
            <p>
              <strong>Page Reference Sequence:</strong> {q.pageReferences.join(", ")}
            </p>
            <p>
              <strong>Algorithm:</strong> {q.algorithm}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (question.type === "disk") {
    const q = question as DiskQuestion
    return (
      <Card>
        <CardHeader>
          <CardTitle>Disk Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{q.description}</p>

          <div className="border rounded-md p-4 space-y-3">
            <p>
              <strong>Maximum Disk Size:</strong> {q.maxDiskSize} tracks (0 to {q.maxDiskSize - 1})
            </p>
            <p>
              <strong>Initial Head Position:</strong> {q.initialHeadPosition}
            </p>
            <p>
              <strong>Head Direction:</strong> {q.headDirection || "N/A"}
            </p>
            <p>
              <strong>Disk Requests:</strong> {q.requests.join(", ")}
            </p>
            <p>
              <strong>Algorithm:</strong> {q.algorithm}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
