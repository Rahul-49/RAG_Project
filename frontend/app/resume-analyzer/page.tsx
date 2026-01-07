"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSearch, CheckCircle, AlertTriangle, FileText, Loader2, ArrowRight } from "lucide-react";

export default function ResumeAnalyzerPage() {
    const COMPANY_DATA: Record<string, string[]> = {
        "TCS": ["Ninja", "Digital", "Prime", "System Engineer"],
        "Accenture": ["Associate Software Engineer", "Advanced ASE", "System and Application Services Associate"],
        "Wipro": ["Elite", "Turbo", "Project Engineer"],
        "Cognizant": ["GenC", "GenC Elevate", "GenC Next", "Programmer Analyst"],
        "DXC": ["Associate Professional", "Software Engineer"],
        "Capgemini": ["Analyst", "Senior Analyst", "Software Engineer"],
        "HCL": ["Graduate Engineer Trainee", "Software Engineer"],
        "Google": ["Software Engineer", "Site Reliability Engineer", "Product Manager"],
        "Amazon": ["Software Development Engineer", "Cloud Support Associate", "Programmer Analyst"],
        "Microsoft": ["Software Engineer", "Support Engineer", "Program Manager"]
    };

    const [company, setCompany] = useState("TCS");
    const [role, setRole] = useState(COMPANY_DATA["TCS"][0]);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{
        ats_score: number;
        missing_keywords: string[];
        formatting_issues: string[];
        tailored_suggestions: string[];
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
            const res = await fetch("http://localhost:8000/analyze-ats", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Failed to analyze resume. Is the backend running?");
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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent flex items-center gap-3">
                    <FileSearch className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    Resume ATS Analyzer
                </h1>
                <p className="text-gray-600 dark:text-white/60 ml-11">Optimize your resume for Applicant Tracking Systems.</p>
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
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    {companies.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Role</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
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
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${file ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-300 dark:border-white/20 hover:border-blue-400 dark:hover:border-blue-400'}`}
                                    >
                                        {file ? (
                                            <div className="flex flex-col items-center text-blue-600 dark:text-blue-400">
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
                                className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Analyze for ATS</span>}
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
                            <FileSearch className="w-16 h-16 mb-4 opacity-50" />
                            <p>Select a role and upload your resume to see ATS insights</p>
                        </div>
                    )}

                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 dark:text-white/50 min-h-[400px]">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                            <p className="animate-pulse">Scanning keywords and formatting...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-6">
                            {/* Score Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                            >
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">ATS Compatibility Score</h3>
                                    <p className="text-gray-500 dark:text-white/60 text-sm">Based on keyword matching and structure</p>
                                </div>
                                <div className="relative">
                                    <svg className="w-32 h-32 transform -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-200 dark:text-white/10" />
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent"
                                            strokeDasharray={351.86}
                                            strokeDashoffset={351.86 - (351.86 * result.ats_score) / 100}
                                            className={`${result.ats_score > 75 ? 'text-green-500' : result.ats_score > 50 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                        />
                                    </svg>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold text-gray-900 dark:text-white">
                                        {result.ats_score}
                                    </div>
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Missing Keywords */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-red-500" /> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missing_keywords.length > 0 ? (
                                            result.missing_keywords.map((kw, i) => (
                                                <span key={i} className="px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-full text-sm font-medium">
                                                    {kw}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">Good job! No major keywords missing.</p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Formatting Issues */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-yellow-500" /> Formatting Checks
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.formatting_issues.length > 0 ? (
                                            result.formatting_issues.map((issue, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0" />
                                                    {issue}
                                                </li>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">Formatting looks clean.</p>
                                        )}
                                    </ul>
                                </motion.div>
                            </div>

                            {/* Tailored Suggestions */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                                    <CheckCircle className="w-5 h-5 text-green-500" /> Tailored Suggestions
                                </h3>
                                <div className="space-y-4">
                                    {result.tailored_suggestions.map((suggestion, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                                            <p className="text-sm text-gray-700 dark:text-gray-200 italic">"{suggestion}"</p>
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
