import React, { useState } from 'react';
import { X, Copy, Check, Link, Share2 } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const mockLink = 'https://smart-designer.app/design/xyz-987-abc';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" dir="rtl">
      <div 
        className="bg-surface border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 size={20} className="text-primary" />
            اشتراک‌گذاری طرح
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Link size={28} className="text-primary" />
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              لینک زیر را کپی کنید و با دوستان خود به اشتراک بگذارید تا بتوانند این طرح را مشاهده کنند.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl p-2">
            <div className="flex-1 overflow-hidden">
              <input 
                type="text" 
                readOnly 
                value={mockLink}
                className="w-full bg-transparent text-sm text-zinc-300 font-mono outline-none px-2 text-left"
                dir="ltr"
              />
            </div>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                copied 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {copied ? (
                <>
                  <Check size={16} />
                  <span>کپی شد</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>کپی لینک</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
