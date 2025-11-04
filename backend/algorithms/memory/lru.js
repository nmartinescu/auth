/**
 * lru (least recently used) page replacement algorithm
 */

/**
 * lru algorithm implementation
 * @param {number[]} pageReferences array of page references
 * @param {number} frameCount number of frames available
 * @returns {Object} result containing frames, page faults, and step details
 */
function lru(pageReferences, frameCount) {
    const frames = new Array(frameCount).fill(-1);
    const steps = [];
    let pageFaults = 0;
    let lruOrder = [];

    for (let i = 0; i < pageReferences.length; i++) {
        const page = pageReferences[i];
        const pageIndex = frames.indexOf(page);

        if (pageIndex !== -1) {
            // page hit
            lruOrder = lruOrder.filter((p) => p !== page);
            lruOrder.push(page);

            steps.push({
                step: i + 1,
                page: page,
                pageFault: false,
                frames: [...frames],
                dataStructure: [...lruOrder],
                explanation: `page ${page} found in frame ${pageIndex}. updated as most recently used.`,
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
                lruOrder.push(page);

                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: [...lruOrder],
                    explanation: `page ${page} loaded into empty frame ${emptyIndex}. page fault occurred.`,
                    totalPageFaults: pageFaults,
                    hitRate: (i + 1 - pageFaults) / (i + 1),
                });
            } else {
                // replace least recently used page
                const lruPage = lruOrder[0];
                const lruIndex = frames.indexOf(lruPage);

                frames[lruIndex] = page;
                lruOrder = lruOrder.filter((p) => p !== lruPage);
                lruOrder.push(page);

                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: [...lruOrder],
                    explanation: `page ${page} replaced least recently used page ${lruPage}. page fault occurred.`,
                    totalPageFaults: pageFaults,
                    hitRate: (i + 1 - pageFaults) / (i + 1),
                });
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

export default lru;