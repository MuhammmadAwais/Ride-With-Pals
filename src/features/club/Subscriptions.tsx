import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Subscriptions() {
  const navigate = useNavigate();
  const container = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".card-reveal", 
      { opacity: 0, y: 40 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: "power2.out" 
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#EB712B] selection:text-white">
      
      {/* Header Section */}
      <div className="relative text-center mb-20 px-4">
        <h1
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text mb-6 tracking-tight uppercase"
          style={{
            backgroundImage: "linear-gradient(to bottom, #E2E8F0 0%, #94A3B8 50%, #EB712B 100%)",
            WebkitBackgroundClip: "text",
            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.3))",
          }}
        >
          Subscribe to Your Legacy
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-light">
          Choose the plan that aligns with your performance goals. Our tiers are designed to scale with your ambition.
        </p>
      </div>

      {/* Subscription Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-16">
        
        {/* Free Plan */}
        <div className="card-reveal opacity-0 group bg-[#161616] border border-white/5 rounded-2xl p-8 flex flex-col transition-all duration-700 hover:border-white/20 hover:rounded-tr-[64px] hover:rounded-bl-[64px] hover:-translate-y-2 hover:shadow-2xl">
          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-[0.2em] text-gray-500 uppercase">Entry</span>
            <h2 className="text-2xl font-bold text-white mt-1">Free Limited</h2>
          </div>

          <ul className="space-y-4 mb-8 ">
            {["2 Marketplace Items", "Public Community Access", "Standard Route Tracking"].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-400 text-sm">
                <Check size={16} className="text-gray-700" /> {item}
              </li>
            ))}
          </ul>

          <div className="pt-8 border-t border-white/5">
            <button 
  onClick={() => navigate("/select-role-club")} 
  className="w-full py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all duration-300"
>
  Continue with Free
</button>
          </div>
        </div>

        {/* Gold Pass Plan */}
        <div className="card-reveal opacity-0 group bg-[#1a1a1a] border border-[#EB712B]/20 rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all duration-700 hover:border-[#EB712B]/50 hover:rounded-tr-[64px] hover:rounded-bl-[64px] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(235,113,43,0.15)]">
          <div className="absolute top-6 right-6 px-3 py-1 bg-[#EB712B]/10 text-[#EB712B] text-[10px] font-bold tracking-widest uppercase rounded-full border border-[#EB712B]/20">
            Best Value
          </div>

          <div className="mb-6">
            <span className="text-[11px] font-bold tracking-[0.2em] text-[#EB712B] uppercase">Pro Tier</span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-3xl font-bold text-white">89£</h2>
              <span className="text-gray-500 text-xs">/ year</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Unlimited Marketplace Listings",
              "Exclusive Pro Routes & Heatmaps",
              "Advanced Performance Telemetry",
              "Early Access to Limited Gear",
              "Verified 'Pro' Badge",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-gray-200 text-sm">
                <Check size={16} className="text-[#EB712B]" /> {item}
              </li>
            ))}
          </ul>

          <div className="pt-8 border-t border-white/10">
            <button 
  onClick={() => navigate("/select-role-club")} 
  className="w-full py-3 rounded-xl bg-[#EB712B] text-white text-sm font-semibold transition-all duration-300 hover:bg-[#d16226] flex items-center justify-center gap-2 shadow-[0_8px_16px_-4px_rgba(235,113,43,0.4)]"
>
  GO PREMIUM NOW <ArrowRight size={16} />
</button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-6">
        <button
          onClick={() => navigate("/club-profile-setup")}
          className="flex items-center gap-2 text-gray-500 text-xs font-medium hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to Profile
        </button>
      </div>
    </div>
  );
}