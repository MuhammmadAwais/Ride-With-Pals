import { useRef } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const container = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".brand-side", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2 })
      .fromTo(".animate-item", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, "-=0.8");
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      
      {/* LEFT SIDE: Hero Image */}
      <div className="hidden lg:flex w-1/2 relative items-center justify-center p-12 overflow-hidden brand-side">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img 
          src="/Images/BottleImage2.png" 
          alt="Hero" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="relative z-20 text-center max-w-sm">
          <img src="/Images/Logo.png" alt="Logo" className="w-56 mb-10 mx-auto" />
          <h1 className="text-5xl font-extrabold mb-6">Welcome Back</h1>
          <p className="text-gray-300 text-lg">Sign in to continue your journey with Ride with Pals.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Centered Form Container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-black">
        <div className="w-full max-w-md p-8 bg-[#0d0d0d] rounded-3xl border border-[#1a1a1a] shadow-2xl">
          
          {/* Header */}
          <div className="mb-8 animate-item">
            <button 
              onClick={() => navigate("/login")} 
              className="mb-8 p-2 rounded-full bg-[#111111] hover:bg-[#222] transition-colors cursor-pointer border border-[#222]"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-3xl font-bold mb-4">Forget Password</h2>
            <p className="text-gray-400 text-sm">Not to worry, it happens to the best of us. Please enter your email address below.</p>
          </div>

          {/* Input Field */}
          <div className="mb-6 animate-item">
            <label className="text-xs text-gray-400 ml-1">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-4 top-3.5 text-gray-600" size={18} />
              <input 
                type="email" 
                placeholder="abcxyz@mail.com" 
                className="w-full h-12 rounded-xl bg-[#111111] border border-[#222] pl-12 pr-4 outline-none focus:border-[#EB712B] transition-all" 
              />
            </div>
          </div>

          {/* Reset Button */}
          <button className="w-full h-12 rounded-xl bg-[#EB712B] hover:bg-[#d16226] font-bold transition-all cursor-pointer animate-item">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;