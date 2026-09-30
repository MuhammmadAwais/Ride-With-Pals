// @ts-nocheck
import React from "react";
import { Trans } from "@lingui/react/macro";

export const HeroSection: React.FC = () => {
  return (
    <section
      className="framer-1mln3qe"
      data-framer-name="Hero Section"
      id="home"
    >
      <style>{`
        .framer-1mln3qe {
          overflow: visible !important;
          padding-top: 130px !important;
          padding-bottom: 80px !important;
        }
        .framer-tvpdyg,
        .framer-iDUXM .framer-tvpdyg {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          width: 100% !important;
          max-width: 1200px !important;
          margin: 0 auto !important;
          padding: 0 20px !important;
          box-sizing: border-box !important;
        }
        .framer-1feyz7p,
        .framer-iDUXM .framer-1feyz7p {
          width: 100% !important;
          max-width: 1000px !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
        .framer-snfcfs,
        .framer-iDUXM .framer-snfcfs {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
          width: 100% !important;
        }
        .rwp-hero-title {
          max-width: 950px !important;
          margin: 0 auto 16px !important;
          line-height: 1.12 !important;
          text-align: center !important;
        }
        .rwp-hero-br {
          display: block;
        }
        @media (max-width: 600px) {
          .rwp-hero-br {
            display: none;
          }
        }
        .framer-1fdmd4e,
        .framer-iDUXM .framer-1fdmd4e {
          max-width: 900px !important;
          width: 100% !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          text-align: center !important;
        }
        .rwp-hero-sub {
          max-width: 860px !important;
          width: 100% !important;
          margin: 0 auto !important;
          font-size: 19px !important;
          line-height: 1.55 !important;
          text-align: center !important;
          color: rgba(255, 255, 255, 0.85) !important;
          text-wrap: balance !important;
          letter-spacing: -0.01em !important;
        }
        .rwp-hero-sub-small {
          text-align: center !important;
          color: rgba(255, 255, 255, 0.52) !important;
          font-size: 15.5px !important;
          line-height: 1.5 !important;
          margin: 14px auto 0 !important;
          font-family: Manrope, Inter, sans-serif !important;
          max-width: 720px !important;
          width: 100% !important;
          text-wrap: balance !important;
        }
        @media (max-width: 768px) {
          .rwp-hero-sub {
            font-size: 16px !important;
            line-height: 1.5 !important;
            max-width: 100% !important;
            padding: 0 8px !important;
          }
          .rwp-hero-sub-small {
            font-size: 14px !important;
            margin-top: 10px !important;
          }
        }
        .rwp-hero-cta-wrapper {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          align-self: center !important;
          width: 100% !important;
          max-width: 800px !important;
          margin: 32px auto 0 !important;
          z-index: 10 !important;
        }
        .rwp-hero-btn-group {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-wrap: wrap !important;
          gap: 16px !important;
        }
        .rwp-hero-primary-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 10px !important;
          padding: 15px 32px !important;
          background: #EB712B !important;
          color: #0d0d0d !important;
          font-family: Manrope, Inter, sans-serif !important;
          font-size: 15px !important;
          font-weight: 700 !important;
          border-radius: 100px !important;
          text-decoration: none !important;
          white-space: nowrap !important;
          box-shadow: 0 8px 24px rgba(235, 113, 43, 0.4) !important;
          transition: all 0.25s ease !important;
          cursor: pointer !important;
          width: auto !important;
          height: auto !important;
        }
        .rwp-hero-primary-btn:hover {
          background: #f08242 !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 12px 30px rgba(235, 113, 43, 0.55) !important;
        }
        .rwp-hero-secondary-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          padding: 15px 28px !important;
          border-radius: 100px !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.18) !important;
          color: #ffffff !important;
          font-family: Manrope, Inter, sans-serif !important;
          font-size: 15px !important;
          font-weight: 600 !important;
          text-decoration: none !important;
          white-space: nowrap !important;
          transition: all 0.25s ease !important;
          width: auto !important;
          height: auto !important;
        }
        .rwp-hero-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          transform: translateY(-2px) !important;
        }
        .rwp-hero-microcopy {
          font-family: Manrope, Inter, sans-serif !important;
          font-size: 12.5px !important;
          color: rgba(255, 255, 255, 0.48) !important;
          margin-top: 10px !important;
          text-align: center !important;
        }
        .rwp-hero-audience-bar {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          margin-top: 24px !important;
          padding: 8px 18px !important;
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 100px !important;
        }
        .rwp-hero-audience-label {
          font-family: Manrope, Inter, sans-serif !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #EB712B !important;
          text-transform: uppercase !important;
          letter-spacing: 0.07em !important;
          margin-right: 4px !important;
        }
        .rwp-hero-audience-pill {
          font-family: Manrope, Inter, sans-serif !important;
          font-size: 13px !important;
          color: rgba(255, 255, 255, 0.75) !important;
          font-weight: 500 !important;
        }
        .rwp-hero-audience-dot {
          color: rgba(255, 255, 255, 0.25) !important;
          font-size: 12px !important;
        }
      `}</style>
      <div className="framer-tvpdyg" data-framer-name="Container">
        <div
          className="framer-1feyz7p"
          data-framer-name="Left"
          style={
            { willChange: "transform", opacity: "1", transform: "none" } as any
          }
        >
          <div className="framer-snfcfs" data-framer-name="Title + Sub">
            <div className="framer-8pfceh-container">
              <div
                className="framer-q36ud framer-K8Bhh framer-lohjoe framer-v-lohjoe"
                data-framer-name="Default"
                style={
                  {
                    backgroundColor:
                      "var(--token-0bd9300c-1d9c-48e3-b47c-3d641fa8f8ff, rgb(5, 5, 5))",
                    borderRadius: "10px",
                    boxShadow:
                      "rgba(235, 113, 43, 0.15) 0px 1px 0px 0px inset, rgba(235, 113, 43, 0.15) 0px -1px 0px 0px inset, rgba(235, 113, 43, 0.4) 0px 1px 2px 0px, rgba(235, 113, 43, 0.19) 0px 3px 8px 0px, rgba(235, 113, 43, 0.05) 0px 6px 4px 0px, rgba(235, 113, 43, 0.01) 0px 11px 4px 0px, rgba(235, 113, 43, 0) 0px 16px 5px 0px",
                    opacity: "1",
                  } as any
                }
              >
                <div
                  className="framer-1u3q6hy"
                  data-framer-component-type="RichTextContainer"
                  style={
                    {
                      "--extracted-r6o4lv":
                        "var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43))",
                      "--framer-link-text-color": "rgb(0, 153, 255)",
                      "--framer-link-text-decoration": "underline",
                      transform: "none",
                      opacity: "1",
                    } as any
                  }
                >
                  <p
                    className="framer-text framer-styles-preset-1jsfakf"
                    data-styles-preset="VQGZB66Vz"
                    style={
                      {
                        "--framer-text-color":
                          "var(--extracted-r6o4lv, var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43)))",
                      } as any
                    }
                  >
                    <Trans>FOR CLUBS, SHOPS &amp; LOCAL SPORTS COMMUNITIES</Trans>
                  </p>
                </div>
              </div>
            </div>
            <div
              className="framer-n2cpvq"
              data-selection="true"
              data-framer-component-type="RichTextContainer"
              style={{ transform: "none", maxWidth: "950px", width: "100%" } as any}
            >
              <h1
                className="framer-text framer-styles-preset-1s297ft rwp-hero-title"
                data-styles-preset="SqFjj1czL"
                style={
                  {
                    "--framer-text-alignment": "center",
                    "--framer-text-color":
                      "var(--token-743cf692-1243-473f-93be-c36de257addf, rgb(255, 255, 255))",
                    maxWidth: "950px",
                    margin: "0 auto",
                    lineHeight: "1.12",
                  } as any
                }
              >
                <Trans>Build a sports community</Trans><br className="rwp-hero-br" /> <span style={{ color: "#EB712B" }}><Trans>people come back to.</Trans></span>
              </h1>
            </div>
            <div
              className="framer-1fdmd4e"
              data-framer-component-type="RichTextContainer"
              style={{ transform: "none", maxWidth: "900px", width: "100%", margin: "0 auto" } as any}
            >
              <p
                className="framer-text framer-styles-preset-1kqs40m rwp-hero-sub"
                data-styles-preset="nqwdXorsW"
              >
                <Trans>Ride With Pals helps cycling and running clubs, shops and local organisers manage activities, members, payments and communication in one place.</Trans>
              </p>
              <p className="rwp-hero-sub-small">
                <Trans>Replace scattered WhatsApp chats with a community your brand can grow.</Trans>
              </p>
            </div>
          </div>

          {/* ── Hero CTA Row & Microcopy ── */}
          <div className="rwp-hero-cta-wrapper">
            <div className="rwp-hero-btn-group">
              <a
                href="/signup"
                id="landing-signup-btn"
                className="rwp-hero-primary-btn"
              >
                <span><Trans>Create your community free</Trans></span>
                <svg width="15" height="15" viewBox="0 0 256 256" fill="#0d0d0d" style={{ transform: 'rotate(-45deg)' }}>
                  <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z" />
                </svg>
              </a>

              <a
                href="#how-it-works"
                className="rwp-hero-secondary-btn"
              >
                <span><Trans>See how it works</Trans></span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17l9.2-9.2M17 17V8H8" />
                </svg>
              </a>
            </div>

            <div className="rwp-hero-microcopy">
              <Trans>It’s free — for up to 15 members</Trans>
            </div>

            <div className="rwp-hero-audience-bar">
              <span className="rwp-hero-audience-label"><Trans>Built for</Trans></span>
              <span className="rwp-hero-audience-pill"><Trans>Cycling Clubs</Trans></span>
              <span className="rwp-hero-audience-dot">•</span>
              <span className="rwp-hero-audience-pill"><Trans>Running Groups</Trans></span>
              <span className="rwp-hero-audience-dot">•</span>
              <span className="rwp-hero-audience-pill"><Trans>Bike Shops</Trans></span>
              <span className="rwp-hero-audience-dot">•</span>
              <span className="rwp-hero-audience-pill"><Trans>Coaches</Trans></span>
              <span className="rwp-hero-audience-dot">•</span>
              <span className="rwp-hero-audience-pill"><Trans>Local Organisers</Trans></span>
            </div>
          </div>
        </div>
        <div
          className="framer-1s7qg2k"
          id="hero-screen"
          data-framer-appear-id="1s7qg2k"
          data-framer-name="Right"
          style={
            {
              willChange: "transform",
              opacity: "1",
              transform: "perspective(1200px) scale(1.12767) rotateX(19.15deg)",
            } as any
          }
        >
          <div className="framer-1dvoa88-container">
            <div
              className="framer-ANh7D framer-ug0ant framer-v-ug0ant"
              data-framer-name="Desktop"
              style={{ height: "100%", width: "100%", opacity: "1" } as any}
            >
              <div
                className="framer-1qwmqn4"
                data-border="true"
                data-framer-name="Image"
                style={
                  {
                    "--border-bottom-width": "1px",
                    "--border-color": "rgba(255, 255, 255, 0.05)",
                    "--border-left-width": "1px",
                    "--border-right-width": "1px",
                    "--border-style": "solid",
                    "--border-top-width": "1px",
                    backdropFilter: "blur(2px)",
                    backgroundColor:
                      "var(--token-142de566-1cef-4aec-a905-86f484066d50, rgb(13, 13, 13))",
                    mask: "linear-gradient(0deg, rgba(0, 0, 0, 0.15) 0%, rgb(0, 0, 0) 55%, rgb(0, 0, 0) 100%)",
                    borderRadius: "30px",
                    opacity: "1",
                  } as any
                }
              >
                <div
                  className="framer-1raztff"
                  data-border="true"
                  data-framer-name="Border"
                  style={
                    {
                      "--border-bottom-width": "1px",
                      "--border-color": "rgba(255, 255, 255, 0.12)",
                      "--border-left-width": "1px",
                      "--border-right-width": "1px",
                      "--border-style": "solid",
                      "--border-top-width": "1px",
                      borderRadius: "20px",
                      opacity: "1",
                    } as any
                  }
                >
                  <div
                    className="framer-12zjcz5"
                    data-framer-name="Image"
                    style={{ borderRadius: "19px", opacity: "1" } as any}
                  >
                    <div
                      data-framer-background-image-wrapper="true"
                      style={
                        {
                          position: "absolute",
                          borderRadius: "inherit",
                          cornerShape: "inherit",
                          inset: "0px",
                        } as any
                      }
                    >
                      <img
                        decoding="auto"
                        width="2400"
                        height="2391"
                        sizes="calc(max(max(max(min(min(max(100vw - 80px, 1px), 1200px), 1000px), 1px), 1px) - 20px, 1px) - 2px)"
                        srcset="/landing/assets/images/hero-dashboard.png 512w, /landing/assets/images/hero-dashboard.png 1024w, /landing/assets/images/hero-dashboard.png 2048w, /landing/assets/images/hero-dashboard.png 2400w"
                        src="/landing/assets/images/hero-dashboard.png"
                        alt="Ride With Pals club and community management dashboard"
                        style={
                          {
                            display: "block",
                            width: "100%",
                            height: "100%",
                            borderRadius: "inherit",
                            cornerShape: "inherit",
                            objectPosition: "center top",
                            objectFit: "cover",
                            filter: "brightness(1.12) contrast(1.05)",
                          } as any
                        }
                        data-ai-detector-processed="true"
                        fetchpriority="high"
                        decoding="async"
                      />
                      <div
                        style={
                          {
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            zIndex: "10000",
                          } as any
                        }
                      ></div>
                    </div>
                  </div>
                </div>
                <div
                  className="framer-1spt18s"
                  data-framer-name="Green Line"
                  style={
                    {
                      background:
                        "linear-gradient(90.00000000000155deg, rgba(235, 113, 43, 0) 0%, var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43)) 50%, rgba(235, 113, 43, 0) 100%)",
                      opacity: "1",
                    } as any
                  }
                ></div>
              </div>
              <div
                className="framer-vaznu5"
                data-framer-name="Glow"
                style={
                  {
                    backgroundColor:
                      "var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43))",
                    filter: "blur(50px)",
                    borderRadius: "100%",
                    opacity: "1",
                  } as any
                }
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
