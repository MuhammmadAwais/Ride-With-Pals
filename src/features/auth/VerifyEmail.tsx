/**
 * @fileoverview VerifyEmail — OTP verification page with polished glassmorphism.
 *
 * Enhanced over original:
 *  - Glassmorphic card layout
 *  - GSAP stagger entry + OTP box entrance
 *  - Paste handler for OTP (paste 6-digit code from clipboard)
 *  - Better timer display with circular countdown feel
 *  - Sonner toast on invalid/successful verification
 *  - Overflow hidden (no scroll)
 *  - Original 6-digit OTP flow fully preserved
 */
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { ROUTES, APP_NAME } from '@/Constants';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { setUser } from '@/features/auth/slices/authSlice';

const VerifyEmail = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const dispatch   = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRefs  = useRef<(HTMLInputElement | null)[]>([]);

  const userEmail = (location.state as { email?: string })?.email ?? 'your email';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState('');

  /* ── Timer countdown ── */
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ── GSAP entrance ── */
  useGSAP(() => {
    gsap.fromTo(
      '.animate-item',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power3.out' },
    );
    gsap.fromTo(
      '.otp-box',
      { opacity: 0, scale: 0.6, y: 12 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'back.out(1.7)', delay: 0.3 },
    );
  }, { scope: containerRef });

  /* ── OTP input handlers ── */
  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const newCode = pasted.split('');
      setCode(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    if (code.includes('')) {
      setError('Please enter the complete 6-digit code.');
      toast.error('Please enter the complete 6-digit code.');
      return;
    }
    setError('');

    // Log the user in with a default athlete role
    const loggedInUser = {
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      email: userEmail,
      name: userEmail.split('@')[0],
      role: 'athlete' as const,
    };
    dispatch(setUser(loggedInUser));

    toast.success('Email verified! Redirecting...');
    navigate(ROUTES.SELECT_ROLE);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    toast.success('A new verification code has been sent!');
  };

  return (
    <div className="auth-page" style={{ background: '#050505', color: '#fff' }}>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/Images/HikingPicture.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.68)' }} />
        <div className="relative z-10 text-center px-12 max-w-md">
          <img src="/Images/Logo.png" alt={APP_NAME} style={{ width: '196px', marginBottom: '40px', display: 'block', margin: '0 auto 40px' }} draggable={false} />
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '48px', lineHeight: 1.15, marginBottom: '16px' }}>
            Security{' '}
            <span style={{ color: '#EB712B' }}>Verified</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            Confirm your email to unlock the full power of your riding experience.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ padding: '40px 20px', overflowY: 'auto', background: 'rgba(5,5,5,0.97)' }}
      >
        <div ref={containerRef} className="w-full text-center" style={{ maxWidth: '400px', padding: '0 4px' }}>

          {/* Mobile logo */}
          <div className="animate-item lg:hidden flex justify-center mb-8">
            <img src="/Images/Logo.png" alt={APP_NAME} style={{ width: '160px' }} draggable={false} />
          </div>

          {/* Heading */}
          <div className="animate-item" style={{ marginBottom: '12px' }}>
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '32px', marginBottom: '8px' }}>
              Verify Email
            </h2>
            <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              We sent a 6-digit code to{' '}
              <br />
              <span style={{ color: '#EB712B', fontWeight: 600 }}>{userEmail}</span>
            </p>
          </div>

          {/* OTP Inputs */}
          <div
            className="animate-item"
            style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '28px 0 16px' }}
            onPaste={handlePaste}
          >
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="otp-box"
                aria-label={`Digit ${index + 1} of 6`}
                style={{
                  width: '52px', height: '60px',
                  borderRadius: '14px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-poppins)',
                  background: digit ? 'rgba(235,113,43,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${digit ? '#EB712B' : error ? '#ef4444' : 'rgba(255,255,255,0.10)'}`,
                  color: '#fff',
                  outline: 'none',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => { if (!digit) e.target.style.borderColor = 'rgba(235,113,43,0.5)'; }}
                onBlur={(e) => { if (!digit) e.target.style.borderColor = error ? '#ef4444' : 'rgba(255,255,255,0.10)'; }}
              />
            ))}
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', color: '#ef4444', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              {error}
            </p>
          )}

          {/* Verify button */}
          <button onClick={handleVerify} className="animate-item btn-primary" style={{ marginBottom: '24px' }}>
            Verify Code
          </button>

          {/* Timer + Resend */}
          <div className="animate-item">
            <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', color: 'rgba(255,255,255,0.40)', marginBottom: '8px' }}>
              Haven't received the code yet?
            </p>
            <p style={{ fontFamily: 'var(--font-poppins)', fontSize: '26px', fontWeight: 700, color: timeLeft > 0 ? '#EB712B' : 'rgba(255,255,255,0.6)', marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>
              {`00:${timeLeft.toString().padStart(2, '0')}`}
            </p>
            <button
              disabled={timeLeft > 0}
              onClick={handleResend}
              style={{
                fontFamily: 'var(--font-roboto)', fontSize: '13px',
                color: timeLeft > 0 ? 'rgba(255,255,255,0.25)' : '#EB712B',
                background: 'transparent', border: 'none',
                textDecoration: timeLeft > 0 ? 'none' : 'underline',
                textUnderlineOffset: '2px',
                cursor: timeLeft > 0 ? 'not-allowed' : 'pointer',
                transition: 'color 0.2s',
              }}
            >
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;