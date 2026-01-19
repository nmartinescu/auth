"use client"

import { Input } from "@/components/ui/input"
import type { SchedulingAnswerProps } from "@/types/test"

export function SchedulingAnswer({
  processResults,
  onProcessResultsChange,
  avgWaitingTime,
  avgTurnaroundTime,
  completionTime,
  onAvgWaitingTimeChange,
  onAvgTurnaroundTimeChange,
  onCompletionTimeChange,
  reviewMode = false,
  correctSolution,
  userScore,
}: SchedulingAnswerProps) {
  const safeAvgWaitingTime = avgWaitingTime ?? 0
  const safeAvgTurnaroundTime = avgTurnaroundTime ?? 0
  const safeCompletionTime = completionTime ?? 0
  const safeProcessResults = processResults ?? []
  const correctProcesses = correctSolution?.processes ?? []

  const handleProcessFieldChange = (pid: number, field: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    onProcessResultsChange(safeProcessResults.map((p) => (p.pid === pid ? { ...p, [field]: numValue } : p)))
  }

  const renderCell = (
    value: number,
    correctValue: number | undefined,
    onChange?: (value: string) => void,
    disabled = false,
  ) => {
    if (reviewMode) {
      const userValue = value ?? 0
      const correct = correctValue ?? 0
      const isCorrect = Math.abs(userValue - correct) <= 0.5
      return (
        <div className="space-y-1">
          <p className={`font-semibold ${isCorrect ? "text-green-600" : "text-red-600"}`}>Your: {userValue}</p>
          <p className="text-sm text-muted-foreground">Correct: {correct}</p>
        </div>
      )
    }
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={(e) => {
          if (e.target.value === "" || isNaN(Number.parseFloat(e.target.value))) {
            onChange?.("0")
          }
        }}
        className="w-20"
        min={0}
        step={0.1}
        disabled={disabled}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Process Results Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="grid grid-cols-7 bg-muted font-semibold text-sm">
          <div className="p-3 border-r">Process ID</div>
          <div className="p-3 border-r">Arrival Time</div>
          <div className="p-3 border-r">Burst Time</div>
          <div className="p-3 border-r">Scheduled Time</div>
          <div className="p-3 border-r">Waiting Time</div>
          <div className="p-3 border-r">Turnaround Time</div>
          <div className="p-3">Completion Time</div>
        </div>
        {safeProcessResults.map((process, index) => {
          const correctProcess = reviewMode
            ? correctProcesses.find((p) => p.pid === process.pid) || correctProcesses[index]
            : null
          return (
            <div key={process.pid} className={`grid grid-cols-7 text-sm ${index > 0 ? "border-t" : ""}`}>
              <div className="p-3 border-r font-medium flex items-center">P{process.pid}</div>
              <div className="p-3 border-r flex items-center">{process.arrivalTime}</div>
              <div className="p-3 border-r flex items-center">{process.burstTime}</div>
              <div className="p-3 border-r">
                {renderCell(process.scheduledTime ?? 0, correctProcess?.scheduledTime, (v) =>
                  handleProcessFieldChange(process.pid, "scheduledTime", v),
                )}
              </div>
              <div className="p-3 border-r">
                {renderCell(process.waitingTime ?? 0, correctProcess?.waitingTime, (v) =>
                  handleProcessFieldChange(process.pid, "waitingTime", v),
                )}
              </div>
              <div className="p-3 border-r">
                {renderCell(process.turnaroundTime ?? 0, correctProcess?.turnaroundTime, (v) =>
                  handleProcessFieldChange(process.pid, "turnaroundTime", v),
                )}
              </div>
              <div className="p-3">
                {renderCell(process.completionTime ?? 0, correctProcess?.completionTime, (v) =>
                  handleProcessFieldChange(process.pid, "completionTime", v),
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Averages Section */}
      <div className="bg-muted rounded-md p-4">
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="font-semibold mb-1">Average Waiting Time:</p>
            {reviewMode ? (
              <div className="space-y-1">
                <p
                  className={`text-lg font-semibold ${
                    Math.abs(safeAvgWaitingTime - (correctSolution?.avgWaitingTime ?? 0)) <= 0.5
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Your: {safeAvgWaitingTime.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Correct: {(correctSolution?.avgWaitingTime ?? 0).toFixed(2)}
                </p>
              </div>
            ) : (
              <Input
                type="number"
                value={safeAvgWaitingTime}
                onChange={(e) => onAvgWaitingTimeChange(Number.parseFloat(e.target.value) || 0)}
                className="w-32"
                step={0.01}
              />
            )}
          </div>
          <div>
            <p className="font-semibold mb-1">Average Turnaround Time:</p>
            {reviewMode ? (
              <div className="space-y-1">
                <p
                  className={`text-lg font-semibold ${
                    Math.abs(safeAvgTurnaroundTime - (correctSolution?.avgTurnaroundTime ?? 0)) <= 0.5
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Your: {safeAvgTurnaroundTime.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Correct: {(correctSolution?.avgTurnaroundTime ?? 0).toFixed(2)}
                </p>
              </div>
            ) : (
              <Input
                type="number"
                value={safeAvgTurnaroundTime}
                onChange={(e) => onAvgTurnaroundTimeChange(Number.parseFloat(e.target.value) || 0)}
                className="w-32"
                step={0.01}
              />
            )}
          </div>
          <div>
            <p className="font-semibold mb-1">Completion Time:</p>
            {reviewMode ? (
              <div className="space-y-1">
                <p
                  className={`text-lg font-semibold ${
                    Math.abs(safeCompletionTime - (correctSolution?.completionTime ?? 0)) <= 0.5
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Your: {safeCompletionTime}
                </p>
                <p className="text-sm text-muted-foreground">Correct: {correctSolution?.completionTime ?? 0}</p>
              </div>
            ) : (
              <Input
                type="number"
                value={safeCompletionTime}
                onChange={(e) => onCompletionTimeChange(Number.parseFloat(e.target.value) || 0)}
                className="w-32"
                step={0.1}
              />
            )}
          </div>
          {reviewMode && userScore !== undefined && (
            <div>
              <p className="font-semibold mb-1">Your Score:</p>
              <p
                className={`text-lg font-semibold ${
                  userScore >= 80 ? "text-green-600" : userScore >= 60 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {userScore.toFixed(0)}/100
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
