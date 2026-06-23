import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  ImagePlus,
} from "lucide-react";

export default function EditClub() {
  const navigate = useNavigate();

  const [clubName, setClubName] = useState(
    localStorage.getItem("clubName") || "Cyc Rock Club",
  );
  const [email, setEmail] = useState(
    localStorage.getItem("email") || "sdodil@gmail.com",
  );
  const [phone, setPhone] = useState(localStorage.getItem("phone") || "120255");
  const [visibility, setVisibility] = useState(
    localStorage.getItem("visibility") || "Public",
  );
  const [clubType, setClubType] = useState(
    localStorage.getItem("clubType") || "Biking / Cycling",
  );
  const [location, setLocation] = useState(
    localStorage.getItem("location") || "sdad",
  );
  const [description, setDescription] = useState(
    localStorage.getItem("description") || "chshshf",
  );

  // Load directly from localStorage Base64 storage
  const [bannerFile, setBannerFile] = useState<string | null>(
    localStorage.getItem("bannerUrl"),
  );
  const [logoFile, setLogoFile] = useState<string | null>(
    localStorage.getItem("logoUrl"),
  );

  useEffect(() => {
    localStorage.setItem("clubName", clubName);
    localStorage.setItem("email", email);
    localStorage.setItem("phone", phone);
    localStorage.setItem("visibility", visibility);
    localStorage.setItem("clubType", clubType);
    localStorage.setItem("location", location);
    localStorage.setItem("description", description);
  }, [clubName, email, phone, visibility, clubType, location, description]);

  // Convert uploaded image to Base64 string for persistent localStorage saving
  const convertToBase64 = (file: File, callback: (base64: string) => void) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        callback(reader.result);
      }
    };
    reader.onerror = (error) => {
      console.error("Error converting file to base64: ", error);
    };
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      convertToBase64(e.target.files[0], (base64) => {
        setBannerFile(base64);
        localStorage.setItem("bannerUrl", base64);
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      convertToBase64(e.target.files[0], (base64) => {
        setLogoFile(base64);
        localStorage.setItem("logoUrl", base64);
      });
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    localStorage.removeItem("logoUrl");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving club profile...", {
      clubName,
      email,
      phone,
      visibility,
      clubType,
      location,
      description,
    });

    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-surface text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-400 hover:text-white font-extrabold text-[10px] tracking-widest uppercase bg-hover border border-white/5 px-6 py-3.5 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-white/10 cursor-pointer mb-10 shadow-xl"
        >
          <ArrowLeft size={14} className="text-[#EB712B]" />
          <span>Back to Dashboard</span>
        </button>

        {/* Top Title */}
        <h1 className="text-3xl font-black tracking-tight text-white mb-8">
          Edit Club Profile
        </h1>

        {/* Form Layout */}
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        >
          {/* LEFT COLUMN: Main Information Grid */}
          <div className="bg-[#181818] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
            <h2 className="text-base font-black tracking-tight text-white border-b border-white/[0.08] pb-4">
              General Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Club Name */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Club Name
                </label>
                <div className="relative">
                  <Building
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="e.g. Velocity Cycling"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="email"
                    placeholder="contact@club.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Visibility
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold appearance-none cursor-pointer hover:border-white/10"
                  >
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                  <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <svg
                      width="8"
                      height="5"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="#6B7280"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Club Type */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Club Type
                </label>
                <div className="relative">
                  <Building
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <select
                    value={clubType}
                    onChange={(e) => setClubType(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold appearance-none cursor-pointer hover:border-white/10"
                  >
                    <option>Biking / Cycling</option>
                    <option>Running</option>
                    <option>Cycling & Running</option>
                  </select>
                  <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <svg
                      width="8"
                      height="5"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="#6B7280"
                    >
                      <path
                        d="M1 1L5 5L9 1"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2.5 pt-2">
              <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Share the story of your club..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10 resize-none"
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Club Media Container */}
            <div className="bg-[#181818] border border-white/5 rounded-3xl p-8 space-y-6">
              <h2 className="text-base font-black tracking-tight text-white border-b border-white/[0.08] pb-4">
                Club Media
              </h2>

              {/* Hero Banner Upload Zone */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Hero Banner
                </span>
                <div className="bg-[#1F1F1F] border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 hover:border-[#EB712B]/40 cursor-pointer min-h-[140px]">
                  {bannerFile ? (
                    <div className="absolute inset-0">
                      <img
                        src={bannerFile}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-widest text-white uppercase bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                          Change Banner
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImagePlus
                        size={28}
                        className="text-gray-600 mb-2 group-hover:text-[#EB712B] transition-colors"
                      />
                      <p className="text-xs font-black text-white mb-1">
                        Click to upload banner
                      </p>
                      <p className="text-[9px] font-semibold text-gray-500">
                        16:9 ratio recommended [JPG, PNG]
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleBannerChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Club Logo Upload Zone */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  Club Logo
                </span>
                <div className="flex items-center gap-6 bg-[#1F1F1F] border border-white/5 rounded-2xl p-4">
                  <div className="w-16 h-16 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center relative overflow-hidden group/logo hover:border-[#EB712B]/50 transition-colors flex-shrink-0">
                    {logoFile ? (
                      <img
                        src={logoFile}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] font-bold text-gray-500 tracking-wider text-center px-2">
                        Upload Logo
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-medium text-gray-400 leading-relaxed max-w-[200px]">
                      Recommended size: 400x400px. Square format will be
                      automatically cropped to a circle.
                    </p>
                    <div className="flex gap-4 mt-2">
                      <label
                        htmlFor="logo-upload-input"
                        className="text-[10px] font-extrabold text-[#EB712B] hover:text-[#ff8036] uppercase tracking-wider cursor-pointer"
                      >
                        Change
                      </label>
                      <input
                        id="logo-upload-input"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[10px] font-extrabold text-gray-500 hover:text-white uppercase tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-4">
              <button
                type="submit"
                className="w-full py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black tracking-[0.15em] uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-[#EB712B]/30"
              >
                Save Changes
              </button>
            </div>

            {/* Footer */}
            <p className="text-[9px] font-medium text-center text-gray-500 tracking-wide pt-2">
              Last saved: Just now
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}