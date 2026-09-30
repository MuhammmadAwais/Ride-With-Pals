// @ts-nocheck
import React, { useState } from "react";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { STRIPE_PAYMENT_LINKS } from "../../../Constants";

// ── Icons ─────────────────────────────────────────────────────────────────────

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(235,113,43,0.1)"/>
    <path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke="#EB712B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7.5" cy="7.5" r="7.5" fill="rgba(255,255,255,0.03)"/>
    <path d="M5.5 5.5L9.5 9.5M9.5 5.5L5.5 9.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

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

const ProIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EB712B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const EliteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EB712B" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

// ── Plan data ─────────────────────────────────────────────────────────────────

const CLUB_PLANS = () => [
  {
    id: "free-club",
    Icon: ProIcon,
    name: t`Free Club`,
    tagline: t`Up to 15 members`,
    description: t`Everything you need to set up your club and run weekly group sessions.`,
    isFree: true,
    price: "0",
    regularPrice: null,
    promoBadge: null,
    intervalLabel: "",
    cta: t`Start for Free`,
    ctaHref: "/signup?plan=free_club",
    highlight: false,
    microcopy: null,
    features: [
      { text: t`Up to 15 club members`, ok: true },
      { text: t`Activity & ride scheduling`, ok: true },
      { text: t`Route sharing with GPX downloads`, ok: true },
      { text: t`Member chat & announcements`, ok: true },
      { text: t`Unlimited members (no cap)`, ok: false },
      { text: t`Member fee tracking (Paid / Not Renewed)`, ok: false },
      { text: t`Club shop integrated with Stripe`, ok: false },
      { text: t`Paid activities & event ticketing`, ok: false },
    ],
  },
  {
    id: "gold-club",
    Icon: EliteIcon,
    name: t`Gold Club`,
    tagline: t`For clubs & shops`,
    description: t`Everything you need to run, monetize, and scale your sports community or shop activities.`,
    isFree: false,
    promoBadge: t`LAUNCH OFFER - SAVE €41`,
    regularPrice: "130",
    price: "89",
    intervalLabel: t`/ year (billed annually)`,
    cta: t`Get Gold Launch Offer`,
    ctaHref: STRIPE_PAYMENT_LINKS.GOLD_CLUB_YEARLY_PROMO || "/signup?plan=gold_club",
    highlight: true,
    microcopy: t`One single membership fee or gear sale covers the whole year.`,
    features: [
      { text: t`Unlimited members (no 15-member cap)`, ok: true },
      { text: t`Member fee tracking (Paid / Not Renewed status)`, ok: true },
      { text: t`Club shop integrated with Stripe`, ok: true },
      { text: t`Paid activities and workshops`, ok: true },
      { text: t`Verified Gold community badge`, ok: true },
      { text: t`GPX downloads & Strava sync`, ok: true },
      { text: t`Multiple admins & ride leaders`, ok: true },
    ],
  },
];

