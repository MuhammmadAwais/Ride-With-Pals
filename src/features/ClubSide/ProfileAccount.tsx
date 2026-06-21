import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Users,
  Lock,
  ShieldCheck,
  Wallet,
  CreditCard,
  HelpCircle,
  Languages,
  Info,
  AlertTriangle,
  ChevronRight,
  Moon,
  Sun,
  Globe,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
  Search,
  Check,
  Shield,
  ArrowRight,
  Bike,
} from "lucide-react";

const ProfileAccount = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Modals & States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({ current: "", new: "", confirm: "" });
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | null>(
    null,
  );
  
  const handleLogout = () => {
    // 1. Clear authentication tokens or session storage (adjust according to your auth setup)
    localStorage.removeItem("token"); // Example: if you store a JWT token
    localStorage.removeItem("user");  // Example: if you store user data

    // Alternatively, if you are using an AuthContext:
    // logout(); 

    // 2. Redirect the user to the login page
    navigate("/login");
  };
  const [fullAccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState({
    publishRides: false,
    publishNews: false,
    publishDiscount: false,
  });
  
  const [tempUserPermissions, setTempUserPermissions] =
    useState(userPermissions);
  const [isMemberPickerOpen, setIsMemberPickerOpen] = useState(false);
  const [memberSelectionType, setMemberSelectionType] = useState<
    "all" | "select"
  >("select");
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Admin Granular Permissions
  const [adminPermissions, setAdminPermissions] = useState({
    publishRides: true,
    publishNews: true,
    publishDiscount: false,
    banUsers: false,
  });

  // Temporary state for the modal
  const [tempPermissions, setTempPermissions] = useState(adminPermissions);

  const handleOpenAdminModal = () => {
    setTempPermissions(adminPermissions); // Sync before opening
    setIsAdminSettingsOpen(true);
  };

  const [members, setMembers] = useState([
    { id: 1, name: "Esther Howard", selected: true, isAdmin: true },
    { id: 2, name: "Arlene McCoy", selected: true, isAdmin: true },
    { id: 3, name: "Jane Cooper", selected: false, isAdmin: false },
    { id: 4, name: "Annette Black", selected: true, isAdmin: false },
  ]);

  const handleSaveAdminPermissions = () => {
    setIsSaving(true);
    setTimeout(() => {
      setAdminPermissions(tempPermissions);
      setIsSaving(false);
      setIsAdminSettingsOpen(false);
    }, 500);
  };

  const handleSavePassword = () => {
    let newErrors = { current: "", new: "", confirm: "" };
    let isValid = true;
    if (!passwordData.current) {
      newErrors.current = "Current password is required";
      isValid = false;
    }
    if (!passwordData.new) {
      newErrors.new = "New password is required";
      isValid = false;
    }
    if (passwordData.new !== passwordData.confirm) {
      newErrors.confirm = "Passwords do not match";
      isValid = false;
    }
    setErrors(newErrors);
    if (isValid) {
      setIsPasswordModalOpen(false);
    }
  };

  const handleOpenUserModal = () => {
    setTempUserPermissions(userPermissions);
    setIsUserModalOpen(true);
  };

  const handleSaveUserPermissions = () => {
    setIsSaving(true);
    setTimeout(() => {
      setUserPermissions(tempUserPermissions);
      setIsSaving(false);
      setIsUserModalOpen(false);
    }, 500);
  };

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  

  const sectionCardStyle =
    "bg-white dark:bg-[#111111] p-4 md:p-6 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors";
  const rowItemStyle =
    "flex items-center justify-between py-4 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.05] px-2 md:px-4 -mx-4 transition-colors cursor-pointer group";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white p-4 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Profile & Account
            </h1>
            <p className="text-gray-500 dark:text-[#888] text-sm">
              Manage your personal information and application preferences.
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 bg-gray-200 dark:bg-[#111111] px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition-all"
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} />
            )}
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] flex items-center justify-center">
              👤
            </div>
            <div>
              <h2 className="text-xl font-bold">Rock Climber</h2>
              <p className="text-gray-500 dark:text-[#888] text-sm">
                Devon Lane
              </p>
            </div>
          </div>
          <button 
      onClick={handleLogout}
      className="bg-white/5 px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#EB712B] transition-all cursor-pointer active:scale-95"
    >
      Logout
    </button>
        </div>

        {/* Account Management */}
        <section className="mb-8">
  <h3 className="text-xs text-gray-500 dark:text-[#888] font-bold uppercase mb-4 px-1">
    Account Management
  </h3>
  <div className={sectionCardStyle}>
    {[
      {
        icon: Users,
        title: "Manage Club",
        path: "/manage-club",
      },
      {
        icon: Lock,
        title: "Change Password",
        action: () => setIsPasswordModalOpen(true),
      },
      {
        icon: ShieldCheck,
        title: "Admin Modules",
        action: handleOpenAdminModal,
      },
      {
        icon: Bike,
        title: "User Modules",
        action: handleOpenUserModal,
      },
      { 
        icon: Wallet, 
        title: "Wallet", 
        path: "/wallet" 
      },
      {
        icon: CreditCard,
        title: "Subscription",
        path: "/subscription",
      },
    ].map((item, idx) => (
      <div
        key={idx}
        onClick={
          item.action || (() => item.path && navigate(item.path))
        }
        className={rowItemStyle}
      >
        <div className="flex items-center gap-4">
          <item.icon className="text-[#EB712B]" size={20} />
          <span className="font-medium text-sm">{item.title}</span>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>
    ))}
  </div>
