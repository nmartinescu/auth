import { PROCESSES } from "../constants.js";

class Scheduler {
    PCB = [];
    timer = 0;
    done = 0;
    cpu = -1;
    execStats = {};
    solutionJson = [];
    boostTime = -1;
    blockedQueue = [];
    newBlockedQueue = [];
    explanation = [];
    customData = [];
    processTableData = [];

    /**
     * Creates the ready queues
     *
     * @abstract
     * @protected
     * @returns {void}
     */
    createReadyQueues(extra = {}) {
        throw new Error("Abstract method must be implemented");
    }

    /**
     * Initializes a new process
     *
     * @abstract
     * @protected
     * @returns {object} the new process
     */
    initNewProcess(process) {
        throw new Error("Abstract method must be implemented");
    }

    /**
     * Initializes the priority of a process when it enters the ready queue
     *
     * @abstract
     * @protected
     * @returns {number} the initial priority
     */
    getInitialPriority() {
        throw new Error("Abstract method must be implemented");
    }

    /**
     * Checks if a process should be descheduled
     *
     * @abstract
     * @protected
     * @returns {boolean} true if the process should be descheduled, false otherwise
     */
    shouldDescheduleOnNewProcess() {
        throw new Error("Abstract method must be implemented");
    }

    /**
     * Checks if a process should be descheduled when the time quantum expires
     *
     * @abstract
     * @protected
     * @returns {boolean} true if the process should be descheduled, false otherwise
     */
    shouldDescheduleOnTimeout() {
        throw new Error("Abstract method must be implemented");
    }

    /**
     * Returns the next process information
     *
     * @abstract
     * @protected
     * @returns {object} the next process information
     */
    getNextProcessInfo() {
        throw new Error("Abstract method must be implemented");
    }

    constructor(processes, extra = {}) {
        // initialize processes
        processes.forEach((process, index) => {
            process.state = PROCESSES.STATES.NEW;
            process.pid = index + 1;
            process.cpuTime = 0;
        });

        // initialize the new processes list
        this.newProcesses = processes.sort((a, b) =>
            a.arrivalTime === b.arrivalTime
                ? a.pid - b.pid
                : a.arrivalTime - b.arrivalTime
        );

        // initialize new processes count
        this.new = this.newProcesses.length;

        this.createReadyQueues(extra);
    }

    /**
     * Starts the execution of the scheduler.
     *
     * @public
     * @returns {void}
     */
    start() {
        while (!this.isFinished()) {
            if (this.timer > PROCESSES.BREAK_TIMER) {
                return;
            }

            this.updateReadyQueues();
            this.schedule();
            this.executeProcess();
            this.handleIo();

            while (this.newBlockedQueue.length > 0) {
                this.blockedQueue.push(this.newBlockedQueue.shift());
            }

            this.timer++;

            if (!this.isFinished() && this.timer % this.boostTime === 0) {
                this.boost();
            }
        }
    }

    /**
     * Simulation execution helpers — section start
     */

    /**
     * Checks if all processes have been processed.
     *
     * @private
     * @returns {boolean} True if all processes have been processed, false otherwise.
     */
    isFinished() {
        return this.done === this.new;
    }

    /**
     * Adds an explanation to the explanation array.
     *
     * @private
     * @param {string} explanation The explanation to add.
     */
    addExplanation(explanation) {
        this.explanation.push(explanation);
    }

    addCustomData(isEnd = false) {
        const explainationCopy = JSON.parse(JSON.stringify(this.explanation));
        let readyQueuesCopy = JSON.parse(JSON.stringify(this.readyQueues));
        let newProcessesCopy = JSON.parse(JSON.stringify(this.newProcesses));
        newProcessesCopy = newProcessesCopy.map((queue) => queue.pid);
        const processTableDataCopy = JSON.parse(
            JSON.stringify(this.processTableData)
        );

        const execStatCopy = JSON.parse(JSON.stringify(this.execStats));
        if (isEnd) {
            execStatCopy.end = this.timer + 1;
        }

        const mergedSolution = [...this.solutionJson, execStatCopy];

        this.customData.push({
            explaination: explainationCopy,
            readyQueues: readyQueuesCopy,
            newProcesses: newProcessesCopy,
            timer: this.timer + isEnd,
            solution: mergedSolution,
            processTableData: processTableDataCopy,
        });
        this.explanation = [];
    }

