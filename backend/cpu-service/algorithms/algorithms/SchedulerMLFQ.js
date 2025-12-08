import Scheduler from "../Scheduler.js";
import ReadyQueuesManager from "../ReadyQueuesManager.js";
import { PROCESSES } from "../constants.js";
import executionInfo from "../ExecutionInfo.js";
import timer from "../Timer.js";

class SchedulerMLFQ extends Scheduler {
    constructor(processes, extra = {}) {
        // Default MLFQ configuration
        const defaultConfig = {
            queues: 3, // Number of priority queues
            quantums: [2, 4, 8], // Quantum time for each queue (queue 0 has highest priority)
            allotment: 20, // Allotment time - when expired, all processes move to queue 0
        };

        // Merge with user configuration
        const config = { ...defaultConfig, ...extra };

        // Validate configuration
        if (config.queues !== config.quantums.length) {
            throw new Error("Number of queues must match number of quantums");
        }

        super(processes, config);

        // MLFQ specific properties
        this.config = config;
        this.lastAllotmentReset = 0; // Track when we last reset due to allotment

        // Initialize all processes with priority 0 (highest priority)
        for (let i = 1; i <= processes.length; i++) {
            const process = this.pcb.getRecord(i);
            if (process) {
                process.priority = 0;
            }
        }
    }

    initializeReadyQueues(extra) {
        this.readyQueues = new ReadyQueuesManager(
            extra.queues,
            { quantum: extra.quantums },
            extra.allotment
        );
    }

    getScheduledProcess() {
        // MLFQ scheduling: check queues from highest priority (0) to lowest
        for (
            let queueIndex = 0;
            queueIndex < this.config.queues;
            queueIndex++
        ) {
            const queue = this.readyQueues.getQueue(queueIndex);
            if (queue.length > 0) {
                // Return first process in the highest priority non-empty queue
                return queue[0];
            }
        }
        return -1;
    }

    shouldDescheduleOnNewProcess() {
        // In MLFQ, new processes have highest priority, so they should preempt lower priority processes
        if (this.cpu === -1) return false;

        const currentProcess = this.pcb.getRecord(this.cpu);
        if (!currentProcess) return false;

        const currentPriority = currentProcess.priority || 0;

        // If current process is not in the highest priority queue, it can be preempted
        return currentPriority > 0;
    }

    shouldDescheduleOnTimeout() {
        return true; // Always deschedule when quantum expires
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

        const currentProcess = this.pcb.getRecord(this.cpu);
        if (!currentProcess) {
            this.cpu = -1;
            return;
        }

        // Check if process has finished before timing it out
        if (this.cpu !== -1 && this.pcb.isProcessFinished(this.cpu)) {
            return; // Don't timeout a finished process
        }

        if (!this.shouldDescheduleOnTimeout()) {
            return;
        }

        if (currentProcess.quantumLeft === 0) {
            const currentPriority = currentProcess.priority || 0;
            const nextPriority = Math.min(
                currentPriority + 1,
                this.config.queues - 1
            );

            executionInfo.addExplanation(
                `Process ${this.cpu} timed out, moved to queue ${nextPriority + 1}.`
            );
            executionInfo.addPoint(this.cpu);
            executionInfo.addTimer();

            // Set new priority and move to appropriate queue
            currentProcess.priority = nextPriority;
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.readyQueues.addToReadyQueue(nextPriority, this.cpu);
            this.cpu = -1;
        }
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
            this.finishProcess(); // Check for finished processes BEFORE allotment

            // Check allotment and handle immediately if expired
            const allotmentExpired = this.checkAllotmentExpiration();
            if (allotmentExpired) {
                // Immediately schedule a new process after allotment reset
                this.schedule();
            }

            this.executeProcess();
            this.handleIo();
            timer.clock();

            // check if process finished
            if (this.cpu !== -1 && this.pcb.isProcessFinished(this.cpu)) {
                this.finishProcess();
            }
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

        const process = this.pcb.getRecord(this.cpu);
        if (process && process.quantumLeft === 0) {
            const currentPriority = process.priority || 0;

            // In MLFQ, when quantum expires, move to next lower priority queue
            const nextPriority = Math.min(
                currentPriority + 1,
                this.config.queues - 1
            );
            process.priority = nextPriority;

            executionInfo.addExplanation(
                `Process ${this.cpu} timed out, moved to queue ${nextPriority + 1}.`
            );
            executionInfo.addPoint(this.cpu);
            executionInfo.addTimer();
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.readyQueues.addToReadyQueue(nextPriority, this.cpu);
            this.cpu = -1;
        }
    }

    addNewProcesses() {
        let hasNewProcess = false;

        while (this.pcb.hasNextProcess()) {
            const nextProcess = this.pcb.getNextProcess();

            // New processes always start in queue 0 (highest priority)
            const process = this.pcb.getRecord(nextProcess);
            if (process) {
                process.priority = 0;
            }

            executionInfo.addExplanation(
                `Process ${nextProcess} arrived and added to queue 1.`
            );
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
            const currentProcess = this.pcb.getRecord(this.cpu);
            const currentPriority = currentProcess
                ? currentProcess.priority || 0
                : 0;

            this.readyQueues.addToReadyQueue(currentPriority, this.cpu);
            executionInfo.addExplanation(
                `Process ${this.cpu} preempted by higher priority process, returned to queue ${currentPriority + 1}.`
            );
            executionInfo.addPoint(this.cpu);
            executionInfo.addTimer();
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.cpu = -1;
        }
    }