const ATHLETE_PLANS = () => [
  {
    id: "free-athlete",
    Icon: RiderIcon,
    name: t`Free Athlete`,
    tagline: t`Basic Access`,
    description: t`Join clubs, find group rides, and connect with athletes near you.`,
    isFree: true,
    price: "0",
    regularPrice: null,
    promoBadge: null,
    intervalLabel: "",
    cta: t`Start for Free`,
    ctaHref: "/signup",
    highlight: false,
    microcopy: null,
    features: [
      { text: t`Join clubs & local communities`, ok: true },
      { text: t`1-Tap RSVP to rides and activities`, ok: true },
      { text: t`Activity-specific & direct chat`, ok: true },
      { text: t`Sell gear on Marketplace (up to 2 items)`, ok: true },
      { text: t`Strava activity sync`, ok: false },
      { text: t`GPX route downloads to bike computer`, ok: false },
      { text: t`Club leaderboards & distance rankings`, ok: false },
    ],
  },
  {
    id: "premium-athlete",
    Icon: ProIcon,
    name: t`Premium Athlete`,
    tagline: t`For dedicated riders`,
    description: t`Get the most out of every ride and run with advanced integrations, route downloads, and verified community status.`,
    isFree: false,
    promoBadge: t`LAUNCH OFFER - SAVE 10€`,
    regularPrice: "24.99",
    price: "14.99",
    intervalLabel: t`/ year (billed annually)`,
    cta: t`Get Athlete Premium`,
    ctaHref: STRIPE_PAYMENT_LINKS.ATHLETE_YEARLY_PROMO || "/signup?plan=athlete",
    highlight: true,
    microcopy: t`14.99€/year. That's about 4 energy gels for 365 days of community.`,
    features: [
      { text: t`Strava integration: Automatic activity sync and verified stats`, ok: true },
      { text: t`GPX route downloads: Export routes directly to your cycling computer or watch`, ok: true },
      { text: t`Club leaderboards: Compete in distance and attendance rankings`, ok: true },
      { text: t`Extra Marketplace listing: Keep more second-hand gear active at once`, ok: true },
      { text: t`Exclusive profile badge: Stand out as a verified supporter with orange community ring`, ok: true },
    ],
  },
];

// ── Pricing Card ──────────────────────────────────────────────────────────────

