import { useState, useRef } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const CreateAccount = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const validateForm = () => {
    let newErrors: FormErrors = {};
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = () => {
    if (validateForm()) {
      navigate("/verify-email", { state: { email: email } });
    }
  };

  useGSAP(() => {
    gsap.fromTo(".animate-item", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: "power2.out", force3D: true });
  }, { scope: containerRef });

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans relative">
      <div className="hidden lg:flex w-1/2 bg-[#050505] items-center justify-center p-12 relative overflow-hidden z-10 border-r border-[#1a1a1a]">
        <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
        <motion.div animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="relative z-10 text-center max-w-lg">
          <img src="/Images/Logo.png" alt="Logo" className="w-56 mb-10 mx-auto opacity-90" />
          <h1 className="text-6xl font-extrabold mb-6 tracking-tight text-white">Ride with <span className="text-[#EB712B]">Power</span></h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xs mx-auto">Join the elite community of high-performance riders. Experience the trail like never before.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black overflow-y-auto z-10">
        <div className="w-full max-w-md">
          <div ref={containerRef} className="space-y-6 will-change-transform">
            <div className="animate-item lg:hidden flex flex-col items-center justify-center mb-8 px-4 text-center">
              <img src="/Images/Logo.png" alt="Logo" className="w-70 mb-4" />
            </div>
            <div className="animate-item mb-2 text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-2">Create Account</h2>
            </div>
            {/* Email */}
            <div className="animate-item group">
              <label className="text-xs text-gray-400 ml-1">Email Address</label>
              <div className="relative mt-1">
                 <Mail className={`absolute left-4 top-3.5 transition-all ${errors.email ? "text-[#EB712B]" : "text-gray-600"}`} size={18} />
                 <input type="email" value={email} onChange={(e) => {setEmail(e.target.value); setErrors({...errors, email: ""})}} placeholder="rider@performance.com" className={`w-full h-12 rounded-xl bg-[#111111] border pl-12 pr-4 outline-none transition-all ${errors.email ? "border-[#EB712B]" : "border-[#222] focus:border-[#EB712B]"}`} />
              </div>
               {errors.email && <p className="text-[#EB712B] text-xs mt-1 ml-1">{errors.email}</p>}
            </div>
            {/* Password */}
            <div className="animate-item group">
              <label className="text-xs text-gray-400 ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className={`absolute left-4 top-3.5 transition-all ${errors.password ? "text-[#EB712B]" : "text-gray-600 group-focus-within:text-[#EB712B]"}`} size={18} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => {setPassword(e.target.value); setErrors({...errors, password: ""})}} placeholder="••••••••" className={`w-full h-12 rounded-xl border pl-12 pr-12 outline-none transition-all ${errors.password ? "border-[#EB712B]" : "border-[#222] focus:border-[#EB712B]"}`} />
                <div className="absolute right-4 top-3.5 text-gray-500 cursor-pointer hover:text-[#EB712B]" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {errors.password && <p className="text-[#EB712B] text-xs mt-1 ml-1">{errors.password}</p>}
            </div>
            {/* Confirm Password */}
            <div className="animate-item group">
              <label className="text-xs text-gray-400 ml-1">Confirm Password</label>
              <div className="relative mt-1">
                <Lock className={`absolute left-4 top-3.5 transition-all ${errors.confirmPassword ? "text-[#EB712B]" : "text-gray-600 group-focus-within:text-[#EB712B]"}`} size={18} />
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => {setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ""})}} placeholder="••••••••" className={`w-full h-12 rounded-xl  border pl-12 pr-12 outline-none transition-all ${errors.confirmPassword ? "border-[#EB712B]" : "border-[#222] focus:border-[#EB712B]"}`} />
                <div className="absolute right-4 top-3.5 text-gray-500 cursor-pointer hover:text-[#EB712B]" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {errors.confirmPassword && <p className="text-[#EB712B] text-xs mt-1 ml-1">{errors.confirmPassword}</p>}
            </div>
            {/*  Sign Up Button */}
            <button 
              onClick={handleSignUp}
              className="animate-item w-full h-12 rounded-xl bg-[#EB712B] hover:bg-[#d16226] font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              Sign Up
            </button>
            <div className="animate-item flex items-center gap-4">
              <div className="flex-1 h-px bg-[#222]"></div>
              <span className="text-xs text-gray-600 uppercase tracking-widest">Or sign up with</span>
              <div className="flex-1 h-px bg-[#222]"></div>
            </div>
            <div className="animate-item grid grid-cols-2 gap-4">
              <button className="h-12 rounded-xl bg-[#111111] border border-[#222] hover:border-orange-500/50 hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2 group cursor-pointer">
                <img src="/Images/google-logo.png" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Google" />
                <span className="text-sm text-gray-300">Google</span>
              </button>
              <button className="h-12 rounded-xl bg-[#111111] border border-[#222] hover:border-orange-500/50 hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2 group cursor-pointer">
                <img src="/Images/apple-logo.png" className="w-5 h-5 transition-transform group-hover:scale-110" alt="Apple" />
                <span className="text-sm text-gray-300">Apple</span>
              </button>
            </div>
            <div className="animate-item text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")} className="text-orange-500 cursor-pointer font-medium hover:underline">
                  Log in
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;