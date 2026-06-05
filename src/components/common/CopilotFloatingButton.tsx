"use client";
import React from 'react';
import Link from 'next/link';
import { Bot } from 'lucide-react';


const CopilotFloatingButton: React.FC = () => {
    return (
        <div className="fixed hidden md:block bottom-4 right-4 md:bottom-6 md:right-6 z-40 group animate-fade-in-up">
            <Link
                href="/axiom"
                className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-slate-900 dark:bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-slate-800 dark:border-slate-100"
                aria-label="Ask Tolzy AXIOM"
            >
                <Bot className="w-5 h-5 md:w-6 md:h-6 text-white dark:text-slate-900" />
            </Link>
        </div>
    );
};

export default CopilotFloatingButton;
