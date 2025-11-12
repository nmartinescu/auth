import { Box, Heading, Text } from "@chakra-ui/react";
import type { ResultsHeaderProps } from "../../types";

const ResultsHeader = ({ primaryTextColor, textColor }: ResultsHeaderProps) => {
  return (
    <Box textAlign="center">
      <Heading size="xl" mb={2} color={primaryTextColor}>
        Test Completed!
      </Heading>
      <Text fontSize="lg" color={textColor}>
        Here are your results
      </Text>
    </Box>
  );
};

export default ResultsHeader;
