import { useState, useRef } from "react";
import { ArrowRight, PlusCircle, Activity, Users, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const SelectRole = () => {
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo(".hero-text", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.2 })
      .fromTo(".main-card", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8 }, "-=0.5")
      .fromTo(".feature-card", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.2 }, "-=0.3");
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#050505] text-white flex flex-col items-center py-20 px-6 overflow-hidden">
      
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-4 hero-text">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter">
          ELEVATE YOUR <br />
          <span className=" from-[#EB712B] to-[#ff8f50] bg-clip-text text-transparent">
            RIDE
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto font-light">
          Join an elite community of high-performance cyclists. 
          Your journey to the top tier starts here.
        </p>
      </div>

      {/* Main Interaction Card */}
      <div className="main-card bg-[#0a0a0a] border border-white/5 p-10 md:p-12 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(235,113,43,0.1)] mb-20">
        <button className="w-full bg-[#EB712B] text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-2 mb-4 hover:bg-[#ff8c4a] transition-all hover:scale-[1.02] active:scale-[0.98]">
          GET ME INSIDE <ArrowRight size={20} />
        </button>
        <button className="w-full border border-white/10 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
          Create a new club <PlusCircle size={20} />
        </button>
        <p className="text-gray-600 text-xs mt-8 text-center uppercase tracking-[0.2em]">
          You can initiate your own club anytime.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        <div className="feature-card"><FeatureCard icon={<Activity size={24} />} title="Pro Performance" desc="Pinpoint technical accuracy in your ride metrics." /></div>
        <div className="feature-card"><FeatureCard icon={<Users size={24} />} title="Global Network" desc="Synced with the world's fastest cyclists." /></div>
        <div className="feature-card"><FeatureCard icon={<ShieldCheck size={24} />} title="Exclusive Gear" desc="Member-only drops and premium kit access." /></div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="group bg-[#0a0a0a] border border-white/5 p-8 rounded-3xl hover:border-[#EB712B]/50 transition-all hover:bg-[#0f0f0f] h-full">
    <div className="text-[#EB712B] mb-6 transform group-hover:-translate-y-1 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default SelectRole;