import { Card, Box, useToken } from "@chakra-ui/react";
import {
    ResponsiveContainer,
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Line,
} from "recharts";

export default function CpuChart({ processes, time }: any) {
    const [borderColor, lineColor] = useToken("colors", [
        "gray.300",
        "blue.500",
    ]);
    const data: any = [];
    processes.forEach((process: any) => {
        const objStart: any = {};
        if (process.pid) {
            objStart[`cpu${process.pid}`] = process.pid;
        }
        objStart.time = process.time;
        data.push(objStart);
    });

    // merge same time
    // let chartData = data.reduce((acc: any[], obj: any) => {
    //     const existing = acc.find((entry) => entry.time === obj.time);
    //     if (existing) {
    //         Object.assign(existing, obj);
    //     } else {
    //         acc.push({ ...obj });
    //     }
    //     return acc;
    // }, []);

    // sort by time
    const chartData = data.sort((a: any, b: any) => a.time - b.time);

    console.log("Chart Data", chartData);

    // chartData = [
    //     {
    //         cpu1: 1,
    //         time: 0,
    //     },
    //     {
    //         cpu1: 1,
    //         time: 1,
    //         cpu2: 2,
    //     },
    //     {
    //         time: 1,
    //         cpu2: 2,
    //     },
    //     {
    //         cpu2: 2,
    //         time: 3,
    //         cpu1: 1,
    //     },
    //     {
    //         cpu1: 1,
    //         time: 7,
    //     },
    // ];

    const xDomain = [0, time];
    const xTicks = Array.from({ length: time + 1 }, (_, i) => i);
    const yDomain = [0, 2];

    return (
        <Card.Root mt="8" boxShadow="6px 6px 4px rgba(0, 0, 0, 0.3)">
            <Card.Header>
                <Card.Title textAlign="center">CPU Scheduling Chart</Card.Title>
            </Card.Header>
            <Card.Body>
                <Box h="300px">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 10,
                                bottom: 40,
                            }}
                        >
                            <CartesianGrid
                                stroke={borderColor}
                                vertical={false}
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                dataKey="time"
                                domain={xDomain}
                                allowDecimals={false}
                                stroke={borderColor}
                                ticks={xTicks}
                                label={{
                                    value: "Time",
                                    position: "insideBottom",
                                    dy: 20,
                                }}
                            />
                            <YAxis
                                type="number"
                                domain={yDomain}
                                allowDecimals={false}
                                axisLine={false}
                                stroke={borderColor}
                                label={{
                                    value: "CPU #",
                                    angle: -90,
                                    position: "insideLeft",
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "8px",
                                }}
                                labelFormatter={(label) => `Time: ${label}`}
                            />
                            <Line
                                type="linear"
                                dataKey="cpu"
                                stroke={lineColor}
                                strokeWidth="2"
                                activeDot={{ r: 6 }}
                            />

                            <Line
                                type="linear"
                                strokeWidth="2"
                                activeDot={{ r: 6 }}
                                dataKey="cpu1"
                                stroke="blue"
                            />
                            <Line
                                type="linear"
                                strokeWidth="2"
                                activeDot={{ r: 6 }}
                                dataKey="cpu2"
                                stroke="red"
                            />
                            <Line
                                type="linear"
                                strokeWidth="2"
                                activeDot={{ r: 6 }}
                                dataKey="cpu3"
                                stroke="green"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </Card.Body>
        </Card.Root>
    );
}
