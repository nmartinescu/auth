import { Button, Flex, Input, Text } from "@chakra-ui/react";
import { useRef } from "react";
import { LuCopy, LuImport, LuFolderOpen, LuDownload } from "react-icons/lu";
import type { ProcessSimulationData } from "../../types/Process";

interface ProcessActionButtonsProps {
    exportDataCallback: () => ProcessSimulationData;
    importDataCallback: (data: ProcessSimulationData) => void;
}

export default function ProcessActionButtons({
    exportDataCallback,
    importDataCallback,
}: ProcessActionButtonsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showNotification = (message: string, type: "success" | "error" = "success") => {
        console.log(`${type === "success" ? "Success" : "Error"}: ${message}`);
    };

    const copyFormData = () => {
        navigator.clipboard.writeText(JSON.stringify(exportDataCallback()));
        showNotification("Copied to clipboard");
    };

    const importFormData = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text) as ProcessSimulationData;
            importDataCallback(data);
            showNotification("Imported successfully");
        } catch (err) {
            console.error("Clipboard import failed", err);
            showNotification("Invalid clipboard data or permission denied", "error");
        }
    };

    const importFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (!e.target || typeof e.target.result !== "string") {
                    throw new Error("File read error");
                }
                const data = JSON.parse(e.target.result) as ProcessSimulationData;
                importDataCallback(data);
                showNotification("File imported successfully");
                

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (err) {
                showNotification("Invalid JSON file format", "error");
            }
        };
        reader.readAsText(file);
    };

    const downloadJson = () => {
        const dataStr = JSON.stringify(exportDataCallback(), null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "process-simulation.json";
        a.click();
        URL.revokeObjectURL(url);
        showNotification("File downloaded");
    };

    // Button style to match ActionButton component
    const buttonStyle = {
        variant: "outline" as const,
        size: "sm" as const,
        borderBottom: "3px solid",
        borderRight: "3px solid",
        borderColor: "inherit",
        _hover: { bg: "gray.50" },
        mx: 1,
    };

    return (
        <>
            <Text mb={2} fontWeight="medium" fontSize="sm">
                Simulation Actions:
            </Text>
            <Flex gap={2} mb={4}>
                <Button
                    {...buttonStyle}
                    onClick={copyFormData}
                    aria-label="Copy to clipboard"
                >
                    <Flex align="center" gap={2}>
                        <LuCopy />
                        <Text display={{ base: "none", sm: "block" }}>Copy</Text>
                    </Flex>
                </Button>

                <Button
                    {...buttonStyle}
                    onClick={importFormData}
                    aria-label="Import from clipboard"
                >
                    <Flex align="center" gap={2}>
                        <LuImport />
                        <Text display={{ base: "none", sm: "block" }}>Import</Text>
                    </Flex>
                </Button>

                <Button
                    {...buttonStyle}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Import from file"
                >
                    <Flex align="center" gap={2}>
                        <LuFolderOpen />
                        <Text display={{ base: "none", sm: "block" }}>Open</Text>
                    </Flex>
                </Button>

                <Button
                    {...buttonStyle}
                    onClick={downloadJson}
                    aria-label="Download JSON"
                >
                    <Flex align="center" gap={2}>
                        <LuDownload />
                        <Text display={{ base: "none", sm: "block" }}>Save</Text>
                    </Flex>
                </Button>

                <Input
                    type="file"
                    accept=".json,application/json"
                    display="none"
                    ref={fileInputRef}
                    onChange={importFromFile}
                />
            </Flex>
        </>
    );
}
