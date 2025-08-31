import { Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../../ui/color-mode";

interface GanttChartProps {
    solution: any;
    stepIndex: number;
}

interface ProcessBlock {
    pid: number;
    startTime: number;
    endTime: number;
    state: "RUNNING" | "READY" | "WAIT" | "NEW" | "DONE";
}

export default function GanttChart({ solution, stepIndex }: GanttChartProps) {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const textColor = useColorModeValue("gray.800", "gray.100");

    // Color mapping for different process states
    const stateColors = {
        RUNNING: "#4CAF50", // Green
        READY: "#FF9800", // Orange
        WAIT: "#F44336", // Red
        NEW: "#9E9E9E", // Gray
        DONE: "#2196F3", // Blue
    };

    const stateLabels = {
        RUNNING: "Running",
        READY: "Ready Queue",
        WAIT: "Wait Queue",
        NEW: "New",
        DONE: "Done",
    };

    if (!solution?.data?.solution) {
        return <div>No solution data available</div>;
    }

    // Get all unique process IDs
    const allProcesses = new Set<number>();
    solution.data.solution.forEach((step: any) => {
        Object.keys(step.processStates || {}).forEach((pid) => {
            allProcesses.add(parseInt(pid));
        });
    });

    const processIds = Array.from(allProcesses).sort((a, b) => a - b);
    const maxTime = Math.max(
        ...solution.data.solution.map((step: any) => step.timer || 0)
    );
    const currentTime = solution.data.solution[stepIndex]?.timer || 0;

    // Build timeline data for each process
    const buildProcessTimeline = (pid: number) => {
        const timeline: ProcessBlock[] = [];
        let currentState = "NEW";
        let stateStartTime = 0;

        for (let i = 0; i <= stepIndex; i++) {
            const step = solution.data.solution[i];
            const processState = step.processStates?.[pid]?.state;
            const stepTime = step.timer || 0;

            if (processState && processState !== currentState) {
                // Add the previous state block if it had duration
                if (i > 0 && stateStartTime < stepTime) {
                    timeline.push({
                        pid,
                        startTime: stateStartTime,
                        endTime: stepTime,
                        state: currentState as any,
                    });
                }
                currentState = processState;
                stateStartTime = stepTime;
            }
        }

        // Add the current state block if it has duration
        if (stepIndex >= 0 && stateStartTime <= currentTime) {
            timeline.push({
                pid,
                startTime: stateStartTime,
                endTime: currentTime,
                state: currentState as any,
            });
        }

        return timeline.filter((block) => block.startTime < block.endTime);
    };

    const timelineWidth = 600;
    const processHeight = 40;
    const labelWidth = 60;

    // Calculate time scale, ensuring minimum width per time unit for readability
    const minTimeUnitWidth = 20;
    const calculatedScale = maxTime > 0 ? timelineWidth / maxTime : 1;
    const timeScale = Math.max(calculatedScale, minTimeUnitWidth);

    // Adjust timeline width if needed to accommodate minimum scale
    const actualTimelineWidth = Math.max(
        timelineWidth,
        maxTime * minTimeUnitWidth
    );

    return (
        <Box
            p="4"
            bg={cardBg}
            borderRadius="lg"
            border={`2px solid ${borderColor}`}
            mb="4"
        >
            <Text
                fontSize="lg"
                fontWeight="bold"
                color={textColor}
                mb="4"
                textAlign="center"
            >
                Process Gantt Chart - Timeline Visualization
            </Text>

            {/* Legend */}
            <Box
                mb="4"
                display="flex"
                flexWrap="wrap"
                gap="4"
                justifyContent="center"
            >
                {Object.entries(stateColors).map(([state, color]) => (
                    <Box key={state} display="flex" alignItems="center" gap="2">
                        <Box
                            width="16px"
                            height="16px"
                            bg={color}
                            borderRadius="2px"
                        />
                        <Text fontSize="sm" color={textColor}>
                            {stateLabels[state as keyof typeof stateLabels]}
                        </Text>
                    </Box>
                ))}
            </Box>

            {/* Process rows - with horizontal scroll if needed */}
            <Box overflowX="auto" maxWidth="100%">
                <Box minWidth={`${labelWidth + actualTimelineWidth + 20}px`}>
                    {/* Time axis */}
                    <Box mb="2" position="relative" height="30px">
                        {/* Main timeline axis line */}
                        <Box
                            position="absolute"
                            left={`${labelWidth - 10}px`}
                            width={`${actualTimelineWidth}px`}
                            height="1px"
                            bg={borderColor}
                            top="20px"
                        />

                        {/* Time markers and labels */}
                        {Array.from({ length: maxTime + 1 }, (_, i) => {
                            const leftPosition = labelWidth - 10 + i * timeScale;
                            return (
                                <Box
                                    key={i}
                                    position="absolute"
                                    left={`${leftPosition}px`}
                                >
                                    {/* Vertical tick mark */}
                                    <Box
                                        position="absolute"
                                        width="1px"
                                        height="6px"
                                        bg={borderColor}
                                        top="17px"
                                        left="-0.5px"
                                    />
                                    {/* Time label */}
                                    <Box
                                        position="absolute"
                                        top="0"
                                        left="-8px"
                                        width="16px"
                                        textAlign="center"
                                        fontSize="xs"
                                        color={textColor}
                                    >
                                        {i}
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>

                    {processIds.map((pid) => {
                        const timeline = buildProcessTimeline(pid);

                        return (
                            <Box
                                key={pid}
                                display="flex"
                                alignItems="center"
                                mb="2"
                            >
                                {/* Process label */}
                                <Box
                                    width={`${labelWidth - 10}px`}
                                    textAlign="right"
                                    pr="2"
                                    fontSize="sm"
                                    color={textColor}
                                    fontWeight="medium"
                                    flexShrink="0"
                                >
                                    P{pid}
                                </Box>

                                {/* Timeline bar */}
                                <Box
                                    position="relative"
                                    width={`${actualTimelineWidth}px`}
                                    height={`${processHeight}px`}
                                    bg={useColorModeValue(
                                        "gray.100",
                                        "gray.700"
                                    )}
                                    borderRadius="4px"
                                    border={`1px solid ${borderColor}`}
                                    overflow="hidden"
                                    flexShrink="0"
                                >
                                    {/* Vertical grid lines */}
                                    {Array.from(
                                        { length: maxTime + 1 },
                                        (_, i) => (
                                            <Box
                                                key={`grid-${i}`}
                                                position="absolute"
                                                left={`${i * timeScale}px`}
                                                width="1px"
                                                height="100%"
                                                bg={useColorModeValue(
                                                    "gray.200",
                                                    "gray.600"
                                                )}
                                                opacity="0.5"
                                            />
                                        )
                                    )}

                                    {/* Process state blocks */}
                                    {timeline.map((block, index) => {
                                        const blockWidth = Math.max(
                                            2,
                                            (block.endTime - block.startTime) *
                                                timeScale
                                        );
                                        const blockLeft =
                                            block.startTime * timeScale;

                                        return (
                                            <Box
                                                key={index}
                                                position="absolute"
                                                left={`${blockLeft}px`}
                                                width={`${blockWidth}px`}
                                                height="100%"
                                                bg={stateColors[block.state]}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                fontSize="xs"
                                                color="white"
                                                fontWeight="bold"
                                                border="1px solid rgba(255,255,255,0.3)"
                                                title={`${block.state}: ${block.startTime}-${block.endTime}`}
                                                zIndex="5"
                                            >
                                                {blockWidth > 15 &&
                                                    block.state.charAt(0)}
                                            </Box>
                                        );
                                    })}

                                    {/* Current time indicator */}
                                    <Box
                                        position="absolute"
                                        left={`${currentTime * timeScale}px`}
                                        width="3px"
                                        height="100%"
                                        bg="red"
                                        zIndex="10"
                                        borderRadius="1px"
                                    />
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            {/* Current step info */}
            <Box mt="4" textAlign="center">
                <Text fontSize="sm" color={textColor}>
                    Current Time: {currentTime} | Step: {stepIndex + 1} /{" "}
                    {solution.data.solution.length}
                </Text>
            </Box>
        </Box>
    );
}
