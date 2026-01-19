"use client"

import { QuestionHeader } from "./question-header"
import { QuestionInfo } from "./question-info"
import { SchedulingAnswer } from "./scheduling-answer"
import { MemoryAnswer } from "./memory-answer"
import { DiskAnswer } from "./disk-answer"
import { QuestionNavigation } from "./question-navigation"
import type {
  TestQuestionComponentProps,
  MemoryQuestion,
  DiskQuestion,
  SchedulingAnswer as SchedulingAnswerType,
  MemoryAnswer as MemoryAnswerType,
  DiskAnswer as DiskAnswerType,
  SchedulingCorrectSolution,
  MemoryCorrectSolution,
  DiskCorrectSolution,
} from "@/types/test"

export function TestQuestionComponent({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  onPrevious,
  onNext,
  onSubmit,
  isReviewMode,
  correctAnswer,
  userScore,
}: TestQuestionComponentProps) {
  const renderAnswerComponent = () => {
    switch (question.type) {
      case "scheduling": {
        const schedulingAnswer = answer as SchedulingAnswerType
        const schedulingCorrect = correctAnswer as SchedulingCorrectSolution | undefined
        return (
          <SchedulingAnswer
            processResults={schedulingAnswer.processResults}
            onProcessResultsChange={(results) => onAnswerChange({ ...schedulingAnswer, processResults: results })}
            avgWaitingTime={schedulingAnswer.avgWaitingTime}
            avgTurnaroundTime={schedulingAnswer.avgTurnaroundTime}
            completionTime={schedulingAnswer.completionTime}
            onAvgWaitingTimeChange={(value) => onAnswerChange({ ...schedulingAnswer, avgWaitingTime: value })}
            onAvgTurnaroundTimeChange={(value) => onAnswerChange({ ...schedulingAnswer, avgTurnaroundTime: value })}
            onCompletionTimeChange={(value) => onAnswerChange({ ...schedulingAnswer, completionTime: value })}
            reviewMode={isReviewMode}
            correctSolution={schedulingCorrect}
            userScore={userScore}
          />
        )
      }
      case "memory": {
        const memoryQuestion = question as MemoryQuestion
        const memoryAnswer = answer as MemoryAnswerType
        const memoryCorrect = correctAnswer as MemoryCorrectSolution | undefined
        return (
          <MemoryAnswer
            memorySteps={memoryAnswer.memorySteps}
            frameCount={memoryQuestion.frameCount}
            onMemoryStepsChange={(steps) => onAnswerChange({ ...memoryAnswer, memorySteps: steps })}
            reviewMode={isReviewMode}
            correctSolution={memoryCorrect}
            userScore={userScore}
          />
        )
      }
      case "disk": {
        const diskQuestion = question as DiskQuestion
        const diskAnswer = answer as DiskAnswerType
        const diskCorrect = correctAnswer as DiskCorrectSolution | undefined
        return (
          <DiskAnswer
            diskSequence={diskAnswer.diskSequence}
            maxDiskSize={diskQuestion.maxDiskSize}
            initialHeadPosition={diskQuestion.initialHeadPosition}
            requests={diskQuestion.requests}
            onDiskSequenceChange={(sequence) => onAnswerChange({ ...diskAnswer, diskSequence: sequence })}
            reviewMode={isReviewMode}
            correctSolution={diskCorrect}
            userScore={userScore}
          />
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <QuestionHeader
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        difficulty={question.difficulty}
      />
      <QuestionInfo question={question} />
      {renderAnswerComponent()}
      <QuestionNavigation
        currentQuestion={questionNumber}
        totalQuestions={totalQuestions}
        onPrevious={onPrevious}
        onNext={onNext}
        onSubmit={onSubmit}
        isReviewMode={isReviewMode}
      />
    </div>
  )
}
