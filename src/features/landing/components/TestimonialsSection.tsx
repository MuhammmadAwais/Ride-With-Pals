// @ts-nocheck
import React, { useRef, useEffect } from "react";

// Avatar pool — 9 real images cycled across 12 cards
const AVATARS = [
  "/landing/assets/images/avatar-26.png",
  "/landing/assets/images/avatar-27.png",
  "/landing/assets/images/avatar-28.png",
  "/landing/assets/images/avatar-29.png",
  "/landing/assets/images/avatar-30.png",
  "/landing/assets/images/avatar-31.png",
  "/landing/assets/images/avatar-32.png",
  "/landing/assets/images/avatar-33.png",
  "/landing/assets/images/avatar-34.png",
];

const TESTIMONIALS_ROW1 = [
  {
    name: "Ahmed Al-Rashidi",
    role: "Road Cyclist · Dubai",
    avatar: AVATARS[0],
    text: "RWP completely changed how I organise group rides. Club management, scheduling, leaderboards — it is all there and it actually works.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "MTB Enthusiast · Cape Town",
    avatar: AVATARS[1],
    text: "I found riders at my exact fitness level within a week. The club discovery feature alone is worth the download.",
    rating: 5,
  },
  {
    name: "Carlos Medina",
    role: "Triathlete · Barcelona",
    avatar: AVATARS[2],
    text: "My performance is up 20% since I started training with my Ride With Pals club. The activity feed keeps me accountable every day.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Weekend Cyclist · Bangalore",
    avatar: AVATARS[3],
    text: "Finally an app that respects serious riders. Stats, routes, and community — all dialled in perfectly. Could not ask for more.",
    rating: 5,
  },
  {
    name: "James Okonkwo",
    role: "Club Owner · Lagos",
    avatar: AVATARS[4],
    text: "Running my cycling club used to be a headache. Now memberships, news updates, and ride tracking all live in one dashboard.",
    rating: 5,
  },
  {
    name: "Yuki Tanaka",
    role: "Fixed Gear Rider · Tokyo",
    avatar: AVATARS[5],
    text: "The marketplace is a hidden gem. Sold my old crankset and found a used wheelset the same afternoon. Real riders, real gear.",
    rating: 5,
  },
];

const TESTIMONIALS_ROW2 = [
  {
    name: "Nina Hoffmann",
    role: "Gran Fondo Racer · Munich",
    avatar: AVATARS[6],
    text: "The social side does not feel like an afterthought here — it is the whole point. This is the first cycling app I have actually kept.",
    rating: 5,
  },
  {
    name: "Tariq Hassan",
    role: "Endurance Cyclist · Riyadh",
    avatar: AVATARS[7],
    text: "Browse upcoming events, pay entry, see who else is joining — all without leaving the app. The UX is seamless from start to finish.",
    rating: 5,
  },
  {
    name: "Emma Bertrand",
    role: "Gravel Rider · Lyon",
    avatar: AVATARS[8],
    text: "Organised an 80-rider charity event through RWP. Every attendee asked which platform we used. We told them gladly.",
    rating: 5,
  },
  {
    name: "Marcus Webb",
    role: "Crit Racer · London",
    avatar: AVATARS[0],
    text: "The weekly leaderboard creates exactly the right kind of friendly competition. Everyone in our club is pushing harder because of it.",
    rating: 5,
  },
  {
    name: "Amara Diallo",
    role: "Cycling Coach · Accra",
    avatar: AVATARS[3],
    text: "I manage training groups for 40+ athletes. The permission system lets coaches and members have completely separate access — perfect.",
    rating: 5,
  },
  {
    name: "Lucas Ferreira",
    role: "Track Cyclist · São Paulo",
    avatar: AVATARS[6],
    text: "Saved rides, wallet, subscriptions — everything is there, fast, and clean. Built by people who actually get what cyclists need.",
    rating: 5,
  },
];

