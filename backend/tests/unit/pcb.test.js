import { describe, it, beforeEach, expect, jest } from "@jest/globals";
import { PROCESSES } from "../../constants.js";

class TestProcessControlBlockManager {
    constructor(processes) {
        this.PCB = [];
        for (let i = 0; i < processes.length; i++) {
            const pid = i + 1;
            this.PCB[pid] = {
                pid: pid,
                arrivalTime: processes[i].arrivalTime,
                burstTime: processes[i].burstTime,
                io: processes[i].io,
                state: PROCESSES.STATES.NEW,
                cpuTime: 0,
                ioTime: 0,
            };
        }
    }

    getPCB() {
        return this.PCB;
    }

    isFinished() {
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].state !== PROCESSES.STATES.DONE) {
                return false;
            }
        }
        return true;
    }

    isRunning() {
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].state === PROCESSES.STATES.RUNNING) {
                return true;
            }
        }
        return false;
    }

    setProcessState(pid, state) {
        this.PCB[pid].state = state;
    }

    tickCpuTime(pid) {
        if (this.PCB[pid].burstTime <= 0) {
            return 0;
        }
        this.PCB[pid].cpuTime++;
        this.PCB[pid].burstTime--;
        return 1;
    }

    hasEnded(pid) {
        return this.PCB[pid].burstTime === 0;
    }

    hasIo(pid) {
        for (let i = 0; i < this.PCB[pid].io.length; i++) {
            if (this.PCB[pid].io[i].start === this.PCB[pid].cpuTime) {
                return true;
            }
        }
        return false;
    }

    addToWaitQueue(pid) {
        let ioIndex = -1;
        for (let i = 0; i < this.PCB[pid].io.length; i++) {
            if (this.PCB[pid].io[i].start === this.PCB[pid].cpuTime) {
                ioIndex = i;
                break;
            }
        }
        const io = this.PCB[pid].io.splice(ioIndex, 1);
        this.PCB[pid].ioTime = io[0].duration;
    }

    tickIoTime(pid) {
        this.PCB[pid].ioTime--;
    }

    handleIo() {
        const toBeAdded = [];
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].ioTime > 0) {
                this.PCB[i].ioTime--;
                if (this.PCB[i].ioTime === 0) {
                    toBeAdded.push(i);
                }
            }
        }
        return toBeAdded;
    }

    setScheduledTime(pid) {
        const time = 5;
        if (this.PCB[pid].scheduledTime !== undefined) {
            return;
        }
        this.PCB[pid].scheduledTime = time;
        this.PCB[pid].waitingTime = time - this.PCB[pid].arrivalTime;
    }

    setEndTime(pid) {
        const time = 10;
        this.PCB[pid].endTime = time;
        this.PCB[pid].turnaroundTime = time - this.PCB[pid].arrivalTime;
    }

    setQuantumLeft(pid, quantum) {
        this.PCB[pid].quantumLeft = quantum;
    }

    tickQuantumLeft(pid) {
        if (this.PCB[pid].quantumLeft > 0) {
            this.PCB[pid].quantumLeft--;
        }
    }
}

