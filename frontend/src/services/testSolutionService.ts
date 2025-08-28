import type { TestQuestion, TestSolution, ProcessResult, GanttEntry } from '../types/Test';

class TestSolutionService {
    private static instance: TestSolutionService;
    
    static getInstance(): TestSolutionService {
        if (!TestSolutionService.instance) {
            TestSolutionService.instance = new TestSolutionService();
        }
        return TestSolutionService.instance;
    }

    async calculateSolution(question: TestQuestion): Promise<TestSolution> {
        try {
            // Convert test processes to backend format
            const processes = question.processes.map(p => ({
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
        } catch (error) {
            console.error('Error calculating solution:', error);
            throw error;
        }
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

    compareAnswers(userSolution: TestSolution, correctSolution: TestSolution): {
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
        console.log('=== COMPARISON DEBUG ===');
        console.log('User Solution:', JSON.stringify(userSolution, null, 2));
        console.log('Correct Solution:', JSON.stringify(correctSolution, null, 2));
        
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
