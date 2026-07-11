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
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ROUTES, APP_NAME } from '@/Constants';
import { useAuth } from '@/features/auth/hooks/useAuth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { handleForgotPassword, handleValidateOtp, handleChangePassword, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Steps: 'email' -> 'otp' -> 'password' -> 'success'
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [tempToken, setTempToken] = useState(''); // Token received after sending OTP
  const [resetToken, setResetToken] = useState(''); // Token received after validating OTP

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.brand-side', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.1 })
      .fromTo('.animate-item', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, '-=0.65');
  }, { scope: containerRef });

  const handleSendOtp = async () => {
    if (!EMAIL_REGEX.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    try {
      const token = await handleForgotPassword(email.trim());
      setTempToken(token);
      setStep('otp');
    } catch (err) {
      // Error is already toasted by useAuth
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      setError('Please enter a valid OTP.');
      return;
    }
    setError('');
    try {
      const token = await handleValidateOtp(Number(otp), tempToken);
      setResetToken(token);
      setStep('password');
    } catch (err) {
      // Error handled
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    try {
      await handleChangePassword(newPassword, resetToken);
      setStep('success');
    } catch (err) {
      // Error handled
    }
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

          {step === 'email' && (
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
                  Enter your email and we'll send you an OTP to reset your password.
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
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
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
                onClick={handleSendOtp}
                disabled={isLoading}
                className="animate-item btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : 'Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="animate-item" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '34px', marginBottom: '8px' }}>
                  Enter OTP
                </h2>
                <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  We sent a code to <span style={{ color: '#EB712B' }}>{email}</span>.
                </p>
              </div>

              <div className="animate-item" style={{ marginBottom: '20px' }}>
                <label style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginLeft: '4px', display: 'block', marginBottom: '6px' }}>
                  OTP Code
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                    placeholder="Enter OTP"
                    className={cn('field', error && 'field-error')}
                    style={{ paddingLeft: '16px' }}
                    disabled={isLoading}
                  />
                </div>
                {error && <p className="field-error-text"><AlertCircle size={12} /> {error}</p>}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isLoading}
                className="animate-item btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</> : 'Verify OTP'}
              </button>
            </>
          )}

          {step === 'password' && (
            <>
              <div className="animate-item" style={{ marginBottom: '32px' }}>
                <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '34px', marginBottom: '8px' }}>
                  New Password
                </h2>
                <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                  Create a new strong password.
                </p>
              </div>

              <div className="animate-item" style={{ marginBottom: '20px' }}>
                <label style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginLeft: '4px', display: 'block', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdatePassword()}
                    placeholder="Min 8 characters"
                    className={cn('field', error && 'field-error')}
                    style={{ paddingLeft: '44px', paddingRight: '48px' }}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', background: 'transparent', border: 'none' }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {error && <p className="field-error-text"><AlertCircle size={12} /> {error}</p>}
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={isLoading}
                className="animate-item btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {isLoading ? <><Loader2 size={18} className="animate-spin" /> Updating...</> : 'Update Password'}
              </button>
            </>
          )}

          {step === 'success' && (
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
                Password Updated!
              </h2>
              <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, marginBottom: '32px' }}>
                Your password has been successfully reset.
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