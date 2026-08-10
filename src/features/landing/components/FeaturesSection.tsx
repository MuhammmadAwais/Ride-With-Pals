// @ts-nocheck
import React from "react";

/* Tiny SVG atoms outside component render */
const ArrowRight = ({ size = 12, color = "#EB712B" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 6h10M7 2l4 4-4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const CheckMark = ({ club = false }: { club?: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M1.5 5L4 7.5L8.5 2.5" stroke={club ? "rgba(255,255,255,0.45)" : "#EB712B"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const SwirlArrow = () => (
  <svg width="80" height="64" viewBox="0 0 80 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4 C20 4, 36 10, 44 28 C52 46, 68 52, 76 56" stroke="#EB712B" strokeWidth="1.5"
          strokeLinecap="round" strokeDasharray="3 4" fill="none"/>
    <path d="M72 50 L76 56 L68 56" stroke="#EB712B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

export const FeaturesSection: React.FC = () => {
  const css = `
    /* ════════════════════════════════════════════
       FEATURES SECTION — editorial, no plain cards
    ════════════════════════════════════════════ */
    .rwp-fs {
      padding: 140px 0 120px;
      background: transparent;
      position: relative;
    }
    .rwp-fs-inner {
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 48px;
    }

    /* ═══════════════ HEADER ═══════════════ */
    .rwp-fs-header {
      position: relative;
      margin-bottom: 100px;
    }

    /* Label row */
    .rwp-fs-label {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
    }
    .rwp-fs-label-line {
      display: block;
      width: 32px;
      height: 1px;
      background: #EB712B;
    }
    .rwp-fs-label-text {
      font-family: Manrope, Inter, sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #EB712B;
    }

    /* Large headline + custom decoration */
    .rwp-fs-headline-wrap {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
    }
    .rwp-fs-h1 {
      font-family: Manrope, Inter, sans-serif;
      font-size: clamp(44px, 6vw, 84px);
      font-weight: 900;
      color: #fff;
      line-height: 1.0;
      letter-spacing: -0.04em;
      margin: 0;
    }
    /* Ghost text — second line */
    .rwp-fs-h1-ghost {
      color: #EB712B;
      -webkit-text-stroke: 1.5px #EB712B;
      text-shadow: 0 0 40px rgba(235,113,43,0.25);
    }
    /* Orange underline swash on last word */
    .rwp-fs-h1-accent {
      position: relative;
      color: #EB712B;
    }
    .rwp-fs-h1-accent::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 0; right: 0;
      height: 3px;
      background: #EB712B;
      border-radius: 2px;
      opacity: 0.5;
    }

    /* Decorative arrow swirl beside headline */
    .rwp-fs-swirl {
      position: absolute;
      top: 12px;
      right: -90px;
      opacity: 0.55;
      pointer-events: none;
    }

    /* Sub row — copy left, stats right */
    .rwp-fs-sub-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 80px;
      align-items: end;
      margin-top: 36px;
    }
    .rwp-fs-sub {
      font-family: Manrope, Inter, sans-serif;
      font-size: 17px;
      line-height: 1.75;
      color: rgba(255,255,255,0.35);
      max-width: 520px;
    }
    /* Inline icon accent in sub-copy */
    .rwp-fs-sub-icon {
      display: inline-block;
      vertical-align: middle;
      margin: 0 3px;
    }

    /* Stat pills */
    .rwp-fs-stats {
      display: flex;
      gap: 2px;
    }
    .rwp-fs-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 18px 28px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.02);
    }
    .rwp-fs-stat:first-child { border-radius: 12px 0 0 12px; }
    .rwp-fs-stat:last-child  { border-radius: 0 12px 12px 0; }
    .rwp-fs-stat-num {
      font-family: Manrope, Inter, sans-serif;
      font-size: 32px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .rwp-fs-stat-num span { color: #EB712B; }
    .rwp-fs-stat-label {
      font-family: Manrope, Inter, sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.25);
      margin-top: 5px;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }

    /* Top rule */
    .rwp-fs-toprule {
      width: 100%;
      height: 1px;
      background: rgba(255,255,255,0.07);
      margin-bottom: 100px;
    }

    /* ═════════════════════════════════════
       FEATURE BLOCKS — editorial alternating
    ═════════════════════════════════════ */
    .rwp-fb {
      display: grid;
      grid-template-columns: 80px 1fr 1fr;
      gap: 0 56px;
      padding-bottom: 100px;
      position: relative;
    }

    /* Vertical thread */
    .rwp-fb::before {
      content: '';
      position: absolute;
      left: 39px; top: 0; bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom,
        rgba(235,113,43,0) 0%,
        rgba(235,113,43,0.3) 15%,
        rgba(235,113,43,0.3) 85%,
        rgba(235,113,43,0) 100%);
    }
    .rwp-fb::after {
      content: '';
      position: absolute;
      left: 35px; top: 10px;
      width: 9px; height: 9px;
      border-radius: 50%;
      background: #EB712B;
      box-shadow: 0 0 12px rgba(235,113,43,0.7), 0 0 28px rgba(235,113,43,0.2);
    }

    /* reversed: screens left, text right */
    .rwp-fb--rev { }
    .rwp-fb--rev .rwp-fb-text { order: 3; }
    .rwp-fb--rev .rwp-fb-screens { order: 2; }

    /* ── Meta column ── */
    .rwp-fb-meta {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 4px;
      gap: 0;
    }
    .rwp-fb-num {
      font-family: Manrope, Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: rgba(235,113,43,0.5);
      letter-spacing: 0.14em;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      user-select: none;
    }

    /* ── Text column ── */
    .rwp-fb-text { padding-top: 0; }
    .rwp-fb-type-tag {
      font-family: Manrope, Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    .rwp-fb-type-tag.rider { color: #EB712B; border-color: rgba(235,113,43,0.2); }
    .rwp-fb-type-tag.club  { color: rgba(255,255,255,0.35); }
    /* Arrow accent in tag */
    .rwp-fb-tag-arrow {
      display: inline-flex;
      align-items: center;
    }

    .rwp-fb-headline {
      font-family: Manrope, Inter, sans-serif;
      font-size: clamp(28px, 3.2vw, 42px);
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 20px;
    }
    .rwp-fb-copy {
      font-family: Manrope, Inter, sans-serif;
      font-size: 15px;
      line-height: 1.8;
      color: rgba(255,255,255,0.32);
      margin: 0 0 40px;
    }

    /* Feature list — borderline style */
    .rwp-fb-list {
      list-style: none; padding: 0; margin: 0;
    }
    .rwp-fb-list li {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 13px 0;
      border-top: 1px solid rgba(255,255,255,0.055);
      font-family: Manrope, Inter, sans-serif;
      font-size: 14px;
      color: rgba(255,255,255,0.42);
      line-height: 1.5;
    }
    .rwp-fb-list li:last-child { border-bottom: 1px solid rgba(255,255,255,0.055); }
    .rwp-fb-list-mark {
      flex-shrink: 0;
      width: 22px; height: 22px;
      border: 1px solid rgba(235,113,43,0.25);
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1px;
    }
    .rwp-fb-list-mark.club-mark {
      border-color: rgba(255,255,255,0.12);
    }
    .rwp-fb-list li strong {
      color: rgba(255,255,255,0.82);
      font-weight: 600;
      display: block;
    }

    /* ── Screens column ── */
    .rwp-fb-screens {
      position: relative;
      height: 520px;
    }
    .rwp-fb-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 60%, rgba(235,113,43,0.06) 0%, transparent 65%);
      pointer-events: none;
    }
    .rwp-fb-screen-a {
      position: absolute;
      width: 210px;
      border-radius: 36px;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.09),
        0 32px 64px rgba(0,0,0,0.75);
      z-index: 2;
    }
    .rwp-fb-screen-b {
      position: absolute;
      width: 168px;
      border-radius: 28px;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.05),
        0 20px 40px rgba(0,0,0,0.6);
      z-index: 1;
      opacity: 0.72;
    }
    .rwp-fb-screen-a img,
    .rwp-fb-screen-b img { width: 100%; display: block; }

    /* Position variants */
    .rwp-fb--rider .rwp-fb-screen-a {
      left: 50%; top: 50%;
      transform: translate(-72%, -50%) rotate(-3deg);
    }
    .rwp-fb--rider .rwp-fb-screen-b {
      left: 50%; top: 50%;
      transform: translate(6%, -40%) rotate(5deg);
    }
    .rwp-fb--rev .rwp-fb-screen-a {
      left: 50%; top: 50%;
      transform: translate(-28%, -50%) rotate(3deg);
    }
    .rwp-fb--rev .rwp-fb-screen-b {
      left: 50%; top: 50%;
      transform: translate(-95%, -40%) rotate(-5deg);
    }

    /* Divider between blocks */
    .rwp-fb-rule {
      height: 1px;
      background: rgba(255,255,255,0.05);
      margin-bottom: 100px;
      grid-column: 1/-1;
    }

    /* ═══════════════════════════════════
       PLATFORM BLOCK — completely custom
    ═══════════════════════════════════ */
    .rwp-fp {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding-top: 90px;
    }
    .rwp-fp-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 80px;
      align-items: center;
    }

    .rwp-fp-label {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 28px;
    }
    .rwp-fp-label-line { display: block; width: 24px; height: 1px; background: rgba(255,255,255,0.25); }
    .rwp-fp-label-text {
      font-family: Manrope, Inter, sans-serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
    }
    .rwp-fp-headline {
      font-family: Manrope, Inter, sans-serif;
      font-size: clamp(32px, 3.8vw, 52px);
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.05;
      margin: 0 0 22px;
    }
    .rwp-fp-headline em {
      font-style: normal;
      color: #EB712B;
      -webkit-text-stroke: 0px;
    }
    .rwp-fp-copy {
      font-family: Manrope, Inter, sans-serif;
      font-size: 15px;
      color: rgba(255,255,255,0.32);
      line-height: 1.8;
      margin: 0 0 40px;
    }

    /* Platform grid — 2×2 mini cards */
    .rwp-fp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2px;
    }
    .rwp-fp-grid-cell {
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.02);
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: background 0.2s, border-color 0.2s;
    }
    .rwp-fp-grid-cell:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.12);
    }
    .rwp-fp-grid-cell:nth-child(1) { border-radius: 12px 0 0 0; }
    .rwp-fp-grid-cell:nth-child(2) { border-radius: 0 12px 0 0; }
    .rwp-fp-grid-cell:nth-child(3) { border-radius: 0 0 0 12px; }
    .rwp-fp-grid-cell:nth-child(4) { border-radius: 0 0 12px 0; }
    .rwp-fp-grid-icon {
      width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
    }
    .rwp-fp-grid-title {
      font-family: Manrope, Inter, sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: rgba(255,255,255,0.85);
    }
    .rwp-fp-grid-sub {
      font-family: Manrope, Inter, sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      line-height: 1.5;
    }

    /* Right side — web dashboard + floating phone */
    .rwp-fp-right {
      position: relative;
      height: 560px;
    }
    .rwp-fp-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 40% 50%, rgba(235,113,43,0.05) 0%, transparent 60%);
      pointer-events: none;
    }
    /* Wide browser chrome — full dashboard screenshot */
    .rwp-fp-browser {
      position: absolute;
      width: 420px;
      left: 50%;
      top: 50%;
      transform: translate(-58%, -54%) rotate(-2deg);
      background: #0f0f0f;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow:
        0 40px 80px rgba(0,0,0,0.8),
        0 0 0 1px rgba(255,255,255,0.04),
        inset 0 1px 0 rgba(255,255,255,0.06);
      overflow: hidden;
      z-index: 1;
    }
    .rwp-fp-browser-bar {
      height: 36px;
      background: #181818;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 7px;
    }
    .rwp-fp-browser-dot {
      width: 10px; height: 10px; border-radius: 50%;
    }
    .rwp-fp-browser-url {
      flex: 1;
      height: 20px;
      background: rgba(255,255,255,0.05);
      border-radius: 5px;
      margin: 0 14px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      gap: 6px;
    }
    .rwp-fp-browser-url-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(235,113,43,0.6);
      flex-shrink: 0;
    }
    .rwp-fp-browser-url-text {
      font-family: Manrope, Inter, sans-serif;
      font-size: 10px;
      color: rgba(255,255,255,0.28);
      letter-spacing: 0.02em;
    }
    .rwp-fp-browser-content {
      aspect-ratio: 16/10;
      overflow: hidden;
    }
    .rwp-fp-browser-content img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      display: block;
    }
    /* Phone floating in front */
    .rwp-fp-phone {
      position: absolute;
      width: 155px;
      border-radius: 32px;
      overflow: hidden;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.1),
        0 28px 56px rgba(0,0,0,0.75);
      left: 50%;
      top: 50%;
      transform: translate(30%, -38%) rotate(6deg);
      z-index: 3;
    }
    .rwp-fp-phone img { width: 100%; display: block; }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .rwp-fs-inner { padding: 0 32px; }
      .rwp-fb { grid-template-columns: 0 1fr; gap: 0 28px; display: flex; flex-direction: column; }
      .rwp-fb::before, .rwp-fb::after { display: none; }
      .rwp-fb-meta { display: none; }
      .rwp-fb--rev .rwp-fb-text { order: unset; }
      .rwp-fb--rev .rwp-fb-screens { order: unset; }
      .rwp-fb-screens { height: 380px; }
      .rwp-fp-inner { grid-template-columns: 1fr; gap: 56px; }
      .rwp-fp-right { height: 380px; }
      .rwp-fs-sub-row { grid-template-columns: 1fr; gap: 28px; }
    }
    @media (max-width: 600px) {
      .rwp-fs { padding: 80px 0 80px; }
      .rwp-fs-inner { padding: 0 20px; }
      .rwp-fs-header { margin-bottom: 60px; }
      .rwp-fb-screens { height: 290px; }
      .rwp-fb-screen-a { width: 150px; }
      .rwp-fb-screen-b { width: 120px; }
      .rwp-fp-right { height: 300px; }
      .rwp-fp-browser { width: 240px; }
      .rwp-fp-phone { width: 120px; }
      .rwp-fp-grid { grid-template-columns: 1fr; }
      .rwp-fs-stats { flex-direction: column; gap: 2px; }
      .rwp-fs-swirl { display: none; }
    }
  `;



  /* Browser dot colors */
  const browserDots = [
    { bg: "rgba(255,97,89,0.7)" },
    { bg: "rgba(255,189,68,0.7)" },
    { bg: "rgba(39,201,63,0.7)" },
  ];

  const listIconRider = (
    <div className="rwp-fb-list-mark"><CheckMark /></div>
  );
  const listIconClub = (
    <div className="rwp-fb-list-mark club-mark"><CheckMark club /></div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="rwp-fs" id="features">
        <div className="rwp-fs-inner">

          {/* ─────────────────────────────────────────
              HEADER
          ───────────────────────────────────────── */}
          <div className="rwp-fs-header">
            <div className="rwp-fs-label">
              <span className="rwp-fs-label-line"/>
              <span className="rwp-fs-label-text">Features</span>
            </div>

            {/* Headline with swirl decoration */}
            <div className="rwp-fs-headline-wrap">
              <h2 className="rwp-fs-h1">
                One app.<br/>
                <span className="rwp-fs-h1-ghost">Two roles.</span><br/>
                Zero&nbsp;<span className="rwp-fs-h1-accent">compromise</span>.
              </h2>
              {/* Swirl arrow pointing down-right toward the content */}
              <span className="rwp-fs-swirl" aria-hidden="true">
                <SwirlArrow />
              </span>
            </div>

            {/* Sub-copy + stats */}
            <div className="rwp-fs-sub-row">
              <p className="rwp-fs-sub">
                Ride With Pals is built for two distinct roles{" "}
                <span className="rwp-fs-sub-icon"><ArrowRight size={13} color="rgba(235,113,43,0.7)"/></span>{" "}
                the rider who wants to push limits, and the club owner who wants to build something lasting.
                Both on mobile. Both on web.
              </p>
              <div className="rwp-fs-stats">
                <div className="rwp-fs-stat">
                  <div className="rwp-fs-stat-num">10<span>+</span></div>
                  <div className="rwp-fs-stat-label">Core Features</div>
                </div>
                <div className="rwp-fs-stat">
                  <div className="rwp-fs-stat-num">2</div>
                  <div className="rwp-fs-stat-label">User Roles</div>
                </div>
                <div className="rwp-fs-stat">
                  <div className="rwp-fs-stat-num">3</div>
                  <div className="rwp-fs-stat-label">Platforms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rwp-fs-toprule"/>

          {/* ─────────────────────────────────────────
              BLOCK 01 — RIDES & LEADERBOARD
          ───────────────────────────────────────── */}
          <div className="rwp-fb rwp-fb--rider">
            <div className="rwp-fb-meta">
              <span className="rwp-fb-num">01 — FOR RIDERS</span>
            </div>

            <div className="rwp-fb-text">
              <div className="rwp-fb-type-tag rider">
                <span className="rwp-fb-tag-arrow"><ArrowRight size={11}/></span>
                For Athletes &amp; Riders
              </div>
              <h3 className="rwp-fb-headline">Discover rides.<br/>Climb the ranks.</h3>
              <p className="rwp-fb-copy">
                Browse upcoming group rides with pace, distance, and ride type at a glance. Swipe to join in seconds — then compete monthly on the leaderboard and earn your crown.
              </p>
              <ul className="rwp-fb-list">
                {[
                  ["Browse & Join Rides", "Upcoming rides with pace, distance and ride type"],
                  ["Monthly Leaderboards", "Compete by rides attended or total km covered"],
                  ["GPX & Strava Sync", "Download route files and sync with Strava classification"],
                  ["Ride Leaders & Support Cars", "See who's leading and follow the support crew"],
                ].map(([title, desc]) => (
                  <li key={title}>{listIconRider}<div><strong>{title}</strong>{desc}</div></li>
                ))}
              </ul>
            </div>

            <div className="rwp-fb-screens">
              <div className="rwp-fb-glow"/>
              <div className="rwp-fb-screen-a">
                <img loading="lazy" src="/Images/feature-screens/feat-rides.png" alt="Rides listing" />
              </div>
              <div className="rwp-fb-screen-b">
                <img loading="lazy" src="/Images/feature-screens/feat-leaderboard-1.png" alt="Leaderboard" />
              </div>
            </div>
          </div>

          <div className="rwp-fb-rule"/>

          {/* ─────────────────────────────────────────
              BLOCK 02 — COMMUNITY / MARKETPLACE
          ───────────────────────────────────────── */}
          <div className="rwp-fb rwp-fb--rider rwp-fb--rev">
            <div className="rwp-fb-meta">
              <span className="rwp-fb-num">02 — COMMUNITY</span>
            </div>

            <div className="rwp-fb-screens">
              <div className="rwp-fb-glow"/>
              <div className="rwp-fb-screen-a">
                <img loading="lazy" src="/Images/feature-screens/feat-chat.png" alt="Chat" />
              </div>
              <div className="rwp-fb-screen-b">
                <img loading="lazy" src="/Images/feature-screens/feat-shop.png" alt="Marketplace" />
              </div>
            </div>

            <div className="rwp-fb-text">
              <div className="rwp-fb-type-tag rider">
                <span className="rwp-fb-tag-arrow"><ArrowRight size={11}/></span>
                For Riders
              </div>
              <h3 className="rwp-fb-headline">Chat. Trade.<br/>Stay connected.</h3>
              <p className="rwp-fb-copy">
                Group chat, direct messages, a built-in marketplace, and an in-app wallet — everything that keeps your club community alive between rides.
              </p>
              <ul className="rwp-fb-list">
                {[
                  ["Group & Direct Chat", "Real-time messaging inside every club"],
                  ["Club Marketplace", "Buy and sell gear with riders you already know"],
                  ["In-App Wallet", "Deposit, withdraw, and pay without leaving the app"],
                  ["Member Discounts", "Exclusive discount codes on gear and club events"],
                ].map(([title, desc]) => (
                  <li key={title}>{listIconRider}<div><strong>{title}</strong>{desc}</div></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rwp-fb-rule"/>

          {/* ─────────────────────────────────────────
              BLOCK 03 — CLUB MANAGEMENT
          ───────────────────────────────────────── */}
          <div className="rwp-fb rwp-fb--rider">
            <div className="rwp-fb-meta">
              <span className="rwp-fb-num">03 — FOR CLUBS</span>
            </div>

            <div className="rwp-fb-text">
              <div className="rwp-fb-type-tag club">
                <span className="rwp-fb-tag-arrow"><ArrowRight size={11} color="rgba(255,255,255,0.35)"/></span>
                For Club Owners &amp; Managers
              </div>
              <h3 className="rwp-fb-headline">Build your club.<br/>Your way.</h3>
              <p className="rwp-fb-copy">
                Create and manage multiple clubs from one dashboard. Post news, control who joins, manage members, and keep your community organised — all from your admin panel.
              </p>
              <ul className="rwp-fb-list">
                {[
                  ["Multi-Club Dashboard", "Create and manage multiple clubs from one account"],
                  ["Join Request Control", "Accept or reject applications with one tap"],
                  ["Member Management", "View all members, assign roles, message directly"],
                  ["News & Announcements", "Post updates and records for members to engage with"],
                ].map(([title, desc]) => (
                  <li key={title}>{listIconClub}<div><strong>{title}</strong>{desc}</div></li>
                ))}
              </ul>
            </div>

            <div className="rwp-fb-screens">
              <div className="rwp-fb-glow"/>
              <div className="rwp-fb-screen-a">
                <img loading="lazy" src="/Images/feature-screens/feat-members-9.png" alt="Club Members" />
              </div>
              <div className="rwp-fb-screen-b">
                <img loading="lazy" src="/Images/feature-screens/feat-manage-club.png" alt="Manage Club" />
              </div>
            </div>
          </div>

          <div className="rwp-fb-rule"/>

          {/* ─────────────────────────────────────────
              BLOCK 04 — ANALYTICS & CLUB OVERVIEW
          ───────────────────────────────────────── */}
          <div className="rwp-fb rwp-fb--rider rwp-fb--rev">
            <div className="rwp-fb-meta">
              <span className="rwp-fb-num">04 — INSIGHTS</span>
            </div>

            <div className="rwp-fb-screens">
              <div className="rwp-fb-glow"/>
              <div className="rwp-fb-screen-a">
                <img loading="lazy" src="/Images/feature-screens/feat-analytics.png" alt="Performance Analytics" />
              </div>
              <div className="rwp-fb-screen-b">
                <img loading="lazy" src="/Images/feature-screens/feat-club-overview.png" alt="Club Overview" />
              </div>
            </div>

            <div className="rwp-fb-text">
              <div className="rwp-fb-type-tag club">
                <span className="rwp-fb-tag-arrow"><ArrowRight size={11} color="rgba(255,255,255,0.35)"/></span>
                For Club Owners
              </div>
              <h3 className="rwp-fb-headline">Full visibility.<br/>Real insights.</h3>
              <p className="rwp-fb-copy">
                Track participation trends with visual analytics. Get a full overview of your club's location, administrator structure, active members, and subscription status.
              </p>
              <ul className="rwp-fb-list">
                {[
                  ["Participation Analytics", "Visual charts of ride activity and member engagement over time"],
                  ["Club Overview Dashboard", "Location, admins, member count, subscription status at a glance"],
                  ["Free & Paid Clubs", "Run free open clubs or gated paid-subscription clubs"],
                  ["Admin Role Control", "Assign multiple admins with granular permission levels"],
                ].map(([title, desc]) => (
                  <li key={title}>{listIconClub}<div><strong>{title}</strong>{desc}</div></li>
                ))}
              </ul>
            </div>
          </div>

          {/* ─────────────────────────────────────────
              PLATFORM BLOCK — Web & Mobile
          ───────────────────────────────────────── */}
          <div className="rwp-fp">
            <div className="rwp-fp-inner">

              {/* Left: copy + 2×2 feature grid */}
              <div>
                <div className="rwp-fp-label">
                  <span className="rwp-fp-label-line"/>
                  <span className="rwp-fp-label-text">Cross-Platform</span>
                </div>
                <h3 className="rwp-fp-headline">
                  Web. iOS.<br/>
                  Android.<br/>
                  <em className="text-accent">Always in sync.</em>
                </h3>
                <p className="rwp-fp-copy">
                  Your rides, clubs, and conversations follow you everywhere. Start organising on desktop — join from your phone. The full experience, on every screen.
                </p>
                <div className="rwp-fp-grid">
                  <div className="rwp-fp-grid-cell">
                    <div className="rwp-fp-grid-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.33c.66-.8 1.11-1.92.99-3.04-.96.04-2.13.64-2.82 1.44-.61.71-1.15 1.86-1.01 2.96 1.08.08 2.18-.55 2.84-1.36z"/>
                      </svg>
                    </div>
                    <div className="rwp-fp-grid-title">iOS App</div>
                    <div className="rwp-fp-grid-sub">Native experience on iPhone and iPad</div>
                  </div>
                  <div className="rwp-fp-grid-cell">
                    <div className="rwp-fp-grid-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="#3DDC84" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5516 0 .9997.4482.9997.9993 0 .5511-.4481.9997-.9997.9997zm-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5516 0 .9997.4482.9997.9993 0 .5511-.4481.9997-.9997.9997zm11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1523-.5676.416.416 0 00-.5676.1523l-2.0223 3.503C15.5902 8.3582 13.8535 8 12 8s-3.5902.3582-5.1366.9499L4.8411 5.4469a.416.416 0 00-.5676-.1523.416.416 0 00-.1523.5676l1.9973 3.4592C2.6889 11.1867 0 14.792 0 19h24c0-4.208-2.6889-7.8133-6.1185-9.6786z"/>
                      </svg>
                    </div>
                    <div className="rwp-fp-grid-title">Android App</div>
                    <div className="rwp-fp-grid-sub">Full-featured on all Android devices</div>
                  </div>
                  <div className="rwp-fp-grid-cell">
                    <div className="rwp-fp-grid-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#EB712B"/>
                        <path d="M2.5 12h19M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="#FFF" strokeWidth="1.2"/>
                        <rect x="4" y="9.5" width="16" height="5" rx="2" fill="#FFF"/>
                        <text x="12" y="13.3" textAnchor="middle" fill="#EB712B" fontSize="4.2" fontWeight="900" fontFamily="sans-serif">WWW</text>
                      </svg>
                    </div>
                    <div className="rwp-fp-grid-title">Web App</div>
                    <div className="rwp-fp-grid-sub">Full desktop experience in any browser</div>
                  </div>
                  <div className="rwp-fp-grid-cell">
                    <div className="rwp-fp-grid-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="12" cy="6" rx="7" ry="3" fill="#60A5FA"/>
                        <path d="M5 6v4c0 1.657 3.134 3 7 3s7-1.343 7-3V6" fill="#3B82F6"/>
                        <path d="M5 10v4c0 1.657 3.134 3 7 3s7-1.343 7-3v-4" fill="#2563EB"/>
                        <circle cx="16" cy="16" r="5.5" fill="#1E293B" stroke="#60A5FA" strokeWidth="1"/>
                        <path d="M14.2 15a2 2 0 013-1m.3 1l.8-.8m-.8.8l-.8-.8m-2 1.8a2 2 0 00-3 1m-.3-1l-.8.8m.8-.8l.8.8" stroke="#FFF" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="rwp-fp-grid-title">Real-time Sync</div>
                    <div className="rwp-fp-grid-sub">Data stays in sync across all your devices</div>
                  </div>
                </div>
              </div>

              {/* Right: browser mockup + floating phone */}
              <div className="rwp-fp-right">
                <div className="rwp-fp-glow"/>
                {/* Browser chrome mockup */}
                <div className="rwp-fp-browser">
                  <div className="rwp-fp-browser-bar">
                    {browserDots.map((d, i) => (
                      <div key={i} className="rwp-fp-browser-dot" style={{ background: d.bg }} />
                    ))}
                    <div className="rwp-fp-browser-url">
                      <div className="rwp-fp-browser-url-dot" />
                      <span className="rwp-fp-browser-url-text">ridewithpals.com/dashboard</span>
                    </div>
                  </div>
                  <div className="rwp-fp-browser-content">
                    <img loading="lazy" src="/landing/assets/images/hero-dashboard.png" alt="Ride With Pals web dashboard" />
                  </div>
                </div>
                {/* Phone overlapping */}
                <div className="rwp-fp-phone">
                  <img loading="lazy" src="/Images/feature-screens/feat-rides.png" alt="Mobile app view" />
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </>
  );
};
