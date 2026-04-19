import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Link as LinkIcon, Twitter, Facebook, MessageCircle, Copy, Share2, Linkedin, CheckCircle2 } from 'lucide-react';
import { Tool } from '../../types';

interface ShareToolModalProps {
  tool: Tool;
  isOpen: boolean;
  onClose: () => void;
}

const ShareToolModal: React.FC<ShareToolModalProps> = ({ tool, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = '';
    }

    // Cleanup function to ensure scroll is restored if component unmounts
    // or if effect changes before timeout completes.
    return () => {
      document.body.style.overflow = '';
      if (timer) clearTimeout(timer);
    };
  }, [isOpen]);

  // Handle closing modal with Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isVisible && !isOpen) return null;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = `اكتشف ${tool.name} - أداة ذكاء اصطناعي قوية لتطوير تعليمك وإنتاجيتك 🚀`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareButtons = [
    {
      name: 'فيسبوك',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      className: 'bg-[#1877F2] hover:bg-[#166fe5] text-white border border-[#1877F2]',
      description: 'مشاركة على فيسبوك'
    },
    {
      name: 'تويتر (X)',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      className: 'bg-black hover:bg-gray-800 text-white border border-black',
      description: 'نشر تغريدة'
    },
    {
      name: 'واتساب',
      icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareTitle + '\n' + shareUrl)}`,
      className: 'bg-[#25D366] hover:bg-[#20bd5a] text-white border border-[#25D366]',
      description: 'إرسال عبر واتساب'
    },
    {
      name: 'لينكد إن',
      icon: Linkedin,
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
      className: 'bg-[#0A66C2] hover:bg-[#0958a8] text-white border border-[#0A66C2]',
      description: 'مشاركة مهنية'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Panel */}
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-right shadow-2xl transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg border border-gray-100 dark:border-gray-700 ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3
              id="modal-title"
              className="text-lg font-bold text-white flex items-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              مشاركة الأداة
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Tool Preview (Optional mini view) */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white p-1 shadow-sm">
                <Image src={tool.imageUrl} alt={tool.name} width={48} height={48} className="object-cover rounded" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{tool.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{tool.description}</p>
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">رابط الأداة</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="block w-full rounded-xl border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 py-3 pr-10 pl-24 text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 text-sm font-mono dir-ltr text-left"
                />
                <div className="absolute inset-y-1 left-1">
                  <button
                    onClick={handleCopyLink}
                    className={`h-full px-4 rounded-lg text-sm font-bold shadow-sm transition-all duration-200 flex items-center gap-1.5 ${copied
                      ? 'bg-green-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تم!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Social Buttons Grid */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">مشاركة عبر الشبكات الاجتماعية</label>
              <div className="grid grid-cols-2 gap-3">
                {shareButtons.map((button) => (
                  <a
                    key={button.name}
                    href={button.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-transform hover:scale-[1.02] active:scale-95 shadow-sm group ${button.className}`}
                    aria-label={`مشاركة على ${button.name}`}
                  >
                    <button.icon className="h-6 w-6 mb-1" />
                    <span className="text-sm font-bold">{button.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Footer (Optional) */}
          <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              شكراً لمشاركتك هذه الأداة ودعم المجتمع! ❤️
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareToolModal;