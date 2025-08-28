import type { 
    TestQuestion, 
    TestProcess, 
    IOOperation, 
    DifficultyLevel,
    AlgorithmType,
    TestConfig
} from '../types/Test';

class TestQuestionGenerator {
    private static instance: TestQuestionGenerator;
    
    static getInstance(): TestQuestionGenerator {
        if (!TestQuestionGenerator.instance) {
            TestQuestionGenerator.instance = new TestQuestionGenerator();
        }
        return TestQuestionGenerator.instance;
    }

    generateQuestions(config: TestConfig): TestQuestion[] {
        const questions: TestQuestion[] = [];
        
        for (let i = 0; i < config.numQuestions; i++) {
            const algorithm = this.getRandomAlgorithm();
            const question = this.generateQuestion(
                `test-${Date.now()}-${i}`,
                config.difficulty,
                algorithm
            );
            questions.push(question);
        }
        
        return questions;
    }

    private generateQuestion(
        id: string,
        difficulty: DifficultyLevel,
        algorithm: AlgorithmType
    ): TestQuestion {
        const { processCount, ioCount } = this.getDifficultyParams(difficulty);
        const processes = this.generateProcesses(processCount, ioCount, difficulty);
        const quantum = algorithm === 'RR' ? this.generateQuantum(difficulty) : undefined;
        
        return {
            id,
            difficulty,
            algorithm,
            quantum,
            processes,
            description: this.generateDescription(algorithm, processes, quantum)
        };
    }

    private getDifficultyParams(difficulty: DifficultyLevel): { processCount: number; ioCount: number } {
        switch (difficulty) {
            case 'easy':
                return { processCount: this.randomBetween(2, 3), ioCount: 0 };
            case 'medium':
                return { processCount: this.randomBetween(4, 6), ioCount: 1 };
            case 'hard':
                return { processCount: this.randomBetween(7, 8), ioCount: this.randomBetween(2, 3) };
            default:
                return { processCount: 3, ioCount: 0 };
        }
    }

    private generateProcesses(processCount: number, maxIoCount: number, difficulty: DifficultyLevel): TestProcess[] {
        const processes: TestProcess[] = [];
        
        for (let i = 0; i < processCount; i++) {
            const burstTime = this.generateBurstTime(difficulty);
            const arrivalTime = this.generateArrivalTime(i, difficulty);
            const ioOperations = this.generateIOOperations(burstTime, maxIoCount);
            
            processes.push({
                id: i + 1,
                arrivalTime,
                burstTime,
                io: ioOperations
            });
        }
        
        return processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    }

    private generateBurstTime(difficulty: DifficultyLevel): number {
        switch (difficulty) {
            case 'easy':
                return this.randomBetween(3, 8);
            case 'medium':
                return this.randomBetween(5, 12);
            case 'hard':
                return this.randomBetween(8, 15);
            default:
                return 5;
        }
    }

    private generateArrivalTime(processIndex: number, difficulty: DifficultyLevel): number {
        switch (difficulty) {
            case 'easy':
                // Simple arrival times for easy questions
                return processIndex === 0 ? 0 : this.randomBetween(0, 3);
            case 'medium':
                return processIndex === 0 ? 0 : this.randomBetween(0, 5);
            case 'hard':
                return processIndex === 0 ? 0 : this.randomBetween(0, 8);
            default:
                return processIndex;
        }
    }

    private generateIOOperations(burstTime: number, maxIoCount: number): IOOperation[] {
        if (maxIoCount === 0) return [];
        
        const ioCount = this.randomBetween(0, maxIoCount);
        const ioOperations: IOOperation[] = [];
        
        for (let i = 0; i < ioCount; i++) {
            // IO should start before the process completes
            const start = this.randomBetween(1, Math.max(1, burstTime - 2));
            const duration = this.randomBetween(1, 3);
            
            // Avoid overlapping IO operations
            const exists = ioOperations.some(io => 
                Math.abs(io.start - start) < 2
            );
            
            if (!exists) {
                ioOperations.push({ start, duration });
            }
        }
        
        return ioOperations.sort((a, b) => a.start - b.start);
    }

    private generateQuantum(difficulty: DifficultyLevel): number {
        switch (difficulty) {
            case 'easy':
                return this.randomBetween(2, 4);
            case 'medium':
                return this.randomBetween(2, 5);
            case 'hard':
                return this.randomBetween(1, 4);
            default:
                return 3;
        }
    }

    private generateDescription(
        algorithm: AlgorithmType,
        processes: TestProcess[],
        quantum?: number
    ): string {
        const algorithmName = this.getAlgorithmFullName(algorithm);
        const quantumText = quantum ? ` with quantum = ${quantum}` : '';
        
        return `Apply ${algorithmName}${quantumText} scheduling algorithm to the following ${processes.length} processes. 
        Complete the table with the correct scheduled time, waiting time, turnaround time, and completion time for each process.
        ${processes.some(p => p.io.length > 0) ? 'Note: Some processes have I/O operations.' : ''}
        
        Remember:
        - Scheduled Time: When the process first gets the CPU
        - Waiting Time: Total time spent waiting in ready queue
        - Turnaround Time: Total time from arrival to completion
        - Completion Time: When the process finishes execution`;
    }

    private getAlgorithmFullName(algorithm: AlgorithmType): string {
        switch (algorithm) {
            case 'FCFS':
                return 'First Come First Served (FCFS)';
            case 'SJF':
                return 'Shortest Job First (SJF)';
            case 'RR':
                return 'Round Robin (RR)';
            default:
                return algorithm;
        }
    }

    private getRandomAlgorithm(): AlgorithmType {
        const algorithms: AlgorithmType[] = ['FCFS', 'SJF', 'RR'];
        return algorithms[Math.floor(Math.random() * algorithms.length)];
    }

    private randomBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export const testQuestionGenerator = TestQuestionGenerator.getInstance();
