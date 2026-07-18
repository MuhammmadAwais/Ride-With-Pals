import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { Upload, ChevronDown, Sparkles, ArrowRight, Mail } from "lucide-react";
import gsap from "gsap"; 
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { useClub } from "./hooks/useClub";
import { RideService } from "@/api/backendApi";

export default function ProfileSetup() {
  const navigate = useNavigate(); 
  const container = useRef(null); 
  
  const [clubName, setClubName] = useState("");
  const [clubType, setClubType] = useState("1"); // 1=Road Racing, 2=Running, 3=Cycling & Running
  const [privacy, setPrivacy] = useState("1"); // 1=Public, 2=Private
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [mission, setMission] = useState("");
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { handleCreateClub, isCreating } = useClub();

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
        email,
        location,
        description: mission,
        logo: logoUrl,
        coverImage: coverUrl,
        restrictUnpaidMembers: false,
        restrictClubShop: false,
        restrictJoinActivities: false
      };

      const success = await handleCreateClub(payload);
      
      if (success) {
        navigate("/view/clubside/dashboard"); 
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

  return (
    <div ref={container} className="min-h-screen w-full bg-[#111111] flex overflow-hidden">
      {/* LEFT SIDE */}
      <div 
        className="hidden md:flex w-[40%] bg-cover bg-center p-10 flex-col justify-end relative fade-in"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/Images/CycleImage2.png')" }}
      >
        <div className="absolute top-10 left-10 text-white/10 font-black text-7xl tracking-tighter transition-all duration-500 hover:text-[#EB712B] hover:opacity-100 cursor-pointer">
          RWP
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase mb-3">
            <Sparkles size={10} /> Onboarding Phase 01
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 transition-colors duration-300 hover:text-[#EB712B] cursor-pointer">
            Define Your Legacy
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Welcome to Ride With Pals. Establish your club's presence in the premier digital ecosystem.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="border border-dashed border-gray-700 rounded-lg h-24 flex flex-col items-center justify-center text-gray-500 hover:border-[#EB712B] focus-within:border-[#EB712B] transition-colors cursor-pointer relative overflow-hidden bg-[#1a1a1a]">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-50 transition-opacity" />
                ) : (
                  <>
                    <Upload size={16} className="mb-1" />
                    <span className="text-[9px] uppercase">Upload Logo</span>
                  </>
                )}
              </label>
            </div>
            
            <div className="relative">
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" id="cover-upload" />
              <label htmlFor="cover-upload" className="border border-dashed border-gray-700 rounded-lg h-24 flex flex-col items-center justify-center text-gray-500 hover:border-[#EB712B] focus-within:border-[#EB712B] transition-colors cursor-pointer relative overflow-hidden bg-[#1a1a1a]">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-50 transition-opacity" />
                ) : (
                  <>
                    <Upload size={16} className="mb-1" />
                    <span className="text-[9px] uppercase">Club Cover Banner</span>
                  </>
                )}
              </label>
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
                  <option value="1">Road Racing / Biking</option>
                  <option value="2">Running</option>
                  <option value="3">Cycling & Running</option>
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
              <label className="text-[10px] text-gray-500 uppercase">Primary Location</label>
              <input 
                value={location}
                onChange={(e) => { setLocation(e.target.value); setErrors(p => ({...p, location: ''})); }}
                className={`w-full bg-[#1a1a1a] border ${errors.location ? 'border-red-500' : 'border-white/5'} rounded-lg p-2.5 text-xs text-white focus:border-[#EB712B] outline-none transition-colors`} 
                placeholder="City or Region" 
              />
              {errors.location && <p className="text-[10px] text-red-500">{errors.location}</p>}
            </div>
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

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-6">
            <button type="button" onClick={() => navigate(-1)} className="text-gray-500 text-xs font-medium hover:text-white transition-colors duration-200">
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleSave}
              disabled={isCreating || isUploading}
              className="group bg-[#EB712B] text-white px-6 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#d16226] active:scale-[0.98] transition-all shadow-lg shadow-orange-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isUploading ? "Uploading..." : isCreating ? "Saving..." : "Complete Profile"}</span>
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
    </div>
  );
}