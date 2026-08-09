import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAppSelector } from '@/hooks/useAppSelector';

// Import newly converted native React sections
import { Navigation } from './components/Navigation';
import { HeroSection } from './components/HeroSection';
import { HowitWorksSection } from './components/HowitWorksSection';
import { BentoSection } from './components/BentoSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ComparisonSection } from './components/ComparisonSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { BlogSection } from './components/BlogSection';
import { CTASection } from './components/CTASection';
import { FooterSection } from './components/FooterSection';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  // CSS + Loading Screen: inject Framer CSS and dismiss the native loading screen
  // ONLY after the stylesheet has fully loaded. This prevents avatar images flashing
  // before Framer's positioning/opacity styles are applied.
  useEffect(() => {
    const dismissLoadingScreen = () => {
      const loadingScreen = document.getElementById('app-loading-screen');
      if (loadingScreen) {
        loadingScreen.style.transition = 'opacity 0.25s ease';
        loadingScreen.style.opacity = '0';
        setTimeout(() => loadingScreen.remove(), 280);
      }
    };

    // Inject hover/base styles immediately (inline — no network request)
    const hoverCssId = 'clario-landing-hover-css';
    if (!document.getElementById(hoverCssId)) {
      const style = document.createElement('style');
      style.id = hoverCssId;
      style.innerHTML = `
        .clario-landing-wrapper {
          width: 100vw;
          max-width: 100%;
          overflow-x: hidden;
          background: #050505;
          min-height: 100vh;
          position: relative;
        }
        
        /* Dedicated Grid Background layer */
        .clario-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }
        
        /* Base faint grid */
        .clario-grid-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-size: 64px 64px;
          background-position: center center;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        
        /* Bright spotlight grid */
        .clario-grid-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-size: 64px 64px;
          background-position: center center;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          
          /* The fading spotlight radius effect tracking --mouse-x, --mouse-y */
          mask-image: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent);
          -webkit-mask-image: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent);
          
          opacity: 0;
          transition: opacity 0.5s;
        }
        .clario-landing-wrapper:hover .clario-grid-bg::after {
          opacity: 1;
        }
        /* All landing sections sit above the grid */
        .clario-landing-wrapper > div:not(.clario-grid-bg),
        .clario-landing-wrapper section {
          position: relative;
          z-index: 1;
        }
        /* Hero image specifically above grid */
        #hero-screen {
          position: relative;
          z-index: 2;
        }
        #__framer-badge-container, 
        .framer-badge,
        [href*="framer.com/badge"],
        [href*="framer.link"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .clario-landing-wrapper a, .clario-landing-wrapper button {
          transition: transform 0.2s ease, opacity 0.2s ease !important;
        }
        .clario-landing-wrapper a:hover, .clario-landing-wrapper button:hover {
          transform: translateY(-2px) scale(1.02);
          opacity: 0.9;
          cursor: pointer;
        }
        .faq-answer {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .faq-answer.open {
          max-height: 500px;
          opacity: 1;
          margin-top: 10px;
        }
      `;
      document.head.appendChild(style);
    }

    // Inject Framer stylesheet — dismiss loading screen only AFTER it loads
    const cssId = 'clario-landing-css';
    const existingLink = document.getElementById(cssId) as HTMLLinkElement | null;
    if (existingLink) {
      // Already loaded on a previous visit (e.g. HMR), dismiss immediately
      dismissLoadingScreen();
    } else {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = '/landing/styles.css';
      // Dismiss ONLY after CSS is applied — this is the key fix
      link.onload = dismissLoadingScreen;
      // Safety fallback: if CSS errors (404 etc.) don't hang forever
      link.onerror = dismissLoadingScreen;
      document.head.appendChild(link);
    }

    return () => {
      const link = document.getElementById(cssId);
      if (link) link.remove();
      const style = document.getElementById(hoverCssId);
      if (style) style.remove();
    };
  }, []);

  // Auth Redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // 3. Attach Event Listeners to Buttons and FAQs
  useEffect(() => {
    const handleLoginClick = (e: MouseEvent) => {
      e.preventDefault();
      navigate('/login');
    };

    const handleSignupClick = (e: MouseEvent) => {
      e.preventDefault();
      navigate('/signup');
    };

    const handleHomeClick = (e: MouseEvent) => {
      e.preventDefault();
      navigate('/');
    };

    const loginBtn = document.getElementById('landing-login-btn');
    const signupBtn = document.getElementById('landing-signup-btn');
    const homeBtn = document.getElementById('landing-home-btn');

    if (loginBtn) loginBtn.addEventListener('click', handleLoginClick);
    if (signupBtn) signupBtn.addEventListener('click', handleSignupClick);
    if (homeBtn) homeBtn.addEventListener('click', handleHomeClick);

    // Track mouse for spotlight grid effect with 60fps requestAnimationFrame optimization
    let rAF_ID: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rAF_ID) return; // wait for next frame
      
      rAF_ID = requestAnimationFrame(() => {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          container.style.setProperty('--mouse-x', `${x}px`);
          container.style.setProperty('--mouse-y', `${y}px`);
        }
        rAF_ID = null;
      });
    };
    
    const wrapper = containerRef.current;
    if (wrapper) {
      wrapper.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (loginBtn) loginBtn.removeEventListener('click', handleLoginClick);
      if (signupBtn) signupBtn.removeEventListener('click', handleSignupClick);
      if (homeBtn) homeBtn.removeEventListener('click', handleHomeClick);
      if (wrapper) wrapper.removeEventListener('mousemove', handleMouseMove);
    };
  }, [navigate]);

  // 4. GSAP ScrollTrigger Animations
  useGSAP(() => {
    if (!containerRef.current) return;

    const initAnimations = () => {
      // ── NAV ──────────────────────────────────────────────────────────
      gsap.fromTo(
        'nav',
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }
      );

      // ── HERO TEXT ─────────────────────────────────────────────────────
      const heroSection = document.querySelector('#home');
      if (heroSection) {
        gsap.fromTo(
          heroSection.querySelectorAll('h1'),
          { y: 80, opacity: 0, skewY: 3 },
          { y: 0, opacity: 1, skewY: 0, duration: 1.1, stagger: 0.12, ease: 'expo.out', delay: 0.2 }
        );
        gsap.fromTo(
          heroSection.querySelectorAll('p, a, button'),
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out', delay: 0.5 }
        );
      }

      // ── HERO IMAGE — SCROLL STRAIGHTEN ────────────────────────────────
      // Use gsap.set to give GSAP FULL ownership of transforms from frame 1.
      // This prevents the grid from flashing through during any handoff state.
      const heroScreen = document.getElementById('hero-screen');
      if (heroScreen) {
        // Remove inline style transform so GSAP owns it from the start
        heroScreen.style.transform = '';
        // Now tell GSAP what the starting state is
        gsap.set(heroScreen, {
          rotateX: 19.15,
          scale: 1.12767,
          transformPerspective: 1200,
          transformOrigin: '50% 50%',
          force3D: true,
        });
        // Scrub to flat as user scrolls past hero
        gsap.to(heroScreen, {
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: '+=600',
            scrub: 2,
          },
          rotateX: 0,
          scale: 1,
          ease: 'none',
          force3D: true,
        });
      }


      // ── SECTION LABELS (orange pill badges) ──────────────────────────
      gsap.utils.toArray<HTMLElement>('.rwp-hiw-label, .rwp-fs-label, .rwp-pricing-badge, .rwp-footer-btn').forEach((el) => {
        gsap.fromTo(el,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      });

      // ── SECTION TITLES (h2) — split words fall from void ─────────────
      gsap.utils.toArray<HTMLElement>('h2').forEach((h2) => {
        gsap.fromTo(h2,
          { y: 80, opacity: 0, skewY: 4 },
          {
            y: 0, opacity: 1, skewY: 0, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: h2, start: 'top 88%', toggleActions: 'play none none none' }
          }
        );
      });

      // ── HOW IT WORKS — sequential step reveal ─────────────────────────
      gsap.utils.toArray<HTMLElement>('.rwp-hiw-step, .rwp-hiw-card').forEach((el, i) => {
        gsap.fromTo(el,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
            delay: i * 0.12,
          }
        );
      });

      // ── BENTO CARDS — stagger from bottom ────────────────────────────
      const bentoSection = document.querySelector('#bento-features');
      if (bentoSection) {
        // Target only immediate Framer children, not every nested div
        const cards = Array.from(bentoSection.children).filter(
          el => el.tagName !== 'STYLE'
        );
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { y: 80, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: 'power3.out',
              scrollTrigger: { trigger: bentoSection, start: 'top 80%', toggleActions: 'play none none none' }
            }
          );
        }
      }

      // ── FEATURES CARDS ────────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.rwp-fc, .rwp-features-card').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 60, opacity: 0, rotateY: 5 },
          {
            y: 0, opacity: 1, rotateY: 0, duration: 0.9, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
            delay: (i % 3) * 0.1,
          }
        );
      });

      // ── PRICING CARDS — stagger in ────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('.rwp-pc').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 100, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1, ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' },
            delay: i * 0.15,
          }
        );
      });

      // ── TESTIMONIAL CARDS ─────────────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('[class*="framer-"][data-framer-name*="Card"], [class*="framer-"][data-framer-name*="Testimonial"]').forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' },
            delay: i * 0.1,
          }
        );
      });

      // ── CTA SECTION ───────────────────────────────────────────────────
      const ctaSection = document.querySelector('#cta');
      if (ctaSection) {
        gsap.fromTo(ctaSection,
          { scale: 0.94, opacity: 0 },
          {
            scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out',
            scrollTrigger: { trigger: ctaSection, start: 'top 80%', toggleActions: 'play none none none' }
          }
        );
      }

      // ── FOOTER TITLE — big word split from void ───────────────────────
      const footerTitle = document.getElementById('footer-main-title');
      if (footerTitle) {
        const wordSpans = footerTitle.querySelectorAll('.footer-word');
        gsap.fromTo(wordSpans,
          { y: 60, opacity: 0, skewY: 4 },
          {
            y: 0, opacity: 1, skewY: 0, duration: 1.1, stagger: 0.18, ease: 'expo.out',
            scrollTrigger: { trigger: footerTitle, start: 'top 92%', toggleActions: 'play none none none' }
          }
        );
      }

      // ── FOOTER GRID LINKS ─────────────────────────────────────────────
      const footerGrid = document.querySelector('.rwp-footer-grid');
      if (footerGrid) {
        gsap.fromTo(footerGrid.querySelectorAll('.rwp-footer-col'),
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out',
            scrollTrigger: { trigger: footerGrid, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      }

      // ── ORANGE ACCENT LINES — slide in from left ──────────────────────
      gsap.utils.toArray<HTMLElement>('.rwp-fs-label-line, .rwp-hiw-label-line').forEach((line) => {
        gsap.fromTo(line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1, duration: 0.6, ease: 'power2.out',
            scrollTrigger: { trigger: line, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      });

      // ── IMAGES — subtle parallax ──────────────────────────────────────
      gsap.utils.toArray<HTMLElement>('img:not(#hero-screen img)').forEach((img) => {
        gsap.to(img, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      });

      ScrollTrigger.refresh();
    };

    // ── MICRO-INTERACTIONS: 3D tilt on cards ──────────────────────────
    const setupCardTilt = () => {
      const cards = document.querySelectorAll<HTMLElement>('.rwp-pc, .rwp-fc, .rwp-bento-card');
      cards.forEach((card) => {
        const handleMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rotX = ((y - cy) / cy) * -6;
          const rotY = ((x - cx) / cx) * 6;
          card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
          card.style.transition = 'transform 0.1s linear';
        };
        const handleLeave = () => {
          card.style.transform = '';
          card.style.transition = 'transform 0.5s ease';
        };
        card.addEventListener('mousemove', handleMove);
        card.addEventListener('mouseleave', handleLeave);
      });
    };

    // ── MICRO-INTERACTIONS: magnetic buttons ──────────────────────────
    const setupMagneticButtons = () => {
      const btns = document.querySelectorAll<HTMLElement>('.rwp-footer-btn, .rwp-pricing-cta, #landing-signup-btn');
      btns.forEach((btn) => {
        const handleMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3, ease: 'power2.out' });
        };
        const handleLeave = () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
        };
        btn.addEventListener('mousemove', handleMove);
        btn.addEventListener('mouseleave', handleLeave);
      });
    };

    // ── Kick off animations ──────────────────────────────────────────
    // Don't gate on images — Framer CSS loads them lazily anyway.
    // Just give the DOM one frame to paint before measuring positions.
    const raf = requestAnimationFrame(() => {
      try {
        initAnimations();
      } catch (e) {
        console.warn('[GSAP] initAnimations error:', e);
      }
      setTimeout(setupCardTilt, 600);
      setTimeout(setupMagneticButtons, 600);
    });

    return () => cancelAnimationFrame(raf);
  }, { scope: containerRef });


  return (
    <div ref={containerRef} className="clario-landing-wrapper">
      <div className="clario-grid-bg" />
      <div id="main" className="framer-K8Bhh" style={{ display: 'contents' }}>
        <div className="framer-xvlLx framer-c5oytb" style={{ display: 'contents' }}>
          <Navigation />
          <div className="framer-iDUXM framer-VE8XF framer-R82EX framer-hFyMR framer-72rtr7" style={{ minHeight: '100vh', width: 'auto', display: 'contents' }}>
            <HeroSection />
            <HowitWorksSection />
            <BentoSection />
            <FeaturesSection />
            <ComparisonSection />
            <TestimonialsSection />
            <PricingSection />
            <FAQSection />
            <BlogSection />
            <CTASection />
            <FooterSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