</section>

        {/* Workspace & Support */}
        <section className="mb-8">
          <h3 className="text-xs text-gray-500 dark:text-[#888] font-bold uppercase mb-4 px-1">
            Workspace & Support
          </h3>
          <div className={sectionCardStyle}>
            <Link to="/support" className="block w-full">
              <div className={rowItemStyle}>
                <div className="flex items-center gap-4">
                  <HelpCircle className="text-[#EB712B]" size={20} />
                  <span className="font-medium text-sm">Support & Help</span>
                </div>
                <ChevronRight size={18} />
              </div>
            </Link>
            <div
              onClick={() => setIsLanguageModalOpen(true)}
              className={`${rowItemStyle} cursor-pointer hover:bg-white/[0.05]`}
            >
              <div className="flex items-center gap-4">
                <Languages className="text-[#EB712B]" size={20} />
                <span className="font-medium text-sm">Languages</span>
              </div>
              <span className="text-xs text-gray-500">English (US)</span>
            </div>
            <Link to="/about-app" className="block cursor-pointer">
              <div className={rowItemStyle}>
                <div className="flex items-center gap-4">
                  <Info className="text-[#EB712B]" size={20} />
                  <span className="font-medium text-sm">About App</span>
                </div>
                <span className="text-xs text-gray-500">v2.6.0</span>
              </div>
            </Link>{" "}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="border border-red-500/20 bg-red-500/5 p-6 rounded-2xl">
          <h3 className="text-xs text-red-500 font-bold uppercase mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> Danger Zone
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-xs text-red-500/70">
              Permanently delete your account and all data.
            </p>
            <button className="border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/10">
              Delete Account
            </button>
          </div>
        </section>
      </div>

      {/* Password Handler */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Change Password
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Ensure your account is protected with a strong password.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Current Password"
                    className={`w-full bg-[#111111] p-3 rounded-lg border ${errors.current ? "border-[#EB712B]" : "border-white/10"} text-white outline-none focus:border-[#EB712B]`}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        current: e.target.value,
                      });
                      if (errors.current) setErrors({ ...errors, current: "" }); // Clear error on change
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.current && (
                  <p className="text-orange-500 text-xs mt-2 font-bold">
                    {errors.current}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    className={`w-full bg-[#111111] p-3 rounded-lg border ${errors.new ? "border-[#EB712B]" : "border-white/10"} text-white outline-none focus:border-[#EB712B]`}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, new: e.target.value });
                      if (errors.new) setErrors({ ...errors, new: "" });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.new && (
                  <p className="text-[#EB712B] text-xs mt-2 font-bold">
                    {errors.new}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm New Password"
                    className={`w-full bg-[#111111] p-3 rounded-lg border ${errors.confirm ? "border-[#EB712B]" : "border-white/10"} text-white outline-none focus:border-[#EB712B]`}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        confirm: e.target.value,
                      });
                      if (errors.confirm) setErrors({ ...errors, confirm: "" });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-[#EB712B] text-xs mt-2 font-bold">
                    {errors.confirm}
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 bg-[#111111] p-4 rounded-lg mt-6 border border-white/5 text-gray-400 text-xs">
              <AlertCircle size={32} className="text-[#EB712B] shrink-0" />
              <p>
                Use at least 8 characters, including a mix of letters, numbers,
                and symbols. Avoid using common words or names associated with
                your profile.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-gray-400 font-bold hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                className="px-6 py-2 bg-[#EB712B] rounded-lg font-bold text-white hover:bg-[#d66525] transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Model */}
      {isPermissionsModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-white">Permissions</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage access levels for your club
                </p>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                {
                  id: "admin",
                  label: "Administrator",
                  desc: "Full system control and user management.",
                  icon: Shield,
                },
                {
                  id: "user",
                  label: "User",
                  desc: "Standard access to club features.",
                  icon: Users,
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedRole(item.id as any);
                    if (item.id === "admin") {
                      handleOpenAdminModal();
                    } else if (item.id === "user") {
                      handleOpenUserModal();
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all text-left ${selectedRole === item.id ? "bg-[#1A1A1A] border-[#EB712B]" : "bg-[#1A1A1A] border-white/5"}`}
                >
                  <item.icon className="text-[#EB712B] mb-3" size={24} />
                  <h3 className="text-sm font-bold text-white mb-1">
                    {item.label}
                  </h3>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Restored Section */}
            <button
              onClick={() => setIsMemberPickerOpen(true)}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between mb-8 transition-all ${fullAccess ? "bg-[#1A1A1A] border-[#EB712B]" : "bg-[#1A1A1A] border-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${fullAccess ? "bg-[#EB712B]" : "bg-[#1A1A1A]"}`}
                >
                  <Shield
                    size={20}
                    className={fullAccess ? "text-white" : "text-[#EB712B]"}
                  />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">
                    Grant Full Club Access
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Unlock all restricted sections
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className="text-gray-500" />
            </button>

            <button
              onClick={() => setIsPermissionsModalOpen(false)}
              className="w-full bg-[#EB712B] py-3 rounded-xl text-sm font-bold text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Professional Admin*/}
      {isAdminSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Decorative Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#EB712B] to-transparent" />

            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Admin Access
                </h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mt-1">
                  Granular Control
                </p>
              </div>
              <button
                onClick={() => setIsAdminSettingsOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Permissions List */}
            <div className="space-y-4 mb-8">
              {[
                {
                  key: "publishRides",
                  label: "Publish Rides",
                  sub: "CONTENT",
                  icon: Bike,
                },
                {
                  key: "publishNews",
                  label: "Publish News",
                  sub: "COMMUNICATIONS",
                  icon: Info,
                },
                {
                  key: "publishDiscount",
                  label: "Publish Discount",
                  sub: "MARKETING",
                  icon: CreditCard,
                },
                {
                  key: "banUsers",
                  label: "User Moderation",
                  sub: "SECURITY",
                  icon: Shield,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="group bg-[#151515] p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-white/5 text-[#EB712B] group-hover:bg-[#EB712B] group-hover:text-white transition-all">
                      <item.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {item.label}
                      </p>
                      <p className="text-[9px] text-gray-500 font-bold uppercase">
                        {item.sub}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setAdminPermissions({
                        ...adminPermissions,
                        [item.key]:
                          !adminPermissions[
                            item.key as keyof typeof adminPermissions
                          ],
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${adminPermissions[item.key as keyof typeof adminPermissions] ? "bg-[#EB712B]" : "bg-[#222]"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${adminPermissions[item.key as keyof typeof adminPermissions] ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsAdminSettingsOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white border border-white/5 hover:border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAdminPermissions}
                disabled={isSaving}
                className={`flex-1 bg-[#EB712B] py-3 rounded-xl text-sm font-bold text-white transition-all 
                ${isSaving ? "opacity-70 cursor-not-allowed" : "hover:bg-[#ff7e36]"}`}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>

            <p className="text-[9px] text-gray-700 text-center mt-6 flex items-center justify-center gap-2">
              <Shield size={10} /> SYSTEM AUDIT ENABLED
            </p>
          </div>
        </div>
      )}

      {/* userModel */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Decorative Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-transparent" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  User Access
                </h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mt-1">
                  Standard Controls
                </p>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {[
                { key: "publishRides", label: "Publish Rides", icon: Bike },
                { key: "publishNews", label: "Publish News", icon: Info },
                {
                  key: "publishDiscount",
                  label: "Publish Discount",
                  icon: CreditCard,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="group bg-[#151515] p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon container with hover animation */}
                    <div className="p-2 rounded-xl bg-white/5 text-gray-400 group-hover:bg-[#EB712B] group-hover:text-white transition-all">
                      <item.icon size={18} />
                    </div>
                    <p className="text-sm font-bold text-white">{item.label}</p>
                  </div>

                  <button
                    onClick={() =>
                      setTempUserPermissions({
                        ...tempUserPermissions,
                        [item.key]:
                          !tempUserPermissions[
                            item.key as keyof typeof tempUserPermissions
                          ],
                      })
                    }
                    className={`w-11 h-6 rounded-full transition-all duration-300 relative ${tempUserPermissions[item.key as keyof typeof tempUserPermissions] ? "bg-[#EB712B]" : "bg-[#222]"}`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${tempUserPermissions[item.key as keyof typeof tempUserPermissions] ? "left-6" : "left-1"}`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 border border-white/5 hover:text-white hover:border-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserPermissions}
                disabled={isSaving}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-black transition-all ${isSaving ? "bg-[#EB712B" : "bg-[#EB712B] hover:bg-[#EB712B] text-white"}`}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isMemberPickerOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-300">
          <div className="bg-[#121212] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => setIsMemberPickerOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={22} />
              </button>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Permissions
              </h2>
              <button
                onClick={() => setIsMemberPickerOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Selection Type - Styled like image_06e4c7.png */}
            <div className="space-y-3 mb-6">
              {[
                { id: "all", label: "All Member" },
                { id: "select", label: "Select Members" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMemberSelectionType(item.id as any)}
                  className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 
              ${
                memberSelectionType === item.id
                  ? "border-[#EB712B] bg-[#1a1a1a]"
                  : "border-white/5 bg-[#1a1a1a] hover:border-white/10"
              }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${memberSelectionType === item.id ? "border-[#EB712B]" : "border-gray-600"}`}
                  >
                    {memberSelectionType === item.id && (
                      <div className="w-2.5 h-2.5 bg-[#EB712B] rounded-full" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold ${memberSelectionType === item.id ? "text-white" : "text-gray-400"}`}
                  >
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & List */}
            {memberSelectionType === "select" && (
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-3.5 text-gray-500"
                  />
                  <input
                    placeholder="Search members..."
                    className="w-full bg-[#1a1a1a] p-3 pl-11 rounded-xl border border-white/5 text-sm text-white placeholder:text-gray-600 focus:border-[#EB712B] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-white/5" />
                        <span className="text-sm font-semibold text-white">
                          {m.name}
                        </span>
                        {m.isAdmin && (
                          <Shield size={13} className="text-[#EB712B]" />
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setMembers(
                            members.map((mem) =>
                              mem.id === m.id
                                ? { ...mem, selected: !mem.selected }
                                : mem,
                            ),
                          )
                        }
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${m.selected ? "bg-[#EB712B] border-[#EB712B]" : "border-gray-600"}`}
                      >
                        {m.selected && (
                          <Check size={14} className="text-white" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={() => {
                // Functional Save Action
                console.log("Permissions saved:", members);
                setIsMemberPickerOpen(false);
              }}
              className="w-full bg-[#EB712B] hover:bg-[#d66525] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(235,113,43,0.3)]"
            >
              <Shield size={18} /> Save Permissions
            </button>
          </div>
        </div>
      )}

      {/* Language Modal */}
      {isLanguageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Decorative Gradient Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-transparent" />

            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  System Localization
                </h2>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mt-1">
                  Operational Settings
                </p>
              </div>
              <button
                onClick={() => setIsLanguageModalOpen(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { name: "English", tag: "Standard" },
                { name: "Español", tag: "Regional" },
              ].map((lang) => (
                <div
                  key={lang.name}
                  onClick={() => setSelectedLanguage(lang.name)}
                  className={`cursor-pointer transition-all p-6 rounded-2xl flex flex-col items-center ${
                    selectedLanguage === lang.name
                      ? "bg-[#151515] border-2 border-[#EB712B]"
                      : "bg-[#151515] border border-white/5 opacity-50 hover:opacity-100"
                  }`}
                >
                  <Globe
                    className={`mb-3 ${selectedLanguage === lang.name ? "text-[#EB712B]" : "text-gray-500"}`}
                    size={24}
                  />
                  <span className="text-sm font-bold text-white uppercase">
                    {lang.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-widest font-bold ${selectedLanguage === lang.name ? "text-[#EB712B]" : "text-gray-500"}`}
                  >
                    {lang.tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-[#151515] p-4 rounded-xl border border-white/5 flex gap-3 mb-8">
              <AlertCircle className="text-[#EB712B] shrink-0" size={16} />
              <p className="text-[10px] text-gray-400">
                System re-initialization is required to apply localization
                assets.
              </p>
            </div>

            <button
              onClick={() => {
                console.log("Applying language:", selectedLanguage);

                setIsLanguageModalOpen(false);
              }}
              className="w-full bg-[#EB712B] py-3 rounded-xl text-sm font-bold text-white hover:bg-[#ff7e36] transition-all"
            >
              Apply Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAccount;
