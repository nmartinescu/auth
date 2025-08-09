import { PROCESSES } from "../constants.js";
import executionInfo from "./ExecutionInfo.js";
import timer from "./Timer.js";

class ProcessControlBlockManager {
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

    isFinished() {
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].state !== PROCESSES.STATES.DONE) {
                return false;
            }
        }

        return true;
    }

    isProcessFinished(pid) {
        return this.PCB[pid].burstTime === 0;
    }

    isRunning() {
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].state === PROCESSES.STATES.RUNNING) {
                return true;
            }
        }

        return false;
    }

    getNextProcess() {
        const time = timer.getTimer();
        for (let i = 1; i < this.PCB.length; i++) {
            if (
                this.PCB[i].arrivalTime === time &&
                this.PCB[i].state === PROCESSES.STATES.NEW
            ) {
                return this.PCB[i].pid;
            }
        }

        return null;
    }

    hasNextProcess() {
        const nextProcess = this.getNextProcess();
        return nextProcess !== null;
    }

    setProcessState(pid, state) {
        this.PCB[pid].state = state;
        executionInfo.nextStep();
    }

    tickCpuTime(pid) {
        if (this.PCB[pid].burstTime <= 0) {
            return 0;
        }

        this.PCB[pid].cpuTime++;
        this.PCB[pid].burstTime--;
        return 1;
    }

    tickIoTime(pid) {
        this.PCB[pid].ioTime--;
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

        // remove io event
        const io = this.PCB[pid].io.splice(ioIndex, 1);

        this.PCB[pid].ioTime = io[0].duration;
    }

    handleIo() {
        const toBeAdded = [];
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].ioTime > 0) {
                this.PCB[i].ioTime--;

                if (this.PCB[i].ioTime === 0) {
                    const time = timer.getTimer();
                    executionInfo.addExplanation(
                        `Process ${i} finished io at time ${time + 1}.`
                    );
                    toBeAdded.push(i);
                }
            }
        }
        return toBeAdded;
    }

    setArrivalTime(pid) {
        const time = timer.getTimer();
        this.PCB[pid].arrival = time;
    }

    setScheduledTime(pid) {
        const time = timer.getTimer();
        if (this.PCB[pid].scheduledTime !== undefined) {
            return;
        }

        this.PCB[pid].scheduledTime = time;
        this.PCB[pid].waitingTime = time - this.PCB[pid].arrivalTime;
    }

    setEndTime(pid) {
        const time = timer.getTimer();
        this.PCB[pid].endTime = time;
        this.PCB[pid].turnaroundTime = time - this.PCB[pid].arrivalTime;
    }

    getPCB() {
        return this.PCB;
    }

    getRecord(pid) {
        return this.PCB[pid];
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

export default ProcessControlBlockManager;