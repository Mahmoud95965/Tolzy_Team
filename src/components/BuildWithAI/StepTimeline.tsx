'use client';
import React, { useState } from 'react';
import { ChevronDown, Clock, CheckCircle2 } from 'lucide-react';

interface Step {
    order: number;
    title: string;
    description: string;
    duration: string;
    deliverable: string;
}

export default function StepTimeline({ steps }: { steps: Step[] }) {
    const [expandedStep, setExpandedStep] = useState<number | null>(0);

    return (
        <div className="relative space-y-4">
            {/* Vertical line */}
            <div className="absolute right-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 opacity-30 hidden md:block" />

            {steps.map((step, idx) => (
                <div key={step.order} className="relative flex gap-4 md:gap-6 group">
                    {/* Timeline dot */}
                    <div className="hidden md:flex flex-col items-center pt-1.5 z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border-2 transition-all ${expandedStep === idx ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-[#111] text-slate-500 border-slate-200 dark:border-white/10'}`}>
                            {step.order}
                        </div>
                    </div>

                    {/* Content */}
                    <div
                        className="flex-1 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
                    >
                        <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="md:hidden w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-black">{step.order}</span>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{step.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] text-slate-400 font-bold">{step.duration}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedStep === idx ? 'rotate-180' : ''}`} />
                        </div>

                        {expandedStep === idx && (
                            <div className="px-5 pb-5 border-t border-slate-100 dark:border-white/5 pt-4 animate-in fade-in duration-300">
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">{step.description}</p>
                                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 rounded-xl">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400 shrink-0" />
                                    <span className="text-xs text-green-700 dark:text-green-400 font-bold">النتيجة: {step.deliverable}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
