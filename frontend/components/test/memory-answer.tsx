"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { MemoryAnswerProps } from "@/types/test"

export function MemoryAnswer({
  memorySteps,
  frameCount,
  onMemoryStepsChange,
  reviewMode = false,
  correctSolution,
  userScore,
}: MemoryAnswerProps) {
  const correctSteps = correctSolution?.stepResults ?? []

  const handleMemoryFrameChange = (stepIndex: number, frameIndex: number, value: string) => {
    let numValue: number | null = null
    if (value !== "") {
      const parsed = Number.parseInt(value)
      if (!isNaN(parsed) && parsed >= 0) numValue = parsed
    }
    onMemoryStepsChange(
      memorySteps.map((step, idx) =>
        idx === stepIndex
          ? {
              ...step,
              frameState: step.frameState.map((f, fIdx) => (fIdx === frameIndex ? numValue : f)),
            }
          : step,
      ),
    )
  }

  const handlePageFaultChange = (stepIndex: number, isPageFault: boolean) => {
    onMemoryStepsChange(
      memorySteps.map((step, idx) => (idx === stepIndex ? { ...step, pageFault: isPageFault } : step)),
    )
  }

  const totalPageFaults = memorySteps.filter((s) => s.pageFault).length
  const hitRate =
    memorySteps.length > 0 ? (((memorySteps.length - totalPageFaults) / memorySteps.length) * 100).toFixed(1) : "0"

  const normalizeFrame = (frame: number | null | undefined) => {
    if (frame === null || frame === undefined) return null
    return frame
  }

  return (
    <div className="space-y-6">
      {/* Memory Steps Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <div
            className="grid bg-muted font-semibold text-sm"
            style={{
              gridTemplateColumns: `80px repeat(${frameCount}, 1fr) 100px`,
              minWidth: `${180 + frameCount * 80}px`,
            }}
          >
            <div className="p-3 border-r">Page Ref</div>
            {Array.from({ length: frameCount }, (_, i) => (
              <div key={i} className="p-3 border-r">
                Frame {i}
              </div>
            ))}
            <div className="p-3">Page Fault?</div>
          </div>
          {memorySteps.map((step, stepIndex) => {
            const correctStep = reviewMode ? correctSteps[stepIndex] : null
            const correctFrameState = correctStep?.frameState ?? []

            return (
              <div
                key={stepIndex}
                className="grid border-t text-sm"
                style={{
                  gridTemplateColumns: `80px repeat(${frameCount}, 1fr) 100px`,
                  minWidth: `${180 + frameCount * 80}px`,
                }}
              >
                <div className="p-3 border-r font-semibold flex items-center">{step.pageReference}</div>
                {step.frameState.map((frameValue, frameIndex) => {
                  const userFrame = normalizeFrame(frameValue)
                  const correctFrame = normalizeFrame(correctFrameState[frameIndex])
                  const isFrameCorrect = userFrame === correctFrame

                  return (
                    <div key={frameIndex} className="p-3 border-r">
                      {reviewMode ? (
                        <div className="space-y-1">
                          <p className={`font-semibold ${isFrameCorrect ? "text-green-600" : "text-red-600"}`}>
                            Your: {userFrame ?? "-"}
                          </p>
                          <p className="text-sm text-muted-foreground">Correct: {correctFrame ?? "-"}</p>
                        </div>
                      ) : (
                        <Input
                          type="number"
                          value={frameValue ?? ""}
                          onChange={(e) => handleMemoryFrameChange(stepIndex, frameIndex, e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value === "" || isNaN(Number.parseInt(e.target.value))) {
                              handleMemoryFrameChange(stepIndex, frameIndex, "0")
                            }
                          }}
                          className="w-16"
                          min={0}
                          placeholder="0"
                        />
                      )}
                    </div>
                  )
                })}
                <div className="p-3 flex items-center justify-center">
                  {reviewMode ? (
                    <div className="text-center space-y-1">
                      <p
                        className={`font-semibold ${
                          correctStep && step.pageFault === correctStep.pageFault ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        Your: {step.pageFault ? "Yes" : "No"}
                      </p>
                      <p className="text-sm text-muted-foreground">Correct: {correctStep?.pageFault ? "Yes" : "No"}</p>
                    </div>
                  ) : (
                    <Checkbox
                      checked={step.pageFault}
                      onCheckedChange={(checked) => handlePageFaultChange(stepIndex, !!checked)}
                    />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-muted rounded-md p-4">
        <div className="flex flex-wrap gap-8 items-center">
          <div>
            <p className="font-semibold mb-1">Total Page Faults:</p>
            {reviewMode ? (
              <div className="space-y-1">
                <p className="text-lg font-semibold text-primary">Your: {totalPageFaults}</p>
                <p className="text-sm text-muted-foreground">
                  Correct: {correctSteps.filter((s) => s?.pageFault).length}
                </p>
              </div>
            ) : (
              <p className="text-lg font-semibold text-primary">{totalPageFaults}</p>
            )}
          </div>
          <div>
            <p className="font-semibold mb-1">Total References:</p>
            <p className="text-lg font-semibold text-primary">{memorySteps.length}</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Hit Rate:</p>
            <p className="text-lg font-semibold text-primary">{hitRate}%</p>
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
