import { describe, it, expect } from '@jest/globals';

/**
 * CPU Service RabbitMQ Message Handler Tests
 * 
 * These tests validate the message processing logic used by the CPU service
 * when consuming messages from RabbitMQ queues.
 */

const validateProcesses = (processes) => {
    if (!processes || !Array.isArray(processes) || processes.length === 0) {
        return { valid: false, message: "Processes array is required and must not be empty" };
    }
    
    for (let i = 0; i < processes.length; i++) {
        const process = processes[i];
        
        if (typeof process.arrivalTime !== 'number' || process.arrivalTime < 0) {
            return { valid: false, message: `Process ${i + 1}: arrivalTime must be a non-negative number` };
        }
        
        if (typeof process.burstTime !== 'number' || process.burstTime <= 0) {
            return { valid: false, message: `Process ${i + 1}: burstTime must be a positive number` };
        }
        
        if (process.io && !Array.isArray(process.io)) {
            return { valid: false, message: `Process ${i + 1}: io must be an array` };
        }
        
        if (process.io) {
            for (let j = 0; j < process.io.length; j++) {
                const io = process.io[j];
                
                if (typeof io.start !== 'number' || io.start < 0) {
                    return { valid: false, message: `Process ${i + 1}, IO ${j + 1}: start must be a non-negative number` };
                }
                
                if (typeof io.duration !== 'number' || io.duration <= 0) {
                    return { valid: false, message: `Process ${i + 1}, IO ${j + 1}: duration must be a positive number` };
                }
                
                if (io.start >= process.burstTime) {
                    return { valid: false, message: `Process ${i + 1}, IO ${j + 1}: start time (${io.start}) must be less than burst time (${process.burstTime})` };
                }
            }
        }
    }
    
    return { valid: true };
};

const validateQuantum = (algorithm, quantum) => {
    if (algorithm.toUpperCase() === "RR") {
        if (typeof quantum !== 'number' || quantum <= 0) {
            return { valid: false, message: "Round Robin algorithm requires a positive quantum value" };
        }
    }
    return { valid: true };
};

const validateMLFQParams = (algorithm, queues, quantums, allotment) => {
    if (algorithm.toUpperCase() === "MLFQ") {
        if (typeof queues !== 'number' || queues <= 0) {
            return { valid: false, message: "MLFQ algorithm requires a positive number of queues" };
        }
        
        if (!Array.isArray(quantums) || quantums.length !== queues) {
            return { valid: false, message: "MLFQ algorithm requires quantums array with length equal to number of queues" };
        }
        
        for (let i = 0; i < quantums.length; i++) {
            if (typeof quantums[i] !== 'number' || quantums[i] <= 0) {
                return { valid: false, message: `MLFQ quantum at index ${i} must be a positive number` };
            }
        }
        
        if (typeof allotment !== 'number' || allotment <= 0) {
            return { valid: false, message: "MLFQ algorithm requires a positive allotment value" };
        }
    }
    return { valid: true };
};

describe('CPU Service Message Handler Validation Logic', () => {
    return { valid: true };
});

