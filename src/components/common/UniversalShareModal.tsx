import React, { useState, useEffect } from "react";
import { X, Check, Copy, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";

export interface UniversalShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url?: string;
  image?: string;
  category?: string;
}

// Official brand SVG icons for authentic rendering
const WhatsAppIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.96 0-1.74.78-1.74 1.74s.78 1.74 1.74 1.74 1.74-.78 1.74-1.74-.78-1.74-1.74-1.74z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
  </svg>
);

const RedditIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.703zM9.25 12C8.56 12 8 12.56 8 13.25c0 .688.56 1.25 1.25 1.25.688 0 1.25-.562 1.25-1.25 0-.69-.562-1.25-1.25-1.25zm5.5 0c-.688 0-1.25.56-1.25 1.25 0 .688.562 1.25 1.25 1.25.69 0 1.25-.562 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm-5.464 3.99a.327.327 0 0 0-.231.096.34.34 0 0 0 0 .476c.7.702 1.632 1.09 2.645 1.09 1.013 0 1.946-.388 2.646-1.09a.34.34 0 0 0 0-.476.327.327 0 0 0-.462 0c-.576.577-1.34.896-2.184.896-.843 0-1.607-.32-2.183-.896a.327.327 0 0 0-.231-.096z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

export const UniversalShareModal: React.FC<UniversalShareModalProps> = ({
  isOpen,
  onClose,
  title,
  description = "Join this athletic activity on Ride With Pals!",
  url,
  image,
  category = "Activity",
}) => {
  const [copied, setCopied] = useState(false);

  // Fallback to current browser URL if none passed
  const shareUrl = url || window.location.href;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link to clipboard.");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Could not complete share.");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  // Social sharing handlers
  const sharePlatforms = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      bgColor: "bg-[#25D366] hover:bg-[#20bd5a]",
      textColor: "text-white",
      icon: <WhatsAppIcon />,
      action: () => {
        const text = encodeURIComponent(`${title}\n${description}\n${shareUrl}`);
        window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "x",
      name: "X",
      bgColor: "bg-black hover:bg-neutral-900 border border-white/20",
      textColor: "text-white",
      icon: <XTwitterIcon />,
      action: () => {
        const text = encodeURIComponent(`Check out "${title}" on @RideWithPals`);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "facebook",
      name: "Facebook",
      bgColor: "bg-[#1877F2] hover:bg-[#166fe5]",
      textColor: "text-white",
      icon: <FacebookIcon />,
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      bgColor: "bg-[#0A66C2] hover:bg-[#095196]",
      textColor: "text-white",
      icon: <LinkedInIcon />,
      action: () => {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "telegram",
      name: "Telegram",
      bgColor: "bg-[#229ED9] hover:bg-[#1f8ec3]",
      textColor: "text-white",
      icon: <TelegramIcon />,
      action: () => {
        const text = encodeURIComponent(`${title}\n${description}`);
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "reddit",
      name: "Reddit",
      bgColor: "bg-[#FF4500] hover:bg-[#e03d00]",
      textColor: "text-white",
      icon: <RedditIcon />,
      action: () => {
        window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`, "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "tiktok",
      name: "TikTok",
      bgColor: "bg-[#010101] hover:bg-neutral-900 border border-neutral-700",
      textColor: "text-white",
      icon: <TikTokIcon />,
      action: async () => {
        await handleCopyLink();
        toast.info("Link copied! Paste it into TikTok bio or video caption.");
        window.open("https://www.tiktok.com", "_blank", "noopener,noreferrer");
      },
    },
    {
      id: "email",
      name: "Email",
      bgColor: "bg-[#4F46E5] hover:bg-[#4338CA]",
      textColor: "text-white",
      icon: <EmailIcon />,
      action: () => {
        const subject = encodeURIComponent(`Ride With Pals: ${title}`);
        const body = encodeURIComponent(`Hi,\n\nI thought you'd be interested in this activity on Ride With Pals:\n\n${title}\n${description}\n\nView details: ${shareUrl}`);
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      },
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-main-bg border border-border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B]">
              <Share2 size={16} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-text-main tracking-tight">Share {category}</h2>
              <p className="text-[11px] text-text-muted">Broadcast to your community or copy the direct link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface border border-transparent hover:border-border transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Item Preview (like YouTube share dialog) */}
        <div className="p-4 mx-5 mt-4 bg-surface rounded-2xl border border-border flex items-center gap-3.5">
          {image ? (
            <img 
              src={image} 
              alt={title} 
              className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = "/Images/CycleImage2.png"; }}
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-main-bg border border-border flex items-center justify-center shrink-0 text-[#EB712B]">
              <Share2 size={22} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase font-black tracking-wider text-[#EB712B] bg-[#EB712B]/10 px-2 py-0.5 rounded-md inline-block mb-1">
              {category}
            </span>
            <h3 className="text-xs font-bold text-text-main truncate">{title}</h3>
            <p className="text-[11px] text-text-muted truncate mt-0.5">{shareUrl}</p>
          </div>
        </div>

        {/* Channels Grid / Scrollable Row */}
        <div className="px-5 py-5 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted">Share to platform</span>
          <div className="grid grid-cols-4 gap-3 pt-1">
            {sharePlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={platform.action}
                className="flex flex-col items-center gap-2 p-2.5 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${platform.bgColor} ${platform.textColor} shadow-md group-hover:scale-110 transition-transform`}>
                  {platform.icon}
                </div>
                <span className="text-[11px] font-semibold text-text-main group-hover:text-[#EB712B] transition-colors text-center truncate max-w-[70px]">
                  {platform.name}
                </span>
              </button>
            ))}
          </div>

          {/* Native Web Share Button (if supported) */}
          {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
            <div className="pt-2">
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface/80 border border-border text-text-main text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone size={15} className="text-[#EB712B]" />
                More Device Share Options
              </button>
            </div>
          )}
        </div>

        {/* Copy Link Input Bar */}
        <div className="px-5 pb-5 pt-2 border-t border-border mt-auto">
          <label className="text-[10px] uppercase font-bold tracking-wider text-text-muted mb-2 block">
            Direct Link
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface border border-border rounded-xl px-3 py-2.5 flex items-center overflow-hidden">
              <span className="text-xs text-text-muted font-mono truncate select-all">{shareUrl}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 text-white ${
                copied
                  ? "bg-emerald-600 shadow-[0_2px_12px_rgba(16,185,129,0.3)]"
                  : "bg-[#EB712B] hover:bg-[#d66525] shadow-[0_2px_12px_rgba(235,113,43,0.3)]"
              }`}
            >
              {copied ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
