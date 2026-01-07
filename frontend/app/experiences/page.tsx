"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { History, Building2, UserCircle, MessageSquare, Trophy, Lightbulb, Loader2 } from "lucide-react";

export default function ExperiencesPage() {
    const [company, setCompany] = useState<"TCS" | "Google" | null>(null);
    const [loading, setLoading] = useState(false);
    const [experiences, setExperiences] = useState<any[]>([]);

    const fetchExperiences = async (selectedCompany: "TCS" | "Google") => {
        setCompany(selectedCompany);
        setLoading(true);
        setExperiences([]);

        try {
            const res = await fetch("http://localhost:8000/experiences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company: selectedCompany }),
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setExperiences(data);
            } else {
                alert("Failed to fetch experiences.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to backend.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full overflow-y-auto">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
                    <History className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    Interview Experiences
                </h1>
                <p className="text-gray-600 dark:text-white/60 ml-11">Real stories from past candidates to help you prepare.</p>
            </motion.header>

            {/* Selection Buttons */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => fetchExperiences("TCS")}
                    className={`px-6 py-3 rounded-xl border flex items-center gap-2 transition-all ${company === "TCS"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/30"
                            : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-emerald-500 dark:hover:border-emerald-500"
                        }`}
                >
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold">TCS</span>
                </button>

                <button
                    onClick={() => fetchExperiences("Google")}
                    className={`px-6 py-3 rounded-xl border flex items-center gap-2 transition-all ${company === "Google"
                            ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                            : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500"
                        }`}
                >
                    <Building2 className="w-5 h-5" />
                    <span className="font-semibold">Capgemini</span>
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
                        <p>Curating experiences from our knowledge base...</p>
                    </div>
                )}

                {!company && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-white/20 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
                        <Building2 className="w-16 h-16 mb-4 opacity-50" />
                        <p>Select a company to view interview experiences</p>
                    </div>
                )}

                {experiences.map((exp, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 border-b border-gray-100 dark:border-white/5 pb-4">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                                    <UserCircle className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{exp.role}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{exp.candidate_profile}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${exp.verdict.toLowerCase().includes("selected")
                                    ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                                }`}>
                                {exp.verdict}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                                    Questions Asked
                                </h4>
                                <ul className="space-y-2">
                                    {exp.questions_asked.map((q: string, idx: number) => (
                                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 pl-4 border-l-2 border-gray-200 dark:border-white/10">
                                            {q}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3">
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                        Rounds
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {exp.rounds.map((r: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-xs text-gray-600 dark:text-gray-300">
                                                {r}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2">
                                        <Lightbulb className="w-4 h-4 text-purple-500" />
                                        Candidate Tips
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                                        "{exp.tips}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
