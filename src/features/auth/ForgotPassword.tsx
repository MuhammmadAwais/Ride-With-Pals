/**
 * @fileoverview ForgotPassword — Polished glassmorphism reset page.
 *
 * Enhanced:
 *  - Email validation + toast feedback
 *  - Success state (shows confirmation card after submission)
 *  - GSAP stagger entry
 *  - Background image on left panel
 *  - Overflow hidden
 */
import { useState, useRef } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ROUTES, APP_NAME } from '@/Constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.brand-side', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.1 })
      .fromTo('.animate-item', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, '-=0.65');
  }, { scope: containerRef });

  const handleReset = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    // Simulate API call
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    setSubmitted(true);
    toast.success('Password reset link sent! Check your inbox.');
  };

  return (
    <div className="auth-page" style={{ background: '#050505', color: '#fff' }}>

      {/* LEFT PANEL */}
      <div className="brand-side hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'url(/Images/MountainIamge2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.65)' }} />
        <div className="relative z-10 text-center px-12 max-w-md">
          <img src="/Images/Logo.png" alt={APP_NAME} style={{ width: '196px', marginBottom: '40px', display: 'block', margin: '0 auto 40px' }} draggable={false} />
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '48px', lineHeight: 1.15, marginBottom: '16px' }}>
            Reset Your<br />
            <span style={{ color: '#EB712B' }}>Access</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '15px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
            No worries — it happens to the best of us. We'll send you a secure reset link.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ padding: '40px 20px', overflowY: 'auto', background: 'rgba(5,5,5,0.97)' }}
      >
        <div ref={containerRef} className="w-full" style={{ maxWidth: '460px', padding: '0 4px' }}>

          {/* Mobile logo */}
          <div className="animate-item lg:hidden flex justify-center mb-8">
            <img src="/Images/Logo.png" alt={APP_NAME} style={{ width: '180px' }} draggable={false} />
          </div>

          {!submitted ? (
            <>
              {/* Back + Heading */}
              <div className="animate-item" style={{ marginBottom: '32px' }}>
                <button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    color: 'rgba(255,255,255,0.7)', marginBottom: '24px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(235,113,43,0.12)'; e.currentTarget.style.borderColor = 'rgba(235,113,43,0.3)'; e.currentTarget.style.color = '#EB712B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '34px', marginBottom: '8px' }}>
                  Forgot Password?
                </h2>
                <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  Enter your email and we'll send you a secure link to reset your password.
                </p>
              </div>

              {/* Email field */}
              <div className="animate-item" style={{ marginBottom: '20px' }}>
                <label style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginLeft: '4px', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                    placeholder="rider@ridewithpals.com"
                    autoComplete="email"
                    className={cn('field', error && 'field-error')}
                    style={{ paddingLeft: '44px' }}
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="field-error-text"><AlertCircle size={12} /> {error}</p>}
              </div>

              {/* Submit */}
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="animate-item btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending Link...</> : 'Send Reset Link'}
              </button>
            </>
          ) : (
            /* Success state */
            <div className="animate-item text-center">
              <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
              }}>
                <CheckCircle size={34} color="#22c55e" />
              </div>
              <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '28px', marginBottom: '8px' }}>
                Email Sent!
              </h2>
              <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, marginBottom: '32px' }}>
                We sent a password reset link to{' '}
                <span style={{ color: '#EB712B', fontWeight: 600 }}>{email}</span>.
                Check your inbox (and spam folder).
              </p>
              <button onClick={() => navigate(ROUTES.LOGIN)} className="btn-primary">
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;