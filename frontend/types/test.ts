export type QuestionType = "scheduling" | "memory" | "disk"
export type Difficulty = "easy" | "medium" | "hard"

export interface TestConfig {
  topics: ("cpu" | "memory" | "disk")[]
  questionCount: number
  difficulty: Difficulty
}

export interface IOOperation {
  start: number
  duration: number
}

export interface Process {
  id: number
  pid?: number
  arrivalTime: number
  burstTime: number
  priority?: number
  io: IOOperation[]
}

export interface ProcessResult {
  pid: number
  arrivalTime: number
  burstTime: number
  scheduledTime: number
  waitingTime: number
  turnaroundTime: number
  completionTime: number
}

export interface MemoryStep {
  pageReference: number
  frameState: (number | null)[]
  pageFault: boolean
}

export interface SchedulingQuestion {
  type: "scheduling"
  algorithm: string
  description: string
  processes: Process[]
  quantum?: number
  difficulty: Difficulty
}

export interface MemoryQuestion {
  type: "memory"
  algorithm: string
  description: string
  frameCount: number
  pageReferences: number[]
  difficulty: Difficulty
}

export interface DiskQuestion {
  type: "disk"
  algorithm: string
  description: string
  initialHeadPosition: number
  maxDiskSize: number
  requests: number[]
  headDirection?: "left" | "right"
  difficulty: Difficulty
}

export type Question = SchedulingQuestion | MemoryQuestion | DiskQuestion

export interface SchedulingAnswer {
  processResults: ProcessResult[]
  avgWaitingTime: number
  avgTurnaroundTime: number
  completionTime: number
}

export interface MemoryAnswer {
  memorySteps: MemoryStep[]
}

export interface DiskAnswer {
  diskSequence: number[]
}

export interface SchedulingCorrectSolution {
  processes: ProcessResult[]
  avgWaitingTime: number
  avgTurnaroundTime: number
  completionTime: number
}

export interface MemoryCorrectSolution {
  stepResults: MemoryStep[]
}

export interface DiskCorrectSolution {
  sequence: number[]
  totalSeekTime: number
  averageSeekTime: number
}

export type Answer = SchedulingAnswer | MemoryAnswer | DiskAnswer

export interface QuestionResult {
  question: Question
  userAnswer: Answer
  correctAnswer: SchedulingCorrectSolution | MemoryCorrectSolution | DiskCorrectSolution
  isCorrect: boolean
  score?: number
}

export interface TestSession {
  id: string
  config: TestConfig
  questions: Question[]
  currentQuestionIndex: number
  answers: Answer[]
  startTime: Date
  endTime?: Date
}

export interface TestResults {
  totalQuestions: number
  correctAnswers: number
  score: number
  timeSpent: number
  questionResults: QuestionResult[]
}

export interface QuestionHeaderProps {
  questionNumber: number
  totalQuestions: number
  difficulty: Difficulty
}

export interface TopicSelectorProps {
  selectedTopics: { cpu: boolean; memory: boolean; disk: boolean }
  onTopicChange: (topic: "cpu" | "memory" | "disk") => void
}

export interface QuestionCountInputProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export interface DifficultySelectorProps {
  value: Difficulty
  onChange: (value: Difficulty) => void
}

export interface TestParametersProps {
  questionCount: number
  onQuestionCountChange: (value: number) => void
  difficulty: Difficulty
  onDifficultyChange: (value: Difficulty) => void
}

export interface QuestionInfoProps {
  question: Question
}

export interface SchedulingAnswerProps {
  processResults: ProcessResult[]
  onProcessResultsChange: (results: ProcessResult[]) => void
  avgWaitingTime: number
  avgTurnaroundTime: number
  completionTime: number
  onAvgWaitingTimeChange: (value: number) => void
  onAvgTurnaroundTimeChange: (value: number) => void
  onCompletionTimeChange: (value: number) => void
  reviewMode?: boolean
  correctSolution?: SchedulingCorrectSolution
  userScore?: number
}

export interface MemoryAnswerProps {
  memorySteps: MemoryStep[]
  frameCount: number
  onMemoryStepsChange: (steps: MemoryStep[]) => void
  reviewMode?: boolean
  correctSolution?: MemoryCorrectSolution
  userScore?: number
}

export interface DiskAnswerProps {
  diskSequence: number[]
  maxDiskSize: number
  initialHeadPosition: number
  requests: number[]
  onDiskSequenceChange: (sequence: number[]) => void
  reviewMode?: boolean
  correctSolution?: DiskCorrectSolution
  userScore?: number
}

export interface QuestionNavigationProps {
  currentQuestion: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isReviewMode?: boolean
}

export interface ResultsHeaderProps {
  primaryTextColor?: string
  textColor?: string
}

export interface OverallResultsProps {
  results: TestResults
}

export interface QuestionDetailsProps {
  results: TestResults
  onReviewQuestion: (index: number) => void
}

export interface ResultsActionsProps {
  onRetakeTest: () => void
  onNewTest: () => void
  onSaveResults?: () => void
  isSaving?: boolean
}

export interface TestConfigurationProps {
  onTestStart: (session: TestSession) => void
}

export interface TestQuestionComponentProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  answer: Answer
  onAnswerChange: (answer: Answer) => void
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isReviewMode?: boolean
  correctAnswer?: SchedulingCorrectSolution | MemoryCorrectSolution | DiskCorrectSolution
  userScore?: number
}

export interface TestResultsProps {
  results: TestResults
  onRetakeTest: () => void
  onNewTest: () => void
  onReviewQuestion: (index: number) => void
}

export type TestContainerProps = {}
