/**
 * clook (circular look) disk scheduling algorithm
 */

/**
 * clook algorithm implementation
 * @param {number[]} requests array of disk requests
 * @param {number} initialHeadPosition initial position of disk head
 * @param {number} maxDiskSize maximum disk size
 * @param {string} direction direction of movement ("right" or "left")
 * @returns {Object} result containing sequence, total seek time, average seek time, and steps
 */
function clook(requests, initialHeadPosition, maxDiskSize, direction = "right") {
    // validate inputs
    if (!requests || requests.length === 0) {
        throw new Error("clook: no requests to process");
    }

    if (initialHeadPosition < 0 || initialHeadPosition >= maxDiskSize) {
        throw new Error("clook: invalid initial head position");
    }

    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;
    let stepCount = 0;
    const sortedRequests = [...requests].sort((a, b) => a - b);

    // split requests into left and right of current position
    const leftRequests = sortedRequests.filter((req) => req < currentPosition);
    const rightRequests = sortedRequests.filter((req) => req > currentPosition);

    // handle edge case where all requests are at the same position as head
    const samePositionRequests = sortedRequests.filter(
        (req) => req === currentPosition
    );
    if (samePositionRequests.length === requests.length) {
        // all requests are at the current position, no movement needed
        for (const request of samePositionRequests) {
            stepCount++;
            sequence.push(request);
            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: 0,
                totalSeekTime: 0,
                explanation: `step ${stepCount}: request ${request} is at current position. no seek needed.`,
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
// initial step
    steps.push({
        step: stepCount,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `starting at position ${initialHeadPosition}. clook algorithm moving ${direction}. left requests: [${leftRequests.join(", ")}], right requests: [${rightRequests.join(", ")}].`,
        remainingRequests: [...requests],
    });

    if (direction === "right") {
        // service right requests first (in ascending order)
        for (const request of rightRequests) {
            stepCount++;
            const seekTime = Math.abs(request - currentPosition);
            totalSeekTime += seekTime;
            currentPosition = request;
            sequence.push(request);

            const processedRequests = sequence.slice(1); // exclude initial position
            const remainingRequests = requests.filter(
                (r) => !processedRequests.includes(r)
            );
            steps.push({
                step: stepCount,
                currentPosition: request,
                targetRequest: request,
                seekDistance: seekTime,
                totalSeekTime: totalSeekTime,
                explanation: `step ${stepCount}: moving right to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingRequests,
            });
        }

        // jump to leftmost request and service left requests (in ascending order)
        if (leftRequests.length > 0) {
            // jump to leftmost request
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
                explanation: `step ${stepCount}: clook jump to leftmost request ${leftmostRequest}. seek distance: ${jumpTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingAfterJump,
            });        
    // service remaining left requests (in ascending order)
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
                    explanation: `step ${stepCount}: moving right to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                    remainingRequests: remainingRequests,
                });
            }
        }
    } else {
        // service left requests first (in descending order)
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
                explanation: `step ${stepCount}: moving left to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingRequests,
            });
        }

        // jump to rightmost request and service right requests (in descending order)
        if (rightRequests.length > 0) {
            // jump to rightmost request
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
                explanation: `step ${stepCount}: clook jump to rightmost request ${rightmostRequest}. seek distance: ${jumpTime}. total seek time: ${totalSeekTime}.`,
                remainingRequests: remainingAfterJump,
            });

            // service remaining right requests (in descending order)
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
                    explanation: `step ${stepCount}: moving left to service request ${request}. seek distance: ${seekTime}. total seek time: ${totalSeekTime}.`,
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

export default clook;