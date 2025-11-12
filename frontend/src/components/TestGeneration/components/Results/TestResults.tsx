import { Flex } from "@chakra-ui/react";
import { useResultsColors } from "../../colors";
import type { TestResultsProps } from "../../types";
import ResultsHeader from "./ResultsHeader";
import OverallResults from "./OverallResults";
import QuestionDetails from "./QuestionDetails";
import TestConfiguration from "./TestConfiguration";
import ResultsActions from "./ResultsActions";

const TestResults = ({
    session,
    summary,
    onRestart,
    onViewQuestion
}: TestResultsProps) => {
    const colors = useResultsColors();

    return (
        <Flex
            maxW="1200px"
            w="90%"
            mx="auto"
            flexDirection="column"
            gap="6"
            mt="6"
            pb="10"
        >
            <ResultsHeader 
                primaryTextColor={colors.primaryTextColor}
                textColor={colors.textColor}
            />

            <OverallResults
                summary={summary}
                boxBg={colors.boxBg}
                borderColor={colors.borderColor}
                textColor={colors.textColor}
                primaryTextColor={colors.primaryTextColor}
            />

            <QuestionDetails
                session={session}
                onViewQuestion={onViewQuestion}
                boxBg={colors.boxBg}
                borderColor={colors.borderColor}
                textColor={colors.textColor}
                primaryTextColor={colors.primaryTextColor}
            />

            <TestConfiguration
                session={session}
                boxBg={colors.boxBg}
                borderColor={colors.borderColor}
                textColor={colors.textColor}
                primaryTextColor={colors.primaryTextColor}
            />

            <ResultsActions onRestart={onRestart} />
        </Flex>
    );
};

export default TestResults;
