import { Flex, Button } from "@chakra-ui/react";
import type { ResultsActionsProps } from "../../types";

const ResultsActions = ({ onRestart }: ResultsActionsProps) => {
  return (
    <Flex justifyContent="center" gap={4} mt={6}>
      <Button 
        colorScheme="blue" 
        size="lg" 
        onClick={onRestart}
        borderRadius="full"
        px={10}
        py={6}
        fontSize="lg"
        fontWeight="semibold"
        _hover={{ 
          transform: "translateY(-2px)", 
          boxShadow: "lg" 
        }} 
        _active={{ 
          transform: "translateY(0)", 
          boxShadow: "md" 
        }} 
        transition="all 0.2s"
      >
        Take Another Test
      </Button>
    </Flex>
  );
};

export default ResultsActions;
