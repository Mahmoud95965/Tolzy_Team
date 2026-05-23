'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onQuickAction: (text: string) => void;
    userName?: string;
    children?: React.ReactNode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction, userName, children }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 pt-10 pb-32 sm:pb-48 select-none text-center" dir="rtl">
            {/* Colorful 4-pointed Gemini Star Symbol */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="mb-8"
            >
                <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="gemini-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF4B4B" />
                            <stop offset="30%" stopColor="#FFB800" />
                            <stop offset="70%" stopColor="#00E066" />
                            <stop offset="100%" stopColor="#0075FF" />
                        </linearGradient>
                    </defs>
                    <path d="M50 0C50 27.6142 38.8071 50 11.1929 50C38.8071 50 50 72.3858 50 100C50 72.3858 61.1929 50 88.8071 50C61.1929 50 50 27.6142 50 0Z" fill="url(#gemini-star-grad)" />
                </svg>
            </motion.div>

            {/* Heading */}
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight max-w-md sm:max-w-xl mx-auto leading-tight sm:leading-snug"
            >
                بمَ يمكنني مساعدتك اليوم؟
            </motion.h1>

            {/* Centered Input Slot (Hidden on mobile via parent containers) */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-2xl"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
