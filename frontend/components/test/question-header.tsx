import { Badge } from "@/components/ui/badge"
import { getDifficultyColor } from "@/lib/utils/test-utils"
import type { QuestionHeaderProps } from "@/types/test"

export function QuestionHeader({ questionNumber, totalQuestions, difficulty }: QuestionHeaderProps) {
  const progress = (questionNumber / totalQuestions) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Question {questionNumber} of {totalQuestions}
        </h2>
        <Badge className={getDifficultyColor(difficulty)} variant="outline">
          {difficulty.toUpperCase()}
        </Badge>
      </div>
      <div className="h-1 bg-muted rounded-md mb-4">
        <div
          className="h-full bg-primary rounded-md transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
