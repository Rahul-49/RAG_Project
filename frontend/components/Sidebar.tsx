"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Map, BrainCircuit, User, Sun, Moon, FileSearch, History } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const navItems = [
    { name: "Home", href: "/", icon: User },
    { name: "Chatbot", href: "/chatbot", icon: Bot },
    { name: "Roadmap", href: "/roadmap", icon: Map },
    { name: "Skill Analyzer", href: "/skill-analyzer", icon: BrainCircuit },
    { name: "Resume Analyzer", href: "/resume-analyzer", icon: FileSearch },
    { name: "Experiences", href: "/experiences", icon: History },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <nav className="flex flex-col h-full w-20 md:w-64 bg-gray-50/80 dark:bg-black/20 backdrop-blur-md border-r border-gray-200 dark:border-white/10 transition-all duration-300">
            <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-white/10">
                <div className="hidden md:block font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600 bg-clip-text text-transparent">
                    Placement Pal
                </div>
                <div className="md:hidden font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-600 bg-clip-text text-transparent">
                    N
                </div>
            </div>

            <div className="flex-1 py-6 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href} className="relative group px-4 py-3 flex items-center gap-4 text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-blue-100/50 dark:bg-white/5 border-r-2 border-blue-600 dark:border-blue-500"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <item.icon className={`w-6 h-6 z-10 ${isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-blue-500 dark:group-hover:text-blue-300"}`} />

                            <span className={`hidden md:block font-medium z-10 ${isActive ? "text-gray-900 dark:text-white" : ""}`}>
                                {item.name}
                            </span>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-blue-50 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-lg" />
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-white/10 flex flex-col items-center gap-4">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full transition-colors bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-yellow-500"
                    aria-label="Toggle Theme"
                >
                    {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <div className="text-xs text-center text-gray-400 dark:text-white/30 hidden md:block">
                    © 2024 AI Portal
                </div>
            </div>
        </nav>
    );
}
