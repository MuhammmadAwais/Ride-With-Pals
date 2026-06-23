/** CustomAudioPlayer — orange-themed audio bubble player. Ported from admin panel. */
import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface CustomAudioPlayerProps {
  src: string;
  duration?: number;
  isOutgoing: boolean;
}

export function CustomAudioPlayer({ src, duration = 0, isOutgoing }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [progress,      setProgress]      = useState(0);
  const [currentTime,   setCurrentTime]   = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };
    const onLoaded = () => {
      if (audio.duration && audio.duration !== Infinity) setTotalDuration(audio.duration);
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * totalDuration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
      setProgress(Number(e.target.value));
    }
  };

  const fmt = (t: number) => {
    if (isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const iconBg    = isOutgoing ? 'rgba(255,255,255,1)' : 'rgba(235,113,43,0.12)';
  const iconColor = isOutgoing ? '#EB712B' : '#EB712B';
  const trackBg   = isOutgoing ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.10)';
  const fillColor = isOutgoing ? '#FFFFFF' : '#EB712B';
  const textColor = isOutgoing ? 'rgba(255,255,255,0.80)' : 'var(--color-secondary-text)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '256px', minWidth: '200px' }}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        style={{
          width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: iconBg,
          transition: 'transform 0.2s',
          border: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        {isPlaying
          ? <Pause size={20} style={{ color: iconColor }} fill={iconColor} />
          : <Play  size={20} style={{ color: iconColor, marginLeft: '2px' }} fill={iconColor} />
        }
      </button>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Track */}
        <div style={{ position: 'relative', width: '100%', height: '6px', borderRadius: '999px', marginTop: '8px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '999px', background: trackBg }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${progress}%`, borderRadius: '999px', background: fillColor, transition: 'width 0.07s' }} />
          <input
            type="range" min="0" max="100" value={progress} onChange={handleSeek}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
        </div>

        {/* Times */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'var(--font-roboto)', fontSize: '11px', fontWeight: 500, color: textColor }}>
          <span>{fmt(currentTime)}</span>
          <span>{fmt(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}
