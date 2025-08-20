import { Box, Button, Flex, IconButton, Table } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
    LuChevronsLeft,
    LuChevronLeft,
    LuChevronRight,
    LuChevronsRight,
    LuArrowLeft,
} from "react-icons/lu";

interface ProcessSolutionProps {
    solution: any;
    onBack: () => void;
}

const boxStyles = {
    border: "1px solid",
    borderColor: "gray.200",
    borderRadius: "md",
    bg: "gray.50",
    textAlign: "center",
    minH: "80px",
    boxShadow: "2px 2px 1px rgba(0, 0, 0, 0.3)",
};

const btnStyle = {
    bg: "white",
    color: "blue.500",
    border: "1px solid",
    borderColor: "blue.300",
    boxShadow: "3px 3px 2px rgba(0, 0, 0, 0.3)",
    _hover: { bg: "blue.50" },
    _active: {
        bg: "blue.100",
        transform: "scale(0.95)",
        boxShadow: "2px 2px 1px rgba(0, 0, 0, 0.3)",
    },
};

export default function ProcessSolution({
    solution,
    onBack,
}: ProcessSolutionProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [graphicTable, setGraphicTable] = useState([]);

    if (!solution || !solution.data) {
        return <div>No solution data available</div>;
    }

    useEffect(() => {
        setGraphicTable(solution.data.solution[stepIndex].graphicTable);
    }, [stepIndex]);

    const handleStepChange = (action: "next" | "prev" | "start" | "end") => {
        setStepIndex((prev) => {
            if (action === "next")
                return Math.min(prev + 1, solution.data.solution.length - 1);
            if (action === "prev") return Math.max(prev - 1, 0);
            if (action === "start") return 0;
            if (action === "end")
                return Math.max(0, solution.data.solution.length - 1);
            return prev;
        });
    };

    console.log(solution);
    console.log(stepIndex, graphicTable);
    const solutionLength = solution.data.solution.length;
    const explaination = solution.data.solution[stepIndex].explaination;

    return (
        <>
            <Flex
                wrap="wrap"
                gap="6"
                my="8"
                justify="center"
                align={{ base: "center", md: "flex-start" }}
                direction={{ base: "column", md: "row" }}
            >
                <Box>
                    <Table.ScrollArea
                        borderWidth="1px"
                        w="100%"
                        rounded="md"
                        maxHeight="406px"
                        mx="auto"
                        mb="4"
                    >
                        <Table.Root size="sm" stickyHeader showColumnBorder>
                            <Table.Header>
                                <Table.Row>
                                    <Table.ColumnHeader textAlign="center">
                                        PID
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center">
                                        Arrival Time
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center">
                                        Scheduled Time
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center">
                                        End Time
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center">
                                        Waiting Time
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="center">
                                        Turnaround Time
                                    </Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {graphicTable?.map((proc: any) => (
                                    <Table.Row key={proc.pid}>
                                        <Table.Cell textAlign="center">
                                            {proc.pid}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {proc.arrival ?? "NONE"}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {proc.scheduledTime ?? "NONE"}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {proc.endTime ?? "NONE"}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {proc.waitingTime ?? "NONE"}
                                        </Table.Cell>
                                        <Table.Cell textAlign="center">
                                            {proc.turnaroundTime ?? "NONE"}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Table.ScrollArea>

                    <Flex
                        my="6"
                        gap="3"
                        justify="center"
                        align="center"
                        wrap="wrap"
                        direction={["column", "row"]}
                    >
                        <IconButton
                            aria-label="Start"
                            onClick={() => handleStepChange("start")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronsLeft />
                        </IconButton>
                        <IconButton
                            aria-label="Previous"
                            onClick={() => handleStepChange("prev")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronLeft />
                        </IconButton>
                        <IconButton
                            aria-label="Next"
                            onClick={() => handleStepChange("next")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronRight />
                        </IconButton>
                        <IconButton
                            aria-label="End"
                            onClick={() => handleStepChange("end")}
                            size="sm"
                            {...btnStyle}
                        >
                            <LuChevronsRight />
                        </IconButton>
                    </Flex>
                </Box>

                <Box
                    w="280px"
                    h="280px"
                    p="4"
                    mb="4"
                    {...boxStyles}
                    display="flex"
                    flexDirection="column"
                    textAlign="left"
                >
                    <p>
                        Step {stepIndex + 1} / {solutionLength}
                    </p>
                    <p>{explaination || "No explanation available."}</p>
                    <Button
                        mt="auto"
                        w="100%"
                        onClick={() => onBack()}
                        size="sm"
                        {...btnStyle}
                    >
                        <LuArrowLeft /> Back to Form
                    </Button>
                </Box>
            </Flex>
        </>
    );
}
