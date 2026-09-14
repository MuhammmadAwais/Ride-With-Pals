/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, 
  MapPin, 
  Users, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Lock, 
  Bike, 
  Trophy, 
  Eye, 
  Trash2, 
  Edit3, 
  Plus, 
  X, 
  MoreVertical, 
  CreditCard,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import News from "./News";
import Leaderboard from "./Leaderboard";
import Discount from "./Discount";
import Members from "./Members";
import Overviews from "@/features/public-club/pages/Overviews";
import Ride from "@/features/public-club/pages/Ride";
import Marketplace from "@/features/public-club/pages/Marketplace";
import Shop from "@/features/public-club/pages/Shop";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchClubMembers } from "@/features/club/slices/clubSlice";
import { 
  useCreateClubMembershipPlanMutation, 
  useUpdateClubMembershipPlanMutation, 
  useDeleteMembershipPlanMutation, 
  useListMembershipPlansQuery 
} from "@/features/club/api/membershipApiSlice";
import { toast } from "sonner";
import { useActiveClub } from "@/hooks/useActiveClub";
import { useClubPermissions } from "@/hooks/useClubPermissions";
import { DeleteClubModal } from "@/components/common/DeleteClubModal";
import { purgeClubFromBrowser } from "@/features/club/utils/clubStorage";
import AvatarLightboxModal from "@/components/ui/AvatarLightboxModal";
import { resolveImageUrl } from "@/features/public-club/services/clubGeocoding";

interface MembershipPlan {
  id: string;
  packageName: string;
  price: string;
  duration: string;
  autoRenew: string;
  discount: string;
  featuresList: string[];
}

type TabType =
  | "Overview"
  | "Rides"
  | "Members"
  | "Membership Plans"
  | "News"
  | "Leaderboard"
  | "Shop"
  | "Discounts"
  | "Marketplace";

const getMemberCount = (club: any) => {
  if (!club) return 0;
  const val =
    club.participantCount ??
    club.participant_count ??
    club.memberCount ??
    club.member_count ??
    club.totalMembers ??
    club.total_members ??
    club.membersCount ??
    club.members_count ??
    club.userCount ??
    club.user_count ??
    club.count ??
    club.total ??
    club.clubMembers?.length ??
    club.ClubMembers?.length ??
    club.club_members?.length ??
    club.user_clubs?.length ??
    club.userClubs?.length ??
    club.UserClubs?.length ??
    club.members?.length ??
    club.Members?.length ??
    club.users?.length ??
    club.Users?.length ??
    club.participants?.length ??
    club.Participants?.length ??
    club._count?.user_clubs ??
    club._count?.members ??
    club._count?.users;

  const count = Number(val);
  if (!isNaN(count) && count > 0) return count;
  return 0;
};

const getClubTypeName = (typeId?: any, rawName?: string) => {
  if (rawName && typeof rawName === "string" && rawName.trim() !== "") {
    const lower = rawName.toLowerCase();
    if (lower.includes("run")) return "Running";
    if (lower.includes("triathlon")) return "Triathlon";
    if (lower.includes("cycl") || lower.includes("bike")) return "Cycling";
  }
  if (typeId === 2 || typeId === "2" || String(typeId).toLowerCase() === "running") return "Running";
  if (
    typeId === 3 ||
    typeId === "3" ||
    String(typeId).toLowerCase() === "triathlon" ||
    String(typeId).toLowerCase() === "cycling & running"
  )
    return "Triathlon";
  return "Cycling";
};

const renderSportBadge = (typeId?: any, rawName?: string) => {
  const sport = getClubTypeName(typeId, rawName);
  if (sport === "Running") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
        <Activity size={12} className="shrink-0 text-amber-500" /> <Trans>RUNNING</Trans>
      </span>
    );
  }
  if (sport === "Triathlon") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
        <Trophy size={12} className="shrink-0 text-purple-400" /> <Trans>TRIATHLON</Trans>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/25 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
      <Bike size={12} className="shrink-0 text-[#EB712B]" /> <Trans>CYCLING</Trans>
    </span>
  );
};

