"use client"

import { useState } from "react"
import { Play, Plus, RotateCcw, Pencil, Save, Trash2, Cpu, Clock, Zap, Layers, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import ProcessSolution from "@/components/process-solution"

interface ProcessData {
  arrivalTime: number
  burstTime: number
  io: string
}

const CPU_ALGORITHMS = [
  {
    label: "FCFS",
    value: "FCFS",
    description: "First Come First Served",
    icon: Clock,
  },
  {
    label: "SJF",
    value: "SJF",
    description: "Shortest Job First",
    icon: Zap,
  },
  {
    label: "RR",
    value: "RR",
    description: "Round Robin",
    icon: RotateCcw,
  },
  {
    label: "STCF",
    value: "STCF",
    description: "Shortest Time to Completion",
    icon: Zap,
  },
  {
    label: "MLFQ",
    value: "MLFQ",
    description: "Multi-Level Feedback Queue",
    icon: Layers,
  },
]

export default function ProcessPage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [processes, setProcesses] = useState<ProcessData[]>([{ arrivalTime: 0, burstTime: 1, io: "" }])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("FCFS")
  const [quantum, setQuantum] = useState(2)
  const [mlfqQueues, setMlfqQueues] = useState(3)
  const [mlfqQuantums, setMlfqQuantums] = useState("2,4,8")
  const [mlfqAllotment, setMlfqAllotment] = useState(20)
  const [solution, setSolution] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const updateProcess = (index: number, key: keyof ProcessData, value: number | string) => {
    const updated = [...processes]
    ;(updated[index] as any)[key] = value
    setProcesses(updated)
  }

  const addProcess = () => {
    setProcesses([...processes, { arrivalTime: 0, burstTime: 1, io: "" }])
  }

  const deleteProcess = (index: number) => {
    setProcesses(processes.filter((_, i) => i !== index))
  }

  const handleReset = () => {
    setProcesses([{ arrivalTime: 0, burstTime: 1, io: "" }])
    setIsEditMode(false)
  }

  const handleSave = () => {
    setIsEditMode(!isEditMode)
  }

  const onSubmit = async () => {
    try {
      setIsLoading(true)
      console.log("Starting CPU scheduling simulation...")
      console.log("Input processes:", processes)

      const apiData = {
        algorithm: selectedAlgorithm,
        ...(selectedAlgorithm === "RR" && { quantum }),
        ...(selectedAlgorithm === "MLFQ" && {
          queues: mlfqQueues,
          quantums: mlfqQuantums.split(",").map((q) => Number.parseInt(q.trim())),
          allotment: mlfqAllotment,
        }),
        processes: processes.map((process) => ({
          arrivalTime: process.arrivalTime,
          burstTime: process.burstTime,
          io:
            process.io && process.io.trim() !== ""
              ? typeof process.io === "string"
                ? process.io
                    .split(",")
                    .map((ioStr) => {
                      const [start, duration] = ioStr.split(":").map(Number)
                      return {
                        start: start || 0,
                        duration: duration || 1,
                      }
                    })
                    .filter((io) => !isNaN(io.start) && !isNaN(io.duration))
                : process.io
              : [],
        })),
      }

      console.log("Sending API request:", apiData)

      const response = await apiClient.post("/api/cpu-scheduling", apiData)
      const result = response.data

      if (result.success) {
        setSolution(result)
        console.log("CPU Scheduling Result:", result)
        console.log("Algorithm:", result.data.algorithm)
        console.log("Total Processes:", result.data.processes)
        console.log("Performance Metrics:", result.data.metrics)
        console.log("Simulation Steps:", result.data.solution)

        console.log("\nSIMULATION SUMMARY:")
        console.log(`Algorithm: ${result.data.algorithm}`)
        console.log(`Processes: ${result.data.processes}`)
        console.log(`Average Waiting Time: ${result.data.metrics.averageWaitingTime}`)
        console.log(`Average Turnaround Time: ${result.data.metrics.averageTurnaroundTime}`)
        console.log(`CPU Utilization: ${result.data.metrics.cpuUtilization}%`)
        console.log(`Throughput: ${result.data.metrics.throughput}`)

        toast.success("Simulation completed successfully!")
      } else {
        const errorMessage = result.error || result.message || "Unknown error occurred"
        console.error("API Error:", errorMessage)
        console.error("Full response:", result)
        toast.error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to connect to the CPU scheduling service"
      console.error("Network Error:", error)
      console.error("Failed to connect to the CPU scheduling API")
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackFromSolution = () => {
    setSolution(null)
  }

  if (solution) {
    return <ProcessSolution solution={solution} onBack={handleBackFromSolution} />
  }

  const selectedAlgorithmData = CPU_ALGORITHMS.find((alg) => alg.value === selectedAlgorithm)

  return (
    <main className="min-h-screen bg-background pb-16 pt-8">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">CPU Scheduling</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Process Management Simulator
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Configure your processes and select a scheduling algorithm to visualize how the CPU manages execution
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Scheduling Algorithm</CardTitle>
                <CardDescription>Select the CPU scheduling strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditMode ? (
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {CPU_ALGORITHMS.map((algorithm) => (
                        <SelectItem key={algorithm.value} value={algorithm.value}>
                          <span className="font-medium">{algorithm.label}</span>
                          <span className="ml-2 text-muted-foreground">- {algorithm.description}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-4">
                    {selectedAlgorithmData && (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          {selectedAlgorithmData.icon && (
                            <selectedAlgorithmData.icon className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{selectedAlgorithmData.label}</p>
                          <p className="text-sm text-muted-foreground">{selectedAlgorithmData.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedAlgorithm === "RR" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Time Quantum</CardTitle>
                  <CardDescription>Time slice for each process</CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditMode ? (
                    <Input
                      type="number"
                      value={quantum}
                      onChange={(e) => setQuantum(Number(e.target.value) || 1)}
                      min={1}
                      max={20}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-base font-semibold">
                        {quantum}
                      </Badge>
                      <span className="text-muted-foreground">time units</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {selectedAlgorithm === "MLFQ" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">MLFQ Configuration</CardTitle>
                  <CardDescription>Multi-level queue parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditMode ? (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Number of Queues</Label>
                        <Input
                          type="number"
                          value={mlfqQueues}
                          onChange={(e) => {
                            const newQueues = Number(e.target.value) || 3
                            setMlfqQueues(newQueues)
                            const defaultQuantums = Array.from({ length: newQueues }, (_, i) => Math.pow(2, i + 1))
                            setMlfqQuantums(defaultQuantums.join(","))
                          }}
                          min={2}
                          max={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Quantums (comma-separated)</Label>
                        <Input
                          value={mlfqQuantums}
                          onChange={(e) => setMlfqQuantums(e.target.value)}
                          placeholder="2,4,8"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Allotment Time</Label>
                        <Input
                          type="number"
                          value={mlfqAllotment}
                          onChange={(e) => setMlfqAllotment(Number(e.target.value) || 20)}
                          min={5}
                          max={100}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Queues</span>
                        <Badge variant="secondary">{mlfqQueues}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Quantums</span>
                        <Badge variant="secondary">[{mlfqQuantums}]</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Allotment</span>
                        <Badge variant="secondary">{mlfqAllotment} units</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                  <span className="text-muted-foreground">Total Processes</span>
                  <span className="text-2xl font-bold text-foreground">{processes.length}</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleReset} className="gap-2 bg-transparent">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" onClick={handleSave} className="gap-2 bg-transparent">
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
              <Button onClick={onSubmit} disabled={isEditMode || isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Simulation
                  </>
                )}
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Process Table</CardTitle>
              <CardDescription>Define arrival time, burst time, and I/O for each process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="text-center font-semibold">PID</TableHead>
                      <TableHead className="text-center font-semibold">Arrival</TableHead>
                      <TableHead className="text-center font-semibold">Burst</TableHead>
                      <TableHead className="text-center font-semibold">I/O</TableHead>
                      {isEditMode && <TableHead className="text-center font-semibold">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.map((process, index) => (
                      <TableRow key={index} className="transition-colors hover:bg-secondary/30">
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            P{index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditMode ? (
                            <Input
                              type="number"
                              value={process.arrivalTime}
                              onChange={(e) => updateProcess(index, "arrivalTime", Number(e.target.value) || 0)}
                              min={0}
                              className="mx-auto w-20 text-center"
                            />
                          ) : (
                            <span className="font-medium">{process.arrivalTime}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditMode ? (
                            <Input
                              type="number"
                              value={process.burstTime}
                              onChange={(e) => updateProcess(index, "burstTime", Number(e.target.value) || 1)}
                              min={1}
                              className="mx-auto w-20 text-center"
                            />
                          ) : (
                            <span className="font-medium">{process.burstTime}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditMode ? (
                            <Input
                              value={process.io}
                              onChange={(e) => updateProcess(index, "io", e.target.value)}
                              placeholder="2:1,4:2"
                              className="mx-auto w-24 text-center"
                            />
                          ) : (
                            <span className={cn("font-medium", !process.io && "text-muted-foreground")}>
                              {process.io || "—"}
                            </span>
                          )}
                        </TableCell>
                        {isEditMode && (
                          <TableCell className="text-center">
                            {index !== 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteProcess(index)}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {isEditMode && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" onClick={addProcess} className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Add Process
                  </Button>
                </div>
              )}

              <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-sm font-medium text-foreground">I/O Format</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">start:duration</code> pairs
                  separated by commas. Example:{" "}
                  <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">2:1,4:2</code>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
