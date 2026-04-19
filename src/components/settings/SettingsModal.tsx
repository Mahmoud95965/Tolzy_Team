import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Info, Shield, FileText, LogOut, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleLogout = async () => {
        try {
            await logout();
            onClose();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 w-full max-w-sm overflow-hidden"
                    >
                        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                            <h3 className="font-bold text-gray-800 dark:text-white">الإعدادات</h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-2 space-y-1">
                            <button
                                onClick={toggleDarkMode}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-sm transition-colors"
                            >
                                {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
                                <span>{isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}</span>
                            </button>

                            <Link href="/changelog" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-sm transition-colors">
                                <Sparkles size={18} className="text-indigo-500" />
                                <span>ما الجديد؟</span>
                            </Link>

                            <Link href="/tolzy-ai" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-sm transition-colors">
                                <Info size={18} className="text-blue-500" />
                                <span>مميزات Tolzy</span>
                            </Link>

                            <div className="my-1 border-t border-gray-100 dark:border-white/5" />

                            <Link href="/privacy-policy" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-sm transition-colors">
                                <Shield size={18} className="text-green-500" />
                                <span>سياسة الخصوصية</span>
                            </Link>

                            <Link href="/terms" onClick={onClose} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-200 text-sm transition-colors">
                                <FileText size={18} className="text-orange-500" />
                                <span>شروط الاستخدام</span>
                            </Link>

                            <div className="my-1 border-t border-gray-100 dark:border-white/5" />

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm transition-colors font-medium"
                            >
                                <LogOut size={18} />
                                <span>تسجيل الخروج</span>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SettingsModal;
