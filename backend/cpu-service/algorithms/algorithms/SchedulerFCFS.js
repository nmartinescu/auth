import Scheduler from "../Scheduler.js";
import ReadyQueuesManager from "../ReadyQueuesManager.js";

class SchedulerFCFS extends Scheduler {
    initializeReadyQueues() {
        this.readyQueues = new ReadyQueuesManager(1);
    }

    shouldDescheduleOnNewProcess() {
        return false;
    }

    getScheduledProcess() {
        const readyQueue = this.readyQueues.getQueue(0);

        if (!readyQueue.length) {
            return -1;
        }

        return readyQueue[0];
    }

    shouldDescheduleOnTimeout() {
        return false;
    }
}

export default SchedulerFCFS;