import { Button, Flex, Input, Box, Text, VStack } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { LuMail } from "react-icons/lu";
import { FormField, AuthHeader, AuthFooter } from "../ui";
import {
    primaryButtonStyle,
    createInputStyle,
    authContainerStyle,
    authBoxStyle,
    authTheme,
} from "../ui/auth-styles";
import { API_ENDPOINTS } from "../../config/constants";

export function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const boxBg = useColorModeValue("white", "gray.800");
    const containerBg = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "white");
    const subtextColor = useColorModeValue("gray.600", "gray.300");
    const inputStyleWithFocus = createInputStyle(authTheme.primary.focus);

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");

        if (token && userData) {
            // User is already logged in, redirect to dashboard
            window.location.href = "/dashboard";
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setIsSubmitted(true);
            } else {
                setError(data.message || "Failed to send reset email");
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <Flex {...authContainerStyle} bg={containerBg}>
                <Box {...authBoxStyle} bg={boxBg}>
                    <AuthHeader
                        title="Check Your Email"
                        subtitle="We've sent password reset instructions to your email"
                    />

                    <Box textAlign="center" mb={6}>
                        <Box
                            p={4}
                            bg={useColorModeValue("green.50", "green.900")}
                            borderRadius="lg"
                            mb={6}
                        >
                            <LuMail
                                size={48}
                                color="#10B981"
                                style={{ margin: "0 auto" }}
                            />
                        </Box>

                        <VStack gap={4} align="center">
                            <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color={textColor}
                            >
                                Email Sent Successfully!
                            </Text>

                            <Text
                                fontSize="sm"
                                color={subtextColor}
                                textAlign="center"
                                maxW="400px"
                            >
                                If an account with <strong>{email}</strong>{" "}
                                exists, you'll receive a password reset link
                                shortly.
                            </Text>

                            <Box
                                p={4}
                                bg={useColorModeValue("blue.50", "blue.900")}
                                borderRadius="md"
                                border="1px solid"
                                borderColor={useColorModeValue(
                                    "blue.200",
                                    "blue.700"
                                )}
                            >
                                <VStack gap={2} align="start">
                                    <Text
                                        fontSize="sm"
                                        fontWeight="semibold"
                                        color="blue.600"
                                    >
                                        Next Steps:
                                    </Text>
                                    <Text fontSize="sm" color="blue.600">
                                        • Check your email inbox
                                    </Text>
                                    <Text fontSize="sm" color="blue.600">
                                        • Look in your spam/junk folder
                                    </Text>
                                    <Text fontSize="sm" color="blue.600">
                                        • Click the reset link within 1 hour
                                    </Text>
                                </VStack>
                            </Box>
                        </VStack>
                    </Box>

                    <AuthFooter
                        linkText="Remember your password?"
                        linkTo="/login"
                        linkLabel="Back to login"
                        linkColor={authTheme.primary.link}
                        additionalText="Didn't receive an email? Try checking your spam folder or contact support"
                    />
                </Box>
            </Flex>
        );
    }

    return (
        <Flex {...authContainerStyle} bg={containerBg}>
            <Box {...authBoxStyle} bg={boxBg}>
                <AuthHeader
                    title="Forgot Password"
                    subtitle="Enter your email to receive reset instructions"
                />

                <form onSubmit={handleSubmit}>
                    <Flex direction="column" gap={6}>
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

                        <FormField label="Email Address" icon={<LuMail />}>
                            <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                {...inputStyleWithFocus}
                            />
                        </FormField>

                        <Button
                            {...primaryButtonStyle}
                            type="submit"
                            loading={isLoading}
                            loadingText="Sending..."
                        >
                            <LuMail />
                            Send Reset Link
                        </Button>
                    </Flex>
                </form>

                <AuthFooter
                    linkText="Remember your password?"
                    linkTo="/login"
                    linkLabel="Back to login"
                    linkColor={authTheme.primary.link}
                />
            </Box>
        </Flex>
    );
}