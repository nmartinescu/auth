import { describe, it, beforeEach, expect } from '@jest/globals';
import QueueManager from '../../algorithms/scheduler/QueueManager.js';
import ReadyQueuesManager from '../../algorithms/scheduler/ReadyQueuesManager.js';

describe('QueueManager', () => {
    let queueManager;

    beforeEach(() => {
        queueManager = new QueueManager([]);
    });

    describe('Basic Queue Operations', () => {
        it('should initialize with empty queue', () => {
            expect(queueManager.getQueue()).toEqual([]);
        });

        it('should initialize with provided queue', () => {
            const initialQueue = [1, 2, 3];
            const qm = new QueueManager(initialQueue);
            
            expect(qm.getQueue()).toEqual([1, 2, 3]);
        });

        it('should add elements to queue', () => {
            queueManager.add(1);
            queueManager.add(2);
            
            expect(queueManager.getQueue()).toEqual([1, 2]);
        });

        it('should remove elements from queue', () => {
            queueManager.add(1);
            queueManager.add(2);
            queueManager.add(3);
            
            queueManager.remove(2);
            
            expect(queueManager.getQueue()).toEqual([1, 3]);
        });

        it('should get nth element', () => {
            queueManager.add(10);
            queueManager.add(20);
            queueManager.add(30);
            
            expect(queueManager.getNth(0)).toBe(10);
            expect(queueManager.getNth(1)).toBe(20);
            expect(queueManager.getNth(2)).toBe(30);
        });

        it('should set new queue', () => {
            const newQueue = [5, 6, 7];
            queueManager.setQueue(newQueue);
            
            expect(queueManager.getQueue()).toEqual([5, 6, 7]);
        });
    });

    describe('Edge Cases', () => {
        it('should handle removing non-existent element', () => {
            queueManager.add(1);
            queueManager.add(2);
            
            queueManager.remove(99);
            
            expect(queueManager.getQueue()).toEqual([1, 2]);
        });

        it('should handle getting element at invalid index', () => {
            queueManager.add(1);
            
            expect(queueManager.getNth(5)).toBeUndefined();
            expect(queueManager.getNth(-1)).toBeUndefined();
        });

        it('should handle removing from empty queue', () => {
            queueManager.remove(1);
            
            expect(queueManager.getQueue()).toEqual([]);
        });
    });
});

