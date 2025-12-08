import QueueManager from "./QueueManager.js";

class ReadyQueuesManager extends QueueManager {
    constructor(readyQueuesCount, queueData = {}, allotment = -1) {
        const queue = [];
        for (let i = 0; i < readyQueuesCount; i++) {
            queue.push(new QueueManager([]));
        }

        super(queue);
        this.queueData = queueData;
        this.allotment = allotment;
    }

    getQueue(readyQueueIndex) {
        return this.queue[readyQueueIndex].getQueue();
    }

    getQueueQuantum(readyQueueIndex) {
        if (!this.queueData.quantum) {
            return -1;
        }

        return this.queueData.quantum[readyQueueIndex] || -1;
    }

    getAllotment() {
        return this.allotment;
    }

    addToReadyQueue(readyQueueIndex, pid) {
        this.queue[readyQueueIndex].add(pid);
    }

    removeFromReadyQueue(pid) {
        for (let i = 0; i < this.queue.length; i++) {
            this.queue[i].remove(pid);            
        }
    }
}

export default ReadyQueuesManager;