const TABS: TabType[] = [
  "Overview",
  "Rides",
  "Members",
  "Membership Plans",
  "News",
  "Leaderboard",
  "Shop",
  "Discounts",
  "Marketplace",
];

const ManageClubHome: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clubId, activeClub } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);

  // Dynamic images and name
  const coverImage = activeClub?.coverImage
    ? resolveImageUrl(activeClub.coverImage)
    : (activeClub as any)?.bannerImage
    ? resolveImageUrl((activeClub as any).bannerImage)
    : "/Images/CycleImage2.png";

  const logoImage = activeClub?.logo
    ? resolveImageUrl(activeClub.logo)
    : (activeClub as any)?.avatar
    ? resolveImageUrl((activeClub as any).avatar)
    : "/Images/CycleImage.png";

  const selectedName = activeClub?.clubName || "Club Name";

  const tabParam = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || "Overview");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const dispatch = useAppDispatch();

  // Auto-heal if active club is deleted or returns 404 / not found from server
  useEffect(() => {
    if (permissions?.error && clubId) {
      const err: any = permissions.error;
      const status = err?.status;
      const msg = (err?.data?.message || err?.message || "").toLowerCase();
      if (status === 404 || msg.includes("not found") || msg.includes("doesn't exist")) {
        console.warn("⚠️ [ManageClubHome] Club not found on server. Purging from browser...");
        purgeClubFromBrowser(clubId, dispatch);
        navigate("/view/userside/clubs", { replace: true });
      }
    }
  }, [permissions?.error, clubId, dispatch, navigate]);

  const [isDeleteClubModalOpen, setIsDeleteClubModalOpen] = useState(false);
  const [showClubAvatarPreview, setShowClubAvatarPreview] = useState(false);

  const { currentClubMembers } = useAppSelector((state) => state.club);

  const dynamicMemberCount = useMemo(() => {
    if (currentClubMembers && currentClubMembers.length > 0) return currentClubMembers.length;
    return getMemberCount(activeClub);
  }, [currentClubMembers, activeClub]);

  const { data: plansData } = useListMembershipPlansQuery(
    { clubId: clubId || 0, includeInactive: true },
    { skip: !clubId }
  );

  const [createPlan] = useCreateClubMembershipPlanMutation();
  const [updatePlan] = useUpdateClubMembershipPlanMutation();
  const [deletePlan] = useDeleteMembershipPlanMutation();

  useEffect(() => {
    if (clubId) {
      dispatch(fetchClubMembers({ clubId }));
    }
  }, [dispatch, clubId]);

  // Membership plans state
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);

  useEffect(() => {
    if (plansData) {
      const plans = plansData.map((p: any) => ({
        id: String(p.id),
        packageName: p.name || p.packageName || "Unnamed Plan",
        price: String(p.price),
        duration: p.billingInterval || p.duration || "monthly",
        autoRenew: p.autoRenew ? "Yes" : "No",
        discount: String(p.discountPercent || ""),
        featuresList: Array.isArray(p.features) ? p.features : []
      }));
      setMembershipPlans(plans);
    }
  }, [plansData]);

  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

  // Membership form states
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("monthly");
  const [autoRenew, setAutoRenew] = useState("Yes");
  const [discount, setDiscount] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [featuresList, setFeaturesList] = useState<string[]>([
    "Cycling license included",
    "Paid activates included",
    "Free coffee in our coffeeshop",
  ]);

  const handleAction = (actionName: string, _targetItem?: any) => {
    if (actionName === "Connect to Stripe") {
      setShowMembershipForm(true);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFeaturesList(featuresList.filter((_, index) => index !== indexToRemove));
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubId) return;

    try {
      if (editingPlanId) {
        await updatePlan({
          feeId: Number(editingPlanId),
          clubId: clubId,
          name: packageName,
          price: Number(price),
          currency: "EUR",
          billingInterval: duration,
          autoRenew: autoRenew === "Yes",
          features: featuresList
        }).unwrap();
        toast.success(t`Membership plan updated successfully!`);
      } else {
        await createPlan({
          clubId: clubId,
          name: packageName,
          price: Number(price),
          currency: "EUR",
          billingInterval: duration,
          autoRenew: autoRenew === "Yes",
          features: featuresList
        }).unwrap();
        toast.success(t`Membership plan created successfully!`);
      }

      // Reset Form
      setEditingPlanId(null);
      setPackageName("");
      setPrice("");
      setDuration("monthly");
      setAutoRenew("Yes");
      setDiscount("");
      setFeaturesList([
        "Cycling license included",
        "Paid activates included",
        "Free coffee in our coffeeshop",
      ]);
      setShowMembershipForm(false);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to save membership plan.`);
      console.error(err);
    }
  };

  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlanId(plan.id);
    setPackageName(plan.packageName);
    setPrice(plan.price);
    setDuration(plan.duration);
    setAutoRenew(plan.autoRenew);
    setDiscount(plan.discount);
    setFeaturesList(plan.featuresList);
    setShowMembershipForm(true);
    setOpenCardMenuId(null);
  };

  const handleDeletePlan = async (id: string) => {
    if (!clubId) return;

    try {
      await deletePlan({ clubId, planId: Number(id) }).unwrap();
      toast.success(t`Membership plan deleted successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to delete membership plan.`);
      console.error(err);
    }
    setOpenCardMenuId(null);
  };

  return (
    <div className="min-h-screen bg-main-bg text-text-main font-sans overflow-x-hidden select-none pb-20">
      
      {/* ── Dynamic Full-Bleed Hero Header (Exact Match with Athlete Side) ── */}
      <div className="relative h-60 sm:h-72 md:h-80 lg:h-[340px] w-full overflow-hidden bg-black select-none">
        <img 
          src={coverImage} 
          alt={selectedName} 
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/Images/CycleImage2.png"; }}
        />
        {/* Layered Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-main-bg via-main-bg/60 to-black/35" />

        {/* Top Floating Bar: Back Button + Sport Tag */}
        <div className="absolute top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate(-1)}
            className="px-3.5 py-2 bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl flex items-center gap-2 text-white text-xs font-bold transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer group"
            title="Back"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline"><Trans>Back</Trans></span>
          </button>

          {/* Top-Right Sport Pill on Banner */}
          {renderSportBadge(
            activeClub?.clubTypeId, 
            (activeClub as any)?.sport || (activeClub as any)?.sportType || (activeClub as any)?.category
          )}
        </div>
      </div>

      {/* ── Club Identity Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 sm:-mt-20 md:-mt-24 z-10">
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end justify-between mb-8">
          
          {/* Left Block: Avatar + Name & Info */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-end min-w-0 flex-1 w-full">
            
            {/* Club Logo Avatar with Lightbox Preview */}
            <div 
              onClick={() => setShowClubAvatarPreview(true)}
              className="relative shrink-0 group cursor-pointer"
              title="Click to preview club avatar"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-main-bg bg-surface flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-102">
                <img 
                  src={logoImage} 
                  alt={selectedName} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/Images/CycleImage.png"; }}
                />
              </div>
              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Eye size={24} className="text-white drop-shadow-md" />
              </div>
              {(activeClub as any)?.isVerified && (
                <div 
                  className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-8 h-8 bg-emerald-500 rounded-2xl border-2 border-main-bg flex items-center justify-center pointer-events-none"
                  title="Verified Club"
                >
                  <ShieldCheck size={16} className="text-white" />
                </div>
              )}
            </div>

            {/* Middle Info Column: Title & Metadata Chips */}
            <div className="space-y-2.5 min-w-0 flex-1 w-full">
              {/* Title in ONE single line */}
              <h1 
                className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black tracking-tight text-text-main uppercase leading-tight whitespace-nowrap truncate"
                title={selectedName}
              >
                {selectedName}
              </h1>

              {/* Badges / Chips Row */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-bold">
                {/* Truncated Address Chip with hover tooltip */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 border border-border rounded-xl text-xs font-semibold text-text-muted hover:text-text-main transition-colors max-w-full min-w-0"
                  title={activeClub?.location || "Global"}
                >
                  <MapPin size={13} className="text-[#EB712B] shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-[260px] md:max-w-[360px] lg:max-w-[480px]">
                    {activeClub?.location || <Trans>Global</Trans>}
                  </span>
                </div>

                {/* Members Chip */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 border border-border rounded-xl text-xs font-bold text-text-muted whitespace-nowrap">
                  <Users size={13} className="text-[#EB712B] shrink-0" />
                  <span>{dynamicMemberCount} {dynamicMemberCount === 1 ? <Trans>Member</Trans> : <Trans>Members</Trans>}</span>
                </div>

                {/* Privacy Chip */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border whitespace-nowrap ${
                  activeClub?.clubPrivacyId === 1 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {activeClub?.clubPrivacyId === 1 ? <Globe size={12} /> : <Lock size={12} />}
                  <span>{activeClub?.clubPrivacyId === 1 ? <Trans>Public Club</Trans> : <Trans>Private Club</Trans>}</span>
                </div>

                {/* Women & Non-Binary Chip */}
                {Boolean(activeClub?.isWomenAndNonBinary) && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border whitespace-nowrap bg-pink-500/10 text-pink-400 border-pink-500/20">
                    <span><Trans>Women & Non-Binary Only</Trans></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Block: Action Buttons (Club Organizer perspective) */}
          <div className="shrink-0 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full xl:w-auto pt-2 xl:pt-0">
            {/* View as Athlete */}
            {clubId && (
              <button
                type="button"
                onClick={() => navigate(`/view/userside/club/${clubId}`)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface border border-border hover:bg-hover text-text-main hover:text-[#EB712B] hover:border-[#EB712B]/30 text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm"
                title={t`Preview how athletes see this club`}
              >
                <Eye size={15} />
                <span><Trans>View as Athlete</Trans></span>
              </button>
            )}

            {/* Edit Club */}
            {permissions.isAdmin && (
              <button
                type="button"
                onClick={() => navigate("/edit-club")}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 bg-[#EB712B] hover:bg-[#ff8036] text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer shadow-lg shadow-[#EB712B]/20"
              >
                <Edit3 size={15} />
                <span><Trans>Edit Club</Trans></span>
              </button>
            )}

            {/* Delete Club */}
            {permissions.isOwner && (
              <button
                type="button"
                onClick={() => setIsDeleteClubModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm"
                title={t`Delete Club`}
              >
                <Trash2 size={15} />
                <span><Trans>Delete Club</Trans></span>
              </button>
            )}
          </div>
        </div>

        {/* ── Navigation Tabs (Exact Athlete Side Underline Style) ── */}
        <div className="border-b border-border/50 mb-8 overflow-x-auto custom-scrollbar">
          <div className="flex gap-8 min-w-max px-1">
            {TABS.map((tab) => {
              const isActive =
                activeTab === tab ||
                (tab === "Discounts" && activeTab === ("Discount" as any));
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchParams({ tab });
                    if (tab !== "Membership Plans") setShowMembershipForm(false);
                  }}
                  className={`pb-4 text-sm font-black uppercase tracking-wider transition-all duration-300 relative outline-none cursor-pointer border-0 bg-transparent whitespace-nowrap ${
                    isActive
                      ? "text-[#EB712B]"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {tab === "Overview" ? <Trans>Overview</Trans> :
                   tab === "Rides" ? <Trans>Rides</Trans> :
                   tab === "Members" ? <Trans>Members</Trans> :
                   tab === "Membership Plans" ? <Trans>Membership Plans</Trans> :
                   tab === "News" ? <Trans>News</Trans> :
                   tab === "Leaderboard" ? <Trans>Leaderboard</Trans> :
                   tab === "Shop" ? <Trans>Shop</Trans> :
                   tab === "Discounts" ? <Trans>Discounts</Trans> :
                   <Trans>Marketplace</Trans>}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB712B] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Dynamic Tab Content Area ── */}
        <div className="w-full min-h-[400px]">
          {activeTab === "Overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Overviews
                clubId={clubId || undefined}
                club={activeClub}
                membersCount={dynamicMemberCount}
              />
            </div>
          )}

          {activeTab === "Rides" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Ride clubId={clubId || undefined} />
            </div>
          )}

          {activeTab === "Members" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Members clubId={clubId || undefined} />
            </div>
          )}

          {activeTab === "Membership Plans" && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500 items-start">
              {/* LEFT SIDE: Membership Form / Stripe View */}
              <div className="w-full flex justify-center">
                {!permissions.canManageMembershipFee ? (
                  <div className="w-full bg-surface/80 backdrop-blur-xl rounded-3xl border border-border/80 p-8 min-h-[500px] flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden group transition-all duration-300 hover:border-border">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center mb-6 text-[#EB712B] shadow-md group-hover:scale-105 transition-transform duration-300">
                      <Lock size={30} className="text-[#EB712B]" />
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
                      <Trans>Permission Required</Trans>
                    </span>
                    <h3 className="text-xl font-black text-text-main mb-2 tracking-tight uppercase">
                      <Trans>Access Restricted</Trans>
                    </h3>
                    <p className="text-xs font-medium text-text-muted max-w-xs leading-relaxed">
                      <Trans>
                        You do not have the{" "}
                        <span className="text-[#EB712B] font-bold">
                          Manage Membership Fee
                        </span>{" "}
                        permission required to configure payment plans for this club.
                      </Trans>
                    </p>
                  </div>
                ) : !showMembershipForm ? (
                  /* Stripe Connect View */
                  <div className="w-full bg-surface rounded-3xl border border-border shadow-md p-8 sm:p-10 min-h-[480px] flex flex-col items-center justify-center text-center">
                    <div className="flex flex-col items-center max-w-md w-full">
                      {/* Eyebrow / Category Tag */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 mb-5">
                        <ShieldCheck size={12} className="text-[#EB712B]" />
                        <Trans>Payments & Subscriptions</Trans>
                      </span>

                      {/* App-Themed Signature Icon Container */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center mb-6 text-[#EB712B]">
                        <CreditCard size={28} className="text-[#EB712B]" />
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xl sm:text-2xl font-black tracking-tight text-text-main mb-2.5">
                        <Trans>Stripe Integration</Trans>
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-text-muted mb-6 max-w-sm leading-relaxed">
                        <Trans>
                          Please connect your Stripe account first to enable subscriptions and automated recurring membership payments.
                        </Trans>
                      </p>

                      {/* Feature Trust Bullets */}
                      <div className="w-full max-w-xs space-y-2 mb-8 text-left">
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-main-bg border border-border text-xs font-semibold text-text-muted">
                          <CheckCircle2 size={15} className="text-[#EB712B] shrink-0" />
                          <span><Trans>Automated Recurring Billing</Trans></span>
                        </div>
                        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-main-bg border border-border text-xs font-semibold text-text-muted">
                          <CheckCircle2 size={15} className="text-[#EB712B] shrink-0" />
                          <span><Trans>Direct & Secure Payouts</Trans></span>
                        </div>
                      </div>

                      {/* Connect Button */}
                      <button
                        type="button"
                        onClick={() => handleAction("Connect to Stripe", selectedName)}
                        className="w-full max-w-xs py-3.5 px-8 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors active:scale-95 flex items-center justify-center gap-2.5 border-0"
                      >
                        <span>
                          <Trans>Connect to Stripe</Trans>
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Membership Fee Plan Setup Form View */
                  <div className="w-full bg-surface/90 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300 transition-all duration-300 hover:border-border/80">
                    <div className="flex justify-between items-center mb-6 border-b border-border/50 pb-4">
                      <h3 className="text-lg font-black tracking-tight text-text-main">
                        {editingPlanId ? (
                          <Trans>Edit Membership Plan</Trans>
                        ) : (
                          <Trans>Membership Fee Plan</Trans>
                        )}
                      </h3>
                      <span className="text-[9px] font-extrabold bg-[#EB712B]/10 text-[#EB712B] px-2.5 py-1 rounded-full border border-[#EB712B]/20 uppercase tracking-widest animate-pulse">
                        <Trans>Stripe Ready</Trans>
                      </span>
                    </div>

                    <form onSubmit={handleCreatePlan} className="space-y-5">
                      {/* Package Name */}
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-extrabold text-text-muted tracking-[0.15em] uppercase">
                          <Trans>Package Name</Trans>
                        </label>
                        <input
                          type="text"
                          value={packageName}
                          onChange={(e) => setPackageName(e.target.value)}
                          placeholder={t`Annual Junior Membership`}
                          className="w-full bg-main-bg border border-border rounded-xl px-4 py-3.5 text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-border/80"
                          required
                        />
                      </div>

                      {/* Price & Duration Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2.5">
                          <label className="text-[10px] font-extrabold text-text-muted tracking-[0.15em] uppercase">
                            <Trans>Price</Trans>
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-3.5 text-xs font-black text-text-muted">
                              €
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="00.00"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              className="w-full bg-main-bg border border-border rounded-xl pl-8 pr-4 py-3.5 text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-border/80"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          <label className="text-[10px] font-extrabold text-text-muted tracking-[0.15em] uppercase">
                            <Trans>Duration</Trans>
                          </label>
                          <div className="relative group/select">
                            <select
                              value={duration}
                              onChange={(e) => setDuration(e.target.value)}
                              className="w-full bg-main-bg border border-border rounded-xl px-4 py-3.5 text-xs text-text-main focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] appearance-none cursor-pointer font-bold transition-all duration-300 hover:border-[#EB712B]/50"
                            >
                              <option value="monthly">{t`1 Month`}</option>
                              <option value="quarterly">{t`3 Months`}</option>
                              <option value="semi-annual">{t`6 Months`}</option>
                              <option value="annual">{t`1 Year`}</option>
                            </select>

                            {/* Custom Dropdown Arrow */}
                            <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none transition-transform duration-300 group-hover/select:translate-y-0.5">
                              <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                stroke="#9CA3AF"
                                className="transition-colors duration-300 group-hover/select:stroke-[#EB712B]"
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

                      {/* Auto Renew & Discount Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2.5">
                          <label className="text-[10px] font-extrabold text-text-muted tracking-[0.15em] uppercase">
                            <Trans>Auto Renew</Trans>
                          </label>
                          <div className="relative">
                            <select
                              value={autoRenew}
                              onChange={(e) => setAutoRenew(e.target.value)}
                              className="w-full bg-main-bg border border-border rounded-xl px-4 py-3.5 text-xs text-text-main focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold appearance-none cursor-pointer hover:border-border/80"
                            >
                              <option value="Yes">{t`Yes`}</option>
                              <option value="No">{t`No`}</option>
                            </select>
                            <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
                              <svg
                                width="10"
                                height="6"
                                viewBox="0 0 10 6"
                                fill="none"
                                stroke="#9CA3AF"
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
                        <div className="flex flex-col gap-2.5">
                          <label className="text-[10px] font-extrabold text-text-muted tracking-[0.15em] uppercase">
                            <Trans>Discount (%)</Trans>
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0%"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-full bg-main-bg border border-border rounded-xl px-4 py-3.5 text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-border/80"
                          />
                        </div>
                      </div>

                      {/* Feature Adder */}
                      <div className="flex flex-col gap-2.5 pt-2">
                        <label className="text-[10px] font-extrabold text-text-muted tracking-[0.15em] uppercase">
                          <Trans>Features Inclusion</Trans>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            placeholder={t`Ex: Access to exclusive track days`}
                            className="flex-1 bg-main-bg border border-border rounded-xl px-4 py-3.5 text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-border/80"
                          />
                          <button
                            type="button"
                            onClick={handleAddFeature}
                            className="p-3.5 bg-hover hover:bg-[#EB712B]/10 border border-border hover:border-[#EB712B]/30 rounded-xl text-text-main transition-all duration-300 cursor-pointer flex items-center justify-center active:scale-95"
                          >
                            <Plus size={16} className="text-[#EB712B]" />
                          </button>
                        </div>

                        {/* Interactive Feature Bullets */}
                        {featuresList.length > 0 && (
                          <div className="mt-4 space-y-2.5 bg-main-bg/60 border border-border/50 rounded-2xl p-4 animate-in fade-in duration-200">
                            {featuresList.map((feat, index) => (
                              <div
                                key={index}
                                className="group/item flex items-center justify-between bg-surface border border-border/80 py-2.5 px-3.5 rounded-xl cursor-pointer hover:border-[#EB712B]/40 transition-all duration-300 hover:translate-x-1"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#EB712B] shadow-[0_0_8px_#EB712B] transition-transform duration-300 group-hover/item:scale-125" />
                                  <span className="text-xs font-bold text-text-main tracking-tight">
                                    {feat}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFeature(index)}
                                  className="opacity-0 group-hover/item:opacity-100 p-1 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-all duration-200 cursor-pointer"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit / Cancel Buttons */}
                      <div className="flex gap-3 pt-4">
                        {editingPlanId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPlanId(null);
                              setShowMembershipForm(false);
                            }}
                            className="py-4 px-6 bg-hover hover:bg-surface border border-border text-text-muted hover:text-text-main rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all duration-300 active:scale-95"
                          >
                            <Trans>Cancel</Trans>
                          </button>
                        )}
                        <button
                          type="submit"
                          className="flex-1 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-95 border border-[#EB712B]/30"
                        >
                          <span className="relative z-10">
                            {editingPlanId ? (
                              <Trans>Save Changes</Trans>
                            ) : (
                              <Trans>Create Membership Plan</Trans>
                            )}
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Dynamic Membership Cards Display Area */}
              <div className="w-full space-y-6 animate-in fade-in slide-from-right-5 duration-500">
                <h2 className="text-xl font-black tracking-tight text-text-main flex items-center gap-3 px-1 mb-2">
                  <Trans>Membership Cards</Trans>
                  <span className="text-[10px] font-extrabold text-[#EB712B] px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20 backdrop-blur-md">
                    <Trans>{membershipPlans.length} Plans Created</Trans>
                  </span>
                </h2>

                {membershipPlans.length === 0 ? (
                  <div className="w-full bg-surface/50 backdrop-blur-xl border border-border/80 rounded-3xl p-10 sm:p-12 text-center transition-all duration-300 hover:border-[#EB712B]/30 flex flex-col items-center justify-center min-h-[300px] group shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center mb-4 text-[#EB712B] shadow-2xs group-hover:scale-105 transition-transform duration-300">
                      <CreditCard size={22} className="text-[#EB712B]" />
                    </div>
                    <p className="text-xs font-black text-text-main uppercase tracking-[0.15em] mb-1.5">
                      <Trans>No membership plans added yet</Trans>
                    </p>
                    <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                      <Trans>
                        Fill out the form on the left to create and preview cards here.
                      </Trans>
                    </p>
                  </div>
                ) : (
                  membershipPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="w-full bg-surface rounded-3xl border border-border p-6 relative flex flex-col justify-between overflow-visible shadow-md transition-colors hover:border-[#EB712B]/40"
                    >
                      {/* Top Action Dropdown (3-Dots) */}
                      {permissions.canManageMembershipFee && (
                        <div className="absolute top-6 right-6 z-40">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenCardMenuId(
                                openCardMenuId === plan.id ? null : plan.id
                              )
                            }
                            className="p-2 bg-hover hover:bg-hover/80 border border-border rounded-xl text-text-muted hover:text-text-main transition-all duration-300 cursor-pointer"
                          >
                            <MoreVertical size={16} />
                          </button>

                          {openCardMenuId === plan.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-2xl border border-border shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleEditPlan(plan)}
                                className="w-full text-left px-5 py-3 text-xs font-bold text-text-main hover:bg-hover transition-colors duration-200 cursor-pointer"
                              >
                                <Trans>Edit</Trans>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePlan(plan.id)}
                                className="w-full text-left px-5 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors duration-200 cursor-pointer border-t border-border/50"
                              >
                                <Trans>Delete</Trans>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pricing Overview */}
                      <div>
                        <span className="inline-block px-3 py-1 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-[#EB712B] mb-4 transition-all duration-300 group-hover:bg-[#EB712B]/20">
                          <Trans>{plan.duration} Subscription</Trans>
                        </span>
                        <h3 className="text-lg font-black text-text-main uppercase tracking-tight break-words pr-12 transition-colors duration-300 group-hover:text-[#EB712B]">
                          {plan.packageName}
                        </h3>

                        <div className="flex items-baseline gap-2 mt-4">
                          <span className="text-3xl font-black text-[#EB712B] tracking-tight transition-all duration-300 group-hover:scale-105 group-hover:text-[#ff8036]">
                            €{plan.price}
                          </span>
                          {plan.discount && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
                              -{plan.discount}% <Trans>Off</Trans>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-border/50 my-5 transition-colors duration-300 group-hover:border-border" />

                      {/* Feature Lists */}
                      <div>
                        <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-text-muted mb-3">
                          <Trans>Included Benefits</Trans>
                        </h4>
                        <ul className="space-y-2">
                          {plan.featuresList.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2.5 text-xs text-text-muted font-medium transition-all duration-300 group-hover:translate-x-1"
                            >
                              <div className="w-1 h-1 rounded-full bg-[#EB712B] shrink-0 transition-transform duration-300 group-hover:scale-125" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-border/50 my-5 transition-colors duration-300 group-hover:border-border" />

                      {/* Additional Status Details Grid */}
                      <div className="grid grid-cols-2 gap-4 bg-main-bg/50 border border-border/60 rounded-2xl p-4 text-[10px] font-extrabold uppercase tracking-[0.05em] transition-all duration-300 group-hover:bg-main-bg/80">
                        <div>
                          <span className="block text-text-muted font-bold mb-1">
                            <Trans>Auto-Renew</Trans>
                          </span>
                          <span
                            className={`text-xs transition-colors duration-300 ${
                              plan.autoRenew === "Yes"
                                ? "text-emerald-400"
                                : "text-text-muted"
                            }`}
                          >
                            {plan.autoRenew === "Yes" ? (
                              <Trans>Yes</Trans>
                            ) : (
                              <Trans>No</Trans>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="block text-text-muted font-bold mb-1">
                            <Trans>Stripe Status</Trans>
                          </span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 shadow-[0_0_8px_#22c55e] animate-ping" />
                            </span>
                            <Trans>Connected</Trans>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(activeTab === "Discounts" || (activeTab as any) === "Discount") && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Discount role="organizer" clubId={clubId || undefined} />
            </div>
          )}

          {activeTab === "News" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <News clubId={clubId || undefined} club={activeClub} />
            </div>
          )}

          {activeTab === "Leaderboard" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Leaderboard clubId={clubId || undefined} />
            </div>
          )}

          {activeTab === "Shop" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Shop clubId={clubId || undefined} />
            </div>
          )}

          {activeTab === "Marketplace" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Marketplace clubId={clubId || undefined} />
            </div>
          )}
        </div>
      </div>

      {/* ── Avatar Lightbox Preview Modal ── */}
      <AvatarLightboxModal
        isOpen={showClubAvatarPreview}
        onClose={() => setShowClubAvatarPreview(false)}
        imageUrl={logoImage}
        name={selectedName}
        subtitle={activeClub?.location || "Ride With Pals Club"}
        tag="Club Avatar"
        fallbackInitials={selectedName.slice(0, 2).toUpperCase()}
      />

      {/* ── Delete Club Modal ── */}
      {clubId && (
        <DeleteClubModal
          isOpen={isDeleteClubModalOpen}
          onClose={() => setIsDeleteClubModalOpen(false)}
          clubId={clubId}
          clubName={activeClub?.clubName}
          clubLogo={activeClub?.logo}
          clubLocation={activeClub?.location}
          clubType={
            activeClub?.clubTypeId === 2
              ? "Running"
              : activeClub?.clubTypeId === 3
              ? "Triathlon"
              : "Cycling"
          }
        />
      )}
    </div>
  );
};

export default ManageClubHome;
