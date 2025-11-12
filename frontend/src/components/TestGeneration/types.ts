export type TestState = 'config' | 'taking' | 'review' | 'results';

export interface TestPageProps {
    onTestStart?: (sessionId: string) => void;
}

export interface TestQuestionComponentProps {
    question: TestQuestion;
    questionNumber: number;
    totalQuestions: number;
    onSubmitAnswer: (solution: TestSolution | MemoryTestSolution | DiskTestSolution) => void;
    onNextQuestion: () => void;
    onPreviousQuestion: () => void;
    onFinishTest: () => void;
    hasNext: boolean;
    hasPrevious: boolean;
    initialAnswer?: TestSolution | MemoryTestSolution | DiskTestSolution;
    reviewMode?: boolean;
    correctSolution?: TestSolution | MemoryTestSolution | DiskTestSolution;
    userScore?: number;
}

export interface TestQuestion {
    id: string;
    type: 'scheduling' | 'memory' | 'disk';
    difficulty: 'easy' | 'medium' | 'hard';
    algorithm: 'FCFS' | 'SJF' | 'RR' | 'MLFQ' | 'FIFO' | 'LRU' | 'OPT' | 'SSTF' | 'SCAN' | 'C-SCAN' | 'LOOK' | 'C-LOOK';
    quantum?: number;
    processes?: TestProcess[];
    // MLFQ specific properties
    queues?: number;
    quantums?: number[];
    allotment?: number;
    frameCount?: number;
    pageReferences?: number[];
    // Disk scheduling properties
    maxDiskSize?: number;
    initialHeadPosition?: number;
    headDirection?: 'left' | 'right';
    requests?: number[];
    description: string;
    expectedSolution?: TestSolution | MemoryTestSolution | DiskTestSolution;
}

export interface TestProcess {
    id: number;
    arrivalTime: number;
    burstTime: number;
    io: IOOperation[];
}

export interface IOOperation {
    start: number;
    duration: number;
}

export interface TestSolution {
    processes: ProcessResult[];
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    completionTime: number;
    ganttChart: GanttEntry[];
}

export interface MemoryTestSolution {
    algorithm: string;
    frameCount: number;
    pageReferences: number[];
    totalPageFaults: number;
    hitRate: number;
    frames: number[][];
    customData: MemoryStepData[];
    stepResults: MemoryStepResult[];
}

export interface MemoryStepData {
    page: number;
    pageFault: boolean;
    totalPageFaults: number;
    hitRate: number;
    dataStructure: number[];
    explaination: string;
}

export interface MemoryStepResult {
    pageReference: number;
    frameState: (number | null)[];
    pageFault: boolean;
}

export interface DiskTestSolution {
    algorithm: string;
    maxDiskSize: number;
    initialHeadPosition: number;
    headDirection: string;
    requests: number[];
    sequence: number[];
    totalSeekTime: number;
    averageSeekTime: number;
}

export interface ProcessResult {
    pid: number;
    arrivalTime: number;
    burstTime: number;
    scheduledTime: number;
    waitingTime: number;
    turnaroundTime: number;
    completionTime: number;
}

export interface GanttEntry {
    processId: number;
    startTime: number;
    endTime: number;
}

export interface TestConfig {
    includeScheduling: boolean;
    includeMemory: boolean;
    includeDisk: boolean;
    numQuestions: number;
    difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestSession {
    id: string;
    config: TestConfig;
    questions: TestQuestion[];
    currentQuestionIndex: number;
    userAnswers: UserAnswer[];
    startTime: Date;
    endTime?: Date;
    score?: number;
}

export interface UserAnswer {
    questionId: string;
    userSolution: TestSolution | MemoryTestSolution | DiskTestSolution;
    correctSolution: TestSolution | MemoryTestSolution | DiskTestSolution;
    isCorrect: boolean;
    score: number;
    maxScore: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AlgorithmType = 'FCFS' | 'SJF' | 'RR' | 'MLFQ';
export type MemoryAlgorithmType = 'FIFO' | 'LRU' | 'OPT';
export type DiskAlgorithmType = 'FCFS' | 'SSTF' | 'SCAN' | 'C-SCAN' | 'LOOK' | 'C-LOOK';

export interface TestResultsProps {
    session: TestSession;
    summary: {
        totalQuestions: number;
        answeredQuestions: number;
        correctAnswers: number;
        totalScore: number;
        percentage: number;
        duration: number;
    };
    onRestart: () => void;
    onViewQuestion: (index: number) => void;
}
