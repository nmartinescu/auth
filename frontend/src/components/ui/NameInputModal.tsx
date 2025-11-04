import { useState } from "react";
import {
    Box,
    Button,
    Flex,
    Input,
} from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";
import { useBoolean } from "./hooks";

interface NameInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string) => void;
    title: string;
    placeholder?: string;
    defaultName?: string;
}

// Modal to get a name from the user
const NameInputModal = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    placeholder = "Enter a name...",
    defaultName = "",
}: NameInputModalProps) => {
    const [name, setName] = useState(defaultName);
    const [isSubmitting, { on: startSubmitting, off: stopSubmitting }] = useBoolean(false);
    const [error, setError] = useState("");
    
    const borderColor = useColorModeValue("#E5E7EB", "#4A5568");
    const buttonHoverBg = useColorModeValue("gray.50", "gray.700");
    
    const handleSubmit = () => {
        if (!name.trim()) {
            setError("Please enter a name");
            return;
        }
        
        setError("");
        startSubmitting();
        
        try {
            onSubmit(name);
            setName(""); // Clear the text after successful save
            onClose();
        } catch (err) {
            console.error("Error submitting name:", err);
            setError("An error occurred. Please try again.");
        } finally {
            stopSubmitting();
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSubmit();
        }
    };
    
    const handleClose = () => {
        setName(""); // Clear the text when modal is closed
        setError("");
        onClose();
    };
    
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };
    
    if (!isOpen) return null;

    return (
        <>
            <Box
                position="fixed"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="rgba(0, 0, 0, 0.4)"
                zIndex="2000"
                onClick={handleClose}
                cursor="pointer"
            />
            <Box
                position="fixed"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                zIndex="2001" 
                width="85%"
                maxWidth="280px"
                bg="gray.50"
                borderRadius="lg"
                boxShadow="xl"
                p={5}
                onClick={handleContentClick}
                border="1px solid"
                borderColor="gray.200"
                _dark={{
                    bg: "gray.750",
                    color: "white",
                    borderColor: "gray.600"
                }}
            >
                <Box
                    pb={2} 
                    mb={3} 
                    borderBottomWidth="1px" 
                    borderBottomColor={borderColor}
                    fontWeight="bold"
                    fontSize="lg"
                >
                    {title}
                </Box>
                
                <Box mb={4}>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={placeholder}
                        size="md"
                        onKeyPress={handleKeyPress}
                        borderColor={error ? "red.500" : undefined}
                        autoFocus
                    />
                    {error && (
                        <Box color="red.500" mt={1} fontSize="sm">
                            {error}
                        </Box>
                    )}
                </Box>
                
                <Flex gap={3} justify="flex-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        size="sm"
                        borderBottom={`3px solid ${borderColor}`}
                        borderRight={`3px solid ${borderColor}`}
                        _hover={{ bg: buttonHoverBg }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        size="sm"
                        colorScheme="blue"
                        disabled={isSubmitting}
                        _disabled={{ opacity: 0.6, cursor: "not-allowed" }}
                        borderBottom={`3px solid`}
                        borderRight={`3px solid`}
                        borderColor="blue.600"
                    >
                        Save
                    </Button>
                </Flex>
            </Box>
        </>
    );
};

export default NameInputModal;
