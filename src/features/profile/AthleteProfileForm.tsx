import React, { useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Calendar, Loader2 } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { ROUTES } from "@/Constants";
import { backendApi } from "@/api/backendApi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setAthleteProfileSuccess } from "@/features/auth/slices/authSlice";

const AthleteProfileForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form State mapped exactly to PUT endpoint
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [genderId, setGenderId] = useState<number>(1); // 1 = Male, 2 = Female
  const [country, setCountry] = useState("Germany");
  const [unit, setUnit] = useState("km"); // "km" or "miles"
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      
      gsap.fromTo(".animate-item", 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.3 }
      );
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const toggleDropdown = (field: string | null) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!description.trim()) newErrors.description = "Athlete description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await backendApi.put('/user/update/athlete/profile', {
        fullName: fullName.trim(),
        dob,
        genderId,
        country,
        unit,
        phone: phone.trim(),
        description: description.trim(),
      });

      if (response.status === 200) {
        dispatch(setAthleteProfileSuccess());
        toast.success("Profile saved successfully!");
        navigate('/select-role'); 
      } else {
        toast.error("Failed to save profile.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="p-10 min-h-screen text-text-main bg-main-bg font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="animate-item flex items-center gap-6 mb-12 bg-surface p-8 rounded-[32px] border border-border shadow-2xl">
          <div className="bg-[#EB712B]/10 p-4 rounded-2xl border border-[#EB712B]/20">
            <span className="text-[#EB712B] text-4xl font-extrabold uppercase">RWP</span>
          </div>
          <div>
            <p className="text-[#EB712B] text-xs font-bold uppercase tracking-widest">Athlete Profile Onboarding</p>
            <h2 className="text-3xl font-black text-white">Complete Your Profile</h2>
            <p className="text-text-muted text-xs md:text-sm mt-1">Please provide your details below to activate your account and start riding with pals.</p>
          </div>
        </div>

        <form ref={formRef} className="bg-surface border border-border rounded-[32px] p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6" onSubmit={(e) => e.preventDefault()}>
          
          <div className="animate-item space-y-6">
            <h3 className="text-[#EB712B] font-bold uppercase tracking-widest text-xs border-b border-border pb-2">Personal Information</h3>
            
            <div className="space-y-2">
              <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
                className={`w-full h-14 bg-main-bg border ${errors.fullName ? 'border-red-500' : 'border-border'} rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main`} 
                placeholder="Alex Johnson" 
              />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Date of Birth</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => { setDob(e.target.value); setErrors((p) => ({ ...p, dob: '' })); }}
                  className={`w-full h-14 bg-main-bg border ${errors.dob ? 'border-red-500' : 'border-border'} rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main appearance-none`}
                />
                <Calendar 
                  className="absolute right-4 top-4 text-text-muted pointer-events-none" 
                  size={18} 
                />
              </div>
              {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
            </div>

            <div className="space-y-2 relative">
              <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Country / Region</label>
               <button
                type="button"
                onClick={() => toggleDropdown('country')}
                className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
              >
                <span className="text-white">{country}</span>
                <ChevronDown 
                  className={`transition-all duration-300 ${openDropdown === 'country' ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                  size={20} 
                />
              </button>

              {openDropdown === 'country' && (
                <div className="absolute left-0 w-full bg-main-bg border border-border rounded-2xl shadow-2xl overflow-hidden mt-1 z-30">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {['United States', 'Germany', 'United Kingdom', 'Canada', 'Australia', 'Pakistan', 'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Switzerland', 'Austria', 'Japan', 'South Korea'].sort().map((option) => (
                      <div
                        key={option}
                        className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border last:border-0"
                        onClick={() => { setCountry(option); toggleDropdown(null); }}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="animate-item space-y-6">
            <h3 className="text-[#EB712B] font-bold uppercase tracking-widest text-xs border-b border-border pb-2">Account Settings</h3>
            
            <div className="space-y-2 relative">
              <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Gender</label>
              <button
                type="button"
                onClick={() => toggleDropdown('gender')}
                className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
              >
                <span className="text-white">{genderId === 1 ? 'Male' : 'Female'}</span>
                <ChevronDown 
                  className={`transition-all duration-300 ${openDropdown === 'gender' ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                  size={20} 
                />
              </button>

              {openDropdown === 'gender' && (
                <div className="absolute left-0 w-full bg-main-bg border border-border rounded-2xl z-30 shadow-2xl overflow-hidden mt-1">
                  <div
                    className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border"
                    onClick={() => { setGenderId(1); toggleDropdown(null); }}
                  >
                    Male
                  </div>
                  <div
                    className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors"
                    onClick={() => { setGenderId(2); toggleDropdown(null); }}
                  >
                    Female
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 relative">
              <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Measurement Unit</label>
              <button
                type="button"
                onClick={() => toggleDropdown('unit')}
                className="w-full h-14 bg-main-bg border border-border rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
              >
                <span className="text-white">{unit === 'km' ? 'Metric (km, kg)' : 'Imperial (mi, lbs)'}</span>
                <ChevronDown 
                  className={`transition-all duration-300 ${openDropdown === 'unit' ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                  size={20} 
                />
              </button>

              {openDropdown === 'unit' && (
                <div className="absolute left-0 w-full bg-main-bg border border-border rounded-2xl z-30 shadow-2xl overflow-hidden mt-1">
                  <div
                    className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border"
                    onClick={() => { setUnit("km"); toggleDropdown(null); }}
                  >
                    Metric (km, kg)
                  </div>
                  <div
                    className="p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors"
                    onClick={() => { setUnit("miles"); toggleDropdown(null); }}
                  >
                    Imperial (mi, lbs)
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Phone Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })); }}
                className={`w-full h-14 bg-main-bg border ${errors.phone ? 'border-red-500' : 'border-border'} rounded-2xl px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main`} 
                placeholder="+49 152 445 221" 
              />
              {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
            </div>
          </div>

          <div className="animate-item md:col-span-2 space-y-2">
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Athlete Description</label>
            <textarea 
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
              className={`w-full bg-main-bg border ${errors.description ? 'border-red-500' : 'border-border'} rounded-2xl p-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main h-32`} 
              placeholder="Tell your story, your setups, and your cycling goals..." 
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isLoading}
            className="animate-item md:col-span-2 w-full h-16 rounded-2xl bg-[#EB712B] hover:bg-[#ff8243] text-white font-black text-sm uppercase transition-all cursor-pointer border-0 outline-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving Profile...
              </>
            ) : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AthleteProfileForm;