"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, XCircle, Lightbulb, Loader2, ArrowRight, BrainCircuit } from "lucide-react";

export default function SkillAnalyzerPage() {
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
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        present_skills: string[];
        missing_skills: string[];
        recommendations: { skill: string; action: string }[];
    } | null>(null);

    const companies = Object.keys(COMPANY_DATA);
    const roles = COMPANY_DATA[company] || [];

    const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCompany = e.target.value;
        setCompany(newCompany);
        setRole(COMPANY_DATA[newCompany]?.[0] || "");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert("Please upload a resume first");

        setLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append("company", company);
        formData.append("role", role);
        formData.append("file", file);

        try {
            const res = await fetch("http://localhost:8000/analyze-skills", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to analyze skills. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full overflow-y-auto">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    AI Skill Analyzer
                </h1>
                <p className="text-gray-600 dark:text-white/60 ml-11">Upload your resume to find skill gaps for your dream role.</p>
            </motion.header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 space-y-6"
                >
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Company</label>
                                <select
                                    value={company}
                                    onChange={handleCompanyChange}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50"
                                >
                                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/50"
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume (PDF/TXT)</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept=".pdf,.txt"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="resume-upload"
                                    />
                                    <label
                                        htmlFor="resume-upload"
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10' : 'border-gray-300 dark:border-white/20 hover:border-orange-400 dark:hover:border-orange-400'}`}
                                    >
                                        {file ? (
                                            <div className="flex flex-col items-center text-orange-600 dark:text-orange-400">
                                                <FileText className="w-8 h-8 mb-2" />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                                                <Upload className="w-8 h-8 mb-2 group-hover:-translate-y-1 transition-transform" />
                                                <span className="text-sm">Click to upload</span>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !file}
                                className="w-full mt-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Analyze Resume</span>}
                            </button>
                        </form>
                    </div>
                </motion.div>

                {/* Results Section */}
                <motion.div
                    className="lg:col-span-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {!result && !loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-white/30 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl min-h-[400px]">
                            <BrainCircuit className="w-16 h-16 mb-4 opacity-50" />
                            <p>Select a role and upload your resume to see results</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-white/50 min-h-[400px]">
                            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                            <p className="animate-pulse">Analyzing your skills against industry standards...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Skills Comparison */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <CheckCircle className="w-5 h-5 text-green-500" /> Matches
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.present_skills.length > 0 ? (
                                            result.present_skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No matching skills found.</p>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <XCircle className="w-5 h-5 text-red-500" /> Missing / To Improve
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing_skills.length > 0 ? (
                                            result.missing_skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">No critical missing skills identified.</p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Recommendations */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                                    <Lightbulb className="w-5 h-5 text-yellow-500" /> AI Recommendations
                                </h3>
                                <div className="space-y-4">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 text-xs font-bold">
                                                    {i + 1}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{rec.skill}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{rec.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
