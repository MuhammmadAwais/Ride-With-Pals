import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Users, Loader2, Bike, Globe, Lock, Mail, Phone, 
  ShieldCheck, ArrowUpRight, Copy, Check, Activity, Navigation,
  Calendar, Clock, ArrowRight, FileText
} from "lucide-react";
import { ClubService } from "@/features/club/services/clubService";
import { useGetClubRidesQuery, useGetClubMembersListQuery } from "@/features/club/api/clubApiSlice";
import { resolveImageUrl } from "../services/clubGeocoding";
import { toast } from "sonner";

interface OverviewsProps {
  clubId?: number | string;
  club?: any;
  membersCount?: number;
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

const extractMembersList = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.response)) return data.response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data?.clubMembers)) return data.clubMembers;
  return [];
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

export default function Overviews({ clubId, club: propClub, membersCount: propMembersCount }: OverviewsProps) {
  const navigate = useNavigate();
  const [fetchedClubData, setFetchedClubData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const hasPropClub = Boolean(propClub && Object.keys(propClub).length > 0);
  const clubData = hasPropClub ? propClub : fetchedClubData;
  const actualClubId = clubId || propClub?.id || fetchedClubData?.id;

  // Fetch real club rides
  const { data: ridesRawData } = useGetClubRidesQuery(
    { clubId: actualClubId!, limit: 4, offset: 0 },
    { skip: !actualClubId, refetchOnMountOrArgChange: true }
  );

  // Fetch live club members list for dynamic count
  const { data: membersListData } = useGetClubMembersListQuery(
    { clubId: Number(actualClubId) },
    { skip: !actualClubId, refetchOnMountOrArgChange: true }
  );

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

  const club = clubData || {};

  const descriptionText =
    club.aboutClub ||
    club.description ||
    club.about_club ||
    club.about ||
    "Welcome to our club. We are a dedicated athletic collective committed to endurance, camaraderie, and community group sessions across mapped routes.";

  const locationText =
    club.location ||
    club.address ||
    club.fullAddress ||
    "Madrid, Spain";

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
    "club@ridewithpals.com";

  const phone =
    club.phone ||
    club.contactPhone ||
    club.contact_phone ||
    club.phoneNumber ||
    undefined;

  const organizerName = 
    club.creator?.name || 
    club.creator?.fullName || 
    club.owner?.name || 
    club.user?.name || 
    club.creatorName || 
    "Official Club Organizer";

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationText)}`;
    window.open(url, "_blank");
  };

  const copyEmailToClipboard = () => {
    if (email && email !== "N/A") {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      toast.success("Organizer email copied to clipboard");
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  // Parse up to 2 latest scheduled club rides
  const rawRidesList = (ridesRawData as any)?.response?.rows || (ridesRawData as any)?.rows || (ridesRawData as any)?.response?.data || (ridesRawData as any)?.data || [];

  const latestRides = useMemo(() => {
    if (!Array.isArray(rawRidesList)) return [];
    return rawRidesList.slice(0, 2).map((item: any) => {
      const id = item.id || item.rideId;
      const title = item.rideName || item.ridename || item.title || item.name || item.activityName || "Club Group Ride";
      
      let formattedDate = "Upcoming";
      const dateVal = item.date || item.startDate || item.start_date;
      if (dateVal) {
        try {
          const d = new Date(dateVal);
          if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
          } else {
            formattedDate = String(dateVal);
          }
        } catch {
          formattedDate = String(dateVal);
        }
      }

      let formattedTime = "";
      if (item.time || item.startTime || item.start_time) {
        const rawTime = String(item.time || item.startTime || item.start_time);
        formattedTime = rawTime.slice(0, 5);
      }

      let displayDistance: string | null = null;
      if (item.distance !== undefined && item.distance !== null && String(item.distance).trim() !== "") {
        const rawUnit = String(item.distanceUnit || "km").toLowerCase();
        const unit = rawUnit.includes("mi") ? "mi" : "km";
        displayDistance = `${item.distance} ${unit}`;
      }

      const location = item.meetingPoint || item.location || item.address || locationText.split(",")[0] || "Meetup Point";
      const imagePath = 
        item.coverImage || 
        item.image || 
        item.bannerImage || 
        item.routeImage || 
        item.media || 
        item.club?.coverImage || 
        item.club?.logo || 
        club?.coverImage || 
        club?.bannerImage || 
        club?.logo;
      const image = resolveImageUrl(imagePath) || "/Images/CyclingPicture.jpg";

      return {
        id,
        title,
        formattedDate,
        formattedTime,
        distance: displayDistance,
        location,
        image,
      };
    });
  }, [rawRidesList, locationText]);

  // Dynamic members count linked to actual members list
  const dynamicMemberCount = useMemo(() => {
    // 1. Live members list query
    const list = extractMembersList(membersListData);
    if (list.length > 0) return list.length;

    // 2. Prop count passed from ClubDetails (already resolved from live query)
    if (typeof propMembersCount === 'number' && propMembersCount > 0) {
      return propMembersCount;
    }

    // 3. Check club internal member arrays
    const fromClub = extractMembersList(club?.clubMembers || club?.members || club?.user_clubs || club?.participants);
    if (fromClub.length > 0) return fromClub.length;

    return getMemberCount(club);
  }, [propMembersCount, membersListData, club]);

  const accessLabel = isPublic ? "Open Access" : "Invite Only";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 text-text-main pb-24 font-sans antialiased">
      
      {/* ── 1. ARCHITECTURAL TECHNICAL LEDGER (Balanced Neutral Icons & Clean Direct Values) ── */}
      <section className="w-full border-y border-border bg-surface/30">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border">
          
          {/* Spec 01: Category */}
          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3 hover:bg-hover/20 transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <Bike size={16} className="text-[#EB712B]" />
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-text-main whitespace-nowrap">
              {sportType}
            </span>
          </div>

          {/* Spec 02: Dynamic Active Roster */}
          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3 hover:bg-hover/20 transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <Users size={16} className="text-[#EB712B]" />
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-text-main whitespace-nowrap">
              {dynamicMemberCount} {dynamicMemberCount === 1 ? 'Athlete' : 'Athletes'}
            </span>
          </div>

          {/* Spec 03: Dynamic Admission / Access */}
          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3 hover:bg-hover/20 transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              {isPublic ? <Globe size={16} className="text-[#EB712B]" /> : <Lock size={16} className="text-[#EB712B]" />}
            </div>
            <span 
              className="text-xs sm:text-sm md:text-base font-black tracking-tight text-text-main whitespace-nowrap"
              title={isPublic ? "Open Community · Public Registration" : "Private Club · Invitation or Code Required"}
            >
              {accessLabel}
            </span>
          </div>

          {/* Spec 04: Membership Dues */}
          <div className="p-3.5 sm:p-4 lg:p-5 flex items-center gap-3 hover:bg-hover/20 transition-colors">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <Activity size={16} className="text-[#EB712B]" />
            </div>
            <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-text-main whitespace-nowrap">
              {club.hasMembershipFee || club.restrictUnpaidMembers ? "Member Dues" : "Free Access"}
            </span>
          </div>

          {/* Spec 05: Base Hub */}
          <div 
            onClick={openGoogleMaps}
            className="p-3.5 sm:p-4 lg:p-5 flex items-center justify-between gap-3 col-span-2 md:col-span-1 hover:bg-hover/30 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 group-hover:border-[#EB712B]/45 flex items-center justify-center shrink-0 shadow-xs transition-all">
                <MapPin size={16} className="text-[#EB712B]" />
              </div>
              <span className="text-xs sm:text-sm md:text-base font-black tracking-tight text-text-main truncate group-hover:text-[#EB712B] transition-colors" title={locationText}>
                {locationText.split(",")[0] || "Global Base"}
              </span>
            </div>
            <ArrowUpRight size={16} className="text-text-muted group-hover:text-[#EB712B] shrink-0 transition-colors" />
          </div>

        </div>
      </section>

      {/* ── 2. COMMUNITY OVERVIEW & UPCOMING RIDES ── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-2">
        
        {/* Left Column: Key Specifications & Details (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 lg:border-r lg:border-border lg:pr-10">
          <div className="space-y-2">
            <span className="text-[10px] font-mono tracking-widest text-[#EB712B] uppercase block">
              OVERVIEW
            </span>
            <h3 className="text-xl font-black uppercase tracking-tight text-text-main">
              Club Information
            </h3>
          </div>

          <p className="text-xs text-text-muted leading-relaxed">
            Key details, sport discipline, and community parameters for this club.
          </p>

          {/* Dynamic Status Flags */}
          <div className="pt-4 border-t border-border space-y-3 text-xs font-medium text-text-muted">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider uppercase">VERIFICATION</span>
              <span className="font-bold text-text-main inline-flex items-center gap-1.5">
                {club.isVerified ? (
                  <>
                    <ShieldCheck size={14} className="text-emerald-400" />
                    Verified Official
                  </>
                ) : (
                  "Community Roster"
                )}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider uppercase">DISCIPLINE</span>
              <span className="font-bold text-text-main">{sportType}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider uppercase">ACCESS</span>
              <span className="font-bold text-text-main">{accessLabel}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wider uppercase">LOCATION</span>
              <span className="font-bold text-text-main truncate max-w-[170px]" title={locationText}>
                {locationText.split(",")[0]}
              </span>
            </div>
          </div>

          {/* Action to Explore Map */}
          <div className="pt-2">
            <button
              onClick={openGoogleMaps}
              className="w-full py-3 px-4 rounded-xl border border-border hover:border-text-muted/40 bg-surface/50 hover:bg-hover text-text-main text-xs font-black uppercase tracking-wider flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Navigation size={14} className="text-[#EB712B]" />
                View Location On Map
              </span>
              <ArrowUpRight size={15} className="text-text-muted" />
            </button>
          </div>
        </div>

        {/* Right Column: Upcoming Club Rides (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {latestRides.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-widest uppercase text-text-muted block">
                  UPCOMING CLUB RIDES
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-border p-6 flex flex-col justify-between min-h-[190px] bg-surface/30 group">
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-[#EB712B] uppercase block">
                    NEXT RIDE
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-text-main uppercase tracking-tight">
                    Upcoming Group Ride In Preparation
                  </h4>
                  <p className="text-xs text-text-muted max-w-lg leading-relaxed mt-1">
                    Route coordinates and pace groups are currently being organized by club leadership. Check back soon for the next departure.
                  </p>
                </div>
                <div className="relative z-10 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/view/userside/rides')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-hover border border-border hover:border-text-muted/40 text-xs font-black uppercase tracking-wider text-text-main transition-colors cursor-pointer"
                  >
                    <span>Browse All Activities</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {latestRides.map((ride) => (
                <div key={ride.id} className="space-y-4">
                  {/* Typography Hierarchy: Ride title, location, and briefing placed cleanly ABOVE the card */}
                  <div className="space-y-3">
                    {/* Top Kicker (Clean Floating Indicator + Text) */}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#EB712B]" />
                      <span className="text-[11px] sm:text-xs font-mono tracking-widest uppercase text-[#EB712B] font-bold">
                        UPCOMING CLUB RIDE
                      </span>
                    </div>

                    {/* Ride Title with Strong Typographic Hierarchy */}
                    <h3 
                      className="text-2xl sm:text-3xl md:text-4xl font-black text-text-main uppercase tracking-tight leading-tight hover:text-[#EB712B] transition-colors cursor-pointer"
                      onClick={() => navigate(`/view/userside/dashboard/ride/${ride.id}`)}
                    >
                      {ride.title}
                    </h3>

                    {/* Location on its own dedicated readable line with high contrast */}
                    <div 
                      className="flex items-start sm:items-center gap-2 text-sm text-text-main/80 hover:text-text-main transition-colors max-w-2xl font-medium pt-0.5"
                      title={ride.location}
                    >
                      <MapPin size={16} className="text-[#EB712B] shrink-0 mt-0.5 sm:mt-0" />
                      <span className="leading-snug">{ride.location}</span>
                    </div>

                    {/* Descriptive Briefing Text */}
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-2xl">
                      Ready to roll? Tap below to view full route details, meeting coordinates, and secure your spot with the pack.
                    </p>
                  </div>

                  {/* Clean Visual Card: Dynamic Ride Image with telemetry badges and CTA on card */}
                  <div 
                    onClick={() => navigate(`/view/userside/dashboard/ride/${ride.id}`)}
                    className="relative rounded-2xl overflow-hidden border border-border group aspect-[21/9] sm:aspect-[21/8] min-h-[240px] sm:min-h-[280px] bg-black/50 cursor-pointer shadow-none"
                  >
                    {/* Dynamic Image of the Ride */}
                    <img 
                      src={ride.image} 
                      alt={ride.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CyclingPicture.jpg'; }}
                    />
                    
                    {/* Gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20 pointer-events-none" />

                    {/* Overlay: Sport tag on top, Date/Distance Telemetry + Join CTA on bottom */}
                    <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between pointer-events-none">
                      {/* Top Row: Activity Tag */}
                      <div className="flex justify-between items-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-widest text-white/90 uppercase">
                          {sportType} Activity
                        </span>
                      </div>

                      {/* Bottom Row: Date/Time + Distance telemetry on card, and Join CTA */}
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-4">
                        {/* Telemetry on card (Date/Time & Distance) */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Date & Time */}
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-white shadow-md">
                            <Calendar size={14} className="text-[#EB712B] shrink-0" />
                            <span>{ride.formattedDate}</span>
                            {ride.formattedTime && (
                              <>
                                <span className="text-white/40">•</span>
                                <Clock size={14} className="text-[#EB712B] shrink-0" />
                                <span>{ride.formattedTime}</span>
                              </>
                            )}
                          </div>

                          {/* Distance */}
                          {ride.distance && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold text-white shadow-md">
                              <Navigation size={14} className="text-[#EB712B] shrink-0" />
                              <span>{ride.distance}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div className="flex items-center justify-end sm:justify-start">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/view/userside/dashboard/ride/${ride.id}`);
                            }}
                            className="pointer-events-auto inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-[#EB712B] text-black hover:text-white font-black text-xs uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer shadow-lg"
                          >
                            <span>Join Latest Ride</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

      {/* ── 3. DESCRIPTION & ORGANIZER CONTACT (Clean Human Language) ── */}
      <section className="border-t border-border pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 divide-y md:divide-y-0 md:divide-x divide-border">
          
          {/* Left Column: Club Description */}
          <div className="space-y-5 md:pr-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <FileText size={16} className="text-[#EB712B]" />
                <span className="text-[10px] font-mono tracking-widest uppercase">DESCRIPTION</span>
              </div>
              {locationText && (
                <button
                  onClick={openGoogleMaps}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EB712B] hover:underline cursor-pointer"
                  title="View on Google Maps"
                >
                  <MapPin size={12} />
                  <span>{locationText.split(",")[0]}</span>
                  <ArrowUpRight size={13} />
                </button>
              )}
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-black text-text-main leading-snug tracking-tight">
                About {club.clubName || "The Club"}
              </h4>
              <p className="text-xs sm:text-sm text-text-muted mt-2 leading-relaxed whitespace-pre-line font-normal">
                {descriptionText}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={openGoogleMaps}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-hover border border-border hover:border-text-muted/40 text-xs font-black uppercase tracking-wider text-text-main transition-colors cursor-pointer"
              >
                <MapPin size={15} className="text-[#EB712B]" />
                <span>Open Location in Google Maps</span>
                <ArrowUpRight size={14} className="text-text-muted" />
              </button>
            </div>
          </div>

          {/* Right Column: Contact Organizer */}
          <div className="space-y-5 pt-10 md:pt-0 md:pl-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-muted">
                <Mail size={16} className="text-text-muted" />
                <span className="text-[10px] font-mono tracking-widest uppercase">CONTACT</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                VERIFIED ORGANIZER
              </span>
            </div>

            <div>
              <h4 className="text-lg sm:text-xl font-black text-text-main leading-snug tracking-tight">
                {organizerName}
              </h4>
              <p className="text-xs text-text-muted mt-2 leading-relaxed">
                Have questions regarding membership, scheduled rides, or club events? Get in touch with the organizer.
              </p>
            </div>

            {/* Direct Communication Channels */}
            <div className="space-y-3 pt-2">
              {/* Email */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface/50">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail size={16} className="text-[#EB712B] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">
                      EMAIL
                    </span>
                    <a 
                      href={`mailto:${email}`}
                      className="text-xs font-bold text-text-main hover:text-[#EB712B] truncate block transition-colors"
                      title={email}
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={copyEmailToClipboard}
                  className="px-3 py-1.5 rounded-lg border border-border hover:border-text-muted/50 text-[10px] font-mono tracking-wider uppercase text-text-muted hover:text-text-main transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedEmail ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Direct Phone */}
              {phone && (
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone size={16} className="text-[#EB712B] shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider block">
                        PHONE
                      </span>
                      <a 
                        href={`tel:${phone}`}
                        className="text-xs font-bold text-text-main hover:text-[#EB712B] truncate block transition-colors"
                      >
                        {phone}
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    Direct
                  </span>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}