/**
 * Disk Scheduling Algorithms Service
 * Implements various disk scheduling algorithms
 */

/**
 * First Come First Serve (FCFS) Algorithm
 */
function fcfs(requests, initialHeadPosition) {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;

    // Initial step
    steps.push({
        step: 0,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `Starting at initial head position ${initialHeadPosition}. Ready to process requests in FCFS order.`,
        remainingRequests: [...requests],
    });

    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const seekTime = Math.abs(request - currentPosition);
        totalSeekTime += seekTime;
        currentPosition = request;
        sequence.push(request);

        steps.push({
            step: i + 1,
            currentPosition: request,
            targetRequest: request,
            seekDistance: seekTime,
            totalSeekTime: totalSeekTime,
            explanation: `Step ${i + 1}: Moving head from ${sequence[i]} to ${request}. Seek distance: ${seekTime}. Total seek time so far: ${totalSeekTime}.`,
            remainingRequests: requests.slice(i + 1),
        });
    }

    return {
        sequence,
        totalSeekTime,
        averageSeekTime: totalSeekTime / requests.length,
        steps,
    };
}

/**
 * Shortest Seek Time First (SSTF) Algorithm
 */
function sstf(requests, initialHeadPosition) {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    const remainingRequests = [...requests];
    let stepCount = 0;

    // Initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `Starting at initial head position ${initialHeadPosition}. Using SSTF algorithm to find closest request.`,
        remainingRequests: [...remainingRequests],
    });

    while (remainingRequests.length > 0) {
        stepCount++;

        // Find the request with minimum seek time
        let minSeekTime = Infinity;
        let minIndex = -1;
        const seekTimes = [];

        for (let i = 0; i < remainingRequests.length; i++) {
            const seekTime = Math.abs(remainingRequests[i] - currentPosition);
            seekTimes.push(`${remainingRequests[i]}(${seekTime})`);
            if (seekTime < minSeekTime) {
                minSeekTime = seekTime;
                minIndex = i;
            }
        }

        // Move to the closest request
        const nextRequest = remainingRequests[minIndex];
        totalSeekTime += minSeekTime;
        currentPosition = nextRequest;
        sequence.push(nextRequest);
        remainingRequests.splice(minIndex, 1);

        steps.push({
            step: stepCount,
            currentPosition: nextRequest,
            targetRequest: nextRequest,
            seekDistance: minSeekTime,
            totalSeekTime: totalSeekTime,
            explanation: `Step ${stepCount}: Analyzing seek times: [${seekTimes.join(", ")}]. Closest request is ${nextRequest} with seek distance ${minSeekTime}. Moving head to ${nextRequest}. Total seek time: ${totalSeekTime}.`,
            remainingRequests: [...remainingRequests],
        });
    }

    return {
        sequence,
        totalSeekTime,
        averageSeekTime: totalSeekTime / requests.length,
        steps,
    };
}

/**
 * SCAN (Elevator) Algorithm
 */
