"use client";

import Link from "next/link";
import { Bot, Map, BrainCircuit, FileSearch, History, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    name: "Chatbot",
    description: "Chat with your AI assistant for general queries and help.",
    href: "/chatbot",
    icon: Bot,
    color: "bg-blue-500",
  },
  {
    name: "Roadmap Generator",
    description: "Get a personalized career roadmap based on your goals.",
    href: "/roadmap",
    icon: Map,
    color: "bg-green-500",
  },
  {
    name: "Skill Analyzer",
    description: "Analyze your current skills and find gaps.",
    href: "/skill-analyzer",
    icon: BrainCircuit,
    color: "bg-purple-500",
  },
  {
    name: "Resume Analyzer",
    description: "Optimize your resume for ATS and recruiters.",
    href: "/resume-analyzer",
    icon: FileSearch,
    color: "bg-orange-500",
  },
  {
    name: "Experiences",
    description: "Explore previous interview experiences.",
    href: "/experiences",
    icon: History,
    color: "bg-pink-500",
  },
];

export default function Home() {
  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50/50 dark:bg-[#0a0a0a] p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 pt-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
          >
            Welcome to Placement Pal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Your all-in-one platform for career preparation. Choose a tool to get started.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 2) }}
            >
              <Link href={feature.href} className="block h-full">
                <div className="group h-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 p-6 rounded-2xl hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className={`w-12 h-12 rounded-xl ${feature.color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.name}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
