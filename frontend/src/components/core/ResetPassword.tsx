import { Button, Flex, Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { LuLock, LuCheck } from "react-icons/lu";
import { FormField, AuthHeader, PasswordInput, AuthFooter } from "../ui";
import {
    successButtonStyle,
    authContainerStyle,
    authBoxStyle,
    authTheme,
} from "../ui/auth-styles";

export function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [token, setToken] = useState("");
    const [error, setError] = useState("");

    const boxBg = useColorModeValue("white", "gray.800");
    const containerBg = useColorModeValue("gray.50", "gray.900");

    useEffect(() => {
        // Get token from URL params
        const tokenFromUrl = searchParams.get("token");
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
        }

        // Check if user is already logged in
        const authToken = localStorage.getItem("authToken");
        const userData = localStorage.getItem("user");

        if (authToken && userData) {
            // User is already logged in, redirect to dashboard
            window.location.href = "/dashboard";
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        if (!token) {
            setError("Invalid reset token. Please request a new password reset.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        newPassword,
                        confirmPassword,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                setIsSuccess(true);
                // Clear form
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError(data.message || "Password reset failed");
            }
        } catch (error) {
            console.error("Reset password error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <Flex {...authContainerStyle} bg={containerBg}>
                <Box {...authBoxStyle} bg={boxBg}>
                    <AuthHeader
                        title="Password Reset Successful"
                        subtitle="Your password has been updated successfully"
                    />

                    <Box textAlign="center" mb={6}>
                        <Box
                            p={4}
                            bg={useColorModeValue("green.50", "green.900")}
                            borderRadius="lg"
                            mb={4}
                        >
                            <LuCheck size={48} color="#10B981" style={{ margin: "0 auto" }} />
                        </Box>
                    </Box>

                    <AuthFooter
                        linkText="Ready to sign in?"
                        linkTo="/login"
                        linkLabel="Go to login"
                        linkColor={authTheme.success.link}
                    />
                </Box>
            </Flex>
        );
    }

    if (!token) {
        return (
            <Flex {...authContainerStyle} bg={containerBg}>
                <Box {...authBoxStyle} bg={boxBg}>
                    <AuthHeader
                        title="Invalid Reset Link"
                        subtitle="This password reset link is invalid or has expired"
                    />

                    <AuthFooter
                        linkText="Need a new reset link?"
                        linkTo="/forgot-password"
                        linkLabel="Request password reset"
                        linkColor={authTheme.primary.link}
                    />
                </Box>
            </Flex>
        );
    }

    return (
        <Flex {...authContainerStyle} bg={containerBg}>
            <Box {...authBoxStyle} bg={boxBg}>
                <AuthHeader
                    title="Reset Password"
                    subtitle="Enter your new password below"
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
                        <FormField label="New Password" icon={<LuLock />}>
                            <PasswordInput
                                placeholder="Enter your new password"
                                value={newPassword}
                                onChange={setNewPassword}
                                required
                                minLength={6}
                                focusColor={authTheme.success.focus}
                            />
                        </FormField>

                        <FormField label="Confirm New Password" icon={<LuLock />}>
                            <PasswordInput
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={setConfirmPassword}
                                required
                                minLength={6}
                                focusColor={authTheme.success.focus}
                            />
                        </FormField>

                        <Button
                            {...successButtonStyle}
                            type="submit"
                            loading={isLoading}
                            loadingText="Resetting..."
                        >
                            <LuLock />
                            Reset Password
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