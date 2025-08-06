import { Button } from "@chakra-ui/react";
import { useColorModeValue } from "./color-mode";
import { LuSun, LuMoon } from "react-icons/lu";
import { useState, useEffect } from "react";

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);
    
    const bgColor = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.600");
    const hoverBg = useColorModeValue("gray.50", "gray.700");
    const iconColor = useColorModeValue("#F59E0B", "#FCD34D");

    useEffect(() => {
        // Check if user has a saved theme preference
        const savedTheme = localStorage.getItem('chakra-ui-color-mode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
        setIsDark(shouldBeDark);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
        document.body.style.backgroundColor = shouldBeDark ? '#1A202C' : '#FFFFFF';
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        
        // Save preference to localStorage
        localStorage.setItem('chakra-ui-color-mode', newTheme ? 'dark' : 'light');
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
        document.body.style.backgroundColor = newTheme ? '#1A202C' : '#FFFFFF';
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark: newTheme } }));
    };

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
            onClick={toggleTheme}
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