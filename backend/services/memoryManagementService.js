/**
 * memory management service
 * main service for handling page replacement algorithm simulations
 */

import { fifo, lru, lfu, optimal, mru } from "../algorithms/memory/index.js";

/**
 * main memory management function
 * @param {string} algorithm algorithm name (fifo, lru, lfu, optimal, mru)
 * @param {number[]} pageReferences array of page references
 * @param {number} frameCount number of frames available
 * @returns {Object} result containing frames, page faults, hit rate, and step details
 */
function simulateMemoryManagement(algorithm, pageReferences, frameCount) {
    // validate inputs
    if (!Array.isArray(pageReferences) || pageReferences.length === 0) {
        throw new Error("page references must be a non empty array");
    }

    if (!frameCount || frameCount <= 0) {
        throw new Error("frame count must be a positive number");
    }

    if (frameCount > pageReferences.length) {
        throw new Error("frame count cannot exceed number of page references");
    }

    // validate page references are non negative integers
    const validPageReferences = pageReferences.filter(
        (page) => Number.isInteger(page) && page >= 0
    );

    if (validPageReferences.length === 0) {
        throw new Error("no valid page references found");
    }

    if (validPageReferences.length !== pageReferences.length) {
        throw new Error("all page references must be non negative integers");
    }

    let result;

    switch (algorithm.toLowerCase()) {
        case "fifo":
            result = fifo(validPageReferences, frameCount);
            break;
        case "lru":
            result = lru(validPageReferences, frameCount);
            break;
        case "lfu":
            result = lfu(validPageReferences, frameCount);
            break;
        case "optimal":
            result = optimal(validPageReferences, frameCount);
            break;
        case "mru":
            result = mru(validPageReferences, frameCount);
            break;
        default:
            throw new Error(`unknown algorithm: ${algorithm}`);
    }

    return {
        ...result,
        algorithm: algorithm.toUpperCase(),
        frameCount,
        pageReferences: validPageReferences,
    };
}

/**
 * get available memory management algorithms
 * @returns {string[]} array of available algorithm names
 */
function getAvailableAlgorithms() {
    return ["fifo", "lru", "lfu", "optimal", "mru"];
}

export { simulateMemoryManagement, getAvailableAlgorithms };
