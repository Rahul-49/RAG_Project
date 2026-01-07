
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeContextType = {
    isDarkMode: boolean;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Default to dark mode
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Check local storage or system preference on mount if desired
        // For now, we stick to default true, or check localStorage
        const saved = localStorage.getItem("theme");
        if (saved === "light") {
            setIsDarkMode(false);
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
