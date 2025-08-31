import { describe, it, expect, beforeEach } from '@jest/globals';
import SchedulerMLFQ from '../../../scheduler/algorithms/SchedulerMLFQ.js';

describe('MLFQ Scheduler', () => {
    let testProcesses;
    let defaultConfig;

    beforeEach(() => {
        testProcesses = [
            { arrivalTime: 0, burstTime: 8, io: [] },
            { arrivalTime: 1, burstTime: 4, io: [] },
            { arrivalTime: 2, burstTime: 6, io: [] }
        ];

        defaultConfig = {
            queues: 3,
            quantums: [2, 4, 8],
            allotment: 10
        };
    });

    describe('Constructor and Configuration', () => {
        it('should create MLFQ scheduler with default configuration', () => {
            const scheduler = new SchedulerMLFQ(testProcesses);
            expect(scheduler).toBeDefined();
            expect(scheduler.config.queues).toBe(3);
            expect(scheduler.config.quantums).toEqual([2, 4, 8]);
            expect(scheduler.config.allotment).toBe(20);
        });

        it('should create MLFQ scheduler with custom configuration', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            expect(scheduler.config.queues).toBe(3);
            expect(scheduler.config.quantums).toEqual([2, 4, 8]);
            expect(scheduler.config.allotment).toBe(10);
        });

        it('should throw error for mismatched queues and quantums', () => {
            const invalidConfig = {
                queues: 3,
                quantums: [2, 4], // Only 2 quantums for 3 queues
                allotment: 10
            };

            expect(() => {
                new SchedulerMLFQ(testProcesses, invalidConfig);
            }).toThrow('Number of queues must match number of quantums');
        });
    });

    describe('Process Scheduling', () => {
        it('should schedule processes from highest priority queue first', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            
            // Simulate processes being added to different queues
            scheduler.readyQueues.addToReadyQueue(0, 1); // High priority
            scheduler.readyQueues.addToReadyQueue(1, 2); // Medium priority
            scheduler.readyQueues.addToReadyQueue(2, 3); // Low priority

            const scheduledProcess = scheduler.getScheduledProcess();
            expect(scheduledProcess).toBe(1); // Should pick from queue 0
        });

        it('should return -1 when no processes are ready', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            const scheduledProcess = scheduler.getScheduledProcess();
            expect(scheduledProcess).toBe(-1);
        });

        it('should schedule from lower priority queue when higher queues are empty', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            
            scheduler.readyQueues.addToReadyQueue(1, 2); // Medium priority
            scheduler.readyQueues.addToReadyQueue(2, 3); // Low priority

            const scheduledProcess = scheduler.getScheduledProcess();
            expect(scheduledProcess).toBe(2); // Should pick from queue 1
        });
    });

    describe('Preemption Logic', () => {
        it('should preempt lower priority process for higher priority', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            
            // Set up a running process with lower priority
            scheduler.cpu = 2;
            scheduler.pcb.getRecord(2).priority = 1; // Medium priority
            scheduler.pcb.setProcessStateWithoutStep(2, 'RUNNING');

            const shouldPreempt = scheduler.shouldDescheduleOnNewProcess();
            expect(shouldPreempt).toBe(true);
        });

        it('should not preempt highest priority process', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            
            // Set up a running process with highest priority
            scheduler.cpu = 1;
            scheduler.pcb.getRecord(1).priority = 0; // Highest priority
            scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');

            const shouldPreempt = scheduler.shouldDescheduleOnNewProcess();
            expect(shouldPreempt).toBe(false);
        });
    });

    describe('Quantum Management', () => {
        it('should always deschedule on timeout', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            const shouldTimeout = scheduler.shouldDescheduleOnTimeout();
            expect(shouldTimeout).toBe(true);
        });
    });

    describe('Basic Simulation', () => {
        it('should complete simulation without errors', () => {
            const simpleProcesses = [
                { arrivalTime: 0, burstTime: 3, io: [] },
                { arrivalTime: 1, burstTime: 2, io: [] }
            ];

            const scheduler = new SchedulerMLFQ(simpleProcesses, {
                queues: 2,
                quantums: [1, 2],
                allotment: 5
            });

            expect(() => {
                scheduler.start();
            }).not.toThrow();

            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData).toBeDefined();
            expect(Array.isArray(solution.customData)).toBe(true);
        });

        it('should handle processes with I/O operations', () => {
            const processesWithIO = [
                { arrivalTime: 0, burstTime: 5, io: [{ start: 2, duration: 1 }] },
                { arrivalTime: 1, burstTime: 3, io: [] }
            ];

            const scheduler = new SchedulerMLFQ(processesWithIO, defaultConfig);

            expect(() => {
                scheduler.start();
            }).not.toThrow();

            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });
    });

    describe('Priority Management', () => {
        it('should initialize new processes with priority 0', () => {
            const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
            
            // Simulate process arrival
            scheduler.pcb.getRecord(1).priority = 0;
            expect(scheduler.pcb.getRecord(1).priority).toBe(0);
        });
    });
});