    /**
     * Checks if the CPU is running a process.
     *
     * @private
     * @returns {boolean} true if the CPU is running a process, false otherwise
     */
    isRunning() {
        return this.cpu !== -1;
    }

    /**
     * Initializes the execution of a process.
     *
     * @private
     * @param {number} pid The process id
     * @returns {void}
     */
    initExecution(pid) {
        this.execStats = {
            pid: pid,
            start: this.timer,
            end: this.timer,
        };

        const priority = this.getProcessPriority(pid);
        this.addExplanation(`Process ${pid} was scheduled\n\n`);
        // this.setQuantum(pid, this.getQueueQuantum(priority));
        this.updateProcessState(pid, PROCESSES.STATES.RUNNING);
    }

    /**
     * Ends the execution of a process.
     *
     * @private
     * @param {number} pid The process id
     * @param {boolean} isDone True if the process is done, false otherwise
     * @returns {void}
     */
    endProcess(pid, isDone = true) {
        this.done++;

        this.processTableData = this.processTableData.map((process) => {
            if (process.pid === pid) {
                process.endTime = this.timer + 1;
                process.turnaroundTime = process.endTime - process.arrivalTime;
            }
            return process;
        });

        this.updateProcessState(pid, PROCESSES.STATES.DONE);
        this.unscheduleProcess(isDone);
    }

    /**
     * Checks if a process has timed out.
     *
     * @private
     * @param {number} pid The process id
     * @param {boolean} io True if the process is in io, false otherwise
     * @returns {void}
     */
    checkTimeout(pid, io = false) {
        const quantumLeft = this.PCB[pid].quantumLeft ?? -1;
        const allotmentLeft = this.PCB[pid].allotmentLeft ?? -1;

        let hasNoQuantumLeft = false;
        let hasNoAllotmentLeft = false;

        if (!quantumLeft && this.shouldDescheduleOnTimeout()) {
            hasNoQuantumLeft = true;
        }

        if (!allotmentLeft) {
            hasNoAllotmentLeft = true;
        }

        if (!hasNoQuantumLeft && !hasNoAllotmentLeft) {
            return;
        }

        if (hasNoQuantumLeft) {
            // this.addExplanation(`Process ${pid + 1} finished its quantum`);
        }

        let priority = this.getProcessPriority(pid);

        if (hasNoAllotmentLeft) {
            // this.addExplanation(`Process ${pid + 1} finished its allotment`);

            if (priority + 1 <= this.readyQueues.length - 1) {
                priority++;

                // this.addExplanation(
                //     `Process ${pid + 1} moved to queue with priority ${priority}`
                // );

                const readyQueueAllotment = this.getQueueAllotment(priority);
                this.setAllotment(pid, readyQueueAllotment);
                this.setPriority(pid, priority);
            } else {
                // this.addExplanation(
                //     `Process ${pid + 1} remained in queue with priority ${priority}`
                // );
            }
        }

        if (io) {
            this.updateProcessState(pid, PROCESSES.STATES.WAIT);
            return;
        }

        this.enqueueToReadyQueue(priority, pid);
        this.unscheduleProcess(true);
    }

    /**
     * Checks if a process has io.
     *
     * @private
     * @param {number} pid The process id
     * @returns {boolean} True if the process has io, false otherwise
     */
    hasIo(pid) {
        const io = this.PCB[pid].io ?? [];
        if (!io.length) {
            return false;
        }

        const currentCpuTime = this.PCB[pid].cpuTime;
        const nextIoStartTime = io[0].start;
        return currentCpuTime === nextIoStartTime;
    }

    /**
     * Starts the io of a process.
     *
     * @private
     * @param {number} pid The process id
     * @returns {void}
     */
    startIo(pid) {
        const nextIoDuration = this.PCB[pid].io[0].duration;
        // this.addExplanation(`Process ${pid + 1} needs io`);
        this.PCB[pid].ioTime = nextIoDuration;
        this.newBlockedQueue.push(pid);
        this.PCB[pid].io.shift();
        this.updateProcessState(pid, PROCESSES.STATES.WAIT);
    }

    /**
     * Gets the solution of the scheduler.
     *
     * @returns {array} the solution sorted by pid
     */
    getSolution() {
        return {
            processes: this.solutionJson.sort((a, b) => a.pid - b.pid),
            customData: this.customData,
        };
    }

    /**
     * Simulation execution helpers — section end
     */

    /**
     * Main execution loop — section start
     */

