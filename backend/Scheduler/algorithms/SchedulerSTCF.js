
import Scheduler from "../Scheduler.js";
import ReadyQueuesManager from "../ReadyQueuesManager.js";

class SchedulerSTCF extends Scheduler {
    initializeReadyQueues() {
        this.readyQueues = new ReadyQueuesManager(1);
    }

    shouldDescheduleOnNewProcess() {
        return true;
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
            if (pcbRecord.burstTime < minPcbRecord.burstTime) {
                minIndex = i;
            }
        }
        return readyQueue[minIndex];
    }

    shouldDescheduleOnTimeout() {
        return false;
    }
}

export default SchedulerSTCF;
