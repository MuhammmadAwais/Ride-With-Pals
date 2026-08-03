/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { 
  MapPin, Info, Users, Loader2, Bike, Globe, Lock, Mail, Phone, 
  ExternalLink, Award, Sparkles, Shield, Calendar, TrendingUp, 
  CheckCircle2, ArrowUpRight, Heart, Share2, Compass
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
    <div className="max-w-5xl w-full space-y-8 text-text-main pb-12 animate-in fade-in-50 duration-500">
      {/* ── 1. STATS & AT-A-GLANCE BANNER ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Sport Type */}
        <div className="bg-surface/90 backdrop-blur-md border border-border/80 hover:border-[#EB712B]/40 transition-all duration-300 rounded-2xl p-4 flex items-center gap-3.5 group shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EB712B] to-[#F39C12] flex items-center justify-center text-white shadow-md shadow-[#EB712B]/20 group-hover:scale-105 transition-transform">
            <Bike size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Sport</p>
            <p className="text-sm sm:text-base font-extrabold text-text-main truncate mt-0.5">{sportType}</p>
          </div>
        </div>

        {/* Members */}
        <div className="bg-surface/90 backdrop-blur-md border border-border/80 hover:border-[#EB712B]/40 transition-all duration-300 rounded-2xl p-4 flex items-center gap-3.5 group shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Community</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm sm:text-base font-extrabold text-text-main">{memberCount}</p>
              <span className="text-xs font-semibold text-text-muted">Members</span>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-surface/90 backdrop-blur-md border border-border/80 hover:border-[#EB712B]/40 transition-all duration-300 rounded-2xl p-4 flex items-center gap-3.5 group shadow-sm">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform ${isPublic ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20'}`}>
            {isPublic ? <Globe size={20} /> : <Lock size={20} />}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Access</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm sm:text-base font-extrabold text-text-main">{privacy}</p>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          </div>
        </div>

        {/* Location badge */}
        <div 
          onClick={openGoogleMaps}
          className="bg-surface/90 backdrop-blur-md border border-border/80 hover:border-[#EB712B]/40 transition-all duration-300 rounded-2xl p-4 flex items-center gap-3.5 group shadow-sm cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <MapPin size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Location</p>
            <p className="text-sm sm:text-base font-extrabold text-text-main truncate mt-0.5">{locationText.split(",")[0]}</p>
          </div>
          <ArrowUpRight size={16} className="text-text-muted group-hover:text-[#EB712B] transition-colors shrink-0" />
        </div>
      </div>

      {/* ── 2. ABOUT & DESCRIPTION CARD ── */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#EB712B]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B]">
              <Sparkles size={20} />
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-text-main">
              About The Club
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EB712B]/15 text-[#EB712B] border border-[#EB712B]/30">
            Verified Organization
          </span>
        </div>

        <p className="text-sm sm:text-base text-text-muted leading-relaxed whitespace-pre-line font-normal">
          {descriptionText}
        </p>

        {/* Feature badges inside About */}
        <div className="flex flex-wrap items-center gap-2.5 mt-6 pt-6 border-t border-border/60">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs font-semibold text-text-main">
            <CheckCircle2 size={14} className="text-[#EB712B]" />
            <span>Regular Group Rides</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs font-semibold text-text-main">
            <CheckCircle2 size={14} className="text-[#EB712B]" />
            <span>Active Leaderboard</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs font-semibold text-text-main">
            <CheckCircle2 size={14} className="text-[#EB712B]" />
            <span>Community Events</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-border text-xs font-semibold text-text-main">
            <CheckCircle2 size={14} className="text-[#EB712B]" />
            <span>Member Discounts</span>
          </div>
        </div>
      </div>

      {/* ── 3. LOCATION & CONTACT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Location Card */}
        <div className="bg-surface border border-border hover:border-[#EB712B]/40 transition-all duration-300 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Compass size={20} />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-text-main">
                  Primary Location
                </h4>
              </div>
              <button
                onClick={openGoogleMaps}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EB712B]/10 hover:bg-[#EB712B]/20 text-[#EB712B] text-xs font-bold transition-colors"
              >
                <span>Open Map</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <p className="text-sm font-semibold text-text-main leading-relaxed mt-2">
              {locationText}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Group rides and training meetups typically depart from or near this base location.
            </p>
          </div>

          <div 
            onClick={openGoogleMaps}
            className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/5 to-[#EB712B]/5 border border-border/80 flex items-center justify-between cursor-pointer group/map hover:border-[#EB712B]/50 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <MapPin size={16} className="text-[#EB712B]" />
              <span className="text-xs font-bold text-text-main group-hover/map:text-[#EB712B] transition-colors">
                Get Directions to Club Base
              </span>
            </div>
            <ArrowUpRight size={16} className="text-text-muted group-hover/map:text-[#EB712B] transition-colors" />
          </div>
        </div>

        {/* Contact & Support Card */}
        <div className="bg-surface border border-border hover:border-[#EB712B]/40 transition-all duration-300 rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <Mail size={20} />
                </div>
                <h4 className="text-base sm:text-lg font-bold text-text-main">
                  Contact & Support
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                Responsive
              </span>
            </div>

            <p className="text-xs text-text-muted">
              Have questions about club rules, membership fees, or upcoming group rides? Get in touch with the organizer.
            </p>

            <div className="mt-5 space-y-3">
              {/* Email */}
              <div 
                onClick={copyEmailToClipboard}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-border hover:border-[#EB712B]/40 transition-all cursor-pointer group/email"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Mail size={16} className="text-[#EB712B] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Email Address</p>
                    <p className="text-sm font-bold text-text-main truncate group-hover/email:text-[#EB712B] transition-colors">
                      {email}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-text-muted group-hover/email:text-[#EB712B] shrink-0">
                  Copy
                </span>
              </div>

              {/* Phone if available */}
              {phone && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-border">
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone size={16} className="text-[#EB712B] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-bold text-text-main truncate">
                        {phone}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-text-muted">
            <span>Club Organizer</span>
            <span className="font-bold text-text-main">Active on Ride With Pals</span>
          </div>
        </div>
      </div>

      {/* ── 4. WHAT WE OFFER HIGHLIGHTS ── */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-text-main">
          What This Club Offers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-surface/80 border border-border hover:border-[#EB712B]/40 transition-all rounded-3xl p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-3">
              <Calendar size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-main">Organized Rides</h5>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Regularly scheduled rides with route maps, pace groups, and ride leaders.
              </p>
            </div>
          </div>

          <div className="bg-surface/80 border border-border hover:border-[#EB712B]/40 transition-all rounded-3xl p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <TrendingUp size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-main">Leaderboard Tracking</h5>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Connect Strava or log rides to compete on the distance and elevation leaderboards.
              </p>
            </div>
          </div>

          <div className="bg-surface/80 border border-border hover:border-[#EB712B]/40 transition-all rounded-3xl p-5 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
              <Award size={20} />
            </div>
            <div>
              <h5 className="font-bold text-sm text-text-main">Marketplace & Shop</h5>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Access club merchandise, exclusive discounts, and peer-to-peer gear listings.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}