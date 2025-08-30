import { createListCollection } from "@chakra-ui/react";

export const DISK_ALGORITHMS = [
    {
        label: "FCFS",
        value: "fcfs",
        description: "First Come First Serve",
    },
    {
        label: "SSTF",
        value: "sstf",
        description: "Shortest Seek Time First",
    },
    {
        label: "SCAN",
        value: "scan",
        description: "Elevator Algorithm",
    },
    {
        label: "C-SCAN",
        value: "cscan",
        description: "Circular SCAN",
    },
    {
        label: "LOOK",
        value: "look",
        description: "LOOK Algorithm",
    },
    {
        label: "C-LOOK",
        value: "clook",
        description: "Circular LOOK",
    },
];

export const algorithmOptions = createListCollection({ items: DISK_ALGORITHMS });

export const DISK_SCHEDULING_DEFAULT_VALUES = {
    algorithm: "fcfs",
    maxDiskSize: 200,
    initialHeadPosition: 50,
    headDirection: "right",
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
};

export const HEAD_DIRECTIONS = [
    {
        label: "Left",
        value: "left",
        description: "Moving towards lower track numbers",
    },
    {
        label: "Right", 
        value: "right",
        description: "Moving towards higher track numbers",
    },
];

export const directionOptions = createListCollection({ items: HEAD_DIRECTIONS });