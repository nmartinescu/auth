import { HStack, Button } from "@chakra-ui/react";
import { useTestGenColors } from "../../colors";
import type { QuestionNavigationProps } from "../../types";

const QuestionNavigation = ({ 
  hasPrevious, 
  hasNext, 
  reviewMode, 
  onPreviousQuestion, 
  onNextQuestion, 
  onSubmit, 
  onFinishTest,
  onBackToResults 
}: QuestionNavigationProps) => {
  const { primaryTextColor, borderColor, headerBg } = useTestGenColors();
  
  return (
    <HStack justifyContent="space-between" mt={6}>
      {/* Left side buttons */}
      <HStack gap={3}>
        <Button 
          onClick={onPreviousQuestion} 
          disabled={!hasPrevious || reviewMode} 
          variant="outline" 
          color={primaryTextColor} 
          borderColor={borderColor}
          borderRadius="full"
          _hover={{ 
            bg: headerBg, 
            transform: "translateY(-2px)", 
            boxShadow: "md" 
          }} 
          _active={{ 
            transform: "translateY(0)", 
            boxShadow: "sm" 
          }} 
          transition="all 0.2s" 
          size="md" 
          px={6}
        >
          Previous
        </Button>
        
        {reviewMode && onBackToResults && (
          <Button 
            onClick={onBackToResults} 
            variant="outline"
            colorScheme="gray"
            borderRadius="full"
            _hover={{ 
              bg: headerBg, 
              transform: "translateY(-2px)", 
              boxShadow: "md" 
            }} 
            _active={{ 
              transform: "translateY(0)", 
              boxShadow: "sm" 
            }} 
            transition="all 0.2s" 
            size="md" 
            px={6}
          >
            Back to Results
          </Button>
        )}
      </HStack>

      {/* Right side buttons */}
      <HStack gap={4}>
        {!reviewMode && (
          <Button 
            colorScheme="blue" 
            size="lg" 
            onClick={onSubmit}
            borderRadius="full"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "lg" 
            }} 
            _active={{ 
              transform: "translateY(0)", 
              boxShadow: "md" 
            }} 
            transition="all 0.2s" 
            px={8} 
            fontWeight="semibold"
          >
            {hasNext ? "Submit & Next" : "Submit Test"}
          </Button>
        )}
        {reviewMode && hasNext && (
          <Button 
            size="lg" 
            onClick={onNextQuestion} 
            colorScheme="blue" 
            variant="outline"
            borderRadius="full"
            _hover={{ 
              bg: "blue.50", 
              transform: "translateY(-2px)", 
              boxShadow: "md" 
            }} 
            _active={{ 
              transform: "translateY(0)", 
              boxShadow: "sm" 
            }} 
            transition="all 0.2s" 
            px={8}
          >
            Next Question
          </Button>
        )}
        {reviewMode && !hasNext && (
          <Button 
            colorScheme="green" 
            size="lg" 
            onClick={onFinishTest}
            borderRadius="full"
            _hover={{ 
              transform: "translateY(-2px)", 
              boxShadow: "lg" 
            }} 
            _active={{ 
              transform: "translateY(0)", 
              boxShadow: "md" 
            }} 
            transition="all 0.2s" 
            px={8} 
            fontWeight="semibold"
          >
            View Test Results
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default QuestionNavigation;
