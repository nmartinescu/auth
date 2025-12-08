/**
 * first come first serve (fcfs) disk scheduling algorithm
 */

/**
 * fcfs algorithm implementation
 * @param {number[]} requests array of disk requests
 * @param {number} initialHeadPosition initial position of disk head
 * @returns {Object} result containing sequence, total seek time, average seek time, and steps
 */
function fcfs(requests, initialHeadPosition) {
    const sequence = [initialHeadPosition];
    const steps = [];
    let currentPosition = initialHeadPosition;
    let totalSeekTime = 0;

    steps.push({
        step: 0,
        currentPosition: initialHeadPosition,
        targetRequest: null,
        seekDistance: 0,
        totalSeekTime: 0,
        explanation: `starting at initial head position ${initialHeadPosition}. ready to process requests in fcfs order.`,
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
            explanation: `step ${i + 1}: moving head from ${sequence[i]} to ${request}. seek distance: ${seekTime}. total seek time so far: ${totalSeekTime}.`,
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

export default fcfs;