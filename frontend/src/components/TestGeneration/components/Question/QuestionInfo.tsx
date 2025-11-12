import { Box, Text, VStack, Grid, GridItem } from "@chakra-ui/react";
import type { IOOperation, QuestionInfoProps } from "../../types";
import { useTestGenColors } from "../../colors";

// Removed inline interface declaration

const QuestionInfo = ({ question }: QuestionInfoProps) => {
  const { boxBg, borderColor, headerBg, textColor, primaryTextColor, headerTextColor } = useTestGenColors();
  const formatIOOperations = (io: IOOperation[]) => io.length === 0 ? "None" : io.map(op => `I/O at ${op.start} for ${op.duration}ms`).join(", ");
  return (
    <Box p={6} borderWidth={1} borderRadius="lg" shadow="md" bg={boxBg} borderColor={borderColor}>
      <VStack align="start" gap={4}>
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2} color={primaryTextColor}>Algorithm: {question.algorithm}{question.quantum && ` (Quantum = ${question.quantum})`}</Text>
          <Text color={textColor}>{question.description}</Text>
        </Box>
        {question.type === 'scheduling' && question.processes && (
          <Box w="100%">
            <Text fontSize="md" fontWeight="semibold" mb={3} color={primaryTextColor}>Process Information:</Text>
            <Box border="1px" borderColor={borderColor} borderRadius="md" overflow="hidden">
              <Grid templateColumns="repeat(4, 1fr)" bg={headerBg}>
                <GridItem p={3} borderRight="1px" borderColor={borderColor}><Text fontWeight="semibold" color={headerTextColor}>Process ID</Text></GridItem>
                <GridItem p={3} borderRight="1px" borderColor={borderColor}><Text fontWeight="semibold" color={headerTextColor}>Arrival Time</Text></GridItem>
                <GridItem p={3} borderRight="1px" borderColor={borderColor}><Text fontWeight="semibold" color={headerTextColor}>Burst Time</Text></GridItem>
                <GridItem p={3}><Text fontWeight="semibold" color={headerTextColor}>I/O Operations</Text></GridItem>
              </Grid>
              {question.processes.map((process, index) => (
                <Grid key={process.id} templateColumns="repeat(4, 1fr)" borderTop={index > 0 ? "1px" : "none"} borderColor={borderColor}>
                  <GridItem p={3} borderRight="1px" borderColor={borderColor}><Text color={primaryTextColor}>P{process.id}</Text></GridItem>
                  <GridItem p={3} borderRight="1px" borderColor={borderColor}><Text color={primaryTextColor}>{process.arrivalTime}</Text></GridItem>
                  <GridItem p={3} borderRight="1px" borderColor={borderColor}><Text color={primaryTextColor}>{process.burstTime}</Text></GridItem>
                  <GridItem p={3}><Text color={primaryTextColor}>{formatIOOperations(process.io)}</Text></GridItem>
                </Grid>
              ))}
            </Box>
          </Box>
        )}
        {question.type === 'memory' && (
          <Box w="100%">
            <Text fontSize="md" fontWeight="semibold" mb={3} color={primaryTextColor}>Memory Configuration:</Text>
            <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
              <VStack align="start" gap={3}>
                <Text color={primaryTextColor}><strong>Frame Count:</strong> {question.frameCount}</Text>
                <Text color={primaryTextColor}><strong>Page Reference Sequence:</strong> {question.pageReferences?.join(', ')}</Text>
                <Text color={primaryTextColor}><strong>Algorithm:</strong> {question.algorithm}</Text>
              </VStack>
            </Box>
          </Box>
        )}
        {question.type === 'disk' && (
          <Box w="100%">
            <Text fontSize="md" fontWeight="semibold" mb={3} color={primaryTextColor}>Disk Configuration:</Text>
            <Box border="1px" borderColor={borderColor} borderRadius="md" p={4}>
              <VStack align="start" gap={3}>
                <Text color={primaryTextColor}><strong>Maximum Disk Size:</strong> {question.maxDiskSize} tracks (0 to {(question.maxDiskSize || 1) - 1})</Text>
                <Text color={primaryTextColor}><strong>Initial Head Position:</strong> {question.initialHeadPosition}</Text>
                <Text color={primaryTextColor}><strong>Head Direction:</strong> {question.headDirection}</Text>
                <Text color={primaryTextColor}><strong>Disk Requests:</strong> {question.requests?.join(', ')}</Text>
                <Text color={primaryTextColor}><strong>Algorithm:</strong> {question.algorithm}</Text>
              </VStack>
            </Box>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default QuestionInfo;
