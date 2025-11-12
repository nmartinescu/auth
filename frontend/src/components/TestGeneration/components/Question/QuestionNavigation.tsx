import { HStack, Button } from "@chakra-ui/react";
import { useColorModeValue } from "../../../ui/color-mode";

interface QuestionNavigationProps {
    hasPrevious: boolean;
    hasNext: boolean;
    reviewMode: boolean;
    onPreviousQuestion: () => void;
    onNextQuestion: () => void;
    onSubmit: () => void;
    onFinishTest: () => void;
}

const QuestionNavigation = ({
    hasPrevious,
    hasNext,
    reviewMode,
    onPreviousQuestion,
    onNextQuestion,
    onSubmit,
    onFinishTest
}: QuestionNavigationProps) => {
    const primaryTextColor = useColorModeValue("gray.900", "white");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const headerBg = useColorModeValue("gray.50", "gray.700");

    return (
        <HStack justifyContent="space-between" mt={6}>
            <Button 
                onClick={onPreviousQuestion}
                disabled={!hasPrevious || reviewMode}
                variant="outline"
                color={primaryTextColor}
                borderColor={borderColor}
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

            <HStack gap={4}>
                {!reviewMode && (
                    <Button 
                        colorScheme="blue" 
                        size="lg"
                        onClick={onSubmit}
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