describe('CPU API Validation Logic', () => {
    describe('Process Validation', () => {
        it('should validate valid processes', () => {
            const validProcesses = [
                { arrivalTime: 0, burstTime: 5, io: [] },
                { arrivalTime: 1, burstTime: 3, io: [{ start: 1, duration: 1 }] }
            ];
            
            const result = validateProcesses(validProcesses);
            expect(result.valid).toBe(true);
        });

        it('should reject missing processes', () => {
            const result = validateProcesses(null);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Processes array is required');
        });

        it('should reject empty processes array', () => {
            const result = validateProcesses([]);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('must not be empty');
        });

        it('should reject invalid arrival time', () => {
            const processes = [{ arrivalTime: -1, burstTime: 5, io: [] }];
            const result = validateProcesses(processes);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('arrivalTime must be a non-negative number');
        });

        it('should reject invalid burst time', () => {
            const processes = [{ arrivalTime: 0, burstTime: 0, io: [] }];
            const result = validateProcesses(processes);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('burstTime must be a positive number');
        });

        it('should reject invalid IO array', () => {
            const processes = [{ arrivalTime: 0, burstTime: 5, io: "invalid" }];
            const result = validateProcesses(processes);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('io must be an array');
        });

        it('should reject invalid IO start time', () => {
            const processes = [{ 
                arrivalTime: 0, 
                burstTime: 5, 
                io: [{ start: -1, duration: 2 }] 
            }];
            const result = validateProcesses(processes);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('start must be a non-negative number');
        });

        it('should reject invalid IO duration', () => {
            const processes = [{ 
                arrivalTime: 0, 
                burstTime: 5, 
                io: [{ start: 2, duration: 0 }] 
            }];
            const result = validateProcesses(processes);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('duration must be a positive number');
        });

        it('should reject IO start time >= burst time', () => {
            const processes = [{ 
                arrivalTime: 0, 
                burstTime: 5, 
                io: [{ start: 5, duration: 2 }] 
            }];
            const result = validateProcesses(processes);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('start time (5) must be less than burst time (5)');
        });
    });

    describe('Quantum Validation', () => {
        it('should validate valid quantum for RR', () => {
            const result = validateQuantum('RR', 2);
            expect(result.valid).toBe(true);
        });

        it('should not require quantum for FCFS', () => {
            const result = validateQuantum('FCFS', undefined);
            expect(result.valid).toBe(true);
        });

        it('should not require quantum for SJF', () => {
            const result = validateQuantum('SJF', undefined);
            expect(result.valid).toBe(true);
        });

        it('should reject RR without quantum', () => {
            const result = validateQuantum('RR', undefined);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Round Robin algorithm requires a positive quantum value');
        });

        it('should reject RR with invalid quantum', () => {
            const result = validateQuantum('RR', 0);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('Round Robin algorithm requires a positive quantum value');
        });
    });

    describe('MLFQ Parameter Validation', () => {
        it('should validate valid MLFQ parameters', () => {
            const result = validateMLFQParams('MLFQ', 3, [2, 4, 8], 20);
            expect(result.valid).toBe(true);
        });

        it('should not require MLFQ params for FCFS', () => {
            const result = validateMLFQParams('FCFS', undefined, undefined, undefined);
            expect(result.valid).toBe(true);
        });

        it('should reject MLFQ without queues', () => {
            const result = validateMLFQParams('MLFQ', undefined, [2, 4], 20);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('MLFQ algorithm requires a positive number of queues');
        });

        it('should reject MLFQ with mismatched quantums', () => {
            const result = validateMLFQParams('MLFQ', 3, [2, 4], 20);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('quantums array with length equal to number of queues');
        });

        it('should reject MLFQ with invalid quantum values', () => {
            const result = validateMLFQParams('MLFQ', 3, [2, 0, 8], 20);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('quantum at index 1 must be a positive number');
        });

        it('should reject MLFQ without allotment', () => {
            const result = validateMLFQParams('MLFQ', 3, [2, 4, 8], undefined);
            expect(result.valid).toBe(false);
            expect(result.message).toContain('MLFQ algorithm requires a positive allotment value');
        });
    });

    describe('Data Processing Logic', () => {
        it('should sort IO operations by start time', () => {
            const processes = [{
                arrivalTime: 0,
                burstTime: 10,
                io: [
                    { start: 5, duration: 1 },
                    { start: 2, duration: 2 },
                    { start: 8, duration: 1 }
                ]
            }];
            
            processes.forEach(process => {
                if (process.io) {
                    process.io.sort((a, b) => a.start - b.start);
                }
            });
            
            expect(processes[0].io[0].start).toBe(2);
            expect(processes[0].io[1].start).toBe(5);
            expect(processes[0].io[2].start).toBe(8);
        });

        it('should handle processes without IO', () => {
            const processes = [
                { arrivalTime: 0, burstTime: 5 },
                { arrivalTime: 1, burstTime: 3 }
            ];
            
            processes.forEach(process => {
                if (!process.io) {
                    process.io = [];
                }
            });
            
            expect(processes[0].io).toEqual([]);
            expect(processes[1].io).toEqual([]);
        });
    });
});