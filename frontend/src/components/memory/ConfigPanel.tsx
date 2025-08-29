import {
    Box,
    Button,
    Flex,
    NumberInput,
    Separator,
    Text,
} from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useContext } from "react";
import { MemoryManagementFormContext } from "../../context/MemoryManagementFormContext";
import { LuPlay, LuRotateCcw, LuSave, LuSquarePen } from "react-icons/lu";
import MiscDataDisplay from "./MiscDataDisplay";

type FieldLabelProps = {
    label: string;
    children: React.ReactNode;
};

export default function ConfigPanel() {
    const boxBg = useColorModeValue("gray.50", "gray.700");
    const boxShadowColor = useColorModeValue("gray.300", "gray.700");

    const {
        isEditMode,
        setIsEditMode,
        frameCount,
        setFrameCount,
        pageReferences,
        setPageReferences,
        onSubmit,
    } = useContext(MemoryManagementFormContext);

    return (
        <Flex
            p="5"
            w="100%"
            maxW="500px"
            shadow="0 0 20px var(--shadow-color)"
            shadowColor={boxShadowColor}
            borderRadius="lg"
            bg={boxBg}
            flexDirection="column"
            gap="4"
        >
            <FieldLabel label="Frame count:">
                {isEditMode ? (
                    <NumberInput.Root
                        value={frameCount.toString()}
                        min={1}
                        max={100}
                        onValueChange={(e) =>
                            setFrameCount(Number(e.value) || 0)
                        }
                    >
                        <NumberInput.Control />
                        <NumberInput.Input />
                    </NumberInput.Root>
                ) : (
                    <Text textAlign="right">{frameCount}</Text>
                )}
            </FieldLabel>

            {!isEditMode && <Separator />}

            <FieldLabel label="Page references:">
                {isEditMode ? (
                    <MiscDataDisplay
                        pageReferences={pageReferences}
                        setPageReferences={setPageReferences}
                        display={(entry: number) => entry.toString()}
                    />
                ) : (
                    <Text textAlign="right">
                        {pageReferences.join(", ") || "-"}
                    </Text>
                )}
            </FieldLabel>

            {!isEditMode && <Separator />}

            <Flex
                justify={{ base: "center", md: "flex-end" }}
                flexDirection={{ base: "column", md: "row" }}
                pt={2}
                gap={2}
            >
                <Button
                    onClick={() => {
                        setFrameCount(3);
                        setPageReferences([1]);
                    }}
                    variant="outline"
                    size="sm"
                >
                    <LuRotateCcw /> Reset
                </Button>

                <Button
                    onClick={() => setIsEditMode(!isEditMode)}
                    variant="outline"
                    size="sm"
                >
                    {isEditMode ? (
                        <>
                            <LuSave /> Save
                        </>
                    ) : (
                        <>
                            <LuSquarePen /> Edit
                        </>
                    )}
                </Button>

                <Button
                    size="sm"
                    variant="outline"
                    onClick={onSubmit}
                    disabled={isEditMode}
                >
                    <LuPlay /> Start
                </Button>
            </Flex>
        </Flex>
    );
}

function FieldLabel({ label, children }: FieldLabelProps) {
    const { isEditMode } = useContext(MemoryManagementFormContext);
    const labelColor = useColorModeValue("gray.600", "gray.300");

    return (
        <Flex
            w="full"
            flexDirection={isEditMode ? "column" : "row"}
            justifyContent={isEditMode ? "flex-start" : "space-between"}
        >
            <Text fontWeight="medium" color={labelColor} mb="2" w="30%">
                {label}
            </Text>
            <Box w={isEditMode ? "100%" : "70%"}>{children}</Box>
        </Flex>
    );
}