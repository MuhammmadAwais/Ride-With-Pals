/** ChatWindow — hexagon wallpaper, GSAP bubble entrance, message feed, input bar. Ported from admin panel. */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Send, Users } from 'lucide-react';
import { type ChatUser, type ChatMessage } from '../utils/constants';
import { MessageBubble } from './MessageBubble';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

interface ChatWindowProps {
  activeUser: ChatUser | null;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  onOpenProfile?: (uId: any) => void;
  isHiddenOnMobile: boolean;
}

/** SVG ambient wallpaper */
function ChatBackground(): React.ReactElement {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.03] dark:opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #EB712B 0%, transparent 70%)' }}
      />
    </div>
  );
}

export function ChatWindow({ activeUser, messages, onSendMessage, onBack, onOpenProfile, isHiddenOnMobile }: ChatWindowProps) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages (container scroll only, prevents jumping/scrolling parent window)
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
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
          flex: 1, position: 'relative',
          background: 'var(--color-main-bg)',
          alignItems: 'center', justifyContent: 'center',
        }}
        className={`md:flex flex-col ${isHiddenOnMobile ? 'hidden' : 'flex'}`}
      >
        <ChatBackground />
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
            Chat Messages
          </h2>
          <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', color: 'var(--color-secondary-text)', maxWidth: '300px', lineHeight: 1.7 }}>
            Select a conversation from the left to start chatting with other users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
        style={{
          top: 0, bottom: 0, right: 0,
          zIndex: 10,
          background: 'var(--color-main-bg)',
        }}
        className={`absolute w-full flex flex-col md:static md:w-auto md:flex-1 transition-transform duration-300 ${isHiddenOnMobile ? 'translate-x-full' : 'translate-x-0'} md:translate-x-0`}
      >
      <ChatBackground />

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

          <div 
            onClick={() => {
              if (activeUser.isGroup && activeUser.rideId) {
                navigate(`/view/userside/dashboard/ride/${activeUser.rideId}`);
                return;
              }
              const targetId = activeUser.targetUserId || activeUser.id;
              onOpenProfile?.(targetId.toString().startsWith('new-') ? targetId.toString().replace('new-', '') : targetId);
            }}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {activeUser.avatar && (
                <img
                  src={activeUser.avatar.startsWith('http') || activeUser.avatar.startsWith('data:') ? activeUser.avatar : `https://api.ridewithpals.com/uploads/${activeUser.avatar}`}
                  alt={activeUser.name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', display: 'block', background: 'var(--color-secondary-bg)' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              )}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: activeUser.isGroup ? 'rgba(235,113,43,0.25)' : 'rgba(235,113,43,0.2)',
                  color: '#EB712B',
                  border: '1px solid rgba(235,113,43,0.3)',
                  display: activeUser.avatar ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: 'var(--font-poppins)',
                }}
              >
                {activeUser.isGroup ? <Users size={18} /> : (activeUser.name || 'U').charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '15px', color: 'var(--color-main-text)', lineHeight: 1.2 }} className="group-hover:text-[#EB712B] transition-colors">
                  {activeUser.name}
                </h3>
                {activeUser.isGroup && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20">
                    Activity
                  </span>
                )}
              </div>
              <span style={{ fontFamily: 'var(--font-roboto)', fontSize: '12px', color: 'var(--color-secondary-text)' }}>
                {activeUser.isGroup 
                  ? `Activity Group Chat • ${activeUser.participantCount ? `${activeUser.participantCount} athletes` : 'Open Discussion'}`
                  : (activeUser.lastSeen ? `Last seen ${activeUser.lastSeen}` : 'Click to view profile')}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
            <MessageBubble message={msg} isGroup={activeUser?.isGroup} />
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
          {/* Emoji button removed to rely on native OS keyboard */}

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
                if (inputText.trim()) {
                  onSendMessage(inputText);
                  setInputText('');
                }
              }
            }}
          />

          <button
            onClick={() => {
              if (inputText.trim()) {
                onSendMessage(inputText);
                setInputText('');
              }
            }}
            disabled={!inputText.trim()}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: inputText.trim() ? '#EB712B' : 'var(--color-secondary-bg)', 
              color: inputText.trim() ? '#fff' : 'var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, border: 'none', marginBottom: '2px', marginRight: '2px',
              boxShadow: inputText.trim() ? '0 4px 12px rgba(235,113,43,0.30)' : 'none',
              transition: 'all 0.2s',
              cursor: inputText.trim() ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => { 
              if (inputText.trim()) {
                e.currentTarget.style.transform = 'scale(1.08)'; 
                e.currentTarget.style.filter = 'brightness(1.1)'; 
              }
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'scale(1)'; 
              e.currentTarget.style.filter = 'brightness(1)'; 
            }}
          >
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
