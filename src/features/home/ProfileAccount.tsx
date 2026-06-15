import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { 
  Users, Lock, ShieldCheck, Wallet, CreditCard, HelpCircle, Languages, 
  Info, AlertTriangle, ChevronRight, Moon, Sun 
} from 'lucide-react';

const ProfileAccount = () => {
  const navigate = useNavigate(); 
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const sectionCardStyle = "bg-white dark:bg-[#111111] p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors";
  const rowItemStyle = "flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.05] px-2 md:px-4 -mx-4 transition-colors cursor-pointer group";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-4 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto w-full">
        
        <div className="flex justify-between items-start mb-8 md:mb-10">
          <div className="text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Profile & Account</h1>
            <p className="text-gray-500 dark:text-[#888] text-sm">Manage your personal information and application preferences.</p>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-2 bg-gray-200 dark:bg-[#111111] px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"
          >
            {theme === 'dark' ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} />}
            {theme === 'dark' ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="bg-white dark:bg-[#111111] p-5 md:p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 md:mb-10 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center border border-gray-200 dark:border-white/5 shrink-0">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">Rock Climber <span className="text-[#EB712B]">⭐</span></h2>
              <p className="text-gray-500 dark:text-[#888] text-sm">Devon Lane</p>
            </div>
          </div>
          <button className="w-full sm:w-auto bg-gray-100 dark:bg-white/5 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#EB712B] transition-all">
            Logout
          </button>
        </div>

        <div className="grid gap-8">
          <section>
            <h3 className="text-[10px] md:text-xs text-gray-500 dark:text-[#888] font-bold uppercase mb-4 px-1">Account Management</h3>
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
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{item.title}</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 dark:text-[#444] group-hover:text-black dark:group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] md:text-xs text-gray-500 dark:text-[#888] font-bold uppercase mb-4 px-1">Workspace & Support</h3>
            <div className={sectionCardStyle}>
              <div className={rowItemStyle}>
                <div className="flex items-center gap-4">
                  <HelpCircle className="text-[#EB712B]" size={20} />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">Support & Help</span>
                </div>
                <ChevronRight size={18} className="text-gray-400 dark:text-[#444]" />
              </div>
              <div className={rowItemStyle}>
                <div className="flex items-center gap-4">
                  <Languages className="text-[#EB712B]" size={20} />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">Languages</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-[#888]">English (US)</span>
              </div>
              <div className={rowItemStyle}>
                <div className="flex items-center gap-4">
                  <Info className="text-[#EB712B]" size={20} />
                  <span className="font-medium text-sm text-gray-900 dark:text-white">About App</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-[#888] hidden sm:block">Version 2.6.0 (Stable Build)</span>
              </div>
            </div>
          </section>

          <section className="border border-red-200 dark:border-red-900/20 bg-red-50 dark:bg-red-950/5 p-5 md:p-6 rounded-2xl transition-colors">
            <h3 className="text-[10px] md:text-xs text-red-600 dark:text-red-500 font-bold uppercase mb-2 flex items-center gap-2">
              <AlertTriangle size={14} /> Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-xs text-red-800/70 dark:text-red-500/70 max-w-sm">Permanently delete your account and all associated club data. This action is irreversible.</p>
              <button className="w-full sm:w-auto border border-red-300 dark:border-red-900/50 text-red-600 dark:text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition">Delete Account</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccount;