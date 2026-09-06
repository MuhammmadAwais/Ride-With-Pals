import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User as UserIcon } from 'lucide-react';
import { resolveImageUrl } from '@/features/public-club/services/clubGeocoding';

export interface AvatarLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
  name?: string;
  subtitle?: string;
  tag?: string;
  fallbackInitials?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const AvatarLightboxModal: React.FC<AvatarLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  name = "User",
  subtitle,
  tag = "Avatar Preview",
  fallbackInitials,
  onAction,
  actionLabel = "View Profile",
}) => {
  const [imageError, setImageError] = useState(false);

  // Lock background scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset image error state when image URL changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  if (!isOpen) return null;

  const resolvedUrl = resolveImageUrl(imageUrl);

  const initials = fallbackInitials || (
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-surface border border-border rounded-[2.5rem] p-6 sm:p-8 w-full max-w-sm shadow-2xl relative flex flex-col items-center space-y-5 animate-in zoom-in-95 duration-200 text-text-main"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="w-full flex items-center justify-between border-b border-border/70 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EB712B]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#EB712B]">
              {tag}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-main-bg border border-border hover:border-[#EB712B]/40 flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Large Avatar Container */}
        <div className="relative w-60 h-60 sm:w-68 sm:h-68 rounded-3xl overflow-hidden border-2 border-border bg-main-bg shadow-2xl flex items-center justify-center shrink-0">
          {!imageError && resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt={name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#EB712B]/10 text-[#EB712B] font-black text-6xl uppercase tracking-wider select-none">
              {initials ? (
                <span>{initials}</span>
              ) : (
                <UserIcon size={64} className="text-[#EB712B]" />
              )}
            </div>
          )}
        </div>

        {/* Name & Subtitle Details */}
        <div className="text-center space-y-1 w-full px-2">
          <h3 className="text-lg font-black tracking-tight text-text-main uppercase truncate">
            {name}
          </h3>
          {subtitle && (
            <p className="text-xs font-bold text-[#EB712B] truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-3 pt-2">
          {onAction && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onAction();
              }}
              className="flex-1 py-3 rounded-xl bg-hover hover:bg-border text-text-main font-bold text-xs uppercase tracking-wider border border-border transition-all cursor-pointer"
            >
              {actionLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#EB712B] hover:bg-[#d66525] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-[#EB712B]/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AvatarLightboxModal;