    /**
     * Update data structures if new processes arrive
     *
     * @private
     * @returns {void}
     */
    updateReadyQueues() {
        let hasNewProcess = false;

        while (this.newProcesses[0]?.arrivalTime === this.timer) {
            const nextProcess = this.newProcesses.shift();
            const { pid, priority } = this.initNewProcess(nextProcess);
            this.processTableData.push({
                pid,
                arrivalTime: nextProcess.arrivalTime,
            });

            this.addExplanation(`Process ${pid} arrived\n\n`);

            this.PCB[pid] = nextProcess;
            this.enqueueToReadyQueue(priority, pid);

            hasNewProcess = true;
        }

        if (
            hasNewProcess &&
            this.isRunning() &&
            this.shouldDescheduleOnNewProcess()
        ) {
            const currentPriority = this.getProcessPriority(this.cpu);
            this.enqueueToReadyQueue(currentPriority, this.cpu);
            this.unscheduleProcess(false);
        }
    }

    /**
     * Schedules a new process.
     *
     * @private
     * @returns {void}
     */
    schedule() {
        if (this.isRunning()) {
            return;
        }

        // check if there is a next process
        const nextProcessInfo = this.getNextProcessInfo();
        const readyQueue = nextProcessInfo.readyQueue;
        const readyQueueIndex = nextProcessInfo.readyQueueIndex;
        if (readyQueue === -1 || readyQueueIndex === -1) {
            return;
        }

        const pid = this.dequeueFromReadyQueue(readyQueue, readyQueueIndex);

        this.addExplanation(
            `Process ${pid} removed from ready queue ${readyQueue}\n\n`
        );

        this.processTableData = this.processTableData.map((process) => {
            if (process.pid === pid && process.scheduledTime === undefined) {
                process.scheduledTime = this.timer;
                process.waitingTime =
                    process.scheduledTime - process.arrivalTime;
            }

            return process;
        });

        this.initExecution(pid);

        // schedule process
        this.cpu = pid;
    }

    /**
     * Deschedules the current process.
     *
     * @private
     * @returns {void} Nothing
     */
    unscheduleProcess(isDone = false) {
        const pid = this.cpu;

        // this.addExplanation(`Process ${pid + 1} descheduled`);
        if (isDone) {
            this.execStats.end = this.timer + 1;
        } else {
            this.execStats.end = this.timer;
        }

        this.solutionJson.push(this.execStats);
        this.cpu = -1;
    }

    /**
     * Executes a process.
     *
     * @private
     * @returns {void}
     */
    executeProcess() {
        if (!this.isRunning()) {
            return;
        }

        if (this.execStats) {
            const start = this.execStats.start;
            this.execStats.end = this.timer + 1;
        }

        const index = this.cpu;

        if (this.hasProcessFinished(index)) {
            this.endProcess(index, false);
            return;
        }

        const hasIo = this.hasIo(index);

        this.tickCpuTime(index);
        this.reduceQuantum(index);
        this.reduceAllotment(index);

        if (hasIo) {
            this.startIo(index);
            this.checkTimeout(index, true);
            this.unscheduleProcess(true);
            return;
        }

        if (this.hasProcessFinished(index)) {
            this.endProcess(index);
            return;
        }

        this.checkTimeout(index);
    }

    /**
     * Executes IO.
     *
     * @private
     * @returns {void}
     */
    handleIo() {
        const newBlockedQueue = [];

        for (let i = 0; i < this.blockedQueue.length; i++) {
            const index = this.blockedQueue[i];
            this.tickIoTimer(index);

            if (this.PCB[index].ioTime === 0) {
                const priority = this.getProcessPriority(index);
                this.enqueueToReadyQueue(priority, index);
            } else {
                newBlockedQueue.push(index);
            }
        }

        this.blockedQueue = newBlockedQueue;
    }

    /**
     * Main execution loop — section end
     */

    /**
     * Ready queue helpers — section start
     */

    /**
     * Adds a process to a particular ready queue.
     *
     * @private
     * @param {number} priority The priority
     * @param {number} pid The process id
     * @returns {void}
     */
    enqueueToReadyQueue(priority, pid) {
        this.readyQueues[priority].queue.push(pid);
        this.updateProcessState(pid, PROCESSES.STATES.READY);
    }

