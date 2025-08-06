import { Button, Flex, Input, Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { LuUserPlus, LuUser, LuLock, LuMail } from "react-icons/lu";
import {
    FormField,
    AuthHeader,
    PasswordInput,
    AuthFooter,
} from "../ui";
import {
    successButtonStyle,
    createInputStyle,
    authContainerStyle,
    authBoxStyle,
    authTheme,
} from "../ui/auth-styles";
import { API_ENDPOINTS } from "../../config/constants";

export function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const boxBg = useColorModeValue("white", "gray.800");
    const containerBg = useColorModeValue("gray.50", "gray.900");
    const inputStyleWithFocus = createInputStyle(authTheme.success.focus);

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
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (data.success) {
                console.log("User registered:", data.data.user);
                console.log("Access Token:", data.data.accessToken);

                // Store tokens using the token service
                const { accessToken, refreshToken, expiresIn } = data.data;

                // New token storage
                localStorage.setItem(
                    "tokenData",
                    JSON.stringify({
                        accessToken,
                        refreshToken,
                        expiresIn,
                        expiresAt: Date.now() + expiresIn,
                    })
                );

                // Legacy token storage for backward compatibility
                localStorage.setItem("authToken", accessToken);
                localStorage.setItem("user", JSON.stringify(data.data.user));

                // Clear form
                setName("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");

                // Redirect to dashboard
                window.location.href = "/dashboard";
            } else {
                setError(data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex {...authContainerStyle} bg={containerBg}>
            <Box {...authBoxStyle} bg={boxBg}>
                <AuthHeader
                    title="Create Account"
                    subtitle="Join OS Sim to get started"
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

                        <FormField label="Full Name" icon={<LuUser />}>
                            <Input
                                type="text"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                {...inputStyleWithFocus}
                            />
                        </FormField>

                        <FormField label="Email" icon={<LuMail />}>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                {...inputStyleWithFocus}
                            />
                        </FormField>

                        <FormField label="Password" icon={<LuLock />}>
                            <PasswordInput
                                placeholder="Create a password"
                                value={password}
                                onChange={setPassword}
                                required
                                minLength={6}
                                focusColor={authTheme.success.focus}
                            />
                        </FormField>

                        <FormField label="Confirm Password" icon={<LuLock />}>
                            <PasswordInput
                                placeholder="Confirm your password"
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
                            loadingText="Creating account..."
                        >
                            <LuUserPlus />
                            Create Account
                        </Button>
                    </Flex>
                </form>

                <AuthFooter
                    linkText="Already have an account?"
                    linkTo="/login"
                    linkLabel="Sign in here"
                    linkColor={authTheme.primary.link}
                    additionalText="By creating an account, you agree to our Terms of Service"
                />
            </Box>
        </Flex>
    );
}