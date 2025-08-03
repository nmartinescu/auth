import { Button, Flex, Input, Box, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { LuTrash2, LuTriangle } from "react-icons/lu";
import { FormField, AuthHeader, PasswordInput } from "../ui";
import {
    authContainerStyle,
    authBoxStyle,
    authTheme,
    createInputStyle,
} from "../ui/auth-styles";
import { API_ENDPOINTS } from "../../config/constants";

export function DeleteAccount() {
    const [password, setPassword] = useState("");
    const [confirmText, setConfirmText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [user, setUser] = useState<any>(null);

    const boxBg = useColorModeValue("white", "gray.800");
    const containerBg = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "white");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const inputStyleWithFocus = createInputStyle(authTheme.primary.focus);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");

        if (!token || !userData) {
            // Redirect to login if not authenticated
            window.location.href = "/login";
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
        } catch (error) {
            console.error("Error parsing user data:", error);
            window.location.href = "/login";
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password) {
            setError("Password is required to delete your account");
            return;
        }

        if (confirmText !== "DELETE MY ACCOUNT") {
            setError("Please type 'DELETE MY ACCOUNT' exactly as shown");
            return;
        }

        setIsLoading(true);

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(API_ENDPOINTS.AUTH.DELETE_ACCOUNT, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    password,
                    confirmDeletion: confirmText,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Clear all local storage
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");

                // Show success message and redirect
                alert(
                    "Your account has been permanently deleted. You will be redirected to the home page."
                );
                window.location.href = "/";
            } else {
                setError(data.message || "Failed to delete account");
            }
        } catch (error) {
            console.error("Account deletion error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={containerBg}>
                <Text fontSize="lg" color={textColor}>
                    Loading...
                </Text>
            </Flex>
        );
    }

    return (
        <Flex {...authContainerStyle} bg={containerBg}>
            <Box {...authBoxStyle} bg={boxBg} maxW="500px">
                <AuthHeader
                    title="Delete Account"
                    subtitle="Permanently delete your OS Sim account"
                />

                {/* Warning Section */}
                <Box
                    p={4}
                    bg="red.50"
                    border="2px solid"
                    borderColor="red.200"
                    borderRadius="lg"
                    mb={6}
                >
                    <VStack gap={3} align="start">
                        <Flex align="center" gap={2}>
                            <LuTriangle size={20} color="#DC2626" />
                            <Text fontWeight="bold" color="red.600">
                                Warning: This action cannot be undone
                            </Text>
                        </Flex>
                        <VStack
                            align="start"
                            gap={1}
                            fontSize="sm"
                            color="red.600"
                        >
                            <Text>
                                • Your account will be permanently deleted
                            </Text>
                            <Text>
                                • All your data will be removed from our servers
                            </Text>
                            <Text>
                                • You will lose access to all OS Sim features
                            </Text>
                            <Text>• This action is irreversible</Text>
                        </VStack>
                    </VStack>
                </Box>

                {/* User Info */}
                <Box
                    p={4}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderRadius="md"
                    mb={6}
                >
                    <Text fontSize="sm" color={subtextColor} mb={1}>
                        Account to be deleted:
                    </Text>
                    <Text fontWeight="semibold" color={textColor}>
                        {user.name} ({user.email})
                    </Text>
                </Box>

                <form onSubmit={handleSubmit}>
                    <VStack gap={6} align="stretch">
                        {error && (
                            <Box
                                p={3}
                                bg="red.50"
                                border="1px solid"
                                borderColor="red.200"
                                borderRadius="md"
                            >
                                <Text color="red.600" fontSize="sm">
                                    {error}
                                </Text>
                            </Box>
                        )}

                        <FormField label="Confirm Password" icon={<LuTrash2 />}>
                            <PasswordInput
                                placeholder="Enter your password"
                                value={password}
                                onChange={setPassword}
                                required
                                focusColor="red.500"
                            />
                        </FormField>

                        <FormField
                            label="Type 'DELETE MY ACCOUNT' to confirm"
                            icon={<LuTriangle />}
                        >
                            <Input
                                type="text"
                                placeholder="DELETE MY ACCOUNT"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                required
                                {...inputStyleWithFocus}
                                borderColor="red.300"
                                _focus={{
                                    borderColor: "red.500",
                                    boxShadow: "0 0 0 1px red.500",
                                }}
                            />
                            <Text fontSize="xs" color="red.500" mt={1}>
                                Type exactly: DELETE MY ACCOUNT
                            </Text>
                        </FormField>

                        <Button
                            type="submit"
                            colorScheme="red"
                            size="lg"
                            loading={isLoading}
                            disabled={
                                !password || confirmText !== "DELETE MY ACCOUNT"
                            }
                        >
                            <LuTrash2 />
                            {isLoading
                                ? "Deleting Account..."
                                : "Delete My Account Permanently"}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() =>
                                (window.location.href = "/dashboard")
                            }
                        >
                            Cancel - Keep My Account
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Flex>
    );
}