function scan(requests, initialHeadPosition, maxDiskSize, direction = "right") {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    let stepCount = 0;
    const sortedRequests = [...requests].sort((a, b) => a - b);

    // Split requests into left and right of current position
    const leftRequests = sortedRequests.filter((req) => req < currentPosition);
    const rightRequests = sortedRequests.filter((req) => req > currentPosition);

    // Initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `Starting at position ${initialHeadPosition}. SCAN algorithm moving ${direction}. Left requests: [${leftRequests.join(", ")}], Right requests: [${rightRequests.join(", ")}].`,
        remainingRequests: [...requests],
    });

    if (direction === "right") {
        // Service right requests first
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
                explanation: `Step ${stepCount}: Moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Go to end only if there are left requests to service after
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
                explanation: `Step ${stepCount}: Reached end of disk at position ${maxDiskSize - 1}. Seek distance: ${seekTime}. Now reversing direction to service left requests.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Service left requests (in descending order - from closest to head to farthest)
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
                explanation: `Step ${stepCount}: Moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }
    } else {
        // Service left requests first (in descending order)
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
                explanation: `Step ${stepCount}: Moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Go to beginning only if there are right requests to service after
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
                explanation: `Step ${stepCount}: Reached beginning of disk at position 0. Seek distance: ${seekTime}. Now reversing direction to service right requests.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Service right requests
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
                explanation: `Step ${stepCount}: Moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
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

/**
 * C-SCAN (Circular SCAN) Algorithm
 */
function cscan(
    requests,
    initialHeadPosition,
    maxDiskSize,
    direction = "right"
) {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    let stepCount = 0;
    const sortedRequests = [...requests].sort((a, b) => a - b);

    // Split requests into left and right of current position
    const leftRequests = sortedRequests.filter((req) => req < currentPosition);
    const rightRequests = sortedRequests.filter((req) => req > currentPosition);

    // Initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `Starting at position ${initialHeadPosition}. C-SCAN algorithm moving ${direction}. Left requests: [${leftRequests.join(", ")}], Right requests: [${rightRequests.join(", ")}].`,
        remainingRequests: [...requests],
    });

    if (direction === "right") {
        // Service right requests first
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
                explanation: `Step ${stepCount}: Moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Go to end and jump to beginning (but don't add boundaries to sequence)
        if (rightRequests.length > 0 || leftRequests.length > 0) {
            stepCount++;
            const seekTime = Math.abs(maxDiskSize - 1 - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = maxDiskSize - 1;
            // Don't add boundary to sequence: sequence.push(maxDiskSize - 1);

            steps.push({
                step: stepCount,
                currentPosition: maxDiskSize - 1,
                targetRequest: null,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: Reached end of disk at position ${maxDiskSize - 1}. Seek distance: ${seekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.slice(1).includes(r)
                ), // Exclude initial position
            });

            // Jump to beginning
            stepCount++;
            const jumpTime = Math.abs(0 - currentPosition);
            totalSeekTime += jumpTime;
            currentPosition = 0;
            // Don't add boundary to sequence: sequence.push(0);

            steps.push({
                step: stepCount,
                currentPosition: 0,
                targetRequest: null,
                seekDistance: jumpTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: C-SCAN jump to beginning at position 0. Seek distance: ${jumpTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.slice(1).includes(r)
                ), // Exclude initial position
            });
        }

        // Service left requests from beginning
        for (const request of leftRequests) {
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
                explanation: `Step ${stepCount}: Moving right from beginning to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }
    } else {
        // Service left requests first (in reverse order)
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
                explanation: `Step ${stepCount}: Moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Go to beginning and jump to end (but don't add boundaries to sequence)
        if (leftRequests.length > 0 || rightRequests.length > 0) {
            stepCount++;
            const seekTime = Math.abs(0 - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = 0;
            // Don't add boundary to sequence: sequence.push(0);

            steps.push({
                step: stepCount,
                currentPosition: 0,
                targetRequest: null,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: Reached beginning of disk at position 0. Seek distance: ${seekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.slice(1).includes(r)
                ), // Exclude initial position
            });

            // Jump to end
            stepCount++;
            const jumpTime = Math.abs(maxDiskSize - 1 - currentPosition);
            totalSeekTime += jumpTime;
            currentPosition = maxDiskSize - 1;
            // Don't add boundary to sequence: sequence.push(maxDiskSize - 1);

            steps.push({
                step: stepCount,
                currentPosition: maxDiskSize - 1,
                targetRequest: null,
                seekDistance: jumpTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: C-SCAN jump to end at position ${maxDiskSize - 1}. Seek distance: ${jumpTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.slice(1).includes(r)
                ), // Exclude initial position
            });
        }

        // Service right requests from end
        for (const request of rightRequests.reverse()) {
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
                explanation: `Step ${stepCount}: Moving left from end to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
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

/**
 * LOOK Algorithm
 */
function look(requests, initialHeadPosition, maxDiskSize, direction = "right") {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    let stepCount = 0;
    const sortedRequests = [...requests].sort((a, b) => a - b);

    // Split requests into left and right of current position
    const leftRequests = sortedRequests
        .filter((req) => req < currentPosition)
        .reverse();
    const rightRequests = sortedRequests.filter((req) => req > currentPosition);

    // Initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `Starting at position ${initialHeadPosition}. LOOK algorithm moving ${direction}. Left requests: [${leftRequests.reverse().join(", ")}], Right requests: [${rightRequests.join(", ")}].`,
        remainingRequests: [...requests],
    });

    if (direction === "right") {
        // Service right requests first
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
                explanation: `Step ${stepCount}: Moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Service left requests
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
                explanation: `Step ${stepCount}: Reversing direction, moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }
    } else {
        // Service left requests first
        for (const request of leftRequests) {
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
                explanation: `Step ${stepCount}: Moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: requests.filter(
                    (r) => !sequence.includes(r)
                ),
            });
        }

        // Service right requests
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
                explanation: `Step ${stepCount}: Reversing direction, moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
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

/**
 * C-LOOK (Circular LOOK) Algorithm
 */
function clook(
    requests,
    initialHeadPosition,
    maxDiskSize,
    direction = "right"
) {
    // Validate inputs
    if (!requests || requests.length === 0) {
        throw new Error("C-LOOK: No requests to process");
    }

    if (initialHeadPosition < 0 || initialHeadPosition >= maxDiskSize) {
        throw new Error("C-LOOK: Invalid initial head position");
    }

    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    let stepCount = 0;
    const sortedRequests = [...requests].sort((a, b) => a - b);

    // Split requests into left and right of current position
    const leftRequests = sortedRequests.filter((req) => req < currentPosition);
    const rightRequests = sortedRequests.filter((req) => req > currentPosition);

    // Handle edge case where all requests are at the same position as head
    const samePositionRequests = sortedRequests.filter(
        (req) => req === currentPosition
    );
    if (samePositionRequests.length === requests.length) {
        // All requests are at the current position, no movement needed
        for (const request of samePositionRequests) {
            stepCount++;
            sequence.push(request);
            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: 0,
                totalSeekTime: 0,
                explanation: `Step ${stepCount}: Request ${request} is at current position. No seek needed.`,
                remainingRequests: [],
            });
        }
        return {
            sequence,
            totalSeekTime: 0,
            averageSeekTime: 0,
            steps,
        };
    }

    // Initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `Starting at position ${initialHeadPosition}. C-LOOK algorithm moving ${direction}. Left requests: [${leftRequests.join(", ")}], Right requests: [${rightRequests.join(", ")}].`,
        remainingRequests: [...requests],
    });

    if (direction === "right") {
        // Service right requests first (in ascending order)
        for (const request of rightRequests) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            const processedRequests = sequence.slice(1); // Exclude initial position
            const remainingRequests = requests.filter(
                (r) => !processedRequests.includes(r)
            );
            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: Moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingRequests,
            });
        }

        // Jump to leftmost request and service left requests (in ascending order)
        if (leftRequests.length > 0) {
            // Jump to leftmost request
            stepCount++;
            const leftmostRequest = leftRequests[0];
            const jumpTime = Math.abs(leftmostRequest - currentPosition);
            totalSeekTime += jumpTime;
            currentPosition = leftmostRequest;
            sequence.push(leftmostRequest);

            const remainingAfterJump = requests.filter(
                (r) => !sequence.slice(1).includes(r)
            );
            steps.push({
                step: stepCount,
                currentPosition: leftmostRequest,
                targetRequest: leftmostRequest,
                seekDistance: jumpTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: C-LOOK jump to leftmost request ${leftmostRequest}. Seek distance: ${jumpTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingAfterJump,
            });

            // Service remaining left requests (in ascending order)
            for (let i = 1; i < leftRequests.length; i++) {
                stepCount++;
                const request = leftRequests[i];
                const seekTime = Math.abs(request - currentPosition);
                totalSeekTime += seekTime;
                currentPosition = request;
                sequence.push(request);

                const remainingRequests = requests.filter(
                    (r) => !sequence.slice(1).includes(r)
                );
                steps.push({
                    step: stepCount,
                    currentPosition: request,
                    targetRequest: request,
                    seekDistance: seekTime,
                    totalSeekTime: totalSeekTime,
                    explanation: `Step ${stepCount}: Moving right to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                    remainingRequests: remainingRequests,
                });
            }
        }
    } else {
        // Service left requests first (in descending order)
        for (const request of leftRequests.reverse()) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            const remainingRequests = requests.filter(
                (r) => !sequence.slice(1).includes(r)
            );
            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: Moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingRequests,
            });
        }

        // Jump to rightmost request and service right requests (in descending order)
        if (rightRequests.length > 0) {
            // Jump to rightmost request
            stepCount++;
            const rightmostRequest = rightRequests[rightRequests.length - 1];
            const jumpTime = Math.abs(rightmostRequest - currentPosition);
            totalSeekTime += jumpTime;
            currentPosition = rightmostRequest;
            sequence.push(rightmostRequest);

            const remainingAfterJump = requests.filter(
                (r) => !sequence.slice(1).includes(r)
            );
            steps.push({
                step: stepCount,
                currentPosition: rightmostRequest,
                targetRequest: rightmostRequest,
                seekDistance: jumpTime,
                totalSeekTime: totalSeekTime,
                explanation: `Step ${stepCount}: C-LOOK jump to rightmost request ${rightmostRequest}. Seek distance: ${jumpTime}. Total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingAfterJump,
            });

            // Service remaining right requests (in descending order)
            for (let i = rightRequests.length - 2; i >= 0; i--) {
                stepCount++;
                const request = rightRequests[i];
                const seekTime = Math.abs(request - currentPosition);
                totalSeekTime += seekTime;
                currentPosition = request;
                sequence.push(request);

                const remainingRequests = requests.filter(
                    (r) => !sequence.slice(1).includes(r)
                );
                steps.push({
                    step: stepCount,
                    currentPosition: request,
                    targetRequest: request,
                    seekDistance: seekTime,
                    totalSeekTime: totalSeekTime,
                    explanation: `Step ${stepCount}: Moving left to service request ${request}. Seek distance: ${seekTime}. Total seek time: ${totalSeekTime}.`,
                    remainingRequests: remainingRequests,
                });
            }
        }
    }

    return {
        sequence,
        totalSeekTime,
        averageSeekTime: totalSeekTime / requests.length,
        steps,
    };
}

