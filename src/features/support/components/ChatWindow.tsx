/** ChatWindow — hexagon wallpaper, GSAP bubble entrance, message feed, input bar. Ported from admin panel. */
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MoreVertical, Phone, Video, Paperclip, Smile, Send, Mic } from 'lucide-react';
import { type ChatUser, type ChatMessage } from '../utils/constants';
import { MessageBubble } from './MessageBubble';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface ChatWindowProps {
  activeUser: ChatUser | null;
  messages: ChatMessage[];
  onBack: () => void;
  isHiddenOnMobile: boolean;
}

/** SVG hexagon tiling wallpaper — identical to admin panel */
function HexWallpaper(): React.ReactElement {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.06 }}
      className="dark:opacity-[0.10]"
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-wp" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
            <path
              d="M25,0 L50,14.5 L50,43.4 L25,57.9 L0,43.4 L0,14.5 Z"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-wp)" style={{ color: 'var(--color-main-text)' }} />
      </svg>
    </div>
  );
}

export function ChatWindow({ activeUser, messages, onBack, isHiddenOnMobile }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeUser]);

  // GSAP bubble entrance when switching users
  useGSAP(
    () => {
      if (!activeUser || !containerRef.current) return;
      const bubbles = containerRef.current.querySelectorAll('.message-bubble-wrapper');
      gsap.fromTo(
        bubbles,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out', clearProps: 'all' },
      );
    },
    { dependencies: [activeUser?.id] },
  );

  // Empty state
  if (!activeUser) {
    return (
      <div
        style={{
          flex: 1, display: 'none', position: 'relative',
          background: 'var(--color-main-bg)',
          alignItems: 'center', justifyContent: 'center',
        }}
        className="md:flex flex-col"
      >
        <HexWallpaper />
        <div style={{ zIndex: 10, textAlign: 'center', padding: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--color-secondary-bg)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <img src="/Images/Logo.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain', opacity: 0.5 }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '22px', color: 'var(--color-main-text)', marginBottom: '8px' }}>
            Support Hub
          </h2>
          <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', color: 'var(--color-secondary-text)', maxWidth: '300px', lineHeight: 1.7 }}>
            Select a conversation from the left to start helping users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, bottom: 0, right: 0,
        width: '100%',
        zIndex: 10,
        display: 'flex', flexDirection: 'column',
        background: 'var(--color-main-bg)',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: isHiddenOnMobile ? 'translateX(100%)' : 'translateX(0)',
      }}
      className="md:static md:translate-x-0 md:flex-1"
    >
      <HexWallpaper />

      {/* Chat header */}
      <div style={{
        position: 'relative', zIndex: 10,
        height: '64px', padding: '8px 16px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-glass-bg)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBack}
            className="md:hidden"
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', color: 'var(--color-secondary-text)',
              marginLeft: '-4px', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(235,113,43,0.1)'; e.currentTarget.style.color = '#EB712B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-secondary-text)'; }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src={activeUser.avatar} alt={activeUser.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', display: 'block', background: 'var(--color-secondary-bg)' }} />
            {activeUser.isOnline && (
              <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--color-main-bg)' }} />
            )}
          </div>

          <div>
            <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '15px', color: 'var(--color-main-text)', lineHeight: 1.2 }}>
              {activeUser.name}
            </h3>
            <span style={{ fontFamily: 'var(--font-roboto)', fontSize: '12px', color: 'var(--color-secondary-text)' }}>
              {activeUser.isOnline ? 'Online' : activeUser.lastSeen ? `Last seen ${activeUser.lastSeen}` : 'Offline'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[Video, Phone].map((Icon, i) => (
            <button key={i} style={{ display: 'none', width: '36px', height: '36px', borderRadius: '50%', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--color-secondary-text)', transition: 'all 0.2s' }}
              className="sm:flex"
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(235,113,43,0.08)'; e.currentTarget.style.color = '#EB712B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-secondary-text)'; }}
            >
              <Icon size={18} />
            </button>
          ))}
          <div style={{ width: '1px', height: '20px', background: 'var(--color-border)', margin: '0 4px' }} className="hidden sm:block" />
          <button style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--color-secondary-text)', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(235,113,43,0.08)'; e.currentTarget.style.color = '#EB712B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-secondary-text)'; }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Message feed */}
      <div
        ref={containerRef}
        style={{ position: 'relative', zIndex: 10, flex: 1, overflowY: 'auto', padding: '20px 20px 12px', display: 'flex', flexDirection: 'column' }}
        className="custom-scrollbar"
      >
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '8px', fontFamily: 'var(--font-roboto)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', color: 'var(--color-secondary-text)', background: 'var(--color-secondary-bg)', border: '1px solid var(--color-border)' }}>
            TODAY
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className="message-bubble-wrapper">
            <MessageBubble message={msg} />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ position: 'relative', zIndex: 10, padding: '12px 16px', background: 'var(--color-glass-bg)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '8px',
          background: 'var(--color-secondary-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: '18px', padding: '8px',
          transition: 'all 0.2s',
        }}
          onFocus={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(235,113,43,0.35)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 3px rgba(235,113,43,0.08)'; }}
          onBlur={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
        >
          {[Smile, Paperclip].map((Icon, i) => (
            <button key={i} style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-secondary-text)', flexShrink: 0, display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EB712B')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary-text)')}
            >
              <Icon size={22} />
            </button>
          ))}

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message"
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', maxHeight: '128px', minHeight: '40px', padding: '8px 0',
              fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'var(--color-main-text)',
              lineHeight: 1.5,
            }}
            className="custom-scrollbar"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputText.trim()) setInputText('');
              }
            }}
          />

          {inputText.trim() ? (
            <button
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                background: '#EB712B', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, border: 'none', marginBottom: '2px', marginRight: '2px',
                boxShadow: '0 4px 12px rgba(235,113,43,0.30)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.filter = 'brightness(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'brightness(1)'; }}
            >
              <Send size={18} style={{ marginLeft: '2px' }} />
            </button>
          ) : (
            <button style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-secondary-text)', flexShrink: 0, marginBottom: '2px', marginRight: '2px', display: 'flex', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#EB712B')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-secondary-text)')}
            >
              <Mic size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
