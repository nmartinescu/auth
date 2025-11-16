// Test-related type definitions

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type AlgorithmType = 'FCFS' | 'SJF' | 'RR' | 'MLFQ';

export type MemoryAlgorithmType = 'FIFO' | 'LRU' | 'LFU' | 'MRU' | 'OPT';

export type DiskAlgorithmType = 'FCFS' | 'SSTF' | 'SCAN' | 'C-SCAN' | 'LOOK' | 'C-LOOK';

export interface IOOperation {
    start: number;
    duration: number;
}

export interface TestProcess {
    id: number;
    arrivalTime: number;
    burstTime: number;
    io: IOOperation[];
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

export interface TestSolution {
    processes: ProcessResult[];
    avgWaitingTime: number;
    avgTurnaroundTime: number;
    completionTime: number;
    ganttChart: GanttEntry[];
}

export interface MemoryStepResult {
    pageReference: number;
    frameState: (number | null)[];
    pageFault: boolean;
}

export interface MemoryTestSolution {
    algorithm: string;
    frameCount: number;
    pageReferences: number[];
    totalPageFaults: number;
    hitRate: number;
    frames: number[][];
    customData: any[];
    stepResults: MemoryStepResult[];
}

export interface DiskTestSolution {
    algorithm: string;
    maxDiskSize: number;
    initialHeadPosition: number;
    headDirection: 'left' | 'right';
    requests: number[];
    sequence: number[];
    totalSeekTime: number;
    averageSeekTime: number;
}

export interface TestQuestion {
    id: string;
    type: 'scheduling' | 'memory' | 'disk';
    difficulty: DifficultyLevel;
    algorithm: AlgorithmType | MemoryAlgorithmType | DiskAlgorithmType;
    description: string;
    
    // Scheduling-specific fields
    processes?: TestProcess[];
    quantum?: number;
    queues?: number;
    quantums?: number[];
    allotment?: number;
    
    // Memory-specific fields
    frameCount?: number;
    pageReferences?: number[];
    
    // Disk-specific fields
    maxDiskSize?: number;
    initialHeadPosition?: number;
    headDirection?: 'left' | 'right';
    requests?: number[];
    
    // Expected solution (calculated after question generation)
    expectedSolution?: TestSolution | MemoryTestSolution | DiskTestSolution;
}

export interface UserAnswer {
    questionId: string;
    userSolution: TestSolution | MemoryTestSolution | DiskTestSolution;
    correctSolution: TestSolution | MemoryTestSolution | DiskTestSolution;
    isCorrect: boolean;
    score: number;
    maxScore: number;
}

export interface TestConfig {
    numQuestions: number;
    difficulty: DifficultyLevel;
    includeScheduling: boolean;
    includeMemory: boolean;
    includeDisk: boolean;
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
