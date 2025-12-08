/**
 * optimal page replacement algorithm
 */

/**
 * optimal algorithm implementation
 * @param {number[]} pageReferences array of page references
 * @param {number} frameCount number of frames available
 * @returns {Object} result containing frames, page faults, and step details
 */
function optimal(pageReferences, frameCount) {
    const frames = new Array(frameCount).fill(-1);
    const steps = [];
    let pageFaults = 0;

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
                explaination: `page ${page} found in frame ${pageIndex}. no page fault.`,
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
                    explaination: `page ${page} loaded into empty frame ${emptyIndex}. page fault occurred.`,
                    totalPageFaults: pageFaults,
                    hitRate: (i + 1 - pageFaults) / (i + 1),
                });
            } else {
                // find page that will be used farthest in future
                let farthestPage = null;
                let farthestDistance = -1;

                for (const framePage of frames) {
                    let nextUse = Infinity;

                    // find next occurrence of this page
                    for (let j = i + 1; j < pageReferences.length; j++) {
                        if (pageReferences[j] === framePage) {
                            nextUse = j;
                            break;
                        }
                    }

                    if (nextUse > farthestDistance) {
                        farthestDistance = nextUse;
                        farthestPage = framePage;
                    }
                }

                const replaceIndex = frames.indexOf(farthestPage);
                frames[replaceIndex] = page;

                const explaination = farthestDistance === Infinity
                    ? `page ${page} replaced page ${farthestPage} (never used again). page fault occurred.`
                    : `page ${page} replaced page ${farthestPage} (next use at step ${farthestDistance + 1}). page fault occurred.`;

                steps.push({
                    step: i + 1,
                    page: page,
                    pageFault: true,
                    frames: [...frames],
                    dataStructure: [...frames],
                    explaination: explaination,
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

export default optimal;