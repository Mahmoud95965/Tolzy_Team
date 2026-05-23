'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
    onQuickAction: (text: string) => void;
    userName?: string;
    children?: React.ReactNode;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onQuickAction, userName, children }) => {
    const greeting = userName ? `هيا لنبدأ، ${userName}` : 'هيا لنبدأ';

    return (
        <div className="flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 pt-20 pb-36 sm:pb-48 select-none text-center" dir="rtl">
            {/* Heading */}
            <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-8 tracking-tight"
            >
                {greeting}
            </motion.h1>

            {/* Centered Input Slot */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full max-w-2xl"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default WelcomeScreen;
