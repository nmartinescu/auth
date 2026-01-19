"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  HardDrive,
  Play,
  RotateCcw,
  Save,
  SquarePen,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Info,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import DiskSolution from "./disk-solution"
import { ActionModal } from "@/components/action-modal"

interface DiskSimulationData {
  selectedAlgorithm: string
  maxDiskSize: number
  initialHeadPosition: number
  headDirection: string
  requests: number[]
}

const DISK_ALGORITHMS = [
  { value: "fcfs", label: "FCFS", description: "First Come First Served" },
  { value: "sstf", label: "SSTF", description: "Shortest Seek Time First" },
  { value: "scan", label: "SCAN", description: "Elevator Algorithm" },
  { value: "cscan", label: "C-SCAN", description: "Circular SCAN" },
  { value: "look", label: "LOOK", description: "LOOK Algorithm" },
  { value: "clook", label: "C-LOOK", description: "Circular LOOK" },
]

const HEAD_DIRECTIONS = [
  { value: "right", label: "Right", description: "Towards higher cylinders" },
  { value: "left", label: "Left", description: "Towards lower cylinders" },
]

export function DiskSimulator() {
  const searchParams = useSearchParams()

  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("fcfs")
  const [maxDiskSize, setMaxDiskSize] = useState(200)
  const [initialHeadPosition, setInitialHeadPosition] = useState(50)
  const [headDirection, setHeadDirection] = useState("right")
  const [requests, setRequests] = useState<number[]>([98, 183, 37, 122, 14, 124, 65, 67])
  const [newRequest, setNewRequest] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [solution, setSolution] = useState<any>(null)

  useEffect(() => {
    const loadData = searchParams.get("loadData")
    if (loadData) {
      try {
        const simulationData: DiskSimulationData = JSON.parse(decodeURIComponent(loadData))
        if (simulationData.selectedAlgorithm) setSelectedAlgorithm(simulationData.selectedAlgorithm)
        if (simulationData.maxDiskSize) setMaxDiskSize(simulationData.maxDiskSize)
        if (simulationData.initialHeadPosition !== undefined) setInitialHeadPosition(simulationData.initialHeadPosition)
        if (simulationData.headDirection) setHeadDirection(simulationData.headDirection)
        if (simulationData.requests) setRequests(simulationData.requests)
        window.history.replaceState(null, "", window.location.pathname)
      } catch (error) {
        console.error("Error loading simulation data:", error)
      }
    }
  }, [searchParams])

  const handleReset = () => {
    setMaxDiskSize(200)
    setInitialHeadPosition(50)
    setHeadDirection("right")
    setRequests([98, 183, 37, 122, 14, 124, 65, 67])
    setSelectedAlgorithm("fcfs")
    setIsEditMode(false)
  }

  const addRequest = () => {
    const value = Number.parseInt(newRequest)
    if (!isNaN(value) && value >= 0 && value <= maxDiskSize) {
      setRequests([...requests, value])
      setNewRequest("")
    }
  }

  const removeRequest = (index: number) => {
    setRequests(requests.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const body = {
      algorithm: selectedAlgorithm,
      maxDiskSize,
      initialHeadPosition,
      direction: headDirection,
      requests,
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post("/api/disk-scheduling", body)
      setSolution(response)
      toast.success("Simulation completed successfully!")
    } catch (error: any) {
      console.error("Disk simulation error:", error)
      toast.error(error.response?.data?.message || "Failed to run simulation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const currentAlgorithm = DISK_ALGORITHMS.find((a) => a.value === selectedAlgorithm)
  const currentDirection = HEAD_DIRECTIONS.find((d) => d.value === headDirection)
  const needsDirection = ["scan", "cscan", "look", "clook"].includes(selectedAlgorithm)

  const exportData = () => ({
    selectedAlgorithm,
    maxDiskSize,
    initialHeadPosition,
    headDirection,
    requests,
  })

  const importData = (data: DiskSimulationData) => {
    if (data.selectedAlgorithm) setSelectedAlgorithm(data.selectedAlgorithm)
    if (data.maxDiskSize) setMaxDiskSize(data.maxDiskSize)
    if (data.initialHeadPosition !== undefined) setInitialHeadPosition(data.initialHeadPosition)
    if (data.headDirection) setHeadDirection(data.headDirection)
    if (data.requests) setRequests(data.requests)
  }

  if (solution) {
    return <DiskSolution solution={solution} onBack={() => setSolution(null)} />
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="mx-auto w-[90%] max-w-5xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <HardDrive className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Disk Scheduling</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Disk Scheduling Simulator
          </h1>
          <p className="text-lg text-muted-foreground">Simulate and visualize disk head movement algorithms</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuration Panel */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <CardTitle className="text-lg font-semibold text-foreground">Configuration</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsEditMode(!isEditMode)} className="gap-2">
                {isEditMode ? <Save className="h-4 w-4" /> : <SquarePen className="h-4 w-4" />}
                {isEditMode ? "Save" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Algorithm Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Scheduling Algorithm</Label>
                {isEditMode ? (
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {DISK_ALGORITHMS.map((algorithm) => (
                        <SelectItem key={algorithm.value} value={algorithm.value}>
                          <span className="font-medium">{algorithm.label}</span>
                          <span className="ml-2 text-muted-foreground">- {algorithm.description}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <HardDrive className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{currentAlgorithm?.label}</p>
                      <p className="text-sm text-muted-foreground">{currentAlgorithm?.description}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Disk Configuration */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Disk Configuration</Label>
                {isEditMode ? (
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Max Disk Size</Label>
                      <Input
                        type="number"
                        value={maxDiskSize}
                        onChange={(e) => setMaxDiskSize(Math.max(1, Number.parseInt(e.target.value) || 1))}
                        min={1}
                        max={1000}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Initial Head Position</Label>
                      <Input
                        type="number"
                        value={initialHeadPosition}
                        onChange={(e) => setInitialHeadPosition(Math.max(0, Number.parseInt(e.target.value) || 0))}
                        min={0}
                        max={maxDiskSize}
                        className="bg-background"
                      />
                    </div>
                    {needsDirection && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Head Direction</Label>
                        <Select value={headDirection} onValueChange={setHeadDirection}>
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                          <SelectContent>
                            {HEAD_DIRECTIONS.map((direction) => (
                              <SelectItem key={direction.value} value={direction.value}>
                                <span className="flex items-center gap-2">
                                  {direction.value === "right" ? (
                                    <ArrowRight className="h-4 w-4" />
                                  ) : (
                                    <ArrowLeft className="h-4 w-4" />
                                  )}
                                  {direction.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Disk Size</span>
                      <span className="font-medium text-foreground">{maxDiskSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initial Head Position</span>
                      <span className="font-medium text-foreground">{initialHeadPosition}</span>
                    </div>
                    {needsDirection && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Head Direction</span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          {headDirection === "right" ? (
                            <ArrowRight className="h-4 w-4" />
                          ) : (
                            <ArrowLeft className="h-4 w-4" />
                          )}
                          {currentDirection?.label}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Disk Requests */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Disk Requests</Label>
                {isEditMode ? (
                  <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                    <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      {requests.map((request, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer gap-1 px-3 py-1 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeRequest(index)}
                        >
                          {request}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={newRequest}
                        onChange={(e) => setNewRequest(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addRequest()}
                        placeholder="Enter cylinder number"
                        min={0}
                        max={maxDiskSize}
                        className="bg-background"
                      />
                      <Button onClick={addRequest} size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 rounded-lg bg-muted/50 p-4">
                    {requests.map((request, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {request}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1 gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} className="gap-2 bg-transparent">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <ActionModal
                  exportDataCallback={exportData}
                  importDataCallback={importData}
                  filename="disk-scheduling-simulation.json"
                  buttonText="Actions"
                  modalTitle="Disk Scheduling Actions"
                  simulationType="disk"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Configuration Summary */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-lg font-semibold text-foreground">Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{requests.length}</p>
                    <p className="text-sm text-muted-foreground">Total Requests</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">0 - {maxDiskSize}</p>
                    <p className="text-sm text-muted-foreground">Disk Range</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{initialHeadPosition}</p>
                    <p className="text-sm text-muted-foreground">Start Position</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{currentAlgorithm?.label}</p>
                    <p className="text-sm text-muted-foreground">Algorithm</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Info */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <Info className="h-5 w-5 text-primary" />
                  Algorithm Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{currentAlgorithm?.label}</h4>
                    <p className="text-sm text-muted-foreground">{currentAlgorithm?.description}</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                    {selectedAlgorithm === "fcfs" && (
                      <p>
                        Processes disk requests in the order they arrive. Simple but may result in high seek times due
                        to random head movement.
                      </p>
                    )}
                    {selectedAlgorithm === "sstf" && (
                      <p>
                        Selects the request closest to the current head position. Minimizes seek time but may cause
                        starvation for distant requests.
                      </p>
                    )}
                    {selectedAlgorithm === "scan" && (
                      <p>
                        The head moves in one direction, servicing requests until it reaches the end, then reverses
                        direction. Also known as the elevator algorithm.
                      </p>
                    )}
                    {selectedAlgorithm === "cscan" && (
                      <p>
                        Similar to SCAN but only services requests in one direction. When reaching the end, it jumps
                        back to the beginning without servicing.
                      </p>
                    )}
                    {selectedAlgorithm === "look" && (
                      <p>
                        Like SCAN but the head only goes as far as the last request in each direction, not to the
                        physical end of the disk.
                      </p>
                    )}
                    {selectedAlgorithm === "clook" && (
                      <p>
                        Combination of C-SCAN and LOOK. Services requests in one direction until the last request, then
                        jumps back to service from the beginning.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
