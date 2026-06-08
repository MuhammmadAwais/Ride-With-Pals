import React, { useState, useRef } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const containerRef = useRef(null);

  // Optimized GSAP animation
  useGSAP(() => {
    gsap.fromTo(
      ".animate-item",
      { opacity: 0, y: 15 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.05, 
        ease: "power2.out",
        force3D: true 
      }
    );
  }, { scope: containerRef });

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans relative">
      
      {/* Background Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ x: [-1000, 1500] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} className="absolute top-24 -left-96 w-[800px] h-[1px] rotate-12">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[1px]" />
          <div className="absolute inset-0 bg-orange-500 blur-xl opacity-40" />
        </motion.div>
        <motion.div animate={{ x: [1500, -1000] }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 -right-96 w-[1000px] h-[1px] -rotate-6">
          <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[1px]" />
          <div className="absolute inset-0 bg-orange-500 blur-xl opacity-40" />
        </motion.div>
      </div>
      
      {/* LEFT SIDE: Visual Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0a0a] items-center justify-center p-12 relative overflow-hidden z-10">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-96 h-96 bg-orange-600/10 rounded-full blur-[100px]"
        />
        <div className="relative z-10 text-center">
          <img src="/Images/LogoImage.png" alt="Logo" className="w-64 mb-8 mx-auto" />
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-white">
            Ride with Power
          </h1>
          <p className="text-gray-400 text-lg max-w-sm mx-auto">
            Join the elite community of high-performance riders. Experience the trail like never before.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE*/}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black overflow-y-auto z-10">
        <div className="w-full max-w-md">
          <div ref={containerRef} className="space-y-6 will-change-transform">
            
            <div className="animate-item lg:hidden flex flex-col items-center justify-center mb-8 px-4 text-center">
              <img src="/Images/LogoImage.png" alt="Logo" className="w-40 mb-4" />
              <p className="text-gray-400 text-sm max-w-xs mx-auto">
                Join the elite community of high-performance riders. Experience the trail like never before.
              </p>
            </div>

            <div className="animate-item mb-2 text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-2">Create Account</h2>
            </div>
                {/* Email */}
            <div className="animate-item group">
              <label className="text-xs text-gray-400 ml-1">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-3.5 text-gray-600 group-hover:text-gray-400 group-focus-within:text-orange-500 transition-all duration-300" size={18} />
                <input type="email" placeholder="rider@performance.com" className="w-full h-12 rounded-xl bg-[#111111] border border-[#222] pl-12 pr-4 outline-none transition-all duration-300 hover:border-[#444] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20" />
              </div>
            </div>

                {/* Password */}
            <div className="animate-item group">
              <label className="text-xs text-gray-400 ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-3.5 text-gray-600 group-hover:text-gray-400 group-focus-within:text-orange-500 transition-all duration-300" size={18} />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-12 rounded-xl border border-[#222] pl-12 pr-12 outline-none transition-all duration-300 hover:border-[#444] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20" />
                <div className="absolute right-4 top-3.5 text-gray-500 cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

                {/* Confirm Password */}
            <div className="animate-item group">
              <label className="text-xs text-gray-400 ml-1">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-3.5 text-gray-600 group-hover:text-gray-400 group-focus-within:text-orange-500 transition-all duration-300" size={18} />
                <input type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="w-full h-12 rounded-xl border border-[#222] pl-12 pr-12 outline-none transition-all duration-300 hover:border-[#444] focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20" />
                <div className="absolute right-4 top-3.5 text-gray-500 cursor-pointer hover:text-orange-500 transition-colors" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <button className="animate-item w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-500 font-semibold transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20">
              Sign Up
            </button>

            <div className="animate-item flex items-center gap-4">
              <div className="flex-1 h-px bg-[#222]"></div>
              <span className="text-xs text-gray-600 uppercase tracking-widest">Or sign up with</span>
              <div className="flex-1 h-px bg-[#222]"></div>
            </div>

            {/* Google and Apple Button */}
            <div className="animate-item grid grid-cols-2 gap-4">
              <button className="h-12 rounded-xl bg-[#111111] border border-[#222] hover:border-orange-500/50 hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2 group">
                <img src="/Images/google-logo.png" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Google" />
                <span className="text-sm text-gray-300">Google</span>
              </button>
              <button className="h-12 rounded-xl bg-[#111111] border border-[#222] hover:border-orange-500/50 hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2 group">
                <img src="/Images/apple-logo.png" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Apple" />
                <span className="text-sm text-gray-300">Apple</span>
              </button>
            </div>

            <div className="animate-item text-center">
              <p className="text-gray-500 text-sm">
                Already have an account? <span className="text-orange-500 cursor-pointer font-medium hover:underline">Log in</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;