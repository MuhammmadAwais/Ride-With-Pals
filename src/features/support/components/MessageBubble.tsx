import { type ChatMessage } from '../utils/constants';
import { CustomAudioPlayer } from './CustomAudioPlayer';
import { Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
          <p style={{ fontSize: '15px', lineHeight: 1.55, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-poppins)', margin: 0 }}>
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

  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: isOutgoing ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
      <div
        style={{
          maxWidth: '85%',
          borderRadius: '18px',
          padding: '10px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          position: 'relative',
          ...(isOutgoing
            ? { background: '#EB712B', color: '#fff', borderTopRightRadius: '4px' }
            : {
                background: 'var(--color-secondary-bg)',
                color: 'var(--color-main-text)',
                borderTopLeftRadius: '4px',
                border: '1px solid var(--color-border)',
              }
          ),
        }}
      >
        {renderContent()}

        {/* Timestamp + status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px', marginTop: '4px', fontFamily: 'var(--font-roboto)', fontSize: '10px', color: isOutgoing ? 'rgba(255,255,255,0.75)' : 'var(--color-secondary-text)' }}>
          <span>{message.timestamp}</span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
}
