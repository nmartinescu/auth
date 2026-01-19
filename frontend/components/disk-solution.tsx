"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface DiskStep {
  currentPosition: number
  seekDistance: number
  totalSeekTime: number
  explanation: string
  remainingRequests: number[]
}

interface DiskSolutionProps {
  solution: {
    data: {
      data: {
        algorithm: string
        initialHeadPosition: number
        sequence: number[]
        totalSeekTime: number
        averageSeekTime: number
        requests?: number[]
        steps: DiskStep[]
      }
    }
  }
  onBack: () => void
}

export default function DiskSolution({ solution, onBack }: DiskSolutionProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [currentSequence, setCurrentSequence] = useState<number[]>([])

  const { data } = solution.data
  const { sequence, totalSeekTime, averageSeekTime, algorithm, initialHeadPosition, steps } = data
  const safeSteps = steps || []

  useEffect(() => {
    if (safeSteps.length === 0) return
    const index = Math.min(stepIndex, safeSteps.length - 1)
    // Build sequence from initial position up to current step
    const stepSequence = [initialHeadPosition]
    for (let i = 0; i <= index; i++) {
      if (safeSteps[i] && safeSteps[i].currentPosition !== undefined) {
        stepSequence.push(safeSteps[i].currentPosition)
      }
    }
    setCurrentSequence(stepSequence)
  }, [stepIndex, safeSteps, initialHeadPosition])

  const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
    setStepIndex((prev) => {
      if (action === "next") return Math.min(prev + 1, safeSteps.length - 1)
      if (action === "prev") return Math.max(prev - 1, 0)
      if (action === "start") return 0
      if (action === "end") return Math.max(safeSteps.length - 1, 0)
      return prev
    })
  }

  const currentStep = safeSteps[stepIndex] || {}

  const chartData = {
    labels: currentSequence.map((_, index) => `Step ${index}`),
    datasets: [
      {
        label: "Head Position",
        data: currentSequence,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `${algorithm.toUpperCase()} Disk Head Movement`,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time Steps",
        },
      },
      y: {
        title: {
          display: true,
          text: "Track Number",
        },
      },
    },
  }

  const tableData = currentSequence.map((position, index) => {
    if (index === 0) {
      return { position, seekDistance: "-", totalSeekTime: "0", isInitial: true }
    }
    const stepData = safeSteps[index - 1] || {}
    return {
      position,
      seekDistance: stepData.seekDistance !== undefined ? stepData.seekDistance : "-",
      totalSeekTime: stepData.totalSeekTime !== undefined ? stepData.totalSeekTime : "0",
      isInitial: false,
    }
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Disk Scheduling Results</h1>
        <p className="text-lg text-muted-foreground">
          Algorithm: {algorithm.toUpperCase()} | Total Seek Time: {totalSeekTime} | Average Seek Time:{" "}
          {averageSeekTime.toFixed(2)} | Initial Head: {initialHeadPosition}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Disk Head Movement Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Disk Head Movement Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Sequence Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Head Movement Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[200px] overflow-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Step</TableHead>
                      <TableHead className="text-center">Head Position</TableHead>
                      <TableHead className="text-center">Seek Distance</TableHead>
                      <TableHead className="text-center">Total Seek Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-center">{row.isInitial ? "Initial" : index}</TableCell>
                        <TableCell className="text-center">{row.position}</TableCell>
                        <TableCell className="text-center">{row.seekDistance}</TableCell>
                        <TableCell className="text-center">{row.totalSeekTime}</TableCell>
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
              Step {stepIndex + 1} / {safeSteps.length}
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
                Step {stepIndex + 1} / {safeSteps.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm text-muted-foreground">
                {currentStep.explanation || "No explanation available."}
              </p>
            </CardContent>
          </Card>

          {/* Current Step Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Step Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                <strong>Current Position:</strong>{" "}
                {currentStep.currentPosition !== undefined ? currentStep.currentPosition : "N/A"}
              </p>
              <p className="text-sm">
                <strong>Seek Distance:</strong>{" "}
                {currentStep.seekDistance !== undefined ? currentStep.seekDistance : "0"}
              </p>
              <p className="text-sm">
                <strong>Total Seek Time:</strong>{" "}
                {currentStep.totalSeekTime !== undefined ? currentStep.totalSeekTime : "0"}
              </p>
              {currentStep.remainingRequests && currentStep.remainingRequests.length > 0 && (
                <p className="text-sm">
                  <strong>Remaining Requests:</strong> [{currentStep.remainingRequests.join(", ")}]
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
                <strong>Algorithm:</strong> {algorithm.toUpperCase()}
              </p>
              <p className="text-sm">
                <strong>Initial Head Position:</strong> {initialHeadPosition}
              </p>
              <p className="text-sm">
                <strong>Total Requests:</strong> {data.requests?.length || sequence.length - 1}
              </p>
              <p className="text-sm">
                <strong>Total Seek Time:</strong> {totalSeekTime}
              </p>
              <p className="text-sm">
                <strong>Average Seek Time:</strong> {averageSeekTime.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
