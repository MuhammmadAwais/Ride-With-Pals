import { FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full text-text-main font-sans min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-muted hover:text-text-main mb-8 transition-colors text-sm font-bold"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[#EB712B]/10 flex items-center justify-center mb-6">
            <FileText size={32} className="text-[#EB712B]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight mb-4">Terms & Conditions</h1>
          <p className="text-text-muted text-sm max-w-2xl">
            Last updated: October 24, 2026. Please read these terms and conditions carefully before using our service.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">1. Acceptance of Terms</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>By accessing or using Ride With Pals, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">2. Club Memberships and Responsibilities</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>As a club member or owner, you agree to adhere to the community guidelines and safety protocols.</p>
              <ul className="list-disc pl-5 space-y-2 text-text-muted">
                <li><strong className="text-text-main">Safety First:</strong> You are responsible for ensuring your equipment is safe and compliant with local regulations.</li>
                <li><strong className="text-text-main">Respect:</strong> Harassment or inappropriate behavior towards other members will result in immediate suspension.</li>
                <li><strong className="text-text-main">Accuracy:</strong> You agree to provide accurate information regarding your skill level and ride metrics.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">3. Subscriptions and Payments</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>Some features require a paid subscription. Payments are processed securely via our trusted payment providers.</p>
              <ul className="list-disc pl-5 space-y-2 text-text-muted">
                <li><strong className="text-text-main">Billing:</strong> Subscriptions are billed in advance on a recurring basis.</li>
                <li><strong className="text-text-main">Cancellations:</strong> You may cancel your subscription at any time. Refunds are not provided for partial billing periods.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">4. Limitation of Liability</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>Ride With Pals is not liable for any injuries, damages, or losses incurred during activities organized through the platform. Cycling involves inherent risks, and participants assume all responsibility.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
