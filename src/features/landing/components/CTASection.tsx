// @ts-nocheck
import React from "react";
import { Trans } from "@lingui/react/macro";

export const CTASection: React.FC = () => {
  return (
    <section className="framer-18w1jh2" data-framer-name="CTA Section">
      <div className="framer-au4vbu-container">
        <div
          className="framer-WyCFQ framer-hFyMR framer-shmgH framer-1lkz8uy framer-v-1lkz8uy"
          data-framer-name="Desktop"
          style={{
            backgroundColor:
              "var(--token-142de566-1cef-4aec-a905-86f484066d50, rgb(13, 13, 13))",
            maxWidth: "100%",
            width: "100%",
            borderRadius: "30px",
            border: "1px solid rgba(235, 113, 43, 0.4)",
            position: "relative",
            opacity: "1",
          } as any}
         
        >
          <div
            className="framer-kqkzw6"
            data-framer-name="Content"
            style={{ opacity: "1" } as any}
           
          >
            <div
              className="framer-1k05i4t"
              data-framer-name="Text Content"
              style={{ opacity: "1" } as any}
             
            >
              <div
                className="framer-18ezjb9"
                style={{ opacity: "1" } as any}
               
              >
                <div
                  className="framer-1g55wwh"
                  data-framer-component-type="RichTextContainer"
                  style={{
                    "--extracted-1of0zx5": "rgb(255, 255, 255)",
                    "--framer-link-text-color": "rgb(0, 153, 255)",
                    "--framer-link-text-decoration": "underline",
                    transform: "none",
                    opacity: "1",
                  } as any}
                >
                  <h2
                    className="framer-text framer-styles-preset-1qep5fy"
                    data-styles-preset="Pd0MWMbDb"
                    style={{
                      "--framer-text-alignment": "left",
                      "--framer-text-color":
                        "var(--extracted-1of0zx5, rgb(255, 255, 255))",
                    } as any}
                  >
                    <Trans>Build a sports community</Trans> <span style={{ color: "#EB712B" }}><Trans>people come back to.</Trans></span>
                  </h2>
                </div>
                <div
                  className="framer-kl7ur7"
                  data-framer-component-type="RichTextContainer"
                  style={{
                    "--extracted-r6o4lv": "rgba(255, 255, 255, 0.55)",
                    "--framer-link-text-color": "rgb(0, 153, 255)",
                    "--framer-link-text-decoration": "underline",
                    transform: "none",
                    opacity: "1",
                  } as any}
                >
                  <p
                    className="framer-text framer-styles-preset-38u9fz"
                    data-styles-preset="f_lMCwHxq"
                    style={{
                      "--framer-text-alignment": "left",
                      "--framer-text-color":
                        "var(--extracted-r6o4lv, rgba(255, 255, 255, 0.55))",
                    } as any}
                  >
                    <Trans>Turn weekly activities into lasting community. Bring your members together, on and off the road.</Trans>
                  </p>
                </div>
                <div style={{ marginTop: "28px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px" }}>
                  <a
                    href="/signup"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "#EB712B",
                      color: "#ffffff",
                      fontFamily: "Manrope, Inter, sans-serif",
                      fontSize: "15px",
                      fontWeight: 700,
                      padding: "14px 28px",
                      borderRadius: "12px",
                      textDecoration: "none",
                      boxShadow: "0 8px 24px rgba(235, 113, 43, 0.4)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Trans>Create your community free</Trans>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </a>
                  <span style={{ fontFamily: "Manrope, Inter, sans-serif", fontSize: "12px", color: "rgba(255, 255, 255, 0.45)", marginLeft: "4px" }}>
                    <Trans>Free forever for up to 15 members. No credit card required.</Trans>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div
            className="framer-1ibams"
            data-framer-name="Image"
            style={{ opacity: "1" } as any}
           
          >
            <div
              className="framer-1hw4g2n"
              data-framer-name="Joyful Woman with Smartphone"
              style={{
                mask: "linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%)",
                opacity: "1",
              } as any}
             
            >
              <div
                data-framer-background-image-wrapper="true"
                style={{
                  position: "absolute",
                  borderRadius: "inherit",
                  cornerShape: "inherit",
                  inset: "0px",
                } as any}
               
              >
                <img
                  decoding="auto"
                  loading="lazy"
                  width="1368"
                  height="1920"
                  sizes="calc(421 * 0.7125)"
                  srcset="/landing/assets/images/happy-woman-in-a-green-sweater-holding-a-phone-and-2.webp 729w, /landing/assets/images/happy-woman-in-a-green-sweater-holding-a-phone-and-1.webp 1368w"
                  src="/landing/assets/images/happy-woman-in-a-green-sweater-holding-a-phone-and-1.webp"
                  alt="Happy woman in a green sweater holding a phone and looking up"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    borderRadius: "inherit",
                    cornerShape: "inherit",
                    objectPosition: "center center",
                    objectFit: "cover",
                  } as any}
                  data-ai-detector-processed="true"
                />
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    zIndex: "10000",
                  } as any}
                 
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
