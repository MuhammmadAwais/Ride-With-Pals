// @ts-nocheck
import React, { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(235,113,43,0.1)"/>
    <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#EB712B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(255,255,255,0.03)"/>
    <path d="M5.5 5.5L9.5 9.5M9.5 5.5L5.5 9.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// Rider plan icon
const RiderIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EB712B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/>
    <circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M8 17.5H15"/>
    <path d="M15 6h-5l-2 5 3 2 1.5 4.5"/>
    <circle cx="15" cy="5" r="1"/>
    <path d="M9.5 8.5L14 10l2-4"/>
  </svg>
);

// Pro / Club icon
const ProIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EB712B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// Elite icon
const EliteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EB712B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ── Plan data ─────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "rider",
    Icon: RiderIcon,
    name: "Rider",
    tagline: "For solo explorers",
    description: "Start discovering rides and connect with your local cycling scene — completely free.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start for free",
    ctaHref: "/signup",
    highlight: false,
    features: [
      { text: "Browse & join public rides", ok: true },
      { text: "View club calendars & events", ok: true },
      { text: "Activity feed & ride history", ok: true },
      { text: "Up to 2 club memberships", ok: true },
      { text: "In-app marketplace", ok: false },
      { text: "Saved routes & itineraries", ok: false },
      { text: "Performance analytics", ok: false },
      { text: "Club management tools", ok: false },
    ],
  },
  {
    id: "pro",
    Icon: ProIcon,
    name: "Pro",
    tagline: "Most popular",
    description: "Everything you need to run a serious club and unlock the full power of the platform.",
    monthlyPrice: 9,
    yearlyPrice: 7,
    cta: "Get Pro",
    ctaHref: "/signup",
    highlight: true,
    features: [
      { text: "Everything in Rider", ok: true },
      { text: "Unlimited club memberships", ok: true },
      { text: "Marketplace — buy & sell gear", ok: true },
      { text: "Saved routes & itineraries", ok: true },
      { text: "Performance analytics dashboard", ok: true },
      { text: "Manage 1 club (up to 50 members)", ok: true },
      { text: "Club news & promo tools", ok: false },
      { text: "Multi-admin permissions", ok: false },
    ],
  },
  {
    id: "elite",
    Icon: EliteIcon,
    name: "Elite Club",
    tagline: "For club owners",
    description: "The complete ops toolkit for clubs that mean business — from subscriptions to leaderboards.",
    monthlyPrice: 29,
    yearlyPrice: 22,
    cta: "Go Elite",
    ctaHref: "/signup",
    highlight: false,
    features: [
      { text: "Everything in Pro", ok: true },
      { text: "Unlimited club members", ok: true },
      { text: "Club news & media publishing", ok: true },
      { text: "Discount & promo engine", ok: true },
      { text: "Subscription & wallet management", ok: true },
      { text: "Advanced leaderboards & ranking", ok: true },
      { text: "Multi-admin role permissions", ok: true },
      { text: "Priority support + onboarding", ok: true },
    ],
  },
];

// ── Pricing Card ──────────────────────────────────────────────────────────────

