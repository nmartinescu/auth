"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface MemorySolutionProps {
  solution: {
    algorithm: string
    frameCount: number
    pageReferences: number[]
    totalPageFaults: number
    hitRate: number
    frames: number[][]
    customData: {
      page: number
      pageFault: boolean
      totalPageFaults: number
      hitRate: number
      explaination: string
      dataStructure: number[]
    }[]
  }
  onBack: () => void
}

export default function MemorySolution({ solution, onBack }: MemorySolutionProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [currentSequence, setCurrentSequence] = useState<number[][]>([])

  const safeFrames = solution?.frames || []
  const safeCustomData = solution?.customData || []

  useEffect(() => {
    if (safeFrames.length === 0) return
    const index = Math.min(stepIndex, safeFrames.length - 1)
    setCurrentSequence(safeFrames.slice(0, index + 1))
  }, [stepIndex, safeFrames])

  const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
    setStepIndex((prev) => {
      if (action === "next") return Math.min(prev + 1, safeCustomData.length - 1)
      if (action === "prev") return Math.max(prev - 1, 0)
      if (action === "start") return 0
      if (action === "end") return Math.max(safeCustomData.length - 1, 0)
      return prev
    })
  }

  const currentStep = safeCustomData[stepIndex] || {}
  const frameCount = safeFrames[0]?.length || 0

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Memory Management Results</h1>
        <p className="text-lg text-muted-foreground">
          Algorithm: {solution?.algorithm?.toUpperCase()} | Total Page Faults: {solution?.totalPageFaults} | Hit Rate:{" "}
          {solution?.hitRate}%
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Memory Frames Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Memory Frames Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Array.from({ length: frameCount }, (_, colIndex) => (
                        <TableHead key={colIndex} className="text-center">
                          Frame {colIndex}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentSequence.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {row.map((cell: number, colIndex: number) => (
                          <TableCell key={colIndex} className="text-center">
                            {cell === -1 ? "Empty" : cell}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => handleStepChange("start")}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleStepChange("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-4 text-sm text-muted-foreground">
              Step {stepIndex + 1} / {safeCustomData.length}
            </span>
            <Button variant="outline" size="sm" onClick={() => handleStepChange("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleStepChange("end")}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Configuration
            </Button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Step Details */}
          <Card>
            <CardHeader>
              <CardTitle>
                Step {stepIndex + 1} / {safeCustomData.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {currentStep.explaination || "No explanation available."}
              </p>
            </CardContent>
          </Card>

          {/* Current Step Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Step Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentStep.page !== undefined && (
                <p className="text-sm">
                  <strong>Current Page:</strong> {currentStep.page}
                </p>
              )}
              {currentStep.pageFault !== undefined && (
                <p className="text-sm">
                  <strong>Page Fault:</strong> {currentStep.pageFault ? "Yes" : "No"}
                </p>
              )}
              {currentStep.totalPageFaults !== undefined && (
                <p className="text-sm">
                  <strong>Total Page Faults:</strong> {currentStep.totalPageFaults}
                </p>
              )}
              {currentStep.hitRate !== undefined && (
                <p className="text-sm">
                  <strong>Hit Rate:</strong> {(currentStep.hitRate * 100).toFixed(2)}%
                </p>
              )}
              {currentStep.dataStructure && currentStep.dataStructure.length > 0 && (
                <p className="text-sm">
                  <strong>Data Structure:</strong> {currentStep.dataStructure.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Final Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Final Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Algorithm:</strong> {solution?.algorithm?.toUpperCase()}
              </p>
              <p className="text-sm">
                <strong>Frame Count:</strong> {solution?.frameCount}
              </p>
              <p className="text-sm">
                <strong>Total Pages:</strong> {solution?.pageReferences?.length || 0}
              </p>
              <p className="text-sm">
                <strong>Total Page Faults:</strong> {solution?.totalPageFaults}
              </p>
              <p className="text-sm">
                <strong>Final Hit Rate:</strong> {solution?.hitRate}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