    scheduleProcess(pid) {
        const process = this.pcb.getRecord(pid);
        if (!process) {
            console.error(`MLFQ Error: Cannot schedule invalid process ${pid}`);
            return;
        }

        const priority = process.priority || 0;

        executionInfo.addExplanation(
            `Process ${pid} scheduled from queue ${priority + 1}.`
        );
        executionInfo.addPoint(pid);
        executionInfo.addTimer();

        this.readyQueues.removeFromReadyQueue(pid);
        this.pcb.setScheduledTime(pid);
        this.pcb.setProcessState(pid, PROCESSES.STATES.RUNNING);

        const quantum = this.readyQueues.getQueueQuantum(priority);
        this.pcb.setQuantumLeft(pid, quantum);
        this.cpu = pid;
    }

    executeProcess() {
        if (this.pcb.isRunning()) {
            // Add safety check for valid process
            const process = this.pcb.getRecord(this.cpu);
            if (!process) {
                console.error(
                    `MLFQ Error: Invalid process ID ${this.cpu} in executeProcess`
                );
                this.cpu = -1;
                return;
            }

            if (this.pcb.hasIo(this.cpu)) {
                this.handleHasIo(this.cpu);
            } else {
                this.pcb.tickCpuTime(this.cpu);
                this.pcb.tickQuantumLeft(this.cpu);
            }
        }
    }

    checkAllotmentExpiration() {
        const currentTime = timer.getTimer();

        // Check if current time is a multiple of allotment and we haven't reset at this time yet
        // Also ensure we don't interrupt if we're in the middle of executing a process
        // that just started (to allow some minimal progress)
        if (
            currentTime > 0 &&
            currentTime % this.config.allotment === 0 &&
            currentTime !== this.lastAllotmentReset
        ) {
            this.lastAllotmentReset = currentTime; // Mark that we are processing this allotment
            this.resetAllProcessesToHighestPriority();
            return true; // Allotment expired
        }
        return false; // Allotment not expired
    }

    resetAllProcessesToHighestPriority() {
        const currentTime = timer.getTimer();
        executionInfo.addExplanation(
            `Allotment time expired at time ${currentTime}! Moving all processes back to queue 1.`
        );
        executionInfo.addTimer();

        // Collect all processes that need to be moved to queue 0, in priority order
        const processesToMove = [];
        let preemptedProcess = null;
        
        // Handle the currently running process - preempt it and save for later (goes to back)
        if (this.cpu !== -1) {
            const process = this.pcb.getRecord(this.cpu);

            if (process && !this.pcb.isProcessFinished(this.cpu)) {
                executionInfo.addExplanation(
                    `Process ${this.cpu} is preempted due to allotment expiration.`
                );
                executionInfo.addPoint(this.cpu);

                // Reset priority and prepare to move to queue 0 (but at the back)
                process.priority = 0;
                this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
                preemptedProcess = this.cpu;
            }
            this.cpu = -1;
        }

        // Collect processes from higher priority queues (queue 1, then queue 2, etc.)
        for (
            let queueIndex = 1;
            queueIndex < this.config.queues;
            queueIndex++
        ) {
            const queue = this.readyQueues.getQueue(queueIndex);
            const processesFromThisQueue = [...queue]; // Create a copy

            // Clear the queue
            queue.length = 0;

            // Add processes from this queue to our collection
            for (const pid of processesFromThisQueue) {
                if (pid !== undefined && pid !== null) {
                    const process = this.pcb.getRecord(pid);
                    if (process && !this.pcb.isProcessFinished(pid)) {
                        process.priority = 0;
                        processesToMove.push({
                            pid: pid,
                            fromQueue: queueIndex
                        });
                        executionInfo.addExplanation(
                            `Process ${pid} moved from queue ${queueIndex + 1} to queue 1.`
                        );
                    }
                }
            }
        }

        // Sort processes by their original queue (lower queue numbers = higher priority)
        processesToMove.sort((a, b) => a.fromQueue - b.fromQueue);

        // Add all processes from ready queues to queue 0 first
        for (const processInfo of processesToMove) {
            this.readyQueues.addToReadyQueue(0, processInfo.pid);
        }

        // Add the preempted process to the back of queue 0 (no advantage)
        if (preemptedProcess !== null) {
            this.readyQueues.addToReadyQueue(0, preemptedProcess);
        }
    }

    handleIo() {
        const toBeAdded = this.pcb.handleIo();

        // Handle I/O completion - processes return to queue 0 (highest priority)
        for (let i = 0; i < toBeAdded.length; i++) {
            const pid = toBeAdded[i];
            const time = timer.getTimer();

            // Reset priority to highest when returning from I/O
            const process = this.pcb.getRecord(pid);
            if (process) {
                process.priority = 0;
            }

            executionInfo.addExplanation(
                `Process ${pid} finished I/O at time ${time + 1}, added to queue 1.`
            );
            executionInfo.addTimer(true);

            this.readyQueues.addToReadyQueue(0, pid);
            this.pcb.setProcessState(pid, PROCESSES.STATES.READY);
        }

        if (
            toBeAdded.length > 0 &&
            this.cpu !== -1 &&
            this.shouldDescheduleOnNewProcess()
        ) {
            const currentProcess = this.pcb.getRecord(this.cpu);
            const currentPriority = currentProcess
                ? currentProcess.priority || 0
                : 0;

            executionInfo.addExplanation(
                `Process ${this.cpu} preempted due to I/O completion, returned to queue ${currentPriority + 1}.`
            );
            executionInfo.addPoint(this.cpu, true);
            executionInfo.addTimer(true);
            this.pcb.setProcessState(this.cpu, PROCESSES.STATES.READY);
            this.readyQueues.addToReadyQueue(currentPriority, this.cpu);
            this.cpu = -1;
        }
    }
}

export default SchedulerMLFQ;
