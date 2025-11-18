/**
 * CPU Scheduling Test Generation Service
 * Generates test questions for CPU scheduling algorithms
 */

/**
 * Generate a random CPU scheduling test question
 */
function generateCPUSchedulingQuestion(difficulty = 'medium', algorithm = null) {
    const selectedAlgorithm = algorithm || getRandomAlgorithm();
    const { processCount, ioCount } = getDifficultyParams(difficulty);
    
    // use specialized process generation for MLFQ hard tests
    const processes = (selectedAlgorithm === 'MLFQ' && difficulty === 'hard') 
        ? generateMLFQHardScenarioProcesses(processCount)
        : generateProcesses(processCount, ioCount, difficulty);
        
    const quantum = selectedAlgorithm === 'RR' ? generateQuantum(difficulty) : undefined;
    
    // MLFQ specific configuration
    let queues, quantums, allotment;
    
    if (selectedAlgorithm === 'MLFQ') {
        const mlfqConfig = generateMLFQConfig(difficulty);
        queues = mlfqConfig.queues;
        quantums = mlfqConfig.quantums;
        allotment = mlfqConfig.allotment;
    }
    
    const description = generateSchedulingDescription(selectedAlgorithm, processes, quantum, { queues, quantums, allotment });
    
    return {
        question: {
            type: 'scheduling',
            difficulty,
            algorithm: selectedAlgorithm,
            quantum,
            queues,
            quantums,
            allotment,
            processes,
            description
        },
        // these stay on the server for verification
        correctAnswer: {
            algorithm: selectedAlgorithm,
            processes,
            quantum,
            queues,
            quantums,
            allotment
        }
    };
}

/**
 * Generate multiple test questions
 */
function generateMultipleCPUQuestions(count, difficulty = 'medium') {
    const questions = [];
    
    for (let i = 0; i < count; i++) {
        const testQuestion = generateCPUSchedulingQuestion(difficulty);
        questions.push(testQuestion);
    }
    
    return questions;
}

function getDifficultyParams(difficulty) {
    switch (difficulty) {
        case 'easy':
            return { processCount: randomBetween(2, 3), ioCount: 0 };
        case 'medium':
            return { processCount: randomBetween(4, 6), ioCount: 1 };
        case 'hard':
            return { processCount: randomBetween(6, 10), ioCount: randomBetween(2, 4) };
        default:
            return { processCount: 3, ioCount: 0 };
    }
}

function generateProcesses(processCount, maxIoCount, difficulty) {
    const processes = [];
    
    for (let i = 0; i < processCount; i++) {
        const burstTime = generateBurstTime(difficulty);
        const arrivalTime = generateArrivalTime(i, difficulty);
        const ioOperations = generateIOOperations(burstTime, maxIoCount);
        
        processes.push({
            id: i + 1,
            arrivalTime,
            burstTime,
            io: ioOperations
        });
    }
    
    // sort by arrival time first, then reassign IDs to maintain P1, P2, P3... order
    const sortedProcesses = processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    return sortedProcesses.map((process, index) => ({
        ...process,
        id: index + 1
    }));
}

function generateMLFQHardScenarioProcesses(processCount) {
    const processes = [];
    
    for (let i = 0; i < processCount; i++) {
        let burstTime;
        let ioOperations = [];
        
        if (i < 2) {
            // CPU-intensive processes (will get demoted quickly)
            burstTime = randomBetween(20, 30);
            ioOperations = [];
        } else if (i < 4) {
            // I/O-intensive processes (will get priority boosts)
            burstTime = randomBetween(15, 25);
            ioOperations = [
                { start: randomBetween(3, 8), duration: randomBetween(2, 4) },
                { start: randomBetween(12, 18), duration: randomBetween(1, 3) }
            ];
        } else {
            // mixed workload processes
            burstTime = randomBetween(12, 20);
            if (Math.random() > 0.5) {
                ioOperations = [
                    { start: randomBetween(5, 10), duration: randomBetween(1, 2) }
                ];
            }
        }
        
        const arrivalTime = i === 0 ? 0 : randomBetween(0, 6);
        
        processes.push({
            id: i + 1,
            arrivalTime,
            burstTime,
            io: ioOperations
        });
    }
    
    // sort by arrival time first, then reassign IDs
    const sortedProcesses = processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    
    return sortedProcesses.map((process, index) => ({
        ...process,
        id: index + 1
    }));
}

function generateBurstTime(difficulty) {
    switch (difficulty) {
        case 'easy':
            return randomBetween(3, 8);
        case 'medium':
            return randomBetween(5, 12);
        case 'hard':
            return randomBetween(10, 25);
        default:
            return 5;
    }
}

