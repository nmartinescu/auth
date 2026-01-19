import apiClient from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/config/constants"
import { testResultsService } from "./test-results-service"
import type {
  TestConfig,
  TestSession,
  Question,
  Answer,
  TestResults,
  SchedulingAnswer,
  MemoryAnswer,
  DiskAnswer,
  SchedulingCorrectSolution,
  MemoryCorrectSolution,
  DiskCorrectSolution,
  QuestionResult,
  SchedulingQuestion,
  MemoryQuestion,
  DiskQuestion,
  Process,
  ProcessResult,
  MemoryStep,
} from "@/types/test"
import { MemoryAnswer } from "@/components/test/memory-answer"

// Algorithm name mappings for API compatibility
const MEMORY_ALGORITHM_MAP: Record<string, string> = {
  OPT: "optimal",
  OPTIMAL: "optimal",
  optimal: "optimal",
  FIFO: "fifo",
  fifo: "fifo",
  LRU: "lru",
  lru: "lru",
  LFU: "lfu",
  lfu: "lfu",
  MRU: "mru",
  mru: "mru",
  "SECOND-CHANCE": "second-chance",
  "second-chance": "second-chance",
  CLOCK: "clock",
  clock: "clock",
}

class TestSessionManager {
  private currentSession: TestSession | null = null

