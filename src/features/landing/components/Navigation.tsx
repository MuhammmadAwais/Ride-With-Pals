// @ts-nocheck
import React, { useState, useEffect } from "react";

export const Navigation: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "How it works", href: "/#how-it-works" },
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Blog", href: "/blog#blog" },
  ];

  const css = `
    .rwp-nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: 0 40px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(5,5,5,0.5);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      border-bottom: 1px solid transparent;
      transition: background 0.3s ease, border-color 0.3s ease;
    }
    .rwp-nav.scrolled {
      background: rgba(5,5,5,0.85);
      border-bottom-color: rgba(255,255,255,0.07);
    }
    .rwp-nav-logo {
      display: flex;
      align-items: center;
      text-decoration: none;
      flex-shrink: 0;
      z-index: 1;
    }
    .rwp-nav-logo img {
      max-height: 56px;
      max-width: 160px;
      object-fit: contain;
    }
    .rwp-nav-center {
      display: flex;
      align-items: center;
      gap: 4px;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
    .rwp-nav-link {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 14px;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: 8px;
      transition: color 0.2s, background 0.2s;
      white-space: nowrap;
    }
    .rwp-nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
    .rwp-nav-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      z-index: 1;
    }
    .rwp-btn-login {
      color: #fff;
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 14px;
      font-weight: 500;
      padding: 9px 20px;
      border-radius: 23px;
      background: rgba(23,23,23,0.9);
      border: 1px solid rgba(255,255,255,0.1);
      transition: background 0.2s, transform 0.15s;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }
    .rwp-btn-login:hover { background: rgba(40,40,40,0.95); transform: translateY(-1px); }
    .rwp-btn-signup {
      color: #0d0d0d;
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 14px;
      font-weight: 700;
      padding: 9px 20px;
      border-radius: 23px;
      background: linear-gradient(135deg,#EB712B,#f08c4a);
      box-shadow: 0 4px 16px rgba(235,113,43,0.35);
      transition: box-shadow 0.2s, transform 0.15s;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
    }
    .rwp-btn-signup:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(235,113,43,0.5); }
    .rwp-hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      cursor: pointer;
      gap: 5px;
      transition: background 0.2s;
      flex-shrink: 0;
      z-index: 1001;
    }
    .rwp-hamburger:hover { background: rgba(255,255,255,0.1); }
    .rwp-hamburger-bar {
      width: 20px;
      height: 2px;
      background: #fff;
      border-radius: 2px;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform-origin: center;
    }
    .rwp-hamburger.open .rwp-hamburger-bar:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    .rwp-hamburger.open .rwp-hamburger-bar:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .rwp-hamburger.open .rwp-hamburger-bar:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
    .rwp-mobile-drawer {
      position: fixed;
      inset: 0;
      z-index: 999;
      display: flex;
      flex-direction: column;
      background: rgba(5,5,5,0.97);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.35s ease;
    }
    .rwp-mobile-drawer.open { opacity: 1; pointer-events: all; }
    .rwp-mobile-drawer-inner {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 100px 32px 24px;
      gap: 0;
      overflow-y: auto;
    }
    .rwp-mobile-link {
      color: rgba(255,255,255,0.45);
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 32px;
      font-weight: 800;
      padding: 16px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      opacity: 0;
      transform: translateY(24px);
      transition: color 0.25s, padding-left 0.25s, opacity 0.4s ease, transform 0.4s ease;
      letter-spacing: -0.02em;
    }
    .rwp-mobile-drawer.open .rwp-mobile-link { opacity: 1; transform: translateY(0); }
    .rwp-mobile-link:nth-child(1) { transition-delay: 0.06s; }
    .rwp-mobile-link:nth-child(2) { transition-delay: 0.12s; }
    .rwp-mobile-link:nth-child(3) { transition-delay: 0.18s; }
    .rwp-mobile-link:nth-child(4) { transition-delay: 0.24s; }
    .rwp-mobile-link:hover { color: #fff; padding-left: 10px; }
    .rwp-mobile-actions {
      padding: 24px 32px 48px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.4s ease 0.32s, transform 0.4s ease 0.32s;
    }
    .rwp-mobile-drawer.open .rwp-mobile-actions { opacity: 1; transform: translateY(0); }
    .rwp-mobile-btn-login {
      display: block;
      text-align: center;
      color: #fff;
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 16px;
      font-weight: 600;
      padding: 18px;
      border-radius: 16px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      transition: background 0.2s;
    }
    .rwp-mobile-btn-login:hover { background: rgba(255,255,255,0.1); }
    .rwp-mobile-btn-signup {
      display: block;
      text-align: center;
      color: #0d0d0d;
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 16px;
      font-weight: 700;
      padding: 18px;
      border-radius: 16px;
      background: linear-gradient(135deg,#EB712B,#f08c4a);
      box-shadow: 0 4px 28px rgba(235,113,43,0.45);
      transition: opacity 0.2s, transform 0.2s;
    }
    .rwp-mobile-btn-signup:hover { opacity: 0.92; transform: scale(0.99); }
    .rwp-mobile-orb {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle,rgba(235,113,43,0.1) 0%,transparent 70%);
      border-radius: 50%;
      bottom: 40px;
      right: -120px;
      pointer-events: none;
    }
    @media (max-width: 768px) {
      .rwp-nav { padding: 0 20px; }
      .rwp-nav-center { display: none; }
      .rwp-nav-actions { display: none; }
      .rwp-hamburger { display: flex; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <nav className={"rwp-nav" + (scrolled ? " scrolled" : "")}>
        <a className="rwp-nav-logo" href="/" id="landing-home-btn">
          <img src="/Images/Logo.png" alt="Ride With Pals" fetchPriority="high" decoding="async" />
        </a>
        <div className="rwp-nav-center">
          {navLinks.map((link) => (
            <a key={link.label} className="rwp-nav-link" href={link.href}>{link.label}</a>
          ))}
        </div>
        <div className="rwp-nav-actions">
          <a className="rwp-btn-login" href="/login" id="landing-login-btn">Login</a>
          <a className="rwp-btn-signup" href="/signup" id="landing-signup-btn">Sign up</a>
        </div>
        <button
          className={"rwp-hamburger" + (menuOpen ? " open" : "")}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span className="rwp-hamburger-bar" />
          <span className="rwp-hamburger-bar" />
          <span className="rwp-hamburger-bar" />
        </button>
      </nav>
      <div className={"rwp-mobile-drawer" + (menuOpen ? " open" : "")} role="dialog" aria-modal="true">
        <div className="rwp-mobile-orb" />
        <div className="rwp-mobile-drawer-inner">
          {navLinks.map((link) => (
            <a key={link.label} className="rwp-mobile-link" href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </div>
        <div className="rwp-mobile-actions">
          <a className="rwp-mobile-btn-login" href="/login" onClick={() => setMenuOpen(false)}>Login</a>
          <a className="rwp-mobile-btn-signup" href="/signup" onClick={() => setMenuOpen(false)}>Get started free</a>
        </div>
      </div>
    </>
  );
};
