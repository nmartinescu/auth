import Scheduler2 from "../Scheduler2.js";
import ReadyQueuesManager from "../ReadyQueuesManager.js";

class SchedulerSTCF extends Scheduler2 {
    initializeReadyQueues() {
        this.readyQueues = new ReadyQueuesManager(1);
    }

    getInitialPriority() {
        return 0;
    }

    initNewProcess(process) {
        process.priority = this.getInitialPriority();
        return process;
    }

    getScheduledProcess() {
        const readyQueue = this.readyQueues.getQueue(0);

        if (!readyQueue.length) {
            return -1;
        }

        let minIndex = 0;
        for (let i = 1; i < readyQueue.length; i++) {
            const pcbIndex = readyQueue[i];
            const pcbRecord = this.pcb.getRecord(pcbIndex);
            const minPcbRecord = this.pcb.getRecord(readyQueue[minIndex]);

            // burstTime is the remaining time for the process
            if (pcbRecord.burstTime < minPcbRecord.burstTime) {
                minIndex = i;
            }
        }

        const nextProcess = readyQueue[minIndex];
        const nextProcessRecord = this.pcb.getRecord(nextProcess);
        return nextProcessRecord.pid;
    }

    shouldDescheduleOnNewProcess() {
        return true;
    }

    shouldDescheduleOnTimeout() {
        return false;
    }
}

export default SchedulerSTCF;
