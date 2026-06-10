import {useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const CreateProfile = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(".fade-in", 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.2 }
      );

      tl.fromTo(".image-reveal", 
        { opacity: 0, scale: 0.95 }, 
        { opacity: 1, scale: 1, duration: 1.2 }, 
        "-=0.8"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white">
      
      {/* --- MOBILE LAYOUT --- */}
      <div className="lg:hidden relative min-h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src="/Images/ProfilePic.jpg" alt="Athlete" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute bottom-8 left-6 right-6 fade-in">
          <button
            onClick={() => navigate("/athlete-profile")}
            className="w-full bg-[#1a1a1a] p-4 rounded-2xl flex items-center justify-between border border-white/10 hover:border-[#EB712B] transition-all"
          >
            <h2 className="text-white font-semibold text-lg">Create your Athlete Profile</h2>
            <div className="bg-[#333] p-3 rounded-full"><span>→</span></div>
          </button>
        </div>
      </div>

      {/* --- DESKTOP LAYOUT --- */}
      <div className="hidden lg:flex h-screen items-center justify-center p-8 bg-[#050505] overflow-hidden">
        <div className="max-w-6xl w-full flex items-center gap-16">
          
          <div className="flex-1 space-y-8 fade-in">
            <h1 className="text-6xl font-extrabold leading-[1.05] tracking-tighter text-white">
              Create your <br />
              <span className="text-transparent bg-clip-text  from-[#EB712B] to-[#ff9e66] ">
                Athlete Profile
              </span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed max-w-sm font-light tracking-wide">
              Sync your data, discover curated routes, and join local squads. 
              <span className="text-white block font-medium mt-2">Your technical edge starts here.</span>
            </p>
            
            <button 
              onClick={() => navigate("/athlete-profile")}
              className="group px-8 py-4 bg-[#EB712B] text-white font-bold rounded-xl transition-all duration-300 flex items-center gap-3 hover:gap-5 active:scale-95 shadow-lg shadow-[#EB712B]/20"
            >
              Get Started
              <span className="transition-transform duration-300">→</span>
            </button>
          </div>

          <div className="flex-1 relative max-w-md image-reveal">
            <div className="absolute -inset-4 shadow-[0px_4px_20px_rgba(235,113,43,0.4)] from-[#EB712B]/20 to-transparent rounded-3xl blur-xl"></div>
            <img 
              src="/Images/ProfilePic.jpg" 
              alt="Athlete" 
              className="relative rounded-3xl w-full shadow-2xl border border-white/5 object-cover h-130" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;