import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { landingHtml } from './landingTemplate';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);

  // 1. Auth Redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      navigate(from ?? '/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  // 2. Dynamic CSS & Hover Effects Injection
  useEffect(() => {
    const cssId = 'clario-landing-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = '/landing/styles.css';
      document.head.appendChild(link);
    }

    const hoverCssId = 'clario-landing-hover-css';
    if (!document.getElementById(hoverCssId)) {
      const style = document.createElement('style');
      style.id = hoverCssId;
      // Add custom hover and interaction styles to fix any missing behaviors
      style.innerHTML = `
        .clario-landing-wrapper {
          width: 100vw;
          max-width: 100%;
          overflow-x: hidden;
          background: #050505;
          min-height: 100vh;
          position: relative;
        }
        .clario-landing-wrapper a, .clario-landing-wrapper button {
          transition: transform 0.2s ease, opacity 0.2s ease !important;
        }
        .clario-landing-wrapper a:hover, .clario-landing-wrapper button:hover {
          transform: translateY(-2px) scale(1.02);
          opacity: 0.9;
          cursor: pointer;
        }
        
        /* Basic FAQ accordion styles */
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

    return () => {
      const link = document.getElementById(cssId);
      if (link) link.remove();
      const style = document.getElementById(hoverCssId);
      if (style) style.remove();
    };
  }, []);

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

    // FAQ Toggles: We find all divs in the FAQ section and apply a toggle logic
    // Since Framer uses nested divs, we find text that looks like a question, then toggle the sibling/child
    const container = containerRef.current;
    if (container) {
      // Find the FAQ section container
      const faqSection = container.querySelector('[data-framer-name="FAQ Section"]');
      if (faqSection) {
        // Find all clickable question headers. Usually they are the first child of a list item or a specific layout div
        // We'll just look for elements that have an H3 or text ending in '?'
        const elements = faqSection.querySelectorAll('div, h2, h3, p');
        elements.forEach(el => {
          if (el.textContent?.trim().endsWith('?')) {
            // Find the closest wrapper
            const wrapper = el.parentElement;
            if (wrapper) {
              wrapper.style.cursor = 'pointer';
              // Assume the next sibling is the answer, or the next sibling of the wrapper is the answer
              const answerDiv = wrapper.nextElementSibling as HTMLElement;
              if (answerDiv) {
                answerDiv.classList.add('faq-answer');
                
                // create a wrapper handler
                const clickHandler = () => {
                  answerDiv.classList.toggle('open');
                };
                
                wrapper.addEventListener('click', clickHandler);
                
                // store it if we want to remove it, but it's not strictly necessary for this static DOM
              }
            }
          }
        });
      }
    }

    return () => {
      if (loginBtn) loginBtn.removeEventListener('click', handleLoginClick);
      if (signupBtn) signupBtn.removeEventListener('click', handleSignupClick);
      if (homeBtn) homeBtn.removeEventListener('click', handleHomeClick);
    };
  }, [navigate]);

  // 4. GSAP ScrollTrigger Animations
  useGSAP(() => {
    if (!containerRef.current) return;
    
    // Animate the navigation
    gsap.fromTo(
      'nav',
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );

    // Animate all major sections on scroll
    const sections = gsap.utils.toArray('section') as HTMLElement[];
    sections.forEach((section, i) => {
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
  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="clario-landing-wrapper"
      dangerouslySetInnerHTML={{ __html: landingHtml }} 
    />
  );
};

export default LandingPage;
