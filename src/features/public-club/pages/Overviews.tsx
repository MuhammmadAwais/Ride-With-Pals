import { useState, useEffect } from "react";
import { 
  MapPin, Users, Loader2, Bike, Globe, Lock, Mail, Phone, 
  ExternalLink, Award, Sparkles, Calendar, TrendingUp, 
  CheckCircle2, ArrowUpRight, Compass, ShieldCheck, Layers, Zap
} from "lucide-react";
import { ClubService } from "@/features/club/services/clubService";
import { toast } from "sonner";

interface OverviewsProps {
  clubId?: number | string;
  club?: any;
}

const getMemberCount = (c: any): number => {
  if (!c) return 0;
  const val =
    c.participantCount ??
    c.participant_count ??
    c.memberCount ??
    c.member_count ??
    c.totalMembers ??
    c.total_members ??
    c.membersCount ??
    c.members_count ??
    c.ClubMembers?.length ??
    c.club_members?.length ??
    c.user_clubs?.length ??
    c.userClubs?.length ??
    c.UserClubs?.length ??
    c.members?.length ??
    c.Members?.length ??
    c.users?.length ??
    c.Users?.length ??
    c.participants?.length ??
    c.Participants?.length ??
    c._count?.user_clubs ??
    c._count?.members ??
    c._count?.users;

  const count = Number(val);
  if (!isNaN(count) && count > 0) return count;
  return 0;
};

const getClubTypeName = (typeId?: number | string, fallback?: string): string => {
  const id = Number(typeId);
  if (id === 1) return "Cycling";
  if (id === 2) return "Running";
  if (id === 3) return "Triathlon";
  return fallback || "Cycling";
};

const getClubPrivacyName = (privacyId?: number | string, fallback?: string): string => {
  const id = Number(privacyId);
  if (id === 1) return "Public";
  if (id === 2) return "Private";
  if (typeof fallback === "string" && fallback.trim() !== "") return fallback;
  return "Public";
};

