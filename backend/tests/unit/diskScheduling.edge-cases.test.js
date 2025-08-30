import { describe, it, expect } from '@jest/globals';
import { simulateDiskScheduling } from '../../services/diskSchedulingService.js';

describe('Disk Scheduling Edge Cases and Boundary Tests', () => {
    describe('Boundary Value Testing', () => {
        it('should handle minimum disk size', () => {
            const result = simulateDiskScheduling('fcfs', [0], 0, 1, 'right');
            
            expect(result.maxDiskSize).toBe(1);
            expect(result.sequence).toEqual([0, 0]);
            expect(result.totalSeekTime).toBe(0);
        });

        it('should handle maximum practical disk size', () => {
            const largeDisk = 100000;
            const requests = [10000, 50000, 90000];
            const result = simulateDiskScheduling('fcfs', requests, 25000, largeDisk, 'right');
            
            expect(result.maxDiskSize).toBe(largeDisk);
            expect(result.sequence).toHaveLength(4);
            expect(result.totalSeekTime).toBeGreaterThan(0);
        });

        it('should handle head at disk boundaries', () => {
            // Head at beginning
            const resultStart = simulateDiskScheduling('fcfs', [50, 100], 0, 200, 'right');
            expect(resultStart.initialHeadPosition).toBe(0);
            expect(resultStart.sequence[0]).toBe(0);
            
            // Head at end
            const resultEnd = simulateDiskScheduling('fcfs', [50, 100], 199, 200, 'right');
            expect(resultEnd.initialHeadPosition).toBe(199);
            expect(resultEnd.sequence[0]).toBe(199);
        });

        it('should handle requests at disk boundaries', () => {
            const requests = [0, 199];
            const result = simulateDiskScheduling('fcfs', requests, 100, 200, 'right');
            
            expect(result.sequence).toContain(0);
            expect(result.sequence).toContain(199);
            expect(result.totalSeekTime).toBe(100 + 199); // 100->0 + 0->199
        });
    });

    describe('Special Request Patterns', () => {
        it('should handle all requests identical to head position', () => {
            const requests = [50, 50, 50, 50];
            const result = simulateDiskScheduling('fcfs', requests, 50, 200, 'right');
            
            expect(result.totalSeekTime).toBe(0);
            expect(result.averageSeekTime).toBe(0);
            expect(result.sequence.every(pos => pos === 50)).toBe(true);
        });

        it('should handle alternating extreme requests', () => {
            const requests = [0, 199, 0, 199, 0, 199];
            const result = simulateDiskScheduling('fcfs', requests, 100, 200, 'right');
            
            // Should have very high seek time due to thrashing
            expect(result.totalSeekTime).toBeGreaterThan(1000);
            expect(result.sequence).toHaveLength(7); // Initial + 6 requests
        });

        it('should handle perfectly sequential requests', () => {
            const requests = [51, 52, 53, 54, 55];
            const result = simulateDiskScheduling('fcfs', requests, 50, 200, 'right');
            
            expect(result.totalSeekTime).toBe(5); // 1 seek per request
            expect(result.averageSeekTime).toBe(1);
        });

        it('should handle reverse sequential requests', () => {
            const requests = [49, 48, 47, 46, 45];
            const result = simulateDiskScheduling('fcfs', requests, 50, 200, 'right');
            
            expect(result.totalSeekTime).toBe(5); // 1 seek per request
            expect(result.averageSeekTime).toBe(1);
        });

        it('should handle clustered requests', () => {
            const cluster1 = [50, 51, 52, 53];
            const cluster2 = [150, 151, 152, 153];
            const requests = [...cluster1, ...cluster2];
            
            const fcfsResult = simulateDiskScheduling('fcfs', requests, 25, 200, 'right');
            const sstfResult = simulateDiskScheduling('sstf', requests, 25, 200, 'right');
            
            // SSTF should handle clusters more efficiently
            expect(sstfResult.totalSeekTime).toBeLessThanOrEqual(fcfsResult.totalSeekTime);
        });
    });

    describe('Algorithm-Specific Edge Cases', () => {
        describe('SSTF Edge Cases', () => {
            it('should handle tie-breaking consistently', () => {
                // Two requests equidistant from head
                const requests = [40, 60]; // Both 10 units from position 50
                const result1 = simulateDiskScheduling('sstf', requests, 50, 200, 'right');
                const result2 = simulateDiskScheduling('sstf', requests, 50, 200, 'right');
                
                // Should be consistent across runs
                expect(result1.sequence).toEqual(result2.sequence);
                expect(result1.totalSeekTime).toBe(result2.totalSeekTime);
            });

            it('should handle all requests equidistant', () => {
                const requests = [40, 60, 30, 70]; // All different distances but some equal
                const result = simulateDiskScheduling('sstf', requests, 50, 200, 'right');
                
                expect(result.sequence).toHaveLength(5);
                expect(result.totalSeekTime).toBeGreaterThan(0);
            });
        });

        describe('SCAN Edge Cases', () => {
            it('should handle no requests in initial direction', () => {
                // All requests to the left, but moving right initially
                const requests = [10, 20, 30, 40];
                const result = simulateDiskScheduling('scan', requests, 50, 200, 'right');
                
                // Should go to end first, then service all requests
                expect(result.sequence).toContain(199);
                expect(result.sequence.indexOf(199)).toBeLessThan(result.sequence.indexOf(40));
            });

            it('should handle all requests in initial direction', () => {
                // All requests to the right, moving right
                const requests = [60, 70, 80, 90];
                const result = simulateDiskScheduling('scan', requests, 50, 200, 'right');
                
                // Should service all requests, then go to end
                expect(result.sequence).toContain(199);
                expect(result.sequence.indexOf(90)).toBeLessThan(result.sequence.indexOf(199));
            });

            it('should handle single request in opposite direction', () => {
                const requests = [30]; // Single request to the left
                const result = simulateDiskScheduling('scan', requests, 50, 200, 'right');
                
                // Should go to end first, then service the single request
                expect(result.sequence).toEqual([50, 199, 30]);
                expect(result.totalSeekTime).toBe(149 + 169); // 50->199 + 199->30
            });
        });

        describe('C-SCAN Edge Cases', () => {
            it('should handle no requests requiring circular jump', () => {
                // All requests in the same direction
                const requests = [60, 70, 80, 90];
                const result = simulateDiskScheduling('cscan', requests, 50, 200, 'right');
                
                // Should still go to end and beginning even if no left requests
                expect(result.sequence).toContain(199);
                expect(result.sequence).toContain(0);
            });

            it('should handle requests only requiring circular jump', () => {
                // All requests to the left, moving right
                const requests = [10, 20, 30, 40];
                const result = simulateDiskScheduling('cscan', requests, 50, 200, 'right');
                
                // Should go to end, jump to beginning, then service all requests
                expect(result.sequence).toContain(199);
                expect(result.sequence).toContain(0);
                expect(result.sequence.indexOf(0)).toBeGreaterThan(result.sequence.indexOf(199));
            });
        });

        describe('LOOK Edge Cases', () => {
            it('should not visit boundaries when unnecessary', () => {
                const requests = [60, 70, 40, 30];
                const result = simulateDiskScheduling('look', requests, 50, 200, 'right');
                
                // Should not visit 0 or 199
                expect(result.sequence).not.toContain(0);
                expect(result.sequence).not.toContain(199);
                
                // Should only go as far as furthest requests
                expect(Math.max(...result.sequence)).toBe(70);
                expect(Math.min(...result.sequence)).toBe(30);
            });

            it('should handle requests at extreme positions', () => {
                const requests = [1, 198]; // Near boundaries but not at them
                const result = simulateDiskScheduling('look', requests, 100, 200, 'right');
                
                // Should visit these positions but not the actual boundaries
                expect(result.sequence).toContain(1);
                expect(result.sequence).toContain(198);
                expect(result.sequence).not.toContain(0);
                expect(result.sequence).not.toContain(199);
            });
        });

        describe('C-LOOK Edge Cases', () => {
            it('should jump to furthest request in opposite direction', () => {
                const requests = [60, 70, 20, 30]; // Right: 60,70 Left: 20,30
                const result = simulateDiskScheduling('clook', requests, 50, 200, 'right');
                
                // Should service 60, 70, then jump to 20 (leftmost), then 30
                const sequence = result.sequence;
                expect(sequence.indexOf(70)).toBeLessThan(sequence.indexOf(20));
                expect(sequence.indexOf(20)).toBeLessThan(sequence.indexOf(30));
            });

            it('should handle single request in opposite direction', () => {
                const requests = [60, 70, 20]; // Two right, one left
                const result = simulateDiskScheduling('clook', requests, 50, 200, 'right');
                
                // Should service 60, 70, then jump directly to 20
                expect(result.sequence).toEqual([50, 60, 70, 20]);
            });
        });
    });

    describe('Performance Edge Cases', () => {
        it('should handle worst-case FCFS performance', () => {
            // Maximum possible seek time scenario
            const requests = [];
            for (let i = 0; i < 10; i++) {
                requests.push(i % 2 === 0 ? 0 : 199);
            }
            
            const result = simulateDiskScheduling('fcfs', requests, 100, 200, 'right');
            
            // Should have very high seek time
            expect(result.totalSeekTime).toBeGreaterThan(1500);
            expect(result.sequence).toHaveLength(11); // Initial + 10 requests
        });

        it('should handle best-case SSTF performance', () => {
            // All requests at the same position
            const requests = [100, 100, 100, 100, 100];
            const result = simulateDiskScheduling('sstf', requests, 100, 200, 'right');
            
            expect(result.totalSeekTime).toBe(0);
            expect(result.averageSeekTime).toBe(0);
        });

        it('should handle pathological SSTF case', () => {
            // Requests that could cause starvation in real systems
            const requests = [49, 51, 48, 52, 47, 53, 100];
            const result = simulateDiskScheduling('sstf', requests, 50, 200, 'right');
            
            // Should eventually service the distant request (100)
            expect(result.sequence).toContain(100);
            expect(result.sequence.indexOf(100)).toBe(result.sequence.length - 1);
        });
    });

    describe('Data Integrity Edge Cases', () => {
        it('should handle floating point precision issues', () => {
            // Use positions that might cause floating point issues
            const requests = [33, 66, 99, 133, 166];
            const result = simulateDiskScheduling('fcfs', requests, 50, 200, 'right');
            
            // All calculations should be integers
            expect(Number.isInteger(result.totalSeekTime)).toBe(true);
            expect(Number.isInteger(result.averageSeekTime * requests.length)).toBe(true);
            
            result.steps.forEach(step => {
                expect(Number.isInteger(step.seekDistance)).toBe(true);
                expect(Number.isInteger(step.totalSeekTime)).toBe(true);
            });
        });

        it('should maintain request order integrity', () => {
            const originalRequests = [98, 183, 37, 122, 14, 124, 65, 67];
            const result = simulateDiskScheduling('fcfs', originalRequests, 50, 200, 'right');
            
            // FCFS should maintain exact order
            for (let i = 0; i < originalRequests.length; i++) {
                expect(result.sequence[i + 1]).toBe(originalRequests[i]);
            }
        });

        it('should handle duplicate requests correctly', () => {
            const requests = [50, 50, 100, 100, 50];
            const result = simulateDiskScheduling('fcfs', requests, 75, 200, 'right');
            
            // Should visit position 50 three times and 100 twice
            expect(result.sequence.filter(pos => pos === 50)).toHaveLength(3);
            expect(result.sequence.filter(pos => pos === 100)).toHaveLength(2);
        });
    });

    describe('Memory and Resource Edge Cases', () => {
        it('should handle large number of requests efficiently', () => {
            const largeRequestSet = Array.from({ length: 1000 }, (_, i) => i % 200);
            
            const startTime = Date.now();
            const result = simulateDiskScheduling('sstf', largeRequestSet, 100, 200, 'right');
            const endTime = Date.now();
            
            expect(result.sequence).toHaveLength(1001); // Initial + 1000 requests
            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should handle repetitive patterns efficiently', () => {
            // Repetitive access pattern
            const pattern = [10, 50, 90, 130, 170];
            const requests = [];
            for (let i = 0; i < 20; i++) {
                requests.push(...pattern);
            }
            
            const result = simulateDiskScheduling('scan', requests, 80, 200, 'right');
            
            expect(result.sequence).toHaveLength(101); // Initial + 100 requests
            expect(result.totalSeekTime).toBeGreaterThan(0);
        });

        it('should handle sparse request distribution', () => {
            // Requests spread across entire disk
            const requests = [1, 50, 99, 150, 199];
            const result = simulateDiskScheduling('clook', requests, 25, 200, 'right');
            
            expect(result.sequence).toHaveLength(6);
            expect(result.totalSeekTime).toBeGreaterThan(200); // Should be significant
        });
    });

    describe('Concurrent Access Simulation', () => {
        it('should simulate multiple process access patterns', () => {
            // Simulate different processes accessing different disk regions
            const process1Requests = [10, 15, 20, 25]; // Low disk region
            const process2Requests = [80, 85, 90, 95]; // Mid disk region
            const process3Requests = [160, 165, 170, 175]; // High disk region
            
            const allRequests = [...process1Requests, ...process2Requests, ...process3Requests];
            
            const fcfsResult = simulateDiskScheduling('fcfs', allRequests, 50, 200, 'right');
            const scanResult = simulateDiskScheduling('scan', allRequests, 50, 200, 'right');
            
            // SCAN should be more efficient for this mixed workload
            expect(scanResult.totalSeekTime).toBeLessThan(fcfsResult.totalSeekTime);
        });

        it('should handle priority-like access patterns', () => {
            // Simulate high-priority requests (closer to current position)
            const highPriority = [45, 50, 55]; // Close to head at 50
            const lowPriority = [10, 100, 190]; // Far from head
            
            const requests = [...highPriority, ...lowPriority];
            const sstfResult = simulateDiskScheduling('sstf', requests, 50, 200, 'right');
            
            // SSTF should naturally prioritize closer requests
            const sequence = sstfResult.sequence;
            highPriority.forEach(req => {
                const highIndex = sequence.indexOf(req);
                lowPriority.forEach(lowReq => {
                    const lowIndex = sequence.indexOf(lowReq);
                    if (Math.abs(req - 50) < Math.abs(lowReq - 50)) {
                        expect(highIndex).toBeLessThan(lowIndex);
                    }
                });
            });
        });
    });
});