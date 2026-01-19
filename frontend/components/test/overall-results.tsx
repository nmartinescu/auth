import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, CheckCircle, XCircle } from "lucide-react"
import { formatTime } from "@/lib/utils/test-utils"
import type { OverallResultsProps } from "@/types/test"

export function OverallResults({ results }: OverallResultsProps) {
  const { totalQuestions, correctAnswers, score, timeSpent } = results
  const incorrectAnswers = totalQuestions - correctAnswers
  const safeScore = score ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Overall Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-primary mb-2">{safeScore.toFixed(0)}%</div>
          <Progress value={safeScore} className="h-3" />
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-green-500">
              <CheckCircle className="h-4 w-4" />
              <span className="text-2xl font-bold">{correctAnswers ?? 0}</span>
            </div>
            <p className="text-sm text-muted-foreground">Correct</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-red-500">
              <XCircle className="h-4 w-4" />
              <span className="text-2xl font-bold">{incorrectAnswers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Incorrect</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">{formatTime(timeSpent)}</span>
            </div>
            <p className="text-sm text-muted-foreground">Time</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
