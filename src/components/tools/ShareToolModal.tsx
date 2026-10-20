import React, { useState, useEffect } from 'react';
import ToolImage from '../common/ToolImage';
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
          className={`fixed inset-0 bg-[#14140f]/60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Panel */}
        <div
          className={`relative transform overflow-hidden rounded-[28px] bg-[#ffffff] text-right shadow-none transition-all duration-300 sm:my-8 sm:w-full sm:max-w-lg border border-[#d2d2c8] ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}
        >
          {/* Header */}
          <div className="bg-[#f5f5eb] border-b border-[#d2d2c8] px-6 py-4 flex items-center justify-between text-[#14140f]">
            <h3
              id="modal-title"
              className="text-base font-medium text-[#14140f] flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-[#14140f]" />
              مشاركة الأداة
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#6e6e64] hover:text-[#14140f] hover:bg-[#ffffff] transition-colors focus:outline-none"
              aria-label="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Tool Preview */}
            <div className="flex items-center gap-4 p-4 bg-[#f5f5eb] rounded-[18px] border border-[#d2d2c8]">
              <div className="flex-shrink-0">
                <ToolImage
                  name={tool.name}
                  categoryName={Array.isArray(tool.category) ? tool.category[0] : tool.category}
                  subcategoryName={Array.isArray(tool.subcategory) ? tool.subcategory?.[0] : tool.subcategory}
                  size="sm"
                />
              </div>
              <div>
                <h4 className="font-medium text-[#14140f] text-sm">{tool.name}</h4>
                <p className="text-xs text-[#6e6e64] line-clamp-1">{tool.description}</p>
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#6e6e64] uppercase tracking-[0.05em] block">رابط الأداة</label>
              <div className="relative flex items-center">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-4 w-4 text-[#6e6e64]" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="block w-full rounded-[18px] border border-[#d2d2c8] bg-[#f5f5eb] py-3 pr-10 pl-24 text-[#14140f] text-xs font-mono dir-ltr text-left focus:outline-none"
                />
                <div className="absolute inset-y-1.5 left-1.5">
                  <button
                    onClick={handleCopyLink}
                    className={`h-full px-4 rounded-[14px] text-xs font-medium transition-colors flex items-center gap-1.5 ${copied
                      ? 'bg-[#14140f] text-[#ffffff]'
                      : 'bg-[#beff50] text-[#14140f] hover:bg-[#abf03c]'
                      }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Social Buttons Grid */}
            <div>
              <label className="text-xs font-medium text-[#6e6e64] uppercase tracking-[0.05em] block mb-3">مشاركة عبر الشبكات الاجتماعية</label>
              <div className="grid grid-cols-2 gap-3">
                {shareButtons.map((button) => (
                  <a
                    key={button.name}
                    href={button.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-[18px] transition-colors ${button.className}`}
                    aria-label={`مشاركة على ${button.name}`}
                  >
                    <button.icon className="h-5 w-5 mb-0.5" />
                    <span className="text-xs font-medium">{button.name}</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-[#f5f5eb] border-t border-[#d2d2c8] px-6 py-4 text-center">
            <p className="text-xs text-[#6e6e64] font-normal">
              شكراً لمشاركتك هذه الأداة ودعم المجتمع! ❤️
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShareToolModal;