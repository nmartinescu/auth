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