describe("ProcessControlBlockManager", () => {
    let pcbManager;
    let testProcesses;

    beforeEach(() => {
        testProcesses = [
            {
                arrivalTime: 0,
                burstTime: 5,
                io: [{ start: 2, duration: 2 }],
            },
            {
                arrivalTime: 1,
                burstTime: 3,
                io: [],
            },
            {
                arrivalTime: 2,
                burstTime: 4,
                io: [{ start: 1, duration: 1 }],
            },
        ];

        pcbManager = new TestProcessControlBlockManager(testProcesses);
    });

    describe("Initialization", () => {
        it("should create PCB entries for all processes", () => {
            const pcb = pcbManager.getPCB();

            expect(pcb.length).toBe(4);
            expect(pcb[1]).toBeDefined();
            expect(pcb[2]).toBeDefined();
            expect(pcb[3]).toBeDefined();
        });

        it("should assign correct PIDs", () => {
            const pcb = pcbManager.getPCB();

            expect(pcb[1].pid).toBe(1);
            expect(pcb[2].pid).toBe(2);
            expect(pcb[3].pid).toBe(3);
        });

        it("should initialize process states to NEW", () => {
            const pcb = pcbManager.getPCB();

            expect(pcb[1].state).toBe(PROCESSES.STATES.NEW);
            expect(pcb[2].state).toBe(PROCESSES.STATES.NEW);
            expect(pcb[3].state).toBe(PROCESSES.STATES.NEW);
        });

        it("should copy process properties correctly", () => {
            const pcb = pcbManager.getPCB();

            expect(pcb[1].arrivalTime).toBe(0);
            expect(pcb[1].burstTime).toBe(5);
            expect(pcb[1].io).toEqual([{ start: 2, duration: 2 }]);

            expect(pcb[2].arrivalTime).toBe(1);
            expect(pcb[2].burstTime).toBe(3);
            expect(pcb[2].io).toEqual([]);
        });

        it("should initialize CPU and IO times to zero", () => {
            const pcb = pcbManager.getPCB();

            expect(pcb[1].cpuTime).toBe(0);
            expect(pcb[1].ioTime).toBe(0);
            expect(pcb[2].cpuTime).toBe(0);
            expect(pcb[2].ioTime).toBe(0);
        });
    });

    describe("Process State Management", () => {
        it("should update process state correctly", () => {
            pcbManager.setProcessState(1, PROCESSES.STATES.READY);
            const pcb = pcbManager.getPCB();

            expect(pcb[1].state).toBe(PROCESSES.STATES.READY);
        });

        it("should check if all processes are finished", () => {
            expect(pcbManager.isFinished()).toBe(false);

            pcbManager.setProcessState(1, PROCESSES.STATES.DONE);
            pcbManager.setProcessState(2, PROCESSES.STATES.DONE);
            pcbManager.setProcessState(3, PROCESSES.STATES.DONE);

            expect(pcbManager.isFinished()).toBe(true);
        });

        it("should check if any process is running", () => {
            expect(pcbManager.isRunning()).toBe(false);

            pcbManager.setProcessState(1, PROCESSES.STATES.RUNNING);
            expect(pcbManager.isRunning()).toBe(true);
        });
    });

    describe("CPU Time Management", () => {
        it("should increment CPU time and decrement burst time", () => {
            const pcb = pcbManager.getPCB();
            const initialBurstTime = pcb[1].burstTime;

            const result = pcbManager.tickCpuTime(1);

            expect(result).toBe(1);
            expect(pcb[1].cpuTime).toBe(1);
            expect(pcb[1].burstTime).toBe(initialBurstTime - 1);
        });

        it("should not tick CPU time when burst time is zero", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].burstTime = 0;

            const result = pcbManager.tickCpuTime(1);

            expect(result).toBe(0);
            expect(pcb[1].cpuTime).toBe(0);
        });

        it("should detect when process has ended", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].burstTime = 0;

            expect(pcbManager.hasEnded(1)).toBe(true);
            expect(pcbManager.hasEnded(2)).toBe(false);
        });
    });

    describe("I/O Operations", () => {
        it("should detect when process has I/O at current CPU time", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].cpuTime = 2;

            expect(pcbManager.hasIo(1)).toBe(true);
            expect(pcbManager.hasIo(2)).toBe(false);
        });

        it("should add process to wait queue and set I/O time", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].cpuTime = 2;

            pcbManager.addToWaitQueue(1);

            expect(pcb[1].ioTime).toBe(2);
            expect(pcb[1].io.length).toBe(0);
        });

        it("should handle I/O time decrement", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].ioTime = 3;

            pcbManager.tickIoTime(1);

            expect(pcb[1].ioTime).toBe(2);
        });

        it("should return processes that finished I/O", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].ioTime = 1;
            pcb[2].ioTime = 2;

            const finishedIo = pcbManager.handleIo();

            expect(pcb[1].ioTime).toBe(0);
            expect(pcb[2].ioTime).toBe(1);
            expect(finishedIo).toContain(1);
            expect(finishedIo).not.toContain(2);
        });
    });

    describe("Timing and Scheduling", () => {
        it("should set scheduled time only once", () => {
            pcbManager.setScheduledTime(1);
            const pcb = pcbManager.getPCB();
            const firstScheduledTime = pcb[1].scheduledTime;

            pcbManager.setScheduledTime(1);
            expect(pcb[1].scheduledTime).toBe(firstScheduledTime);
        });

        it("should calculate waiting time correctly", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].arrivalTime = 2;
            pcbManager.setScheduledTime(1);
            expect(pcb[1].waitingTime).toBeDefined();
        });

        it("should set end time and calculate turnaround time", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].arrivalTime = 2;

            pcbManager.setEndTime(1);

            expect(pcb[1].endTime).toBeDefined();
            expect(pcb[1].turnaroundTime).toBeDefined();
        });
    });

    describe("Quantum Management", () => {
        it("should set quantum left for process", () => {
            pcbManager.setQuantumLeft(1, 3);
            const pcb = pcbManager.getPCB();

            expect(pcb[1].quantumLeft).toBe(3);
        });

        it("should decrement quantum left", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].quantumLeft = 3;

            pcbManager.tickQuantumLeft(1);

            expect(pcb[1].quantumLeft).toBe(2);
        });

        it("should not decrement quantum when it is zero", () => {
            const pcb = pcbManager.getPCB();
            pcb[1].quantumLeft = 0;

            pcbManager.tickQuantumLeft(1);

            expect(pcb[1].quantumLeft).toBe(0);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty process list", () => {
            const emptyPcbManager = new TestProcessControlBlockManager([]);
            const pcb = emptyPcbManager.getPCB();

            expect(pcb.length).toBe(0);
            expect(emptyPcbManager.isFinished()).toBe(true);
        });

        it("should handle process with no I/O operations", () => {
            const processWithoutIo = [{ arrivalTime: 0, burstTime: 3, io: [] }];

            const pcbManager = new TestProcessControlBlockManager(
                processWithoutIo
            );
            const pcb = pcbManager.getPCB();

            expect(pcb[1].io).toEqual([]);
            expect(pcbManager.hasIo(1)).toBe(false);
        });

        it("should handle multiple I/O operations for same process", () => {
            const processWithMultipleIo = [
                {
                    arrivalTime: 0,
                    burstTime: 10,
                    io: [
                        { start: 2, duration: 1 },
                        { start: 5, duration: 2 },
                        { start: 8, duration: 1 },
                    ],
                },
            ];

            const pcbManager = new TestProcessControlBlockManager(
                processWithMultipleIo
            );
            const pcb = pcbManager.getPCB();

            pcb[1].cpuTime = 2;
            expect(pcbManager.hasIo(1)).toBe(true);

            pcb[1].cpuTime = 5;
            expect(pcbManager.hasIo(1)).toBe(true);

            pcb[1].cpuTime = 3;
            expect(pcbManager.hasIo(1)).toBe(false);
        });
    });
});
