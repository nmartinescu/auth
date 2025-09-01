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
        
        // Use specialized process generation for MLFQ hard tests
        const processes = (algorithm === 'MLFQ' && difficulty === 'hard') 
            ? this.generateMLFQHardScenarioProcesses(processCount)
            : this.generateProcesses(processCount, ioCount, difficulty);
            
        const quantum = algorithm === 'RR' ? this.generateQuantum(difficulty) : undefined;
        
        // MLFQ specific configuration
        let queues: number | undefined;
        let quantums: number[] | undefined;
        let allotment: number | undefined;
        
        if (algorithm === 'MLFQ') {
            const mlfqConfig = this.generateMLFQConfig(difficulty);
            queues = mlfqConfig.queues;
            quantums = mlfqConfig.quantums;
            allotment = mlfqConfig.allotment;
        }
        
        return {
            id,
            type: 'scheduling',
            difficulty,
            algorithm,
            quantum,
            queues,
            quantums,
            allotment,
            processes,
            description: this.generateSchedulingDescription(algorithm, processes, quantum, { queues, quantums, allotment })
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
                return { processCount: this.randomBetween(6, 10), ioCount: this.randomBetween(2, 4) };
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

    private generateMLFQHardScenarioProcesses(processCount: number): TestProcess[] {
        const processes: TestProcess[] = [];
        
        // Create a mix of process types for challenging MLFQ scenarios
        for (let i = 0; i < processCount; i++) {
            let burstTime: number;
            let ioOperations: IOOperation[] = [];
            
            if (i < 2) {
                // CPU-intensive processes (will get demoted quickly)
                burstTime = this.randomBetween(20, 30);
                ioOperations = []; // No I/O
            } else if (i < 4) {
                // I/O-intensive processes (will get priority boosts)
                burstTime = this.randomBetween(15, 25);
                ioOperations = [
                    { start: this.randomBetween(3, 8), duration: this.randomBetween(2, 4) },
                    { start: this.randomBetween(12, 18), duration: this.randomBetween(1, 3) }
                ];
            } else {
                // Mixed workload processes
                burstTime = this.randomBetween(12, 20);
                if (Math.random() > 0.5) {
                    ioOperations = [
                        { start: this.randomBetween(5, 10), duration: this.randomBetween(1, 2) }
                    ];
                }
            }
            
            const arrivalTime = i === 0 ? 0 : this.randomBetween(0, 6);
            
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
                // Longer burst times for MLFQ to create more queue demotions
                return this.randomBetween(10, 25);
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

    private generateMLFQConfig(difficulty: DifficultyLevel): { queues: number; quantums: number[]; allotment: number } {
        switch (difficulty) {
            case 'easy':
                // Simple 2-queue MLFQ with clear quantum differences
                return {
                    queues: 2,
                    quantums: [2, 4],
                    allotment: 15
                };
            case 'medium':
                // 3-queue MLFQ with moderate complexity
                return {
                    queues: 3,
                    quantums: [2, 4, 8],
                    allotment: this.randomBetween(12, 18)
                };
            case 'hard':
                // Complex 4-queue MLFQ with challenging scenarios
                const queues = this.randomBetween(3, 4);
                const quantums = queues === 3 
                    ? [1, 3, 6] 
                    : [1, 2, 4, 8];
                return {
                    queues,
                    quantums,
                    allotment: this.randomBetween(8, 15) // Shorter allotment for more complexity
                };
            default:
                return { queues: 3, quantums: [2, 4, 8], allotment: 15 };
        }
    }

    private generateSchedulingDescription(
        algorithm: AlgorithmType,
        processes: TestProcess[],
        quantum?: number,
        mlfqConfig?: { queues?: number; quantums?: number[]; allotment?: number }
    ): string {
        const algorithmName = this.getAlgorithmFullName(algorithm);
        
        if (algorithm === 'MLFQ' && mlfqConfig) {
            const { queues, quantums, allotment } = mlfqConfig;
            return `Apply ${algorithmName} scheduling algorithm to the following ${processes.length} processes.
            
            MLFQ Configuration:
            - Number of Queues: ${queues} (Queue 0 = Highest Priority, Queue ${queues! - 1} = Lowest Priority)
            - Quantum Times: ${quantums!.map((q, i) => `Queue ${i}: ${q}`).join(', ')}
            - Allotment Time: ${allotment} (All processes reset to Queue 0 every ${allotment} time units)
            
            Complete the table with the correct scheduled time, waiting time, turnaround time, and completion time for each process.
            ${processes.some(p => p.io.length > 0) ? 'Note: Some processes have I/O operations that boost priority back to Queue 0.' : ''}
            
            MLFQ Rules:
            - New processes start in Queue 0 (highest priority)
            - When quantum expires, process moves to next lower priority queue
            - Processes cannot move below the lowest priority queue
            - I/O completion boosts process back to Queue 0
            - Every ${allotment} time units, ALL processes reset to Queue 0
            - Higher priority queues always preempt lower priority queues
            
            Remember:
            - Scheduled Time: When the process first gets the CPU
            - Waiting Time: Total time spent waiting in ready queues
            - Turnaround Time: Total time from arrival to completion
            - Completion Time: When the process finishes execution`;
        }
        
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
            case 'MLFQ':
                return 'Multi-Level Feedback Queue (MLFQ)';
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
        const algorithms: AlgorithmType[] = ['FCFS', 'SJF', 'RR', 'MLFQ'];
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
