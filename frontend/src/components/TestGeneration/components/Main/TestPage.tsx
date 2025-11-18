import { useState } from "react";
import { 
    Box, 
    Flex, 
    Heading, 
    Button, 
    Text
} from "@chakra-ui/react";
import { useTestGenColors } from "../../colors.tsx";
import { testSessionManager } from "../../../../services/test/testSessionManager.ts";
import type { TestPageProps, TestConfig } from '../../types.ts';
import { TopicSelector } from "./TopicSelector.tsx";
import { TestParameters } from "./TestParameters.tsx";

const TestPage = ({ onTestStart }: TestPageProps) => {
    const [includeScheduling, setIncludeScheduling] = useState(false);
    const [includeMemory, setIncludeMemory] = useState(false);
    const [includeDisk, setIncludeDisk] = useState(false);
    const [numQuestions, setNumQuestions] = useState("3");
    const [difficulty, setDifficulty] = useState("easy");
    const [touched, setTouched] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {
        boxBg,
        borderColor,
        errorColor,
        errorBg,
        errorBorderColor,
        primaryTextColor,
        secondaryTextColor
    } = useTestGenColors();
    
    const questionsError =
        (includeScheduling || includeMemory || includeDisk) && touched && (!numQuestions || parseInt(numQuestions, 10) < 1);
    
    const handleStartTest = async () => {
        if (!includeScheduling && !includeMemory && !includeDisk) {
            setError("Please select at least one test type (scheduling, memory, or disk).");
            return;
        }

        if (questionsError) {
            setTouched(true);
            return;
        }

        setIsStarting(true);
        setError(null);

        try {
            const config: TestConfig = {
                includeScheduling,
                includeMemory,
                includeDisk,
                numQuestions: parseInt(numQuestions, 10),
                difficulty: difficulty as 'easy' | 'medium' | 'hard'
            };

            const session = await testSessionManager.startTest(config);
            
            if (onTestStart) {
                onTestStart(session.id);
            }
        } catch (err) {
            console.error('Failed to start test:', err);
            setError('Failed to start test. Please try again.');
        } finally {
            setIsStarting(false);
        }
    };

    return (
        <Flex
            maxW="900px"
            w="95%"
            mx="auto"
            flexDirection="column"
            gap="6"
            mt="8"
            mb="10"
            px={{ base: 2, md: 0 }}
        >
            <Box textAlign="center" mb={2}>
                <Heading 
                    size="xl" 
                    mb={3} 
                    color={primaryTextColor}
                    fontWeight="bold"
                    letterSpacing="tight"
                >
                    Test Configuration
                </Heading>
                <Text color={secondaryTextColor} fontSize="md" maxW="600px" mx="auto">
                    Customize your assessment by selecting topics, difficulty, and question count
                </Text>
            </Box>
            
            <Box 
                p={{ base: 6, md: 8 }} 
                borderWidth={1} 
                borderRadius="xl" 
                shadow="lg" 
                bg={boxBg} 
                borderColor={borderColor}
                transition="all 0.3s"
                _hover={{ shadow: "xl" }}
            >
                <Flex direction="column" gap={6}>
                    {error && (
                        <Box 
                            p={4} 
                            borderRadius="lg" 
                            bg={errorBg} 
                            border="2px solid" 
                            borderColor={errorBorderColor}
                            animation="fadeIn 0.3s ease-in"
                        >
                            <Text color={errorColor} fontSize="sm" fontWeight="medium">
                                {error}
                            </Text>
                        </Box>
                    )}

                    <TopicSelector
                        includeScheduling={includeScheduling}
                        includeMemory={includeMemory}
                        includeDisk={includeDisk}
                        onSchedulingChange={setIncludeScheduling}
                        onMemoryChange={setIncludeMemory}
                        onDiskChange={setIncludeDisk}
                    />

                    {(includeScheduling || includeMemory || includeDisk) && (
                        <TestParameters
                            numQuestions={numQuestions}
                            difficulty={difficulty}
                            questionsError={questionsError}
                            onNumQuestionsChange={setNumQuestions}
                            onDifficultyChange={setDifficulty}
                            onBlur={() => {
                                setTouched(true);
                                if (!numQuestions || parseInt(numQuestions) < 1) {
                                    setNumQuestions('1');
                                }
                            }}
                        />
                    )}

                    <Button 
                        colorScheme="blue" 
                        onClick={handleStartTest}
                        disabled={
                            (!includeScheduling && !includeMemory && !includeDisk) || 
                            ((includeScheduling || includeMemory || includeDisk) && questionsError) || 
                            isStarting
                        }
                        size="lg"
                        mt={2}
                        py={7}
                        fontSize="md"
                        fontWeight="semibold"
                        borderRadius="lg"
                        shadow="md"
                        _hover={{ 
                            transform: "translateY(-2px)",
                            shadow: "lg"
                        }}
                        _active={{
                            transform: "translateY(0)",
                            shadow: "md"
                        }}
                        transition="all 0.2s"
                        loading={isStarting}
                    >
                        {isStarting ? "Generating Questions..." : "Start Test"}
                    </Button>

                    {!includeScheduling && !includeMemory && !includeDisk && (
                        <Text 
                            fontSize="sm" 
                            color={secondaryTextColor} 
                            textAlign="center"
                        >
                            Please select at least one topic to begin
                        </Text>
                    )}
                </Flex>
            </Box>
        </Flex>
    );
};

export default TestPage;

