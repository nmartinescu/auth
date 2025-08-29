import AlgorithmSelection from "../memory/AlgorithmSelection";
import FormImportExport from "../memory/FormImportExport";
import ConfigPanel from "../memory/ConfigPanel";
import SolutionDisplay from "../memory/SolutionDisplay";
import { API_BASE_URL } from "../../config/constants";
import { algorithmOptions } from "../../config/memoryConstants";
import { AlgorithmSelectionContext } from "../../context/AlgorithmSelectionContext";
import { MemoryManagementFormContext } from "../../context/MemoryManagementFormContext";
import { Flex, Heading } from "@chakra-ui/react";
import { useState } from "react";

export function Memory() {
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(["fifo"]);
    const [frameCount, setFrameCount] = useState(3);
    const [pageReferences, setPageReferences] = useState<number[]>([1]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [chartData, setChartData] = useState<number[][] | null>(null);
    const [customData, setCustomData] = useState<any>(null);

    const onSubmit = async () => {
        try {
            const body = { frameCount, selectedAlgorithm, pageReferences };
            console.log(body);

            const response = await fetch(`${API_BASE_URL}/api/memory`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            // get response
            const responseJson = await response.json();

            // log what is sent and what is received
            setChartData(responseJson.frames);
            setCustomData(responseJson.customData);
        } catch (error) {
            console.error("Failed to submit:", error);
        }
    };

    const exportDataCallback = () => {
        return {
            frameCount,
            pageReferences,
            algorithm: selectedAlgorithm[0],
        };
    };

    const importDataCallback = (data: any) => {
        setFrameCount(data.frameCount || 3);
        setPageReferences(data.pageReferences || []);
        setSelectedAlgorithm([data.algorithm || "fifo"]);
    };

    return (
        <MemoryManagementFormContext.Provider
            value={{
                isEditMode,
                setIsEditMode,
                frameCount,
                setFrameCount,
                pageReferences,
                setPageReferences,
                onSubmit,
            }}
        >
            {chartData ? (
                <SolutionDisplay
                    chartData={chartData}
                    setChartData={setChartData}
                    customData={customData}
                    type="memory"
                />
            ) : (
                <Flex
                    maxW="1200px"
                    w="80%"
                    mx="auto"
                    px="4"
                    flexDirection="column"
                    gap="10"
                    mt="10"
                >
                    <AlgorithmSelectionContext.Provider
                        value={{
                            selectedAlgorithm,
                            setSelectedAlgorithm,
                            algorithms: algorithmOptions,
                        }}
                    >
                        <Flex
                            flexDirection="column"
                            justify="center"
                            alignItems="center"
                            textAlign="center"
                            gap="4"
                        >
                            <Heading as="h1" size="3xl" fontFamily="Roboto">
                                Memory Management Simulator
                            </Heading>
                            <AlgorithmSelection />
                        </Flex>

                        <ConfigPanel />

                        <FormImportExport
                            exportDataCallback={exportDataCallback}
                            importDataCallback={importDataCallback}
                        />
                    </AlgorithmSelectionContext.Provider>
                </Flex>
            )}
        </MemoryManagementFormContext.Provider>
    );
}