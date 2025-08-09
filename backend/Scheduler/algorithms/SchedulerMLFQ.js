import Scheduler from "../Scheduler.js";

class SchedulerMLFQ extends Scheduler {

    createReadyQueues(extra) {
        const queues = extra.queues;

        this.readyQueues = [];
        for (let i = 0; i < queues.length; i++) {
            this.readyQueues.push({
                queue: [],
                priority: 0,
                quantum: queues[i].quantum,
                allotment: queues[i].allotmentTime
            });
        }
        this.boostTime = extra.boostTime;
        console.log(this.readyQueues);
        console.log(this.newQueue);
    }

    getInitialPriority() {
        return 0;
    }

    initNewProcess(process) {
        process.priority = this.getInitialPriority();
        process.quantumLeft = this.readyQueues[0].quantum;
        process.allotmentLeft = this.readyQueues[0].allotment;
        return process;
    }

    shouldDescheduleOnNewProcess() {
        const index = this.cpu;
        const currentPriority = this.getProcessPriority(index);

        // deschedule if a new process has arrived and the current process is not the highest priority
        return currentPriority > 0;
    }

    getNextProcessInfo() {
        for (let i = 0; i < this.readyQueues.length; i++) {
            const readyQueue = this.readyQueues[i].queue;
            if (readyQueue.length > 0) {
                // this.executionStat = {
                //     start: this.timer,
                //     end: this.timer,
                //     pid: process.pid,
                // };
                // return process.pid;
                return {
                    readyQueue: i,
                    readyQueueIndex: 0,
                }
            }
        }

        return {
            readyQueue: -1,
            readyQueueIndex: -1
        };
    }

    shouldDescheduleOnTimeout() {
        return true;
    }

    boost() {
        this.addExplaination("Boosting processes");
        const boostedProcesses = [];

        const processes = [];
        for (let i = 0; i < this.readyQueues.length; i++) {
            while (this.readyQueues[i].readyQueue.length > 0) {
                const process = this.readyQueues[i].queue.shift();
                process.priority = 0;

                if (i > 0) {
                    this.PCB[process.pid].allotmentLeft = this.readyQueues[0].allotment;
                }

                processes.push(process);
            }
        }

        while(processes.length > 0) {
            const process = processes.shift();
            boostedProcesses.push(process.pid);
            this.readyQueues[0].queue.push(process);
            this.PCB[process.pid].priority = 0;
        }

        const boostedProcessesText = boostedProcesses.join(", ");
        this.addExplaination(`Boosted processes: ${boostedProcessesText}`);
    }

}

export default SchedulerMLFQ;