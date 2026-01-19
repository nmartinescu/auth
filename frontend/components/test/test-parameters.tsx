"use client"

import { QuestionCountInput } from "./question-count-input"
import { DifficultySelector } from "./difficulty-selector"
import type { TestParametersProps } from "@/types/test"

export function TestParameters({
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
}: TestParametersProps) {
  return (
    <div className="space-y-6">
      <QuestionCountInput value={questionCount} onChange={onQuestionCountChange} />
      <DifficultySelector value={difficulty} onChange={onDifficultyChange} />
    </div>
  )
}
