"use client";

import { motion } from "framer-motion";
import { Bot, Send, User, Loader2, Moon, Sun } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode, toggleTheme } = useTheme();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        const el = messagesContainerRef.current;
        if (!el) return;

        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
        });
    };


    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMessage = inputValue.trim();
        setInputValue("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) throw new Error("Network error");

            const data = await response.json();
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again later.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const themeClasses = {
        bg: isDarkMode ? "bg-black" : "bg-gray-50",
        text: isDarkMode ? "text-gray-100" : "text-gray-900",
        cardBg: isDarkMode ? "bg-zinc-900" : "bg-white",
        cardBorder: isDarkMode ? "border-zinc-800" : "border-gray-200",
        headerText: isDarkMode ? "text-blue-400" : "text-blue-600",
        subText: isDarkMode ? "text-zinc-500" : "text-gray-500",
        inputBg: isDarkMode ? "bg-zinc-800" : "bg-gray-100",
        inputBorder: isDarkMode ? "border-zinc-700" : "border-gray-300",
        userBubble: "bg-blue-600 text-white",
        aiBubble: isDarkMode
            ? "bg-zinc-800 border-zinc-700 text-gray-200"
            : "bg-gray-100 border-gray-200 text-gray-800",
    };

    return (
        <div
            className={`w-full h-screen flex flex-col p-4 md:p-6 overflow-hidden ${themeClasses.bg} ${themeClasses.text}`}
        >
            <div className="w-full h-full max-w-5xl mx-auto flex flex-col min-h-0">

                {/* Header */}
                <header className="flex-none mb-4 flex justify-between items-center">
                    <div>
                        <h1 className={`text-2xl font-bold ${themeClasses.headerText}`}>
                            AI Assistant
                        </h1>
                        <p className={`text-sm ${themeClasses.subText}`}>
                            Your intelligent companion
                        </p>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-full transition-colors ${isDarkMode
                            ? "bg-zinc-800 hover:bg-zinc-700 text-yellow-500"
                            : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                            }`}
                    >
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </header>

                {/* Chat Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex-1 flex flex-col min-h-0 rounded-2xl border overflow-hidden shadow-xl ${themeClasses.cardBg} ${themeClasses.cardBorder}`}
                >
                    {/* Messages */}
                    <div
                        ref={messagesContainerRef}
                        className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
                    >
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-blue-50 text-blue-600">
                                    <Bot className="w-10 h-10" />
                                </div>
                                <h2 className="text-xl font-semibold mb-2">
                                    How can I help you?
                                </h2>
                                <p className={themeClasses.subText}>
                                    I can help analyze your skills or answer questions.
                                </p>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${msg.role === "user"
                                            ? "flex-row-reverse"
                                            : "flex-row"
                                            }`}
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600/10 text-blue-600">
                                            {msg.role === "user" ? (
                                                <User className="w-5 h-5" />
                                            ) : (
                                                <Bot className="w-5 h-5" />
                                            )}
                                        </div>
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 border ${msg.role === "user"
                                                ? `${themeClasses.userBubble} border-transparent`
                                                : themeClasses.aiBubble
                                                }`}
                                        >
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <Loader2 className="w-5 h-5 animate-spin opacity-50" />
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Input */}
                    <div className={`flex-none p-4 border-t ${themeClasses.cardBorder}`}>
                        <div className="relative">
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                placeholder="Type a message..."
                                className={`w-full rounded-xl py-3 pl-4 pr-12 border outline-none ${themeClasses.inputBg} ${themeClasses.inputBorder}`}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg text-white"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
