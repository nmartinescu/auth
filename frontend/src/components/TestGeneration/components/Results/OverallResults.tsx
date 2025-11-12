import { Box, VStack, Badge, Grid, GridItem, Text } from "@chakra-ui/react";
import { getScoreColor, formatDuration } from "../../colors";
import type { OverallResultsProps } from "../../types";

const OverallResults = ({
  summary,
  boxBg,
  borderColor,
  textColor,
  primaryTextColor
}: OverallResultsProps) => {
  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius="lg"
      shadow="md"
      bg={boxBg}
      borderColor={borderColor}
      textAlign="center"
    >
      <VStack gap={6}>
        <Badge
          colorScheme={getScoreColor(summary.percentage)}
          fontSize="2xl"
          p={4}
          borderRadius="md"
        >
          {summary.percentage}%
        </Badge>

        <Grid templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap={6} w="100%">
          <GridItem textAlign="center">
            <Text fontSize="sm" color={textColor}>
              Questions Answered
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>
              {summary.answeredQuestions} / {summary.totalQuestions}
            </Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="sm" color={textColor}>
              Correct Answers
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="green.500">
              {summary.correctAnswers}
            </Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="sm" color={textColor}>
              Total Score
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>
              {summary.totalScore} / {summary.answeredQuestions * 100}
            </Text>
          </GridItem>
          <GridItem textAlign="center">
            <Text fontSize="sm" color={textColor}>
              Duration
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={primaryTextColor}>
              {formatDuration(summary.duration)}
            </Text>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default OverallResults;
