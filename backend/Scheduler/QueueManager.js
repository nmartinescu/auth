class QueueManager {
    constructor(queue) {
        this.queue = queue;
    }

    getQueue() {
        return this.queue;
    }

    setQueue(queue) {
        this.queue = queue;
    }

    getNth(n) {
        return this.queue[n];
    }

    add(n) {
        this.queue.push(n);
    }

    remove(n) {
        const index = this.queue.indexOf(n);
        if (index !== -1) {
            this.queue.splice(index, 1);
        }
    }
}

export default QueueManager;