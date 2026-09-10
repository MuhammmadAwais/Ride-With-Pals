import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { ChevronDown, Sparkles, ArrowRight, Mail, MapPin, Camera, Image as ImageIcon, X } from "lucide-react";
import gsap from "gsap"; 
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { useClub } from "./hooks/useClub";
import { RideService } from "@/api/backendApi";
import { usePlacesWidget } from "react-google-autocomplete";
import { useActiveClub } from "@/hooks/useActiveClub";
import { LocationPickerModal } from "@/components/LocationPickerModal";

export default function ProfileSetup() {
  const navigate = useNavigate(); 
  const container = useRef(null); 
  const { setActiveClub } = useActiveClub();
  
  const [clubName, setClubName] = useState("");
  const [clubType, setClubType] = useState("1"); // 1=Cycling, 2=Running, 3=Triathlon
  const [privacy, setPrivacy] = useState("1"); // 1=Public, 2=Private
  const [currency, setCurrency] = useState("USD"); // USD, GBP, EUR
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [mission, setMission] = useState("");
  const [isWomenAndNonBinary, setIsWomenAndNonBinary] = useState(false);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleCreateClub, isCreating } = useClub();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { ref: placesRef } = usePlacesWidget({
    apiKey: apiKey || "",
    onPlaceSelected: (place) => {
      if (place?.formatted_address) {
        setLocation(place.formatted_address);
        setErrors(p => ({...p, location: ''}));
      }
    },
    options: {
      types: ["(cities)"],
    },
  });

  // GSAP animation
  useGSAP(() => {
    gsap.fromTo(".fade-in", 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" }
    );
  }, { scope: container });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clubName.trim()) newErrors.clubName = "Club name is required";
    
    if (email.length === 0) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!phone.trim()) newErrors.phone = "Phone number is required";
    if (!location.trim()) newErrors.location = "Location is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = () => {
    validate();
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      setIsUploading(true);
      let logoUrl = "";
      let coverUrl = "";

      // Upload Logo
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        const res = await RideService.uploadFile(formData);
        if (res?.response?.fileName) {
          logoUrl = res.response.fileName; // e.g. "image_name.png"
        }
      }

      // Upload Cover
      if (coverFile) {
        const formData = new FormData();
        formData.append("file", coverFile);
        const res = await RideService.uploadFile(formData);
        if (res?.response?.fileName) {
          coverUrl = res.response.fileName;
        }
      }

      const payload = {
        clubName,
        clubPrivacyId: Number(privacy),
        clubTypeId: Number(clubType),
        currency,
        email,
        phone,
        location,
        description: mission,
        logo: logoUrl,
        coverImage: coverUrl,
        isWomenAndNonBinary,
        restrictUnpaidMembers: false,
        restrictClubShop: false,
        restrictJoinActivities: false
      };

      const result = await handleCreateClub(payload);
      
      if (result) {
        if (typeof result === 'object' && result.id) {
          setActiveClub(result);
        }
        navigate("/club-subscriptions"); 
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleRemoveCover = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCoverFile(null);
    setCoverPreview(null);
  };

  return (
    <div ref={container} className="min-h-screen w-full bg-[#111111] flex overflow-hidden">
      {/* LEFT SIDE */}
      <div 
        className="hidden md:flex w-[40%] bg-cover bg-center p-10 flex-col justify-end relative fade-in"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/Images/CycleImage2.png')" }}
      >
        <div className="absolute top-10 left-10">
          <img src="/Images/Logo.png" alt="RWP Logo" className="h-12 object-contain" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-3">
            <Sparkles size={10} /> Onboarding Phase 01
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 transition-colors duration-300 hover:text-[#EB712B] cursor-pointer">
            Connect with your club members.
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Handle everything in just one place.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-[60%] h-screen bg-[#111111] p-5 md:p-10 overflow-y-auto fade-in">
        <div className="mb-8 border-l-2 border-orange-500 pl-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Profile Setup</h2>
          <p className="text-gray-500 text-sm mt-2">
            Configure your club presence. These details are essential for rider discovery in your region.
          </p>
        </div>

        <form className="space-y-4 fade-in" onSubmit={(e) => e.preventDefault()}>
          {/* Club Media & Visual Identity Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
                Club Media
              </label>
              <span className="text-[10px] text-gray-600 font-normal">PNG, JPG, WEBP (Max 5MB)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
              {/* 1. Club Logo / Avatar (1:1 Square Emblem) */}
              <div className="w-full sm:w-32 flex flex-col shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="relative w-full sm:w-32 h-32 rounded-2xl border border-white/10 hover:border-white/20 bg-[#161616] hover:bg-[#1a1a1a] flex flex-col items-center justify-center text-center p-3 transition-all duration-200 cursor-pointer overflow-hidden group shadow-sm"
                  title="Upload 1:1 Club Logo"
                >
                  {logoPreview ? (
                    <>
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white">
                        <Camera size={18} className="mb-1 text-gray-300" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow z-10 cursor-pointer"
                        title="Remove logo"
                      >
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 group-hover:text-[#EB712B] transition-colors">
                        <Camera size={15} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-200 block">
                          Logo
                        </span>
                        <span className="text-[9px] text-gray-500 block">
                          1:1 Square
                        </span>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {/* 2. Club Cover Banner (16:9 Landscape Banner) */}
              <div className="flex-1 flex flex-col min-w-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="relative w-full h-32 rounded-2xl border border-white/10 hover:border-white/20 bg-[#161616] hover:bg-[#1a1a1a] flex flex-col items-center justify-center text-center p-4 transition-all duration-200 cursor-pointer overflow-hidden group shadow-sm"
                  title="Upload Wide 16:9 Club Cover Banner"
                >
                  {coverPreview ? (
                    <>
                      <img
                        src={coverPreview}
                        alt="Cover Preview"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white">
                        <ImageIcon size={20} className="mb-1 text-gray-300" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">Change Banner</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCover}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/80 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow z-10 cursor-pointer"
                        title="Remove banner"
                      >
                        <X size={10} />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-gray-400 group-hover:text-[#EB712B] transition-colors">
                        <ImageIcon size={15} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-gray-200 block">
                          Cover Banner
                        </span>
                        <span className="text-[9px] text-gray-500 block">
                          16:9 Landscape (Recommended: 1200×400)
                        </span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase">Club Name</label>
              <input 
                value={clubName}
                onChange={(e) => { setClubName(e.target.value); setErrors(p => ({...p, clubName: ''})); }}
                className={`w-full bg-[#1a1a1a] border ${errors.clubName ? 'border-red-500' : 'border-white/5'} rounded-lg p-2.5 text-xs text-white focus:border-[#EB712B] outline-none transition-colors`} 
                placeholder="e.g. Apex Velo Syndicate" 
              />
              {errors.clubName && <p className="text-[10px] text-red-500">{errors.clubName}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase">Club Type</label>
              <div className="relative">
                <select 
                  value={clubType}
                  onChange={(e) => setClubType(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg p-2.5 text-xs text-white appearance-none focus:border-[#EB712B] outline-none transition-colors"
                >
                  <option value="1">Cycling</option>
                  <option value="2">Running</option>
                  <option value="3">Triathlon</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-500" size={14} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase">Club Privacy</label>
              <div className="relative">
                <select 
                  value={privacy}
                  onChange={(e) => setPrivacy(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg p-2.5 text-xs text-white appearance-none focus:border-[#EB712B] outline-none transition-colors"
                >
                  <option value="1">Public (Anyone can join)</option>
                  <option value="2">Private (Approval required)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-500" size={14} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-gray-500 uppercase">Club Currency</label>
              <div className="relative">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg p-2.5 text-xs text-white appearance-none focus:border-[#EB712B] outline-none transition-colors"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 text-gray-500" size={14} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-500 uppercase">Primary Location</label>
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#EB712B] hover:underline cursor-pointer border-0 bg-transparent"
              >
                <MapPin size={12} /> Open Map Picker
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input 
                ref={apiKey ? (placesRef as any) : undefined}
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors(p => ({...p, location: ''})); }}
                className={`w-full bg-[#1a1a1a] border ${errors.location ? 'border-red-500' : 'border-white/5'} rounded-lg p-2.5 text-xs text-white focus:border-[#EB712B] outline-none transition-colors`} 
                placeholder={apiKey ? "Search city or location via Google Maps..." : "City or Region"} 
              />
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#EB712B]/10 border border-[#EB712B]/30 hover:bg-[#EB712B]/20 text-[#EB712B] rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                title="Open Interactive Google Map Picker"
              >
                <MapPin size={14} />
                <span className="hidden sm:inline">Pick on Map</span>
              </button>
            </div>
            {errors.location && <p className="text-[10px] text-red-500">{errors.location}</p>}
          </div>

          {/* Email Section */}
          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase">Email Address</label>
            <div 
              className={`relative border rounded-lg overflow-hidden transition-all duration-300 ${
                errors.email ? 'border-red-500' : 'border-white/10 focus-within:border-orange-500 bg-[#1a1a1a]'
              }`}
            >
              <div className={`absolute left-3 top-3 transition-colors duration-300 ${
                errors.email ? 'text-red-500' : 'text-gray-500'
              }`}>
                <Mail size={16} />
              </div>
              <input 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
                onBlur={handleBlur}
                className="w-full bg-transparent p-3 pl-10 text-xs text-white outline-none placeholder-gray-600" 
                placeholder="rider@performance.com" 
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 mt-1 animate-in fade-in">{errors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase">Phone Number</label>
            <input 
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setErrors(p => ({...p, phone: ''})); }}
              className={`w-full bg-[#1a1a1a] border ${errors.phone ? 'border-red-500' : 'border-white/5'} rounded-lg p-2.5 text-xs text-white focus:border-[#EB712B] outline-none transition-colors`} 
              placeholder="+1 (555) 000-0000" 
            />
            {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-500 uppercase">Club Mission & Description</label>
            <textarea 
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg p-3 h-24 text-xs text-white focus:border-[#EB712B] outline-none transition-colors" 
              placeholder="Describe the soul of your club..." 
            />
          </div>

          {/* Women & Non-Binary Switch */}
          <div className="flex items-center justify-between p-4 bg-[#161616] border border-white/5 rounded-xl transition-all duration-200 hover:border-white/10 shadow-xs">
            <div className="space-y-0.5 pr-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Women and non-binary only</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  Exclusive
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Only women and non-binary members can join this club
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsWomenAndNonBinary((prev) => !prev)}
              aria-label="Toggle Women and non-binary only"
              className={`w-12 h-6.5 rounded-full transition-colors flex items-center p-0.5 border cursor-pointer shrink-0 ${
                isWomenAndNonBinary
                  ? 'bg-[#EB712B] border-[#EB712B]'
                  : 'bg-[#262626] border-white/10'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                  isWomenAndNonBinary ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
            <button type="button" onClick={() => navigate(-1)} className="text-gray-500 text-xs font-medium hover:text-white transition-colors duration-200">
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isCreating || isUploading}
              className="group bg-[#EB712B] text-white px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#d16226] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>{isUploading ? "Uploading..." : isCreating ? "Saving..." : "Continue to Subscriptions"}</span>
              {!(isCreating || isUploading) && (
                <ArrowRight 
                  size={14} 
                  className="group-hover:translate-x-1 transition-transform duration-200" 
                />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Google Map Location Picker Modal */}
      <LocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSelectLocation={(addr) => {
          setLocation(addr);
          setErrors((p) => ({ ...p, location: "" }));
        }}
        initialLocation={location}
      />
    </div>
  );
}