const PricingCard = ({ plan, billing }) => {
  const { id, Icon, name, tagline, description, monthlyPrice, yearlyPrice, cta, ctaHref, highlight, features } = plan;
  const price = billing === "monthly" ? monthlyPrice : yearlyPrice;

  return (
    <div className={`rwp-pc ${highlight ? "rwp-pc--highlight" : ""}`}>
      {/* Top strip */}
      <div className="rwp-pc-top">
        <div className="rwp-pc-icon">
          <Icon />
        </div>
        <div className={`rwp-pc-tag ${highlight ? "rwp-pc-tag--accent" : ""}`}>{tagline}</div>
      </div>

      {/* Name + description */}
      <div className="rwp-pc-identity">
        <div className="rwp-pc-name">{name}</div>
        <p className="rwp-pc-desc">{description}</p>
      </div>

      {/* Price */}
      <div className="rwp-pc-price-block">
        {price === 0 ? (
          <span className="rwp-pc-price-free">Free</span>
        ) : (
          <div className="rwp-pc-price-row">
            <span className="rwp-pc-currency">$</span>
            <span className="rwp-pc-amount">{price}</span>
            <span className="rwp-pc-per">/ mo{billing === "yearly" ? ", billed yearly" : ""}</span>
          </div>
        )}
        {billing === "yearly" && price > 0 && (
          <div className="rwp-pc-save-note">
            Save ${(monthlyPrice - yearlyPrice) * 12}/yr vs monthly
          </div>
        )}
      </div>

      {/* CTA */}
      <a href={ctaHref} className={`rwp-pc-cta ${highlight ? "rwp-pc-cta--primary" : "rwp-pc-cta--secondary"}`}>
        {cta}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7h10M8 3l4 4-4 4"/>
        </svg>
      </a>

      {/* Divider */}
      <div className="rwp-pc-divider" />

      {/* Features */}
      <ul className="rwp-pc-features">
        {features.map((f, i) => (
          <li key={i} className={`rwp-pc-feature ${f.ok ? "" : "rwp-pc-feature--off"}`}>
            {f.ok ? <CheckIcon /> : <CrossIcon />}
            {f.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const PricingSection: React.FC = () => {
  const [billing, setBilling] = useState("monthly");

  const css = `
    /* ── Section shell ── */
    .rwp-pricing {
      padding: 120px 40px;
      background: transparent;
      position: relative;
      overflow: hidden;
    }



    /* ── Header area ── */
    .rwp-pricing-header {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
      max-width: 1160px;
      margin: 0 auto 64px;
    }
    .rwp-pricing-header-left {}
    .rwp-pricing-header-right {
      display: flex;
      justify-content: flex-end;
    }

    /* Badge */
    .rwp-pricing-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid rgba(235,113,43,0.3);
      border-radius: 100px;
      padding: 5px 13px;
      margin-bottom: 20px;
    }
    .rwp-pricing-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #EB712B;
    }
    .rwp-pricing-badge-text {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px; font-weight: 700;
      color: #EB712B;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }
    .rwp-pricing-heading {
      font-family: Manrope,Inter,sans-serif;
      font-size: clamp(32px, 3.8vw, 50px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.08;
      margin: 0 0 18px;
    }
    .rwp-pricing-heading em {
      font-style: normal;
      color: #EB712B;
    }
    .rwp-pricing-sub {
      font-family: Manrope,Inter,sans-serif;
      font-size: 15px;
      color: rgba(255,255,255,0.38);
      line-height: 1.65;
      margin: 0 0 32px;
      max-width: 420px;
    }

    /* Toggle */
    .rwp-pricing-toggle-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .rwp-pricing-toggle {
      display: inline-flex;
      background: #111;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 100px;
      padding: 3px;
    }
    .rwp-pricing-toggle-btn {
      font-family: Manrope,Inter,sans-serif;
      font-size: 13px; font-weight: 600;
      padding: 8px 18px;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .rwp-pricing-toggle-btn.on  { background: #EB712B; color: #fff; }
    .rwp-pricing-toggle-btn.off { background: transparent; color: rgba(255,255,255,0.4); }
    .rwp-pricing-toggle-btn.off:hover { color: rgba(255,255,255,0.75); }
    .rwp-pricing-save-pill {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px; font-weight: 700;
      color: #EB712B;
      background: rgba(235,113,43,0.08);
      border: 1px solid rgba(235,113,43,0.2);
      border-radius: 100px;
      padding: 3px 10px;
      letter-spacing: 0.03em;
      animation: rwp-fadein 0.3s ease;
    }
    @keyframes rwp-fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

    /* App screenshot preview */
    .rwp-pricing-preview {
      position: relative;
      width: 100%;
      max-width: 480px;
    }
    .rwp-pricing-preview-frame {
      width: 100%;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
      position: relative;
    }
    .rwp-pricing-preview img {
      width: 100%;
      display: block;
      border-radius: 15px;
    }
    /* Subtle top bar above screenshot */
    .rwp-pricing-preview-bar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 14px;
      background: #111;
      border-radius: 16px 16px 0 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .rwp-pricing-preview-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
    }
    .rwp-pricing-preview-label {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.3);
      margin-left: 4px;
    }
    /* Floating "included in all plans" badge */
    .rwp-pricing-preview-badge {
      position: absolute;
      bottom: -14px;
      left: 50%;
      transform: translateX(-50%);
      background: #0d0d0d;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 100px;
      padding: 6px 16px;
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.4);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .rwp-pricing-preview-badge-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #4ade80;
      box-shadow: 0 0 6px rgba(74,222,128,0.6);
    }

    /* ── Cards grid ── */
    .rwp-pricing-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1.15fr 1fr;
      gap: 0;
      max-width: 1160px;
      margin: 0 auto;
      align-items: stretch;
    }

    /* ── Card ── */
    .rwp-pc {
      background: #0a0a0a;
      border: 1px solid rgba(255,255,255,0.07);
      padding: 32px 28px;
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      transition: border-color 0.25s;
    }
    /* Left card: rounded left corners */
    .rwp-pc:first-child {
      border-radius: 20px 0 0 20px;
      border-right: none;
    }
    /* Middle card: full border, slightly elevated */
    .rwp-pc--highlight {
      background: #0d0d0d;
      border-color: #EB712B !important;
      border-radius: 20px;
      padding: 36px 30px;
      z-index: 2;
      box-shadow: 0 0 0 1px #EB712B, 0 24px 64px rgba(0,0,0,0.6);
      margin: -8px 0;
    }
    /* Right card: rounded right corners */
    .rwp-pc:last-child {
      border-radius: 0 20px 20px 0;
      border-left: none;
    }
    .rwp-pc:not(.rwp-pc--highlight):hover {
      border-color: rgba(235,113,43,0.2);
    }

    .rwp-pc-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .rwp-pc-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: rgba(235,113,43,0.07);
      border: 1px solid rgba(235,113,43,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rwp-pc-tag {
      font-family: Manrope,Inter,sans-serif;
      font-size: 10px; font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 100px;
      padding: 3px 10px;
    }
    .rwp-pc-tag--accent {
      color: #EB712B;
      border-color: rgba(235,113,43,0.35);
      background: rgba(235,113,43,0.06);
    }

    .rwp-pc-identity { margin-bottom: 24px; }
    .rwp-pc-name {
      font-family: Manrope,Inter,sans-serif;
      font-size: 22px; font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .rwp-pc-desc {
      font-family: Manrope,Inter,sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.38);
      line-height: 1.6;
      margin: 0;
    }

    .rwp-pc-price-block { margin-bottom: 22px; }
    .rwp-pc-price-free {
      font-family: Manrope,Inter,sans-serif;
      font-size: 42px; font-weight: 900;
      color: #EB712B;
      letter-spacing: -0.04em;
    }
    .rwp-pc-price-row {
      display: flex;
      align-items: baseline;
      gap: 4px;
    }
    .rwp-pc-currency {
      font-family: Manrope,Inter,sans-serif;
      font-size: 22px; font-weight: 700;
      color: rgba(255,255,255,0.5);
      align-self: flex-start;
      margin-top: 8px;
    }
    .rwp-pc-amount {
      font-family: Manrope,Inter,sans-serif;
      font-size: 48px; font-weight: 900;
      color: #fff;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .rwp-pc-per {
      font-family: Manrope,Inter,sans-serif;
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      margin-bottom: 4px;
      align-self: flex-end;
    }
    .rwp-pc-save-note {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px;
      color: rgba(235,113,43,0.7);
      margin-top: 4px;
    }

    .rwp-pc-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 13.5px; font-weight: 700;
      padding: 13px;
      border-radius: 12px;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
      margin-bottom: 24px;
    }
    .rwp-pc-cta--primary {
      background: #EB712B;
      color: #fff;
      border: 1px solid #EB712B;
    }
    .rwp-pc-cta--primary:hover { background: #d4631f; transform: translateY(-1px); }
    .rwp-pc-cta--secondary {
      background: transparent;
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .rwp-pc-cta--secondary:hover { border-color: rgba(255,255,255,0.22); color: #fff; transform: translateY(-1px); }

    .rwp-pc-divider {
      width: 100%;
      height: 1px;
      background: rgba(255,255,255,0.06);
      margin-bottom: 22px;
    }

    .rwp-pc-features {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 11px;
      flex: 1;
    }
    .rwp-pc-feature {
      display: flex;
      align-items: center;
      gap: 9px;
      font-family: Manrope,Inter,sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.65);
      font-weight: 500;
    }
    .rwp-pc-feature--off { color: rgba(255,255,255,0.2); }

    /* ── Footer note ── */
    .rwp-pricing-footer {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-top: 48px;
      font-family: Manrope,Inter,sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.2);
    }
    .rwp-pricing-footer a {
      color: rgba(235,113,43,0.6);
      text-decoration: none;
      transition: color 0.2s;
    }
    .rwp-pricing-footer a:hover { color: #EB712B; }

    /* ── Responsive ── */
    @media (max-width: 1024px) {
      .rwp-pricing-header { grid-template-columns: 1fr; gap: 32px; }
      .rwp-pricing-header-right { justify-content: flex-start; }
      .rwp-pricing-preview { max-width: 480px; }
    }
    @media (max-width: 860px) {
      .rwp-pricing { padding: 64px 20px; }
      .rwp-pricing-grid { grid-template-columns: 1fr; gap: 12px; max-width: 480px; }
      .rwp-pc:first-child { border-radius: 20px; border-right: 1px solid rgba(255,255,255,0.07); }
      .rwp-pc:last-child  { border-radius: 20px; border-left: 1px solid rgba(255,255,255,0.07); }
      .rwp-pc--highlight  { margin: 0; }
      .rwp-pricing-header { margin-bottom: 40px; }
      .rwp-pricing-preview { display: none; }
    }
    @media (max-width: 480px) {
      .rwp-pricing-heading { font-size: 30px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="rwp-pricing" id="pricing">

        {/* ─── Header: copy left, app preview right ─── */}
        <div className="rwp-pricing-header">
          <div className="rwp-pricing-header-left">
            <div className="rwp-pricing-badge">
              <div className="rwp-pricing-badge-dot" />
              <span className="rwp-pricing-badge-text">Pricing</span>
            </div>
            <h2 className="rwp-pricing-heading">
              One platform.<br />
              <em>Three paths</em> forward.
            </h2>
            <p className="rwp-pricing-sub">
              Whether you are a weekend rider or running a 500-member club — there is a plan that fits. Start free, upgrade as you grow. No contracts.
            </p>

            {/* Billing toggle */}
            <div className="rwp-pricing-toggle-row">
              <div className="rwp-pricing-toggle">
                <button
                  className={`rwp-pricing-toggle-btn ${billing === "monthly" ? "on" : "off"}`}
                  onClick={() => setBilling("monthly")}
                >Monthly</button>
                <button
                  className={`rwp-pricing-toggle-btn ${billing === "yearly" ? "on" : "off"}`}
                  onClick={() => setBilling("yearly")}
                >Yearly</button>
              </div>
              {billing === "yearly" && (
                <span className="rwp-pricing-save-pill">Save up to 25%</span>
              )}
            </div>
          </div>

          {/* Group Cycling Image — right side */}
          <div className="rwp-pricing-header-right">
            <div className="rwp-pricing-preview">
              <div className="rwp-pricing-preview-frame">
                <div className="rwp-pricing-preview-bar">
                  <div className="rwp-pricing-preview-dot" style={{ background: "#ff5f57" }} />
                  <div className="rwp-pricing-preview-dot" style={{ background: "#febc2e" }} />
                  <div className="rwp-pricing-preview-dot" style={{ background: "#28c840" }} />
                  <span className="rwp-pricing-preview-label">Ride With Pals — Community Rides</span>
                </div>
                <img
                  src="/landing/assets/images/pricing-cyclists.jpg"
                  alt="Ride With Pals cyclists group ride"
                  loading="lazy"
                />
              </div>
              <div className="rwp-pricing-preview-badge">
                <div className="rwp-pricing-preview-badge-dot" />
                Join 12,000+ active riders on the road
              </div>
            </div>
          </div>
        </div>

        {/* ─── Cards ─── */}
        <div className="rwp-pricing-grid">
          {PLANS.map(plan => (
            <PricingCard key={plan.id} plan={plan} billing={billing} />
          ))}
        </div>

        {/* ─── Footer ─── */}
        <div className="rwp-pricing-footer">
          All plans include a 14-day free trial &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp;
          <a href="/contact">Questions? Talk to us →</a>
        </div>

      </section>
    </>
  );
};
