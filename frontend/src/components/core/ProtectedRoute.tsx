import { useEffect, useState } from "react";
import { Flex, Text } from "@chakra-ui/react";
import { useColorModeValue } from "../ui/color-mode";
import type { ProtectedRouteProps } from "../../types/components";

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
        null
    );
    const bgColor = useColorModeValue("gray.50", "gray.900");
    const textColor = useColorModeValue("gray.800", "white");

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("authToken");
            const userData = localStorage.getItem("user");

            if (!token || !userData) {
                setIsAuthenticated(false);
                // Redirect to login
                window.location.href = "/login";
                return;
            }

            try {
                // Validate that user data is valid JSON
                JSON.parse(userData);
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Invalid user data in localStorage:", error);
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                setIsAuthenticated(false);
                window.location.href = "/login";
            }
        };

        checkAuth();
    }, []);

    // Show loading while checking authentication
    if (isAuthenticated === null) {
        return (
            <Flex minH="100vh" align="center" justify="center" bg={bgColor}>
                <Text fontSize="lg" color={textColor}>
                    Checking authentication...
                </Text>
            </Flex>
        );
    }

    // If not authenticated, don't render children (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    // If authenticated, render the protected content
    return <>{children}</>;
}
