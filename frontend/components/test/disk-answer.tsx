"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import type { DiskAnswerProps } from "@/types/test"

export function DiskAnswer({
  diskSequence,
  maxDiskSize,
  initialHeadPosition,
  requests,
  onDiskSequenceChange,
  reviewMode = false,
  correctSolution,
  userScore,
}: DiskAnswerProps) {
  const [totalSeekTime, setTotalSeekTime] = useState(0)
  const [averageSeekTime, setAverageSeekTime] = useState(0)

  const correctSequence = correctSolution?.sequence ?? []

  const calculateSeekTimes = (sequence: number[]) => {
    if (sequence.length < 2) {
      setTotalSeekTime(0)
      setAverageSeekTime(0)
      return
    }
    let total = 0
    for (let i = 1; i < sequence.length; i++) {
      total += Math.abs(sequence[i] - sequence[i - 1])
    }
    const requestCount = sequence.length - 1
    const average = requestCount > 0 ? total / requestCount : 0
    setTotalSeekTime(total)
    setAverageSeekTime(Math.round(average * 100) / 100)
  }

  useEffect(() => {
    calculateSeekTimes(diskSequence)
  }, [diskSequence])

  const handleSequenceChange = (index: number, value: string) => {
    const numValue = value === "" ? 0 : Number.parseInt(value) || 0
    onDiskSequenceChange(diskSequence.map((pos, idx) => (idx === index ? numValue : pos)))
  }

  const expectedLength = 1 + requests.length
  const isComplete = diskSequence.length === expectedLength

  return (
    <div className="space-y-6">
      {/* Service Sequence Section */}
      <div>
        <p className="font-semibold mb-3">Service Sequence (including initial head position):</p>
        <div className="border rounded-md p-4 space-y-3">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Enter the order in which disk requests are serviced. The first position is the initial head position (
              {initialHeadPosition}). You need to enter the remaining {requests.length} positions for the requests: [
              {requests.join(", ")}]. Seek times will be calculated automatically as you enter the sequence.
            </p>
            <p className={`text-xs font-medium ${isComplete ? "text-green-600" : "text-orange-600"}`}>
              Sequence progress: {diskSequence.length} / {expectedLength} positions
              {!isComplete && " (incomplete)"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {diskSequence.map((position, index) => {
              const correctPosition = correctSequence[index]
              const isPositionCorrect = position === correctPosition

              return (
                <div key={index} className="flex items-center gap-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {index === 0 ? "Start:" : `${index}:`}
                  </span>
                  {reviewMode ? (
                    <div className="min-w-[80px]">
                      <div className="space-y-1">
                        <p className={`font-semibold ${isPositionCorrect ? "text-green-600" : "text-red-600"}`}>
                          Your: {position}
                        </p>
                        <p className="text-sm text-muted-foreground">Correct: {correctPosition ?? "N/A"}</p>
                      </div>
                    </div>
                  ) : (
                    <Input
                      type="number"
                      value={position}
                      onChange={(e) => handleSequenceChange(index, e.target.value)}
                      className="w-20"
                      min={0}
                      max={maxDiskSize - 1}
                      disabled={index === 0}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Seek Time Calculations */}
      <div>
        <p className="font-semibold mb-3">Seek Time Calculations:</p>
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex flex-wrap gap-8">
            <div>
              <p className="font-semibold mb-1">Total Seek Time:</p>
              {reviewMode ? (
                <div className="space-y-1">
                  <p
                    className={`text-lg font-semibold ${
                      Math.abs(totalSeekTime - (correctSolution?.totalSeekTime ?? 0)) <= 1
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Your: {totalSeekTime}
                  </p>
                  <p className="text-sm text-muted-foreground">Correct: {correctSolution?.totalSeekTime ?? 0}</p>
                </div>
              ) : (
                <p className="text-lg font-semibold text-primary">{totalSeekTime}</p>
              )}
            </div>
            <div>
              <p className="font-semibold mb-1">Average Seek Time:</p>
              {reviewMode ? (
                <div className="space-y-1">
                  <p
                    className={`text-lg font-semibold ${
                      Math.abs(averageSeekTime - (correctSolution?.averageSeekTime ?? 0)) <= 0.5
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Your: {averageSeekTime.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Correct: {(correctSolution?.averageSeekTime ?? 0).toFixed(2)}
                  </p>
                </div>
              ) : (
                <p className="text-lg font-semibold text-primary">{averageSeekTime.toFixed(2)}</p>
              )}
            </div>
          </div>

          {!reviewMode && (
            <p className="text-sm text-muted-foreground italic">
              Tip: Total Seek Time = Sum of |current_position - next_position| for each movement
              <br />
              Average Seek Time = Total Seek Time / Number of Requests
            </p>
          )}

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
