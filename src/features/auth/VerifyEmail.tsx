import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const userEmail = location.state?.email || "your email";
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      navigate("/create-profile");
    }
  }, [code, navigate]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus 
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')} : ${secs.toString().padStart(2, '0')}`;
  };

  useGSAP(() => {
    gsap.fromTo(".animate-item", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05 });
  }, { scope: containerRef });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row overflow-hidden font-sans">
      <div className="hidden lg:flex w-1/2 bg-[#050505] items-center justify-center p-12 border-r border-[#1a1a1a]">
        <div className="relative z-10 text-center max-w-sm">
          <img src="/Images/LogoImage.png" alt="Logo" className="w-48 mb-8 mx-auto" />
          <h1 className="text-5xl font-extrabold mb-6">Security <span className="text-[#EB712B]">Verified</span></h1>
          <p className="text-gray-400">Confirm your email to unlock the full power of your riding experience.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-black">
        <div className="w-full max-w-sm" ref={containerRef}>
          <div className="lg:hidden animate-item flex justify-center mb-8">
            <img src="/Images/LogoImage.png" alt="Logo" className="w-32" />
          </div>

          <div className="animate-item text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold mb-2">Verify Email</h2>
            <p className="text-gray-500 text-sm">
              Please enter the code we just sent to <br/>
              <span className="text-[#EB712B] break-all">{userEmail}</span>
            </p>
          </div>

          <div className="animate-item flex justify-center gap-2 mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-[#0f0f0f] border border-[#222] rounded-xl text-center text-xl font-bold focus:border-[#EB712B] outline-none transition-all"
              />
            ))}
          </div>

          <button 
            disabled={!code.every((d) => d !== "")}
            onClick={() => navigate("/create-profile")} 
            className={`animate-item w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] mb-6 ${
              code.every((d) => d !== "") 
                ? "bg-[#EB712B] hover:bg-[#d16226]" 
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Verify Code
          </button>

          <div className="animate-item text-center">
            <p className="text-gray-500 text-sm mb-2">Haven't received the OTP code yet?</p>
            <p className="text-2xl font-mono text-[#EB712B] mb-1">{formatTime(timeLeft)}</p>
            <button 
              disabled={timeLeft > 0}
              onClick={() => setTimeLeft(60)}
              className={`text-sm transition-all ${timeLeft > 0 ? "text-gray-700 cursor-not-allowed" : "text-gray-400 cursor-pointer hover:text-[#EB712B] border-b border-gray-600"}`}
            >
              {timeLeft > 0 ? "Wait to resend" : "Resend!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;