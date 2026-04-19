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
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, courses, onSelectCourse }) => {
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
                else {
                    // This logic should be handled by parent to open
                }
            }
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCourses.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCourses.length) % filteredCourses.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCourses[selectedIndex]) {
                    onSelectCourse(filteredCourses[selectedIndex].id);
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, filteredCourses, selectedIndex, onSelectCourse]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-all"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10"
                        dir="rtl"
                    >
                        {/* Elegant Header */}
                        <div className="flex items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-white/5 relative">
                            <Search className="w-5 h-5 text-emerald-500 ml-3 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="عن ماذا تبحث اليوم؟"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setSelectedIndex(0);
                                }}
                                className="flex-1 min-w-0 w-full bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 text-base sm:text-lg font-medium"
                            />
                            <div className="flex items-center gap-2 sm:gap-3 mr-3 shrink-0">
                                {isSyncing ? (
                                    <RefreshCw className="w-5 h-5 text-emerald-500 animate-spin" />
                                ) : (
                                    <button
                                        onClick={handleSyncAllCourses}
                                        className="text-[10px] font-bold text-slate-400 dark:text-slate-600 hover:text-emerald-500 transition-colors tracking-widest"
                                        title="Sync Student Counts"
                                    >
                                        تحديث
                                    </button>
                                )}
                                <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                                <div className="hidden sm:flex items-center gap-1 opacity-40">
                                    <kbd className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono">ESC</kbd>
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
                                                ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20'
                                                : 'border border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4 text-right min-w-0 flex-1">
                                                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${index === selectedIndex ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10'}`}>
                                                    <Command className="w-4 h-4 sm:w-5 sm:h-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 pl-2">
                                                    <p className={`text-sm sm:text-base font-bold transition-colors truncate ${index === selectedIndex ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {course.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{course.category}</span>
                                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{course.platform || 'Tolzy'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {index === selectedIndex && (
                                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <Search className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">لم نجد أي نتائج</p>
                                    <p className="text-sm opacity-60 mt-1">جرب كلمات بحث مختلفة أو تصفح الأقسام</p>
                                </div>
                            )}
                        </div>

                        {/* Search Footer */}
                        <div className="hidden sm:flex px-6 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 items-center justify-between text-[11px] text-slate-400 dark:text-slate-600 font-bold tracking-tight">
                            <div className="flex gap-6">
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <kbd className="font-sans bg-white dark:bg-white/10 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">↑↓</kbd> للتنقل
                                </span>
                                <span className="flex items-center gap-1.5 shrink-0">
                                    <kbd className="font-sans bg-white dark:bg-white/10 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">↵</kbd> للاختيار
                                </span>
                            </div>
                            <span className="opacity-40 uppercase">Tolzy Learn Engine</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
