import {
    Button,
    Flex,
    Input,
    Box,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { LuCopy, LuImport, LuFolderOpen, LuDownload, LuSave } from "react-icons/lu";
import { useColorModeValue } from "./color-mode";
import { useBoolean } from "./hooks";
import NameInputModal from "./NameInputModal";
import { simulationService } from "../../services/simulationService";

// Simple modal styling - responsive overlay with content
const ModalOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    if (!isOpen) return null;
    
    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.4)"
            zIndex="1000"
            onClick={onClose}
            display="flex"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
        />
    );
};

const ModalContent = ({ 
    isOpen, 
    children 
}: { 
    isOpen: boolean; 
    children: React.ReactNode;
}) => {
    if (!isOpen) return null;
    
    return (
        <Box
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex="1001" 
            width="90%"
            maxWidth="320px"
            bg="white"
            borderRadius="md"
            boxShadow="lg"
            p={4}
            _dark={{
                bg: "gray.800",
                color: "white"
            }}
        >
            {children}
        </Box>
    );
};

export interface ActionModalProps<T> {
    /**
     * Function to get the data to export
     */
    exportDataCallback: () => T;
    /**
     * Function to handle imported data
     */
    importDataCallback: (data: T) => void;
    /**
     * Optional filename for downloaded JSON (default: "simulation-data.json")
     */
    filename?: string;
    /**
     * Optional button text (default: "Actions")
     */
    buttonText?: string;
    /**
     * Optional modal title (default: "Simulation Actions")
     */
    modalTitle?: string;
    /**
     * Whether the user is currently logged in
     */
    isLoggedIn?: boolean;
    /**
     * Optional callback for loading simulation from user account
     */
    onLoadFromAccount?: () => void;
    /**
     * Optional simulation type identifier
     */
    simulationType?: string;
}

/**
 * A reusable modal component for providing import/export functionality
 */
