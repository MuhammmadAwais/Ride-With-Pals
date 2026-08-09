import React from "react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="rwp-footer">
      <style>{`
        .rwp-footer {
          position: relative;
          background: #050505;
          color: #fff;
          padding: 100px 20px 40px;
          overflow: hidden;
          font-family: Manrope, Inter, sans-serif;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        /* Central orange flare glow */
        .rwp-footer::before {
          content: '';
          position: absolute;
          top: -300px;
          left: 50%;
          transform: translateX(-50%);
          width: 1000px;
          height: 800px;
          background: radial-gradient(circle at center, rgba(235,113,43,0.15) 0%, rgba(235,113,43,0.05) 30%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .rwp-footer-content {
          max-width: 1160px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .rwp-footer-title {
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.1;
          margin-bottom: 40px;
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(255,255,255,0.5) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rwp-footer-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #EB712B;
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          padding: 16px 40px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(235,113,43,0.4);
          margin-bottom: 80px;
        }
        
        .rwp-footer-btn:hover {
          background: #ff853f;
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(235,113,43,0.6);
        }

        .rwp-footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px;
          width: 100%;
          text-align: left;
          padding-top: 60px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rwp-footer-col h4 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 20px;
          font-weight: 700;
        }

        .rwp-footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .rwp-footer-col a, .rwp-footer-col p {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
          margin: 0;
        }

        .rwp-footer-col a:hover {
          color: #EB712B;
        }

        .rwp-footer-bottom {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 40px;
          margin-top: 60px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rwp-footer-logo {
          display: flex;
          align-items: center;
        }
        
        .rwp-footer-logo-img {
          height: 36px;
          width: auto;
          filter: brightness(0) invert(1);
          opacity: 0.9;
          transition: opacity 0.2s ease;
        }

        .rwp-footer-logo-img:hover {
          opacity: 1;
        }

        .rwp-footer-copyright {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
        }

        .rwp-footer-socials {
          display: flex;
          gap: 16px;
        }

        .rwp-footer-socials a {
          color: rgba(255, 255, 255, 0.5);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .rwp-footer-socials a:hover {
          color: #EB712B;
          transform: translateY(-2px);
        }
        
        @media (max-width: 768px) {
          .rwp-footer-bottom {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }
          .rwp-footer-title {
            margin-bottom: 30px;
          }
        }
      `}</style>

      <div className="rwp-footer-content">
        <h2 className="rwp-footer-title" id="footer-main-title">
          <span className="footer-word">READY </span>
          <span className="footer-word">TO </span>
          <span className="footer-word">RIDE?</span>
        </h2>
        <a href="/signup" className="rwp-footer-btn">
          Join the Club
        </a>

        <div className="rwp-footer-grid">
          <div className="rwp-footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@ridewithpals.com">hello@ridewithpals.com</a></li>
              <li><a href="tel:+15551234567">+1 (555) 123-4567</a></li>
              <li><p>San Francisco, CA<br/>United States</p></li>
            </ul>
          </div>
          <div className="rwp-footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#community">Community</a></li>
            </ul>
          </div>
          <div className="rwp-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="rwp-footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="rwp-footer-bottom">
          <div className="rwp-footer-logo">
            <img 
              src="/Images/official_logo.png" 
              alt="Ride with Pals" 
              className="rwp-footer-logo-img"
            />
          </div>
          <div className="rwp-footer-copyright">
            © {new Date().getFullYear()} Ride with Pals. All rights reserved.
          </div>
          <div className="rwp-footer-socials">
            <a href="#github" aria-label="GitHub">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            </a>
            <a href="#twitter" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
            <a href="#instagram" aria-label="Instagram">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#linkedin" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
