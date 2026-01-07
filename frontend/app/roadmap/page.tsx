"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Flag, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

interface Milestone {
    title: string;
    description?: string;
    status: string;
    date: string;
}

export default function RoadmapPage() {
    const COMPANY_DATA: Record<string, string[]> = {
        "TCS": ["Ninja", "Digital", "Prime", "System Engineer"],
        "Accenture": ["Associate Software Engineer", "Advanced ASE", "System and Application Services Associate"],
        "Wipro": ["Elite", "Turbo", "Project Engineer"],
        "Cognizant": ["GenC", "GenC Elevate", "GenC Next", "Programmer Analyst"],
        "Capgemini": ["Analyst", "Senior Analyst", "Software Engineer"],
        "HCL": ["Graduate Engineer Trainee", "Software Engineer"],
    };

    const [company, setCompany] = useState("TCS");
    const [role, setRole] = useState(COMPANY_DATA["TCS"][0]);
    const [loading, setLoading] = useState(false);
    const [milestones, setMilestones] = useState<Milestone[]>([]);

    const companies = Object.keys(COMPANY_DATA);
    const roles = COMPANY_DATA[company] || [];

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompany = e.target.value;
        setCompany(newCompany);
        setRole(COMPANY_DATA[newCompany]?.[0] || "");
    };

    const generateRoadmap = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:8000/roadmap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ company, role }),
            });
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            if (Array.isArray(data)) {
                setMilestones(data);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate roadmap. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const toggleMilestone = (index: number) => {
        setMilestones(prev => {
            const newMilestones = [...prev];
            const currentStatus = newMilestones[index].status;
            let nextStatus = 'pending';

            if (currentStatus === 'pending') nextStatus = 'in-progress';
            else if (currentStatus === 'in-progress') nextStatus = 'completed';
            else nextStatus = 'pending';

            newMilestones[index] = { ...newMilestones[index], status: nextStatus };
            return newMilestones;
        });
    };

    const completedCount = milestones.filter(m => m.status === 'completed').length;
    const progressPercentage = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

    return (
        <div className="h-full flex flex-col p-6 max-w-6xl mx-auto w-full overflow-y-auto">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Learning Roadmap
                    </h1>
                    <p className="text-gray-600 dark:text-white/60">Your personalized path to mastery</p>
                </div>

                <div className="flex flex-wrap gap-2 items-center bg-white dark:bg-white/5 p-2 rounded-xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <select
                        value={company}
                        onChange={handleCompanyChange}
                        className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm font-medium px-2 py-1"
                    >
                        {companies.map(c => <option key={c} value={c} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">{c}</option>)}
                    </select>
                    <span className="text-gray-300 dark:text-white/20">/</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="bg-transparent border-none outline-none text-gray-900 dark:text-white text-sm font-medium px-2 py-1"
                    >
                        {roles.map(r => <option key={r} value={r} className="bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">{r}</option>)}
                    </select>

                    <button
                        onClick={generateRoadmap}
                        disabled={loading}
                        className="ml-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate
                    </button>
                </div>
            </motion.header>

            {milestones.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {milestones.map((milestone, i) => (
                            <div key={i} className="relative pl-8 pb-8 last:pb-0 border-l border-gray-200 dark:border-white/10 group">
                                <button
                                    onClick={() => toggleMilestone(i)}
                                    className={`absolute left-[-10px] top-0 w-5 h-5 rounded-full border-2 transition-all cursor-pointer z-10 ${milestone.status === 'completed'
                                        ? 'bg-green-500 border-green-500 scale-110'
                                        : milestone.status === 'in-progress'
                                            ? 'bg-blue-500 border-blue-500 animate-pulse'
                                            : 'bg-white dark:bg-black border-gray-300 dark:border-white/20 group-hover:border-purple-500'
                                        }`}
                                />

                                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 hover:shadow-md dark:hover:bg-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{milestone.title}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${milestone.status === 'completed'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                                            : milestone.status === 'in-progress'
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                                : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40'
                                            }`}>
                                            {milestone.status}
                                        </span>
                                    </div>
                                    {milestone.description && <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{milestone.description}</p>}
                                    <p className="text-sm text-gray-500 dark:text-white/40">{milestone.date}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-black border border-gray-200 dark:border-white/10 rounded-xl p-6 h-fit shadow-sm dark:shadow-none"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <Flag className="w-5 h-5 text-purple-600 dark:text-purple-400" /> Goal
                        </h3>
                        <p className="text-gray-600 dark:text-white/60 text-sm mb-6">
                            Pass the interview for <strong>{role}</strong> at <strong>{company}</strong>.
                        </p>

                        <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full"
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-white/40">
                            <span>{progressPercentage}% Progress</span>
                            <span>{completedCount}/{milestones.length} Done</span>
                        </div>
                    </motion.div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                    <div className="p-4 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-4">
                        <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Plan?</h3>
                    <p className="text-gray-500 dark:text-white/60 max-w-sm">
                        Select your target company and role above, then click <strong>Generate</strong> to create a personalized study roadmap.
                    </p>
                </div>
            )}
        </div>
    );
}
