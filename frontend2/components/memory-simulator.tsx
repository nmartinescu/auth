"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, RotateCcw, Save, Pencil, Database, Layers, X, Info, Loader2 } from "lucide-react"
import { toast } from "sonner"
import apiClient from "@/lib/api-client"
import MemorySolution from "./memory-solution"

const MEMORY_ALGORITHMS = [
  { value: "fifo", label: "FIFO", description: "First In First Out" },
  { value: "lru", label: "LRU", description: "Least Recently Used" },
  { value: "lfu", label: "LFU", description: "Least Frequently Used" },
  { value: "optimal", label: "Optimal", description: "Optimal Page Replacement" },
  { value: "clock", label: "Clock", description: "Clock (Second Chance)" },
]

interface MemorySimulationData {
  selectedAlgorithm: string
  frameCount: number
  pageReferences: number[]
}

export function MemorySimulator() {
  const searchParams = useSearchParams()
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("fifo")
  const [frameCount, setFrameCount] = useState(3)
  const [pageReferences, setPageReferences] = useState<number[]>([1, 2, 3, 4, 1, 2, 5])
  const [newPage, setNewPage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [solution, setSolution] = useState<any>(null)

  useEffect(() => {
    const loadData = searchParams.get("loadData")
    if (loadData) {
      try {
        const simulationData: MemorySimulationData = JSON.parse(decodeURIComponent(loadData))
        if (simulationData.selectedAlgorithm) {
          setSelectedAlgorithm(simulationData.selectedAlgorithm)
        }
        if (simulationData.frameCount) {
          setFrameCount(simulationData.frameCount)
        }
        if (simulationData.pageReferences) {
          setPageReferences(simulationData.pageReferences)
        }
        const newUrl = window.location.pathname
        window.history.replaceState(null, "", newUrl)
      } catch (error) {
        console.error("Error loading simulation data from URL:", error)
      }
    }
  }, [searchParams])

  const handleReset = () => {
    setFrameCount(3)
    setPageReferences([1, 2, 3, 4, 1, 2, 5])
    setSelectedAlgorithm("fifo")
    setIsEditMode(false)
  }

  const handleSave = () => {
    setIsEditMode(!isEditMode)
  }

  const addPage = () => {
    const pageNum = Number.parseInt(newPage)
    if (!isNaN(pageNum) && pageNum >= 0) {
      setPageReferences([...pageReferences, pageNum])
      setNewPage("")
    }
  }

  const removePage = (index: number) => {
    setPageReferences(pageReferences.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addPage()
    }
  }

  const onSubmit = async () => {
    const body = {
      frameCount,
      selectedAlgorithm: [selectedAlgorithm],
      pageReferences,
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post("/memory-management", body)
      setSolution(response.data)
      toast.success("Simulation completed successfully!")
    } catch (error: any) {
      console.error("Memory simulation error:", error)
      toast.error(error.response?.data?.message || "Failed to run simulation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedAlgorithmData = MEMORY_ALGORITHMS.find((alg) => alg.value === selectedAlgorithm)

  if (solution) {
    return <MemorySolution solution={solution} onBack={() => setSolution(null)} />
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <Database className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Page Replacement</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Memory Management Simulator</h1>
          <p className="mt-3 text-lg text-muted-foreground">Simulate and visualize page replacement algorithms</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration Panel */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Layers className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>Set up your memory simulation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Algorithm Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Page Replacement Algorithm</Label>
                {isEditMode ? (
                  <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMORY_ALGORITHMS.map((algorithm) => (
                        <SelectItem key={algorithm.value} value={algorithm.value}>
                          <span className="font-medium">{algorithm.label}</span>
                          <span className="ml-2 text-muted-foreground">- {algorithm.description}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{selectedAlgorithmData?.label}</p>
                        <p className="text-sm text-muted-foreground">{selectedAlgorithmData?.description}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Frame Count */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Frame Count</Label>
                {isEditMode ? (
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={frameCount}
                    onChange={(e) => setFrameCount(Number(e.target.value) || 1)}
                    className="w-full"
                  />
                ) : (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-lg font-semibold text-foreground">{frameCount} frames</p>
                  </div>
                )}
              </div>

              {/* Page References */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Page References</Label>
                {isEditMode ? (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="mb-4 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                      {pageReferences.map((page, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer gap-1 px-3 py-1.5 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removePage(index)}
                        >
                          {page}
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                      {pageReferences.length === 0 && (
                        <p className="text-sm text-muted-foreground">No pages added yet</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={99}
                        value={newPage}
                        onChange={(e) => setNewPage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Page number"
                        className="flex-1"
                      />
                      <Button onClick={addPage} size="sm">
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <div className="flex flex-wrap gap-2">
                      {pageReferences.map((page, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1">
                          {page}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={handleReset} className="flex-1 bg-transparent">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button variant="outline" onClick={handleSave} className="flex-1 bg-transparent">
                  {isEditMode ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  ) : (
                    <>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </>
                  )}
                </Button>
              </div>

              <Button
                onClick={onSubmit}
                disabled={isEditMode || pageReferences.length === 0 || isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Simulation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Summary Panel */}
          <div className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Info className="h-5 w-5" />
                  Configuration Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="text-muted-foreground">Algorithm</span>
                    <span className="font-semibold text-foreground">{selectedAlgorithmData?.label}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="text-muted-foreground">Memory Frames</span>
                    <span className="font-semibold text-foreground">{frameCount}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="text-muted-foreground">Total Pages</span>
                    <span className="font-semibold text-foreground">{pageReferences.length}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                    <span className="text-muted-foreground">Unique Pages</span>
                    <span className="font-semibold text-foreground">{new Set(pageReferences).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Info Card */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-foreground">About {selectedAlgorithmData?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {selectedAlgorithm === "fifo" &&
                    "First In First Out (FIFO) replaces the page that has been in memory the longest. It's simple to implement but may not always provide optimal performance."}
                  {selectedAlgorithm === "lru" &&
                    "Least Recently Used (LRU) replaces the page that hasn't been used for the longest time. It approximates optimal replacement and is widely used in practice."}
                  {selectedAlgorithm === "lfu" &&
                    "Least Frequently Used (LFU) replaces the page with the lowest access count. It keeps frequently accessed pages in memory longer."}
                  {selectedAlgorithm === "optimal" &&
                    "Optimal Page Replacement replaces the page that won't be used for the longest time in the future. It provides the best possible performance but requires future knowledge."}
                  {selectedAlgorithm === "clock" &&
                    "Clock (Second Chance) algorithm uses a circular queue with a reference bit. Pages get a second chance before being replaced, balancing simplicity and performance."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
