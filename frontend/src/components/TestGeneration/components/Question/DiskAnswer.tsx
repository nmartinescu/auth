import { useState, useEffect } from "react";
import { Box, Text, Input, VStack, HStack } from "@chakra-ui/react";
import type { DiskAnswerProps } from "../../types";
import { useTestGenColors } from "../../colors";

const DiskAnswer = ({ diskSequence, maxDiskSize, initialHeadPosition, requests, onDiskSequenceChange, reviewMode = false, correctSolution, userScore }: DiskAnswerProps) => {
  const { borderColor, textColor, valueColor, primaryTextColor } = useTestGenColors();
  const [totalSeekTime, setTotalSeekTime] = useState(0);
  const [averageSeekTime, setAverageSeekTime] = useState(0);
  const calculateSeekTimes = (sequence: number[]) => {
    if (sequence.length < 2) { setTotalSeekTime(0); setAverageSeekTime(0); return; }
    let total = 0; for (let i = 1; i < sequence.length; i++) total += Math.abs(sequence[i] - sequence[i - 1]);
    const requestCount = sequence.length - 1; const average = requestCount > 0 ? total / requestCount : 0;
    setTotalSeekTime(total); setAverageSeekTime(Math.round(average * 100) / 100);
  };
  useEffect(() => { calculateSeekTimes(diskSequence); }, [diskSequence]);
  const handleSequenceChange = (index: number, value: string) => {
    const numValue = value === '' ? 0 : (parseInt(value) || 0);
    onDiskSequenceChange(diskSequence.map((pos, idx) => idx === index ? numValue : pos));
  };
  const expectedLength = 1 + requests.length; const isComplete = diskSequence.length === expectedLength;
  return (
    <VStack align="start" gap={6} w="100%">
      <Box w="100%">
        <Text fontWeight="semibold" color={primaryTextColor} mb={3}>Service Sequence (including initial head position):</Text>
        <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
          <VStack align="start" gap={3}>
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color={textColor}>Enter the order in which disk requests are serviced. The first position is the initial head position ({initialHeadPosition}). You need to enter the remaining {requests.length} positions for the requests: [{requests.join(', ')}]. Seek times will be calculated automatically as you enter the sequence.</Text>
              <Text fontSize="xs" color={isComplete ? "green.600" : "orange.600"} fontWeight="medium">Sequence progress: {diskSequence.length} / {expectedLength} positions{!isComplete && " (incomplete)"}</Text>
            </VStack>
            <HStack wrap="wrap" gap={2}>
              {diskSequence.map((position, index) => (
                <HStack key={index} gap={1}>
                  <Text fontSize="sm" color={textColor} fontWeight="medium">{index === 0 ? "Start:" : `${index}:`}</Text>
                  {reviewMode ? (
                    <Box>
                      {correctSolution ? (
                        <VStack align="start" gap={1}>
                          <Text color={position === correctSolution.sequence[index] ? "green.600" : "red.600"} fontWeight="semibold">Your: {position}</Text>
                          <Text color={textColor} fontSize="sm">Correct: {correctSolution.sequence[index]}</Text>
                        </VStack>
                      ) : <Text color={primaryTextColor}>{position}</Text>}
                    </Box>
                  ) : (
                    <Input type="number" value={position} onChange={(e) => handleSequenceChange(index, e.target.value)} size="sm" w="80px" min={0} max={maxDiskSize - 1} color={primaryTextColor} disabled={index === 0} borderRadius="md" />
                  )}
                </HStack>
              ))}
            </HStack>
          </VStack>
        </Box>
      </Box>
      <Box w="100%">
        <Text fontWeight="semibold" color={primaryTextColor} mb={3}>Seek Time Calculations:</Text>
        <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
          <VStack align="start" gap={4}>
            <HStack gap={8} wrap="wrap">
              <Box>
                <Text fontWeight="semibold" color={primaryTextColor} mb={1}>Total Seek Time:</Text>
                {reviewMode && correctSolution ? (
                  <VStack align="start" gap={1}>
                    <Text fontSize="lg" color={Math.abs(totalSeekTime - correctSolution.totalSeekTime) <= 0.01 ? "green.600" : "red.600"} fontWeight="semibold">Your: {totalSeekTime}</Text>
                    <Text fontSize="sm" color={textColor}>Correct: {correctSolution.totalSeekTime}</Text>
                  </VStack>
                ) : (<Text fontSize="lg" color={valueColor} fontWeight="semibold">{totalSeekTime}</Text>)}
              </Box>
              <Box>
                <Text fontWeight="semibold" color={primaryTextColor} mb={1}>Average Seek Time:</Text>
                {reviewMode && correctSolution ? (
                  <VStack align="start" gap={1}>
                    <Text fontSize="lg" color={Math.abs(averageSeekTime - correctSolution.averageSeekTime) <= 0.01 ? "green.600" : "red.600"} fontWeight="semibold">Your: {averageSeekTime.toFixed(2)}</Text>
                    <Text fontSize="sm" color={textColor}>Correct: {correctSolution.averageSeekTime.toFixed(2)}</Text>
                  </VStack>
                ) : (<Text fontSize="lg" color={valueColor} fontWeight="semibold">{averageSeekTime.toFixed(2)}</Text>)}
              </Box>
            </HStack>
            {!reviewMode && (
              <Box>
                <Text fontSize="sm" color={textColor} fontStyle="italic">Tip: Total Seek Time = Sum of |current_position - next_position| for each movement<br />Average Seek Time = Total Seek Time ÷ Number of Requests</Text>
              </Box>
            )}
            {reviewMode && userScore !== undefined && (
              <Box>
                <Text fontWeight="semibold" color={primaryTextColor} mb={1}>Your Score:</Text>
                <Text fontSize="lg" color={userScore >= 80 ? "green.600" : userScore >= 60 ? "yellow.600" : "red.600"} fontWeight="semibold">{userScore}/100</Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>
    </VStack>
  );
};

export default DiskAnswer;
