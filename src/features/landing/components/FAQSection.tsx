// @ts-nocheck
import React, { useState } from "react";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

const FAQItem = ({ faq, index, isOpen, toggleOpen }) => {
  return (
    <div 
      className={`rwp-faq-item ${isOpen ? "is-open" : ""}`} 
      onMouseEnter={() => {}}
    >
      {/* 1. Back Folder */}
      <div className="faq-back">
        <div className="faq-tab">
          {faq.shortTitle || `0${index + 1}`}
        </div>
        <div className="faq-back-body"></div>
      </div>
      
      {/* 2. Paper Document (Answer) */}
      <div className="faq-paper-wrapper">
        <div className="faq-paper">
          <p className="faq-answer-text">{faq.answer}</p>
        </div>
      </div>
      
      {/* 3. Front Folder (Question) */}
      <div className="faq-front" onClick={() => toggleOpen(index)}>
        <h4 className="faq-question-text">{faq.question}</h4>
        <div className="faq-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const FAQS = [
    {
      shortTitle: t`Overview`,
      question: t`What is Ride with Pals?`,
      answer: t`Ride with Pals is an all-in-one platform for cycling, running, and triathlon clubs that lets you organize activities, manage members, collect membership fees, sell products, and build a community - all in one place.`
    },
    {
      shortTitle: t`Sports`,
      question: t`Is it only for cycling?`,
      answer: t`No. Ride with Pals is designed for cycling, running, and triathlon clubs. That's why we use the term “Activities,” which can include cycling (gravel, road, and MTB), running (road and trail), or swimming (pool or open water).`
    },
    {
      shortTitle: t`Other Sports`,
      question: t`Does it work for skating, hiking, or other sports clubs?`,
      answer: t`Yes, it works perfectly well for them. Although the main categories currently available are Cycling, Running, and Triathlon, any sport where groups meet to follow a route, use a GPS track, and track their progress by distance and time can find the perfect club management tool in our app.`
    },
    {
      shortTitle: t`Problems Solved`,
      question: t`What problems does it solve?`,
      answer: t`Ride with Pals eliminates disorganized activities, scattered communication across messaging apps, headaches with selling club merchandise to members, lack of a trusted marketplace for second-hand gear, and manual chaos in member and membership fee management.`
    },
    {
      shortTitle: t`vs Strava`,
      question: t`How is it different from Strava?`,
      answer: t`Strava is a sports social network focused on individual performance. Ride with Pals is designed to manage entire clubs — activities, members, payments, permissions, club shop, and internal communication.`
    },
    {
      shortTitle: t`Strava Sync`,
      question: t`Can I use the app without connecting Strava?`,
      answer: t`Yes, absolutely. Strava is optional.`
    },
    {
      shortTitle: t`Platform Type`,
      question: t`Is it a social app or a management tool?`,
      answer: t`It's both. Ride with Pals combines community features — chats, marketplace, and activities — with real club management tools, including membership fees, a club shop, permissions, and organisation.`
    },
    {
      shortTitle: t`Casual Groups`,
      question: t`I'm not part of an official club, but my friends and I ride together. Can we use the app?`,
      answer: t`Absolutely. In fact, Ride with Pals was created to improve communication within riding groups like ours and put an end to endless, chaotic WhatsApp chats.`
    },
    {
      shortTitle: t`Membership`,
      question: t`Do I need to belong to a club to use the app?`,
      answer: t`No. You can use it as an individual athlete, join clubs, or take part in public activities.`
    },
    {
      shortTitle: t`Public Rides`,
      question: t`Can I create activities without belonging to a club?`,
      answer: t`Yes. You can create public activities.`
    },
    {
      shortTitle: t`Create Club`,
      question: t`Do I need to be a Premium user to create a club?`,
      answer: t`No. To create a club, you just need to register as an athlete first on the Free plan. You can then create a club and choose between the Free or Gold club plan.`
    },
    {
      shortTitle: t`Collect Fees`,
      question: t`How can I collect membership fees from my members?`,
      answer: t`If you have a Gold club subscription, you can define membership fees, mark payments as completed, and send payment requests through Stripe from your club dashboard.`
    },
    {
      shortTitle: t`Payment Options`,
      question: t`Does Ride with Pals process payments, or does it only record them?`,
      answer: t`Both options are available: you can manage payments manually (recording outside payments like cash or bank transfer), or you can use Stripe to automate and collect them securely inside the app.`
    },
    {
      shortTitle: t`Paid Activities`,
      question: t`What do I need to create paid activities or manage membership fee payments?`,
      answer: t`You need a Gold club subscription, a free Stripe account, and you must connect it to the app.`
    },
    {
      shortTitle: t`Commission`,
      question: t`Does the app charge a commission on each payment made through the app?`,
      answer: t`Yes. Ride with Pals charges a small 4% management fee on each transaction.`
    },
    {
      shortTitle: t`Permissions`,
      question: t`As a club administrator, what permissions can I grant to club members?`,
      answer: t`You can define the permissions available to administrators and members, such as creating news posts, creating activities, and sharing discounts. You can appoint as many administrators as you wish.`
    },
    {
      shortTitle: t`Moderation`,
      question: t`Can users be banned?`,
      answer: t`Yes. Administrators can accept or remove members.`
    },
    {
      shortTitle: t`Schedule`,
      question: t`Can I create recurring activities?`,
      answer: t`Yes. You can schedule activities on a weekly, biweekly, or monthly basis.`
    },
    {
      shortTitle: t`Cross-Club`,
      question: t`Can I share an activity across multiple clubs?`,
      answer: t`Yes. You can publish the same activity in as many clubs as you belong to. You can also make it public so that people outside your clubs can join.`
    },
    {
      shortTitle: t`Ride Chat`,
      question: t`Is there a chat within the app?`,
      answer: t`Yes. A chat is created for every activity, allowing participants to discuss topics related specifically to that activity. You can also chat privately with members of your club.`
    },
    {
      shortTitle: t`Forum & News`,
      question: t`Is there a forum-style interaction feature?`,
      answer: t`Yes. The club's News section allows users to comment on each post, with all the conversation kept together in a forum-style format.`
    },
    {
      shortTitle: t`Online Shop`,
      question: t`How does the online shop work?`,
      answer: t`Clubs with a Gold subscription can connect their Stripe payment account and activate an online shop to sell merchandise and products to their members.`
    },
    {
      shortTitle: t`Marketplace`,
      question: t`How does the marketplace work?`,
      answer: t`The marketplace is an internal classifieds section for club members. It allows you to sell your sports equipment to people you trust. Neither the club nor the app charges any commission.`
    },
    {
      shortTitle: t`Market Trades`,
      question: t`How are transactions carried out through the marketplace?`,
      answer: t`The marketplace is a space for exchanges between members. It does not support card payments. The exchange of goods and money takes place outside the app, in person.`
    },
    {
      shortTitle: t`Upgrade`,
      question: t`Can I start for free and upgrade later?`,
      answer: t`Yes. You can upgrade at any time.`
    }
  ];

  const css = `
    .rwp-faq-section {
      padding: 120px 40px;
      background: transparent;
      position: relative;
      z-index: 1;
    }

    /* Full Width Container */
    .rwp-faq-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
    }

    /* ─── Top: Header ─── */
    .rwp-faq-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 64px;
      width: 100%;
    }
    .rwp-faq-header-text {
      text-align: center;
      max-width: 680px;
      margin: 0 auto;
    }
    .rwp-faq-title {
      font-family: Manrope, Inter, sans-serif;
      font-size: clamp(36px, 4vw, 56px);
      font-weight: 800;
      color: #fff;
      line-height: 1.1;
      margin-bottom: 24px;
      letter-spacing: -0.03em;
    }
    .rwp-faq-title span {
      color: #EB712B;
    }
    .rwp-faq-subtitle {
      font-family: Manrope, Inter, sans-serif;
      font-size: 16px;
      color: rgba(255,255,255,0.4);
      line-height: 1.6;
      margin-bottom: 0;
      max-width: 480px;
    }

    /* Collage (Right side of header) */
    .rwp-faq-collage {
      position: relative;
      height: 380px;
      width: 100%;
      max-width: 700px;
    }
    .rwp-faq-collage-img {
      position: absolute;
      border-radius: 16px;

      object-fit: cover;
    }

    .img-book {
      width: 65%;
      height: 260px;
      top: 0;
      left: 0;
      z-index: 1;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .img-thinking {
      width: 55%;
      height: 340px;
      bottom: 10px;
      right: 10px;
      z-index: 3;

    }
    .img-question {
      width: 110px;
      height: 110px;
      top: 200px;
      left: 30px;
      z-index: 2;
      border-radius: 50%;
      border: 4px solid #050505;
      background: #111;
      padding: 10px;
    }

    /* ─── Bottom: Folder Accordions ─── */
    .rwp-faq-list {
      display: flex;
      flex-direction: column;
      gap: 32px;
      width: 100%;
      max-width: 1000px;
      margin: 0 auto; /* Centered */
    }

    /* ─── Intricate Folder Logic ─── */
    
    .rwp-faq-item {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      /* GPU acceleration */
      transform: translateZ(0); 
    }

    /* 1. Back Folder (Static) */
    .faq-back {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
    }
    .faq-tab {
      align-self: flex-start;
      background: #111;
      padding: 12px 28px;
      border-radius: 12px 12px 0 0;
      font-family: Manrope, Inter, sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border: 1px solid rgba(255,255,255,0.1);
      border-bottom: none;
      /* The connecting curve */
      position: relative;
    }
    .faq-tab::after {
      content: '';
      position: absolute;
      bottom: 0;
      right: -16px;
      width: 16px;
      height: 16px;
      background: transparent;
      border-bottom-left-radius: 12px;
      box-shadow: -8px 8px 0 0 #111;
    }
    .faq-back-body {
      background: #111;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 0 16px 16px 16px;
      height: 40px; /* Just tall enough to connect the tab */
      width: 100%;
      margin-top: -1px;
    }

    /* 2. Paper Document (Middle Layer) */
    .faq-paper-wrapper {
      position: relative;
      z-index: 2;
      width: calc(100% - 16px);
      margin: 0 auto;
      
      /* Animation using grid */
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s;
      
      /* Base state (hidden behind front folder) */
      margin-top: -24px; 
    }
    
    .faq-paper {
      overflow: hidden;
      background: #fafafa;
      border-radius: 8px 8px 0 0;
      /* On hover, add a white border/shadow to act as the "peek" */
      box-shadow: 0 -8px 0 #fafafa;
      transform: translateY(20px); /* hide the shadow initially by tucking it under the tab */
      transition: transform 0.3s;
    }
    .rwp-faq-item:hover .faq-paper {
      transform: translateY(12px); /* peek out! */
    }
    .rwp-faq-item.is-open .faq-paper {
      transform: translateY(0);
      box-shadow: none;
    }
    
    .rwp-faq-item.is-open .faq-paper-wrapper {
      grid-template-rows: 1fr;
      margin-top: -16px; /* Space between tab and paper */
    }
    .faq-answer-text {
      font-family: Manrope, Inter, sans-serif;
      font-size: 16px;
      color: #111; /* Dark text on light paper */
      line-height: 1.6;
      padding: 32px 32px 40px 32px;
      margin: 0;
    }

    /* 3. Front Folder (Question Layer) */
    .faq-front {
      position: relative;
      z-index: 3;
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 0 16px 16px 16px;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      cursor: pointer;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.4);
      
      margin-top: -16px; /* Overlap the back body */
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s, border-color 0.3s, border-radius 0.3s;
    }
    
    /* Hover State: Front folder slides down */
    .rwp-faq-item:hover .faq-front {
      transform: translateY(8px);
      background: #222;
      border-color: rgba(235,113,43,0.3);
    }
    
    /* Open State: Front folder slides down completely below the paper */
    .rwp-faq-item.is-open .faq-front {
      transform: translateY(0);
      background: #EB712B;
      border-color: #EB712B;
      border-radius: 0 0 16px 16px;
      box-shadow: 0 10px 30px rgba(235,113,43,0.2);
    }

    .faq-question-text {
      font-family: Manrope, Inter, sans-serif;
      font-size: 19px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      line-height: 1.4;
      transition: color 0.3s;
    }

    /* Icon */
    .faq-icon {
      color: rgba(255,255,255,0.4);
      transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.3s;
      flex-shrink: 0;
    }
    .rwp-faq-item:hover .faq-icon {
      color: #EB712B;
    }
    .rwp-faq-item.is-open .faq-icon {
      transform: rotate(135deg);
      color: #fff;
    }


    /* Responsive */
    @media (max-width: 992px) {
      .rwp-faq-header {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 40px;
      }
      .rwp-faq-header-text {
        text-align: center;
      }
      .rwp-faq-subtitle {
        margin: 0 auto;
      }
      .rwp-faq-collage {
        max-width: 500px;
        margin: 0 auto;
      }
    }
    @media (max-width: 600px) {
      .faq-front { padding: 20px; }
      .faq-answer-text { padding: 24px; font-size: 15px; }
      .faq-question-text { font-size: 16px; }
      .img-book { width: 75%; height: 200px; }
      .img-thinking { width: 60%; height: 160px; right: 0; bottom: 40px; }
      .img-question { width: 80px; height: 80px; top: 150px; left: 10px; }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <section className="rwp-faq-section" id="faq">
        <div className="rwp-faq-container">
          
          {/* Top Header Section */}
          <div className="rwp-faq-header">
            <div className="rwp-faq-header-text">
              <h2 className="rwp-faq-title">
                <Trans>Got questions?</Trans><br />
                <span><Trans>We've got answers.</Trans></span>
              </h2>
              <p className="rwp-faq-subtitle">
                <Trans>Here's everything you need to know before getting started. If you have more questions, feel free to reach out to our team.</Trans>
              </p>
            </div>
          </div>

          {/* Bottom Accordion Section */}
          <div className="rwp-faq-list">
            {FAQS.map((faq, index) => (
              <FAQItem 
                key={index} 
                faq={faq} 
                index={index} 
                isOpen={openIndex === index} 
                toggleOpen={toggleOpen} 
              />
            ))}
          </div>

        </div>
      </section>
    </>
  );
};
