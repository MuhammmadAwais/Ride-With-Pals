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
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        
        /* Bright spotlight grid */
        .clario-grid-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background-size: 60px 60px;
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
      // Animate the navigation
      gsap.fromTo(
        'nav',
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );

      // Animate all major sections on scroll
      const sections = gsap.utils.toArray('section') as HTMLElement[];
      sections.forEach((section, i) => {
        section.style.willChange = 'transform, opacity';
        
        // If it's the first section (hero), animate immediately
        if (i === 0) {
          gsap.fromTo(
            section.querySelectorAll('h1, h2, p, a, button'),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
          );
          gsap.fromTo(
            section.querySelectorAll('img'),
            { scale: 0.95, opacity: 0, y: 40 },
            { scale: 1, opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.4 }
          );
        } else {
          // Other sections fade in as you scroll
          gsap.fromTo(
            section,
            { y: 50, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                toggleActions: 'play none none none',
              }
            }
          );
        }
      });
      ScrollTrigger.refresh();
    };

    // Wait for images to load before initializing ScrollTrigger to prevent height miscalculations
    const images = Array.from(containerRef.current.querySelectorAll('img'));
    let loadedCount = 0;
    
    if (images.length === 0) {
      initAnimations();
    } else {
      images.forEach(img => {
        if (img.complete) {
          loadedCount++;
          if (loadedCount === images.length) initAnimations();
        } else {
          img.addEventListener('load', () => {
            loadedCount++;
            if (loadedCount === images.length) initAnimations();
          });
          img.addEventListener('error', () => {
            loadedCount++;
            if (loadedCount === images.length) initAnimations();
          });
        }
      });
    }
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
