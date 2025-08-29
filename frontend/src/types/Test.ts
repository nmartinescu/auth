export interface TestQuestion {
    id: string;
    type: 'scheduling' | 'memory';
    difficulty: 'easy' | 'medium' | 'hard';
    algorithm: 'FCFS' | 'SJF' | 'RR' | 'FIFO' | 'LRU' | 'OPT';
    quantum?: number;
    processes?: TestProcess[];
    frameCount?: number;
    pageReferences?: number[];
    description: string;
    expectedSolution?: TestSolution | MemoryTestSolution;
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
    userSolution: TestSolution | MemoryTestSolution;
    correctSolution: TestSolution | MemoryTestSolution;
    isCorrect: boolean;
    score: number;
    maxScore: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AlgorithmType = 'FCFS' | 'SJF' | 'RR';
export type MemoryAlgorithmType = 'FIFO' | 'LRU' | 'OPT';
