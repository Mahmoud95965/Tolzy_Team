import React, { useState } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ToolCardProps {
    name: string;
    description: string;
    category?: string;
    reason?: string;
    link?: string;
    image?: string;
}

// Minimal, clean card design
const ToolCard: React.FC<ToolCardProps> = ({ name, description, category, reason, link, image }) => {
    const [imgError, setImgError] = useState(false);
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-[calc(100vw-50px)] sm:max-w-lg my-3 group"
        >
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 p-3 sm:p-4">
                {/* Image Section */}
                <div className="shrink-0 flex sm:block items-center justify-center">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700">
                        {image && !imgError ? (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                sizes="(max-width: 640px) 48px, 64px"
                                className="object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-[10px] sm:text-xs uppercase">
                                {name.substring(0, 2)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words pr-2">{name}</h3>
                            {category && (
                                <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full inline-block mb-1">
                                    {category}
                                </span>
                            )}
                        </div>
                        {link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                            >
                                <ExternalLink size={14} />
                            </a>
                        )}
                    </div>

                    <p className="text-[11px] sm:text-base text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {description}
                    </p>
                </div>
            </div>

            {reason && (
                <div className="bg-blue-50/50 dark:bg-blue-900/10 px-3 py-2 border-t border-blue-100 dark:border-blue-900/30 flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 italic">
                        {reason}
                    </p>
                </div>
            )}

            {link ? (
                <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-2 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 transition-colors flex items-center justify-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                >
                    عرض التفاصيل
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </a>
            ) : (
                <button className="w-full py-2 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 cursor-not-allowed flex items-center justify-center gap-1">
                    الرابط غير متوفر
                </button>
            )}
        </motion.div>
    );
};

export default ToolCard;
