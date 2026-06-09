import React, { useState, useRef, useLayoutEffect } from "react";
// import { useNavigate } from "react-router-dom";git remote -v
import { Camera,  ChevronDown, Calendar } from "lucide-react";
import gsap from "gsap";

const AthleteProfileForm = () => {
  // const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState("Images/ProfileImage.png"); 
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  const toggleDropdown = (field: any) => {
    setOpenDropdown(openDropdown === field ? null : field);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string); 
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <div className="animate-item flex items-center gap-6 mb-12 bg-[#141414] p-6 rounded-3xl border border-[#1f1f1f]">
          <div className="relative">
            <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-2xl object-cover" />
            <button 
              type="button"
              onClick={handleCameraClick} 
              className="absolute -bottom-2 -right-2 bg-[#EB712B] p-2 rounded-full border-4 border-[#0a0a0a]"
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <p className="text-[#EB712B] text-xs font-bold uppercase tracking-widest">Athletic Identity</p>
            <h2 className="text-2xl font-bold">Alex_021</h2>
            <p className="text-gray-400 italic text-sm mt-1">"Pushing limits through the misty pines. Every climb is a conversation with the self."</p>
          </div>
        </div>

        <form ref={formRef} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={(e) => e.preventDefault()}>
          
          <div className="animate-item space-y-6">
            <h3 className="text-[#EB712B] font-bold uppercase tracking-widest text-sm border-b border-[#222] pb-2">Personal Information</h3>
            
            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Full Name</label>
              <input type="text" className="w-full bg-[#141414] border border-[#222] rounded-xl p-4 focus:border-[#EB712B] outline-none" placeholder="Alex Johnson" />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Date of Birth</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full bg-[#141414] border border-[#222] rounded-xl p-4 outline-none text-white focus:border-[#EB712B] transition-colors appearance-none"
                />
                <Calendar 
                  className="absolute right-4 top-4 text-gray-600 pointer-events-none" 
                  size={18} 
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Country / Region</label>
               <button
                type="button"
                onClick={() => toggleDropdown('country')}
                className="w-full flex items-center justify-between bg-[#141414] border border-[#222] rounded-xl p-4 outline-none focus:border-[#EB712B] transition-colors"
              >
                <span className="text-white">Germany</span>
                <ChevronDown 
                  className={`transition-all duration-300 ${openDropdown === 'country' ? "text-[#EB712B] rotate-180" : "text-gray-500"}`} 
                  size={20} 
                />
              </button>

              {openDropdown === 'country' && (
                <div className="absolute  left-0 w-full bg-[#141414] border border-[#222] rounded-xl shadow-2xl overflow-hidden">
                  {['Germany', 'Pakistan', 'USA', 'Canada'].map((option) => (
                    <div
                      key={option}
                      className="p-4 hover:bg-[#222] cursor-pointer text-white transition-colors"
                      onClick={() => toggleDropdown(null)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="animate-item space-y-6">
            <h3 className="text-[#EB712B] font-bold uppercase tracking-widest text-sm border-b border-[#222] pb-2">Account Settings</h3>
            
            <div className="relative">
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Gender</label>
              <button
                type="button"
                onClick={() => toggleDropdown('gender')}
                className="w-full flex items-center justify-between bg-[#141414] border border-[#222] rounded-xl p-4 outline-none focus:border-[#EB712B] transition-colors"
              >
                <span className="text-white">Male</span>
                <ChevronDown 
                  className={`transition-all duration-300 ${openDropdown === 'gender' ? "text-[#EB712B] rotate-180" : "text-gray-500"}`} 
                  size={20} 
                />
              </button>

              {openDropdown === 'gender' && (
                <div className="absolute  left-0 w-full bg-[#141414] border border-[#222] rounded-xl z-50 shadow-2xl overflow-hidden">
                  {['Male', 'Female', 'Non-binary'].map((option) => (
                    <div
                      key={option}
                      className="p-4 hover:bg-[#222] cursor-pointer text-white transition-colors"
                      onClick={() => toggleDropdown(null)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Unit</label>
              <button
                type="button"
                onClick={() => toggleDropdown('unit')}
                className="w-full flex items-center justify-between bg-[#141414] border border-[#222] rounded-xl p-4 outline-none focus:border-[#EB712B] transition-colors"
              >
                <span className="text-white">Add</span>
                <ChevronDown 
                  className={`transition-all duration-300 ${openDropdown === 'unit' ? "text-[#EB712B] rotate-180" : "text-[#EB712B]"}`} 
                  size={20} 
                />
              </button>

              {openDropdown === 'unit' && (
                <div className="absolute  left-0 w-full bg-[#141414] border border-[#222] rounded-xl z-50 shadow-2xl overflow-hidden">
                  {['Metric (km, kg)', 'Imperial (mi, lbs)'].map((option) => (
                    <div
                      key={option}
                      className="p-4 hover:bg-[#222] cursor-pointer text-white transition-colors"
                      onClick={() => toggleDropdown(null)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Phone Number </label>
              <input type="text" className="w-full bg-[#141414] border border-[#222] rounded-xl p-4 outline-none" placeholder="+49 152 445 221" />
            </div>
          </div>

          <div className="animate-item md:col-span-2">
            <label className="block text-gray-400 text-xs font-bold mb-2 uppercase">Athlete Biography</label>
            <textarea className="w-full bg-[#141414] border border-[#222] rounded-xl p-4 h-32 focus:border-[#EB712B] outline-none" placeholder="Tell your story..." />
          </div>

          <button 
            type="button" 
            onClick={() => {
              console.log("Button clicked!");
              window.location.href = "/select-role"; 
            }} 
            className="animate-item md:col-span-2 bg-[#EB712B] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#d16226] transition-all"
          >
            SAVE
          </button>
        </form>
      </div>
    </div>
  );
};

export default AthleteProfileForm;