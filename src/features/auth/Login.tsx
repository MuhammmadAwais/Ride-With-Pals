/**
 * @fileoverview Login — Polished glassmorphism sign-in page.
 *
 * Enhancements over the original:
 *  - GSAP stagger entry on all form elements
 *  - Real Redux loginUser thunk (with loading state + error feedback)
 *  - Sonner toasts for success/error
 *  - Full email validation + password required check
 *  - overflow: hidden (no scroll on auth page)
 *  - Browser password reveal removed via CSS
 *  - CycleRock background image on left panel
 *  - Keeps original flow: Login → SelectRole
 */
import { useState, useRef, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import { useAppSelector } from '@/hooks/useAppSelector';
import { cn } from '@/lib/utils';
import { ROUTES, LOGIN_COPY, APP_NAME } from '@/Constants';
import { useFirebaseAuth } from '@/features/auth/hooks/useFirebaseAuth';

interface FormErrors {
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Login = () => {
  const navigate    = useNavigate();
  const location    = useLocation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user            = useAppSelector((s) => s.auth.user);

  const {
    loginWithEmail,
    loginWithGoogle,
    loginWithApple,
    isLoading,
    isGoogleLoading,
    isAppleLoading,
  } = useFirebaseAuth();
  const isAnyLoading = isLoading || isGoogleLoading || isAppleLoading;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (Number(user.isAthleteProfile) !== 1) {
        navigate('/create-profile', { replace: true });
        return;
      }
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors,       setErrors]       = useState<FormErrors>({});

  /* ── GSAP stagger entry ── */
  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.brand-side', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2 })
      .fromTo('.animate-item', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.1 }, '-=0.7');
  }, { scope: containerRef });

  /* ── Validation ── */
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!EMAIL_REGEX.test(email.trim())) errs.email = 'Please enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  /* ── Submit ── */
  const handleLogin = async () => {
    if (!validate()) return;

    try {
      const res = await loginWithEmail(email.trim().toLowerCase(), password);
      toast.success(LOGIN_COPY.SUCCESS_MESSAGE);
      
      if (Number(res?.isAthleteProfile) !== 1) {
        navigate('/create-profile', { replace: true });
        return;
      }

      // Navigate to destination or dashboard
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    } catch (err: any) {
      const errorMsg = err?.message || LOGIN_COPY.INVALID_CREDENTIALS;
      toast.error(errorMsg);
      setErrors({ password: errorMsg });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await loginWithGoogle();
      if (res) {
        toast.success(LOGIN_COPY.SUCCESS_MESSAGE);
        if (Number(res?.isAthleteProfile) !== 1) {
          navigate('/create-profile', { replace: true });
          return;
        }
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        navigate(from ?? '/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Google sign-in failed.');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const res = await loginWithApple();
      if (res) {
        toast.success(LOGIN_COPY.SUCCESS_MESSAGE);
        if (Number(res?.isAthleteProfile) !== 1) {
          navigate('/create-profile', { replace: true });
          return;
        }
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
        navigate(from ?? '/dashboard', { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Apple sign-in failed.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="auth-page" style={{ background: '#050505', color: '#fff' }}>

      {/* ══ LEFT PANEL ══ */}
      <div className="brand-side hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/Images/CycleRock2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay — flat, solid, high contrast for maximum maturity */}
        <div className="absolute inset-0" style={{ background: 'rgba(5,5,5,0.72)' }} />

        {/* Small subtle static accent glow in the left panel corner to feel premium but mature */}
        <div
          className="absolute -top-10 -left-10 w-60 h-60 rounded-full"
          style={{ background: 'rgba(235,113,43,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }}
        />

        <div className="relative z-10 text-center px-12 max-w-md">
          <img src="/Images/Logo.png" alt={APP_NAME} style={{ width: '196px', marginBottom: '40px', display: 'block', margin: '0 auto 40px' }} draggable={false} />
          <h1 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '52px', lineHeight: 1.1, marginBottom: '16px' }}>
            {LOGIN_COPY.HEADING}
          </h1>
          <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '16px', color: 'rgba(255,255,255,0.60)', lineHeight: 1.7 }}>
            {LOGIN_COPY.LEFT_TAGLINE}
          </p>
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center relative"
        style={{ padding: '40px 20px', overflowY: 'auto', background: '#050505' }}
      >
        {/* Faint elegant glow centered behind the form card to add depth without being flashy */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '360px',
            height: '360px',
            background: 'radial-gradient(circle, rgba(235,113,43,0.02) 0%, rgba(5,5,5,0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <div ref={containerRef} className="w-full relative z-10" style={{ maxWidth: '460px', padding: '0 4px' }}>

          {/* Mobile logo */}
          <div className="animate-item lg:hidden flex justify-center mb-8">
            <img src="/Images/Logo.png" alt={APP_NAME} style={{ width: '180px' }} draggable={false} />
          </div>

          {/* Heading */}
          <div className="animate-item mb-8">
            <h2 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 800, fontSize: '34px', marginBottom: '6px' }}>
              {LOGIN_COPY.SUBHEADING}
            </h2>
            <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
              {LOGIN_COPY.SUBHEADING}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* Email */}
            <div className="animate-item">
              <label style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginLeft: '4px', display: 'block', marginBottom: '6px' }}>
                {LOGIN_COPY.EMAIL_LABEL}
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: errors.email ? '#ef4444' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  onKeyDown={handleKeyDown}
                  placeholder={LOGIN_COPY.EMAIL_PLACEHOLDER}
                  autoComplete="email"
                  className={cn('field', errors.email && 'field-error')}
                  style={{ paddingLeft: '44px' }}
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="field-error-text"><AlertCircle size={12} /> {errors.email}</p>}
            </div>

            {/* Password */}
            <div className="animate-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                <label style={{ fontFamily: 'var(--font-roboto)', fontSize: '13px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', marginLeft: '4px' }}>
                  {LOGIN_COPY.PASSWORD_LABEL}
                </label>
                <span
                  onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
                  style={{ fontFamily: 'var(--font-roboto)', fontSize: '12px', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EB712B')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#ef4444' : 'rgba(255,255,255,0.3)', transition: 'color 0.2s' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  onKeyDown={handleKeyDown}
                  placeholder={LOGIN_COPY.PASSWORD_PLACEHOLDER}
                  autoComplete="current-password"
                  className={cn('field', errors.password && 'field-error')}
                  style={{ paddingLeft: '44px', paddingRight: '48px' }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', background: 'transparent', border: 'none', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EB712B')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <p className="field-error-text"><AlertCircle size={12} /> {errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={isAnyLoading}
              className="animate-item btn-primary"
              style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {LOGIN_COPY.SUBMITTING_LABEL}
                </>
              ) : LOGIN_COPY.SUBMIT_LABEL}
            </button>

            {/* Divider */}
            <div
              className="animate-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                margin: '6px 0',
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'rgba(255,255,255,0.08)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-roboto)',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap',
                }}
              >
                Or sign in with
              </span>
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: 'rgba(255,255,255,0.08)',
                }}
              />
            </div>

            {/* Social buttons */}
            <div
              className="animate-item"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAnyLoading}
                style={{
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontFamily: 'var(--font-roboto)',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  transition: 'all 0.2s',
                  cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                  opacity: isAnyLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isAnyLoading) {
                    e.currentTarget.style.borderColor = 'rgba(235,113,43,0.45)';
                    e.currentTarget.style.background = 'rgba(235,113,43,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                {isGoogleLoading ? (
                  <Loader2 size={18} className="animate-spin text-[#EB712B]" />
                ) : (
                  <>
                    <img
                      src="/Images/google-logo.png"
                      alt="Google"
                      style={{
                        width: '20px',
                        height: '20px',
                        objectFit: 'contain',
                      }}
                    />
                    Google
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAppleLogin}
                disabled={isAnyLoading}
                style={{
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontFamily: 'var(--font-roboto)',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.8)',
                  transition: 'all 0.2s',
                  cursor: isAnyLoading ? 'not-allowed' : 'pointer',
                  opacity: isAnyLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isAnyLoading) {
                    e.currentTarget.style.borderColor = 'rgba(235,113,43,0.45)';
                    e.currentTarget.style.background = 'rgba(235,113,43,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
              >
                {isAppleLoading ? (
                  <Loader2 size={18} className="animate-spin text-[#EB712B]" />
                ) : (
                  <>
                    <img
                      src="/Images/apple-logo.png"
                      alt="Apple"
                      style={{
                        width: '20px',
                        height: '20px',
                        objectFit: 'contain',
                      }}
                    />
                    Apple
                  </>
                )}
              </button>
            </div>

            {/* Sign up link */}
            <p className="animate-item" style={{ textAlign: 'center', fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'rgba(255,255,255,0.40)', marginTop: '4px' }}>
              Don't have an account?{' '}
              <span
                onClick={() => navigate(ROUTES.SIGNUP)}
                className="hover:cursor-pointer"
                style={{ color: '#EB712B', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px', cursor: 'pointer' }}
              >
                Sign up
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;