/**
 * Main disk scheduling function
 */
export function simulateDiskScheduling(
    algorithm,
    requests,
    initialHeadPosition,
    maxDiskSize,
    headDirection
) {
    // Validate inputs
    if (!Array.isArray(requests) || requests.length === 0) {
        throw new Error("Requests must be a non-empty array");
    }

    if (initialHeadPosition < 0 || initialHeadPosition >= maxDiskSize) {
        throw new Error("Initial head position must be within disk bounds");
    }

    // Filter out invalid requests
    const validRequests = requests.filter(
        (req) => req >= 0 && req < maxDiskSize
    );

    if (validRequests.length === 0) {
        throw new Error("No valid requests within disk bounds");
    }

    let result;

    try {
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
                console.log(
                    `Running C-SCAN with requests: [${validRequests.join(", ")}], head: ${initialHeadPosition}, direction: ${headDirection}`
                );
                result = cscan(
                    validRequests,
                    initialHeadPosition,
                    maxDiskSize,
                    headDirection
                );
                console.log(
                    `C-SCAN completed. Sequence: [${result.sequence.join(" → ")}], Total seek: ${result.totalSeekTime}`
                );
                break;
            case "clook":
                console.log(
                    `Running C-LOOK with requests: [${validRequests.join(", ")}], head: ${initialHeadPosition}, direction: ${headDirection}`
                );
                result = clook(
                    validRequests,
                    initialHeadPosition,
                    maxDiskSize,
                    headDirection
                );
                console.log(
                    `C-LOOK completed. Sequence: [${result.sequence.join(" → ")}], Total seek: ${result.totalSeekTime}`
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
            default:
                throw new Error(`Unknown algorithm: ${algorithm}`);
        }
    } catch (error) {
        console.error(
            `Error in ${algorithm.toUpperCase()} algorithm:`,
            error.message
        );
        console.error("Stack trace:", error.stack);
        throw new Error(
            `${algorithm.toUpperCase()} algorithm failed: ${error.message}`
        );
    }

    return {
        ...result,
        algorithm: algorithm.toLowerCase(),
        initialHeadPosition,
        maxDiskSize,
        headDirection,
        requestCount: validRequests.length,
        requests: validRequests,
    };
}
