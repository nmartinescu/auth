import { createListCollection } from "@chakra-ui/react";

export const MEMORY_ALGORITHMS = [
    {
        label: "FIFO",
        value: "fifo",
        description: "First In First Out",
    },
    {
        label: "LRU",
        value: "lru",
        description: "Least Recently Used",
    },
    {
        label: "LFU",
        value: "lfu",
        description: "Least Frequently Used",
    },
    {
        label: "Optimal",
        value: "optimal",
        description: "Optimal Page Replacement",
    },
    {
        label: "MRU",
        value: "mru",
        description: "Most Recently Used",
    },
];

export const algorithmOptions = createListCollection({ items: MEMORY_ALGORITHMS });

export const MEMORY_MANAGEMENT_DEFAULT_VALUES = {
    algorithm: ["fifo"],
    frameCount: 3,
    pageReferences: [1],
};