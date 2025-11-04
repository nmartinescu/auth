/**
 * disk scheduling service
 * main service for handling disk scheduling algorithm simulations
 */

import {
    fcfs,
    sstf,
    scan,
    cscan,
    look,
    clook,
} from "../algorithms/disk/index.js";

/**
 * main disk scheduling function
 * @param {string} algorithm algorithm name (fcfs, sstf, scan, cscan, look, clook)
 * @param {number[]} requests array of disk requests
 * @param {number} initialHeadPosition initial position of disk head
 * @param {number} maxDiskSize maximum disk size
 * @param {string} headDirection direction of head movement ("right" or "left")
 * @returns {Object} result containing sequence, total seek time, average seek time, and steps
 */
function simulateDiskScheduling(
    algorithm,
    requests,
    initialHeadPosition,
    maxDiskSize,
    headDirection
) {
    // validate inputs
    if (!Array.isArray(requests) || requests.length === 0) {
        throw new Error("requests must be a non empty array");
    }

    if (initialHeadPosition < 0 || initialHeadPosition >= maxDiskSize) {
        throw new Error("initial head position must be within disk bounds");
    }

    // filter out invalid requests
    const validRequests = requests.filter(
        (req) => req >= 0 && req < maxDiskSize
    );

    if (validRequests.length === 0) {
        throw new Error("no valid requests within disk bounds");
    }

    let result;

    switch (algorithm.toLowerCase()) {
        case "fcfs":
            result = fcfs(validRequests, initialHeadPosition);
            break;
        case "sstf":
            result = sstf(validRequests, initialHeadPosition);
            break;
        case "scan":
            result = scan(
                validRequests,
                initialHeadPosition,
                maxDiskSize,
                headDirection
            );
            break;
        case "cscan":
        case "c-scan":
            result = cscan(
                validRequests,
                initialHeadPosition,
                maxDiskSize,
                headDirection
            );
            break;
        case "look":
            result = look(
                validRequests,
                initialHeadPosition,
                maxDiskSize,
                headDirection
            );
            break;
        case "clook":
        case "c-look":
            result = clook(
                validRequests,
                initialHeadPosition,
                maxDiskSize,
                headDirection
            );
            break;
        default:
            throw new Error(`unknown algorithm: ${algorithm}`);
    }

    return {
        ...result,
        algorithm: algorithm.toUpperCase(),
        initialHeadPosition,
        maxDiskSize,
        headDirection,
        validRequests,
    };
}

/**
 * get available disk scheduling algorithms
 * @returns {string[]} array of available algorithm names
 */
function getAvailableAlgorithms() {
    return ["fcfs", "sstf", "scan", "cscan", "look", "clook"];
}

export { simulateDiskScheduling, getAvailableAlgorithms };
