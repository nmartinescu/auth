class MemoryManager {
    constructor(frameCount, pageReferences, algorithm) {
        this.frameCount = frameCount;
        this.pageReferences = pageReferences;
        this.algorithm = algorithm.toLowerCase();
        this.frames = [];
        this.customData = [];
        this.pageFaults = 0;
        this.currentStep = 0;
        
        // Initialize frames with -1 (empty)
        for (let i = 0; i < frameCount; i++) {
            this.frames.push(-1);
        }
    }

    simulate() {
        const allFrames = [];
        
        for (let i = 0; i < this.pageReferences.length; i++) {
            const page = this.pageReferences[i];
            const stepResult = this.processPage(page, i);
            
            // Store current frame state
            allFrames.push([...this.frames]);
            
            // Store step information
            this.customData.push({
                step: i + 1,
                page: page,
                pageFault: stepResult.pageFault,
                frames: [...this.frames],
                dataStructure: stepResult.dataStructure || [],
                explaination: stepResult.explanation,
                totalPageFaults: this.pageFaults,
                hitRate: i > 0 ? (i + 1 - this.pageFaults) / (i + 1) : 0
            });
        }
        
        return {
            frames: allFrames,
            customData: this.customData,
            totalPageFaults: this.pageFaults,
            hitRate: this.pageReferences.length > 0 ? (this.pageReferences.length - this.pageFaults) / this.pageReferences.length : 0
        };
    }

    processPage(page, stepIndex) {
        switch (this.algorithm) {
            case 'fifo':
                return this.processFIFO(page, stepIndex);
            case 'lru':
                return this.processLRU(page, stepIndex);
            case 'lfu':
                return this.processLFU(page, stepIndex);
            case 'optimal':
                return this.processOptimal(page, stepIndex);
            case 'mru':
                return this.processMRU(page, stepIndex);
            default:
                throw new Error(`Unsupported algorithm: ${this.algorithm}`);
        }
    }

    processFIFO(page, stepIndex) {
        // Check if page is already in frames
        const pageIndex = this.frames.indexOf(page);
        
        if (pageIndex !== -1) {
            // Page hit
            return {
                pageFault: false,
                explanation: `Page ${page} found in frame ${pageIndex}. No page fault.`,
                dataStructure: [...this.frames]
            };
        }
        
        // Page fault
        this.pageFaults++;
        
        // Find empty frame or use FIFO replacement
        const emptyIndex = this.frames.indexOf(-1);
        
        if (emptyIndex !== -1) {
            // Empty frame available
            this.frames[emptyIndex] = page;
            return {
                pageFault: true,
                explanation: `Page ${page} loaded into empty frame ${emptyIndex}. Page fault occurred.`,
                dataStructure: [...this.frames]
            };
        } else {
            // Replace using FIFO (replace frame 0, then shift)
            const replacedPage = this.frames[0];
            for (let i = 0; i < this.frames.length - 1; i++) {
                this.frames[i] = this.frames[i + 1];
            }
            this.frames[this.frames.length - 1] = page;
            
            return {
                pageFault: true,
                explanation: `Page ${page} replaced page ${replacedPage} using FIFO. Page fault occurred.`,
                dataStructure: [...this.frames]
            };
        }
    }

    processLRU(page, stepIndex) {
        if (!this.lruOrder) {
            this.lruOrder = [];
        }
        
        const pageIndex = this.frames.indexOf(page);
        
        if (pageIndex !== -1) {
            // Page hit - update LRU order
            this.lruOrder = this.lruOrder.filter(p => p !== page);
            this.lruOrder.push(page);
            
            return {
                pageFault: false,
                explanation: `Page ${page} found in frame ${pageIndex}. Updated as most recently used.`,
                dataStructure: [...this.lruOrder]
            };
        }
        
        // Page fault
        this.pageFaults++;
        
        const emptyIndex = this.frames.indexOf(-1);
        
        if (emptyIndex !== -1) {
            // Empty frame available
            this.frames[emptyIndex] = page;
            this.lruOrder.push(page);
            
            return {
                pageFault: true,
                explanation: `Page ${page} loaded into empty frame ${emptyIndex}.`,
                dataStructure: [...this.lruOrder]
            };
        } else {
            // Replace least recently used page
            const lruPage = this.lruOrder[0];
            const lruIndex = this.frames.indexOf(lruPage);
            
            this.frames[lruIndex] = page;
            this.lruOrder = this.lruOrder.filter(p => p !== lruPage);
            this.lruOrder.push(page);
            
            return {
                pageFault: true,
                explanation: `Page ${page} replaced least recently used page ${lruPage}.`,
                dataStructure: [...this.lruOrder]
            };
        }
    }

    processLFU(page, stepIndex) {
        if (!this.frequency) {
            this.frequency = {};
        }
        
        const pageIndex = this.frames.indexOf(page);
        
        if (pageIndex !== -1) {
            // Page hit - increment frequency
            this.frequency[page] = (this.frequency[page] || 0) + 1;
            
            return {
                pageFault: false,
                explanation: `Page ${page} found in frame ${pageIndex}. Frequency increased to ${this.frequency[page]}.`,
                dataStructure: Object.entries(this.frequency).map(([p, f]) => `${p}:${f}`)
            };
        }
        
        // Page fault
        this.pageFaults++;
        this.frequency[page] = 1;
        
        const emptyIndex = this.frames.indexOf(-1);
        
        if (emptyIndex !== -1) {
            // Empty frame available
            this.frames[emptyIndex] = page;
            
            return {
                pageFault: true,
                explanation: `Page ${page} loaded into empty frame ${emptyIndex}.`,
                dataStructure: Object.entries(this.frequency).map(([p, f]) => `${p}:${f}`)
            };
        } else {
            // Replace least frequently used page
            let lfuPage = null;
            let minFreq = Infinity;
            
            for (const framePage of this.frames) {
                if (this.frequency[framePage] < minFreq) {
                    minFreq = this.frequency[framePage];
                    lfuPage = framePage;
                }
            }
            
            const lfuIndex = this.frames.indexOf(lfuPage);
            this.frames[lfuIndex] = page;
            delete this.frequency[lfuPage];
            
            return {
                pageFault: true,
                explanation: `Page ${page} replaced least frequently used page ${lfuPage} (freq: ${minFreq}).`,
                dataStructure: Object.entries(this.frequency).map(([p, f]) => `${p}:${f}`)
            };
        }
    }

    processOptimal(page, stepIndex) {
        const pageIndex = this.frames.indexOf(page);
        
        if (pageIndex !== -1) {
            // Page hit
            return {
                pageFault: false,
                explanation: `Page ${page} found in frame ${pageIndex}. No page fault.`,
                dataStructure: [...this.frames]
            };
        }
        
        // Page fault
        this.pageFaults++;
        
        const emptyIndex = this.frames.indexOf(-1);
        
        if (emptyIndex !== -1) {
            // Empty frame available
            this.frames[emptyIndex] = page;
            
            return {
                pageFault: true,
                explanation: `Page ${page} loaded into empty frame ${emptyIndex}.`,
                dataStructure: [...this.frames]
            };
        } else {
            // Replace page that will be used farthest in future
            let farthestPage = null;
            let farthestDistance = -1;
            
            for (const framePage of this.frames) {
                let nextUse = Infinity;
                
                // Find next occurrence of this page
                for (let i = stepIndex + 1; i < this.pageReferences.length; i++) {
                    if (this.pageReferences[i] === framePage) {
                        nextUse = i;
                        break;
                    }
                }
                
                if (nextUse > farthestDistance) {
                    farthestDistance = nextUse;
                    farthestPage = framePage;
                }
            }
            
            const replaceIndex = this.frames.indexOf(farthestPage);
            this.frames[replaceIndex] = page;
            
            const explanation = farthestDistance === Infinity 
                ? `Page ${page} replaced page ${farthestPage} (never used again).`
                : `Page ${page} replaced page ${farthestPage} (next use at step ${farthestDistance + 1}).`;
            
            return {
                pageFault: true,
                explanation,
                dataStructure: [...this.frames]
            };
        }
    }

    processMRU(page, stepIndex) {
        if (!this.mruOrder) {
            this.mruOrder = [];
        }
        
        const pageIndex = this.frames.indexOf(page);
        
        if (pageIndex !== -1) {
            // Page hit - update MRU order
            this.mruOrder = this.mruOrder.filter(p => p !== page);
            this.mruOrder.push(page);
            
            return {
                pageFault: false,
                explanation: `Page ${page} found in frame ${pageIndex}. Updated as most recently used.`,
                dataStructure: [...this.mruOrder]
            };
        }
        
        // Page fault
        this.pageFaults++;
        
        const emptyIndex = this.frames.indexOf(-1);
        
        if (emptyIndex !== -1) {
            // Empty frame available
            this.frames[emptyIndex] = page;
            this.mruOrder.push(page);
            
            return {
                pageFault: true,
                explanation: `Page ${page} loaded into empty frame ${emptyIndex}.`,
                dataStructure: [...this.mruOrder]
            };
        } else {
            // Replace most recently used page
            const mruPage = this.mruOrder[this.mruOrder.length - 1];
            const mruIndex = this.frames.indexOf(mruPage);
            
            this.frames[mruIndex] = page;
            this.mruOrder = this.mruOrder.filter(p => p !== mruPage);
            this.mruOrder.push(page);
            
            return {
                pageFault: true,
                explanation: `Page ${page} replaced most recently used page ${mruPage}.`,
                dataStructure: [...this.mruOrder]
            };
        }
    }
}

export default MemoryManager;