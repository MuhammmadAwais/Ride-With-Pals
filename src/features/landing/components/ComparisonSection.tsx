// @ts-nocheck
import React from "react";
import { Trans } from "@lingui/react/macro";
import { useLingui } from "@lingui/react";

export const ComparisonSection: React.FC = () => {
  useLingui();
  const badItems = [
    {
      title: <Trans>Endless chats &amp; buried details:</Trans>,
      desc: <Trans>Routes, meeting points and GPX files get lost under hundreds of daily messages. Half the group arrives late or asks the same questions repeatedly.</Trans>,
    },
    {
      title: <Trans>Unorganised rosters &amp; no privacy:</Trans>,
      desc: <Trans>Phone numbers exposed in public groups, zero control over who joins, and no way to manage permissions or roles.</Trans>,
    },
    {
      title: <Trans>Chasing bank transfers &amp; cash:</Trans>,
      desc: <Trans>Manually checking bank statements, updating outdated spreadsheets, and awkward follow-ups for expired memberships.</Trans>,
    },
    {
      title: <Trans>Zero commercial return:</Trans>,
      desc: <Trans>Rides take hours to organize, but participants buy gear elsewhere and never see your store promotions or partner discounts.</Trans>,
    },
    {
      title: <Trans>No official voice:</Trans>,
      desc: <Trans>Important club announcements, weather cancellations or safety rules get buried under chatter and memes.</Trans>,
    },
  ];

  const goodItems = [
    {
      title: <Trans>Dedicated activity hub:</Trans>,
      desc: <Trans>Clean event pages with route maps, GPX downloads, pace levels and 1-tap RSVPs. Everyone knows where and when to show up.</Trans>,
    },
    {
      title: <Trans>Member directory &amp; role permissions:</Trans>,
      desc: <Trans>Private invite codes, join request approvals, and role management for founders, admins and ride leaders.</Trans>,
    },
    {
      title: <Trans>Automated dues &amp; Stripe payments:</Trans>,
      desc: <Trans>Seamless recurring membership fees, instant payment status tags (Paid / Not Renewed), and direct payouts to your bank account.</Trans>,
    },
    {
      title: <Trans>Integrated club shop &amp; exclusive perks:</Trans>,
      desc: <Trans>Showcase local partner deals, sell official kits or paid workshops, and turn weekly attendees into loyal paying customers.</Trans>,
    },
    {
      title: <Trans>Official announcements &amp; structured chats:</Trans>,
      desc: <Trans>A dedicated news feed for verified club broadcasts, alongside dedicated chats tied specifically to each session.</Trans>,
    },
  ];

  return (
    <section className="framer-1gbj1e" data-framer-name="Comparison Section" id="comparison">
      <style>{`
        .framer-1gbj1e,
        .framer-iDUXM .framer-1gbj1e {
          width: 100% !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          padding: 100px 24px !important;
          box-sizing: border-box !important;
        }

        .framer-4kd2qg,
        .framer-iDUXM .framer-4kd2qg {
          width: 100% !important;
          max-width: 1160px !important;
          margin: 0 auto !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
        }

        .framer-56vsxm-container,
        .framer-iDUXM .framer-56vsxm-container {
          width: 100% !important;
          max-width: 1160px !important;
          margin: 20px auto 0 !important;
          box-sizing: border-box !important;
        }

        .framer-WFg1Q,
        .framer-WFg1Q.framer-1l9h3s {
          width: 100% !important;
          max-width: 1160px !important;
          min-width: 0 !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 28px !important;
          padding: 36px 32px !important;
          box-sizing: border-box !important;
          align-items: stretch !important;
          background-color: #0d0d0d !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 28px !important;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.6) !important;
        }

        /* Status Quo (Left Column) */
        .framer-WFg1Q .framer-4cs0h1,
        .framer-4cs0h1 {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          flex: none !important;
          padding: 32px 28px !important;
          background: rgba(239, 68, 68, 0.03) !important;
          border: 1px solid rgba(239, 68, 68, 0.18) !important;
          border-radius: 20px !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
        }

        /* Ride With Pals (Right Column) */
        .framer-WFg1Q .framer-1igapxa,
        .framer-1igapxa {
          width: 100% !important;
          max-width: none !important;
          min-width: 0 !important;
          flex: none !important;
          padding: 32px 28px !important;
          background: #050505 !important;
          border: 1px solid rgba(235, 113, 43, 0.45) !important;
          border-radius: 20px !important;
          box-shadow: 0 0 36px rgba(235, 113, 43, 0.12), 0 20px 40px rgba(0, 0, 0, 0.6) !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
        }

        /* Row items */
        .rwp-comp-row {
          display: flex !important;
          align-items: flex-start !important;
          gap: 16px !important;
          margin-bottom: 24px !important;
          min-height: auto !important;
          height: auto !important;
        }

        .rwp-comp-row:last-child {
          margin-bottom: 0 !important;
        }

        .rwp-comp-icon {
          flex-shrink: 0 !important;
          width: 22px !important;
          height: 22px !important;
          margin-top: 3px !important;
        }

        .rwp-comp-text {
          font-size: 15px !important;
          line-height: 1.62 !important;
          margin: 0 !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          font-family: Manrope, Inter, sans-serif !important;
        }

        .rwp-comp-title {
          font-weight: 700 !important;
          color: #ffffff !important;
          display: inline !important;
          margin-right: 6px !important;
          font-size: 15px !important;
        }

        .rwp-comp-desc {
          color: rgba(255, 255, 255, 0.72) !important;
          display: inline !important;
          font-size: 15px !important;
          line-height: 1.62 !important;
        }

        .rwp-comp-desc-good {
          color: rgba(255, 255, 255, 0.88) !important;
          display: inline !important;
          font-size: 15px !important;
          line-height: 1.62 !important;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .framer-WFg1Q,
          .framer-WFg1Q.framer-1l9h3s {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
            padding: 24px 20px !important;
          }
          .framer-WFg1Q .framer-4cs0h1,
          .framer-4cs0h1,
          .framer-WFg1Q .framer-1igapxa,
          .framer-1igapxa {
            padding: 24px 20px !important;
          }
          .rwp-comp-row {
            margin-bottom: 20px !important;
            gap: 12px !important;
          }
          .rwp-comp-text {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }
        }

        @media (max-width: 600px) {
          .framer-1gbj1e,
          .framer-iDUXM .framer-1gbj1e {
            padding: 60px 16px !important;
          }
          .framer-WFg1Q,
          .framer-WFg1Q.framer-1l9h3s {
            padding: 16px 14px !important;
            border-radius: 20px !important;
          }
          .framer-WFg1Q .framer-4cs0h1,
          .framer-4cs0h1,
          .framer-WFg1Q .framer-1igapxa,
          .framer-1igapxa {
            padding: 20px 14px !important;
            border-radius: 16px !important;
          }
        }
      `}</style>
      <div className="framer-4kd2qg" data-framer-name="Container">
        <div
          className="framer-vpb40j"
          data-framer-name="Headline"
          style={{ willChange: "transform", opacity: "1", transform: "none" } as any}
        >
          <div className="framer-18z7p1t-container">
            <div
              className="framer-q36ud framer-K8Bhh framer-lohjoe framer-v-7qgiwz"
              data-framer-name="Second"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0)",
                borderRadius: "10px",
                boxShadow: "none",
                opacity: "1",
              } as any}
            >
              <div
                className="framer-8saufy"
                data-framer-name="Dot"
                style={{
                  backgroundColor:
                    "var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43))",
                  borderRadius: "100%",
                  boxShadow:
                    "rgba(235, 113, 43, 0.08) 0px 0.722625px 0.361312px -0.666667px, rgba(235, 113, 43, 0.09) 0px 2.74624px 1.37312px -1.33333px, rgba(235, 113, 43, 0.12) 0px 12px 6px -2px",
                  opacity: "1",
                } as any}
              ></div>
              <div
                className="framer-1u3q6hy"
                data-framer-component-type="RichTextContainer"
                style={{
                  "--extracted-r6o4lv":
                    "var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43))",
                  "--framer-link-text-color": "rgb(0, 153, 255)",
                  "--framer-link-text-decoration": "underline",
                  transform: "none",
                  opacity: "1",
                } as any}
              >
                <p
                  className="framer-text framer-styles-preset-1jsfakf"
                  data-styles-preset="VQGZB66Vz"
                  style={{
                    "--framer-text-color":
                      "var(--extracted-r6o4lv, var(--token-2d3de992-80f6-43cc-b5d5-16857da63015, rgb(235, 113, 43)))",
                  } as any}
                >
                  <Trans>WHY RIDE WITH PALS</Trans>
                </p>
              </div>
            </div>
          </div>
          <div
            className="framer-1tx0tl1"
            data-framer-component-type="RichTextContainer"
            style={{ transform: "none" } as any}
          >
            <h2
              className="framer-text framer-styles-preset-1qep5fy"
              data-styles-preset="Pd0MWMbDb"
              style={{ "--framer-text-alignment": "center" } as any}
            >
              <Trans>There is a smarter way to run your sports community.</Trans>
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.65)",
                fontSize: "16px",
                lineHeight: "1.6",
                marginTop: "14px",
                maxWidth: "680px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              <Trans>
                Replace scattered WhatsApp chats, manual spreadsheets and lost sales with one dedicated platform built for organisers.
              </Trans>
            </p>
          </div>
        </div>

        <div
          className="framer-56vsxm-container"
          data-framer-name="Comparison"
          name="Comparison"
        >
          <div
            name="Comparison"
            className="framer-WFg1Q framer-bAarg framer-shmgH framer-1l9h3s framer-v-1l9h3s"
            data-framer-name="Open"
            style={{
              backgroundColor:
                "var(--token-142de566-1cef-4aec-a905-86f484066d50, rgb(13, 13, 13))",
              maxWidth: "100%",
              borderRadius: "30px",
              opacity: "1",
            } as any}
          >
            {/* ── Left Column: Status Quo ── */}
            <div
              className="framer-4cs0h1"
              data-framer-name="Other Agencies"
              style={{ borderRadius: "12px", opacity: "1" } as any}
            >
              <div
                className="framer-1ncuk4v"
                data-framer-name="Other Agencies"
                data-framer-component-type="RichTextContainer"
                style={{
                  "--framer-paragraph-spacing": "0px",
                  transform: "none",
                  opacity: "1",
                  marginBottom: "20px",
                } as any}
              >
                <h5
                  className="framer-text framer-styles-preset-jb6s69"
                  data-styles-preset="NC3Baikr8"
                  style={{ color: "#ef4444", fontSize: "20px" }}
                >
                  <Trans>The status quo (WhatsApp, Instagram &amp; sheets)</Trans>
                </h5>
              </div>
              <div
                className="framer-1wux7li"
                data-framer-name="Benefits"
                style={{ opacity: "1" } as any}
              >
                {badItems.map((item, idx) => (
                  <div key={idx} className="rwp-comp-row">
                    <div className="rwp-comp-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        style={{
                          width: "22px",
                          height: "22px",
                          fill: "rgb(239, 68, 68)",
                          color: "rgb(239, 68, 68)",
                          flexShrink: 0,
                        }}
                      >
                        <path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                      </svg>
                    </div>
                    <p className="rwp-comp-text">
                      <span className="rwp-comp-title">{item.title}</span>
                      <span className="rwp-comp-desc">{item.desc}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: With Ride With Pals ── */}
            <div
              className="framer-1igapxa"
              data-framer-name="Clario"
              style={{
                backgroundColor:
                  "var(--token-0bd9300c-1d9c-48e3-b47c-3d641fa8f8ff, rgb(5, 5, 5))",
                willChange: "transform",
                borderRadius: "20px",
                boxShadow:
                  "rgba(235, 113, 43, 0.2) 0px 1px 0px 0px inset, rgba(235, 113, 43, 0.2) 0px -1px 0px 0px inset, rgba(235, 113, 43, 0.4) 0px 1px 2px 0px, rgba(235, 113, 43, 0.25) 0px 3px 8px 0px, rgba(235, 113, 43, 0.1) 0px 6px 4px 0px, rgba(235, 113, 43, 0.05) 0px 11px 4px 0px, rgba(235, 113, 43, 0) 0px 16px 5px 0px",
                opacity: "1",
                transform: "none",
              } as any}
            >
              <div
                className="framer-1sl2whp"
                data-framer-name="Logo"
                style={{ opacity: "1", marginBottom: "20px" } as any}
              >
                <div
                  className="framer-1u4kadb"
                  data-framer-name="Logo Text"
                  data-framer-component-type="RichTextContainer"
                  style={{
                    "--extracted-r6o4lv":
                      "var(--token-743cf692-1243-473f-93be-c36de257addf, rgb(255, 255, 255))",
                    "--framer-paragraph-spacing": "0px",
                    transform: "none",
                    opacity: "1",
                  } as any}
                >
                  <p
                    className="framer-text"
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: "20px",
                      fontWeight: "700",
                      letterSpacing: "-0.02em",
                      lineHeight: "1.4em",
                      color: "#EB712B",
                    } as any}
                  >
                    <Trans>With Ride With Pals</Trans>
                  </p>
                </div>
              </div>

              <div
                className="framer-j0qfqq"
                data-framer-name="Benefit"
                style={{ opacity: "1" } as any}
              >
                {goodItems.map((item, idx) => (
                  <div key={idx} className="rwp-comp-row">
                    <div className="rwp-comp-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 256 256"
                        style={{
                          width: "22px",
                          height: "22px",
                          fill: "rgb(235, 113, 43)",
                          color: "rgb(235, 113, 43)",
                          flexShrink: 0,
                        }}
                      >
                        <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                      </svg>
                    </div>
                    <p className="rwp-comp-text">
                      <span className="rwp-comp-title">{item.title}</span>
                      <span className="rwp-comp-desc-good">{item.desc}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

