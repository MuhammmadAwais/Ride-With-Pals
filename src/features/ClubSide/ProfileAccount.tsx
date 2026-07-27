import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Users,
  Lock,
  ShieldCheck,
  Shield,

  CreditCard,
  HelpCircle,

  Info,
  AlertTriangle,

  ArrowRight,
  Moon,
  Sun,
  Globe,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  ChevronLeft,
  Search,
  Bike,
  Activity,
  Loader2,
  Check,
  Calendar,
  MapPin,
  Phone,
  Clock,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useUpdatePasswordMutation, useUpdateScaleUnitSettingsMutation, useUserInfoQuery } from "@/features/auth/api/authApiSlice";
import { useCheckStravaStatusQuery, useConnectStravaAccountMutation, useDisconnectStravaAccountMutation } from "@/features/club/api/stravaApiSlice";

interface ProfileAccountProps {
  role?: 'organizer' | 'athlete';
}

const ProfileAccount: React.FC<ProfileAccountProps> = ({ role = 'organizer' }) => {
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

  // API Hooks
  const { data: userProfileData, refetch: refetchUserInfo } = useUserInfoQuery();
  const [updatePassword] = useUpdatePasswordMutation();
  const [updateScaleUnit, { isLoading: isUpdatingScale }] = useUpdateScaleUnitSettingsMutation();
  const [selectedScale, setSelectedScale] = useState<string>("kilometer");

  // Strava Hooks
  const { data: stravaStatus, refetch: refetchStravaStatus } = useCheckStravaStatusQuery();
  {stravaStatus}
  
  const [connectStrava, { isLoading: isConnectingStrava }] = useConnectStravaAccountMutation();
  const [disconnectStrava, { isLoading: isDisconnectingStrava }] = useDisconnectStravaAccountMutation();

  // Refetch user & Strava info whenever user returns focus to this tab
  useEffect(() => {
    const handleFocus = () => {
      refetchUserInfo();
      refetchStravaStatus();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchUserInfo, refetchStravaStatus]);

  const handleConnectStrava = async () => {
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      const res = await connectStrava({ redirectUrl }).unwrap();
      const targetUrl = res.authorizeUrl || res.authUrl || res.url || res.redirectUrl || res.redirectUri;
      if (targetUrl) {
        const width = 600;
        const height = 750;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          targetUrl,
          'StravaAuthWindow',
          `toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=${width}, height=${height}, top=${top}, left=${left}`
        );

        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          window.location.href = targetUrl;
          return;
        }

        toast.info("Please authorize Strava in the popup window.");

        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            refetchUserInfo();
            refetchStravaStatus();
            toast.success("Strava status refreshed!");
          }
        }, 1000);
      } else {
        toast.info("Strava authentication initiated.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to initiate Strava connection.");
    }
  };

  const handleDisconnectStrava = async () => {
    try {
      await disconnectStrava().unwrap();
      toast.success("Disconnected from Strava.");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to disconnect Strava.");
    }
  };
  
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

  const handleSavePassword = async () => {
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
      try {
        await updatePassword({
          password: passwordData.current,
          newPassword: passwordData.new,
        }).unwrap();
        toast.success("Password updated successfully!");
        setIsPasswordModalOpen(false);
        setPasswordData({ current: "", new: "", confirm: "" });
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to update password.");
      }
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

  

 
  return (
    <div className="min-h-screen bg-main-bg text-text-main p-4 md:p-8 lg:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight uppercase">
              Profile <span className="text-[#EB712B]">&</span> Account
            </h1>
            <p className="text-gray-500 dark:text-[#888] text-xs font-bold tracking-widest uppercase mt-2">
              Manage your personal information and application preferences
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 bg-surface border border-white/5 px-4 py-2.5 rounded-xl text-xs font-bold hover:border-white/20 transition-all shadow-lg active:scale-95"
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-gray-400" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          
          {/* CARD 1: User Profile Summary (Spans 2 columns) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EB712B]/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#EB712B]/20 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-main-bg flex items-center justify-center border-2 border-white/10 overflow-hidden shadow-xl shrink-0">
                  {userProfileData?.profileImage ? (
                    <img src={userProfileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{userProfileData?.fullName || "Alexander"}</h2>
                  <p className="text-[#EB712B] font-bold text-sm tracking-wide mt-1">{userProfileData?.email}</p>
                  <p className="text-xs text-gray-500 font-medium mt-3 flex items-center gap-2">
                    <Calendar size={14} /> Joined {userProfileData?.createdAt ? new Date(userProfileData.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white/5 hover:bg-[#EB712B] border border-white/10 hover:border-[#EB712B] px-8 py-3 rounded-2xl text-sm font-bold text-white transition-all cursor-pointer active:scale-95 shadow-lg whitespace-nowrap"
              >
                Logout
              </button>
            </div>
            {userProfileData?.description && (
              <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={12} /> Bio
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  "{userProfileData.description}"
                </p>
              </div>
            )}
          </div>

          {/* CARD 2: Personal Info */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={12} /> Contact Details
            </h3>
            <div className="space-y-6 flex-1">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#EB712B]"><Phone size={18} /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="font-bold text-sm">{userProfileData?.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#EB712B]"><MapPin size={18} /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Country</p>
                  <p className="font-bold text-sm">{userProfileData?.country || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#EB712B]"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Date of Birth</p>
                  <p className="font-bold text-sm">{userProfileData?.dob || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Strava Integration (Spans 1 col, high visibility) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-10 -right-10 opacity-5">
              <Activity size={150} />
            </div>
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Activity size={12} className="text-[#FC4C02]" /> Integration
            </h3>
            <div className="flex-1 flex flex-col relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FC4C02]/10 flex items-center justify-center text-[#FC4C02]">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg">Strava</h4>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${userProfileData?.stravaAthleteId ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${userProfileData?.stravaAthleteId ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {userProfileData?.stravaAthleteId ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
              
              {userProfileData?.stravaAthleteId && (
                <div className="mb-6 space-y-2">
                  <p className="text-xs text-gray-400 font-medium"><span className="text-gray-600 font-bold">Athlete ID:</span> {userProfileData.stravaAthleteId}</p>
                  {userProfileData?.stravaConnectedAt && (
                    <p className="text-xs text-gray-400 font-medium"><span className="text-gray-600 font-bold">Synced:</span> {new Date(userProfileData.stravaConnectedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}
              
              <div className="mt-auto">
                {userProfileData?.stravaAthleteId ? (
                  <button
                    onClick={handleDisconnectStrava}
                    disabled={isDisconnectingStrava}
                    className="w-full py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDisconnectingStrava ? <Loader2 size={16} className="animate-spin" /> : "Disconnect Strava"}
                  </button>
                ) : (
                  <button
                    onClick={handleConnectStrava}
                    disabled={isConnectingStrava}
                    className="w-full py-3.5 bg-[#FC4C02] hover:bg-[#e04300] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
                  >
                    {isConnectingStrava ? <Loader2 size={16} className="animate-spin" /> : "Connect Account"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* CARD 4: Preferences (Spans 2 columns) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 lg:col-span-2 relative overflow-hidden">
             <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Globe size={12} /> App Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-main-bg p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={16} className="text-[#EB712B]" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Distance Unit</p>
                </div>
                <select
                  value={userProfileData?.scale || selectedScale}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSelectedScale(val);
                    try {
                      await updateScaleUnit({ scale: val }).unwrap();
                      toast.success("Scale unit updated.");
                    } catch (err: any) {
                      toast.error(err?.data?.message || "Failed to update scale unit.");
                    }
                  }}
                  disabled={isUpdatingScale}
                  className="w-full bg-hover border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#EB712B] transition-colors appearance-none cursor-pointer"
                >
                  <option value="kilometer">Kilometers (km)</option>
                  <option value="miles">Miles (mi)</option>
                  <option value="meter">Meters (m)</option>
                </select>
              </div>

              <div className="bg-main-bg p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={16} className="text-[#EB712B]" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Time Format</p>
                </div>
                <div className="w-full bg-hover border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 flex justify-between items-center cursor-not-allowed">
                  {userProfileData?.timeFormat || "12h (AM/PM)"}
                  <Lock size={14} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 5: Account Management & Security (Spans 2 columns) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 lg:col-span-2 relative overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={12} /> Security & Workspace
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div 
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all group flex flex-col justify-center"
              >
                <Lock className="text-[#EB712B] mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h4 className="font-bold text-sm mb-1">Change Password</h4>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Update security keys</p>
              </div>
              
              <Link to={role === 'athlete' ? "/view/userside/support" : "/view/clubside/support"} className="block">
                <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all h-full group flex flex-col justify-center">
                  <HelpCircle className="text-[#EB712B] mb-3 group-hover:scale-110 transition-transform" size={24} />
                  <h4 className="font-bold text-sm mb-1">Support & Help</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Get assistance</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* CARD 6: Management Modules (Organizer Only) */}
          {role === 'organizer' && (
            <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 lg:col-span-3 xl:col-span-4 relative overflow-hidden">
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={12} /> Management Tools
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/manage-club" className="block">
                  <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                    <div className="p-3 bg-white/5 rounded-xl mb-3 text-[#EB712B] group-hover:bg-[#EB712B] group-hover:text-white transition-colors"><Users size={20} /></div>
                    <h4 className="font-bold text-sm">Manage Club</h4>
                  </div>
                </Link>
                <div onClick={handleOpenAdminModal} className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                  <div className="p-3 bg-white/5 rounded-xl mb-3 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"><ShieldCheck size={20} /></div>
                  <h4 className="font-bold text-sm">Admin Modules</h4>
                </div>
                <div onClick={handleOpenUserModal} className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                  <div className="p-3 bg-white/5 rounded-xl mb-3 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Bike size={20} /></div>
                  <h4 className="font-bold text-sm">User Modules</h4>
                </div>
                <Link to="/subscription" className="block">
                  <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-white/5 hover:border-white/10 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                    <div className="p-3 bg-white/5 rounded-xl mb-3 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><CreditCard size={20} /></div>
                    <h4 className="font-bold text-sm">Subscription</h4>
                  </div>
                </Link>
              </div>
            </div>
          )}
          
          {/* CARD 7: Danger Zone */}
          <div className="bg-red-500/5 p-8 rounded-[2rem] border border-red-500/20 shadow-2xl md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="text-sm text-red-500 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Danger Zone
              </h3>
              <p className="text-xs text-red-500/70 font-medium">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <button className="bg-transparent border-2 border-red-500/50 hover:bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg whitespace-nowrap">
              Delete Account
            </button>
          </div>

        </div>
      </div>

      {/* Password Handler */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-hover border border-white/10 p-8 rounded-2xl w-full max-w-lg shadow-2xl">
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
                    className={`w-full bg-surface p-3 rounded-lg border ${errors.current ? "border-[#EB712B]" : "border-white/10"} text-white outline-none focus:border-[#EB712B]`}
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
                    className={`w-full bg-surface p-3 rounded-lg border ${errors.new ? "border-[#EB712B]" : "border-white/10"} text-white outline-none focus:border-[#EB712B]`}
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
                    className={`w-full bg-surface p-3 rounded-lg border ${errors.confirm ? "border-[#EB712B]" : "border-white/10"} text-white outline-none focus:border-[#EB712B]`}
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
            <div className="flex gap-3 bg-surface p-4 rounded-lg mt-6 border border-white/5 text-gray-400 text-xs">
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
          <div className="bg-surface border border-white/10 p-8 rounded-3xl w-full max-w-md shadow-2xl">
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
                  className={`p-4 rounded-2xl border transition-all text-left ${selectedRole === item.id ? "bg-hover border-[#EB712B]" : "bg-hover border-white/5"}`}
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
              className={`w-full p-4 rounded-2xl border flex items-center justify-between mb-8 transition-all ${fullAccess ? "bg-hover border-[#EB712B]" : "bg-hover border-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg ${fullAccess ? "bg-[#EB712B]" : "bg-hover"}`}
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
          <div className="bg-surface border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
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
                  className="group bg-surface p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all"
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
          <div className="bg-surface border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
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
                  className="group bg-surface p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-all"
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
          <div className="bg-surface border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.3)]">
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
                  ? "border-[#EB712B] bg-hover"
                  : "border-white/5 bg-hover hover:border-white/10"
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
                    className="w-full bg-hover p-3 pl-11 rounded-xl border border-white/5 text-sm text-white placeholder:text-gray-600 focus:border-[#EB712B] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-hover border border-white/5" />
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
          <div className="bg-surface border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
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
                      ? "bg-surface border-2 border-[#EB712B]"
                      : "bg-surface border border-white/5 opacity-50 hover:opacity-100"
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

            <div className="bg-surface p-4 rounded-xl border border-white/5 flex gap-3 mb-8">
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
