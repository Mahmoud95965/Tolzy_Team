import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, RefreshCw } from 'lucide-react';
import { Course } from '../../types/learn';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import axios from 'axios';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    courses: Course[];
    onSelectCourse: (courseId: string) => void;
    onLaunchYouTubeLearn?: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, courses, onSelectCourse, onLaunchYouTubeLearn }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncAllCourses = async () => {
        setIsSyncing(true);
        try {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_BASE = isLocal ? 'http://localhost:5000' : '';

            let updatedCount = 0;

            for (const course of courses) {
                if (course.sourceUrl && (!course.studentsCount || course.studentsCount === 0)) {
                    try {
                        const response = await axios.post(`${API_BASE}/api/fetch-course`, { url: course.sourceUrl });
                        if (response.data && response.data.studentsCount > 0) {
                            const courseRef = doc(db, 'courses', course.id);
                            await updateDoc(courseRef, { studentsCount: response.data.studentsCount });
                            updatedCount++;
                        }
                    } catch (err) {
                        console.error(`Failed to sync ${course.title}`, err);
                    }
                    await new Promise(r => setTimeout(r, 200));
                }
            }
            alert(`Sync Complete! Updated ${updatedCount} courses.`);
            window.location.reload();
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Failed to sync. Check console.');
        } finally {
            setIsSyncing(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (isOpen) onClose();
            }
            if (!isOpen) return;

            // Total options include filteredCourses plus the Ask YouTube Learn banner if present
            const totalOptions = filteredCourses.length + (onLaunchYouTubeLearn ? 1 : 0);
            if (totalOptions === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % totalOptions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + totalOptions) % totalOptions);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex < filteredCourses.length) {
                    onSelectCourse(filteredCourses[selectedIndex].id);
                    onClose();
                } else if (onLaunchYouTubeLearn) {
                    onLaunchYouTubeLearn();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, filteredCourses, selectedIndex, onSelectCourse, onLaunchYouTubeLearn]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-all"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="relative w-full max-w-2xl bg-white/95 dark:bg-[#090a0f]/95 backdrop-blur-2xl rounded-3xl md:rounded-[2rem] shadow-[0_10px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden border border-slate-200 dark:border-white/10"
                        dir="rtl"
                    >
                        {/* Elegant Header */}
                        <div className="flex items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-white/5 relative bg-slate-50/50 dark:bg-[#0f1322]/20">
                            <Search className="w-5 h-5 text-emerald-500 dark:text-emerald-400 ml-3 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="عن ماذا تبحث اليوم؟"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                className="flex-1 min-w-0 w-full bg-transparent border-none outline-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-base sm:text-lg font-medium"
                            />
                            <div className="flex items-center gap-2 sm:gap-3 mr-3 shrink-0">
                                {isSyncing ? (
                                    <RefreshCw className="w-5 h-5 text-emerald-500 dark:text-emerald-400 animate-spin" />
                                ) : (
                                    <button
                                        onClick={handleSyncAllCourses}
                                        className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors tracking-widest"
                                        title="Sync Student Counts"
                                    >
                                        تحديث
                                    </button>
                                )}
                                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                                <div className="hidden sm:flex items-center gap-1 opacity-60 dark:opacity-40">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-500 dark:text-slate-300">ESC</kbd>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className="max-h-[60vh] overflow-y-auto p-3 no-scrollbar">
                            {filteredCourses.length > 0 ? (
                                <div className="space-y-1">
                                    {filteredCourses.map((course, index) => (
                                        <button
                                            key={course.id}
                                            onClick={() => {
                                                onSelectCourse(course.id);
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                            className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4 rounded-2xl transition-all duration-200 group ${index === selectedIndex
                                                ? 'bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                                                : 'border border-transparent hover:bg-slate-100/50 dark:hover:bg-white/[0.02]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 text-right min-w-0 flex-1">
                                                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${index === selectedIndex ? 'bg-emerald-500 text-white dark:text-[#090a0f] shadow-lg shadow-emerald-500/30 font-bold' : 'bg-slate-100 dark:bg-[#0f1322] border border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 group-hover:bg-slate-250 dark:group-hover:bg-[#0f1322] group-hover:text-slate-800 dark:group-hover:text-white'}`}>
                                                    <Command className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 pl-2">
                                                    <p className={`text-sm sm:text-base font-black transition-colors truncate ${index === selectedIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {course.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{course.category}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800"></span>
                                                        <span className="text-xs text-slate-400 dark:text-slate-550 font-bold">{course.platform || 'Tolzy'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 dark:text-emerald-400 shrink-0 animate-pulse" />
                                            )}
                                        </button>
                                    ))}

                                    {/* Ask YouTube Learn Action Card appended to results list */}
                                    {onLaunchYouTubeLearn && (
                                        <button
                                            onClick={() => {
                                                onLaunchYouTubeLearn();
                                                onClose();
                                            }}
                                            onMouseEnter={() => setSelectedIndex(filteredCourses.length)}
                                            className={`w-full mt-2 flex items-center justify-between px-3 sm:px-4 py-4 rounded-2xl border transition-all duration-300 group shadow-[0_0_20px_rgba(16,185,129,0.03)] ${
                                                selectedIndex === filteredCourses.length
                                                    ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-550/15 via-teal-500/10 to-transparent dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-transparent'
                                                    : 'border-emerald-500/20 bg-gradient-to-r from-emerald-550/5 via-teal-550/5 to-transparent dark:from-emerald-500/10 dark:via-teal-500/5 dark:to-transparent hover:border-emerald-500/30'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 text-right min-w-0 flex-1">
                                                <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-400/40 relative shadow-md shadow-emerald-500/10">
                                                    <img 
                                                        src="/image/tools/11zon_cropped.jpg" 
                                                        alt="YouTube Learn Icon" 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <span className="absolute inset-0 bg-emerald-400/10 animate-pulse"></span>
                                                </div>
                                                <div className="min-w-0 flex-1 pl-2">
                                                    <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                        <span>🧠 اسأل TOLZY OmniLearn AI</span>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-550/30 uppercase tracking-wide">جديد ✨</span>
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 truncate">
                                                        حلل أي كورس Coursera، يوتيوب، أو مقال تعليمي فوراً بمساعدة AXIOM، استخرج ملخصات وأكواد ذكية واختبر نفسك!
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-emerald-550 dark:text-emerald-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-white/5">
                                        <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-355">لم نجد أي نتائج</p>
                                    <p className="text-sm text-slate-450 dark:text-slate-500 mt-1 mb-6">جرب كلمات بحث مختلفة أو تصفح الأقسام</p>
                                    
                                    {onLaunchYouTubeLearn && (
                                        <button
                                            onClick={() => {
                                                onLaunchYouTubeLearn();
                                                onClose();
                                            }}
                                            className="w-full max-w-md flex items-center justify-between px-4 py-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-550/10 via-teal-500/5 to-transparent hover:from-emerald-550/20 hover:via-teal-550/10 transition-all duration-300 group shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 text-right min-w-0 flex-1">
                                                <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-400/40 relative shadow-md shadow-emerald-500/10">
                                                    <img 
                                                        src="/image/tools/11zon_cropped.jpg" 
                                                        alt="YouTube Learn Icon" 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                    />
                                                    <span className="absolute inset-0 bg-emerald-400/10 animate-pulse"></span>
                                                </div>
                                                <div className="min-w-0 flex-1 pl-2">
                                                    <p className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                                        <span>🧠 اسأل TOLZY OmniLearn AI</span>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">جديد ✨</span>
                                                    </p>
                                                    <p className="text-xs text-slate-555 dark:text-slate-400 font-medium mt-1 truncate">
                                                        حلل أي كورس Coursera، يوتيوب، أو مقال تعليمي فوراً بمساعدة AXIOM، استخرج ملخصات وأكواد ذكية واختبر نفسك!
                                                    </p>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-emerald-550 dark:text-emerald-400 group-hover:translate-x-[-4px] transition-transform shrink-0" />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Search Footer */}
                        <div className="hidden sm:flex px-6 py-4 bg-slate-50/50 dark:bg-[#0f1322]/30 border-t border-slate-100 dark:border-white/5 items-center justify-between text-[11px] text-slate-500 font-bold tracking-tight">
                            <div className="flex gap-6">
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <kbd className="font-sans bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">↑↓</kbd> للتنقل
                                </span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <kbd className="font-sans bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">↵</kbd> للاختيار
                                </span>
                            </div>
                            <span className="opacity-40 uppercase tracking-widest text-[9px]">Tolzy Learn Engine</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
