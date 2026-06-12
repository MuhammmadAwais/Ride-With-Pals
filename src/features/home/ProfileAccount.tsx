import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Lock, ShieldCheck, Wallet, CreditCard, Plus, HelpCircle, Languages, Info 
} from 'lucide-react';

const ProfileAccount = () => {
  const [isMember, setIsMember] = useState(false);
  const navigate = useNavigate(); 

  const cards = [
    { icon: Users, title: "Manage Club", desc: "Update club details, rosters, and schedules for your team.", action: "Open Dashboard", path: "/dashboard/manage-club" },
    { icon: Lock, title: "Change Password", desc: "Secure your account with a strong, updated password.", action: "Update Security" },
    { icon: ShieldCheck, title: "Permission", desc: "Control data access and user roles within your organization.", action: "Manage Access" },
    { icon: Wallet, title: "Wallet", desc: "View balance, transaction history, and payout settings.", action: "Check Balance" },
    { icon: CreditCard, title: "Subscription", desc: "Review your current plan benefits and renewal dates.", action: "Plan Details" },
  ];

  // Professional subtle border styling
  const cardStyle = "bg-[#1e1e1e] p-6 rounded-2xl border border-white/5 hover:border-white/10 shadow-sm transition-all duration-300";

  return (
    <div className="bg-[#121212] min-h-screen p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile & Account</h1>
            <p className="text-[#a0a0a0] mt-1">Manage your personal information and application preferences.</p>
          </div>
          <div className="flex items-center gap-6 bg-[#1e1e1e] px-6 py-3 rounded-2xl border border-white/5 w-fit">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#a0a0a0]">Switch to Member</span>
              <div 
                onClick={() => setIsMember(!isMember)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ${isMember ? 'bg-[#EB712B]' : 'bg-[#2a2a2a]'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${isMember ? 'left-6' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className={`${cardStyle} flex flex-col md:flex-row items-center justify-between mb-8`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10">
<img src="/Images/ClimberImage.png" alt="Profile" className="w-full h-full object-cover" />            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">Rock Climber <span className="text-[#EB712B]">⭐</span></h2>
              <p className="text-[#a0a0a0]">Devon Lane</p>
            </div>
          </div>
          <button className="bg-white/5 text-[#fca5a5] px-6 py-2 rounded-xl font-medium hover:bg-[#fca5a5]/10 transition">Logout</button>
        </div>

        {/* Workspace Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {cards.map((card, idx) => (
            <div key={idx} className={cardStyle}>
              <div className="w-10 h-10 bg-[#121212] rounded-lg flex items-center justify-center mb-4 border border-white/5">
                <card.icon className="w-5 h-5 text-[#EB712B]" />
              </div>
              <h3 className="text-xl font-bold mb-2">{card.title}</h3>
              <p className="text-[#a0a0a0] text-sm mb-6">{card.desc}</p>
              <button 
                onClick={() => card.path ? navigate(card.path) : null}
                className="text-[#EB712B] font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                {card.action} →
              </button>
            </div>
          ))}
          <div className="border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-[#a0a0a0] hover:border-white/20 hover:text-white transition cursor-pointer">
            <div className="w-10 h-10 bg-[#1e1e1e] rounded-lg flex items-center justify-center mb-2 border border-white/5">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-medium text-sm">Add Shortcut</span>
          </div>
        </div>

        {/* Global Config Sections */}
        <h2 className="text-2xl font-bold mb-8">Workspace Settings</h2>
<div className="grid grid-cols-1 gap-6 mb-16">         
          <div className={cardStyle}>
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="text-[#EB712B]" />
              <div>
                <h3 className="font-bold">Support & Help</h3>
                <p className="text-sm text-[#a0a0a0]">Get assistance</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Documentation', 'Live Chat Support', 'Help Center'].map((item) => (
                <div key={item} className="p-3 bg-[#121212] rounded-lg border border-white/5 hover:border-white/10 cursor-pointer transition text-sm text-[#a0a0a0] hover:text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 mb-4">
              <Languages className="text-[#EB712B]" />
              <div>
                <h3 className="font-bold">Languages</h3>
                <p className="text-sm text-[#a0a0a0]">Choose language</p>
              </div>
            </div>
            <label className="text-sm text-[#a0a0a0] block mb-2">Application Language</label>
            <select className="w-full bg-[#121212] border border-white/10 p-3 rounded-lg text-white appearance-none cursor-pointer focus:border-[#EB712B] outline-none transition-all">
              <option>English (US)</option>
              <option>Spanish (ES)</option>
            </select>
          </div>

          {/* About */}
          <div className={cardStyle}>
            <div className="flex items-center gap-3 mb-6">
              <Info className="text-[#EB712B]" />
              <div>
                <h3 className="font-bold">About App</h3>
                <p className="text-sm text-[#a0a0a0]">Version info</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-[#a0a0a0] mb-4">
              <span>Version</span>
              <span>v3.4.0</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-6 mt-8">
          <button className="text-[#a0a0a0] hover:text-white transition">Reset</button>
          <button className="bg-[#EB712B] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#c95f1f] transition">Apply Changes</button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccount;