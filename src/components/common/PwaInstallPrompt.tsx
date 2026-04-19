"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Prevent prompt if already dismissed or installed
    if (localStorage.getItem('tolzy_pwa_dismissed') === 'true') {
        return;
    }

    // Check if running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      localStorage.setItem('tolzy_pwa_dismissed', 'true');
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing automatically on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show custom popup after 3 seconds so user gets time to see the app
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is successfully installed, hide prompt immediately and save state
    window.addEventListener('appinstalled', () => {
      localStorage.setItem('tolzy_pwa_dismissed', 'true');
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        localStorage.setItem('tolzy_pwa_dismissed', 'true');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      localStorage.setItem('tolzy_pwa_dismissed', 'true');
    } catch (err) {}
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          key="pwa-prompt"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-[88px] sm:bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:w-[400px] sm:max-w-md z-[100] bg-white dark:bg-[#0A0A0A] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/5 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
          
          <button 
            onClick={handleClose}
            className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-[60] cursor-pointer"
            aria-label="إغلاق التنبيه"
          >
            <X size={16} />
          </button>

          <div className="p-5 flex items-start gap-4 text-right relative z-10" dir="rtl">
            <div className="w-16 h-16 bg-gradient-to-br from-[#fea619] to-[#d68500] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-[#fea619]/20">
              <span className="text-white font-black tracking-widest text-[14px]">TOLZY</span>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1.5 flex items-center gap-2">
                تطبيق TOLZY 🔥
              </h3>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 font-medium">
                ثبّت التطبيق الآن للوصول الفوري، تجربة أسرع، وإشعارات حصرية!
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#fea619] dark:to-[#d68500] hover:shadow-lg text-white text-sm font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download size={18} />
                  تثبيت التطبيق الآن
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PwaInstallPrompt;
