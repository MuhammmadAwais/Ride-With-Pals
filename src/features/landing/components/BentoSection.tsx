import React, { useEffect, useRef, useState } from "react";

export const BentoSection: React.FC = () => {
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
    <section ref={sectionRef} id="bento-features" className={`rwp-bento ${isVisible ? "visible" : ""}`}>
      <style>{`
        .rwp-bento {
          padding: 120px 20px;
          background-color: transparent;
          color: #fff;
          position: relative;
          overflow: hidden;
        }

        /* Radial ambient glows */
        .rwp-bento-glow-1 {
          position: absolute;
          top: 10%;
          left: -5%;
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(235,113,43,0.09) 0%, transparent 65%);
          pointer-events: none;
          z-index: 1;
        }

        .rwp-bento-glow-2 {
          position: absolute;
          bottom: 5%;
          right: -5%;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(235,113,43,0.07) 0%, transparent 65%);
          pointer-events: none;
          z-index: 1;
        }

        .rwp-bento-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .rwp-bento-header {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 70px;
          position: relative;
        }

        @media (min-width: 900px) {
          .rwp-bento-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-end;
          }
        }

        .rwp-bento-title {
          font-family: Manrope, Inter, sans-serif;
          font-size: clamp(38px, 4.5vw, 60px);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.08;
          max-width: 600px;
        }

        .rwp-bento-subtitle {
          font-family: Manrope, Inter, sans-serif;
          font-size: 17px;
          color: rgba(255,255,255,0.45);
          max-width: 420px;
          line-height: 1.6;
        }

        /* Glassmorphism Card Styling */
        .rwp-bento-card {
          position: relative;
          z-index: auto;
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          background: transparent;
        }

        .rwp-bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          background: rgba(14, 14, 14, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 20px 50px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 0 20px rgba(255, 255, 255, 0.02);
          transition: border-color 0.4s, background 0.4s, box-shadow 0.4s;
        }

        .rwp-bento-card:hover::before {
          background: rgba(22, 22, 22, 0.78);
          border-color: rgba(235, 113, 43, 0.4);
          box-shadow: 
            0 30px 60px rgba(0, 0, 0, 0.8),
            0 0 35px rgba(235, 113, 43, 0.1) inset,
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .rwp-bento-card:hover {
          transform: translateY(-8px);
        }

        /* SVG Connecting Arrows overlay - placed above glass bg (z:5), behind content (z:10) */
        .rwp-bento-connections {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
        }
        
        .rwp-arrow-line {
          fill: none;
          stroke: #EB712B;
          stroke-width: 2.2;
          stroke-dasharray: 6 6;
          animation: arrowDash 25s linear infinite;
        }

        @keyframes arrowDash {
          to { stroke-dashoffset: -300; }
        }

        @media (max-width: 900px) {
          .rwp-bento-connections { display: none; }
        }

        /* Bento Grid Layout */
        .rwp-bento-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          position: relative;
          z-index: 2;
        }

        @media (min-width: 900px) {
          .rwp-bento-grid {
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: minmax(460px, auto) minmax(460px, auto);
          }
          .rwp-bento-card-1 { grid-column: span 7; }
          .rwp-bento-card-2 { grid-column: span 5; }
          .rwp-bento-card-3 { grid-column: span 5; }
          .rwp-bento-card-4 { grid-column: span 7; }
        }

        /* Text Content - Layer 10 (above arrows at z:5) */
        .rwp-bento-content {
          padding: 36px 36px 20px 36px;
          z-index: 10;
          position: relative;
        }

        .rwp-bento-card-title {
          font-family: Manrope, Inter, sans-serif;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 10px;
          color: #fff;
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .rwp-bento-accent-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #EB712B;
          box-shadow: 0 0 10px rgba(235,113,43,0.9);
        }

        .rwp-bento-card-desc {
          font-family: Manrope, Inter, sans-serif;
          font-size: 15px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
        }

        /* Image Mockup Containers - Layer 10 (above arrows at z:5) */
        .rwp-bento-image-area {
          flex-grow: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          width: 100%;
          z-index: 10;
        }

        /* Phone frame component */
        .rwp-phone-mockup {
          width: 220px;
          height: 380px;
          background: #161616;
          border-radius: 36px;
          border: 4px solid #222;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1);
          overflow: hidden;
          position: relative;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .rwp-phone-mockup img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
        }

        .rwp-bento-card:hover .rwp-phone-mockup {
          transform: translateY(-8px) scale(1.03);
        }

        /* Browser frame component */
        .rwp-browser-mockup {
          width: 90%;
          height: 280px;
          background: #161616;
          border-radius: 16px 16px 0 0;
          border: 1px solid rgba(255,255,255,0.12);
          border-bottom: none;
          box-shadow: 0 20px 40px rgba(0,0,0,0.8);
          overflow: hidden;
          position: relative;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .rwp-browser-bar {
          height: 28px;
          background: #111;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          padding: 0 12px;
          gap: 6px;
        }

        .rwp-browser-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .rwp-browser-mockup img {
          width: 100%;
          height: calc(100% - 28px);
          object-fit: cover;
          object-position: top;
          display: block;
        }

        .rwp-bento-card:hover .rwp-browser-mockup {
          transform: translateY(-6px) scale(1.02);
        }

        /* Card 1 Specifics (Dashboard Browser) */
        .rwp-bento-card-1 .rwp-bento-image-area {
          align-items: flex-end;
          padding-top: 10px;
        }

        /* Card 2 Specifics (Analytics Mobile) */
        .rwp-bento-card-2 .rwp-bento-image-area {
          align-items: flex-end;
          padding-bottom: 0;
        }
        .rwp-bento-card-2 .rwp-phone-mockup {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          height: 320px;
        }

        /* Card 3 Specifics (Club Management Mobile) */
        .rwp-bento-card-3 .rwp-bento-image-area {
          align-items: flex-end;
        }
        .rwp-bento-card-3 .rwp-phone-mockup {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          height: 320px;
        }

        /* Card 4 Specifics (Shop Mobile - HORIZONTAL SPLIT) */
        .rwp-bento-card-4 {
          flex-direction: row;
          align-items: center;
        }

        .rwp-bento-card-4 .rwp-bento-content {
          width: 55%;
          padding: 40px;
        }

        .rwp-bento-card-4 .rwp-bento-image-area {
          width: 45%;
          height: 100%;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .rwp-bento-card-4 .rwp-phone-mockup {
          height: 360px;
          border-radius: 28px;
          transform: rotate(3deg);
        }
        .rwp-bento-card-4:hover .rwp-phone-mockup {
          transform: rotate(0deg) scale(1.05);
        }

        @media (max-width: 900px) {
          .rwp-bento-card-4 {
            flex-direction: column;
          }
          .rwp-bento-card-4 .rwp-bento-content {
            width: 100%;
          }
          .rwp-bento-card-4 .rwp-bento-image-area {
            width: 100%;
            height: 320px;
          }
        }
      `}</style>

      <div className="rwp-bento-glow-1" />
      <div className="rwp-bento-glow-2" />

      <div className="rwp-bento-container">
        <div className="rwp-bento-header">
          <h2 className="rwp-bento-title">
            See your rides in real time, <span style={{ color: "#EB712B" }}>clearly.</span>
          </h2>
          <p className="rwp-bento-subtitle">
            Ride with Pals shows your events, members, and club progress in simple visuals you can act on — right away.
          </p>
        </div>

        <div className="rwp-bento-grid">
          
          {/* SVG Animated Connections & Arrows */}
          <div className="rwp-bento-connections">
            <svg width="100%" height="100%" viewBox="0 0 1200 950" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#EB712B" />
                </marker>
              </defs>

              {/* Arrow from Card 1 to Card 2 */}
              <path className="rwp-arrow-line" d="M 620,240 Q 680,240 700,240" markerEnd="url(#arrowhead)" />

              {/* Curved Arrow from Card 2 to Card 4 */}
              <path className="rwp-arrow-line" d="M 950,440 Q 1100,550 850,700" markerEnd="url(#arrowhead)" style={{ animationDelay: '-4s' }} />

              {/* Curved Arrow from Card 1 down to Card 3 */}
              <path className="rwp-arrow-line" d="M 350,440 Q 200,550 350,680" markerEnd="url(#arrowhead)" style={{ animationDelay: '-8s' }} />

              {/* Connecting line between Card 3 and Card 4 */}
              <path className="rwp-arrow-line" d="M 480,720 Q 520,720 540,720" markerEnd="url(#arrowhead)" style={{ animationDelay: '-12s' }} />
            </svg>
          </div>

          {/* Card 1: Dashboard */}
          <div className="rwp-bento-card rwp-bento-card-1">
            <div className="rwp-bento-content">
              <h3 className="rwp-bento-card-title">
                <span className="rwp-bento-accent-dot"></span> Smart Dashboard
              </h3>
              <p className="rwp-bento-card-desc">
                See all your active events, clubs, and tasks in one unified view — no more toggling between apps.
              </p>
            </div>
            <div className="rwp-bento-image-area">
              <div className="rwp-browser-mockup">
                <div className="rwp-browser-bar">
                  <div className="rwp-browser-dot" style={{ background: '#FF5F56' }} />
                  <div className="rwp-browser-dot" style={{ background: '#FFBD2E' }} />
                  <div className="rwp-browser-dot" style={{ background: '#27C93F' }} />
                </div>
                <img src="/Images/feature-screens/feat-web-dashboard.png" alt="Smart Dashboard" />
              </div>
            </div>
          </div>

          {/* Card 2: Analytics */}
          <div className="rwp-bento-card rwp-bento-card-2">
            <div className="rwp-bento-content">
              <h3 className="rwp-bento-card-title">
                <span className="rwp-bento-accent-dot"></span> Ride Analytics
              </h3>
              <p className="rwp-bento-card-desc">
                Track your personal bests and club statistics to understand your performance flow over time.
              </p>
            </div>
            <div className="rwp-bento-image-area">
              <div className="rwp-phone-mockup">
                <img src="/Images/feature-screens/feat-analytics.png" alt="Ride Analytics" />
              </div>
            </div>
          </div>

          {/* Card 3: Club Management */}
          <div className="rwp-bento-card rwp-bento-card-3">
            <div className="rwp-bento-content">
              <h3 className="rwp-bento-card-title">
                <span className="rwp-bento-accent-dot"></span> Club Management
              </h3>
              <p className="rwp-bento-card-desc">
                Approve members, handle roles, and keep your community engaged and organised effortlessly.
              </p>
            </div>
            <div className="rwp-bento-image-area">
              <div className="rwp-phone-mockup">
                <img src="/Images/feature-screens/feat-manage-club.png" alt="Club Management" />
              </div>
            </div>
          </div>

          {/* Card 4: Shop / Marketplace */}
          <div className="rwp-bento-card rwp-bento-card-4">
            <div className="rwp-bento-content">
              <h3 className="rwp-bento-card-title">
                <span className="rwp-bento-accent-dot"></span> Integrated Shop
              </h3>
              <p className="rwp-bento-card-desc">
                Offer club merch, event tickets, and gear directly to your members without external tools.
              </p>
            </div>
            <div className="rwp-bento-image-area">
              <div className="rwp-phone-mockup">
                <img src="/Images/feature-screens/feat-shop.png" alt="Integrated Shop" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
