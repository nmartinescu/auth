import Scheduler from "../Scheduler.js";
import ReadyQueuesManager from "../ReadyQueuesManager.js";

class SchedulerRR extends Scheduler {
    initializeReadyQueues(extra) {
        this.readyQueues = new ReadyQueuesManager(1, { quantum: [extra.quantum] });
    }

    getScheduledProcess() {
        const readyQueue = this.readyQueues.getQueue(0);
        if (!readyQueue.length) {
            return -1;
        }

        return readyQueue[0];
    }

    shouldDescheduleOnNewProcess() {
        return false;
    }

    shouldDescheduleOnTimeout() {
        return true;
    }
}

export default SchedulerRR;