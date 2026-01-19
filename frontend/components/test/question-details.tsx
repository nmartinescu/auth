"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Eye } from "lucide-react"
import { getQuestionTypeLabel, getDifficultyColor } from "@/lib/utils/test-utils"
import type { QuestionDetailsProps } from "@/types/test"

export function QuestionDetails({ results, onReviewQuestion }: QuestionDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.questionResults.map((qr, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                qr.isCorrect ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
              }`}
            >
              <div className="flex items-center gap-3">
                {qr.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">Question {index + 1}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {getQuestionTypeLabel(qr.question.type)}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(qr.question.difficulty)}`}>
                      {qr.question.difficulty}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        (qr.score ?? 0) >= 80
                          ? "border-green-500 text-green-600"
                          : (qr.score ?? 0) >= 60
                            ? "border-yellow-500 text-yellow-600"
                            : "border-red-500 text-red-600"
                      }`}
                    >
                      Score: {qr.score?.toFixed(0) ?? 0}%
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onReviewQuestion(index)}>
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
