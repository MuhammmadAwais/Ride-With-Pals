// import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Lock, ShieldCheck, Wallet, CreditCard, HelpCircle, Languages, Info, AlertTriangle, ChevronRight 
} from 'lucide-react';

const ProfileAccount = () => {
  // const [isMember, setIsMember] = useState(false);
  const navigate = useNavigate(); 

  // Professional card styling
  const sectionCardStyle = "bg-[#111111] p-6 rounded-2xl border border-white/5";
  const rowItemStyle = "flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-4 -mx-4 transition-colors cursor-pointer group";

  return (
    <div className=" min-h-screen p-6 md:p-12 text-white font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Profile & Account</h1>
          <p className="text-[#888] text-sm">Manage your personal information and application preferences.</p>
        </div>

        {/* Profile Info Bar */}
        <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-white/5">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">Rock Climber <span className="text-[#EB712B]">⭐</span></h2>
              <p className="text-[#888] text-sm">Devon Lane</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#888] uppercase font-bold">Account Status: <span className="text-[#EB712B]">Premium Member</span></span>
<button className="bg-white/5 px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#EB712B] transition-all">
  Logout
</button>          </div>
        </div>

        {/* Account Management */}
        <section className="mb-10">
          <h3 className="text-xs text-[#888] font-bold uppercase mb-4 px-1">Account Management</h3>
          <div className={sectionCardStyle}>
            {[
              { icon: Users, title: "Manage Club", path: "/dashboard/manage-club" },
              { icon: Lock, title: "Change Password" },
              { icon: ShieldCheck, title: "Permission" },
              { icon: Wallet, title: "Wallet" },
              { icon: CreditCard, title: "Subscription" },
            ].map((item, idx) => (
              <div key={idx} onClick={() => item.path && navigate(item.path)} className={rowItemStyle}>
                <div className="flex items-center gap-4">
                  <item.icon className="text-[#EB712B]" size={20} />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <ChevronRight size={18} className="text-[#444] group-hover:text-white transition-colors" />
              </div>
            ))}
          </div>
        </section>

        {/* Workspace & Support */}
        <section className="mb-10">
          <h3 className="text-xs text-[#888] font-bold uppercase mb-4 px-1">Workspace & Support</h3>
          <div className={sectionCardStyle}>
            <div className={rowItemStyle}>
              <div className="flex items-center gap-4">
                <HelpCircle className="text-[#EB712B]" size={20} />
                <span className="font-medium text-sm">Support & Help</span>
              </div>
              <ChevronRight size={18} className="text-[#444]" />
            </div>
            <div className={rowItemStyle}>
              <div className="flex items-center gap-4">
                <Languages className="text-[#EB712B]" size={20} />
                <span className="font-medium text-sm">Languages</span>
              </div>
              <span className="text-xs text-[#888]">English (US)</span>
            </div>
            <div className={rowItemStyle}>
              <div className="flex items-center gap-4">
                <Info className="text-[#EB712B]" size={20} />
                <span className="font-medium text-sm">About App</span>
              </div>
              <span className="text-xs text-[#888]">Version 2.6.0 (Stable Build)</span>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mt-12 border border-red-900/20 bg-red-950/5 p-6 rounded-2xl">
          <h3 className="text-xs text-red-500 font-bold uppercase mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> Danger Zone
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-xs text-red-500/70 max-w-[70%]">Permanently delete your account and all associated club data. This action is irreversible.</p>
            <button className="border border-red-900/50 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-900/20 transition">Delete Account</button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default ProfileAccount;