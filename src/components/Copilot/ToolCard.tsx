import React, { useState } from 'react';
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

const ToolCard: React.FC<ToolCardProps> = ({ name, description, category, reason, link, image }) => {
    const [imgError, setImgError] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden w-full max-w-[calc(100vw-50px)] sm:max-w-lg my-2.5 group hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-200"
        >
            {/* ── Main row ── */}
            <div className="flex gap-3 p-4">
                {/* Tool avatar */}
                <div className="shrink-0">
                    <div className="relative w-10 h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                        {image && !imgError ? (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                sizes="40px"
                                className="object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span className="material-symbols-outlined text-[18px] text-slate-400">
                                build
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-white leading-tight truncate pr-1">{name}</h3>
                            {category && (
                                <span className="text-[10px] font-medium text-slate-500 mt-0.5 inline-block">
                                    {category}
                                </span>
                            )}
                        </div>
                        {link && (
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-slate-300 transition-colors duration-200 p-0.5 shrink-0"
                            >
                                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            </a>
                        )}
                    </div>
                    <p className="text-[12px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{description}</p>
                </div>
            </div>

            {/* ── Reason strip ── */}
            {reason && (
                <div className="px-4 py-2.5 border-t border-white/[0.06] flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full bg-white/30 mt-1.5 shrink-0" />
                    <p className="text-[11px] text-slate-500 italic leading-relaxed">{reason}</p>
                </div>
            )}

            {/* ── CTA footer ── */}
            {link ? (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 border-t border-white/[0.06] text-[11px] font-medium text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all duration-200 group/cta"
                >
                    <span>عرض التفاصيل</span>
                    <span className="material-symbols-outlined text-[13px] group-hover/cta:-translate-x-0.5 transition-transform duration-200">
                        arrow_back
                    </span>
                </a>
            ) : (
                <div className="flex items-center justify-center w-full py-2.5 border-t border-white/[0.06] text-[11px] text-slate-600 cursor-not-allowed">
                    الرابط غير متوفر
                </div>
            )}
        </motion.div>
    );
};

export default ToolCard;
