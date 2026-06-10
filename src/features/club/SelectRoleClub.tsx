import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Globe, Shield } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function SelectRoleClub() {
  const navigate = useNavigate();
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

    tl.fromTo(".reveal-item", 
      { opacity: 0, y: 40 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.15 
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Header*/}
      <div className="reveal-item text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-tight">
          ELEVATE YOUR <br />
          <span className="text-[#EB712B]">JOURNEY</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-lg">
          The premier ecosystem for high-performance athletes. Connect with elite communities or forge your own path.
        </p>
      </div>

      {/* Main Card */}
      <div className="reveal-item bg-[#161616] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl mb-8">
        <button 
  
  onClick={() => navigate("/dashboard")} 
  className="w-full bg-[#EB712B] hover:bg-[#d16226] text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all mb-4 hover:scale-[1.02] active:scale-[0.98]"
>
  Link your Strip account <ArrowRight size={20} />
</button>
        
        <button 
          onClick={() => navigate("/create-club")}
          className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white font-medium py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-white/5"
        >
          I’ll do it later <ArrowRight size={20} />
        </button>

        <p className="text-center text-gray-500 text-[10px] mt-6 uppercase tracking-widest">
          YOU WILL BE ABLE TO CREATE A CLUB AT ANY TIME.
        </p>
      </div>

      <div className="reveal-item grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl w-full mt-8">
        <FeatureCard 
          icon={<Zap size={24} className="text-[#EB712B]" />} 
          title="PRECISE METRICS" 
          desc="Harness data with professional-grade technical precision." 
        />
        <FeatureCard 
          icon={<Globe size={24} className="text-[#EB712B]" />} 
          title="ELITE COMMUNITY" 
          desc="Connect with the most driven performance athletes on the planet." 
        />
        <FeatureCard 
          icon={<Shield size={24} className="text-[#EB712B]" />} 
          title="KINETIC DROPS" 
          desc="Priority access to member-only technical kit and performance gear." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-8 border border-white/5 rounded-3xl bg-[#161616] transition-all duration-500 hover:border-[#EB712B]/30 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
      <div className="mb-6">{icon}</div>
      <h3 className="font-bold text-white mb-2 tracking-wide">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}