export default function Overviews({ clubId, club: propClub }: OverviewsProps) {
  const [fetchedClubData, setFetchedClubData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasPropClub = Boolean(propClub && Object.keys(propClub).length > 0);
  const clubData = hasPropClub ? propClub : fetchedClubData;

  useEffect(() => {
    if (hasPropClub || !clubId) return;

    const loadClub = async () => {
      setIsLoading(true);
      try {
        const res = await ClubService.getClubById(Number(clubId));
        const data = res?.response || res?.data || res || {};
        setFetchedClubData(data);
      } catch (err) {
        console.error("Failed to load club in Overview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClub();
  }, [clubId, hasPropClub]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  const club = clubData || {};

  const descriptionText =
    club.aboutClub ||
    club.description ||
    club.about_club ||
    club.about ||
    "Welcome to our club! We organize group rides, community activities, and training sessions for athletes of all skill levels.";

  const locationText =
    club.location ||
    club.address ||
    club.fullAddress ||
    "Islamabad, Pakistan";

  const sportType = getClubTypeName(club.clubTypeId, club.clubType || club.sportType);
  const privacy = getClubPrivacyName(club.clubPrivacyId, club.privacy || club.clubPrivacy);
  const isPublic = privacy.toLowerCase() === "public";

  const email =
    club.email ||
    club.contactEmail ||
    club.contact_email ||
    club.contactInfo ||
    club.creator?.email ||
    club.owner?.email ||
    club.user?.email ||
    "contact@ridewithpals.com";

  const phone =
    club.phone ||
    club.contactPhone ||
    club.contact_phone ||
    club.phoneNumber ||
    undefined;

  const memberCount = getMemberCount(club);

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
    window.open(url, "_blank");
  };

  const copyEmailToClipboard = () => {
    if (email && email !== "N/A") {
      navigator.clipboard.writeText(email);
      toast.success("Email address copied to clipboard!");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-text-main pb-16 animate-in fade-in-50 duration-300 font-sans">
      
      {/* ── 1. ARCHITECTURAL TOP SPEC BAR ── */}
      <div className="w-full bg-surface border border-border rounded-2xl shadow-sm divide-y md:divide-y-0 md:divide-x divide-border grid grid-cols-2 md:grid-cols-4 overflow-hidden">
        {/* Sport */}
        <div className="p-5 flex items-center gap-4 hover:bg-hover/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B] shrink-0">
            <Bike size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Sport Category</span>
            <span className="text-sm md:text-base font-black text-text-main truncate block mt-0.5">{sportType}</span>
          </div>
        </div>

        {/* Community */}
        <div className="p-5 flex items-center gap-4 hover:bg-hover/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Active Athletes</span>
            <span className="text-sm md:text-base font-black text-text-main truncate block mt-0.5">{memberCount} Members</span>
          </div>
        </div>

        {/* Access */}
        <div className="p-5 flex items-center gap-4 hover:bg-hover/50 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            {isPublic ? <Globe size={20} /> : <Lock size={20} />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Privacy Access</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm md:text-base font-black text-text-main">{privacy}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            </div>
          </div>
        </div>

        {/* Location Base */}
        <div 
          onClick={openGoogleMaps}
          className="p-5 flex items-center justify-between hover:bg-hover/50 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <MapPin size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block">Base Location</span>
              <span className="text-sm md:text-base font-black text-text-main truncate block mt-0.5">{locationText.split(",")[0]}</span>
            </div>
          </div>
          <ArrowUpRight size={18} className="text-text-muted group-hover:text-[#EB712B] transition-colors shrink-0 ml-2" />
        </div>
      </div>

      {/* ── 2. MAIN 12-COLUMN EDITORIAL SHOWCASE GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Editorial Section (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Editorial Dossier & Mission */}
          <div className="bg-surface border border-border rounded-3xl p-7 md:p-9 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B]">
                  <Sparkles size={16} />
                </div>
                <h2 className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Club Mission & Overview
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 uppercase tracking-wider">
                <ShieldCheck size={12} /> Verified Organization
              </span>
            </div>

            {/* Quote Accent Statement */}
            <div className="border-l-4 border-[#EB712B] pl-5 py-1 mb-6">
              <p className="text-base md:text-lg text-text-main font-semibold leading-relaxed whitespace-pre-line">
                {descriptionText}
              </p>
            </div>

            {/* Integrated Feature Chips */}
            <div className="pt-6 border-t border-border">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted block mb-3">Key Highlights</span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  "Regular Group Rides",
                  "Active Leaderboard",
                  "Community Events",
                  "Member Discounts",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-hover border border-border text-xs font-bold text-text-main">
                    <CheckCircle2 size={14} className="text-[#EB712B] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Minimalist Capability Sheet (Instead of cards!) */}
          <div className="bg-surface border border-border rounded-3xl p-7 md:p-9 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Layers size={16} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Club Programming & Offerings
                </h3>
              </div>
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-widest">3 Core Pillars</span>
            </div>

            {/* Seamless List Sheet with Hairline Dividers */}
            <div className="divide-y divide-border">
              
              {/* Pillar 1 */}
              <div className="py-5 first:pt-0 last:pb-0 flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center text-[#EB712B] shrink-0 group-hover:border-[#EB712B]/40 transition-colors">
                  <Calendar size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-text-main group-hover:text-[#EB712B] transition-colors">
                      Organized Rides & Events
                    </h4>
                    <span className="text-[10px] font-extrabold bg-[#EB712B]/10 text-[#EB712B] px-2.5 py-0.5 rounded-md uppercase tracking-wider">Active</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mt-1">
                    Regularly scheduled group rides with mapped routes, designated pace groups, safety leaders, and Strava GPS route sync.
                  </p>
                </div>
              </div>

              {/* Pillar 2 */}
              <div className="py-5 first:pt-0 last:pb-0 flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center text-blue-500 shrink-0 group-hover:border-blue-500/40 transition-colors">
                  <TrendingUp size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-text-main group-hover:text-blue-500 transition-colors">
                      Leaderboard & Performance Tracking
                    </h4>
                    <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-500 px-2.5 py-0.5 rounded-md uppercase tracking-wider">Live</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mt-1">
                    Connect Strava or log completed activities to compete on distance, elevation gains, and weekly club segment rankings.
                  </p>
                </div>
              </div>

              {/* Pillar 3 */}
              <div className="py-5 first:pt-0 last:pb-0 flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center text-purple-500 shrink-0 group-hover:border-purple-500/40 transition-colors">
                  <Award size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-extrabold text-text-main group-hover:text-purple-500 transition-colors">
                      Official Shop & Peer Marketplace
                    </h4>
                    <span className="text-[10px] font-extrabold bg-purple-500/10 text-purple-500 px-2.5 py-0.5 rounded-md uppercase tracking-wider">Storefront</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed mt-1">
                    Access official club kits, merchandise, partner brand discounts, and a verified marketplace for buying and selling gear.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Operational Readiness Status Bar (More Details!) */}
          <div className="bg-surface border border-border rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-text-muted">
            <div className="flex items-center gap-2">
              <Zap size={15} className="text-[#EB712B]" />
              <span className="text-text-main font-extrabold">Club Status:</span> Fully Operational & Verified
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> Helmet Required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> GPS Tracked</span>
            </div>
          </div>

        </div>

        {/* Right Sidebar Section (4 Cols - Perfectly Aligned) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Base Location & Directions Widget */}
          <div className="bg-surface border border-border rounded-3xl p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Compass className="text-amber-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Base HQ Location
                </h3>
              </div>
              <button
                onClick={openGoogleMaps}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-hover border border-border text-[#EB712B] text-[10px] font-black uppercase tracking-wider hover:border-[#EB712B]/40 transition-colors cursor-pointer"
              >
                <span>Maps</span>
                <ExternalLink size={11} />
              </button>
            </div>

            <div>
              <p className="text-sm font-extrabold text-text-main leading-snug">
                {locationText}
              </p>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                All scheduled group rides and official training meetups depart from or near this base location.
              </p>
            </div>

            <button
              onClick={openGoogleMaps}
              className="w-full py-3.5 px-4 rounded-2xl bg-hover hover:bg-border border border-border flex items-center justify-between text-xs font-extrabold text-text-main transition-colors cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-[#EB712B]" /> Get Directions to HQ
              </span>
              <ArrowUpRight size={16} className="text-text-muted group-hover:text-[#EB712B] transition-colors" />
            </button>
          </div>

          {/* Contact & Support Sheet */}
          <div className="bg-surface border border-border rounded-3xl p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Mail className="text-blue-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Organizer Contact
                </h3>
              </div>
              <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest">
                Active
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Have questions regarding membership rules, ride schedules, or group pace categories? Get in touch directly with the organizer.
            </p>

            <div className="space-y-3 pt-1">
              {/* Email Box */}
              <div 
                onClick={copyEmailToClipboard}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-hover border border-border hover:border-[#EB712B]/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail size={16} className="text-[#EB712B] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Official Email</span>
                    <span className="text-xs font-extrabold text-text-main truncate block group-hover:text-[#EB712B] transition-colors">
                      {email}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-black text-text-muted group-hover:text-[#EB712B] shrink-0 uppercase tracking-widest pl-2">
                  Copy
                </span>
              </div>

              {/* Phone if available */}
              {phone && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-hover border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone size={16} className="text-[#EB712B] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-wider block">Direct Line</span>
                      <span className="text-xs font-extrabold text-text-main truncate block">
                        {phone}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span>Club Host</span>
              <span className="font-extrabold text-text-main">Verified Organizer</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}