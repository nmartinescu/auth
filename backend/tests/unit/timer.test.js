import { describe, it, beforeEach, expect } from "@jest/globals";
import Timer from "../../Scheduler/Timer.js";

describe("Timer", () => {
    let timer;

    beforeEach(() => {
        // Get the singleton instance and reset it
        timer = Timer;
        timer.reset();
    });

    describe("Basic Timer Operations", () => {
        it("should initialize timer to 0", () => {
            expect(timer.getTimer()).toBe(0);
        });

        it("should increment timer on clock", () => {
            timer.clock();
            expect(timer.getTimer()).toBe(1);

            timer.clock();
            expect(timer.getTimer()).toBe(2);
        });

        it("should reset timer to 0", () => {
            timer.clock();
            timer.clock();
            timer.clock();
            expect(timer.getTimer()).toBe(3);

            timer.reset();
            expect(timer.getTimer()).toBe(0);
        });

        it("should maintain singleton pattern", () => {
            const timer1 = Timer;
            const timer2 = Timer;

            expect(timer1).toBe(timer2);

            timer1.clock();
            expect(timer2.getTimer()).toBe(1);
        });
    });

    describe("Timer State Management", () => {
        it("should handle multiple clock cycles", () => {
            for (let i = 1; i <= 100; i++) {
                timer.clock();
                expect(timer.getTimer()).toBe(i);
            }
        });

        it("should handle reset after multiple operations", () => {
            timer.clock();
            timer.clock();
            timer.clock();

            timer.reset();
            expect(timer.getTimer()).toBe(0);

            timer.clock();
            expect(timer.getTimer()).toBe(1);
        });

        it("should handle multiple resets", () => {
            timer.clock();
            timer.reset();
            timer.reset();
            timer.reset();

            expect(timer.getTimer()).toBe(0);
        });
    });

    describe("Edge Cases", () => {
        it("should handle large number of clock cycles", () => {
            const largeCycles = 10000;

            for (let i = 0; i < largeCycles; i++) {
                timer.clock();
            }

            expect(timer.getTimer()).toBe(largeCycles);
        });

        it("should maintain state across multiple operations", () => {
            timer.clock();
            const time1 = timer.getTimer();

            timer.clock();
            const time2 = timer.getTimer();

            expect(time2).toBe(time1 + 1);
        });
    });
});
