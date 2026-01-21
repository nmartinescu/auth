"use client"

import { useState, useEffect } from "react"
import {
  User,
  Trash2,
  Play,
  Calendar,
  Cpu,
  HardDrive,
  MemoryStick,
  RefreshCw,
  FileText,
  Eye,
  Trophy,
  Target,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { simulationService, type Simulation } from "@/lib/services/simulation-service"
import { testResultsService } from "@/lib/services/test-results-service"
import { tokenService } from "@/lib/services/token-service"
import type { User as UserType } from "@/types/user"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [simulationsLoading, setSimulationsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [testResultsLoading, setTestResultsLoading] = useState(false)
  const [testStats, setTestStats] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("user")

    if (!token || !userData) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      loadSimulations()
      loadTestResults()
      loadTestStatistics()
    } catch (error) {
      console.error("Error parsing user data:", error)
      handleLogout()
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadSimulations = async () => {
    setSimulationsLoading(true)
    try {
      const userSimulations = await simulationService.getSimulations()
      setSimulations(Array.isArray(userSimulations) ? userSimulations : [])
    } catch (error: any) {
      console.error("Error loading simulations:", error)
      setSimulations([])
    } finally {
      setSimulationsLoading(false)
    }
  }

  const loadTestResults = async () => {
    setTestResultsLoading(true)
    try {
      const results = await testResultsService.getTestResults({ limit: 10, sortBy: "createdAt", order: "desc" })
      setTestResults(Array.isArray(results) ? results : [])
    } catch (error) {
      console.error("Error loading test results:", error)
      setTestResults([])
    } finally {
      setTestResultsLoading(false)
    }
  }

  const loadTestStatistics = async () => {
    try {
      const stats = await testResultsService.getTestStatistics()
      setTestStats(stats)
    } catch (error) {
      console.error("Error loading test statistics:", error)
    }
  }

  const handleDeleteTestResult = async (testResultId: string) => {
    try {
      await testResultsService.deleteTestResult(testResultId)
      loadTestResults()
      loadTestStatistics()
    } catch (error) {
      console.error("Error deleting test result:", error)
    }
  }

  const handleViewTestResult = (testResult: any) => {
    sessionStorage.setItem("reviewTestResult", JSON.stringify(testResult))
    router.push("/test?review=true")
  }

  const handleDeleteSimulation = async (simulationId: string) => {
    try {
      await simulationService.deleteSimulation(simulationId)
      loadSimulations()
    } catch (error) {
      console.error("Error deleting simulation:", error)
    }
  }

  const handleLoadSimulation = async (simulationId: string, simulationType: string) => {
    try {
      const simulation = await simulationService.getSimulationById(simulationId)
      if (simulation) {
        const encodedData = encodeURIComponent(JSON.stringify(simulation.data))
        router.push(`/${simulationType}?loadData=${encodedData}`)
      }
    } catch (error) {
      console.error("Error loading simulation:", error)
    }
  }

  const getSimulationIcon = (type: string) => {
    switch (type) {
      case "process":
        return <Cpu className="h-5 w-5" />
      case "memory":
        return <MemoryStick className="h-5 w-5" />
      case "disk":
        return <HardDrive className="h-5 w-5" />
      default:
        return <Cpu className="h-5 w-5" />
    }
  }

  const getSimulationTypeColor = (type: string) => {
    switch (type) {
      case "process":
        return "bg-blue-500/10 text-blue-500"
      case "memory":
        return "bg-green-500/10 text-green-500"
      case "disk":
        return "bg-purple-500/10 text-purple-500"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const handleLogout = () => {
    tokenService.clearTokens()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="pt-6 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <User className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Hello, {user.name}!</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-muted-foreground mt-2">
                    Welcome to your OS Simulator dashboard. Here you can view and manage your saved simulations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saved Simulations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saved Simulations ({simulations.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={loadSimulations} disabled={simulationsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${simulationsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {simulationsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : simulations.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-lg text-muted-foreground">No simulations saved yet</p>
                  <p className="text-muted-foreground mt-2">
                    Start by creating and saving simulations from the simulation pages
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {simulations.map((simulation) => (
                    <div
                      key={simulation.id}
                      className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-md ${getSimulationTypeColor(simulation.type)}`}>
                            {getSimulationIcon(simulation.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{simulation.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{simulation.type} Simulation</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSimulation(simulation.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(simulation.createdAt!).toLocaleDateString()}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => handleLoadSimulation(simulation.id!, simulation.type)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Open Simulation
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Test Results ({testResults.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadTestResults()
                  loadTestStatistics()
                }}
                disabled={testResultsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${testResultsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Statistics */}
              {testStats && testStats.totalTests > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-md border">
                    <p className="text-sm text-muted-foreground">Total Tests</p>
                    <p className="text-2xl font-bold">{testStats.totalTests}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md border">
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold">{testStats.averageScore || testStats.averagePercentage || 0}%</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md border">
                    <p className="text-sm text-muted-foreground">Best Score</p>
                    <p className="text-2xl font-bold">{testStats.highestScore}%</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md border">
                    <p className="text-sm text-muted-foreground">Correct Answers</p>
                    <p className="text-2xl font-bold">
                      {testStats.correctAnswers}/{testStats.totalQuestions}
                    </p>
                  </div>
                </div>
              )}

              {testResultsLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : testResults.length === 0 ? (
                <div className="text-center p-8">
                  <p className="text-lg text-muted-foreground">No test results yet</p>
                  <p className="text-muted-foreground mt-2">Take your first test to see results here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result: any) => (
                    <div key={result._id} className="p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-md">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">
                                {result.config?.difficulty
                                  ? result.config.difficulty.charAt(0).toUpperCase() + result.config.difficulty.slice(1)
                                  : "Mixed"}{" "}
                                Test
                              </span>
                              <Badge
                                variant={
                                  (result.summary?.percentage || 0) >= 80
                                    ? "default"
                                    : (result.summary?.percentage || 0) >= 60
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {result.summary?.percentage || 0}%
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(result.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {result.summary?.answeredQuestions || 0}/{result.summary?.totalQuestions || 0} questions
                              </span>
                              <span className="flex items-center gap-1">
                                <Trophy className="h-3 w-3" />
                                {result.summary?.correctAnswers || 0} correct
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewTestResult(result)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteTestResult(result._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <strong>Name:</strong> {user.name}
                </p>
                <p className="text-muted-foreground">
                  <strong>Email:</strong> {user.email}
                </p>
                <p className="text-muted-foreground">
                  <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive/50 hover:bg-destructive/10 bg-transparent"
                  onClick={() => router.push("/delete-account")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