describe('ReadyQueuesManager', () => {
    let readyQueuesManager;

    beforeEach(() => {
        readyQueuesManager = new ReadyQueuesManager(3);
    });

    describe('Initialization', () => {
        it('should create specified number of ready queues', () => {
            expect(readyQueuesManager.queue.length).toBe(3);
        });

        it('should initialize all queues as empty', () => {
            expect(readyQueuesManager.getQueue(0)).toEqual([]);
            expect(readyQueuesManager.getQueue(1)).toEqual([]);
            expect(readyQueuesManager.getQueue(2)).toEqual([]);
        });

        it('should initialize with queue data', () => {
            const queueData = {
                quantum: [2, 4, 8]
            };
            
            const rqm = new ReadyQueuesManager(3, queueData);
            
            expect(rqm.getQueueQuantum(0)).toBe(2);
            expect(rqm.getQueueQuantum(1)).toBe(4);
            expect(rqm.getQueueQuantum(2)).toBe(8);
        });

        it('should initialize with allotment', () => {
            const rqm = new ReadyQueuesManager(2, {}, 10);
            
            expect(rqm.getAllotment()).toBe(10);
        });
    });

    describe('Queue Operations', () => {
        it('should add process to specific ready queue', () => {
            readyQueuesManager.addToReadyQueue(0, 1);
            readyQueuesManager.addToReadyQueue(1, 2);
            readyQueuesManager.addToReadyQueue(0, 3);
            
            expect(readyQueuesManager.getQueue(0)).toEqual([1, 3]);
            expect(readyQueuesManager.getQueue(1)).toEqual([2]);
            expect(readyQueuesManager.getQueue(2)).toEqual([]);
        });

        it('should remove process from all ready queues', () => {
            readyQueuesManager.addToReadyQueue(0, 1);
            readyQueuesManager.addToReadyQueue(1, 1);
            readyQueuesManager.addToReadyQueue(2, 2);
            
            readyQueuesManager.removeFromReadyQueue(1);
            
            expect(readyQueuesManager.getQueue(0)).toEqual([]);
            expect(readyQueuesManager.getQueue(1)).toEqual([]);
            expect(readyQueuesManager.getQueue(2)).toEqual([2]);
        });

        it('should get queue at specific index', () => {
            readyQueuesManager.addToReadyQueue(1, 5);
            readyQueuesManager.addToReadyQueue(1, 6);
            
            const queue1 = readyQueuesManager.getQueue(1);
            expect(queue1).toEqual([5, 6]);
        });
    });

    describe('Quantum Management', () => {
        it('should return quantum for specific queue', () => {
            const queueData = {
                quantum: [1, 2, 4]
            };
            
            const rqm = new ReadyQueuesManager(3, queueData);
            
            expect(rqm.getQueueQuantum(0)).toBe(1);
            expect(rqm.getQueueQuantum(1)).toBe(2);
            expect(rqm.getQueueQuantum(2)).toBe(4);
        });

        it('should return -1 for quantum when not configured', () => {
            expect(readyQueuesManager.getQueueQuantum(0)).toBe(-1);
        });

        it('should return -1 for quantum at invalid index', () => {
            const queueData = {
                quantum: [2, 4]
            };
            
            const rqm = new ReadyQueuesManager(3, queueData);
            
            expect(rqm.getQueueQuantum(5)).toBe(-1);
        });

        it('should return default quantum when queue data is missing', () => {
            const rqm = new ReadyQueuesManager(2, {});
            
            expect(rqm.getQueueQuantum(0)).toBe(-1);
        });
    });

    describe('Allotment Management', () => {
        it('should return configured allotment', () => {
            const rqm = new ReadyQueuesManager(2, {}, 15);
            
            expect(rqm.getAllotment()).toBe(15);
        });

        it('should return default allotment when not configured', () => {
            expect(readyQueuesManager.getAllotment()).toBe(-1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle single queue', () => {
            const singleQueueManager = new ReadyQueuesManager(1);
            
            singleQueueManager.addToReadyQueue(0, 1);
            expect(singleQueueManager.getQueue(0)).toEqual([1]);
        });

        it('should handle zero queues', () => {
            const zeroQueueManager = new ReadyQueuesManager(0);
            
            expect(zeroQueueManager.queue.length).toBe(0);
        });

        it('should handle adding to invalid queue index', () => {
            expect(() => {
                readyQueuesManager.addToReadyQueue(10, 1);
            }).toThrow();
        });

        it('should handle getting queue at invalid index', () => {
            expect(() => {
                readyQueuesManager.getQueue(10);
            }).toThrow();
        });

        it('should handle complex queue operations', () => {
            for (let i = 1; i <= 10; i++) {
                readyQueuesManager.addToReadyQueue(i % 3, i);
            }
            
            expect(readyQueuesManager.getQueue(0)).toEqual([3, 6, 9]);
            expect(readyQueuesManager.getQueue(1)).toEqual([1, 4, 7, 10]);
            expect(readyQueuesManager.getQueue(2)).toEqual([2, 5, 8]);
            
            readyQueuesManager.removeFromReadyQueue(4);
            readyQueuesManager.removeFromReadyQueue(8);
            
            expect(readyQueuesManager.getQueue(0)).toEqual([3, 6, 9]);
            expect(readyQueuesManager.getQueue(1)).toEqual([1, 7, 10]);
            expect(readyQueuesManager.getQueue(2)).toEqual([2, 5]);
        });
    });
});