export default function ActionModal<T>({
    exportDataCallback,
    importDataCallback,
    filename = "simulation-data.json",
    buttonText = "Actions",
    modalTitle = "Simulation Actions",
    isLoggedIn = false,
    onLoadFromAccount,
    simulationType = "process",
}: ActionModalProps<T>) {
    const [isOpen, { on: onOpen, off: onClose }] = useBoolean(false);
    const [isNameModalOpen, { on: openNameModal, off: closeNameModal }] = useBoolean(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Color values
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const buttonHoverBg = useColorModeValue("gray.50", "gray.700");

    // Notification function - could be replaced with a toast system when available
    const showNotification = (message: string, type: "success" | "error" = "success") => {
        console.log(`${type === "success" ? "✅" : "❌"} ${message}`);
        // You could implement a toast notification here
    };

    const copyFormData = () => {
        navigator.clipboard.writeText(JSON.stringify(exportDataCallback()));
        showNotification("Copied to clipboard");
    };

    const importFormData = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text) as T;
            importDataCallback(data);
            showNotification("Imported successfully");
            onClose();
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
                const data = JSON.parse(e.target.result) as T;
                importDataCallback(data);
                showNotification("File imported successfully");
                
                // Reset the input so the same file can be selected again
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                onClose();
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
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        showNotification("File downloaded");
    };

    // Common button styles
    const actionButtonStyle = {
        variant: "outline" as const,
        size: "sm" as const,
        borderBottom: `3px solid ${borderColor}`,
        borderRight: `3px solid ${borderColor}`,
        _hover: { bg: buttonHoverBg },
    };

    // Handle click stop propagation to prevent modal close when clicking content
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    // Handle save to account
    const handleSaveToAccount = async (name: string) => {
        console.log("🔄 Starting save to account...", { name, simulationType });
        try {
            const data = exportDataCallback();
            console.log("📊 Data to save:", data);
            
            const result = await simulationService.saveSimulation(name, simulationType, data);
            console.log("✅ Save successful:", result);
            
            showNotification("Simulation saved successfully");
            onClose(); // Close the main modal after saving
        } catch (error) {
            console.error("❌ Error saving to account:", error);
            
            // More detailed error logging
            if (error instanceof Error) {
                console.error("Error message:", error.message);
                console.error("Error stack:", error.stack);
            }
            
            // Check if it's an axios error
            if (typeof error === 'object' && error !== null && 'response' in error) {
                const axiosError = error as any;
                console.error("Response status:", axiosError.response?.status);
                console.error("Response data:", axiosError.response?.data);
            }
            
            showNotification("Failed to save simulation", "error");
        }
    };

    return (
        <>
            <Button
                size="sm"
                variant="outline"
                onClick={onOpen}
                borderBottom={`3px solid ${borderColor}`}
                borderRight={`3px solid ${borderColor}`}
                _hover={{ bg: buttonHoverBg }}
                minWidth="auto"
                px={3}
            >
                {buttonText}
            </Button>
            
            <NameInputModal
                isOpen={isNameModalOpen}
                onClose={closeNameModal}
                onSubmit={handleSaveToAccount}
                title="Save Simulation"
                placeholder="Enter simulation name"
            />

            <ModalOverlay isOpen={isOpen} onClose={onClose} />
            <ModalContent isOpen={isOpen}>
                <Box onClick={handleContentClick}>
                    <Box 
                        pb={2} 
                        mb={3} 
                        borderBottomWidth="1px" 
                        borderBottomColor={borderColor}
                        fontWeight="bold"
                        fontSize="lg"
                    >
                        {modalTitle}
                    </Box>

                    <Flex direction="column" gap={3}>
                            <Button
                                {...actionButtonStyle}
                                onClick={copyFormData}
                                width="100%"
                            >
                                <Flex align="center" gap={2}>
                                    <LuCopy />
                                    <span>Copy to clipboard</span>
                                </Flex>
                            </Button>

                            <Button
                                {...actionButtonStyle}
                                onClick={importFormData}
                                width="100%"
                            >
                                <Flex align="center" gap={2}>
                                    <LuImport />
                                    <span>Import from clipboard</span>
                                </Flex>
                            </Button>

                            <Button
                                {...actionButtonStyle}
                                onClick={() => fileInputRef.current?.click()}
                                width="100%"
                            >
                                <Flex align="center" gap={2}>
                                    <LuFolderOpen />
                                    <span>Import from file</span>
                                </Flex>
                            </Button>

                            <Button
                                {...actionButtonStyle}
                                onClick={downloadJson}
                                width="100%"
                            >
                                <Flex align="center" gap={2}>
                                    <LuDownload />
                                    <span>Download JSON</span>
                                </Flex>
                            </Button>
                            
                            {isLoggedIn && (
                                <>
                                    <Box 
                                        borderTopWidth="1px" 
                                        borderTopColor={borderColor}
                                        pt={3}
                                        mt={2}
                                        mb={1}
                                    >
                                        <Flex justify="center" mb={2}>
                                            <Box 
                                                fontSize="sm" 
                                                fontWeight="medium"
                                                color="gray.600"
                                                _dark={{ color: "gray.300" }}
                                            >
                                                Account Features
                                            </Box>
                                        </Flex>
                                        
                                        <Button
                                            {...actionButtonStyle}
                                            onClick={openNameModal}
                                            width="100%"
                                            colorScheme="blue"
                                            variant="outline"
                                        >
                                            <Flex align="center" gap={2}>
                                                <LuSave />
                                                <span>Save to Account</span>
                                            </Flex>
                                        </Button>
                                        
                                        <Button
                                            {...actionButtonStyle}
                                            onClick={onLoadFromAccount}
                                            width="100%"
                                            colorScheme="blue"
                                            variant="outline"
                                        >
                                            <Flex align="center" gap={2}>
                                                <LuFolderOpen />
                                                <span>Load from Account</span>
                                            </Flex>
                                        </Button>
                                    </Box>
                                </>
                            )}

                        <Input
                            type="file"
                            accept=".json,application/json"
                            display="none"
                            ref={fileInputRef}
                            onChange={importFromFile}
                        />
                    </Flex>

                    <Flex justify="center" mt={6}>
                        <Button 
                            variant="outline" 
                            onClick={onClose}
                            borderBottom={`3px solid ${borderColor}`}
                            borderRight={`3px solid ${borderColor}`}
                            _hover={{ bg: buttonHoverBg }}
                            width="100%" 
                            size="md"
                        >
                            Close
                        </Button>
                    </Flex>
                </Box>
            </ModalContent>
        </>
    );
}
