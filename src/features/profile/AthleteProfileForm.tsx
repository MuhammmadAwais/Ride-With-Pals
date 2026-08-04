import { useState, useRef, useLayoutEffect, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Calendar, Loader2, Search, X, Camera, Upload, Check } from "lucide-react";
import gsap from "gsap";
import { toast } from "sonner";
import { backendApi } from "@/api/backendApi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setAthleteProfileSuccess } from "@/features/auth/slices/authSlice";
import { WORLD_COUNTRIES } from "@/lib/countries";

const AthleteProfileForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  
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
  const [timeFormat, setTimeFormat] = useState("12h"); // "12h" or "24h"
  const [profileImage, setProfileImage] = useState("saqi.png");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("/Images/ProfileImage.png");
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return WORLD_COUNTRIES;
    return WORLD_COUNTRIES.filter((c) => c.toLowerCase().includes(q));
  }, [countrySearch]);

  // Close dropdowns when clicking outside the form
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (isCountryModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCountryModalOpen]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediately display local object URL preview so image never disappears
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await backendApi.post('/user/upload/file', formData);
      const uploadRes = response.data?.response || response.data;
      const fileName = uploadRes?.fileName || uploadRes?.data?.fileName;
      if (fileName) {
        setProfileImage(fileName);
      } else {
        setProfileImage(file.name);
      }
      toast.success("Profile photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to upload photo. Using local preview.");
    } finally {
      setIsUploadingImage(false);
    }
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
        timeFormat,
        profileImage: profileImage || "saqi.png",
      });

      if (response.status === 200) {
        dispatch(setAthleteProfileSuccess());
        toast.success("Profile saved successfully!");
        navigate('/auth-subscription'); 
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
    <div ref={containerRef} className="p-4 sm:p-6 md:p-10 min-h-screen text-text-main bg-main-bg font-sans">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header with App Logo */}
        <div className="animate-item flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12 bg-surface p-5 sm:p-8 rounded-2xl sm:rounded-[32px] border border-border shadow-2xl">
          <div className="bg-[#EB712B]/10 p-3 sm:p-4 rounded-2xl border border-[#EB712B]/20 shrink-0">
            <img src="/Images/Logo.png" alt="Ride With Pals Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          </div>
          <div>
            <p className="text-[#EB712B] text-xs font-bold uppercase tracking-widest">Athlete Profile Onboarding</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">Complete Your Profile</h2>
            <p className="text-text-muted text-xs sm:text-sm mt-1">Please provide your details below to activate your account and start riding with pals.</p>
          </div>
        </div>

        <form ref={formRef} className="bg-surface border border-border rounded-2xl sm:rounded-[32px] p-5 sm:p-8 md:p-10 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 sm:gap-y-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* ── Profile Image Upload Section ── */}
          <div className="animate-item md:col-span-2 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-5 sm:p-6 bg-main-bg/60 border border-border rounded-2xl">
            <div className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-surface border-2 border-[#EB712B]/40 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
              <img
                src={imagePreviewUrl}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  if (imagePreviewUrl !== "/Images/ProfileImage.png") {
                    (e.target as HTMLImageElement).src = "/Images/ProfileImage.png";
                  }
                }}
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#EB712B]" size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <label className="text-white text-sm sm:text-base font-bold block">Athlete Profile Picture</label>
              <p className="text-text-muted text-xs">
                Upload your profile photo or keep the default avatar.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                <label className="px-4 py-2 bg-[#EB712B]/15 hover:bg-[#EB712B]/25 text-[#EB712B] border border-[#EB712B]/30 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-2">
                  <Upload size={14} />
                  {isUploadingImage ? "Uploading..." : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                </label>
                {imagePreviewUrl !== "/Images/ProfileImage.png" && (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileImage("saqi.png");
                      setImagePreviewUrl("/Images/ProfileImage.png");
                    }}
                    className="px-3 py-2 text-xs font-semibold text-text-muted hover:text-white transition-colors cursor-pointer"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Personal Information Header (Full Width) ── */}
          <div className="animate-item md:col-span-2 pt-2">
            <h3 className="text-[#EB712B] font-bold uppercase tracking-widest text-xs border-b border-border pb-2">Personal Information</h3>
          </div>

          {/* Full Name (Col 1) */}
          <div className="animate-item space-y-2">
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Full Name</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: '' })); }}
              className={`w-full h-12 sm:h-14 bg-main-bg border ${errors.fullName ? 'border-red-500' : 'border-border'} rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main`} 
              placeholder="Alex Johnson" 
            />
            {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName}</p>}
          </div>

          {/* Phone Number (Col 2) */}
          <div className="animate-item space-y-2">
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: '' })); }}
              className={`w-full h-12 sm:h-14 bg-main-bg border ${errors.phone ? 'border-red-500' : 'border-border'} rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main`} 
              placeholder="Enter your phone number" 
            />
            {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
          </div>

          {/* Date of Birth (Col 1) */}
          <div className="animate-item space-y-2">
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Date of Birth</label>
            <div className="relative">
              <input 
                type="date" 
                value={dob}
                onChange={(e) => { setDob(e.target.value); setErrors((p) => ({ ...p, dob: '' })); }}
                className={`w-full h-12 sm:h-14 bg-main-bg border ${errors.dob ? 'border-red-500' : 'border-border'} rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main appearance-none`}
              />
              <Calendar 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" 
                size={18} 
              />
            </div>
            {errors.dob && <p className="text-red-500 text-xs">{errors.dob}</p>}
          </div>

          {/* Gender (Col 2) with z-50 stacking */}
          <div className={`animate-item space-y-2 relative ${openDropdown === 'gender' ? 'z-50' : 'z-10'}`}>
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Gender</label>
            <button
              type="button"
              onClick={() => toggleDropdown('gender')}
              className="w-full h-12 sm:h-14 bg-main-bg border border-border rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
            >
              <span className="text-white">{genderId === 1 ? 'Male' : 'Female'}</span>
              <ChevronDown 
                className={`transition-all duration-300 ${openDropdown === 'gender' ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                size={20} 
              />
            </button>

            {openDropdown === 'gender' && (
              <div className="absolute left-0 top-full w-full bg-surface border border-border rounded-2xl z-50 shadow-2xl overflow-hidden mt-1 backdrop-blur-md">
                <div
                  className="p-3.5 sm:p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border"
                  onClick={() => { setGenderId(1); toggleDropdown(null); }}
                >
                  Male
                </div>
                <div
                  className="p-3.5 sm:p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors"
                  onClick={() => { setGenderId(2); toggleDropdown(null); }}
                >
                  Female
                </div>
              </div>
            )}
          </div>

          {/* ── Location & Preferences Header (Full Width) ── */}
          <div className="animate-item md:col-span-2 pt-2">
            <h3 className="text-[#EB712B] font-bold uppercase tracking-widest text-xs border-b border-border pb-2">Location & Preferences</h3>
          </div>

          {/* Country / Region (Full Width) */}
          <div className="animate-item md:col-span-2 space-y-2 relative">
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Country / Region</label>
            <button
              type="button"
              onClick={() => setIsCountryModalOpen(true)}
              className="w-full h-12 sm:h-14 bg-main-bg border border-border rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
            >
              <span className="text-white">{country}</span>
              <ChevronDown 
                className={`transition-all duration-300 ${isCountryModalOpen ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                size={20} 
              />
            </button>
          </div>

          {/* Measurement Unit (Col 1) with z-50 stacking */}
          <div className={`animate-item space-y-2 relative ${openDropdown === 'unit' ? 'z-50' : 'z-10'}`}>
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Measurement Unit</label>
            <button
              type="button"
              onClick={() => toggleDropdown('unit')}
              className="w-full h-12 sm:h-14 bg-main-bg border border-border rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
            >
              <span className="text-white">{unit === 'km' ? 'Metric (km, kg)' : 'Imperial (mi, lbs)'}</span>
              <ChevronDown 
                className={`transition-all duration-300 ${openDropdown === 'unit' ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                size={20} 
              />
            </button>

            {openDropdown === 'unit' && (
              <div className="absolute left-0 top-full w-full bg-surface border border-border rounded-2xl z-50 shadow-2xl overflow-hidden mt-1 backdrop-blur-md">
                <div
                  className="p-3.5 sm:p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border"
                  onClick={() => { setUnit("km"); toggleDropdown(null); }}
                >
                  Metric (km, kg)
                </div>
                <div
                  className="p-3.5 sm:p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors"
                  onClick={() => { setUnit("miles"); toggleDropdown(null); }}
                >
                  Imperial (mi, lbs)
                </div>
              </div>
            )}
          </div>

          {/* Time Format (Col 2) with z-50 stacking */}
          <div className={`animate-item space-y-2 relative ${openDropdown === 'timeFormat' ? 'z-50' : 'z-10'}`}>
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Time Format</label>
            <button
              type="button"
              onClick={() => toggleDropdown('timeFormat')}
              className="w-full h-12 sm:h-14 bg-main-bg border border-border rounded-2xl px-4 sm:px-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main flex items-center justify-between cursor-pointer"
            >
              <span className="text-white">{timeFormat === '12h' ? '12-hour (1:30 PM)' : '24-hour (13:30)'}</span>
              <ChevronDown 
                className={`transition-all duration-300 ${openDropdown === 'timeFormat' ? "text-[#EB712B] rotate-180" : "text-text-muted"}`} 
                size={20} 
              />
            </button>

            {openDropdown === 'timeFormat' && (
              <div className="absolute left-0 top-full w-full bg-surface border border-border rounded-2xl z-50 shadow-2xl overflow-hidden mt-1 backdrop-blur-md">
                <div
                  className="p-3.5 sm:p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors border-b border-border"
                  onClick={() => { setTimeFormat("12h"); toggleDropdown(null); }}
                >
                  12-hour (1:30 PM)
                </div>
                <div
                  className="p-3.5 sm:p-4 hover:bg-hover cursor-pointer text-text-main text-sm transition-colors"
                  onClick={() => { setTimeFormat("24h"); toggleDropdown(null); }}
                >
                  24-hour (13:30)
                </div>
              </div>
            )}
          </div>

          {/* ── Athlete Description (Full Width) ── */}
          <div className="animate-item md:col-span-2 space-y-2 pt-2">
            <label className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block">Athlete Description</label>
            <textarea 
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
              className={`w-full bg-main-bg border ${errors.description ? 'border-red-500' : 'border-border'} rounded-2xl p-4 sm:p-5 text-sm outline-none focus:border-[#EB712B] transition-all text-text-main h-32`} 
              placeholder="Tell your story, your setups, and your cycling goals..." 
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

          {/* ── Save Profile Button (Full Width) ── */}
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isLoading}
            className="animate-item md:col-span-2 w-full h-14 sm:h-16 rounded-2xl bg-[#EB712B] hover:bg-[#ff8243] text-white font-black text-xs sm:text-sm uppercase transition-all cursor-pointer border-0 outline-none flex items-center justify-center gap-2 mt-4"
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

      {/* ── Country Selection Modal (Fixed & Searchable with Scroll Lock) ── */}
      {isCountryModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCountryModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-hidden"
        >
          <div className="bg-surface border border-border rounded-2xl sm:rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-main-bg/50">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Select Country / Region</h3>
                <p className="text-xs text-text-muted mt-0.5">Choose your primary location</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCountryModalOpen(false)}
                className="p-2 rounded-full hover:bg-hover text-text-muted hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-3.5 sm:p-4 border-b border-border bg-main-bg/30">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  placeholder="Search 195+ countries..."
                  className="w-full h-10 sm:h-11 bg-main-bg border border-border rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-text-muted outline-none focus:border-[#EB712B] transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Country List */}
            <div className="overflow-y-auto custom-scrollbar flex-1 p-2 max-h-[380px]">
              {filteredCountries.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm">
                  No countries found matching "{countrySearch}"
                </div>
              ) : (
                filteredCountries.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setCountry(option);
                      setIsCountryModalOpen(false);
                      setCountrySearch("");
                    }}
                    className={`w-full p-3 sm:p-3.5 rounded-xl flex items-center justify-between text-left text-sm font-medium transition-all cursor-pointer ${
                      country === option
                        ? "bg-[#EB712B]/15 text-[#EB712B] border border-[#EB712B]/30"
                        : "text-text-main hover:bg-hover hover:text-white border border-transparent"
                    }`}
                  >
                    <span>{option}</span>
                    {country === option && <Check size={16} className="text-[#EB712B]" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteProfileForm;