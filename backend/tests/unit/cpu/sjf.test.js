import SchedulerSJF from "../../../scheduler/algorithms/SchedulerSJF";

describe("SJF Process Scheduling", () => {
    it("test 1", () => {
        const processes = [{ id: 1, arrivalTime: 0, burstTime: 2, io: [] }];
        const scheduler = new SchedulerSJF(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[2].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 0,
                endTime: 2,
                waitingTime: 0,
                turnaroundTime: 2,
            },
        ]);
    });

    it("test 2", () => {
        const processes = [
            { id: 1, arrivalTime: 0, burstTime: 2, io: [] },
            { id: 2, arrivalTime: 1, burstTime: 3, io: [] },
        ];
        const scheduler = new SchedulerSJF(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[5].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 0,
                endTime: 2,
                waitingTime: 0,
                turnaroundTime: 2,
            },
            {
                pid: 2,
                arrival: 1,
                scheduledTime: 2,
                endTime: 5,
                waitingTime: 1,
                turnaroundTime: 4,
            }
        ]);
    });

    it("test 3", () => {
        const processes = [
            { id: 1, arrivalTime: 0, burstTime: 3, io: [] },
            { id: 2, arrivalTime: 1, burstTime: 1, io: [] },
        ];
        const scheduler = new SchedulerSJF(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[5].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 0,
                endTime: 3,
                waitingTime: 0,
                turnaroundTime: 3,
            },
            {
                pid: 2,
                arrival: 1,
                scheduledTime: 3,
                endTime: 4,
                waitingTime: 2,
                turnaroundTime: 3,
            }
        ]);
    });

    it("test 4", () => {
        const processes = [
            { id: 1, arrivalTime: 0, burstTime: 3, io: [] },
            { id: 2, arrivalTime: 0, burstTime: 2, io: [] },
        ];
        const scheduler = new SchedulerSJF(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[5].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 2,
                endTime: 5,
                waitingTime: 2,
                turnaroundTime: 5,
            },
            {
                pid: 2,
                arrival: 0,
                scheduledTime: 0,
                endTime: 2,
                waitingTime: 0,
                turnaroundTime: 2,
            }
        ]);
    });

    it("test 5", () => {
        const processes = [
            { id: 1, arrivalTime: 0, burstTime: 3, io: [] },
            { id: 2, arrivalTime: 0, burstTime: 2, io: [] },
            { id: 3, arrivalTime: 1, burstTime: 1, io: [] }
        ];
        const scheduler = new SchedulerSJF(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[8].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 3,
                endTime: 6,
                waitingTime: 3,
                turnaroundTime: 6,
            },
            {
                pid: 2,
                arrival: 0,
                scheduledTime: 0,
                endTime: 2,
                waitingTime: 0,
                turnaroundTime: 2,
            },
            {
                pid: 3,
                arrival: 1,
                scheduledTime: 2,
                endTime: 3,
                waitingTime: 1,
                turnaroundTime: 2,
            }
        ]);
    });
});
