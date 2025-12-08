import { describe, it, beforeEach, expect } from '@jest/globals';
import { simulateDiskScheduling } from '../../services/diskSchedulingService.js';

describe('Disk Scheduling Algorithms', () => {
    let testRequests;
    let initialHeadPosition;
    let maxDiskSize;
    let headDirection;

    beforeEach(() => {
        testRequests = [98, 183, 37, 122, 14, 124, 65, 67];
        initialHeadPosition = 50;
        maxDiskSize = 200;
        headDirection = "right";
    });

    describe('Input Validation', () => {
        it('should throw error for empty requests array', () => {
            expect(() => {
                simulateDiskScheduling('fcfs', [], initialHeadPosition, maxDiskSize, headDirection);
            }).toThrow('Requests must be a non-empty array');
        });

        it('should throw error for non-array requests', () => {
            expect(() => {
                simulateDiskScheduling('fcfs', null, initialHeadPosition, maxDiskSize, headDirection);
            }).toThrow('Requests must be a non-empty array');
        });

        it('should throw error for invalid initial head position', () => {
            expect(() => {
                simulateDiskScheduling('fcfs', testRequests, -1, maxDiskSize, headDirection);
            }).toThrow('Initial head position must be within disk bounds');

            expect(() => {
                simulateDiskScheduling('fcfs', testRequests, maxDiskSize, maxDiskSize, headDirection);
            }).toThrow('Initial head position must be within disk bounds');
        });

        it('should throw error for unknown algorithm', () => {
            expect(() => {
                simulateDiskScheduling('unknown', testRequests, initialHeadPosition, maxDiskSize, headDirection);
            }).toThrow('Unknown algorithm: unknown');
        });

        it('should filter out invalid requests', () => {
            const invalidRequests = [98, -5, 183, 250, 37, 122];
            const result = simulateDiskScheduling('fcfs', invalidRequests, initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result.requests).toEqual([98, 183, 37, 122]);
            expect(result.requestCount).toBe(4);
        });

        it('should throw error when all requests are invalid', () => {
            const invalidRequests = [-5, 250, 300, -10];
            expect(() => {
                simulateDiskScheduling('fcfs', invalidRequests, initialHeadPosition, maxDiskSize, headDirection);
            }).toThrow('No valid requests within disk bounds');
        });
    });

    describe('FCFS (First Come First Serve)', () => {
        it('should create correct result structure', () => {
            const result = simulateDiskScheduling('fcfs', testRequests, initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result).toHaveProperty('sequence');
            expect(result).toHaveProperty('totalSeekTime');
            expect(result).toHaveProperty('averageSeekTime');
            expect(result).toHaveProperty('steps');
            expect(result).toHaveProperty('algorithm', 'fcfs');
            expect(result).toHaveProperty('initialHeadPosition', initialHeadPosition);
            expect(result).toHaveProperty('maxDiskSize', maxDiskSize);
            expect(result).toHaveProperty('headDirection', headDirection);
        });

        it('should process requests in order', () => {
            const result = simulateDiskScheduling('fcfs', testRequests, initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result.sequence[0]).toBe(initialHeadPosition);
            expect(result.sequence[1]).toBe(testRequests[0]);
            expect(result.sequence[2]).toBe(testRequests[1]);
            expect(result.sequence.length).toBe(testRequests.length + 1);
        });

        it('should calculate correct seek times', () => {
            const simpleRequests = [100, 150, 50];
            const result = simulateDiskScheduling('fcfs', simpleRequests, 75, maxDiskSize, headDirection);
            
            const expectedSeekTime = Math.abs(100 - 75) + Math.abs(150 - 100) + Math.abs(50 - 150);
            expect(result.totalSeekTime).toBe(expectedSeekTime);
            expect(result.averageSeekTime).toBe(expectedSeekTime / simpleRequests.length);
        });

        it('should provide detailed steps', () => {
            const result = simulateDiskScheduling('fcfs', [100, 150], 75, maxDiskSize, headDirection);
            
            expect(result.steps).toHaveLength(3); // Initial + 2 requests
            expect(result.steps[0]).toHaveProperty('step', 0);
            expect(result.steps[0]).toHaveProperty('currentPosition', 75);
            expect(result.steps[0]).toHaveProperty('explanation');
            expect(result.steps[1]).toHaveProperty('targetRequest', 100);
            expect(result.steps[2]).toHaveProperty('targetRequest', 150);
        });

        it('should handle single request', () => {
            const result = simulateDiskScheduling('fcfs', [100], initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result.sequence).toEqual([initialHeadPosition, 100]);
            expect(result.totalSeekTime).toBe(Math.abs(100 - initialHeadPosition));
            expect(result.steps).toHaveLength(2);
        });
    });

    describe('SSTF (Shortest Seek Time First)', () => {
        it('should select closest request first', () => {
            const requests = [100, 40, 60, 80];
            const result = simulateDiskScheduling('sstf', requests, 50, maxDiskSize, headDirection);
            
            // From position 50, closest should be 40 (distance 10), then 60 (distance 20), etc.
            expect(result.sequence[1]).toBe(40); // Closest to 50
        });

        it('should calculate optimal seek time', () => {
            const requests = [100, 40, 60];
            const result = simulateDiskScheduling('sstf', requests, 50, maxDiskSize, headDirection);
            
            // Optimal path: 50 -> 40 -> 60 -> 100
            const expectedSeekTime = Math.abs(40 - 50) + Math.abs(60 - 40) + Math.abs(100 - 60);
            expect(result.totalSeekTime).toBe(expectedSeekTime);
        });

        it('should provide detailed steps with seek time analysis', () => {
            const requests = [100, 40];
            const result = simulateDiskScheduling('sstf', requests, 50, maxDiskSize, headDirection);
            
            expect(result.steps[1].explanation).toContain('seek times');
            expect(result.steps[1].explanation).toContain('Closest request');
        });

        it('should handle equal seek times consistently', () => {
            const requests = [40, 60]; // Both 10 units away from 50
            const result = simulateDiskScheduling('sstf', requests, 50, maxDiskSize, headDirection);
            
            expect(result.sequence).toHaveLength(3);
            expect([40, 60]).toContain(result.sequence[1]);
        });
    });

    describe('SCAN (Elevator)', () => {
        it('should move in specified direction first', () => {
            const requests = [40, 60, 80, 100];
            const resultRight = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'right');
            const resultLeft = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'left');
            
            // Right direction should service 60, 80, 100 first
            expect(resultRight.sequence[1]).toBe(60);
            
            // Left direction should service 40 first
            expect(resultLeft.sequence[1]).toBe(40);
        });

        it('should reach disk boundary when moving right', () => {
            const requests = [60, 80, 100];
            const result = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'right');
            
            // Should reach end of disk (199) after servicing right requests
            expect(result.sequence).toContain(maxDiskSize - 1);
        });

        it('should reach disk boundary when moving left', () => {
            const requests = [40, 30, 20];
            const result = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'left');
            
            // Should reach beginning of disk (0) after servicing left requests
            expect(result.sequence).toContain(0);
        });

        it('should provide directional explanations', () => {
            const requests = [60, 40];
            const result = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'right');
            
            expect(result.steps[0].explanation).toContain('moving right');
            expect(result.steps.some(step => step.explanation.includes('reversing direction') || step.explanation.includes('Moving left'))).toBe(true);
        });
    });

    describe('C-SCAN (Circular SCAN)', () => {
        it('should jump to beginning after reaching end', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('cscan', requests, 50, maxDiskSize, 'right');
            
            // Should contain both end (199) and beginning (0) positions
            expect(result.sequence).toContain(maxDiskSize - 1);
            expect(result.sequence).toContain(0);
        });

        it('should service requests in circular manner', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('cscan', requests, 50, maxDiskSize, 'right');
            
            // Should service right requests first, then jump and service left requests
            const rightIndex = result.sequence.indexOf(60);
            const leftIndex = result.sequence.indexOf(40);
            expect(rightIndex).toBeLessThan(leftIndex);
        });

        it('should provide jump explanations', () => {
            const requests = [60, 40];
            const result = simulateDiskScheduling('cscan', requests, 50, maxDiskSize, 'right');
            
            expect(result.steps.some(step => step.explanation.includes('C-SCAN jump'))).toBe(true);
        });
    });

    describe('LOOK Algorithm', () => {
        it('should not go to disk boundaries unnecessarily', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('look', requests, 50, maxDiskSize, 'right');
            
            // Should NOT contain disk boundaries if no requests there
            expect(result.sequence).not.toContain(0);
            expect(result.sequence).not.toContain(maxDiskSize - 1);
        });

        it('should reverse direction after servicing all requests in one direction', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('look', requests, 50, maxDiskSize, 'right');
            
            // Should service 60, 80 first (right), then 40, 30 (left)
            const seq = result.sequence;
            const pos60 = seq.indexOf(60);
            const pos80 = seq.indexOf(80);
            const pos40 = seq.indexOf(40);
            const pos30 = seq.indexOf(30);
            
            expect(pos60).toBeLessThan(pos80);
            expect(pos80).toBeLessThan(pos40);
            expect(pos40).toBeLessThan(pos30);
        });

        it('should provide reversal explanations', () => {
            const requests = [60, 40];
            const result = simulateDiskScheduling('look', requests, 50, maxDiskSize, 'right');
            
            expect(result.steps.some(step => step.explanation.includes('Reversing direction'))).toBe(true);
        });
    });

    describe('C-LOOK (Circular LOOK)', () => {
        it('should jump to leftmost/rightmost request', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('clook', requests, 50, maxDiskSize, 'right');
            
            // Should jump from rightmost to leftmost request
            const jumpStep = result.steps.find(step => step.explanation.includes('C-LOOK jump'));
            expect(jumpStep).toBeDefined();
        });

        it('should not visit disk boundaries', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('clook', requests, 50, maxDiskSize, 'right');
            
            expect(result.sequence).not.toContain(0);
            expect(result.sequence).not.toContain(maxDiskSize - 1);
        });

        it('should service requests in circular order', () => {
            const requests = [60, 80, 40, 30];
            const result = simulateDiskScheduling('clook', requests, 50, maxDiskSize, 'right');
            
            // Should service right requests first, then jump to leftmost and continue right
            const seq = result.sequence;
            const pos60 = seq.indexOf(60);
            const pos80 = seq.indexOf(80);
            const pos30 = seq.indexOf(30); // leftmost
            const pos40 = seq.indexOf(40);
            
            expect(pos60).toBeLessThan(pos80);
            expect(pos80).toBeLessThan(pos30); // Jump to leftmost
            expect(pos30).toBeLessThan(pos40); // Continue right from leftmost
        });
    });

    describe('Algorithm Comparison', () => {
        it('should produce different results for different algorithms', () => {
            const requests = [98, 183, 37, 122, 14, 124, 65, 67];
            
            const fcfsResult = simulateDiskScheduling('fcfs', requests, 50, maxDiskSize, 'right');
            const sstfResult = simulateDiskScheduling('sstf', requests, 50, maxDiskSize, 'right');
            const scanResult = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'right');
            
            // SSTF should generally have lower seek time than FCFS
            expect(sstfResult.totalSeekTime).toBeLessThanOrEqual(fcfsResult.totalSeekTime);
            
            // Sequences should be different
            expect(fcfsResult.sequence).not.toEqual(sstfResult.sequence);
            expect(fcfsResult.sequence).not.toEqual(scanResult.sequence);
        });

        it('should maintain consistent initial and final positions', () => {
            const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
            
            algorithms.forEach(algorithm => {
                const result = simulateDiskScheduling(algorithm, testRequests, initialHeadPosition, maxDiskSize, headDirection);
                
                expect(result.sequence[0]).toBe(initialHeadPosition);
                expect(result.sequence.length).toBeGreaterThan(testRequests.length);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle requests at disk boundaries', () => {
            const requests = [0, maxDiskSize - 1];
            const result = simulateDiskScheduling('fcfs', requests, initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result.sequence).toContain(0);
            expect(result.sequence).toContain(maxDiskSize - 1);
        });

        it('should handle request at current head position', () => {
            const requests = [initialHeadPosition, 100];
            const result = simulateDiskScheduling('fcfs', requests, initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result.sequence[1]).toBe(initialHeadPosition);
            expect(result.steps[1].seekDistance).toBe(0);
        });

        it('should handle all requests on one side', () => {
            const requests = [60, 70, 80, 90]; // All to the right of initial position 50
            const result = simulateDiskScheduling('scan', requests, 50, maxDiskSize, 'right');
            
            expect(result.sequence.every(pos => pos >= 50 || pos === 50)).toBe(true);
        });

        it('should handle large disk sizes', () => {
            const largeDiskSize = 10000;
            const requests = [1000, 5000, 9000];
            const result = simulateDiskScheduling('fcfs', requests, 500, largeDiskSize, headDirection);
            
            expect(result.maxDiskSize).toBe(largeDiskSize);
            expect(result.sequence).toContain(1000);
            expect(result.sequence).toContain(5000);
            expect(result.sequence).toContain(9000);
        });

        it('should handle duplicate requests', () => {
            const requests = [100, 100, 150, 150];
            const result = simulateDiskScheduling('fcfs', requests, initialHeadPosition, maxDiskSize, headDirection);
            
            expect(result.sequence.filter(pos => pos === 100)).toHaveLength(2);
            expect(result.sequence.filter(pos => pos === 150)).toHaveLength(2);
        });
    });

    describe('Step-by-Step Execution', () => {
        it('should provide complete step information', () => {
            const result = simulateDiskScheduling('fcfs', [100, 150], 50, maxDiskSize, headDirection);
            
            result.steps.forEach((step, index) => {
                expect(step).toHaveProperty('step', index);
                expect(step).toHaveProperty('currentPosition');
                expect(step).toHaveProperty('seekDistance');
                expect(step).toHaveProperty('totalSeekTime');
                expect(step).toHaveProperty('explanation');
                expect(step).toHaveProperty('remainingRequests');
                
                if (index > 0) {
                    expect(step).toHaveProperty('targetRequest');
                }
            });
        });

        it('should track remaining requests correctly', () => {
            const requests = [100, 150, 200];
            const result = simulateDiskScheduling('fcfs', requests, 50, maxDiskSize, headDirection);
            
            expect(result.steps[0].remainingRequests).toEqual(requests);
            expect(result.steps[1].remainingRequests).toEqual([150, 200]);
            expect(result.steps[2].remainingRequests).toEqual([200]);
            expect(result.steps[3].remainingRequests).toEqual([]);
        });

        it('should accumulate seek time correctly', () => {
            const result = simulateDiskScheduling('fcfs', [100, 150], 50, maxDiskSize, headDirection);
            
            expect(result.steps[0].totalSeekTime).toBe(0);
            expect(result.steps[1].totalSeekTime).toBe(50); // |100 - 50|
            expect(result.steps[2].totalSeekTime).toBe(100); // 50 + |150 - 100|
        });

        it('should provide meaningful explanations', () => {
            const result = simulateDiskScheduling('sstf', [100, 40], 50, maxDiskSize, headDirection);
            
            expect(result.steps[0].explanation).toContain('SSTF');
            expect(result.steps[1].explanation).toContain('seek times');
            expect(result.steps[1].explanation).toContain('Closest request');
        });
    });
});