import type { TestQuestion, TestSolution, MemoryTestSolution, DiskTestSolution, ProcessResult, GanttEntry } from '../types/Test';

class TestSolutionService {
    private static instance: TestSolutionService;
    
    static getInstance(): TestSolutionService {
        if (!TestSolutionService.instance) {
            TestSolutionService.instance = new TestSolutionService();
        }
        return TestSolutionService.instance;
    }

    async calculateSolution(question: TestQuestion): Promise<TestSolution | MemoryTestSolution | DiskTestSolution> {
        try {
            if (question.type === 'memory') {
                return this.calculateMemorySolution(question);
            } else if (question.type === 'disk') {
                return this.calculateDiskSolution(question);
            } else {
                return this.calculateSchedulingSolution(question);
            }
        } catch (error) {
            console.error('Error calculating solution:', error);
            throw error;
        }
    }

    private async calculateSchedulingSolution(question: TestQuestion): Promise<TestSolution> {
        // Convert test processes to backend format
        const processes = question.processes!.map(p => ({
            arrivalTime: p.arrivalTime,
            burstTime: p.burstTime,
            io: p.io
        }));

        // Prepare request data
        const requestData: any = {
            algorithm: question.algorithm,
            processes
        };

        if (question.quantum) {
            requestData.quantum = question.quantum;
        }

        // Call backend scheduler
        const response = await fetch('/api/cpu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Failed to calculate solution: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Convert backend response to test solution format
        return this.convertBackendResponseToSolution(result, question);
    }

    private async calculateMemorySolution(question: TestQuestion): Promise<MemoryTestSolution> {
        // Prepare request data for memory management
        const requestData = {
            frameCount: question.frameCount!,
            selectedAlgorithm: [question.algorithm.toLowerCase()],
            pageReferences: question.pageReferences!
        };

        // Call backend memory management API
        const response = await fetch('/api/memory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`Failed to calculate memory solution: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Convert backend response to memory test solution format
        return this.convertMemoryBackendResponseToSolution(result);
    }

    private async calculateDiskSolution(question: TestQuestion): Promise<DiskTestSolution> {
        // Map algorithm names to backend format
        const algorithmMapping: { [key: string]: string } = {
            'FCFS': 'fcfs',
            'SSTF': 'sstf', 
            'SCAN': 'scan',
            'C-SCAN': 'cscan',  // Map C-SCAN to cscan
            'LOOK': 'look',
            'C-LOOK': 'clook'   // Map C-LOOK to clook
        };

        const backendAlgorithm = algorithmMapping[question.algorithm] || question.algorithm.toLowerCase();

        // Prepare request data for disk scheduling
        const requestData = {
            algorithm: backendAlgorithm,
            requests: question.requests!,
            initialHeadPosition: question.initialHeadPosition!,
            maxDiskSize: question.maxDiskSize!,
            headDirection: question.headDirection!
        };

        console.log('=== DISK SOLUTION CALCULATION DEBUG ===');
        console.log('Original question algorithm:', question.algorithm);
        console.log('Mapped backend algorithm:', backendAlgorithm);
        console.log('Request data being sent:', JSON.stringify(requestData, null, 2));

        // Call backend disk scheduling API
        const response = await fetch('/api/disk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend response error:', response.status, response.statusText, errorText);
            throw new Error(`Failed to calculate disk solution: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Backend response received:', JSON.stringify(result, null, 2));
        console.log('=== END DISK SOLUTION CALCULATION DEBUG ===');
        
        // Convert backend response to disk test solution format
        return this.convertDiskBackendResponseToSolution(result);
    }

    private convertBackendResponseToSolution(
        backendResponse: any, 
        question: TestQuestion
    ): TestSolution {
        console.log('=== BACKEND RESPONSE CONVERSION DEBUG ===');
        console.log('Backend Response:', JSON.stringify(backendResponse, null, 2));
        console.log('Question:', JSON.stringify(question, null, 2));
        
        // Extract the solution steps from backend response
        const solutionSteps = backendResponse.data?.solution || [];
        console.log('Solution Steps:', solutionSteps);
        
        if (!solutionSteps || solutionSteps.length === 0) {
            throw new Error('No solution steps found in backend response');
        }
        
        // Get the last step which contains the final results
        const lastStep = solutionSteps[solutionSteps.length - 1];
        console.log('Last Step:', lastStep);
        
        // Extract the final graphic table from the last step
        const graphicTable = lastStep.graphicTable || [];
        console.log('Final Graphic Table:', graphicTable);
        
        if (!graphicTable || graphicTable.length === 0) {
            throw new Error('No graphic table found in final step');
        }
        
        // Convert to ProcessResult format using the final graphicTable
        const processes: ProcessResult[] = graphicTable.map((entry: any) => {
            const originalBurstTime = this.findOriginalBurstTime(entry.pid, question);
            const processResult = {
                pid: entry.pid,
                arrivalTime: entry.arrival,
                burstTime: originalBurstTime,
                scheduledTime: entry.scheduledTime || 0,
                waitingTime: entry.waitingTime,
                turnaroundTime: entry.turnaroundTime,
                completionTime: entry.endTime
            };
            console.log(`Process ${entry.pid} conversion:`, {
                original: entry,
                converted: processResult
            });
            return processResult;
        });

        // Calculate averages from the backend metrics if available, otherwise calculate manually
        const backendMetrics = backendResponse.data?.metrics || {};
        
        const avgWaitingTime = backendMetrics.averageWaitingTime !== undefined 
            ? backendMetrics.averageWaitingTime
            : (processes.length > 0 ? processes.reduce((sum, p) => sum + p.waitingTime, 0) / processes.length : 0);
            
        const avgTurnaroundTime = backendMetrics.averageTurnaroundTime !== undefined 
            ? backendMetrics.averageTurnaroundTime
            : (processes.length > 0 ? processes.reduce((sum, p) => sum + p.turnaroundTime, 0) / processes.length : 0);
        
        // Find completion time - use the maximum completion time from processes
        const completionTime = processes.length > 0 ? Math.max(...processes.map(p => p.completionTime)) : 0;

        // Generate Gantt chart from execution info
        const solutionData = backendResponse.data?.solution || [];
        const ganttChart = this.generateGanttChart(solutionData);

        const solution = {
            processes,
            avgWaitingTime: Math.round(avgWaitingTime * 100) / 100,
            avgTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
            completionTime,
            ganttChart
        };
        
        console.log('Final Solution:', JSON.stringify(solution, null, 2));
        console.log('=== END BACKEND RESPONSE CONVERSION DEBUG ===');

        return solution;
    }

    private findOriginalBurstTime(pid: number, question: TestQuestion): number {
        const process = question.processes.find(p => p.id === pid);
        return process?.burstTime || 0;
    }

    private generateGanttChart(customData: any[]): GanttEntry[] {
        const ganttChart: GanttEntry[] = [];
        
        for (const entry of customData) {
            if (entry.point && entry.timer !== undefined) {
                // Check if this is a process execution point
                if (typeof entry.point === 'number' && entry.point > 0) {
                    // Find if we need to extend an existing entry or create a new one
                    const lastEntry = ganttChart[ganttChart.length - 1];
                    
                    if (lastEntry && lastEntry.processId === entry.point && lastEntry.endTime === entry.timer) {
                        // Extend the existing entry
                        lastEntry.endTime = entry.timer + 1;
                    } else {
                        // Create a new entry
                        ganttChart.push({
                            processId: entry.point,
                            startTime: entry.timer,
                            endTime: entry.timer + 1
                        });
                    }
                }
            }
        }
        
        return ganttChart;
    }

    private convertMemoryBackendResponseToSolution(backendResponse: any): MemoryTestSolution {
        console.log('=== MEMORY BACKEND RESPONSE CONVERSION DEBUG ===');
        console.log('Backend Response:', JSON.stringify(backendResponse, null, 2));
        
        const data = backendResponse.data || backendResponse;
        
        console.log('Extracted data:', {
            algorithm: data.algorithm,
            frameCount: data.frameCount,
            pageReferences: data.pageReferences,
            totalPageFaults: data.totalPageFaults,
            hitRate: data.hitRate,
            framesLength: data.frames?.length,
            customDataLength: data.customData?.length
        });
        
        // Convert frames and customData to step results
        const stepResults = this.convertFramesToStepResults(
            data.frames || [], 
            data.customData || [], 
            data.pageReferences || []
        );
        
        const solution: MemoryTestSolution = {
            algorithm: data.algorithm || 'FIFO',
            frameCount: data.frameCount || 0,
            pageReferences: data.pageReferences || [],
            totalPageFaults: data.totalPageFaults || 0,
            hitRate: data.hitRate || 0,
            frames: data.frames || [],
            customData: data.customData || [],
            stepResults
        };
        
        console.log('Final Memory Solution with stepResults:', JSON.stringify(solution, null, 2));
        console.log('=== END MEMORY BACKEND RESPONSE CONVERSION DEBUG ===');
        
        return solution;
    }

    private convertDiskBackendResponseToSolution(backendResponse: any): DiskTestSolution {
        console.log('=== DISK BACKEND RESPONSE CONVERSION DEBUG ===');
        console.log('Backend Response:', JSON.stringify(backendResponse, null, 2));
        
        const data = backendResponse.data || backendResponse;
        
        // Map backend algorithm names back to frontend format
        const backendToFrontendAlgorithm: { [key: string]: string } = {
            'fcfs': 'FCFS',
            'sstf': 'SSTF',
            'scan': 'SCAN',
            'cscan': 'C-SCAN',  // Map cscan back to C-SCAN
            'look': 'LOOK',
            'clook': 'C-LOOK'   // Map clook back to C-LOOK
        };

        const frontendAlgorithm = backendToFrontendAlgorithm[data.algorithm] || data.algorithm?.toUpperCase() || 'FCFS';
        
        const solution: DiskTestSolution = {
            algorithm: frontendAlgorithm,
            maxDiskSize: data.maxDiskSize || 0,
            initialHeadPosition: data.initialHeadPosition || 0,
            headDirection: data.headDirection || 'right',
            requests: data.requests || [],
            sequence: data.sequence || [],
            totalSeekTime: data.totalSeekTime || 0,
            averageSeekTime: data.averageSeekTime || 0
        };
        
        console.log('Final Disk Solution:', JSON.stringify(solution, null, 2));
        console.log('=== END DISK BACKEND RESPONSE CONVERSION DEBUG ===');
        
        return solution;
    }

    private convertFramesToStepResults(frames: number[][], customData: any[], pageReferences: number[]): any[] {
        const stepResults = [];
        
        console.log('=== CONVERSION DEBUG ===');
        console.log('Frames:', frames);
        console.log('CustomData:', customData);
        console.log('PageReferences:', pageReferences);
        
        for (let i = 0; i < pageReferences.length; i++) {
            const frameState = frames[i] || [];
            const stepData = customData[i] || {};
            
            // Convert -1 to null for empty frames
            const convertedFrameState = frameState.map(f => f === -1 ? null : f);
            
            const stepResult = {
                pageReference: pageReferences[i],
                frameState: convertedFrameState,
                pageFault: stepData.pageFault === true || stepData.pageFault === 'true'
            };
            
            console.log(`Step ${i}:`, stepResult);
            stepResults.push(stepResult);
        }
        
        console.log('Final stepResults:', stepResults);
        console.log('=== END CONVERSION DEBUG ===');
        
        return stepResults;
    }

    compareAnswers(userSolution: TestSolution | MemoryTestSolution | DiskTestSolution, correctSolution: TestSolution | MemoryTestSolution | DiskTestSolution): {
        isCorrect: boolean;
        score: number;
        maxScore: number;
        details: any;
    } {
        console.log('=== COMPARISON DEBUG ===');
        console.log('User Solution:', JSON.stringify(userSolution, null, 2));
        console.log('Correct Solution:', JSON.stringify(correctSolution, null, 2));
        
        // Check if this is a memory question
        if ('totalPageFaults' in userSolution && 'totalPageFaults' in correctSolution) {
            return this.compareMemoryAnswers(userSolution, correctSolution);
        } else if ('sequence' in userSolution && 'sequence' in correctSolution) {
            return this.compareDiskAnswers(userSolution, correctSolution);
        } else {
            return this.compareSchedulingAnswers(userSolution as TestSolution, correctSolution as TestSolution);
        }
    }

    private compareSchedulingAnswers(userSolution: TestSolution, correctSolution: TestSolution): {
        isCorrect: boolean;
        score: number;
        maxScore: number;
        details: {
            processesCorrect: boolean;
            avgWaitingTimeCorrect: boolean;
            avgTurnaroundTimeCorrect: boolean;
            completionTimeCorrect: boolean;
        };
    } {
        const maxScore = 100;
        let score = 0;
        const tolerance = 0.1; // Allow small rounding differences

        // Check process-specific results (60% of score)
        const processScore = this.compareProcessResults(
            userSolution.processes, 
            correctSolution.processes
        );
        score += processScore * 60; // 60 points for process results
        console.log('Process Score:', processScore, 'Weighted:', processScore * 60);

        // Check average waiting time (15% of score)
        const waitingTimeDiff = Math.abs(
            userSolution.avgWaitingTime - correctSolution.avgWaitingTime
        );
        const waitingTimeCorrect = waitingTimeDiff <= tolerance;
        if (waitingTimeCorrect) score += 15;
        console.log('Waiting Time - User:', userSolution.avgWaitingTime, 'Correct:', correctSolution.avgWaitingTime, 'Diff:', waitingTimeDiff, 'Correct:', waitingTimeCorrect);

        // Check average turnaround time (15% of score)
        const turnaroundTimeDiff = Math.abs(
            userSolution.avgTurnaroundTime - correctSolution.avgTurnaroundTime
        );
        const turnaroundTimeCorrect = turnaroundTimeDiff <= tolerance;
        if (turnaroundTimeCorrect) score += 15;
        console.log('Turnaround Time - User:', userSolution.avgTurnaroundTime, 'Correct:', correctSolution.avgTurnaroundTime, 'Diff:', turnaroundTimeDiff, 'Correct:', turnaroundTimeCorrect);

        // Check completion time (10% of score)
        const completionTimeDiff = Math.abs(
            userSolution.completionTime - correctSolution.completionTime
        );
        const completionTimeCorrect = completionTimeDiff <= tolerance;
        if (completionTimeCorrect) score += 10;
        console.log('Completion Time - User:', userSolution.completionTime, 'Correct:', correctSolution.completionTime, 'Diff:', completionTimeDiff, 'Correct:', completionTimeCorrect);

        const isCorrect = score >= 80; // 80% threshold for correct answer
        console.log('Final Score:', score, 'Is Correct:', isCorrect);
        console.log('=== END COMPARISON DEBUG ===');

        return {
            isCorrect,
            score: Math.round(score),
            maxScore,
            details: {
                processesCorrect: processScore >= 0.8,
                avgWaitingTimeCorrect: waitingTimeCorrect,
                avgTurnaroundTimeCorrect: turnaroundTimeCorrect,
                completionTimeCorrect: completionTimeCorrect
            }
        };
    }

    private compareMemoryAnswers(userSolution: MemoryTestSolution, correctSolution: MemoryTestSolution): {
        isCorrect: boolean;
        score: number;
        maxScore: number;
        details: {
            stepResultsCorrect: boolean;
            pageFaultsCorrect: boolean;
        };
    } {
        const maxScore = 100;
        let score = 0;

        console.log('=== MEMORY STEP COMPARISON DEBUG ===');
        console.log('User Steps:', userSolution.stepResults);
        console.log('Correct Steps:', correctSolution.stepResults);

        if (!userSolution.stepResults || !correctSolution.stepResults) {
            console.log('Missing step results');
            return {
                isCorrect: false,
                score: 0,
                maxScore,
                details: {
                    stepResultsCorrect: false,
                    pageFaultsCorrect: false
                }
            };
        }

        const totalSteps = correctSolution.stepResults.length;
        let correctSteps = 0;
        let correctPageFaults = 0;

        // Compare each step (80% of score)
        for (let i = 0; i < totalSteps; i++) {
            const userStep = userSolution.stepResults[i];
            const correctStep = correctSolution.stepResults[i];
            
            if (!userStep || !correctStep) {
                console.log(`Step ${i + 1}: Missing step data`);
                continue;
            }

            console.log(`Step ${i + 1} Comparison:`);
            console.log('  User Step:', JSON.stringify(userStep));
            console.log('  Correct Step:', JSON.stringify(correctStep));

            // Check frame state
            let frameStateCorrect = true;
            if (userStep.frameState.length === correctStep.frameState.length) {
                for (let j = 0; j < correctStep.frameState.length; j++) {
                    const userFrame = userStep.frameState[j];
                    const correctFrame = correctStep.frameState[j];
                    
                    // Handle null/undefined comparison carefully
                    // Both null/undefined should be considered equal (empty frame)
                    const userIsEmpty = userFrame === null || userFrame === undefined;
                    const correctIsEmpty = correctFrame === null || correctFrame === undefined;
                    
                    const framesMatch = (userFrame === correctFrame) || 
                                       (userIsEmpty && correctIsEmpty);
                    
                    if (!framesMatch) {
                        console.log(`  Frame ${j} mismatch: user=${userFrame}, correct=${correctFrame}`);
                        frameStateCorrect = false;
                        break;
                    }
                }
            } else {
                console.log(`  Frame state length mismatch: user=${userStep.frameState.length}, correct=${correctStep.frameState.length}`);
                frameStateCorrect = false;
            }

            // Check page fault
            const pageFaultCorrect = userStep.pageFault === correctStep.pageFault;
            
            console.log(`  Frame State Correct: ${frameStateCorrect}, Page Fault Correct: ${pageFaultCorrect}`);
            console.log(`  User Page Fault: ${userStep.pageFault}, Correct Page Fault: ${correctStep.pageFault}`);
            
            if (frameStateCorrect && pageFaultCorrect) {
                correctSteps++;
            }
            
            if (pageFaultCorrect) {
                correctPageFaults++;
            }
        }

        // Score based on correct steps (80%) and page fault accuracy (20%)
        const stepScore = (correctSteps / totalSteps) * 80;
        const pageFaultScore = (correctPageFaults / totalSteps) * 20;
        score = stepScore + pageFaultScore;

        console.log(`Correct Steps: ${correctSteps}/${totalSteps}, Correct Page Faults: ${correctPageFaults}/${totalSteps}`);
        console.log(`Step Score: ${stepScore}, Page Fault Score: ${pageFaultScore}, Total: ${score}`);

        const isCorrect = score >= 80; // 80% threshold for correct answer
        console.log('Final Memory Score:', score, 'Is Correct:', isCorrect);
        console.log('=== END MEMORY STEP COMPARISON DEBUG ===');

        return {
            isCorrect,
            score: Math.round(score),
            maxScore,
            details: {
                stepResultsCorrect: correctSteps === totalSteps,
                pageFaultsCorrect: correctPageFaults === totalSteps
            }
        };
    }

    private compareDiskAnswers(userSolution: DiskTestSolution, correctSolution: DiskTestSolution): {
        isCorrect: boolean;
        score: number;
        maxScore: number;
        details: {
            sequenceCorrect: boolean;
            totalSeekTimeCorrect: boolean;
            averageSeekTimeCorrect: boolean;
        };
    } {
        const maxScore = 100;
        let score = 0;
        const tolerance = 0.01; // Allow small rounding differences

        console.log('=== DISK COMPARISON DEBUG ===');
        console.log('User Disk Solution:', JSON.stringify(userSolution, null, 2));
        console.log('Correct Disk Solution:', JSON.stringify(correctSolution, null, 2));

        // Check sequence (50% of score) - give partial credit
        let sequenceScore = 0;
        const sequenceCorrect = JSON.stringify(userSolution.sequence) === JSON.stringify(correctSolution.sequence);
        if (sequenceCorrect) {
            sequenceScore = 50;
        } else {
            // Give partial credit for correct positions
            const minLength = Math.min(userSolution.sequence.length, correctSolution.sequence.length);
            let correctPositions = 0;
            for (let i = 0; i < minLength; i++) {
                if (userSolution.sequence[i] === correctSolution.sequence[i]) {
                    correctPositions++;
                }
            }
            // Partial credit: (correct positions / total positions) * 50
            if (correctSolution.sequence.length > 0) {
                sequenceScore = (correctPositions / correctSolution.sequence.length) * 50;
            }
        }
        score += sequenceScore;
        console.log('Sequence - User:', userSolution.sequence, 'Correct:', correctSolution.sequence, 'Partial Score:', sequenceScore);

        // Check total seek time (30% of score) - give partial credit for close answers
        const totalSeekTimeDiff = Math.abs(userSolution.totalSeekTime - correctSolution.totalSeekTime);
        const totalSeekTimeCorrect = totalSeekTimeDiff <= tolerance;
        let seekTimeScore = 0;
        if (totalSeekTimeCorrect) {
            seekTimeScore = 30;
        } else if (correctSolution.totalSeekTime > 0) {
            // Give partial credit based on how close the answer is (within 20% gets some points)
            const percentError = totalSeekTimeDiff / correctSolution.totalSeekTime;
            if (percentError <= 0.2) { // Within 20%
                seekTimeScore = 30 * (1 - percentError / 0.2) * 0.5; // Up to 15 points for close answers
            }
        }
        score += seekTimeScore;
        console.log('Total Seek Time - User:', userSolution.totalSeekTime, 'Correct:', correctSolution.totalSeekTime, 'Diff:', totalSeekTimeDiff, 'Partial Score:', seekTimeScore);

        // Check average seek time (20% of score) - give partial credit
        const averageSeekTimeDiff = Math.abs(userSolution.averageSeekTime - correctSolution.averageSeekTime);
        const averageSeekTimeCorrect = averageSeekTimeDiff <= tolerance;
        let avgSeekTimeScore = 0;
        if (averageSeekTimeCorrect) {
            avgSeekTimeScore = 20;
        } else if (correctSolution.averageSeekTime > 0) {
            // Give partial credit based on how close the answer is
            const percentError = averageSeekTimeDiff / correctSolution.averageSeekTime;
            if (percentError <= 0.2) { // Within 20%
                avgSeekTimeScore = 20 * (1 - percentError / 0.2) * 0.5; // Up to 10 points for close answers
            }
        }
        score += avgSeekTimeScore;
        console.log('Average Seek Time - User:', userSolution.averageSeekTime, 'Correct:', correctSolution.averageSeekTime, 'Diff:', averageSeekTimeDiff, 'Partial Score:', avgSeekTimeScore);

        const isCorrect = score >= 80; // 80% threshold for correct answer
        console.log('Final Disk Score:', score, 'Is Correct:', isCorrect);
        console.log('=== END DISK COMPARISON DEBUG ===');

        return {
            isCorrect,
            score: Math.round(score),
            maxScore,
            details: {
                sequenceCorrect,
                totalSeekTimeCorrect: totalSeekTimeCorrect,
                averageSeekTimeCorrect: averageSeekTimeCorrect
            }
        };
    }

    private compareProcessResults(
        userProcesses: ProcessResult[], 
        correctProcesses: ProcessResult[]
    ): number {
        console.log('=== PROCESS COMPARISON DEBUG ===');
        console.log('User Processes:', userProcesses);
        console.log('Correct Processes:', correctProcesses);
        
        if (userProcesses.length !== correctProcesses.length) {
            console.log('Process count mismatch:', userProcesses.length, 'vs', correctProcesses.length);
            return 0;
        }

        let correctCount = 0;
        const totalFields = userProcesses.length * 4; // scheduledTime, waitingTime, turnaroundTime, completionTime

        for (const userProcess of userProcesses) {
            const correctProcess = correctProcesses.find(p => p.pid === userProcess.pid);
            if (!correctProcess) {
                console.log('No matching process found for PID:', userProcess.pid);
                continue;
            }

            console.log(`Process ${userProcess.pid}:`);
            
            const scheduledTimeDiff = Math.abs(userProcess.scheduledTime - correctProcess.scheduledTime);
            const scheduledTimeCorrect = scheduledTimeDiff <= 0.1;
            console.log(`  Scheduled Time - User: ${userProcess.scheduledTime}, Correct: ${correctProcess.scheduledTime}, Diff: ${scheduledTimeDiff}, Correct: ${scheduledTimeCorrect}`);
            if (scheduledTimeCorrect) correctCount++;

            const waitingTimeDiff = Math.abs(userProcess.waitingTime - correctProcess.waitingTime);
            const waitingTimeCorrect = waitingTimeDiff <= 0.1;
            console.log(`  Waiting Time - User: ${userProcess.waitingTime}, Correct: ${correctProcess.waitingTime}, Diff: ${waitingTimeDiff}, Correct: ${waitingTimeCorrect}`);
            if (waitingTimeCorrect) correctCount++;

            const turnaroundTimeDiff = Math.abs(userProcess.turnaroundTime - correctProcess.turnaroundTime);
            const turnaroundTimeCorrect = turnaroundTimeDiff <= 0.1;
            console.log(`  Turnaround Time - User: ${userProcess.turnaroundTime}, Correct: ${correctProcess.turnaroundTime}, Diff: ${turnaroundTimeDiff}, Correct: ${turnaroundTimeCorrect}`);
            if (turnaroundTimeCorrect) correctCount++;

            const completionTimeDiff = Math.abs(userProcess.completionTime - correctProcess.completionTime);
            const completionTimeCorrect = completionTimeDiff <= 0.1;
            console.log(`  Completion Time - User: ${userProcess.completionTime}, Correct: ${correctProcess.completionTime}, Diff: ${completionTimeDiff}, Correct: ${completionTimeCorrect}`);
            if (completionTimeCorrect) correctCount++;
        }

        const processScore = correctCount / totalFields;
        console.log('Process Results - Correct Count:', correctCount, 'Total Fields:', totalFields, 'Score:', processScore);
        console.log('=== END PROCESS COMPARISON DEBUG ===');

        return processScore;
    }
}

export const testSolutionService = TestSolutionService.getInstance();
