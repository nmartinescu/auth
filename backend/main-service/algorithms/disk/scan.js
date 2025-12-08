/**
 * scan (elevator) disk scheduling algorithm
 */

/**
 * scan algorithm implementation
 * @param {number[]} requests array of disk requests
 * @param {number} initialHeadPosition initial position of disk head
 * @param {number} maxDiskSize maximum disk size
 * @param {string} direction direction of movement ("right" or "left")
 * @returns {Object} result containing sequence, total seek time, average seek time, and steps
 */
function scan(requests, initialHeadPosition, maxDiskSize, direction = "right") {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    let stepCount = 0;
    const sortedRequests = [...requests].sort((a, b) => a - b);

    // split requests into left and right of current position
    const leftRequests = sortedRequests.filter((req) => req < currentPosition);
    const rightRequests = sortedRequests.filter((req) => req > currentPosition);

    // initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `starting at position ${initialHeadPosition}. scan algorithm moving ${direction}. left requests: [${leftRequests.join(", ")}], right requests: [${rightRequests.join(", ")}].`,
        remainingRequests: [...requests],
    });

    if (direction === "right") {
        // service right requests first
        for (const request of rightRequests) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: moving right to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // go to end only if there are left requests to service after
        if (rightRequests.length > 0 && leftRequests.length > 0) {
            stepCount++;
            const seekTime = Math.abs(maxDiskSize - 1 - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = maxDiskSize - 1;
            sequence.push(maxDiskSize - 1);

            steps.push({
                step: stepCount,
                currentPosition: maxDiskSize - 1,
                targetRequest: null,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: reached end of disk at position ${maxDiskSize - 1}. seek distance: ${seekTime}. now reversing direction to service left requests.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // service left requests (in descending order from closest to head to farthest)
        for (const request of leftRequests.reverse()) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: moving left to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }
    } else {
        // service left requests first (in descending order)
        for (const request of leftRequests.reverse()) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: moving left to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // go to beginning only if there are right requests to service after
        if (leftRequests.length > 0 && rightRequests.length > 0) {
            stepCount++;
            const seekTime = Math.abs(0 - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = 0;
            sequence.push(0);

            steps.push({
                step: stepCount,
                currentPosition: 0,
                targetRequest: null,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: reached beginning of disk at position 0. seek distance: ${seekTime}. now reversing direction to service right requests.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // service right requests
        for (const request of rightRequests) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: moving right to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }
    }

    return {
        sequence,
        totalSeekTime,
        averageSeekTime: totalSeekTime / requests.length,
        steps,
    };
}

export default scan;