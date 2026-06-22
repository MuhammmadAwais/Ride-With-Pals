import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userEmail = location.state?.email || "abcxyz@gmail.com";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [error, setError] = useState("");

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Backspace logic to move to previous input
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Basic validation to make sure all 6 digits are filled
    if (code.includes("")) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }
    setError("");
    
    // Navigate to your AuthSubscription component route
    // Make sure this matches the path you define in your AppRouter.tsx
    navigate("/auth-subscription"); 
  };

  useGSAP(() => {
    gsap.fromTo(".animate-item", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05 });
  }, { scope: containerRef });

  return (
    <div className="min-h-screen bg-[#111111] text-white flex font-sans">
      {/* LEFT SIDE: Fixed on desktop */}
      <div className="hidden lg:flex w-1/2 bg-[#050505] items-center justify-center p-12 border-r border-[#1a1a1a]">
        <div className="text-center max-w-sm animate-item">
          <img src="/Images/Logo.png" alt="Logo" className="w-48 mb-8 mx-auto" />
          <h1 className="text-5xl font-extrabold mb-6">Security <span className="text-[#EB712B]">Verified</span></h1>
          <p className="text-gray-400">Confirm your email to unlock the full power of your riding experience.</p>
        </div>
      </div>

      {/* RIGHT SIDE / MOBILE CONTAINER */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#111111] lg:bg-black">
        <div className="w-full max-w-sm" ref={containerRef}>
          
          <div className="animate-item text-center mb-8">
             <img src="/Images/Logo.png" alt="Logo" className="w-70 mb-6 mx-auto lg:hidden" />
             <h2 className="text-3xl font-bold mb-1">Verify Email</h2>
             <p className="text-gray-400 text-sm">Please enter the code we just sent to <br/>
                <span className="text-[#EB712B] font-bold">{userEmail}</span>
             </p>
          </div>

          {/* OTP Inputs with Auto-Focus Logic */}
          <div className="animate-item flex justify-center gap-2 mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-[#1a1a1a] border border-[#333] rounded-xl text-center text-xl font-bold outline-none focus:border-[#EB712B] transition-all"
              />
            ))}
          </div>

          {error && (
            <p className="animate-item text-red-500 text-xs font-bold text-center mb-4">
              {error}
            </p>
          )}

          <button 
            onClick={handleVerify} 
            className="animate-item w-full py-4 bg-[#EB712B] rounded-xl font-bold hover:bg-[#d16226] transition-all mb-6 cursor-pointer"
          >
            Verify Code
          </button>

          <div className="animate-item text-center">
            <p className="text-gray-500 text-sm mb-2">Haven't received the OTP code yet?</p>
            <p className="text-2xl font-mono text-[#EB712B] font-bold mb-1">
               {`00 : ${timeLeft.toString().padStart(2, '0')}`}
            </p>
            <button 
              disabled={timeLeft > 0} 
              onClick={() => setTimeLeft(60)} 
              className={`text-sm underline cursor-pointer ${timeLeft > 0 ? "text-gray-700" : "text-white hover:text-[#EB712B]"}`}
            >
              Resend!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;