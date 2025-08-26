import SchedulerFCFS from "../../../scheduler/algorithms/SchedulerFCFS";

describe("FCFS Process Scheduling", () => {
    it("test 1", () => {
        const processes = [{ id: 1, arrivalTime: 0, burstTime: 2, io: [] }];
        const scheduler = new SchedulerFCFS(processes);
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
            {
                id: 1,
                arrivalTime: 0,
                burstTime: 2,
                io: [{ start: 0, duration: 2 }],
            },
        ];
        const scheduler = new SchedulerFCFS(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[4].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 0,
                endTime: 4,
                waitingTime: 0,
                turnaroundTime: 4,
            },
        ]);
    });

    it("test 3", () => {
        const processes = [
            { id: 1, arrivalTime: 0, burstTime: 2, io: [] },
            { id: 2, arrivalTime: 0, burstTime: 4, io: [] },
        ];
        const scheduler = new SchedulerFCFS(processes);
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
                arrival: 0,
                scheduledTime: 2,
                endTime: 6,
                waitingTime: 2,
                turnaroundTime: 6,
            },
        ]);
    });

    it("test 4", () => {
        const processes = [
            {
                id: 1,
                arrivalTime: 0,
                burstTime: 2,
                io: [{ start: 1, duration: 2 }],
            },
            { id: 2, arrivalTime: 0, burstTime: 4, io: [] },
        ];
        const scheduler = new SchedulerFCFS(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[7].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 0,
                endTime: 7,
                waitingTime: 0,
                turnaroundTime: 7,
            },
            {
                pid: 2,
                arrival: 0,
                scheduledTime: 2,
                endTime: 6,
                waitingTime: 2,
                turnaroundTime: 6,
            },
        ]);
    });

    it("test 5", () => {
        const processes = [
            {
                id: 1,
                arrivalTime: 0,
                burstTime: 2,
                io: [
                    { start: 0, duration: 1 },
                    { start: 1, duration: 2 },
                ],
            },
            { id: 2, arrivalTime: 0, burstTime: 4, io: [] },
            { id: 3, arrivalTime: 5, burstTime: 2, io: [] },
        ];
        const scheduler = new SchedulerFCFS(processes);
        scheduler.start();
        const solution = scheduler.getSolution();
        expect(solution.customData[12].graphicTable).toStrictEqual([
            {
                pid: 1,
                arrival: 0,
                scheduledTime: 0,
                endTime: 10,
                waitingTime: 0,
                turnaroundTime: 10,
            },
            {
                pid: 2,
                arrival: 0,
                scheduledTime: 1,
                endTime: 5,
                waitingTime: 1,
                turnaroundTime: 5,
            },
            {
                pid: 3,
                arrival: 5,
                scheduledTime: 7,
                endTime: 9,
                waitingTime: 2,
                turnaroundTime: 4,
            }
        ]);
    });
});
