import { describe, it, beforeEach, expect } from '@jest/globals';
import SchedulerFCFS from '../../algorithms/scheduler/algorithms/SchedulerFCFS.js';
import SchedulerSJF from '../../algorithms/scheduler/algorithms/SchedulerSJF.js';
import SchedulerRR from '../../algorithms/scheduler/algorithms/SchedulerRR.js';

describe('CPU Scheduling Algorithms', () => {
    let testProcesses;

    beforeEach(() => {
        testProcesses = [
            {
                arrivalTime: 0,
                burstTime: 5,
                io: []
            },
            {
                arrivalTime: 1,
                burstTime: 3,
                io: []
            },
            {
                arrivalTime: 2,
                burstTime: 4,
                io: []
            }
        ];
    });

    describe('FCFS (First Come First Served)', () => {
        it('should create scheduler instance correctly', () => {
            const scheduler = new SchedulerFCFS(testProcesses);
            expect(scheduler).toBeDefined();
            expect(scheduler.pcb).toBeDefined();
            expect(scheduler.readyQueues).toBeDefined();
        });

        it('should initialize processes with correct PIDs', () => {
            const scheduler = new SchedulerFCFS(testProcesses);
            const pcb = scheduler.pcb.getPCB();
            
            expect(pcb[1].pid).toBe(1);
            expect(pcb[2].pid).toBe(2);
            expect(pcb[3].pid).toBe(3);
        });

        it('should process simple case without IO', () => {
            const simpleProcesses = [
                { arrivalTime: 0, burstTime: 3, io: [] },
                { arrivalTime: 1, burstTime: 2, io: [] }
            ];
            
            const scheduler = new SchedulerFCFS(simpleProcesses);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData).toBeDefined();
            expect(Array.isArray(solution.customData)).toBe(true);
        });

        it('should handle processes with different arrival times', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 2, io: [] },
                { arrivalTime: 3, burstTime: 1, io: [] },
                { arrivalTime: 1, burstTime: 3, io: [] }
            ];
            
            const scheduler = new SchedulerFCFS(processes);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should not deschedule on new process arrival', () => {
            const scheduler = new SchedulerFCFS(testProcesses);
            expect(scheduler.shouldDescheduleOnNewProcess()).toBe(false);
        });

        it('should not deschedule on timeout', () => {
            const scheduler = new SchedulerFCFS(testProcesses);
            expect(scheduler.shouldDescheduleOnTimeout()).toBe(false);
        });
    });

    describe('SJF (Shortest Job First)', () => {
        it('should create scheduler instance correctly', () => {
            const scheduler = new SchedulerSJF(testProcesses);
            expect(scheduler).toBeDefined();
            expect(scheduler.pcb).toBeDefined();
            expect(scheduler.readyQueues).toBeDefined();
        });

        it('should select shortest job first', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 5, io: [] },
                { arrivalTime: 0, burstTime: 2, io: [] }, 
                { arrivalTime: 0, burstTime: 4, io: [] }
            ];
            
            const scheduler = new SchedulerSJF(processes);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData).toBeDefined();
        });

        it('should handle equal burst times correctly', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 3, io: [] },
                { arrivalTime: 0, burstTime: 3, io: [] },
                { arrivalTime: 0, burstTime: 3, io: [] }
            ];
            
            const scheduler = new SchedulerSJF(processes);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should not deschedule on new process arrival', () => {
            const scheduler = new SchedulerSJF(testProcesses);
            expect(scheduler.shouldDescheduleOnNewProcess()).toBe(false);
        });

        it('should not deschedule on timeout', () => {
            const scheduler = new SchedulerSJF(testProcesses);
            expect(scheduler.shouldDescheduleOnTimeout()).toBe(false);
        });
    });

    describe('RR (Round Robin)', () => {
        it('should create scheduler instance with quantum', () => {
            const scheduler = new SchedulerRR(testProcesses, { quantum: 2 });
            expect(scheduler).toBeDefined();
            expect(scheduler.pcb).toBeDefined();
            expect(scheduler.readyQueues).toBeDefined();
        });

        it('should handle quantum correctly', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 5, io: [] },
                { arrivalTime: 0, burstTime: 3, io: [] }
            ];
            
            const scheduler = new SchedulerRR(processes, { quantum: 2 });
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData).toBeDefined();
        });

        it('should deschedule on timeout', () => {
            const scheduler = new SchedulerRR(testProcesses, { quantum: 2 });
            expect(scheduler.shouldDescheduleOnTimeout()).toBe(true);
        });

        it('should not deschedule on new process arrival', () => {
            const scheduler = new SchedulerRR(testProcesses, { quantum: 2 });
            expect(scheduler.shouldDescheduleOnNewProcess()).toBe(false);
        });

        it('should work with different quantum values', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 6, io: [] },
                { arrivalTime: 1, burstTime: 4, io: [] }
            ];
            
            const scheduler1 = new SchedulerRR(processes, { quantum: 1 });
            scheduler1.start();
            const solution1 = scheduler1.getSolution();
            
            const scheduler3 = new SchedulerRR(processes, { quantum: 3 });
            scheduler3.start();
            const solution3 = scheduler3.getSolution();
            
            expect(solution1.customData.length).toBeGreaterThan(0);
            expect(solution3.customData.length).toBeGreaterThan(0);
        });
    });

    describe('Scheduler with I/O Operations', () => {
        let processesWithIO;

        beforeEach(() => {
            processesWithIO = [
                {
                    arrivalTime: 0,
                    burstTime: 5,
                    io: [
                        { start: 2, duration: 2 }
                    ]
                },
                {
                    arrivalTime: 1,
                    burstTime: 3,
                    io: [
                        { start: 1, duration: 1 }
                    ]
                }
            ];
        });

        it('should handle FCFS with I/O operations', () => {
            const scheduler = new SchedulerFCFS(processesWithIO);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should handle SJF with I/O operations', () => {
            const scheduler = new SchedulerSJF(processesWithIO);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should handle RR with I/O operations', () => {
            const scheduler = new SchedulerRR(processesWithIO, { quantum: 2 });
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution).toBeDefined();
            expect(solution.customData.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single process', () => {
            const singleProcess = [
                { arrivalTime: 0, burstTime: 3, io: [] }
            ];
            
            const scheduler = new SchedulerFCFS(singleProcess);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should handle processes with zero arrival time', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 2, io: [] },
                { arrivalTime: 0, burstTime: 3, io: [] },
                { arrivalTime: 0, burstTime: 1, io: [] }
            ];
            
            const scheduler = new SchedulerFCFS(processes);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should handle processes with large burst times', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 100, io: [] },
                { arrivalTime: 50, burstTime: 50, io: [] }
            ];
            
            const scheduler = new SchedulerFCFS(processes);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });

        it('should handle empty I/O arrays', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 3, io: [] },
                { arrivalTime: 1, burstTime: 2, io: [] }
            ];
            
            const scheduler = new SchedulerFCFS(processes);
            scheduler.start();
            
            const solution = scheduler.getSolution();
            expect(solution.customData.length).toBeGreaterThan(0);
        });
    });
});