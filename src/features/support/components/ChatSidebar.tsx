/** ChatSidebar — user list with search + unread badge. Ported from admin panel. */
import React, { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { type ChatUser } from '../utils/constants';

interface ChatSidebarProps {
  users: ChatUser[];
  activeUserId: string | null;
  onSelectUser: (id: string | null) => void;
  isHiddenOnMobile: boolean;
}

function HighlightText({ text, query }: { text: string; query: string }): React.ReactElement {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: 'rgba(235,113,43,0.25)', borderRadius: '2px', padding: '0 1px', color: 'inherit', fontWeight: 700 }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function ChatSidebar({ users, activeUserId, onSelectUser, isHiddenOnMobile }: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      style={{
        top: 0, bottom: 0, left: 0,
        zIndex: 20,
      }}
      className={`absolute w-full flex flex-col md:static md:w-[320px] lg:w-[340px] md:flex-shrink-0 transition-transform duration-300 ${isHiddenOnMobile ? '-translate-x-full' : 'translate-x-0'} md:translate-x-0 bg-surface border-r border-border h-full select-none`}
    >
      {/* 1. Header (Click to navigate back to overview / deselect) */}
      <div 
        onClick={() => onSelectUser(null)}
        className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-md cursor-pointer hover:bg-hover transition-colors group/hdr"
        title="Click to view message center overview"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-poppins font-extrabold text-base text-text-main tracking-wide group-hover/hdr:text-[#EB712B] transition-colors">
            Messages
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-[#EB712B]/15 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-extrabold">
            {users.length}
          </span>
        </div>
      </div>

      {/* 2. Search Toolbar */}
      <div className="p-3 border-b border-border bg-surface shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="search"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-main-bg border border-border focus:border-[#EB712B]/60 text-xs font-semibold text-text-main placeholder:text-text-muted outline-none transition-all"
          />
        </div>
      </div>

      {/* 3. User list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
        {filteredUsers.map((user) => {
          const isActive = user.id === activeUserId;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onSelectUser(user.id)}
              className={`w-full p-3.5 flex items-center gap-3 transition-all text-left cursor-pointer border-l-2 ${
                isActive 
                  ? 'bg-[#EB712B]/10 border-l-[#EB712B] text-text-main' 
                  : 'bg-transparent border-l-transparent hover:bg-hover text-text-muted hover:text-text-main'
              }`}
            >
              {/* Avatar + online dot */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {user.avatar && (
                  <img
                    src={user.avatar.startsWith('http') || user.avatar.startsWith('data:') ? user.avatar : `https://api.ridewithpals.com/uploads/${user.avatar}`}
                    alt=""
                    className="w-11 h-11 rounded-2xl object-cover block"
                    style={{ background: 'var(--color-secondary-bg)', display: 'block' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/30 flex items-center justify-center text-[#EB712B] font-black text-[14px] font-poppins shadow-md"
                  style={{ display: user.avatar ? 'none' : 'flex', flexShrink: 0 }}
                >
                  {user.isGroup ? <Users size={17} /> : (user.name || 'U').charAt(0).toUpperCase()}
                </div>
                {user.isOnline && (
                  <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--color-secondary-bg)' }} />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: 1 }}>
                    {user.isGroup && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '3px', 
                        padding: '1px 6px', 
                        borderRadius: '6px', 
                        fontSize: '9px', 
                        fontWeight: 800, 
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: '#EB712B', 
                        background: 'rgba(235,113,43,0.12)', 
                        border: '1px solid rgba(235,113,43,0.25)', 
                        flexShrink: 0 
                      }}>
                        <Users size={9} />
                        Group
                      </span>
                    )}
                    <h4 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600, fontSize: '14px', color: 'var(--color-main-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <HighlightText text={user.name} query={searchTerm} />
                    </h4>
                  </div>
                  <span style={{ fontFamily: 'var(--font-roboto)', fontSize: '11px', color: isActive ? '#EB712B' : 'var(--color-secondary-text)', flexShrink: 0, marginLeft: '8px' }}>
                    {user.lastMessageTime}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '12px', color: 'var(--color-secondary-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <HighlightText text={user.lastMessage} query={searchTerm} />
                  </p>
                  {user.unreadCount > 0 && (
                    <div style={{ flexShrink: 0, minWidth: '20px', height: '20px', borderRadius: '999px', background: '#EB712B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                      <span style={{ fontFamily: 'var(--font-poppins)', fontSize: '10px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                        {user.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <p style={{ textAlign: 'center', padding: '32px 16px', fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'var(--color-secondary-text)' }}>
            No matches found.
          </p>
        )}
      </div>
    </div>
  );
}
