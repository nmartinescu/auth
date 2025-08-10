import { Button } from "@chakra-ui/react";
import { useColorMode, useColorModeValue } from "./color-mode";
import { LuSun, LuMoon } from "react-icons/lu";

export function ThemeToggle() {
    const { colorMode, toggleColorMode } = useColorMode();
    
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const iconColor = useColorModeValue("#F59E0B", "#FCD34D");

    const isDark = colorMode === "dark";

    return (
        <Button
            position="fixed"
            bottom="20px"
            right="20px"
            size="lg"
            borderRadius="full"
            bg={bgColor}
            border="2px solid"
            borderColor={borderColor}
            shadow="lg"
            _hover={{
                bg: hoverBg,
                transform: "scale(1.05)",
            }}
            _active={{
                transform: "scale(0.95)",
            }}
            onClick={toggleColorMode}
            zIndex={1000}
            transition="all 0.2s"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <LuSun size={24} color={iconColor} />
            ) : (
                <LuMoon size={24} color={iconColor} />
            )}
        </Button>
    );
}