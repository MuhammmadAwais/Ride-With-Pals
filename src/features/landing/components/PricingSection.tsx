// @ts-nocheck
import React, { useState } from "react";

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="rgba(235,113,43,0.12)"/>
    <path d="M5 8L7 10L11 6" stroke="#EB712B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="8" fill="rgba(255,255,255,0.04)"/>
    <path d="M6 6L10 10M10 6L6 10" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BikeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6h-5l-1.5 4.5 3.5 1L14 17h4.5"/>
    <path d="M8 6h1.5l1 2.5"/>
    <path d="M9.5 8.5l3 1L14 6"/>
  </svg>
);

const ClubIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const EliteIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const PLANS = [
  {
    id: "rider",
    icon: BikeIcon,
    name: "Rider",
    description: "Perfect for solo cyclists who want to discover and join rides.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    cta: "Start free",
    ctaHref: "/signup",
    highlight: false,
    badge: null,
    features: [
      { text: "Browse & join public rides", included: true },
      { text: "View club calendars", included: true },
      { text: "Basic activity feed", included: true },
      { text: "Up to 2 club memberships", included: true },
      { text: "In-app marketplace", included: false },
      { text: "Saved rides & routes", included: false },
      { text: "Performance analytics", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    icon: ClubIcon,
    name: "Pro",
    description: "For dedicated riders and small club organisers who need more.",
    monthlyPrice: 9,
    yearlyPrice: 7,
    cta: "Get Pro",
    ctaHref: "/signup",
    highlight: true,
    badge: "Most Popular",
    features: [
      { text: "Everything in Rider", included: true },
      { text: "Unlimited club memberships", included: true },
      { text: "Marketplace buy & sell", included: true },
      { text: "Saved rides & routes", included: true },
      { text: "Performance analytics", included: true },
      { text: "Manage up to 1 club (50 members)", included: true },
      { text: "Club news & discount tools", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    id: "elite",
    icon: EliteIcon,
    name: "Elite Club",
    description: "Full power for serious club owners running a professional operation.",
    monthlyPrice: 29,
    yearlyPrice: 22,
    cta: "Go Elite",
    ctaHref: "/signup",
    highlight: false,
    badge: "Best Value",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited club members", included: true },
      { text: "Club news & media tools", included: true },
      { text: "Discount & promo engine", included: true },
      { text: "Subscription & wallet management", included: true },
      { text: "Advanced leaderboards", included: true },
      { text: "Multi-admin permissions", included: true },
      { text: "Priority support + onboarding", included: true },
    ],
  },
];

export const PricingSection: React.FC = () => {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const css = `
    .rwp-pricing {
      padding: 100px 40px;
      background: #050505;
    }
    .rwp-pricing-header {
      text-align: center;
      max-width: 620px;
      margin: 0 auto 60px;
    }
    .rwp-pricing-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border: 1px solid rgba(235,113,43,0.3);
      border-radius: 100px;
      padding: 6px 14px;
      margin-bottom: 24px;
    }
    .rwp-pricing-badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #EB712B;
    }
    .rwp-pricing-badge-text {
      font-family: Manrope, Inter, sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #EB712B;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .rwp-pricing-heading {
      font-family: Manrope, Inter, sans-serif;
      font-size: clamp(32px, 4vw, 52px);
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin: 0 0 16px;
    }
    .rwp-pricing-sub {
      font-family: Manrope, Inter, sans-serif;
      font-size: 16px;
      color: rgba(255,255,255,0.4);
      margin: 0 0 36px;
      line-height: 1.6;
    }

    /* Toggle */
    .rwp-pricing-toggle {
      display: inline-flex;
      align-items: center;
      background: #0d0d0d;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 100px;
      padding: 4px;
      gap: 2px;
      position: relative;
    }
    .rwp-pricing-toggle-btn {
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 20px;
      border-radius: 100px;
      border: none;
      cursor: pointer;
      transition: color 0.2s, background 0.2s;
      position: relative;
      z-index: 1;
    }
    .rwp-pricing-toggle-btn.active {
      background: #EB712B;
      color: #fff;
    }
    .rwp-pricing-toggle-btn.inactive {
      background: transparent;
      color: rgba(255,255,255,0.5);
    }
    .rwp-pricing-toggle-btn.inactive:hover {
      color: rgba(255,255,255,0.8);
    }
    .rwp-pricing-save-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: rgba(235,113,43,0.1);
      border: 1px solid rgba(235,113,43,0.2);
      border-radius: 100px;
      padding: 3px 10px;
      margin-left: 10px;
      font-family: Manrope, Inter, sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #EB712B;
      letter-spacing: 0.03em;
      vertical-align: middle;
    }

    /* Cards grid */
    .rwp-pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      max-width: 1100px;
      margin: 0 auto;
      align-items: start;
    }
    .rwp-pc {
      background: #0d0d0d;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 28px;
      position: relative;
      transition: border-color 0.25s, transform 0.25s;
    }
    .rwp-pc:hover {
      border-color: rgba(235,113,43,0.2);
      transform: translateY(-2px);
    }
    .rwp-pc.highlight {
      border-color: #EB712B;
      background: #0d0d0d;
    }
    .rwp-pc.highlight:hover {
      border-color: #EB712B;
    }

    /* Corner geometry accent on highlighted card */
    .rwp-pc.highlight::before {
      content: '';
      position: absolute;
      top: -1px;
      right: -1px;
      width: 80px;
      height: 80px;
      border-top: 2px solid #EB712B;
      border-right: 2px solid #EB712B;
      border-radius: 0 20px 0 0;
      pointer-events: none;
    }

    .rwp-pc-badge {
      position: absolute;
      top: -13px;
      left: 50%;
      transform: translateX(-50%);
      background: #EB712B;
      color: #fff;
      font-family: Manrope, Inter, sans-serif;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 4px 14px;
      border-radius: 100px;
      white-space: nowrap;
    }
    .rwp-pc-badge.alt {
      background: transparent;
      border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.5);
    }

    .rwp-pc-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(235,113,43,0.08);
      border: 1px solid rgba(235,113,43,0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #EB712B;
    }
    .rwp-pc-name {
      font-family: Manrope, Inter, sans-serif;
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      margin: 12px 0 6px;
    }
    .rwp-pc-desc {
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      line-height: 1.55;
      margin: 0;
    }

    .rwp-pc-price-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .rwp-pc-price-amount {
      font-family: Manrope, Inter, sans-serif;
      font-size: 44px;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.04em;
      line-height: 1;
    }
    .rwp-pc-price-amount.free { color: #EB712B; }
    .rwp-pc-price-unit {
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.35);
      font-weight: 500;
    }
    .rwp-pc-price-slash {
      font-family: Manrope, Inter, sans-serif;
      font-size: 20px;
      font-weight: 400;
      color: rgba(255,255,255,0.2);
      align-self: center;
    }

    .rwp-pc-features {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }
    .rwp-pc-feature {
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: Manrope, Inter, sans-serif;
      font-size: 13.5px;
      color: rgba(255,255,255,0.6);
      font-weight: 500;
    }
    .rwp-pc-feature.included { color: rgba(255,255,255,0.75); }
    .rwp-pc-feature.excluded { color: rgba(255,255,255,0.25); text-decoration: line-through; text-decoration-color: rgba(255,255,255,0.1); }

    .rwp-pc-cta {
      display: block;
      text-align: center;
      text-decoration: none;
      font-family: Manrope, Inter, sans-serif;
      font-size: 14px;
      font-weight: 700;
      padding: 14px;
      border-radius: 12px;
      transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
      cursor: pointer;
    }
    .rwp-pc-cta.primary {
      background: #EB712B;
      color: #fff;
      border: 1px solid #EB712B;
    }
    .rwp-pc-cta.primary:hover { background: #d4631f; transform: translateY(-1px); }
    .rwp-pc-cta.secondary {
      background: transparent;
      color: rgba(255,255,255,0.7);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .rwp-pc-cta.secondary:hover { border-color: rgba(255,255,255,0.25); color: #fff; transform: translateY(-1px); }

    .rwp-pricing-footer {
      text-align: center;
      margin-top: 40px;
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      color: rgba(255,255,255,0.25);
    }
    .rwp-pricing-footer a { color: rgba(235,113,43,0.7); text-decoration: none; }
    .rwp-pricing-footer a:hover { color: #EB712B; }

    @media (max-width: 900px) {
      .rwp-pricing { padding: 60px 20px; }
      .rwp-pricing-grid { grid-template-columns: 1fr; max-width: 480px; }
      .rwp-pc.highlight { order: -1; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="rwp-pricing" id="pricing">
        <div className="rwp-pricing-header">
          <div className="rwp-pricing-badge">
            <div className="rwp-pricing-badge-dot" />
            <span className="rwp-pricing-badge-text">Pricing</span>
          </div>
          <h2 className="rwp-pricing-heading">Simple plans.<br/>No surprises.</h2>
          <p className="rwp-pricing-sub">
            Start free and upgrade as your club grows. Cancel anytime.
          </p>

          {/* Billing Toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <div className="rwp-pricing-toggle">
              <button
                className={`rwp-pricing-toggle-btn ${billing === "monthly" ? "active" : "inactive"}`}
                onClick={() => setBilling("monthly")}
              >Monthly</button>
              <button
                className={`rwp-pricing-toggle-btn ${billing === "yearly" ? "active" : "inactive"}`}
                onClick={() => setBilling("yearly")}
              >Yearly</button>
            </div>
            {billing === "yearly" && (
              <span className="rwp-pricing-save-tag">Save up to 25%</span>
            )}
          </div>
        </div>

        <div className="rwp-pricing-grid">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            return (
              <div key={plan.id} className={`rwp-pc${plan.highlight ? " highlight" : ""}`}>
                {plan.badge && (
                  <div className={`rwp-pc-badge${plan.id === "elite" ? " alt" : ""}`}>{plan.badge}</div>
                )}

                <div>
                  <div className="rwp-pc-icon-wrap">
                    <Icon />
                  </div>
                  <div className="rwp-pc-name">{plan.name}</div>
                  <p className="rwp-pc-desc">{plan.description}</p>
                </div>

                <div className="rwp-pc-price-row">
                  {price === 0 ? (
                    <div className="rwp-pc-price-amount free">Free</div>
                  ) : (
                    <>
                      <div className="rwp-pc-price-slash">$</div>
                      <div className="rwp-pc-price-amount">{price}</div>
                      <div className="rwp-pc-price-unit">/ mo{billing === "yearly" ? ", billed yearly" : ""}</div>
                    </>
                  )}
                </div>

                <div className="rwp-pc-features">
                  {plan.features.map((f, i) => (
                    <div key={i} className={`rwp-pc-feature ${f.included ? "included" : "excluded"}`}>
                      {f.included ? <CheckIcon /> : <CrossIcon />}
                      {f.text}
                    </div>
                  ))}
                </div>

                <a
                  href={plan.ctaHref}
                  className={`rwp-pc-cta ${plan.highlight ? "primary" : "secondary"}`}
                >
                  {plan.cta} {plan.highlight && "→"}
                </a>
              </div>
            );
          })}
        </div>

        <div className="rwp-pricing-footer">
          All plans include a 14-day free trial. No credit card required. &nbsp;
          <a href="/contact">Questions? Talk to us →</a>
        </div>
      </section>
    </>
  );
};
