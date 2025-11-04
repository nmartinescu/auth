/**
 * shortest seek time first (sstf) disk scheduling algorithm
 */

/**
 * sstf algorithm implementation
 * @param {number[]} requests array of disk requests
 * @param {number} initialHeadPosition initial position of disk head
 * @returns {Object} result containing sequence, total seek time, average seek time, and steps
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
        explanation: `starting at initial head position ${initialHeadPosition}. using sstf algorithm to find closest request.`,
        remainingRequests: [...remainingRequests],
    });

    while (remainingRequests.length > 0) {
        stepCount++;

        // find the request with minimum seek time
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

        // move to the closest request
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
            explanation: `step ${stepCount}: analyzing seek times: [${seekTimes.join(", ")}]. closest request is ${nextRequest} with seek distance ${minSeekTime}. moving head to ${nextRequest}. total seek time: ${totalSeekTime}.`,
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

export default sstf;