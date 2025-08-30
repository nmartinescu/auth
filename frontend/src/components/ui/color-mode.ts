import { useState, useEffect } from "react";

// Color mode utility for light/dark theme support
export function useColorModeValue(lightValue: string, darkValue: string): string {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check initial theme
        const savedTheme = localStorage.getItem('chakra-ui-color-mode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
        setIsDark(shouldBeDark);
        
        // Apply initial theme to document
        document.documentElement.setAttribute('data-theme', shouldBeDark ? 'dark' : 'light');
        document.documentElement.style.backgroundColor = shouldBeDark ? '#1A202C' : '#FFFFFF';
        document.body.style.backgroundColor = shouldBeDark ? '#1A202C' : '#FFFFFF';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        // Listen for theme changes
        const handleThemeChange = (event: CustomEvent) => {
            setIsDark(event.detail.isDark);
        };

        window.addEventListener('themeChange', handleThemeChange as EventListener);
        
        return () => {
            window.removeEventListener('themeChange', handleThemeChange as EventListener);
        };
    }, []);

    return isDark ? darkValue : lightValue;
}

// Custom useColorMode hook for compatibility
export function useColorMode() {
    const [colorMode, setColorMode] = useState<"light" | "dark">("light");

    useEffect(() => {
        const savedTheme = localStorage.getItem('chakra-ui-color-mode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
        const newMode = shouldBeDark ? 'dark' : 'light';
        setColorMode(newMode);
        
        // Apply initial theme to document
        document.documentElement.setAttribute('data-theme', newMode);
        document.documentElement.style.backgroundColor = shouldBeDark ? '#1A202C' : '#FFFFFF';
        document.body.style.backgroundColor = shouldBeDark ? '#1A202C' : '#FFFFFF';
        document.body.style.margin = '0';
        document.body.style.padding = '0';

        const handleThemeChange = (event: CustomEvent) => {
            setColorMode(event.detail.isDark ? 'dark' : 'light');
        };

        window.addEventListener('themeChange', handleThemeChange as EventListener);
        
        return () => {
            window.removeEventListener('themeChange', handleThemeChange as EventListener);
        };
    }, []);

    const toggleColorMode = () => {
        const newMode = colorMode === 'light' ? 'dark' : 'light';
        const isDark = newMode === 'dark';
        
        setColorMode(newMode);
        localStorage.setItem('chakra-ui-color-mode', newMode);
        
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', newMode);
        document.documentElement.style.backgroundColor = isDark ? '#1A202C' : '#FFFFFF';
        document.body.style.backgroundColor = isDark ? '#1A202C' : '#FFFFFF';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('themeChange', { detail: { isDark } }));
    };

    return { colorMode, toggleColorMode };
}