// ── Sub-components ──────────────────────────────────────────────────────────

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#EB712B">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const TestimonialCard = ({ name, role, avatar, text, rating }) => (
  <div className="rwp-tc-card">
    <div className="rwp-tc-card-top">
      {/* Inline quote mark */}
      <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
        <path d="M0 22V13.2C0 11.3 0.42 9.5 1.26 7.8 2.1 6.1 3.27 4.6 4.77 3.3 6.29 2 8.07 1.1 10.1 0.5L12.3 3.7C10.8 4.3 9.55 5.2 8.54 6.3 7.53 7.4 6.9 8.8 6.62 10.4H11V22H0ZM16.4 22V13.2C16.4 11.3 16.82 9.5 17.66 7.8 18.5 6.1 19.67 4.6 21.17 3.3 22.69 2 24.47 1.1 26.5 0.5L28.7 3.7C27.2 4.3 25.95 5.2 24.94 6.3 23.93 7.4 23.3 8.8 23.02 10.4H27.4V22H16.4Z" fill="#EB712B" fillOpacity="0.18"/>
      </svg>
      <div className="rwp-tc-stars">
        {Array.from({ length: rating }).map((_, i) => <StarIcon key={i} />)}
      </div>
    </div>
    <p className="rwp-tc-text">{text}</p>
    <div className="rwp-tc-author">
      <img src={avatar} alt={name} className="rwp-tc-avatar" loading="lazy" />
      <div>
        <div className="rwp-tc-name">{name}</div>
        <div className="rwp-tc-role">{role}</div>
      </div>
    </div>
  </div>
);

