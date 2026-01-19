"use client"

import { ResultsHeader } from "./results-header"
import { OverallResults } from "./overall-results"
import { QuestionDetails } from "./question-details"
import { ResultsActions } from "./results-actions"
import type { TestResultsProps } from "@/types/test"

export function TestResults({ results, onRetakeTest, onNewTest, onReviewQuestion }: TestResultsProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <ResultsHeader />
      <OverallResults results={results} />
      <QuestionDetails results={results} onReviewQuestion={onReviewQuestion} />
      <ResultsActions onRetakeTest={onRetakeTest} onNewTest={onNewTest} />
    </div>
  )
}