  async startTest(config: TestConfig): Promise<TestSession> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.TEST_GENERATION.GENERATE, {
        numQuestions: config.questionCount,
        difficulty: config.difficulty,
        includeScheduling: config.topics.includes("cpu") || config.topics.includes("scheduling"),
        includeMemory: config.topics.includes("memory"),
        includeDisk: config.topics.includes("disk"),
      })

      const { sessionId, questions } = response.data.data

      this.currentSession = {
        id: sessionId,
        config,
        questions,
        currentQuestionIndex: 0,
        answers: questions.map((q: Question) => this.createInitialAnswer(q)),
        startTime: new Date(),
      }

      return this.currentSession
    } catch (error) {
      console.error("Failed to start test:", error)
      throw error
    }
  }

  private createInitialAnswer(question: Question): Answer {
    switch (question.type) {
      case "scheduling": {
        const q = question as SchedulingQuestion
        const processes = q.processes || []
        const processResults: ProcessResult[] = processes.map((p: Process) => ({
          pid: p.id ?? p.pid ?? 0,
          arrivalTime: p.arrivalTime ?? 0,
          burstTime: p.burstTime ?? 0,
          scheduledTime: 0,
          waitingTime: 0,
          turnaroundTime: 0,
          completionTime: 0,
        }))
        return {
          processResults,
          avgWaitingTime: 0,
          avgTurnaroundTime: 0,
          completionTime: 0,
        } as SchedulingAnswer
      }
      case "memory": {
        const q = question as MemoryQuestion
        const pageRefs: number[] = q.pageReferences || (q as any).pages || []
        const frameCount: number = q.frameCount || (q as any).frames || 3
        const memorySteps: MemoryStep[] = pageRefs.map((pageRef: number) => ({
          pageReference: pageRef,
          frameState: Array(frameCount).fill(-1), // Use -1 instead of null for empty frames
          pageFault: false,
        }))
        return { memorySteps } as MemoryAnswer
      }
      case "disk": {
        const q = question as DiskQuestion
        const headPos: number = q.initialHeadPosition ?? (q as any).headPosition ?? 50
        const requests: number[] = q.requests || (q as any).cylinders || []
        return {
          diskSequence: [headPos, ...Array(requests.length).fill(0)],
        } as DiskAnswer
      }
      default:
        return { processResults: [], avgWaitingTime: 0, avgTurnaroundTime: 0, completionTime: 0 } as SchedulingAnswer
    }
  }

  getCurrentSession(): TestSession | null {
    return this.currentSession
  }

  updateAnswer(index: number, answer: Answer): void {
    if (this.currentSession) {
      this.currentSession.answers[index] = answer
    }
  }

  private async computeCorrectAnswer(
    question: Question,
  ): Promise<SchedulingCorrectSolution | MemoryCorrectSolution | DiskCorrectSolution | null> {
    try {
      console.log(`[v0] Computing correct answer for question type: ${question.type}`)
      console.log(`[v0] Question data:`, JSON.stringify(question, null, 2))

      switch (question.type) {
        case "scheduling": {
          const schedQ = question as SchedulingQuestion
          const processes = (schedQ.processes || []).map((p: Process) => ({
            id: p.id ?? p.pid ?? 0,
            arrivalTime: p.arrivalTime ?? 0,
            burstTime: p.burstTime ?? 0,
            io: p.io || [],
          }))

          const requestData: Record<string, unknown> = {
            algorithm: schedQ.algorithm,
            processes,
          }

          if (schedQ.algorithm === "RR" && (schedQ as any).quantum) {
            requestData.quantum = (schedQ as any).quantum
          }
          if (schedQ.algorithm === "MLFQ") {
            requestData.queues = (schedQ as any).queues || 3
            requestData.quantums = (schedQ as any).quantums || [2, 4, 8]
            requestData.allotment = (schedQ as any).allotment || 10
          }

          console.log(`[v0] Calling CPU scheduling API with:`, JSON.stringify(requestData, null, 2))
          const response = await apiClient.post(API_ENDPOINTS.CPU.SIMULATE, requestData)
          console.log(`[v0] CPU scheduling API response:`, JSON.stringify(response.data, null, 2))

          const data = response.data?.data || response.data
          const solution = data?.solution || []
          const metrics = data?.metrics || {}

          // Try to get process results from multiple possible locations
          let processResults: any[] = []

          // Option 1: From the last step's graphicTable
          if (solution.length > 0) {
            const finalStep = solution[solution.length - 1]
            if (finalStep?.graphicTable && finalStep.graphicTable.length > 0) {
              processResults = finalStep.graphicTable
              console.log(`[v0] Found graphicTable in final step:`, JSON.stringify(processResults, null, 2))
            }
          }

          // Option 2: From data.graphicTable directly
          if (processResults.length === 0 && data?.graphicTable) {
            processResults = data.graphicTable
            console.log(`[v0] Found graphicTable in data:`, JSON.stringify(processResults, null, 2))
          }

          // Option 3: From data.processes with computed values
          if (processResults.length === 0 && data?.processes) {
            processResults = data.processes
            console.log(`[v0] Found processes in data:`, JSON.stringify(processResults, null, 2))
          }

          // Option 4: From metrics.processes
          if (processResults.length === 0 && metrics?.processes) {
            processResults = metrics.processes
            console.log(`[v0] Found processes in metrics:`, JSON.stringify(processResults, null, 2))
          }

          const transformedProcesses: ProcessResult[] = processResults.map((row: Record<string, unknown>) => {
            const pid = (row.pid ?? row.id ?? row.processId ?? 0) as number
            const originalProcess = processes.find((p) => p.id === pid)
            return {
              pid,
              arrivalTime: (row.arrival ?? row.arrivalTime ?? originalProcess?.arrivalTime ?? 0) as number,
              burstTime: (row.burstTime ?? originalProcess?.burstTime ?? 0) as number,
              scheduledTime: (row.scheduledTime ?? row.startTime ?? row.responseTime ?? row.start ?? 0) as number,
              waitingTime: (row.waitingTime ?? row.waiting ?? 0) as number,
              turnaroundTime: (row.turnaroundTime ?? row.turnaround ?? 0) as number,
              completionTime: (row.endTime ?? row.completionTime ?? row.completion ?? row.end ?? 0) as number,
            }
          })

          const result: SchedulingCorrectSolution = {
            processes: transformedProcesses,
            avgWaitingTime: metrics.averageWaitingTime ?? metrics.avgWaitingTime ?? data?.averageWaitingTime ?? 0,
            avgTurnaroundTime:
              metrics.averageTurnaroundTime ?? metrics.avgTurnaroundTime ?? data?.averageTurnaroundTime ?? 0,
            completionTime:
              metrics.totalTime ??
              metrics.completionTime ??
              Math.max(...transformedProcesses.map((p: any) => p.completionTime || 0), 0),
          }

          console.log(`[v0] Transformed scheduling correct answer:`, JSON.stringify(result, null, 2))
          return result
        }

        case "memory": {
          const memQ = question as MemoryQuestion
          // Map algorithm name for API compatibility (OPT -> optimal)
          const algorithmName = MEMORY_ALGORITHM_MAP[memQ.algorithm] || memQ.algorithm.toLowerCase()
          const requestData = {
            selectedAlgorithm: [algorithmName],
            frameCount: memQ.frameCount || (memQ as any).frames || 3,
            pageReferences: memQ.pageReferences || (memQ as any).pages || [],
          }

          console.log(`[v0] Calling memory management API with:`, JSON.stringify(requestData, null, 2))
          const response = await apiClient.post(API_ENDPOINTS.MEMORY.SIMULATE, requestData)
          console.log(`[v0] Memory management API response:`, JSON.stringify(response.data, null, 2))

          const data = response.data?.data || response.data

          // Try multiple locations for steps
          const steps = data?.customData || []

          console.log(`[v0] Found ${steps.length} memory steps`)

          const pageRefs = requestData.pageReferences as number[]
          const stepResults: MemoryStep[] = steps.map((step: Record<string, unknown>, index: number) => ({
            frameState: (step.frames ?? []) as (number | null)[],
            pageFault: (step.pageFault ?? false) as boolean,
          }))
          stepResults.forEach(step => {
            step.frameState = step.frameState.map(v => (v === -1 ? 0 : v))
          })

          const result: MemoryCorrectSolution = { stepResults }
          console.log(`[v0] Transformed memory correct answer:`, JSON.stringify(result, null, 2))
          return result
        }

        case "disk": {
          const diskQ = question as DiskQuestion
          const requestData = {
            algorithm: diskQ.algorithm,
            selectedAlgorithm: diskQ.algorithm,
            initialHeadPosition: diskQ.initialHeadPosition ?? (diskQ as any).headPosition ?? 50,
            requests: diskQ.requests || (diskQ as any).cylinders || [],
            direction: diskQ.headDirection || (diskQ as any).direction || "right",
            maxDiskSize: diskQ.maxDiskSize || 200,
          }

          console.log(`[v0] Calling disk scheduling API with:`, JSON.stringify(requestData, null, 2))
          const response = await apiClient.post(API_ENDPOINTS.DISK.SIMULATE, requestData)
          console.log(`[v0] Disk scheduling API response:`, JSON.stringify(response.data, null, 2))

          const data = response.data?.data || response.data

          const result: DiskCorrectSolution = {
            sequence: data?.sequence || [],
            totalSeekTime: data?.totalSeekTime ?? 0,
            averageSeekTime: data?.averageSeekTime ?? 0,
          }

          console.log(`[v0] Transformed disk correct answer:`, JSON.stringify(result, null, 2))
          return result
        }

        default:
          console.warn(`[v0] Unknown question type: ${question.type}`)
          return null
      }
    } catch (error) {
      console.error(`[v0] Failed to compute correct answer for ${question.type}:`, error)
      return null
    }
  }

  async submitTest(): Promise<TestResults> {
    if (!this.currentSession) {
      throw new Error("No active test session")
    }

    try {
      this.currentSession.endTime = new Date()

      console.log(`[v0] Submitting test with ${this.currentSession.questions.length} questions`)

      const questionResults: QuestionResult[] = []

      for (let index = 0; index < this.currentSession.questions.length; index++) {
        const question = this.currentSession.questions[index]
        const userAnswer = this.currentSession.answers[index]

        if ("memorySteps" in userAnswer) {
          userAnswer.memorySteps.forEach(step => {
            step.frameState = step.frameState.map(v => (v === -1 ? 0 : v))
          })
        }


        console.log(`[v0] === Processing Question ${index + 1} (${question.type}) ===`)

        // Call simulation API to get the actual computed correct answer
        const correctAnswer = await this.computeCorrectAnswer(question)
        console.log("CORRECT", correctAnswer)

        console.log(`[v0] User answer:`, JSON.stringify(userAnswer, null, 2))
        console.log(`[v0] Correct answer:`, JSON.stringify(correctAnswer, null, 2))

        const { score, isCorrect } = this.calculateScore(question.type, userAnswer, correctAnswer)
        const roundedScore = Math.round(score * 100) / 100

        console.log(`[v0] Score: ${roundedScore}, isCorrect: ${isCorrect}`)

        questionResults.push({
          question,
          userAnswer,
          correctAnswer,
          isCorrect,
          score: roundedScore,
        })
      }

      const totalScore = questionResults.reduce((sum, qr) => sum + (qr.score || 0), 0)
      const correctCount = questionResults.filter((qr) => qr.isCorrect).length
      const finalScore = Math.round((totalScore / this.currentSession.questions.length) * 100) / 100

      const durationMs = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime()
      const durationSeconds = Math.floor(durationMs / 1000)

      const results: TestResults = {
        totalQuestions: this.currentSession.questions.length,
        correctAnswers: correctCount,
        score: finalScore,
        timeSpent: durationSeconds,
        questionResults,
      }

      console.log(
        `[v0] Final results:`,
        JSON.stringify(
          {
            totalQuestions: results.totalQuestions,
            correctAnswers: results.correctAnswers,
            score: results.score,
          },
          null,
          2,
        ),
      )

      try {
        const testResultToSave = {
          sessionId: this.currentSession.id,
          config: {
            numQuestions: this.currentSession.config.questionCount,
            difficulty: this.currentSession.config.difficulty,
            includeScheduling:
              this.currentSession.config.topics.includes("cpu") ||
              this.currentSession.config.topics.includes("scheduling"),
            includeMemory: this.currentSession.config.topics.includes("memory"),
            includeDisk: this.currentSession.config.topics.includes("disk"),
          },
          questions: this.currentSession.questions,
          userAnswers: questionResults.map((qr) => ({
            ...qr.userAnswer,
            isCorrect: qr.isCorrect,
            score: qr.score,
            correctAnswer: qr.correctAnswer,
          })),
          score: finalScore,
          startTime: this.currentSession.startTime.toISOString(),
          endTime: this.currentSession.endTime.toISOString(),
          duration: durationSeconds, // Added duration field
          summary: {
            totalQuestions: results.totalQuestions,
            correctAnswers: results.correctAnswers,
            percentage: finalScore,
            totalScore: finalScore, // Required by backend
            answeredQuestions: results.totalQuestions, // Required by backend - all questions are answered on submit
          },
        }

        console.log(`[v0] Saving test result to backend...`)
        console.log(`[v0] Payload:`, JSON.stringify(testResultToSave, null, 2))
        const savedResult = await testResultsService.saveTestResult(testResultToSave)
        if (savedResult) {
          console.log(`[v0] Test result saved successfully:`, savedResult._id || savedResult.id)
        } else {
          console.warn(`[v0] Test result may not have been saved`)
        }
      } catch (saveError) {
        console.error(`[v0] Failed to save test result:`, saveError)
        // Don't throw - we still want to show results even if save fails
      }

      // Cleanup session on backend
      try {
        await apiClient.delete(`${API_ENDPOINTS.TEST_GENERATION.DELETE_SESSION}/${this.currentSession.id}`)
      } catch (e) {
        console.warn("Failed to cleanup test session:", e)
      }

      return results
    } catch (error) {
      console.error("Failed to submit test:", error)
      throw error
    }
  }

  private calculateScore(
    type: string,
    userAnswer: Answer,
    correctAnswer: SchedulingCorrectSolution | MemoryCorrectSolution | DiskCorrectSolution | null,
  ): { score: number; isCorrect: boolean } {
    const tolerance = 0.5

    if (!correctAnswer) {
      console.warn(`[v0] calculateScore: correctAnswer is null for type ${type}`)
      return { score: 0, isCorrect: false }
    }

    switch (type) {
      case "scheduling": {
        const user = userAnswer as SchedulingAnswer
        const correct = correctAnswer as SchedulingCorrectSolution

        if (!correct.processes || correct.processes.length === 0) {
          console.warn(`[v0] No correct processes found`)
          return { score: 0, isCorrect: false }
        }

        let totalPoints = 0
        let earnedPoints = 0

        // Compare each process (60% weight)
        const fieldsToCheck = ["scheduledTime", "waitingTime", "turnaroundTime", "completionTime"] as const
        const pointsPerField = 60 / (correct.processes.length * fieldsToCheck.length)

        for (const correctProcess of correct.processes) {
          const userProcess = user.processResults?.find((p) => p.pid === correctProcess.pid)

          for (const field of fieldsToCheck) {
            totalPoints += pointsPerField
            if (userProcess) {
              const userVal = userProcess[field] ?? 0
              const correctVal = correctProcess[field] ?? 0
              console.log(`[v0] P${correctProcess.pid}.${field}: user=${userVal}, correct=${correctVal}`)
              if (Math.abs(userVal - correctVal) <= tolerance) {
                earnedPoints += pointsPerField
              }
            }
          }
        }

        // Compare averages (40% weight)
        totalPoints += 20
        const userAvgWT = user.avgWaitingTime ?? 0
        const correctAvgWT = correct.avgWaitingTime ?? 0
        console.log(`[v0] avgWaitingTime: user=${userAvgWT}, correct=${correctAvgWT}`)
        if (Math.abs(userAvgWT - correctAvgWT) <= tolerance) {
          earnedPoints += 20
        }

        totalPoints += 20
        const userAvgTAT = user.avgTurnaroundTime ?? 0
        const correctAvgTAT = correct.avgTurnaroundTime ?? 0
        console.log(`[v0] avgTurnaroundTime: user=${userAvgTAT}, correct=${correctAvgTAT}`)
        if (Math.abs(userAvgTAT - correctAvgTAT) <= tolerance) {
          earnedPoints += 20
        }

        const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
        console.log(
          `[v0] Scheduling score: ${earnedPoints.toFixed(2)}/${totalPoints.toFixed(2)} = ${score.toFixed(2)}%`,
        )
        return { score, isCorrect: score >= 80 }
      }

      case "memory": {
        const user = userAnswer as MemoryAnswer
        const correct = correctAnswer as MemoryCorrectSolution

        if (!correct.stepResults || correct.stepResults.length === 0) {
          console.warn(`[v0] No correct step results found`)
          return { score: 0, isCorrect: false }
        }

        let totalPoints = 0
        let earnedPoints = 0

        for (let i = 0; i < correct.stepResults.length; i++) {
          const userStep = user.memorySteps?.[i]
          const correctStep = correct.stepResults[i]

          // Frame state comparison (70% weight)
          const frameWeight = 70 / correct.stepResults.length
          totalPoints += frameWeight

          if (userStep) {
            const userFrames = (userStep.frameState || []).map((f: any) => (f === null || f === undefined ? -1 : f))
            const correctFrames = (correctStep.frameState || []).map((f: any) =>
              f === null || f === undefined ? -1 : f,
            )

            console.log(
              `[v0] Step ${i} frames: user=${JSON.stringify(userFrames)}, correct=${JSON.stringify(correctFrames)}`,
            )

            if (JSON.stringify(userFrames) === JSON.stringify(correctFrames)) {
              earnedPoints += frameWeight
            }
          }

          // Page fault comparison (30% weight)
          const faultWeight = 30 / correct.stepResults.length
          totalPoints += faultWeight

          if (userStep) {
            console.log(`[v0] Step ${i} fault: user=${userStep.pageFault}, correct=${correctStep.pageFault}`)
            if (userStep.pageFault === correctStep.pageFault) {
              earnedPoints += faultWeight
            }
          }
        }

        const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
        console.log(`[v0] Memory score: ${earnedPoints.toFixed(2)}/${totalPoints.toFixed(2)} = ${score.toFixed(2)}%`)
        return { score, isCorrect: score >= 80 }
      }

      case "disk": {
        const user = userAnswer as DiskAnswer
        const correct = correctAnswer as DiskCorrectSolution

        if (!correct.sequence || correct.sequence.length === 0) {
          console.warn(`[v0] No correct sequence found`)
          return { score: 0, isCorrect: false }
        }

        console.log(
          `[v0] Disk sequence: user=${JSON.stringify(user.diskSequence)}, correct=${JSON.stringify(correct.sequence)}`,
        )

        let correctCount = 0
        const totalPositions = correct.sequence.length

        for (let i = 0; i < totalPositions; i++) {
          if (user.diskSequence?.[i] === correct.sequence[i]) {
            correctCount++
          }
        }

        const score = (correctCount / totalPositions) * 100
        console.log(`[v0] Disk score: ${correctCount}/${totalPositions} = ${score.toFixed(2)}%`)
        return { score, isCorrect: score >= 80 }
      }

      default:
        return { score: 0, isCorrect: false }
    }
  }

  clearSession(): void {
    this.currentSession = null
  }
}

export const testSessionManager = new TestSessionManager()
