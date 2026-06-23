import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
            <ShieldCheck size={32} className="text-[#EB712B]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-text-muted text-sm max-w-2xl">
            Last updated: October 24, 2026. This Privacy Policy describes how Ride With Pals collects, uses, and discloses your information.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">1. Information We Collect</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>We collect information you provide directly to us when you create an account, modify your profile, or interact with the platform. This includes:</p>
              <ul className="list-disc pl-5 space-y-2 text-text-muted">
                <li><strong className="text-text-main">Account Data:</strong> Name, email address, phone number, and profile picture.</li>
                <li><strong className="text-text-main">Ride Data:</strong> GPS coordinates, speed, distance, and routes taken during tracked activities.</li>
                <li><strong className="text-text-main">Device Information:</strong> Hardware model, operating system, and unique device identifiers.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">2. How We Use Your Information</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>We use the collected data to provide, maintain, and improve our services, including:</p>
              <ul className="list-disc pl-5 space-y-2 text-text-muted">
                <li>Facilitating club memberships and event coordination.</li>
                <li>Processing transactions for marketplace and premium features.</li>
                <li>Analyzing performance metrics to provide personalized insights.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">3. Data Sharing and Disclosure</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>Your privacy is critical to us. We do not sell your personal data. Information is only shared under the following conditions:</p>
              <ul className="list-disc pl-5 space-y-2 text-text-muted">
                <li><strong className="text-text-main">Club Visibility:</strong> Ride data and profile information are shared with your active club members based on your visibility settings.</li>
                <li><strong className="text-text-main">Service Providers:</strong> We share data with trusted third parties who assist in operating our platform (e.g., payment processors, hosting services).</li>
                <li><strong className="text-text-main">Legal Requirements:</strong> If required by law or to protect the safety of our users.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-main mb-4">4. Your Privacy Rights</h2>
            <div className="text-text-muted text-sm space-y-4 leading-relaxed">
              <p>Depending on your jurisdiction, you have the right to request access, correction, or deletion of your personal data. You can manage most of your privacy settings directly from the <strong className="text-text-main">Profile & Account</strong> section.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
