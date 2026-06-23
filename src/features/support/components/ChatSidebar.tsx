/** ChatSidebar — user list with search + unread badge. Ported from admin panel. */
import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
        position: 'absolute',
        width: '100%',
        top: 0, bottom: 0, left: 0,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--color-border)',
        background: 'var(--color-glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
        transform: isHiddenOnMobile ? 'translateX(-100%)' : 'translateX(0)',
      }}
      className="md:static md:translate-x-0"
    >
      {/* Header + Search */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '20px', color: 'var(--color-main-text)', marginBottom: '12px', padding: '0 4px' }}>
          Messages
        </h3>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-secondary-text)', pointerEvents: 'none' }} />
          <input
            type="search"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '9px 16px 9px 34px',
              borderRadius: '999px',
              background: 'var(--color-secondary-bg)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-main-text)',
              fontFamily: 'var(--font-roboto)',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(235,113,43,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(235,113,43,0.08)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* User list */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }} className="custom-scrollbar">
        {filteredUsers.map((user) => {
          const isActive = user.id === activeUserId;
          return (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              style={{
                width: '100%',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid var(--color-border)',
                background: isActive ? 'rgba(235,113,43,0.08)' : 'transparent',
                transition: 'background 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--color-hover)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Avatar + online dot */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', display: 'block', background: 'var(--color-secondary-bg)' }}
                />
                {user.isOnline && (
                  <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '2px solid var(--color-main-bg)' }} />
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <h4 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 600, fontSize: '14px', color: 'var(--color-main-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <HighlightText text={user.name} query={searchTerm} />
                  </h4>
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
