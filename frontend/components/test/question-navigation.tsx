"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Send, Eye } from "lucide-react"
import type { QuestionNavigationProps } from "@/types/test"

export function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  isReviewMode,
}: QuestionNavigationProps) {
  const isFirst = currentQuestion === 1
  const isLast = currentQuestion === totalQuestions

  return (
    <div className="flex justify-between items-center pt-4">
      <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <div className="flex gap-2">
        {isLast && !isReviewMode && (
          <Button onClick={onSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit Test
          </Button>
        )}
        {!isLast && (
          <Button onClick={onNext}>
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {isReviewMode && isLast && (
          <Button variant="outline" onClick={onSubmit}>
            <Eye className="h-4 w-4 mr-2" />
            Back to Results
          </Button>
        )}
      </div>
    </div>
  )
}
