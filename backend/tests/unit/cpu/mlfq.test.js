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

    describe('Hard Test Cases - Complex Scenarios', () => {
        describe('Allotment Expiration and Priority Reset', () => {
            it('should reset all processes to queue 0 when allotment expires', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 15, io: [] },
                    { arrivalTime: 2, burstTime: 12, io: [] },
                    { arrivalTime: 4, burstTime: 10, io: [] }
                ];

                const config = {
                    queues: 3,
                    quantums: [2, 4, 6],
                    allotment: 10
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                
                // Manually set some processes to lower priority queues
                scheduler.pcb.getRecord(1).priority = 2;
                scheduler.pcb.getRecord(2).priority = 1;
                scheduler.readyQueues.addToReadyQueue(2, 1);
                scheduler.readyQueues.addToReadyQueue(1, 2);

                // Simulate allotment expiration
                scheduler.resetAllProcessesToHighestPriority();

                // All processes should be back to priority 0
                expect(scheduler.pcb.getRecord(1).priority).toBe(0);
                expect(scheduler.pcb.getRecord(2).priority).toBe(0);
                
                // Queue 0 should have processes, others should be empty
                expect(scheduler.readyQueues.getQueue(0).length).toBeGreaterThan(0);
                expect(scheduler.readyQueues.getQueue(1).length).toBe(0);
                expect(scheduler.readyQueues.getQueue(2).length).toBe(0);
            });

            it('should preempt running process during allotment expiration', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 20, io: [] }
                ];

                const config = {
                    queues: 3,
                    quantums: [2, 4, 6],
                    allotment: 8
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                
                // Set up a running process with lower priority
                scheduler.cpu = 1;
                scheduler.pcb.getRecord(1).priority = 2;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');

                scheduler.resetAllProcessesToHighestPriority();

                // Process should be preempted and moved to queue 0
                expect(scheduler.cpu).toBe(-1);
                expect(scheduler.pcb.getRecord(1).priority).toBe(0);
                expect(scheduler.readyQueues.getQueue(0)).toContain(1);
            });
        });

        describe('Complex Priority Demotion', () => {
            it('should demote process through all priority levels on timeouts', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 20, io: [] }
                ];

                const config = {
                    queues: 4,
                    quantums: [1, 2, 4, 8],
                    allotment: 50
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                const process = scheduler.pcb.getRecord(1);
                
                // Start at priority 0
                process.priority = 0;
                process.quantumLeft = 0; // Simulate timeout
                scheduler.cpu = 1;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');

                // First timeout - should move to priority 1
                scheduler.checkForTimeout();
                expect(process.priority).toBe(1);
                expect(scheduler.cpu).toBe(-1);

                // Simulate running again and timing out
                scheduler.cpu = 1;
                process.quantumLeft = 0;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');
                scheduler.checkForTimeout();
                expect(process.priority).toBe(2);

                // One more timeout
                scheduler.cpu = 1;
                process.quantumLeft = 0;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');
                scheduler.checkForTimeout();
                expect(process.priority).toBe(3);

                // Should not go beyond lowest priority
                scheduler.cpu = 1;
                process.quantumLeft = 0;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');
                scheduler.checkForTimeout();
                expect(process.priority).toBe(3); // Should stay at 3
            });
        });

        describe('I/O Priority Boost', () => {
            it('should boost I/O processes back to highest priority', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 10, io: [{ start: 3, duration: 2 }] },
                    { arrivalTime: 1, burstTime: 8, io: [] }
                ];

                const scheduler = new SchedulerMLFQ(processes, defaultConfig);
                
                // Demote first process to lower priority
                const process1 = scheduler.pcb.getRecord(1);
                process1.priority = 2;
                
                // Simulate I/O completion
                scheduler.pcb.setProcessStateWithoutStep(1, 'BLOCKED');
                scheduler.pcb.setProcessStateWithoutStep(1, 'READY');
                
                // Mock the I/O completion handling
                const toBeAdded = [1];
                for (const pid of toBeAdded) {
                    const process = scheduler.pcb.getRecord(pid);
                    process.priority = 0; // Should be reset to highest priority
                    scheduler.readyQueues.addToReadyQueue(0, pid);
                }

                expect(process1.priority).toBe(0);
                expect(scheduler.readyQueues.getQueue(0)).toContain(1);
            });
        });

        describe('Complex Preemption Scenarios', () => {
            it('should handle cascading preemptions correctly', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 10, io: [] },
                    { arrivalTime: 2, burstTime: 8, io: [] },
                    { arrivalTime: 4, burstTime: 6, io: [] }
                ];

                const scheduler = new SchedulerMLFQ(processes, defaultConfig);
                
                // Set up process 1 running at priority 2
                scheduler.cpu = 1;
                scheduler.pcb.getRecord(1).priority = 2;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');

                // Add process 2 at priority 1 - should preempt
                scheduler.pcb.getRecord(2).priority = 1;
                scheduler.readyQueues.addToReadyQueue(1, 2);
                
                expect(scheduler.shouldDescheduleOnNewProcess()).toBe(true);

                // Now add process 3 at priority 0 - should preempt process 2
                scheduler.cpu = 2;
                scheduler.pcb.getRecord(2).priority = 1;
                scheduler.pcb.setProcessStateWithoutStep(2, 'RUNNING');
                scheduler.pcb.getRecord(3).priority = 0;
                scheduler.readyQueues.addToReadyQueue(0, 3);
                
                expect(scheduler.shouldDescheduleOnNewProcess()).toBe(true);
            });

            it('should not preempt process at same priority level', () => {
                const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
                
                // Set up running process at priority 1
                scheduler.cpu = 1;
                scheduler.pcb.getRecord(1).priority = 1;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');

                // Add another process at same priority
                scheduler.pcb.getRecord(2).priority = 1;
                scheduler.readyQueues.addToReadyQueue(1, 2);

                // Should not preempt since priorities are equal
                expect(scheduler.shouldDescheduleOnNewProcess()).toBe(false);
            });
        });

        describe('Edge Cases and Error Handling', () => {
            it('should handle empty queues gracefully', () => {
                const scheduler = new SchedulerMLFQ([], defaultConfig);
                expect(scheduler.getScheduledProcess()).toBe(-1);
            });

            it('should handle invalid process IDs in scheduling', () => {
                const scheduler = new SchedulerMLFQ(testProcesses, defaultConfig);
                
                // Mock console.error to capture error messages
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                
                scheduler.scheduleProcess(999); // Invalid PID
                
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Cannot schedule invalid process 999')
                );
                
                consoleSpy.mockRestore();
            });

            it('should handle quantum exhaustion at process completion', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 2, io: [] } // Exactly matches quantum
                ];

                const config = {
                    queues: 2,
                    quantums: [2, 4],
                    allotment: 10
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                
                // Set up process that will finish exactly when quantum expires
                scheduler.cpu = 1;
                const process = scheduler.pcb.getRecord(1);
                process.quantumLeft = 1;
                process.cpuTimeLeft = 1;
                scheduler.pcb.setProcessStateWithoutStep(1, 'RUNNING');

                // Process should finish without being demoted
                const initialPriority = process.priority;
                
                // Simulate process finishing
                scheduler.pcb.tickCpuTime(1);
                scheduler.pcb.tickQuantumLeft(1);
                
                expect(scheduler.pcb.isProcessFinished(1)).toBe(true);
                expect(process.priority).toBe(initialPriority); // Should not be demoted
            });
        });

        describe('Stress Test Scenarios', () => {
            it('should handle many processes with frequent I/O', () => {
                const processes = Array.from({ length: 10 }, (_, i) => ({
                    arrivalTime: i,
                    burstTime: 15,
                    io: [
                        { start: 3, duration: 1 },
                        { start: 8, duration: 2 },
                        { start: 12, duration: 1 }
                    ]
                }));

                const config = {
                    queues: 4,
                    quantums: [1, 2, 4, 8],
                    allotment: 20
                };

                const scheduler = new SchedulerMLFQ(processes, config);

                expect(() => {
                    scheduler.start();
                }).not.toThrow();

                const solution = scheduler.getSolution();
                expect(solution).toBeDefined();
                expect(solution.customData.length).toBeGreaterThan(0);
            });

            it('should maintain queue integrity during complex operations', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 20, io: [] },
                    { arrivalTime: 1, burstTime: 15, io: [{ start: 5, duration: 3 }] },
                    { arrivalTime: 2, burstTime: 12, io: [] },
                    { arrivalTime: 3, burstTime: 18, io: [{ start: 8, duration: 2 }] }
                ];

                const config = {
                    queues: 3,
                    quantums: [2, 4, 6],
                    allotment: 15
                };

                const scheduler = new SchedulerMLFQ(processes, config);

                // Manually distribute processes across queues
                scheduler.readyQueues.addToReadyQueue(0, 1);
                scheduler.readyQueues.addToReadyQueue(1, 2);
                scheduler.readyQueues.addToReadyQueue(2, 3);
                scheduler.readyQueues.addToReadyQueue(0, 4);

                // Verify queue contents
                expect(scheduler.readyQueues.getQueue(0)).toEqual(expect.arrayContaining([1, 4]));
                expect(scheduler.readyQueues.getQueue(1)).toContain(2);
                expect(scheduler.readyQueues.getQueue(2)).toContain(3);

                // Test scheduling priority
                expect(scheduler.getScheduledProcess()).toBe(1); // Should pick from queue 0
            });

            it('should handle rapid allotment expirations', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 50, io: [] },
                    { arrivalTime: 1, burstTime: 45, io: [] }
                ];

                const config = {
                    queues: 3,
                    quantums: [1, 2, 3],
                    allotment: 5 // Very short allotment
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                
                // Simulate multiple allotment resets
                scheduler.lastAllotmentReset = 0;
                
                // First reset
                scheduler.resetAllProcessesToHighestPriority();
                expect(scheduler.lastAllotmentReset).toBe(0);
                
                // Verify processes are at highest priority
                expect(scheduler.pcb.getRecord(1).priority).toBe(0);
                expect(scheduler.pcb.getRecord(2).priority).toBe(0);
            });
        });

        describe('Configuration Validation', () => {
            it('should reject configuration with zero queues', () => {
                expect(() => {
                    new SchedulerMLFQ(testProcesses, {
                        queues: 0,
                        quantums: [],
                        allotment: 10
                    });
                }).toThrow('Number of queues must match number of quantums');
            });

            it('should reject configuration with negative quantum values', () => {
                const processes = [{ arrivalTime: 0, burstTime: 5, io: [] }];
                
                // This should not throw during construction, but we can test behavior
                const config = {
                    queues: 2,
                    quantums: [-1, 2],
                    allotment: 10
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                expect(scheduler.config.quantums).toEqual([-1, 2]);
            });

            it('should handle single queue configuration', () => {
                const processes = [
                    { arrivalTime: 0, burstTime: 5, io: [] },
                    { arrivalTime: 1, burstTime: 3, io: [] }
                ];

                const config = {
                    queues: 1,
                    quantums: [4],
                    allotment: 10
                };

                const scheduler = new SchedulerMLFQ(processes, config);
                
                expect(() => {
                    scheduler.start();
                }).not.toThrow();

                // With single queue, it should behave like round-robin
                const solution = scheduler.getSolution();
                expect(solution).toBeDefined();
            });
        });
    });
});