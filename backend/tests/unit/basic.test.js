import { describe, it, expect } from '@jest/globals';

describe('Basic Test Suite', () => {
    it('should run a simple test', () => {
        expect(1 + 1).toBe(2);
    });

    it('should test basic JavaScript functionality', () => {
        const arr = [1, 2, 3];
        expect(arr.length).toBe(3);
        expect(arr.includes(2)).toBe(true);
    });

    it('should handle async operations', async () => {
        const promise = Promise.resolve('test');
        const result = await promise;
        expect(result).toBe('test');
    });
});