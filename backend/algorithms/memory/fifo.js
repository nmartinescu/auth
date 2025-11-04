/**
 * fifo (first in first out) page replacement algorithm
 */

/**
 * fifo algorithm implementation
 * @param {number[]} pageReferences array of page references
 * @param {number} frameCount number of frames available
 * @returns {Object} result containing frames, page faults, and step details
 */
function fifo(pageReferences, frameCount) {
    const frames = new Array(frameCount).fill(-1);
    const steps = [];
    let pageFaults = 0;
    let fifoPointer = 0;

    for (let i = 0; i < pageReferences.length; i++) {
        const page = pageReferences[i];
        const pageIndex = frames.indexOf(page);

        if (pageIndex !== -1) {
            // page hit
            steps.push({
                step: i + 1,
                page: page,
                pageFault: false,
                frames: [...frames],
                dataStructure: [...frames],
                explanation: `page ${page} found in frame ${pageIndex}. no page fault.`,
                totalPageFaults: pageFaults,
                hitRate: i > 0 ? (i + 1 - pageFaults) / (i + 1) : 0,
            });
        } else {
            // page fault
            pageFaults++;
            const emptyIndex = frames.indexOf(-1);

            if (emptyIndex !== -1) {
                // empty frame available
                frames[emptyIndex] = page;
                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: [...frames],
                    explanation: `page ${page} loaded into empty frame ${emptyIndex}. page fault occurred.`,
                    totalPageFaults: pageFaults,
                    hitRate: (i + 1 - pageFaults) / (i + 1),
                });
            } else {
                // replace using fifo
                const replacedPage = frames[fifoPointer];
                frames[fifoPointer] = page;

                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: [...frames],
                    explanation: `page ${page} replaced page ${replacedPage} in frame ${fifoPointer} using fifo. page fault occurred.`,
                    totalPageFaults: pageFaults,
                    hitRate: (i + 1 - pageFaults) / (i + 1),
                });

                // move pointer to next frame
                fifoPointer = (fifoPointer + 1) % frameCount;
            }
        }
    }

    return {
        frames: steps.map(step => step.frames),
        customData: steps,
        totalPageFaults: pageFaults,
        hitRate: pageReferences.length > 0 ? (pageReferences.length - pageFaults) / pageReferences.length : 0,
    };
}

export default fifo;