const PricingCard = ({ plan }) => {
  const { Icon, name, tagline, description, isFree, regularPrice, promoBadge, price, intervalLabel, cta, ctaHref, highlight, microcopy, features } = plan;
  const isExternal = ctaHref && ctaHref.startsWith("http");

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
        {isFree ? (
          <div className="rwp-pc-price-row">
            <span className="rwp-pc-amount">0</span>
            <span className="rwp-pc-currency">€</span>
          </div>
        ) : (
          <>
            {regularPrice && (
              <div className="rwp-pc-promo-badge-wrap">
                {promoBadge && <span className="rwp-pc-promo-pill">{promoBadge}</span>}
                <span className="rwp-pc-strike-amount">{regularPrice}€</span>
              </div>
            )}
            <div className="rwp-pc-price-row">
              <span className="rwp-pc-amount">{price}</span>
              <span className="rwp-pc-currency">€</span>
              {intervalLabel && <span className="rwp-pc-per">{intervalLabel}</span>}
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <a
        href={ctaHref}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`rwp-pc-cta ${highlight ? "rwp-pc-cta--primary" : "rwp-pc-cta--secondary"}`}
      >
        {cta}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 7h10M8 3l4 4-4 4"/>
        </svg>
      </a>

      {microcopy && (
        <div className="rwp-pc-microcopy">
          {microcopy}
        </div>
      )}

      {/* Divider */}
      <div className="rwp-pc-divider" />

      {/* Features */}
      <ul className="rwp-pc-features">
        {features.map((f, i) => (
          <li key={i} className={`rwp-pc-feature ${f.ok ? "" : "rwp-pc-feature--off"}`}>
            {f.ok ? <CheckIcon /> : <CrossIcon />}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const PricingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"clubs" | "athletes">("clubs");

  const css = `
    /* ── Section shell ── */
    .rwp-pricing {
      padding: 120px 24px;
      background: transparent;
      position: relative;
      overflow: hidden;
    }

    /* ── Header area ── */
    .rwp-pricing-header {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 780px;
      margin: 0 auto 40px;
    }

    /* Badge */
    .rwp-pricing-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      border: 1px solid rgba(235,113,43,0.3);
      border-radius: 100px;
      padding: 5px 14px;
      margin-bottom: 20px;
      background: rgba(235,113,43,0.04);
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
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .rwp-pricing-heading {
      font-family: Manrope,Inter,sans-serif;
      font-size: clamp(32px, 3.8vw, 48px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.15;
      margin: 0 0 16px;
    }
    .rwp-pricing-sub {
      font-family: Manrope,Inter,sans-serif;
      font-size: 16px;
      color: rgba(255,255,255,0.65);
      line-height: 1.6;
      margin: 0 auto;
      max-width: 660px;
    }

    /* ── Audience Tabs ── */
    .rwp-pricing-tabs-wrap {
      display: flex;
      justify-content: center;
      margin: 0 auto 52px;
      position: relative;
      z-index: 2;
    }
    .rwp-pricing-tabs {
      display: inline-flex;
      background: #0d0d0d;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 100px;
      padding: 5px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .rwp-pricing-tab-btn {
      font-family: Manrope,Inter,sans-serif;
      font-size: 14px;
      font-weight: 700;
      padding: 10px 26px;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      transition: all 0.22s ease;
    }
    .rwp-pricing-tab-btn.active {
      background: #EB712B;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(235, 113, 43, 0.35);
    }
    .rwp-pricing-tab-btn:not(.active) {
      background: transparent;
      color: rgba(255, 255, 255, 0.55);
    }
    .rwp-pricing-tab-btn:not(.active):hover {
      color: #ffffff;
    }

    /* ── Cards grid (2-column layout) ── */
    .rwp-pricing-grid {
      position: relative;
      z-index: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      max-width: 880px;
      margin: 0 auto;
      align-items: stretch;
    }

    /* ── Card ── */
    .rwp-pc {
      background: #0a0a0a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 36px 32px;
      display: flex;
      flex-direction: column;
      position: relative;
      transition: border-color 0.25s, transform 0.2s;
    }
    .rwp-pc:hover {
      border-color: rgba(235,113,43,0.3);
    }
    .rwp-pc--highlight {
      background: #0d0d0d;
      border-color: #EB712B !important;
      box-shadow: 0 0 0 1px #EB712B, 0 20px 50px rgba(235,113,43,0.12), 0 24px 64px rgba(0,0,0,0.7);
    }

    .rwp-pc-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .rwp-pc-icon {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: rgba(235,113,43,0.08);
      border: 1px solid rgba(235,113,43,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rwp-pc-tag {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 100px;
      padding: 4px 12px;
    }
    .rwp-pc-tag--accent {
      color: #EB712B;
      border-color: rgba(235,113,43,0.35);
      background: rgba(235,113,43,0.08);
    }

    .rwp-pc-identity { margin-bottom: 22px; }
    .rwp-pc-name {
      font-family: Manrope,Inter,sans-serif;
      font-size: 24px; font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }
    .rwp-pc-desc {
      font-family: Manrope,Inter,sans-serif;
      font-size: 13.5px;
      color: rgba(255,255,255,0.55);
      line-height: 1.6;
      margin: 0;
      min-height: 42px;
    }

    .rwp-pc-price-block {
      margin-bottom: 22px;
      min-height: 82px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    .rwp-pc-promo-badge-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;
    }
    .rwp-pc-promo-pill {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11px;
      font-weight: 800;
      color: #EB712B;
      background: rgba(235,113,43,0.15);
      border: 1px solid rgba(235,113,43,0.35);
      border-radius: 100px;
      padding: 3px 10px;
      letter-spacing: 0.04em;
    }
    .rwp-pc-strike-amount {
      font-family: Manrope,Inter,sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: rgba(255,255,255,0.4);
      text-decoration: line-through;
      text-decoration-color: #EB712B;
      text-decoration-thickness: 2px;
    }
    .rwp-pc-price-row {
      display: flex;
      align-items: baseline;
      gap: 3px;
    }
    .rwp-pc-currency {
      font-family: Manrope,Inter,sans-serif;
      font-size: 24px; font-weight: 800;
      color: #EB712B;
      margin-right: 2px;
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
      font-size: 13.5px;
      color: rgba(255,255,255,0.45);
      margin-left: 4px;
      font-weight: 500;
    }

    .rwp-pc-cta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      font-family: Manrope,Inter,sans-serif;
      font-size: 14px; font-weight: 700;
      padding: 14px;
      border-radius: 12px;
      transition: background 0.2s, border-color 0.2s, transform 0.15s;
      margin-bottom: 12px;
    }
    .rwp-pc-cta--primary {
      background: #EB712B;
      color: #fff;
      border: 1px solid #EB712B;
    }
    .rwp-pc-cta--primary:hover { background: #d4631f; transform: translateY(-1px); }
    .rwp-pc-cta--secondary {
      background: transparent;
      color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .rwp-pc-cta--secondary:hover { border-color: rgba(255,255,255,0.3); color: #fff; transform: translateY(-1px); }

    .rwp-pc-microcopy {
      font-family: Manrope,Inter,sans-serif;
      font-size: 11.5px;
      color: rgba(235,113,43,0.9);
      text-align: center;
      line-height: 1.45;
      margin-bottom: 16px;
      font-style: italic;
    }

    .rwp-pc-divider {
      width: 100%;
      height: 1px;
      background: rgba(255,255,255,0.06);
      margin-top: 8px;
      margin-bottom: 22px;
    }

    .rwp-pc-features {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }
    .rwp-pc-feature {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-family: Manrope,Inter,sans-serif;
      font-size: 13.5px;
      color: rgba(255,255,255,0.75);
      line-height: 1.45;
      font-weight: 500;
    }
    .rwp-pc-feature--off { color: rgba(255,255,255,0.25); }

    /* ── Footer note ── */
    .rwp-pricing-footer {
      position: relative;
      z-index: 1;
      text-align: center;
      margin-top: 52px;
      font-family: Manrope,Inter,sans-serif;
      font-size: 13.5px;
      color: rgba(255,255,255,0.4);
    }
    .rwp-pricing-footer a {
      color: rgba(235,113,43,0.85);
      text-decoration: none;
      transition: color 0.2s;
    }
    .rwp-pricing-footer a:hover { color: #EB712B; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .rwp-pricing { padding: 80px 16px; }
      .rwp-pricing-grid { grid-template-columns: 1fr; gap: 20px; }
      .rwp-pricing-tabs { width: 100%; max-width: 360px; }
      .rwp-pricing-tab-btn { flex: 1; padding: 10px 14px; font-size: 13px; text-align: center; }
      .rwp-pc { padding: 28px 20px; }
      .rwp-pricing-heading { font-size: 28px; }
    }
  `;

  const plans = activeTab === "clubs" ? CLUB_PLANS() : ATHLETE_PLANS();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="rwp-pricing" id="pricing">

        {/* ─── Header ─── */}
        <div className="rwp-pricing-header">
          <div className="rwp-pricing-badge">
            <div className="rwp-pricing-badge-dot" />
            <span className="rwp-pricing-badge-text"><Trans>PRICING</Trans></span>
          </div>
          <h2 className="rwp-pricing-heading">
            <Trans>Simple, transparent pricing for growing communities.</Trans>
          </h2>
          <p className="rwp-pricing-sub">
            <Trans>
              Start for free with your club or squad, or unlock complete member management, payments and your club shop with Gold.
            </Trans>
          </p>
        </div>

        {/* ─── Audience Selector Tabs ─── */}
        <div className="rwp-pricing-tabs-wrap">
          <div className="rwp-pricing-tabs">
            <button
              className={`rwp-pricing-tab-btn ${activeTab === "clubs" ? "active" : ""}`}
              onClick={() => setActiveTab("clubs")}
            >
              <Trans>For Clubs &amp; Businesses</Trans>
            </button>
            <button
              className={`rwp-pricing-tab-btn ${activeTab === "athletes" ? "active" : ""}`}
              onClick={() => setActiveTab("athletes")}
            >
              <Trans>For Athletes</Trans>
            </button>
          </div>
        </div>

        {/* ─── Cards Grid ─── */}
        <div className="rwp-pricing-grid">
          {plans.map(plan => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        {/* ─── Footer ─── */}
        <div className="rwp-pricing-footer">
          <Trans>No hidden platform fees</Trans> &nbsp;·&nbsp; <Trans>Cancel anytime</Trans> &nbsp;·&nbsp;
          <a href="/contact"><Trans>Need custom arrangements? Talk to us →</Trans></a>
        </div>

      </section>
    </>
  );
};

