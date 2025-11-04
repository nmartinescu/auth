/**
 * lfu (least frequently used) page replacement algorithm
 */

/**
 * lfu algorithm implementation
 * @param {number[]} pageReferences array of page references
 * @param {number} frameCount number of frames available
 * @returns {Object} result containing frames, page faults, and step details
 */
function lfu(pageReferences, frameCount) {
    const frames = new Array(frameCount).fill(-1);
    const steps = [];
    let pageFaults = 0;
    let frequency = {};
    let lfuOrder = [];

    for (let i = 0; i < pageReferences.length; i++) {
        const page = pageReferences[i];
        const pageIndex = frames.indexOf(page);

        if (pageIndex !== -1) {
            // page hit
            frequency[page] = (frequency[page] || 0) + 1;

            steps.push({
                step: i + 1,
                page: page,
                pageFault: false,
                frames: [...frames],
                dataStructure: Object.entries(frequency).map(([p, f]) => `${p}:${f}`),
                explaination: `page ${page} found in frame ${pageIndex}. frequency increased to ${frequency[page]}.`,
                totalPageFaults: pageFaults,
                hitRate: i > 0 ? (i + 1 - pageFaults) / (i + 1) : 0,
            });
        } else {
            // page fault
            pageFaults++;
            frequency[page] = 1;
            const emptyIndex = frames.indexOf(-1);

            if (emptyIndex !== -1) {
                // empty frame available
                frames[emptyIndex] = page;
                lfuOrder.push(page);

                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: Object.entries(frequency).map(([p, f]) => `${p}:${f}`),
                    explaination: `page ${page} loaded into empty frame ${emptyIndex}. page fault occurred.`,
                    totalPageFaults: pageFaults,
                    hitRate: (i + 1 - pageFaults) / (i + 1),
                });
            } else {
                // find least frequently used page
                let lfuPage = null;
                let minFreq = Infinity;
                let oldestIndex = -1;

                // find pages with minimum frequency
                for (const framePage of frames) {
                    if (frequency[framePage] < minFreq) {
                        minFreq = frequency[framePage];
                        lfuPage = framePage;
                        oldestIndex = lfuOrder.indexOf(framePage);
                    } else if (frequency[framePage] === minFreq) {
                        // choose the oldest among equal frequencies
                        const currentIndex = lfuOrder.indexOf(framePage);
                        if (currentIndex < oldestIndex) {
                            lfuPage = framePage;
                            oldestIndex = currentIndex;
                        }
                    }
                }

                const lfuIndex = frames.indexOf(lfuPage);
                frames[lfuIndex] = page;

                // update order tracking
                lfuOrder = lfuOrder.filter((p) => p !== lfuPage);
                lfuOrder.push(page);
                delete frequency[lfuPage];

                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: Object.entries(frequency).map(([p, f]) => `${p}:${f}`),
                    explaination: `page ${page} replaced least frequently used page ${lfuPage} (freq: ${minFreq}). page fault occurred.`,
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

export default lfu;