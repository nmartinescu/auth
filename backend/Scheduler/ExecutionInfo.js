import timer from "./Timer.js";

class ExecutioInfo {
    constructor() {
        if (ExecutioInfo.instance) {
            return ExecutioInfo.instance;
        }

        ExecutioInfo.instance = this;
    }

    nextStep() {
        const pointsCopy = JSON.parse(JSON.stringify(this.points));

        this.solution[this.step].graphic = pointsCopy;
        this.solution[this.step].graphic.push(...this.temporaryPoint);

        // add ready queues
        this.solution[this.step].readyQueues = [];
        for (let i = 0; i < this.readyQueuesManager.queue.length; i++) {
            const queue = this.readyQueuesManager.getQueue(i);
            const queueCopy = JSON.parse(JSON.stringify(queue));
            this.solution[this.step].readyQueues.push(queueCopy);
        }

        // add wait queue
        this.solution[this.step].waitQueue = [];
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].state === "WAIT") {
                this.solution[this.step].waitQueue.push(this.PCB[i].pid);
            }
        }

        // add new processes
        this.solution[this.step].newProcesses = [];
        for (let i = 1; i < this.PCB.length; i++) {
            if (this.PCB[i].state === "NEW") {
                this.solution[this.step].newProcesses.push(this.PCB[i].pid);
            }
        }

        // add process states for visualization
        this.solution[this.step].processStates = {};
        for (let i = 1; i < this.PCB.length; i++) {
            const process = this.PCB[i];
            this.solution[this.step].processStates[process.pid] = {
                state: process.state,
                pid: process.pid
            };
        }

        // add graphic table
        for (let i = 1; i < this.PCB.length; i++) {
            const process = this.PCB[i];
            this.solution[this.step].graphicTable.push({
                pid: process.pid,
                arrival: process.arrival,
                scheduledTime: process.scheduledTime,
                endTime: process.endTime,
                waitingTime: process.waitingTime,
                turnaroundTime: process.turnaroundTime,
            });
        }

        this.step++;
        this.initializeStep();
    }

    addExplanation(text) {
        this.solution[this.step].explaination.push(text + "\n\n");
    }

    addTimer(plusOne = false) {
        const time = timer.getTimer();
        this.solution[this.step].timer = time + (plusOne ? 1 : 0);
    }

    addPoint(pid, plusOne = false) {
        const time = timer.getTimer();
        this.points.push({
            pid: pid,
            time: time + (plusOne ? 1 : 0),
        });
    }

    addNullPoint() {
        const time = timer.getTimer();
        this.points.push({
            pid: null,
            time: time,
        });
    }

    addTemporaryPoint(pid) {
        const time = timer.getTimer();
        this.temporaryPoint.push({
            pid: pid,
            time: time,
        });
    }

    initializeStep() {
        if (!this.solution[this.step]) {
            this.solution[this.step] = {
                explaination: [],
                graphicTable: [],
                readyQueues: [],
                waitQueue: [],
                newProcesses: [],
                processStates: {},
                graphic: [],
                timer: 0,
            };
            this.temporaryPoint = [];
        }
    }

    getInfo() {
        this.solution.pop();

        // sort by timer
        // this.solution.sort((a, b) => a.timer - b.timer);

        return this.solution;
    }

    reset() {
        this.step = 0;
        this.explanation = [];
        this.readyQueues = [];
        this.solution = [];
        this.points = [];
        this.initializeStep();
    }

    setPCB(PCB) {
        this.PCB = PCB;
    }

    setReadyQueuesManager(readyQueuesManager) {
        this.readyQueuesManager = readyQueuesManager;
    }
}

const executionInfo = new ExecutioInfo();
export default executionInfo;