const InfiniteRow = ({ items, direction = "left", speed = 32 }) => {
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const posRef = useRef(0);
  const pausedRef = useRef(false);

  const CARD_WIDTH = 360;
  const CARD_GAP = 16;
  const totalWidth = items.length * (CARD_WIDTH + CARD_GAP);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (direction === "right") posRef.current = -totalWidth;

    const step = () => {
      if (!pausedRef.current) {
        if (direction === "left") {
          posRef.current -= speed / 60;
          if (posRef.current <= -totalWidth) posRef.current = 0;
        } else {
          posRef.current += speed / 60;
          if (posRef.current >= 0) posRef.current = -totalWidth;
        }
        track.style.transform = `translateX(${posRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, speed, totalWidth]);

  return (
    <div
      className="rwp-tc-row-wrap"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div className="rwp-tc-track" ref={trackRef}>
        {[...items, ...items].map((item, i) => <TestimonialCard key={i} {...item} />)}
      </div>
    </div>
  );
};

// ── Decorative Social Proof Bar above carousel ───────────────────────────────
const SocialProofBar = () => (
  <div className="rwp-tc-proof-bar">
    {/* Stacked avatars */}
    <div className="rwp-tc-proof-avatars">
      {AVATARS.slice(0, 5).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="rwp-tc-proof-avatar"
          style={{ zIndex: 5 - i, marginLeft: i === 0 ? 0 : -10 }}
          loading="eager"
        />
      ))}
    </div>
    <div className="rwp-tc-proof-text">
      <div className="rwp-tc-proof-stars">
        {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
      </div>
      <span className="rwp-tc-proof-label">Loved by <strong>12,000+</strong> riders worldwide</span>
    </div>
    <div className="rwp-tc-proof-divider" />
    <div className="rwp-tc-proof-stat">
      <span className="rwp-tc-proof-num">340<span style={{ color: "#EB712B" }}>+</span></span>
      <span className="rwp-tc-proof-unit">Clubs</span>
    </div>
    <div className="rwp-tc-proof-divider" />
    <div className="rwp-tc-proof-stat">
      <span className="rwp-tc-proof-num">4.9<span style={{ color: "#EB712B" }}>★</span></span>
      <span className="rwp-tc-proof-unit">Rating</span>
    </div>
    <div className="rwp-tc-proof-divider" />
    <div className="rwp-tc-proof-stat">
      <span className="rwp-tc-proof-num">98<span style={{ color: "#EB712B" }}>%</span></span>
      <span className="rwp-tc-proof-unit">Satisfaction</span>
    </div>
  </div>
);

// ── Main export ───────────────────────────────────────────────────────────────
export const TestimonialsSection: React.FC = () => {
  const css = `
    .rwp-testimonials {
      padding: 100px 0 80px;
      background: transparent;
      overflow: hidden;
    }
    /* ── Header ── */
    .rwp-testimonials-header {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 40px 48px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 40px;
    }
    .rwp-testimonials-header-left { flex: 1; }
    .rwp-testimonials-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(235,113,43,0.3);
      border-radius: 100px;
      padding: 5px 14px;
      margin-bottom: 20px;
    }
    .rwp-testimonials-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #EB712B;
    }
    .rwp-testimonials-badge-text {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px; font-weight: 700;
      color: #EB712B;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .rwp-testimonials-heading {
      font-family: Manrope,Inter,sans-serif;
      font-size: clamp(30px,3.5vw,48px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 14px;
    }
    .rwp-testimonials-heading em {
      font-style: normal;
      color: #EB712B;
    }
    .rwp-testimonials-sub {
      font-family: Manrope,Inter,sans-serif;
      font-size: 15px;
      color: rgba(255,255,255,0.38);
      line-height: 1.65;
      margin: 0;
      max-width: 440px;
    }
    .rwp-testimonials-header-right {
      flex-shrink: 0;
    }
    .rwp-testimonials-pause-hint {
      font-family: Manrope,Inter,sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .rwp-testimonials-pause-hint svg { opacity: 0.4; }

    /* ── Social proof bar ── */
    .rwp-tc-proof-bar {
      max-width: 1200px;
      margin: 0 auto 44px;
      padding: 0 40px;
      display: flex;
      align-items: center;
      gap: 24px;
      flex-wrap: wrap;
    }
    .rwp-tc-proof-avatars {
      display: flex;
      align-items: center;
    }
    .rwp-tc-proof-avatar {
      width: 34px; height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #050505;
      position: relative;
    }
    .rwp-tc-proof-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .rwp-tc-proof-stars {
      display: flex;
      gap: 2px;
    }
    .rwp-tc-proof-label {
      font-family: Manrope,Inter,sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.45);
      white-space: nowrap;
    }
    .rwp-tc-proof-label strong {
      color: rgba(255,255,255,0.75);
      font-weight: 700;
    }
    .rwp-tc-proof-divider {
      width: 1px;
      height: 32px;
      background: rgba(255,255,255,0.08);
      flex-shrink: 0;
    }
    .rwp-tc-proof-stat {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .rwp-tc-proof-num {
      font-family: Manrope,Inter,sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
    }
    .rwp-tc-proof-unit {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      font-weight: 500;
    }

    /* ── Carousel rows ── */
    .rwp-tc-rows {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .rwp-tc-row-wrap {
      overflow: hidden;
      cursor: default;
      -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
      mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
    }
    .rwp-tc-track {
      display: flex;
      gap: 16px;
      will-change: transform;
    }

    /* ── Card ── */
    .rwp-tc-card {
      flex-shrink: 0;
      width: 360px;
      background: #0d0d0d;
      border: 1px solid rgba(255,255,255,0.065);
      border-radius: 18px;
      padding: 26px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      transition: border-color 0.25s;
    }
    .rwp-tc-card:hover { border-color: rgba(235,113,43,0.28); }
    .rwp-tc-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    }
    .rwp-tc-stars { display: flex; gap: 2px; }
    .rwp-tc-text {
      font-family: Manrope,Inter,sans-serif;
      font-size: 14.5px;
      line-height: 1.65;
      color: rgba(255,255,255,0.6);
      margin: 0;
      flex: 1;
    }
    .rwp-tc-author {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.055);
    }
    .rwp-tc-avatar {
      width: 40px; height: 40px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid rgba(235,113,43,0.2);
      flex-shrink: 0;
    }
    .rwp-tc-name {
      font-family: Manrope,Inter,sans-serif;
      font-size: 13.5px;
      font-weight: 700;
      color: #fff;
    }
    .rwp-tc-role {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11.5px;
      color: rgba(255,255,255,0.35);
      margin-top: 2px;
    }

    @media (max-width: 768px) {
      .rwp-testimonials { padding: 60px 0 50px; }
      .rwp-testimonials-header { flex-direction: column; align-items: flex-start; gap: 0; padding: 0 20px 36px; }
      .rwp-tc-proof-bar { padding: 0 20px; gap: 16px; }
      .rwp-tc-card { width: 300px; padding: 20px 22px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="rwp-testimonials" id="testimonials">

        {/* ── Section header ── */}
        <div className="rwp-testimonials-header">
          <div className="rwp-testimonials-header-left">
            <div className="rwp-testimonials-badge">
              <div className="rwp-testimonials-badge-dot" />
              <span className="rwp-testimonials-badge-text">Rider Stories</span>
            </div>
            <h2 className="rwp-testimonials-heading">
              Real riders.<br />
              <em>Real results.</em>
            </h2>
            <p className="rwp-testimonials-sub">
              From solo weekend warriors to club managers running hundreds of members — here is what the community says.
            </p>
          </div>
        </div>

        {/* ── Social proof bar ── */}
        <SocialProofBar />

        {/* ── Carousel rows ── */}
        <div className="rwp-tc-rows">
          <InfiniteRow items={TESTIMONIALS_ROW1} direction="left" speed={30} />
          <InfiniteRow items={TESTIMONIALS_ROW2} direction="right" speed={26} />
        </div>

      </section>
    </>
  );
};
