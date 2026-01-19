"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TestConfiguration } from "./test-configuration"
import { TestQuestionComponent } from "./test-question-component"
import { TestResults } from "./test-results"
import { testSessionManager } from "@/lib/services/test-session-manager"
import type {
  TestSession,
  TestResults as TestResultsType,
  Answer,
  SchedulingQuestion,
  MemoryQuestion,
  DiskQuestion,
  SchedulingAnswer,
  MemoryAnswer,
  DiskAnswer,
  QuestionResult,
} from "@/types/test"

type TestState = "config" | "taking" | "results" | "review"

const createInitialAnswer = (question: SchedulingQuestion | MemoryQuestion | DiskQuestion): Answer => {
  switch (question.type) {
    case "scheduling": {
      const q = question as SchedulingQuestion
      return {
        processResults: q.processes.map((p) => ({
          pid: p.id,
          arrivalTime: p.arrivalTime,
          burstTime: p.burstTime,
          scheduledTime: 0,
          waitingTime: 0,
          turnaroundTime: 0,
          completionTime: 0,
        })),
        avgWaitingTime: 0,
        avgTurnaroundTime: 0,
        completionTime: 0,
      } as SchedulingAnswer
    }
    case "memory": {
      const q = question as MemoryQuestion
      return {
        memorySteps: q.pageReferences.map((pageRef) => ({
          pageReference: pageRef,
          frameState: Array(q.frameCount).fill(null),
          pageFault: false,
        })),
      } as MemoryAnswer
    }
    case "disk": {
      const q = question as DiskQuestion
      return {
        diskSequence: [q.initialHeadPosition, ...Array(q.requests.length).fill(0)],
      } as DiskAnswer
    }
  }
}

export function TestContainer() {
  const searchParams = useSearchParams()
  const [testState, setTestState] = useState<TestState>("config")
  const [session, setSession] = useState<TestSession | null>(null)
  const [results, setResults] = useState<TestResultsType | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState<number | null>(null)

  useEffect(() => {
    const isReview = searchParams.get("review") === "true"
    if (isReview) {
      try {
        const savedResult = sessionStorage.getItem("reviewTestResult")
        if (savedResult) {
          const testResult = JSON.parse(savedResult)

          let timeSpent = 0
          if (testResult.duration) {
            timeSpent = testResult.duration
          } else if (testResult.startTime && testResult.endTime) {
            timeSpent = Math.floor(
              (new Date(testResult.endTime).getTime() - new Date(testResult.startTime).getTime()) / 1000,
            )
          }

          // Transform saved test result to TestResults format
          const transformedResults: TestResultsType = {
            sessionId: testResult.sessionId || "saved-review",
            score: testResult.score || 0,
            totalQuestions: testResult.questions?.length || 0,
            correctAnswers: testResult.summary?.correctAnswers || 0,
            timeSpent: timeSpent,
            startTime: new Date(testResult.startTime),
            endTime: new Date(testResult.endTime),
            questionResults: (testResult.questions || []).map((q: any, index: number) => {
              const userAnswer = testResult.userAnswers?.[index]
              const correctAnswer = userAnswer?.correctAnswer || testResult.correctAnswers?.[index] || null
              return {
                question: q,
                userAnswer: userAnswer || createInitialAnswer(q),
                correctAnswer: correctAnswer,
                isCorrect: userAnswer?.isCorrect || false,
                score: userAnswer?.score || 0,
              } as QuestionResult
            }),
          }

          setResults(transformedResults)
          setTestState("results")

          // Clean up sessionStorage
          sessionStorage.removeItem("reviewTestResult")
        }
      } catch (error) {
        console.error("Error loading saved test result:", error)
      }
    }
  }, [searchParams])

  const handleTestStart = (newSession: TestSession) => {
    const initializedSession = {
      ...newSession,
      answers: newSession.questions.map((q) => createInitialAnswer(q)),
    }
    setSession(initializedSession)
    setCurrentQuestionIndex(0)
    setTestState("taking")
  }

  const handleAnswerChange = (answer: Answer) => {
    if (session) {
      testSessionManager.updateAnswer(currentQuestionIndex, answer)
      setSession({
        ...session,
        answers: session.answers.map((a, i) => (i === currentQuestionIndex ? answer : a)),
      })
    }
  }

  const handlePrevious = () => {
    if (testState === "review" && reviewQuestionIndex !== null) {
      if (reviewQuestionIndex > 0) {
        setReviewQuestionIndex(reviewQuestionIndex - 1)
      }
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleNext = () => {
    if (testState === "review" && reviewQuestionIndex !== null && results) {
      if (reviewQuestionIndex < results.questionResults.length - 1) {
        setReviewQuestionIndex(reviewQuestionIndex + 1)
      }
    } else if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handleSubmit = async () => {
    if (testState === "review") {
      setTestState("results")
      setReviewQuestionIndex(null)
      return
    }

    try {
      const testResults = await testSessionManager.submitTest()
      setResults(testResults)
      setTestState("results")
    } catch (error) {
      console.error("Failed to submit test:", error)
    }
  }

  const handleRetakeTest = () => {
    if (session) {
      handleTestStart({
        ...session,
        answers: session.questions.map((q) => createInitialAnswer(q)),
        startTime: new Date(),
      })
    }
  }

  const handleNewTest = () => {
    setSession(null)
    setResults(null)
    setCurrentQuestionIndex(0)
    setReviewQuestionIndex(null)
    testSessionManager.clearSession()
    setTestState("config")
  }

  const handleReviewQuestion = (index: number) => {
    setReviewQuestionIndex(index)
    setTestState("review")
  }

  if (testState === "config") {
    return <TestConfiguration onTestStart={handleTestStart} />
  }

  if (testState === "results" && results) {
    return (
      <TestResults
        results={results}
        onRetakeTest={handleRetakeTest}
        onNewTest={handleNewTest}
        onReviewQuestion={handleReviewQuestion}
      />
    )
  }

  if (testState === "review" && results && reviewQuestionIndex !== null) {
    const questionResult = results.questionResults[reviewQuestionIndex]
    if (!questionResult) {
      return null
    }

    return (
      <TestQuestionComponent
        question={questionResult.question}
        questionNumber={reviewQuestionIndex + 1}
        totalQuestions={results.questionResults.length}
        answer={questionResult.userAnswer}
        onAnswerChange={() => {}} // No-op in review mode
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isReviewMode={true}
        correctAnswer={questionResult.correctAnswer}
        userScore={questionResult.score}
      />
    )
  }

  // Taking mode requires session
  if (testState === "taking" && session) {
    const question = session.questions[currentQuestionIndex]
    const answer = session.answers[currentQuestionIndex]

    return (
      <TestQuestionComponent
        question={question}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={session.questions.length}
        answer={answer}
        onAnswerChange={handleAnswerChange}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isReviewMode={false}
      />
    )
  }

  return null
}
