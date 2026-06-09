import { useState, useRef } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface FormErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const container = useRef(null);

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    let newErrors: FormErrors = {};
    if (!email.includes("@")) newErrors.email = "Please enter a valid email address";
    if (!password) newErrors.password = "Password is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validateForm()) {
      navigate("/select-role");
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(".brand-side", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.2 })
      .fromTo(".animate-item", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, "-=0.8");
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      
      {/* LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] items-center justify-center p-12 relative overflow-hidden border-r border-[#1a1a1a] brand-side">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="relative z-10 text-center max-w-sm">
          <img src="/Images/LogoImage.png" alt="Logo" className="w-56 mb-10 mx-auto" />
          <h1 className="text-5xl font-extrabold mb-6">Welcome Back</h1>
          <p className="text-gray-400 text-lg">Hi! Welcome back, you’ve been missed.</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-black">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex flex-col items-center text-center animate-item">
            <img src="/Images/LogoImage.png" alt="Logo" className="w-32 mb-4" />
          </div>

          <h2 className="text-3xl font-bold mb-8 animate-item">Log in</h2>

          <div className="space-y-4 animate-item">
            {/* Email Field */}
            <div>
              <label className="text-xs text-gray-400 ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className={`absolute left-4 top-3.5 transition-all ${errors.email ? "text-[#EB712B]" : "text-gray-600"}`} size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {setEmail(e.target.value); setErrors({...errors, email: ""})}}
                  placeholder="abcxyz@mail.com" 
                  className={`w-full h-12 rounded-xl bg-[#111111] border pl-12 pr-4 outline-none transition-all ${errors.email ? "border-[#EB712B]" : "border-[#222] focus:border-[#EB712B]"}`} 
                />
              </div>
              {errors.email && <p className="text-[#EB712B] text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="text-xs text-gray-400 ml-1">Password</label>
              <div className="relative mt-1">
                <Lock className={`absolute left-4 top-3.5 transition-all ${errors.password ? "text-[#EB712B]" : "text-gray-600"}`} size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => {setPassword(e.target.value); setErrors({...errors, password: ""})}}
                  placeholder="Enter your password" 
                  className={`w-full h-12 rounded-xl bg-[#111111] border pl-12 pr-12 outline-none transition-all ${errors.password ? "border-[#EB712B]" : "border-[#222] focus:border-[#EB712B]"}`} 
                />
                <div className="absolute right-4 top-3.5 text-gray-500 cursor-pointer hover:text-[#EB712B]" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {errors.password && <p className="text-[#EB712B] text-xs mt-1 ml-1">{errors.password}</p>}
            </div>

            <p className="text-right text-xs mt-1">
              <span onClick={() => navigate("/forgot-password")} className="text-gray-500 hover:text-[#EB712B] cursor-pointer">
                Forget password?
              </span>
            </p>           
          </div>

          <button 
            onClick={handleLogin} 
            className="w-full mt-6 py-4 rounded-xl bg-[#EB712B] hover:bg-[#d16226] font-bold transition-all animate-item"
          >
            Log in
          </button>

          <p className="text-center text-sm text-gray-500 mt-8 animate-item">
            Don't have an account?{" "}
            <span onClick={() => navigate("/")} className="text-orange-500 font-bold cursor-pointer hover:underline">
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;