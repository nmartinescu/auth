import { Box, Heading, Grid, GridItem, Text, Badge } from "@chakra-ui/react";
import { getDifficultyColor } from "../../colors";
import type { TestConfigurationProps } from "../../types";

const TestConfiguration = ({
  session,
  boxBg,
  borderColor,
  textColor,
  primaryTextColor
}: TestConfigurationProps) => {
  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      shadow="md"
      bg={boxBg}
      borderColor={borderColor}
    >
      <Heading size="md" mb={4} color={primaryTextColor}>
        Test Configuration
      </Heading>

      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        <GridItem>
          <Text fontSize="sm" color={textColor}>
            Difficulty Level
          </Text>
          <Badge colorScheme={getDifficultyColor(session.config.difficulty)} fontSize="md">
            {session.config.difficulty.toUpperCase()}
          </Badge>
        </GridItem>
        <GridItem>
          <Text fontSize="sm" color={textColor}>
            Total Questions
          </Text>
          <Text fontSize="lg" fontWeight="semibold" color={primaryTextColor}>
            {session.config.numQuestions}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="sm" color={textColor}>
            Test Type
          </Text>
          <Text fontSize="lg" fontWeight="semibold" color={primaryTextColor}>
            CPU Scheduling
          </Text>
        </GridItem>
        <GridItem>
          <Text fontSize="sm" color={textColor}>
            Started
          </Text>
          <Text fontSize="lg" fontWeight="semibold" color={primaryTextColor}>
            {session.startTime.toLocaleString()}
          </Text>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default TestConfiguration;
