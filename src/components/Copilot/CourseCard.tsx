import React from 'react';
import { motion } from 'framer-motion';

interface CourseCardProps {
    title: string;
    description: string;
    level?: string;
    duration?: string;
    link?: string;
    instructor?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ title, description, level, duration, link, instructor }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden w-full max-w-[calc(100vw-50px)] sm:max-w-lg my-2.5 group hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200 text-right"
            dir="rtl"
        >
            {/* ── Main row ── */}
            <div className="flex gap-3 p-4">
                {/* Academic Avatar */}
                <div className="shrink-0">
                    <div className="relative w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px] text-amber-400">
                            school
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-white leading-tight truncate pr-1">{title}</h3>
                            <div className="flex gap-1.5 items-center mt-1 select-none flex-wrap">
                                {level && (
                                    <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                        {level}
                                    </span>
                                )}
                                {duration && (
                                    <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                        {duration}
                                    </span>
                                )}
                            </div>
                        </div>
                        {link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-350 transition-colors duration-200 p-0.5 shrink-0"
                            >
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                        )}
                    </div>
                    <p className="text-[12px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{description}</p>
                </div>
            </div>

            {/* Instructor Strip */}
            {instructor && (
                <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-start gap-2">
                    <span className="material-symbols-outlined text-[12px] text-slate-500 mt-0.5">person</span>
                    <p className="text-[11px] text-slate-550 font-semibold leading-relaxed">بإشراف: {instructor}</p>
                </div>
            )}

            {/* CTA footer */}
            {link ? (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 border-t border-white/[0.06] text-[11px] font-bold text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group/cta"
                >
                    <span>الدخول للأكاديمية والتعلم</span>
                    <span className="material-symbols-outlined text-[13px] group-hover/cta:-translate-x-0.5 transition-transform duration-200">
                        arrow_back
                    </span>
                </a>
            ) : (
                <div className="flex items-center justify-center w-full py-2.5 border-t border-white/[0.06] text-[11px] text-slate-650 cursor-not-allowed">
                    الرابط غير متوفر
                </div>
            )}
        </motion.div>
    );
};

export default CourseCard;