    /**
     * Gets the process from the ready queue and returns it.
     *
     * @private
     * @param {number} readyQueue The ready queue
     * @param {number} readyQueueIndex The index of the process in the ready queue
     * @returns {number} The process id
     */
    dequeueFromReadyQueue(readyQueue, readyQueueIndex) {
        return this.readyQueues[readyQueue].queue.splice(readyQueueIndex, 1)[0];
    }

    /**
     * Returns the quantum of a ready queue.
     *
     * @private
     * @param {number} priority The priority
     * @returns {number} The quantum of a ready queue
     */
    getQueueQuantum(priority) {
        return this.readyQueues[priority].quantum;
    }

    getQueueAllotment(priority) {
        return this.readyQueues[priority].allotment;
    }

    /**
     * Ready queue helpers — section end
     */

    /**
     * PCB helpers — section start
     */

    /**
     * Switches the state of a process.
     *
     * @private
     * @param {number} pid The process id
     * @param {string} state The new state
     * @returns {void}
     */
    updateProcessState(pid, state) {
        console.log("PCB", this.PCB);
        console.log("pid", pid);
        this.PCB[pid].state = state;
        this.addExplanation(`Process ${pid} changed its state to ${state}`);
        this.addCustomData(state === PROCESSES.STATES.DONE);
    }

    /**
     * Gets the priority of a process.
     *
     * @private
     * @param {number} pid The process id
     * @returns {number} The priority
     */
    getProcessPriority(pid) {
        return this.PCB[pid].priority;
    }

    /**
     * Sets the quantum of a process.
     *
     * @private
     * @param {number} pid The process id
     * @param {number} quantum The quantum
     * @returns {void}
     */
    setQuantum(pid, quantum) {
        this.PCB[pid].quantumLeft = quantum;
    }

    setAllotment(pid, allotment) {
        this.PCB[pid].allotmentLeft = allotment;
    }

    setPriority(pid, priority) {
        this.PCB[pid].priority = priority;
    }

    /**
     * Checks if a process is finished.
     *
     * @private
     * @param {number} pid The process id
     * @returns {boolean} True if the process is finished, false otherwise
     */
    hasProcessFinished(pid) {
        const value = this.PCB[pid].cpuTime === this.PCB[pid].burstTime;

        if (value) {
            // this.addExplanation(`Process ${pid + 1} finished`);
        }

        return value;
    }

    /**
     * Decrements the quantum left of a process.
     *
     * @private
     * @param {number} pid The process id
     * @returns {void}
     */
    reduceQuantum(pid) {
        if (!this.PCB[pid].quantumLeft || this.PCB[pid].quantumLeft < 1) {
            return;
        }

        this.PCB[pid].quantumLeft--;
        const quantumLeft = this.PCB[pid].quantumLeft;
        // this.addExplanation(
        //     `Process ${pid + 1} has ${quantumLeft} quantum left`
        // );
    }

    reduceAllotment(pid) {
        if (!this.PCB[pid].allotmentLeft || this.PCB[pid].allotmentLeft < 1) {
            return;
        }

        this.PCB[pid].allotmentLeft--;
        const allotmentLeft = this.PCB[pid].allotmentLeft;
        // this.addExplanation(
        //     `Process ${pid + 1} has ${allotmentLeft} allotment left`
        // );
    }

    /**
     * PCB helpers — section end
     */

    /**
     * New queue helpers — section start
     */

    /**
     * Decrements the io time of a process.
     *
     * @private
     * @param {number} pid The process id
     * @returns {void}
     */
    tickIoTimer(pid) {
        this.PCB[pid].ioTime--;

        const timeLeft = this.PCB[pid].ioTime;
        const unitText = timeLeft === 1 ? "unit" : "units";
        // this.addExplanation(
        //     `Process ${
        //         pid + 1
        //     } ran I/O for one unit, it has ${timeLeft} ${unitText} left`
        // );
    }

    /**
     * Increments the cpu time of a process.
     *
     * @private
     * @param {number} pid The process id
     * @returns {void}
     */
    tickCpuTime(pid) {
        this.PCB[pid].cpuTime++;
        const timeLeft = this.PCB[pid].burstTime - this.PCB[pid].cpuTime;
        const unitText = timeLeft === 1 ? "unit" : "units";

        // this.addExplanation(
        //     `Process ${
        //         pid + 1
        //     } run for one time unit, it has ${timeLeft} ${unitText} left`
        // );
    }

    /**
     * New queue helpers — section end
     */

    boost() {}
}

export default Scheduler;
