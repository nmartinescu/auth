class Timer {
    constructor(PCB) {
        if (Timer.instance) {
            return Timer.instance;
        }

        Timer.instance = this;
    }

    clock() {
        this.timer++;
    }

    getTimer() {
        return this.timer;
    }

    reset() {
        this.timer = 0;
    }
}

const timer = new Timer();
export default timer;
