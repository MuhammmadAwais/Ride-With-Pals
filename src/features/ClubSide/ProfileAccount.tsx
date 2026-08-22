import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  Users,
  Lock,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  Info,
  AlertTriangle,
  Moon,
  Sun,
  Globe,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Activity,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Clock,
  FileText,
  User as UserIcon,
  Bell,
  Edit3,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { logout } from "@/features/auth/slices/authSlice";
import { 
  useUpdatePasswordMutation, 
  useUpdateScaleUnitSettingsMutation, 
  useUpsertAthleteProfileMutation,
  useUserInfoQuery 
} from "@/features/auth/api/authApiSlice";
import { 
  useCheckStravaStatusQuery, 
  useConnectStravaAccountMutation, 
  useDisconnectStravaAccountMutation 
} from "@/features/club/api/stravaApiSlice";
import { 
  useGetEmailNotificationSettingsQuery, 
  useUpdateEmailNotificationSettingsMutation, 
  type EmailNotificationSettings 
} from "@/features/notifications/api/notificationApiSlice";

interface ProfileAccountProps {
  role?: 'organizer' | 'athlete';
}

const ProfileAccount: React.FC<ProfileAccountProps> = ({ role = 'organizer' }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Modals & States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [errors, setErrors] = useState({ current: "", new: "", confirm: "" });

  // API Hooks
  const { data: userProfileData, refetch: refetchUserInfo } = useUserInfoQuery();
  const [updatePassword, { isLoading: isUpdatingPassword }] = useUpdatePasswordMutation();
  const [updateScaleUnit, { isLoading: isUpdatingScale }] = useUpdateScaleUnitSettingsMutation();
  const [upsertProfile, { isLoading: isUpdatingTimeFormat }] = useUpsertAthleteProfileMutation();
  const [selectedScale, setSelectedScale] = useState<string>("kilometer");
  const [selectedTimeFormat, setSelectedTimeFormat] = useState<string>("12h");

  // Strava Hooks
  const { refetch: refetchStravaStatus } = useCheckStravaStatusQuery();
  const [connectStrava, { isLoading: isConnectingStrava }] = useConnectStravaAccountMutation();
  const [disconnectStrava, { isLoading: isDisconnectingStrava }] = useDisconnectStravaAccountMutation();

  // Email Notification Hooks
  const { data: emailSettingsRes, isLoading: isEmailSettingsLoading, refetch: refetchEmailSettings } = useGetEmailNotificationSettingsQuery();
  const [updateEmailSettings, { isLoading: isUpdatingEmailSettings }] = useUpdateEmailNotificationSettingsMutation();
  
  const [localEmailSettings, setLocalEmailSettings] = useState<EmailNotificationSettings>({
    feePaymentRequests: true,
    newRide: true,
    clubJoinResponse: true,
    rideUpdates: true,
    orderStatus: true,
    subscriptionStatus: true,
    clubJoinRequest: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userProfileData?.scale) {
      setSelectedScale(userProfileData.scale);
    }
    if (userProfileData?.timeFormat) {
      setSelectedTimeFormat(userProfileData.timeFormat);
    }
  }, [userProfileData]);

  useEffect(() => {
    if (emailSettingsRes) {
      const raw = (emailSettingsRes as any)?.response || (emailSettingsRes as any)?.data || emailSettingsRes;
      if (raw && typeof raw === 'object') {
        setLocalEmailSettings((prev) => ({
          feePaymentRequests: raw.feePaymentRequests !== undefined ? Boolean(raw.feePaymentRequests) : prev.feePaymentRequests,
          newRide: raw.newRide !== undefined ? Boolean(raw.newRide) : prev.newRide,
          clubJoinResponse: raw.clubJoinResponse !== undefined ? Boolean(raw.clubJoinResponse) : prev.clubJoinResponse,
          rideUpdates: raw.rideUpdates !== undefined ? Boolean(raw.rideUpdates) : prev.rideUpdates,
          orderStatus: raw.orderStatus !== undefined ? Boolean(raw.orderStatus) : prev.orderStatus,
          subscriptionStatus: raw.subscriptionStatus !== undefined ? Boolean(raw.subscriptionStatus) : prev.subscriptionStatus,
          clubJoinRequest: raw.clubJoinRequest !== undefined ? Boolean(raw.clubJoinRequest) : prev.clubJoinRequest,
        }));
      }
    }
  }, [emailSettingsRes]);

  // Refetch user & Strava info whenever user returns focus to this tab
  useEffect(() => {
    const handleFocus = () => {
      refetchUserInfo();
      refetchStravaStatus();
      refetchEmailSettings();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchUserInfo, refetchStravaStatus, refetchEmailSettings]);

  const handleToggleEmailSetting = async (key: keyof EmailNotificationSettings) => {
    const previousState = { ...localEmailSettings };
    const nextSettings: EmailNotificationSettings = {
      ...localEmailSettings,
      [key]: !localEmailSettings[key],
    };
    // Immediate optimistic update
    setLocalEmailSettings(nextSettings);

    try {
      await updateEmailSettings(nextSettings).unwrap();
      toast.success("Notification settings updated successfully!");
    } catch (err: any) {
      // Revert on error
      setLocalEmailSettings(previousState);
      toast.error(err?.data?.message || err?.message || "Failed to update notification settings.");
    }
  };

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
      refetchUserInfo();
      refetchStravaStatus();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to disconnect Strava.");
    }
  };
  
  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const handleSavePassword = async () => {
    const newErrors = { current: "", new: "", confirm: "" };
    let isValid = true;
    if (!passwordData.current) {
      newErrors.current = "Current password is required";
      isValid = false;
    }
    if (!passwordData.new) {
      newErrors.new = "New password is required";
      isValid = false;
    } else if (passwordData.new.length < 6) {
      newErrors.new = "Password must be at least 6 characters";
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

  const handleTimeFormatChange = async (newFormat: string) => {
    setSelectedTimeFormat(newFormat);
    try {
      await upsertProfile({
        timeFormat: newFormat,
      }).unwrap();
      toast.success(`Time format set to ${newFormat === '12h' ? '12-hour' : '24-hour'}.`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update time format.");
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-main-bg text-text-main p-4 md:p-8 lg:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight uppercase text-text-main">
              Profile <span className="text-[#EB712B]">&</span> Account
            </h1>
            <p className="text-text-muted text-xs font-bold tracking-widest uppercase mt-2">
              Manage your personal information and application preferences
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-2 bg-surface border border-border px-4 py-2.5 rounded-xl text-xs font-bold text-text-main hover:border-[#EB712B]/40 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-[#EB712B]" />
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          
          {/* CARD 1: User Profile Summary (Spans 2 columns) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EB712B]/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-[#EB712B]/20 transition-all duration-700 pointer-events-none"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-main-bg flex items-center justify-center border-2 border-border overflow-hidden shadow-xl shrink-0">
                  {userProfileData?.profileImage ? (
                    <img src={userProfileData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={40} className="text-text-muted" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-text-main">{userProfileData?.fullName || "User Profile"}</h2>
                  <p className="text-[#EB712B] font-bold text-sm tracking-wide mt-1">{userProfileData?.email}</p>
                  <p className="text-xs text-text-muted font-medium mt-3 flex items-center gap-2">
                    <Calendar size={14} /> Joined {userProfileData?.createdAt ? new Date(userProfileData.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/athlete-profile"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#EB712B]/10 hover:bg-[#EB712B] border border-[#EB712B]/30 hover:border-[#EB712B] px-5 py-3 rounded-2xl text-sm font-bold text-[#EB712B] hover:text-white transition-all cursor-pointer active:scale-95 shadow-lg whitespace-nowrap"
                >
                  <Edit3 size={15} /> Edit
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex-1 sm:flex-initial bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 px-6 py-3 rounded-2xl text-sm font-bold text-red-500 hover:text-white transition-all cursor-pointer active:scale-95 shadow-lg whitespace-nowrap"
                >
                  Logout
                </button>
              </div>
            </div>
            {userProfileData?.description && (
              <div className="mt-8 pt-6 border-t border-border relative z-10">
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={12} /> Bio
                </h3>
                <p className="text-sm text-text-main leading-relaxed font-semibold">
                  "{userProfileData.description}"
                </p>
              </div>
            )}
          </div>

          {/* CARD 2: Personal Info */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={12} /> Contact Details
            </h3>
            <div className="space-y-6 flex-1">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#EB712B]/10 text-[#EB712B]"><Phone size={18} /></div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">Phone</p>
                  <p className="font-bold text-sm text-text-main">{userProfileData?.phone || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#EB712B]/10 text-[#EB712B]"><MapPin size={18} /></div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">Country</p>
                  <p className="font-bold text-sm text-text-main">{userProfileData?.country || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#EB712B]/10 text-[#EB712B]"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">Date of Birth</p>
                  <p className="font-bold text-sm text-text-main">{userProfileData?.dob || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 3: Strava Integration */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none">
              <Activity size={150} />
            </div>
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10">
              <Activity size={12} className="text-[#FC4C02]" /> Integration
            </h3>
            <div className="flex-1 flex flex-col relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FC4C02]/10 flex items-center justify-center text-[#FC4C02]">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-black text-lg text-text-main">Strava</h4>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${userProfileData?.stravaAthleteId ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${userProfileData?.stravaAthleteId ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      {userProfileData?.stravaAthleteId ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
              
              {userProfileData?.stravaAthleteId && (
                <div className="mb-6 space-y-2">
                  <p className="text-xs text-text-muted font-medium"><span className="text-text-main font-bold">Athlete ID:</span> {userProfileData.stravaAthleteId}</p>
                  {userProfileData?.stravaConnectedAt && (
                    <p className="text-xs text-text-muted font-medium"><span className="text-text-main font-bold">Synced:</span> {new Date(userProfileData.stravaConnectedAt).toLocaleDateString()}</p>
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
             <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <Globe size={12} /> App Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-main-bg p-5 rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin size={16} className="text-[#EB712B]" />
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Distance Unit</p>
                </div>
                <select
                  value={userProfileData?.scale || selectedScale}
                  onChange={async (e) => {
                    const val = e.target.value;
                    setSelectedScale(val);
                    try {
                      await updateScaleUnit({ scale: val }).unwrap();
                      toast.success(`Distance unit updated to ${val === 'mile' ? 'Miles' : 'Kilometers'}.`);
                    } catch (err: any) {
                      toast.error(err?.data?.message || "Failed to update scale unit.");
                    }
                  }}
                  disabled={isUpdatingScale}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-main outline-none focus:border-[#EB712B] transition-colors cursor-pointer"
                >
                  <option value="kilometer">Kilometers (km)</option>
                  <option value="mile">Miles (mi)</option>
                </select>
              </div>

              <div className="bg-main-bg p-5 rounded-2xl border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Clock size={16} className="text-[#EB712B]" />
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Time Format</p>
                </div>
                <select
                  value={userProfileData?.timeFormat || selectedTimeFormat}
                  onChange={(e) => handleTimeFormatChange(e.target.value)}
                  disabled={isUpdatingTimeFormat}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-main outline-none focus:border-[#EB712B] transition-colors cursor-pointer"
                >
                  <option value="12h">12-hour (1:30 PM)</option>
                  <option value="24h">24-hour (13:30)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARD 5: Account Management & Security (Spans 2 columns) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 lg:col-span-2 relative overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck size={12} /> Security & Workspace
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
              <div 
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all group flex flex-col justify-center"
              >
                <Lock className="text-[#EB712B] mb-3 group-hover:scale-110 transition-transform" size={24} />
                <h4 className="font-bold text-sm text-text-main mb-1">Change Password</h4>
                <p className="text-[10px] text-text-muted uppercase tracking-wider">Update security keys</p>
              </div>
              
              <Link to={role === 'athlete' ? "/view/userside/support" : "/view/clubside/support"} className="block">
                <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all h-full group flex flex-col justify-center">
                  <HelpCircle className="text-[#EB712B] mb-3 group-hover:scale-110 transition-transform" size={24} />
                  <h4 className="font-bold text-sm text-text-main mb-1">Support & Help</h4>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Get assistance</p>
                </div>
              </Link>
            </div>
          </div>
          
          {/* CARD 5.5: Email Notification Settings (Spans 4 columns) */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 lg:col-span-3 xl:col-span-4 relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Bell size={12} className="text-[#EB712B]" /> Email Notification Preferences
              </h3>
              {isUpdatingEmailSettings && (
                <span className="text-xs text-[#EB712B] flex items-center gap-1 font-bold">
                  <Loader2 size={12} className="animate-spin" /> Saving...
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mb-6 font-medium">
              Choose which events trigger instant email notifications to your inbox.
            </p>
            {isEmailSettingsLoading ? (
              <div className="py-8 flex justify-center items-center">
                <Loader2 size={24} className="animate-spin text-[#EB712B]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: "feePaymentRequests" as const, title: "Fee Payment Requests", desc: "Membership fee payment reminders" },
                  { key: "newRide" as const, title: "New Rides & Activities", desc: "When new club rides are published" },
                  { key: "clubJoinResponse" as const, title: "Club Join Response", desc: "Status updates for club join requests" },
                  { key: "rideUpdates" as const, title: "Ride & Activity Updates", desc: "Schedule changes & cancellations" },
                  { key: "orderStatus" as const, title: "Shop Order Status", desc: "Order confirmation & delivery alerts" },
                  { key: "subscriptionStatus" as const, title: "Subscription Status", desc: "Billing & plan renewal alerts" },
                  { key: "clubJoinRequest" as const, title: "Club Join Requests", desc: "New member join applications" },
                ].map((item) => {
                  const isChecked = Boolean(localEmailSettings[item.key]);
                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleEmailSetting(item.key)}
                      role="button"
                      tabIndex={0}
                      className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all flex items-center justify-between gap-4 shadow-sm select-none"
                    >
                      <div>
                        <h4 className="font-bold text-sm text-text-main">{item.title}</h4>
                        <p className="text-[11px] text-text-muted mt-0.5">{item.desc}</p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                          isChecked ? "bg-[#EB712B]" : "bg-gray-300 dark:bg-white/15"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            isChecked ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* CARD 6: Management Modules (Organizer Only) */}
          {role === 'organizer' && (
            <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-2xl md:col-span-2 lg:col-span-3 xl:col-span-4 relative overflow-hidden">
               <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={12} /> Management Tools
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/manage-club" className="block">
                  <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                    <div className="p-3 bg-[#EB712B]/10 rounded-xl mb-3 text-[#EB712B] group-hover:bg-[#EB712B] group-hover:text-white transition-colors"><Users size={20} /></div>
                    <h4 className="font-bold text-sm text-text-main">Manage Club</h4>
                    <p className="text-[10px] text-text-muted mt-1">Club overview & settings</p>
                  </div>
                </Link>
                <Link to="/view/clubside/permissions" className="block">
                  <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                    <div className="p-3 bg-purple-500/10 rounded-xl mb-3 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"><ShieldCheck size={20} /></div>
                    <h4 className="font-bold text-sm text-text-main">Club Permissions</h4>
                    <p className="text-[10px] text-text-muted mt-1">Delegate roles & rights</p>
                  </div>
                </Link>
                <Link to="/view/clubside/members" className="block">
                  <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                    <div className="p-3 bg-emerald-500/10 rounded-xl mb-3 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Users size={20} /></div>
                    <h4 className="font-bold text-sm text-text-main">Club Members</h4>
                    <p className="text-[10px] text-text-muted mt-1">Manage active members</p>
                  </div>
                </Link>
                <Link to="/view/clubside/subscription" className="block">
                  <div className="bg-main-bg hover:bg-hover p-5 rounded-2xl border border-border hover:border-[#EB712B]/40 cursor-pointer transition-all h-full flex flex-col items-center text-center group">
                    <div className="p-3 bg-blue-500/10 rounded-xl mb-3 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><CreditCard size={20} /></div>
                    <h4 className="font-bold text-sm text-text-main">Subscription</h4>
                    <p className="text-[10px] text-text-muted mt-1">Plans & billing</p>
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
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-transparent border-2 border-red-500/50 hover:bg-red-500/10 text-red-500 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg whitespace-nowrap cursor-pointer"
            >
              Delete Account
            </button>
          </div>

        </div>
      </div>

      {/* Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-text-main">
                  Change Password
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Ensure your account is protected with a strong password.
                </p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-text-muted hover:text-text-main cursor-pointer"
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
                    value={passwordData.current}
                    className={`w-full bg-surface p-3.5 rounded-xl border ${errors.current ? "border-red-500" : "border-border"} text-text-main outline-none focus:border-[#EB712B] transition-all`}
                    onChange={(e) => {
                      setPasswordData({
                        ...passwordData,
                        current: e.target.value,
                      });
                      if (errors.current) setErrors({ ...errors, current: "" });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 text-text-muted hover:text-text-main cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.current && (
                  <p className="text-red-500 text-xs mt-2 font-bold">
                    {errors.current}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password (min. 6 characters)"
                    value={passwordData.new}
                    className={`w-full bg-surface p-3.5 rounded-xl border ${errors.new ? "border-red-500" : "border-border"} text-text-main outline-none focus:border-[#EB712B] transition-all`}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, new: e.target.value });
                      if (errors.new) setErrors({ ...errors, new: "" });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-4 text-text-muted hover:text-text-main cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.new && (
                  <p className="text-red-500 text-xs mt-2 font-bold">
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
                    value={passwordData.confirm}
                    className={`w-full bg-surface p-3.5 rounded-xl border ${errors.confirm ? "border-red-500" : "border-border"} text-text-main outline-none focus:border-[#EB712B] transition-all`}
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
                    className="absolute right-3.5 top-4 text-text-muted hover:text-text-main cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-red-500 text-xs mt-2 font-bold">
                    {errors.confirm}
                  </p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 bg-main-bg p-4 rounded-xl mt-6 border border-border text-text-muted text-xs">
              <AlertCircle size={20} className="text-[#EB712B] shrink-0" />
              <p>
                Use at least 6 characters, including a mix of letters, numbers, and symbols.
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-text-muted font-bold hover:text-text-main hover:border-text-muted transition-all cursor-pointer text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                disabled={isUpdatingPassword}
                className="px-6 py-2.5 bg-[#EB712B] rounded-xl font-bold text-white hover:bg-[#d66525] transition-all cursor-pointer flex items-center gap-2 text-xs uppercase shadow-lg disabled:opacity-50"
              >
                {isUpdatingPassword ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account / Danger Zone Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-red-500/30 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main">
                    Delete Account
                  </h2>
                  <p className="text-red-500 text-xs font-semibold mt-0.5">
                    Irreversible Action
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm text-text-muted">
              <p>
                To permanently delete your account, remove your club memberships, and clear all personal data, please contact our support team.
              </p>
              <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20 text-xs text-red-400 space-y-1">
                <p className="font-bold">⚠️ Notice:</p>
                <p>
                  Account deletion requests are processed manually to verify account ownership and prevent unauthorized removals.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-text-muted font-bold hover:text-text-main transition-all cursor-pointer text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  navigate(role === 'athlete' ? "/view/userside/support" : "/view/clubside/support");
                }}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-white transition-all cursor-pointer flex items-center gap-2 text-xs uppercase shadow-lg shadow-red-500/20"
              >
                <MessageSquare size={14} /> Contact Support
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileAccount;
