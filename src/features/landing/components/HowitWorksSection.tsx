import React, { useEffect, useRef, useState } from "react";
import { Trans } from "@lingui/react/macro";

export const HowitWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className={`rwp-hiw ${isVisible ? "visible" : ""}`}>
      <style>{`
        .rwp-hiw {
          background-color: transparent;
          padding: 120px 20px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }



        /* Top background glow */
        .rwp-hiw::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 600px;
          background: radial-gradient(ellipse, rgba(235,113,43,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .rwp-hiw-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .rwp-hiw-header {
          text-align: center;
          margin-bottom: 80px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .rwp-hiw-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(235,113,43,0.1);
          color: #EB712B;
          border: 1px solid rgba(235,113,43,0.3);
          padding: 8px 16px;
          border-radius: 30px;
          font-family: Manrope, Inter, sans-serif;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 24px;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s;
        }

        .rwp-hiw-badge:hover {
          background: rgba(235,113,43,0.2);
          transform: translateY(-2px);
        }

        .rwp-hiw-badge svg {
          width: 16px;
          height: 16px;
        }

        .rwp-hiw-title {
          font-family: Manrope, Inter, sans-serif;
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 20px;
        }

        .rwp-hiw-subtitle {
          font-family: Manrope, Inter, sans-serif;
          font-size: 18px;
          color: rgba(255,255,255,0.4);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Steps grid */
        .rwp-hiw-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          position: relative;
        }

        /* Connecting Arrows (desktop only) */
        .rwp-hiw-arrow {
          position: absolute;
          top: 180px;
          width: 150px;
          height: 40px;
          z-index: 1;
          pointer-events: none;
          opacity: 0.3;
        }
        .rwp-hiw-arrow-1 {
          left: calc(33.33% - 55px);
        }
        .rwp-hiw-arrow-2 {
          left: calc(66.66% - 55px);
        }
        
        .rwp-hiw-arrow svg {
          width: 100%;
          height: 100%;
          stroke: #EB712B;
          stroke-dasharray: 4 6;
          fill: none;
          stroke-width: 2;
          animation: march 20s linear infinite;
        }

        @keyframes march {
          to { stroke-dashoffset: -200; }
        }

        @media (max-width: 900px) {
          .rwp-hiw-steps {
            grid-template-columns: 1fr;
            max-width: 450px;
            margin: 0 auto;
          }
          .rwp-hiw-arrow {
            display: none;
          }
        }

        /* Card Styles */
        .rwp-hiw-card {
          background: #0D0D0D;
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          overflow: hidden;
          position: relative;
          z-index: 2;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s, border-color 0.4s;
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .rwp-hiw-card:hover {
          transform: translateY(-12px);
          border-color: rgba(235,113,43,0.2);
          box-shadow: 0 30px 60px rgba(235,113,43,0.08), 0 0 20px rgba(235,113,43,0.05) inset;
        }

        .rwp-hiw-image {
          width: 100%;
          height: 280px;
          background: #151515;
          position: relative;
          overflow: hidden;
        }
        
        .rwp-hiw-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rwp-hiw-card:hover .rwp-hiw-image img {
          transform: scale(1.05);
        }

        /* Gradient mask over image bottom */
        .rwp-hiw-image::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 60%, #0D0D0D 100%);
          pointer-events: none;
        }

        .rwp-hiw-content {
          padding: 30px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .rwp-hiw-step-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #111;
          border: 1px solid rgba(235,113,43,0.2);
          padding: 6px 12px;
          border-radius: 20px;
          margin-bottom: 20px;
          align-self: flex-start;
          transition: border-color 0.3s;
        }
        
        .rwp-hiw-card:hover .rwp-hiw-step-badge {
          border-color: rgba(235,113,43,0.5);
        }

        .rwp-hiw-dot {
          width: 8px;
          height: 8px;
          background: #EB712B;
          border-radius: 50%;
          box-shadow: 0 0 10px #EB712B;
        }

        .rwp-hiw-step-text {
          font-family: Manrope, Inter, sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #EB712B;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .rwp-hiw-card-title {
          font-family: Manrope, Inter, sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .rwp-hiw-card-desc {
          font-family: Manrope, Inter, sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
        }
      `}</style>

      <div className="rwp-hiw-container">
        <div className="rwp-hiw-header">
          <h2 className="rwp-hiw-title">
            <Trans>From weekly activities to a community that grows.</Trans>
          </h2>
          <p className="rwp-hiw-subtitle">
            <Trans>Create your space, organise recurring activities and give your members one place to stay connected.</Trans>
          </p>
        </div>

        <div className="rwp-hiw-steps">
          {/* Arrow 1 */}
          <div className="rwp-hiw-arrow rwp-hiw-arrow-1">
            <svg viewBox="0 0 150 40">
              <path d="M 0 20 Q 75 -20 150 20" />
            </svg>
          </div>
          
          {/* Arrow 2 */}
          <div className="rwp-hiw-arrow rwp-hiw-arrow-2">
            <svg viewBox="0 0 150 40">
              <path d="M 0 20 Q 75 60 150 20" />
            </svg>
          </div>

          {/* Step 1 */}
          <div className="rwp-hiw-card">
            <div className="rwp-hiw-image">
              <img loading="lazy" src="/Images/feature-screens/feat-club-overview.png" alt="Create your community" />
            </div>
            <div className="rwp-hiw-content">
              <div className="rwp-hiw-step-badge">
                <div className="rwp-hiw-dot" />
                <span className="rwp-hiw-step-text"><Trans>Step 1</Trans></span>
              </div>
              <h3 className="rwp-hiw-card-title"><Trans>Create your community</Trans></h3>
              <p className="rwp-hiw-card-desc">
                <Trans>Set up your club, shop or local sports community in minutes. Add your name, identity and the people who help run it.</Trans>
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rwp-hiw-card">
            <div className="rwp-hiw-image">
              <img loading="lazy" src="/Images/feature-screens/feat-ride-detail.png" alt="Plan activities and bring people together" />
            </div>
            <div className="rwp-hiw-content">
              <div className="rwp-hiw-step-badge">
                <div className="rwp-hiw-dot" />
                <span className="rwp-hiw-step-text"><Trans>Step 2</Trans></span>
              </div>
              <h3 className="rwp-hiw-card-title"><Trans>Plan activities and bring people together</Trans></h3>
              <p className="rwp-hiw-card-desc">
                <Trans>Schedule rides, runs and recurring sessions. Share routes, meeting points and updates with the right people.</Trans>
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rwp-hiw-card">
            <div className="rwp-hiw-image">
              <img loading="lazy" src="/Images/feature-screens/feat-discounts.png" alt="Keep your community coming back" />
            </div>
            <div className="rwp-hiw-content">
              <div className="rwp-hiw-step-badge">
                <div className="rwp-hiw-dot" />
                <span className="rwp-hiw-step-text"><Trans>Step 3</Trans></span>
              </div>
              <h3 className="rwp-hiw-card-title"><Trans>Keep your community coming back</Trans></h3>
              <p className="rwp-hiw-card-desc">
                <Trans>Use chat, news, discounts, memberships and your club shop to keep members engaged between activities.</Trans>
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
