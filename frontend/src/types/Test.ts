export interface TestQuestion {
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
    algorithm: 'FCFS' | 'SJF' | 'RR';
    quantum?: number;
    processes: TestProcess[];
    description: string;
    expectedSolution?: TestSolution;
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
    userSolution: {
        processes: ProcessResult[];
        avgWaitingTime: number;
        avgTurnaroundTime: number;
        completionTime: number;
        ganttChart: GanttEntry[];
    };
    correctSolution: {
        processes: ProcessResult[];
        avgWaitingTime: number;
        avgTurnaroundTime: number;
        completionTime: number;
        ganttChart: GanttEntry[];
    };
    isCorrect: boolean;
    score: number;
    maxScore: number;
}

export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type AlgorithmType = 'FCFS' | 'SJF' | 'RR';
