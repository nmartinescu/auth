import type { Difficulty, Question, Answer, SchedulingAnswer, MemoryAnswer, DiskAnswer } from "@/types/test"

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case "easy":
      return "bg-green-500/10 text-green-500 border-green-500/20"
    case "medium":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    case "hard":
      return "bg-red-500/10 text-red-500 border-red-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function getDifficultyBadgeVariant(difficulty: Difficulty): "default" | "secondary" | "destructive" {
  switch (difficulty) {
    case "easy":
      return "secondary"
    case "medium":
      return "default"
    case "hard":
      return "destructive"
    default:
      return "default"
  }
}

export function formatTime(seconds: number | undefined | null): string {
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return "0:00"
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function isAnswerComplete(question: Question, answer: Answer): boolean {
  switch (question.type) {
    case "scheduling": {
      const schedAnswer = answer as SchedulingAnswer
      return schedAnswer.averageWaitingTime !== null && schedAnswer.averageTurnaroundTime !== null
    }
    case "memory": {
      const memAnswer = answer as MemoryAnswer
      return memAnswer.pageFaults !== null && memAnswer.hitRate !== null
    }
    case "disk": {
      const diskAnswer = answer as DiskAnswer
      return diskAnswer.totalSeekTime !== null && diskAnswer.sequence.length > 0
    }
    default:
      return false
  }
}

export function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case "scheduling":
      return "CPU Scheduling"
    case "memory":
      return "Memory Management"
    case "disk":
      return "Disk Scheduling"
    default:
      return type
  }
}