function generateArrivalTime(processIndex, difficulty) {
    switch (difficulty) {
        case 'easy':
            return processIndex === 0 ? 0 : randomBetween(0, 3);
        case 'medium':
            return processIndex === 0 ? 0 : randomBetween(0, 5);
        case 'hard':
            return processIndex === 0 ? 0 : randomBetween(0, 8);
        default:
            return processIndex;
    }
}

function generateIOOperations(burstTime, maxIoCount) {
    if (maxIoCount === 0) return [];
    
    const ioCount = randomBetween(0, maxIoCount);
    const ioOperations = [];
    
    for (let i = 0; i < ioCount; i++) {
        const start = randomBetween(1, Math.max(1, burstTime - 2));
        const duration = randomBetween(1, 3);
        
        const exists = ioOperations.some(io => Math.abs(io.start - start) < 2);
        
        if (!exists) {
            ioOperations.push({ start, duration });
        }
    }
    
    return ioOperations.sort((a, b) => a.start - b.start);
}

function generateQuantum(difficulty) {
    switch (difficulty) {
        case 'easy':
            return randomBetween(2, 4);
        case 'medium':
            return randomBetween(2, 5);
        case 'hard':
            return randomBetween(1, 4);
        default:
            return 3;
    }
}

function generateMLFQConfig(difficulty) {
    switch (difficulty) {
        case 'easy':
            return {
                queues: 2,
                quantums: [2, 4],
                allotment: 15
            };
        case 'medium':
            return {
                queues: 3,
                quantums: [2, 4, 8],
                allotment: randomBetween(12, 18)
            };
        case 'hard':
            const queues = randomBetween(3, 4);
            const quantums = queues === 3 ? [1, 3, 6] : [1, 2, 4, 8];
            return {
                queues,
                quantums,
                allotment: randomBetween(8, 15)
            };
        default:
            return { queues: 3, quantums: [2, 4, 8], allotment: 15 };
    }
}

function generateSchedulingDescription(algorithm, processes, quantum, mlfqConfig) {
    const algorithmName = getAlgorithmFullName(algorithm);
    
    if (algorithm === 'MLFQ' && mlfqConfig) {
        const { queues, quantums, allotment } = mlfqConfig;
        const ioNote = processes.some(p => p.io.length > 0) ? ' Several processes contain I/O operations that will affect their priority levels during execution.' : '';
        
        return `A computer system is running ${processes.length} processes using the ${algorithmName} scheduling algorithm. The system is configured with ${queues} priority queues where Queue 0 represents the highest priority and Queue ${queues - 1} represents the lowest priority. Each queue operates with different time quantum values: ${quantums.map((q, i) => `Queue ${i} uses ${q} time units`).join(', ')}. The system implements a priority boost mechanism that resets all processes to Queue 0 every ${allotment} time units to prevent starvation.${ioNote}

The scheduler follows these operational rules: new processes always begin execution in Queue 0, processes that exhaust their quantum are demoted to the next lower priority queue, processes cannot be demoted below the lowest priority queue, I/O completion automatically promotes processes back to Queue 0, and higher priority queues always preempt lower priority queues when processes become ready.

Your task is to determine the scheduled time (when each process first receives CPU access), waiting time (total time spent in ready queues), turnaround time (total time from arrival to completion), and completion time (when each process finishes execution) for all processes in the system.`;
    }
    
    const quantumText = quantum ? ` operating with a time quantum of ${quantum} units` : '';
    const ioNote = processes.some(p => p.io.length > 0) ? ' Some processes will perform I/O operations during their execution, which will affect their scheduling behavior.' : '';
    
    return `A computer system needs to schedule ${processes.length} processes using the ${algorithmName} algorithm${quantumText}.${ioNote} You are required to analyze the scheduling behavior and determine the performance metrics for each process.

Calculate the scheduled time (when the process first receives CPU access), waiting time (total time spent waiting in the ready queue), turnaround time (total time from arrival to completion), and completion time (when the process finishes execution) for each process in the system.`;
}

function getAlgorithmFullName(algorithm) {
    switch (algorithm) {
        case 'FCFS':
            return 'First Come First Served (FCFS)';
        case 'SJF':
            return 'Shortest Job First (SJF)';
        case 'RR':
            return 'Round Robin (RR)';
        case 'MLFQ':
            return 'Multi-Level Feedback Queue (MLFQ)';
        case 'STCF':
            return 'Shortest Time-to-Completion First (STCF)';
        default:
            return algorithm;
    }
}

function getRandomAlgorithm() {
    const algorithms = ['FCFS', 'SJF', 'RR', 'MLFQ'];
    return algorithms[Math.floor(Math.random() * algorithms.length)];
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export {
    generateCPUSchedulingQuestion,
    generateMultipleCPUQuestions
};
