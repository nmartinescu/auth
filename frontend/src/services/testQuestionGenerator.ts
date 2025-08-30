import type { 
    TestQuestion, 
    TestProcess, 
    IOOperation, 
    DifficultyLevel,
    AlgorithmType,
    MemoryAlgorithmType,
    DiskAlgorithmType,
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
        
        // Determine question types to generate
        const questionTypes: ('scheduling' | 'memory' | 'disk')[] = [];
        if (config.includeScheduling) questionTypes.push('scheduling');
        if (config.includeMemory) questionTypes.push('memory');
        if (config.includeDisk) questionTypes.push('disk');
        
        for (let i = 0; i < config.numQuestions; i++) {
            const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            
            let question: TestQuestion;
            if (questionType === 'scheduling') {
                const algorithm = this.getRandomAlgorithm();
                question = this.generateSchedulingQuestion(
                    `test-${Date.now()}-${i}`,
                    config.difficulty,
                    algorithm
                );
            } else if (questionType === 'memory') {
                const algorithm = this.getRandomMemoryAlgorithm();
                question = this.generateMemoryQuestion(
                    `test-${Date.now()}-${i}`,
                    config.difficulty,
                    algorithm
                );
            } else {
                const algorithm = this.getRandomDiskAlgorithm();
                question = this.generateDiskQuestion(
                    `test-${Date.now()}-${i}`,
                    config.difficulty,
                    algorithm
                );
            }
            
            questions.push(question);
        }
        
        return questions;
    }

    private generateSchedulingQuestion(
        id: string,
        difficulty: DifficultyLevel,
        algorithm: AlgorithmType
    ): TestQuestion {
        const { processCount, ioCount } = this.getDifficultyParams(difficulty);
        const processes = this.generateProcesses(processCount, ioCount, difficulty);
        const quantum = algorithm === 'RR' ? this.generateQuantum(difficulty) : undefined;
        
        return {
            id,
            type: 'scheduling',
            difficulty,
            algorithm,
            quantum,
            processes,
            description: this.generateSchedulingDescription(algorithm, processes, quantum)
        };
    }

    private generateMemoryQuestion(
        id: string,
        difficulty: DifficultyLevel,
        algorithm: MemoryAlgorithmType
    ): TestQuestion {
        const { frameCount, pageCount } = this.getMemoryDifficultyParams(difficulty);
        const pageReferences = this.generatePageReferences(pageCount, frameCount, difficulty);
        
        return {
            id,
            type: 'memory',
            difficulty,
            algorithm,
            frameCount,
            pageReferences,
            description: this.generateMemoryDescription(algorithm, frameCount, pageReferences)
        };
    }

    private generateDiskQuestion(
        id: string,
        difficulty: DifficultyLevel,
        algorithm: DiskAlgorithmType
    ): TestQuestion {
        const { maxDiskSize, requestCount, initialHeadPosition } = this.getDiskDifficultyParams(difficulty);
        const requests = this.generateDiskRequests(requestCount, maxDiskSize, initialHeadPosition);
        const headDirection = Math.random() > 0.5 ? 'right' : 'left';
        
        return {
            id,
            type: 'disk',
            difficulty,
            algorithm,
            maxDiskSize,
            initialHeadPosition,
            headDirection,
            requests,
            description: this.generateDiskDescription(algorithm, maxDiskSize, initialHeadPosition, headDirection, requests)
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

    private generateSchedulingDescription(
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

    private generateMemoryDescription(
        algorithm: MemoryAlgorithmType,
        frameCount: number,
        pageReferences: number[]
    ): string {
        const algorithmName = this.getMemoryAlgorithmFullName(algorithm);
        
        return `Apply ${algorithmName} page replacement algorithm to the following page reference sequence.
        
        Memory Configuration:
        - Frame Count: ${frameCount}
        - Page Reference Sequence: ${pageReferences.join(', ')}
        
        Calculate the total number of page faults and hit rate for this sequence.
        
        Remember:
        - Page Fault: When a referenced page is not in memory
        - Hit: When a referenced page is already in memory
        - Hit Rate: (Total Hits / Total References) × 100%`;
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

    private getMemoryDifficultyParams(difficulty: DifficultyLevel): { frameCount: number; pageCount: number } {
        switch (difficulty) {
            case 'easy':
                return { frameCount: this.randomBetween(3, 4), pageCount: this.randomBetween(8, 12) };
            case 'medium':
                return { frameCount: this.randomBetween(3, 5), pageCount: this.randomBetween(12, 16) };
            case 'hard':
                return { frameCount: this.randomBetween(4, 6), pageCount: this.randomBetween(16, 20) };
            default:
                return { frameCount: 3, pageCount: 10 };
        }
    }

    private generatePageReferences(pageCount: number, frameCount: number, difficulty: DifficultyLevel): number[] {
        const references: number[] = [];
        const maxPageNumber = frameCount + this.randomBetween(2, 5); // Ensure some page faults
        
        for (let i = 0; i < pageCount; i++) {
            // Generate realistic page reference patterns
            if (i === 0) {
                // First reference is random
                references.push(this.randomBetween(1, maxPageNumber));
            } else {
                // 30% chance to repeat recent page (locality of reference)
                if (Math.random() < 0.3 && i > 0) {
                    const recentIndex = Math.max(0, i - this.randomBetween(1, 3));
                    references.push(references[recentIndex]);
                } else {
                    references.push(this.randomBetween(1, maxPageNumber));
                }
            }
        }
        
        return references;
    }

    private getRandomAlgorithm(): AlgorithmType {
        const algorithms: AlgorithmType[] = ['FCFS', 'SJF', 'RR'];
        return algorithms[Math.floor(Math.random() * algorithms.length)];
    }

    private getRandomMemoryAlgorithm(): MemoryAlgorithmType {
        const algorithms: MemoryAlgorithmType[] = ['FIFO', 'LRU', 'OPT'];
        return algorithms[Math.floor(Math.random() * algorithms.length)];
    }

    private getMemoryAlgorithmFullName(algorithm: MemoryAlgorithmType): string {
        switch (algorithm) {
            case 'FIFO':
                return 'First In First Out (FIFO)';
            case 'LRU':
                return 'Least Recently Used (LRU)';
            case 'OPT':
                return 'Optimal (OPT)';
            default:
                return algorithm;
        }
    }

    private getDiskDifficultyParams(difficulty: DifficultyLevel): { 
        maxDiskSize: number; 
        requestCount: number; 
        initialHeadPosition: number;
    } {
        switch (difficulty) {
            case 'easy':
                const easyDiskSize = 100;
                return { 
                    maxDiskSize: easyDiskSize, 
                    requestCount: this.randomBetween(4, 6),
                    initialHeadPosition: this.randomBetween(20, 80)
                };
            case 'medium':
                const mediumDiskSize = 200;
                return { 
                    maxDiskSize: mediumDiskSize, 
                    requestCount: this.randomBetween(6, 8),
                    initialHeadPosition: this.randomBetween(30, 170)
                };
            case 'hard':
                const hardDiskSize = 500;
                return { 
                    maxDiskSize: hardDiskSize, 
                    requestCount: this.randomBetween(8, 12),
                    initialHeadPosition: this.randomBetween(50, 450)
                };
            default:
                return { maxDiskSize: 200, requestCount: 6, initialHeadPosition: 50 };
        }
    }

    private generateDiskRequests(requestCount: number, maxDiskSize: number, initialHeadPosition: number): number[] {
        const requests: number[] = [];
        
        for (let i = 0; i < requestCount; i++) {
            let request: number;
            do {
                request = this.randomBetween(0, maxDiskSize - 1);
            } while (requests.includes(request) || request === initialHeadPosition);
            
            requests.push(request);
        }
        
        return requests;
    }

    private generateDiskDescription(
        algorithm: DiskAlgorithmType,
        maxDiskSize: number,
        initialHeadPosition: number,
        headDirection: 'left' | 'right',
        requests: number[]
    ): string {
        const algorithmName = this.getDiskAlgorithmFullName(algorithm);
        const needsDirection = ['SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'].includes(algorithm);
        const directionText = needsDirection ? ` The disk head is initially moving ${headDirection}.` : '';
        
        return `Apply ${algorithmName} disk scheduling algorithm to the following disk requests.
        
        Disk Configuration:
        - Maximum Disk Size: ${maxDiskSize} tracks (0 to ${maxDiskSize - 1})
        - Initial Head Position: ${initialHeadPosition}
        - Disk Requests: ${requests.join(', ')}${directionText}
        
        Calculate:
        1. The sequence in which requests are serviced
        2. Total seek time (sum of all head movements)
        3. Average seek time (total seek time ÷ number of requests)
        
        Remember:
        - Seek Time = |Current Position - Target Position|
        - Head movement is the distance between consecutive positions`;
    }

    private getRandomDiskAlgorithm(): DiskAlgorithmType {
        const algorithms: DiskAlgorithmType[] = ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'];
        return algorithms[Math.floor(Math.random() * algorithms.length)];
    }

    private getDiskAlgorithmFullName(algorithm: DiskAlgorithmType): string {
        switch (algorithm) {
            case 'FCFS':
                return 'First Come First Served (FCFS)';
            case 'SSTF':
                return 'Shortest Seek Time First (SSTF)';
            case 'SCAN':
                return 'SCAN (Elevator Algorithm)';
            case 'C-SCAN':
                return 'Circular SCAN (C-SCAN)';
            case 'LOOK':
                return 'LOOK Algorithm';
            case 'C-LOOK':
                return 'Circular LOOK (C-LOOK)';
            default:
                return algorithm;
        }
    }

    private randomBetween(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export const testQuestionGenerator = TestQuestionGenerator.getInstance();
