import { Button, Flex, Input, Box, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LuLogIn, LuUser } from "react-icons/lu";
import {
    FormField,
    AuthHeader,
    PasswordInput,
} from "../ui";
import {
    primaryButtonStyle,
    createInputStyle,
    authContainerStyle,
    authBoxStyle,
    authTheme,
} from "../ui/auth-styles";

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const boxBg = useColorModeValue("white", "gray.800");
    const containerBg = useColorModeValue("gray.50", "gray.900");
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
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                console.log("User logged in:", data.data.user);
                console.log("Token:", data.data.token);

                // Store token in localStorage for future requests
                localStorage.setItem("authToken", data.data.token);
                localStorage.setItem("user", JSON.stringify(data.data.user));

                // Clear form
                setEmail("");
                setPassword("");

                // Redirect to dashboard
                window.location.href = "/dashboard";
            } else {
                setError(data.message || "Login failed");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Flex {...authContainerStyle} bg={containerBg}>
            <Box {...authBoxStyle} bg={boxBg}>
                <AuthHeader
                    title="Welcome Back"
                    subtitle="Sign in to access OS Sim"
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
                        <FormField label="Email" icon={<LuUser />}>
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                {...inputStyleWithFocus}
                            />
                        </FormField>

                        <FormField label="Password" icon={<LuUser />}>
                            <PasswordInput
                                placeholder="Enter your password"
                                value={password}
                                onChange={setPassword}
                                required
                                focusColor={authTheme.primary.focus}
                            />
                        </FormField>

                        <Button
                            {...primaryButtonStyle}
                            type="submit"
                            loading={isLoading}
                            loadingText="Signing in..."
                        >
                            <LuLogIn />
                            Sign In
                        </Button>
                    </Flex>
                </form>

                <Flex direction="column" align="center" gap={3} mt={6}>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        Don't have an account?{" "}
                        <Link to="/register">
                            <Text
                                as="span"
                                color={authTheme.success.link}
                                cursor="pointer"
                                _hover={{ textDecoration: "underline" }}
                            >
                                Create one here
                            </Text>
                        </Link>
                    </Text>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                        Forgot your password?{" "}
                        <Link to="/forgot-password">
                            <Text
                                as="span"
                                color={authTheme.primary.link}
                                cursor="pointer"
                                _hover={{ textDecoration: "underline" }}
                            >
                                Reset it here
                            </Text>
                        </Link>
                    </Text>
                    <Text fontSize="sm" color="gray.400" textAlign="center">
                        Demo: admin@example.com / password
                    </Text>
                </Flex>
            </Box>
        </Flex>
    );
}
