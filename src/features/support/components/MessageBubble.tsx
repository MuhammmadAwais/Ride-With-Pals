import { type ChatMessage } from '../utils/constants';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { Check, CheckCheck, User } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  isGroup?: boolean;
}

export function MessageBubble({ message, isGroup }: MessageBubbleProps) {
  const isOutgoing = message.senderId === 'me';

  const renderStatus = () => {
    if (!isOutgoing) return null;
    if (message.status === 'read')      return <CheckCheck size={14} style={{ color: '#93c5fd', marginLeft: '4px', flexShrink: 0 }} />;
    if (message.status === 'delivered') return <CheckCheck size={14} style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '4px', flexShrink: 0 }} />;
    return <Check size={14} style={{ color: 'rgba(255,255,255,0.7)', marginLeft: '4px', flexShrink: 0 }} />;
  };

  const renderContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <p style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', fontFamily: 'var(--font-roboto)', margin: 0 }}>
            {message.content}
          </p>
        );
      case 'image':
        return (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginTop: '4px', maxWidth: '320px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}
            className="group"
          >
            <img
              src={message.content}
              alt="Sent image"
              style={{ width: '100%', height: 'auto', aspectRatio: '16/10', objectFit: 'cover', display: 'block', transition: 'transform 0.5s' }}
              loading="lazy"
              className="group-hover:scale-[1.03]"
            />
          </div>
        );
      case 'video':
        return (
          <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginTop: '4px', maxWidth: '320px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
            <video
              src={message.content}
              controls
              controlsList="nodownload"
              style={{ width: '100%', height: 'auto', aspectRatio: '16/9', display: 'block' }}
            />
          </div>
        );
      case 'audio':
        return (
          <div style={{ marginTop: '4px' }}>
            <CustomAudioPlayer src={message.content} duration={message.duration} isOutgoing={isOutgoing} />
          </div>
        );
      default:
        return null;
    }
  };

  const displayName = message.senderName || 'Athlete';
  const showSenderInfo = !isOutgoing && isGroup;

  return (
    <div className={`flex w-full ${isOutgoing ? 'justify-end' : 'justify-start'} mb-3 items-end gap-2`}>
      {/* Sender Avatar for group chat received messages */}
      {showSenderInfo && (
        <div className="w-8 h-8 rounded-full shrink-0 overflow-hidden bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-[#EB712B]">
          {message.senderAvatar ? (
            <img 
              src={message.senderAvatar.startsWith('http') || message.senderAvatar.startsWith('data:') ? message.senderAvatar : `https://api.ridewithpals.com/uploads/${message.senderAvatar}`} 
              alt={displayName} 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            displayName.charAt(0).toUpperCase() || <User size={14} />
          )}
        </div>
      )}

      <div
        style={{
          maxWidth: '75%',
          borderRadius: '16px',
          padding: '8px 12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          position: 'relative',
          ...(isOutgoing
            ? { background: '#EB712B', color: '#fff', borderTopRightRadius: '3px' }
            : {
                background: 'var(--color-secondary-bg)',
                color: 'var(--color-main-text)',
                borderTopLeftRadius: '3px',
                border: '1px solid var(--color-border)',
              }
          ),
        }}
      >
        {/* Sender name label in group chat */}
        {showSenderInfo && (
          <div className="text-[11px] font-bold text-[#EB712B] mb-0.5 tracking-wide">
            {displayName}
          </div>
        )}

        {renderContent()}

        {/* Timestamp + status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', marginTop: '2px', fontFamily: 'var(--font-roboto)', fontSize: '10px', color: isOutgoing ? 'rgba(255,255,255,0.75)' : 'var(--color-secondary-text)' }}>
          <span>{message.timestamp}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}
