import { PROCESSES } from "../constants.js";
import ProcessControlBlockManager from "./ProcessControlBlockManager.js";
import executionInfo from "./ExecutionInfo.js";
import timer from "./Timer.js";

class Scheduler2 {
    constructor(processes, extra = {}) {
        this.cpu = -1;
        this.pcb = new ProcessControlBlockManager(processes);
        this.initializeReadyQueues(extra);

        timer.reset();
        executionInfo.setPCB(this.pcb.getPCB());
        executionInfo.setReadyQueuesManager(this.readyQueues);
        executionInfo.reset();
    }

    start() {
        while (!this.pcb.isFinished()) {
            if (timer.getTimer() > PROCESSES.BREAK_TIMER) {
                return;
            }
            console.log(`Timer: ${timer.getTimer()}`);

            this.addNewProcesses();
            this.checkForTimeout();
            this.schedule();
            this.finishProcess();
            this.executeProcess();
            this.handleIo();
            timer.clock();
        }
    }

    checkForTimeout() {
        if (this.cpu === -1) {
            return;
        }

        console.log(
            this.cpu,
            this.shouldDescheduleOnTimeout(),
            this.pcb.getRecord(this.cpu)
        );

        if (!this.shouldDescheduleOnTimeout()) {
            return;
        }

        if (this.pcb.getRecord(this.cpu).quantumLeft === 0) {
            executionInfo.addExplanation(`Process ${this.cpu} timed out.`);
            executionInfo.addPoint(this.cpu);
            executionInfo.addTimer();
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.readyQueues.addToReadyQueue(0, this.cpu);
            this.cpu = -1;
        }
    }

    finishProcess() {
        if (this.cpu === -1) {
            return;
        }

        if (this.pcb.hasIo(this.cpu)) {
            return;
        }

        if (!this.pcb.isProcessFinished(this.cpu)) {
            return;
        }

        executionInfo.addExplanation(`Process ${this.cpu} finished.`);
        executionInfo.addPoint(this.cpu);
        executionInfo.addTimer();

        this.pcb.setEndTime(this.cpu);
        this.pcb.setProcessState(this.cpu, PROCESSES.STATES.DONE);
        this.readyQueues.removeFromReadyQueue(this.cpu);

        this.cpu = -1;

        this.schedule();
    }

    addNewProcesses() {
        let hasNewProcess = false;

        while (this.pcb.hasNextProcess()) {
            const nextProcess = this.pcb.getNextProcess();
            executionInfo.addExplanation(`Process ${nextProcess} arrived.`);
            if (this.cpu !== -1) {
                executionInfo.addTemporaryPoint(this.cpu);
            }

            executionInfo.addTimer();
            this.readyQueues.addToReadyQueue(0, nextProcess);
            this.pcb.setArrivalTime(nextProcess);
            this.pcb.setProcessState(nextProcess, PROCESSES.STATES.READY);
            hasNewProcess = true;
        }

        if (
            hasNewProcess &&
            this.pcb.isRunning() &&
            this.shouldDescheduleOnNewProcess()
        ) {
            this.readyQueues.addToReadyQueue(0, this.cpu);
            executionInfo.addExplanation(
                `Process ${this.cpu} descheduled due to new process.`
            );
            executionInfo.addPoint(this.cpu);
            executionInfo.addTimer();
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.cpu = -1;
        }
    }

    schedule() {
        if (this.pcb.isRunning()) {
            return;
        }

        const pid = this.getScheduledProcess();

        if (pid !== -1) {
            this.scheduleProcess(pid);
        }
    }

    scheduleProcess(pid) {
        executionInfo.addExplanation(`Process ${pid} scheduled.`);
        executionInfo.addPoint(pid);
        executionInfo.addTimer();
        this.readyQueues.removeFromReadyQueue(pid);
        this.pcb.setScheduledTime(pid);
        this.pcb.setProcessState(pid, PROCESSES.STATES.RUNNING);

        const priority = this.pcb.getRecord(pid).priority || 0;
        console.log(priority, this.readyQueues.getQueueQuantum(priority))
        const quantum = this.readyQueues.getQueueQuantum(priority);
        this.pcb.setQuantumLeft(pid, quantum);
        this.cpu = pid;
    }

    executeProcess() {
        if (this.pcb.isRunning()) {
            if (this.pcb.hasIo(this.cpu)) {
                this.handleHasIo(this.cpu);
            } else {
                this.pcb.tickCpuTime(this.cpu);
                this.pcb.tickQuantumLeft(this.cpu);
            }
        }
    }

    handleHasIo(pid) {
        executionInfo.addExplanation(`Process ${pid} has IO.`);
        executionInfo.addPoint(pid);
        executionInfo.addNullPoint();
        executionInfo.addExplanation(`Process ${pid} added to wait queue.`);
        executionInfo.addTimer();
        this.pcb.setProcessState(pid, PROCESSES.STATES.WAIT);
        this.pcb.addToWaitQueue(pid);
        this.cpu = -1;
    }

    handleIo() {
        const toBeAdded = this.pcb.handleIo();

        for (let i = 0; i < toBeAdded.length; i++) {
            this.readyQueues.addToReadyQueue(0, toBeAdded[i]);
        }

        if (toBeAdded.length > 0 && this.cpu !== -1 && this.shouldDescheduleOnNewProcess()) {
            executionInfo.addExplanation(
                `Process ${this.cpu} descheduled due to IO.`
            );
            executionInfo.addPoint(this.cpu, true);
            executionInfo.addTimer(true);
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.readyQueues.addToReadyQueue(0, this.cpu);
            this.cpu = -1;
        }
    }

    getSolution() {
        return {
            processes: [],
            customData: executionInfo.getInfo(),
        };
    }

    initializeReadyQueues(extra = {}) {
        throw new Error("Abstract method must be implemented");
    }

    getScheduledProcess() {
        throw new Error("Abstract method must be implemented");
    }

    shouldDescheduleOnNewProcess() {
        throw new Error("Abstract method must be implemented");
    }

    shouldDescheduleOnTimeout() {
        throw new Error("Abstract method must be implemented");
    }
}

export default Scheduler2;
