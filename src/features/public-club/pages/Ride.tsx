import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Bike,   
  ArrowRight,
  Search,
  Filter,
  X,
  Compass,
  CheckCircle2,
  Bookmark,
  Grid3X3,
  List,
  Map as MapIcon,
  Download,
  Share2,
  CreditCard
} from "lucide-react";

import { useGetPublicRidesQuery, useGetClubRidesQuery } from "@/features/club/api/clubApiSlice";
import { useSaveRideMutation, useUnsaveRideMutation } from "@/features/club/api/savedRidesApiSlice";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ActivityMapView } from "../components/ActivityMapView";
import { GoogleCalendarIcon } from "@/components/common/GoogleCalendarIcon";
import { UniversalShareModal } from "@/components/common/UniversalShareModal";
import { buildGoogleCalendarUrl, downloadGpxFile, extractTerrainAndCategoryBadges } from "../utils/activityUtils";
import { toast } from "sonner";

export interface RideItem {
  id: number;
  title: string;
  clubName: string;
  date: string;
  time?: string;
  location: string;
  rideType: string;
  speed: string;
  distance: string;
  participants: string;
  organizer: string;
  organizerAvatar: string | null;
  isRideJoined: boolean;
  isSaved: boolean;
  image: string;
  isPublic: boolean;
  gpxFile?: string | null;
  description?: string;
  terrainBadges: string[];
  isPaymentRequired?: boolean;
  price?: number;
  priceFormatted?: string;
}

interface RideProps {
  clubId?: string | number;
}

const getRideSportType = (item: any): string => {
  const typeId = Number(item.sportTypeId || item.activityTypeId || item.rideTypeId || item.clubTypeId);
  if (typeId === 1) return "Cycling";
  if (typeId === 2) return "Running";
  if (typeId === 3) return "Triathlon";
  if (typeId === 4) return "Swimming";

  const str = (item.sportTypeName || item.activityTypeName || item.sportSubTypeName || item.rideType || item.type || "").toString().trim();
  const lower = str.toLowerCase();
  if (!str || lower === "road" || lower === "gravel" || lower === "mtb" || lower === "criterium" || lower === "asphalt" || lower === "trail" || lower === "cycling" || lower === "1" || lower.includes("biking") || lower.includes("cycling")) {
    return "Cycling";
  }
  if (lower === "running" || lower === "run" || lower === "2" || lower.includes("running")) {
    return "Running";
  }
  if (lower === "triathlon" || lower === "3" || lower.includes("triathlon")) {
    return "Triathlon";
  }
  if (lower === "swimming" || lower === "swim" || lower === "4" || lower.includes("swimming")) {
    return "Swimming";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const RideCardSkeleton = () => (
  <div className="bg-main-bg border border-border rounded-2xl overflow-hidden animate-pulse">
    <div className="h-44 bg-[#222]" />
    <div className="p-6 space-y-4">
      <div className="space-y-2">
        <div className="w-3/4 h-5 bg-[#222] rounded" />
        <div className="w-1/2 h-3 bg-[#222] rounded" />
      </div>
      <div className="space-y-2 bg-surface p-4 rounded-xl border border-border">
        <div className="w-full h-3 bg-[#222] rounded" />
        <div className="w-full h-3 bg-[#222] rounded" />
        <div className="w-2/3 h-3 bg-[#222] rounded" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#222] rounded-xl" />)}
      </div>
      <div className="flex gap-2 pt-4 border-t border-border">
        <div className="flex-1 h-12 bg-[#222] rounded-xl" />
        <div className="w-24 h-12 bg-[#222] rounded-xl" />
      </div>
    </div>
  </div>
);

const RideListSkeleton = () => (
  <div className="divide-y divide-border border-y border-border">
    {[1, 2, 3].map(i => (
      <div key={i} className="py-5 sm:py-6 px-2 sm:px-4 flex flex-col md:flex-row gap-5 items-center animate-pulse">
        <div className="w-full md:w-52 lg:w-60 h-36 bg-[#222] rounded-xl shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="w-1/2 h-5 bg-[#222] rounded" />
          <div className="w-1/3 h-3 bg-[#222] rounded" />
          <div className="w-2/3 h-3 bg-[#222] rounded" />
          <div className="flex gap-2 pt-2">
            <div className="w-24 h-7 bg-[#222] rounded-lg" />
            <div className="w-24 h-7 bg-[#222] rounded-lg" />
            <div className="w-24 h-7 bg-[#222] rounded-lg" />
          </div>
        </div>
        <div className="w-full md:w-[170px] shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-6 self-stretch flex items-center justify-center">
          <div className="w-full h-11 bg-[#222] rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const Ride: React.FC<RideProps> = ({ clubId }) => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid");
  const [savedRideIds, setSavedRideIds] = useState<Set<number>>(new Set());
  const [shareTarget, setShareTarget] = useState<RideItem | null>(null);

  const activeClubId = clubId ? parseInt(clubId.toString()) : undefined;

  const { data: publicRawData, isLoading: isLoadingPublic, isFetching: isFetchingPublic } = useGetPublicRidesQuery(
    { search: searchQuery || undefined, limit: 50, offset: 0, clubId: activeClubId },
    { skip: !!activeClubId, refetchOnMountOrArgChange: true } 
  );

  const { data: clubRawData, isLoading: isLoadingClub, isFetching: isFetchingClub } = useGetClubRidesQuery(
    { search: searchQuery || undefined, limit: 50, offset: 0, clubId: activeClubId! },
    { skip: !activeClubId, refetchOnMountOrArgChange: true } 
  );

  const rawData = activeClubId ? clubRawData : publicRawData;
  const isLoading = activeClubId ? isLoadingClub : isLoadingPublic;
  const isFetching = activeClubId ? isFetchingClub : isFetchingPublic;

  useEffect(() => {
    console.log("🚴‍♂️ [Ride.tsx] Rendered! Query State:", { isLoading, isFetching, data: rawData });
  }, [isLoading, isFetching, rawData]);

  const [saveRide] = useSaveRideMutation();
  const [unsaveRide] = useUnsaveRideMutation();

  const handleToggleSave = async (rideId: number) => {
    try {
      if (savedRideIds.has(rideId)) {
        await unsaveRide({ rideId }).unwrap();
        setSavedRideIds(prev => { const next = new Set(prev); next.delete(rideId); return next; });
        toast.success("Ride removed from saved list");
      } else {
        await saveRide({ rideId }).unwrap();
        setSavedRideIds(prev => new Set(prev).add(rideId));
        toast.success("Ride saved!");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle save.");
    }
  };

  const handleOpenShare = (ride: RideItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShareTarget(ride);
  };

  const handleAddToCalendar = (ride: RideItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const gcalUrl = buildGoogleCalendarUrl({
      id: ride.id,
      title: ride.title,
      date: ride.date,
      time: ride.time,
      location: ride.location,
      description: ride.description,
      clubName: ride.clubName,
      distance: ride.distance,
      speed: ride.speed,
      rideType: ride.rideType,
      url: `${window.location.origin}/view/userside/dashboard/ride/${ride.id}`
    });
    window.open(gcalUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening Google Calendar to add event...");
  };

  const handleDownloadGpx = (ride: RideItem, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadGpxFile({
      id: ride.id,
      title: ride.title,
      clubName: ride.clubName,
      location: ride.location,
      date: ride.date,
      rideType: ride.rideType,
      gpxFile: ride.gpxFile
    });
  };

  const rides = useMemo<RideItem[]>(() => {
    const items = rawData?.response?.data || rawData?.data || rawData?.rows || rawData || [];
    if (!Array.isArray(items)) return [];
    return items.map((item: any) => {
      let displayDistance = "N/A";
      if (item.distance !== undefined && item.distance !== null) {
        displayDistance = `${item.distance} ${item.distanceUnit || "km"}`;
      }
      let displaySpeed = "N/A";
      if (item.pace !== undefined && item.pace !== null) {
        displaySpeed = `${item.pace} min/km`;
      } else if (item.speed || item.averageSpeed) {
        displaySpeed = item.speed || item.averageSpeed;
      }
      let organizerAvatar = null;
      if (item.user?.profileImage) {
        const avatarPath = item.user.profileImage;
        organizerAvatar = (avatarPath.startsWith("http://") || avatarPath.startsWith("https://") || avatarPath.startsWith("/"))
          ? avatarPath
          : `https://api.ridewithpals.com/uploads/${avatarPath}`;
      } else if (item.organizer?.avatar) {
        const avatarPath = item.organizer.avatar;
        organizerAvatar = (avatarPath.startsWith("http://") || avatarPath.startsWith("https://") || avatarPath.startsWith("/"))
          ? avatarPath
          : `https://api.ridewithpals.com/uploads/${avatarPath}`;
      }
      const organizerName = item.user?.fullName || item.organizer?.name || item.organizerName || "Organizer";
      let bannerImage = "/Images/CycleImage2.png";
      const logoPath = item.club?.logo || item.club?.coverImage || item.logo || item.coverImage;
      if (logoPath && logoPath !== "null" && logoPath.trim() !== "") {
        bannerImage = (logoPath.startsWith("http://") || logoPath.startsWith("https://") || logoPath.startsWith("/"))
          ? logoPath
          : `https://api.ridewithpals.com/uploads/${logoPath}`;
      }
      const isPaymentRequired = Boolean(
        item.isPaymentRequired === true ||
        item.isPaid === true ||
        (item.price && Number(item.price) > 0)
      );
      const priceNum = Number(item.price || 0);
      const cur = item.currency?.toString().toUpperCase();
      const symbol = cur === 'USD' || cur === '$' ? '$' : '€';
      const priceFormatted = priceNum > 0 
        ? `${symbol}${priceNum.toFixed(priceNum % 1 === 0 ? 0 : 2)}` 
        : (isPaymentRequired ? 'Paid' : '');

      return {
        id: item.id || item.rideId,
        title: item.rideName || item.ridename || item.title || item.name || item.activityName || "Ride Event",
        clubName: item.club?.clubName || item.clubName || "Independent",
        date: item.date || item.startDate || "TBD",
        time: item.time || (typeof item.date === "string" && item.date.includes("T") ? item.date.split("T")[1]?.substring(0, 5) : undefined),
        location: item.meetingPoint || item.location || "TBD",
        rideType: getRideSportType(item),
        speed: displaySpeed,
        distance: displayDistance,
        participants: item.joinedParticipantsCount?.toString() || (Array.isArray(item.joinedParticipants) ? item.joinedParticipants.length.toString() : "0"),
        organizer: organizerName,
        organizerAvatar: organizerAvatar,
        isRideJoined: item.isRideJoined !== undefined ? item.isRideJoined : false,
        isSaved: savedRideIds.has(item.id || item.rideId),
        image: bannerImage,
        isPublic: item.isPublicRide !== undefined ? item.isPublicRide : (item.isPublic !== undefined ? item.isPublic : true),
        gpxFile: item.gpxFile || null,
        description: item.description || "",
        terrainBadges: extractTerrainAndCategoryBadges(item),
        isPaymentRequired,
        price: priceNum,
        priceFormatted,
      };
    });
  }, [rawData, savedRideIds]);

  const activityTypes = useMemo(() => {
    const defaultTypes = ["All", "Cycling", "Running", "Triathlon", "Swimming"];
    const dynamicSet = new Set<string>(defaultTypes);
    rides.forEach(r => {
      if (r.rideType && r.rideType !== "All") {
        dynamicSet.add(r.rideType);
      }
    });
    return Array.from(dynamicSet);
  }, [rides]);

  const filteredRides = rides.filter(ride => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      ride.title.toLowerCase().includes(query) || 
      ride.clubName.toLowerCase().includes(query) ||
      ride.location.toLowerCase().includes(query);
    const matchesType = selectedType === "All" || ride.rideType === selectedType;
    return matchesSearch && matchesType;
  });

  const handleJoinRide = (id: number | string) => {
    navigate(`/view/userside/dashboard/ride/${id}`);
  };

  // --- MAP VIEW: TAKES PAGE AREA WITH OVERFLOW HIDDEN ---
  if (viewMode === "map") {
    return (
      <div className="w-full h-[calc(100vh-80px)] overflow-hidden relative">
        <ActivityMapView
          rides={filteredRides}
          user={user}
          selectedType={selectedType}
          onTypeChange={(type) => setSelectedType(type)}
          onViewModeChange={(mode) => setViewMode(mode)}
          onSelectRide={(id) => handleJoinRide(id)}
          onShare={(rideItem) => setShareTarget(rideItem as unknown as RideItem)}
        />
        {shareTarget && (
          <UniversalShareModal
            isOpen={!!shareTarget}
            onClose={() => setShareTarget(null)}
            title={shareTarget.title}
            description={`Join ${shareTarget.title} hosted by ${shareTarget.clubName}!`}
            url={`${window.location.origin}/view/userside/dashboard/ride/${shareTarget.id}`}
            image={shareTarget.image}
            category="Activity"
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-main px-3 sm:px-6 lg:px-8 py-4 sm:py-8 font-sans select-none w-full flex justify-center">
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase text-text-main">
                Upcoming Activities
              </h1>
              <p className="text-text-muted font-medium text-xs sm:text-sm">
                Discover and join scheduled group activities in your region.
              </p>
            </div>
          </div>

          {/* Modern Dividing Line */}
          <div className="relative w-full">
            <div className="h-px w-full bg-border/60" />
            <div className="absolute left-0 top-0 h-px w-24 bg-[#EB712B]" />
          </div>
        </div>

        {/* Functional Search & Filters Toolbar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-main-bg border border-border p-3.5 sm:p-4 rounded-2xl">
          <div className="relative w-full lg:w-[420px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Search by activity title, club, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border pl-12 pr-4 py-3 rounded-xl text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Right Controls: Filters & View Mode Toggle */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-3 w-full lg:w-auto">
            {/* Ride Type Filters */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <Filter size={16} className="text-text-muted shrink-0 hidden md:block" />
              {activityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                    selectedType === type 
                      ? "bg-[#EB712B] border-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]" 
                      : "bg-surface border-border text-text-muted hover:text-text-main hover:border-text-muted"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 shrink-0">
              <button 
                type="button"
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all border-0 outline-none ${
                  viewMode === "grid" ? "bg-white/10 text-text-main shadow-xs" : "text-text-muted hover:text-text-main bg-transparent"
                }`}
                title="Grid View"
              >
                <Grid3X3 size={16} />
              </button>
              <button 
                type="button"
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all border-0 outline-none ${
                  viewMode === "list" ? "bg-white/10 text-text-main shadow-xs" : "text-text-muted hover:text-text-main bg-transparent"
                }`}
                title="List View"
              >
                <List size={16} />
              </button>
              <button 
                type="button"
                onClick={() => setViewMode("map")}
                className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all border-0 outline-none ${
                  (viewMode as string) === "map" ? "bg-[#EB712B] text-white shadow-xs" : "text-text-muted hover:text-text-main bg-transparent"
                }`}
                title="Map View"
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          viewMode === "list" ? (
            <RideListSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <RideCardSkeleton />
              <RideCardSkeleton />
              <RideCardSkeleton />
            </div>
          )
        ) : filteredRides.length > 0 ? (
          viewMode === "list" ? (
            /* MODERN BLENDED LIST VIEW (Divided by horizontal line, zero card borders) */
            <div className="divide-y divide-border border-y border-border">
              {filteredRides.map((ride) => (
                <div 
                  key={ride.id}
                  className="py-5 sm:py-6 flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between transition-colors hover:bg-surface/20 px-2 sm:px-4 group"
                >
                  {/* Left: Thumbnail & Banner */}
                  <div className="relative w-full md:w-52 lg:w-60 h-40 md:h-32 rounded-xl overflow-hidden shrink-0 border border-border/70">
                    <img 
                      src={ride.image} 
                      alt={ride.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-main-bg/80 via-transparent to-transparent" />
                    
                    {/* Primary Surface Badge (Road or Trail) on top-left */}
                    {ride.terrainBadges && ride.terrainBadges[0] && (
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span 
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider backdrop-blur-md border ${
                            ride.terrainBadges[0] === "Road" 
                              ? "bg-sky-950/85 border-sky-500/40 text-sky-300"
                              : ride.terrainBadges[0] === "Trail" 
                              ? "bg-emerald-950/85 border-emerald-500/40 text-emerald-300"
                              : "bg-amber-950/85 border-amber-500/40 text-amber-300"
                          }`}
                        >
                          {ride.terrainBadges[0]}
                        </span>
                      </div>
                    )}

                    {/* Category Badge & Paid Badge on top-right */}
                    <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
                      {ride.isPaymentRequired && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 backdrop-blur-md">
                          {ride.priceFormatted || "Paid"}
                        </span>
                      )}
                      {ride.terrainBadges && ride.terrainBadges[1] && (
                        <span 
                          className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider backdrop-blur-md border ${
                            ride.terrainBadges[1] === "Social" 
                              ? "bg-indigo-950/85 border-indigo-500/40 text-indigo-300"
                              : ride.terrainBadges[1] === "Race" 
                              ? "bg-rose-950/85 border-rose-500/40 text-rose-300"
                              : "bg-purple-950/85 border-purple-500/40 text-purple-300"
                          }`}
                        >
                          {ride.terrainBadges[1]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Center: Details & Metadata */}
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg tracking-tight text-text-main group-hover:text-[#EB712B] transition-colors truncate">
                          {ride.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] shrink-0" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted shrink-0">Club</span>
                          <span className="font-semibold text-xs text-text-main hover:text-[#EB712B] transition-colors truncate">
                            {ride.clubName}
                          </span>
                        </div>
                      </div>

                      {/* Mobile action buttons row */}
                      <div className="flex items-center gap-1 shrink-0 md:hidden">
                        <button
                          type="button"
                          onClick={(e) => handleAddToCalendar(ride, e)}
                          className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-text-main"
                          title="Add to Google Calendar"
                        >
                          <GoogleCalendarIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDownloadGpx(ride, e)}
                          className="px-1.5 py-1 rounded-lg bg-surface border border-border text-emerald-500 flex items-center gap-0.5 text-[8px] font-bold"
                          title="Download GPX Route"
                        >
                          <Download size={11} /> GPX
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenShare(ride, e)}
                          className="p-1.5 rounded-lg bg-surface border border-border text-text-muted hover:text-[#EB712B]"
                          title="Share Activity"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(ride.id);
                          }}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            ride.isSaved
                              ? "bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]"
                              : "bg-surface border-border text-text-muted hover:text-text-main"
                          }`}
                          title={ride.isSaved ? "Saved" : "Save activity"}
                        >
                          <Bookmark size={13} fill={ride.isSaved ? "#EB712B" : "none"} />
                        </button>
                      </div>
                    </div>

                    {/* Info Chips */}
                    <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0">
                          <Calendar size={11} className="text-[#EB712B]" />
                        </div>
                        <span className="font-medium text-text-main">{ride.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 max-w-[280px]">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0">
                          <MapPin size={11} className="text-[#EB712B]" />
                        </div>
                        <span className="font-medium text-text-main truncate" title={ride.location}>{ride.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0">
                          <Bike size={11} className="text-[#EB712B]" />
                        </div>
                        <span className="font-medium text-text-main">
                          Sport: <span className="text-[#EB712B] font-bold">{ride.rideType}</span>
                        </span>
                      </div>
                    </div>

                    {/* Telemetry Metrics Row */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="bg-surface/60 px-3 py-1.5 rounded-lg border border-border/70 flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-text-muted">Speed</span>
                        <span className="text-xs font-black text-text-main">{ride.speed}</span>
                      </div>
                      <div className="bg-surface/60 px-3 py-1.5 rounded-lg border border-border/70 flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-text-muted">Distance</span>
                        <span className="text-xs font-black text-text-main">{ride.distance}</span>
                      </div>
                      <div className="bg-surface/60 px-3 py-1.5 rounded-lg border border-border/70 flex items-center gap-2">
                        <span className="text-[9px] uppercase font-bold text-text-muted">Participants</span>
                        <span className="text-xs font-black text-text-main">{ride.participants}</span>
                      </div>
                      
                      {/* Organizer */}
                      <div className="flex items-center gap-2 bg-surface/60 pl-1 pr-3 py-1 rounded-lg border border-border/70 ml-auto">
                        {ride.organizerAvatar ? (
                          <img 
                            src={ride.organizerAvatar} 
                            alt={ride.organizer} 
                            className="w-6 h-6 rounded-full object-cover shrink-0 border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackNode = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                              if (fallbackNode) fallbackNode.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-6 h-6 rounded-full bg-main-bg border border-border flex items-center justify-center font-bold text-[8px] text-text-muted shrink-0 uppercase"
                          style={{ display: ride.organizerAvatar ? 'none' : 'flex' }}
                        >
                          {(ride.organizer || "Organizer").split(" ").map((n: string) => n[0] || "").join("").substring(0, 2)}
                        </div>
                        <div className="flex flex-col overflow-hidden max-w-[100px]">
                          <span className="text-[7px] uppercase font-extrabold text-text-muted tracking-wider">Organizer</span>
                          <span className="text-[10px] font-bold text-text-main truncate leading-tight">{ride.organizer}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Buttons & Join Button (Desktop) */}
                  <div className="flex items-center md:flex-col justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border md:pl-6 min-w-[190px] self-stretch">
                    {/* Desktop utility toolbar */}
                    <div className="hidden md:flex items-center gap-1.5 self-end">
                      <button
                        type="button"
                        onClick={(e) => handleAddToCalendar(ride, e)}
                        className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#4285F4]/40 hover:bg-[#4285F4]/10 transition-all cursor-pointer shadow-sm group/btn"
                        title="Add to Google Calendar"
                        aria-label="Add to Google Calendar"
                      >
                        <GoogleCalendarIcon size={15} className="group-hover/btn:scale-110 transition-transform" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownloadGpx(ride, e)}
                        className="px-2 py-1.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all cursor-pointer shadow-sm flex items-center gap-1 group/btn"
                        title="Download GPX Route"
                        aria-label="Download GPX Route"
                      >
                        <Download size={13} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                        <span className="text-[9px] font-black text-emerald-500 tracking-wider">GPX</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenShare(ride, e)}
                        className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#EB712B]/40 hover:bg-[#EB712B]/10 transition-all cursor-pointer shadow-sm group/btn"
                        title="Share Activity"
                        aria-label="Share Activity"
                      >
                        <Share2 size={14} className="group-hover/btn:text-[#EB712B] group-hover/btn:scale-110 transition-all" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(ride.id);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          ride.isSaved
                            ? "bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]"
                            : "bg-surface border-border text-text-muted hover:text-text-main hover:border-text-muted"
                        }`}
                        title={ride.isSaved ? "Saved" : "Save activity"}
                        aria-label="Save activity"
                      >
                        <Bookmark size={15} fill={ride.isSaved ? "#EB712B" : "none"} />
                      </button>
                    </div>

                    <button 
                      onClick={() => handleJoinRide(ride.id)}
                      className={`w-full py-3 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-white border-0 outline-none ${
                        ride.isRideJoined 
                          ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.2)]" 
                          : "bg-[#EB712B] hover:bg-[#d66525] shadow-[0_4px_15px_rgba(235,113,43,0.2)]"
                      }`}
                    >
                      {ride.isRideJoined ? (
                        <>
                          Joined <CheckCircle2 size={14} />
                        </>
                      ) : ride.isPaymentRequired ? (
                        <>
                          Pay & Join {ride.priceFormatted ? `(${ride.priceFormatted})` : ''} <CreditCard size={14} />
                        </>
                      ) : (
                        <>
                          Join Activity <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* MODERN GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRides.map((ride) => (
                <div 
                  key={ride.id} 
                  className="bg-main-bg border border-border rounded-2xl flex flex-col justify-between hover:border-[#EB712B]/40 transition-all group relative overflow-hidden shadow-2xl"
                >
                  {/* Background accent glow on hover */}
                  <div className="absolute top-48 right-0 w-40 h-40 bg-[#EB712B]/5 rounded-full blur-3xl group-hover:bg-[#EB712B]/10 transition-all duration-500 pointer-events-none" />

                  {/* Banner Image */}
                  <div className="relative h-44 w-full overflow-hidden border-b border-border shrink-0">
                    <img 
                      src={ride.image } 
                      alt={ride.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-main-bg via-transparent to-transparent opacity-65" />
                    
                    {/* Primary Surface Badge (Road or Trail) on top-left */}
                    {ride.terrainBadges && ride.terrainBadges[0] && (
                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span 
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${
                            ride.terrainBadges[0] === "Road" 
                              ? "bg-sky-950/80 border-sky-500/40 text-sky-300"
                              : ride.terrainBadges[0] === "Trail" 
                              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                              : "bg-amber-950/80 border-amber-500/40 text-amber-300"
                          }`}
                        >
                          {ride.terrainBadges[0]}
                        </span>
                      </div>
                    )}

                    {/* Category Badge & Paid Badge on top-right */}
                    <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
                      {ride.isPaymentRequired && (
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-emerald-950/85 border border-emerald-500/40 text-emerald-300">
                          {ride.priceFormatted || "Paid"}
                        </span>
                      )}
                      {ride.terrainBadges && ride.terrainBadges[1] && (
                        <span 
                          className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-md border ${
                            ride.terrainBadges[1] === "Social" 
                              ? "bg-indigo-950/80 border-indigo-500/40 text-indigo-300"
                              : ride.terrainBadges[1] === "Race" 
                              ? "bg-rose-950/80 border-rose-500/40 text-rose-300"
                              : "bg-purple-950/80 border-purple-500/40 text-purple-300"
                          }`}
                        >
                          {ride.terrainBadges[1]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card content with padding */}
                  <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                    {/* Card Header */}
                    <div className="space-y-3 z-10">
                      {/* Activity Title & Club Name (Full Width Prominence) */}
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-lg sm:text-xl tracking-tight text-text-main group-hover:text-[#EB712B] transition-colors truncate" title={ride.title}>
                          {ride.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-text-muted">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] shrink-0" />
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted shrink-0">Club</span>
                          <span className="font-bold text-xs text-text-main hover:text-[#EB712B] transition-colors truncate" title={ride.clubName}>
                            {ride.clubName}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Utility Bar: Google Calendar, Download GPX, Share, Bookmark */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {/* Google Calendar */}
                        <button
                          type="button"
                          onClick={(e) => handleAddToCalendar(ride, e)}
                          className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#4285F4]/40 hover:bg-[#4285F4]/10 transition-all cursor-pointer shadow-sm group/btn"
                          title="Add to Google Calendar"
                          aria-label="Add to Google Calendar"
                        >
                          <GoogleCalendarIcon size={16} className="group-hover/btn:scale-110 transition-transform" />
                        </button>

                        {/* Download GPX */}
                        <button
                          type="button"
                          onClick={(e) => handleDownloadGpx(ride, e)}
                          className="px-2.5 py-1.5 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all cursor-pointer shadow-sm flex items-center gap-1 group/btn"
                          title="Download GPX Route"
                          aria-label="Download GPX Route"
                        >
                          <Download size={13} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                          <span className="text-[9px] font-black text-emerald-500 tracking-wider">GPX</span>
                        </button>

                        {/* Universal Share */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenShare(ride, e)}
                          className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#EB712B]/40 hover:bg-[#EB712B]/10 transition-all cursor-pointer shadow-sm group/btn"
                          title="Share Activity"
                          aria-label="Share Activity"
                        >
                          <Share2 size={15} className="group-hover/btn:text-[#EB712B] group-hover/btn:scale-110 transition-all" />
                        </button>

                        {/* Bookmark */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(ride.id);
                          }}
                          className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
                            ride.isSaved
                              ? "bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]"
                              : "bg-surface border-border text-text-muted hover:text-text-main hover:border-text-muted"
                          }`}
                          title={ride.isSaved ? "Saved" : "Save activity"}
                          aria-label="Save activity"
                        >
                          <Bookmark size={15} fill={ride.isSaved ? "#EB712B" : "none"} />
                        </button>
                      </div>
                    </div>

                      {/* Info Rows */}
                      <div className="space-y-2.5 bg-surface p-4 rounded-xl border border-border">
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0">
                            <Calendar size={13} className="text-[#EB712B]" />
                          </div>
                          <span className="font-medium truncate text-xs text-text-main">{ride.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0">
                            <MapPin size={13} className="text-[#EB712B]" />
                          </div>
                          <span className="font-medium truncate text-[11px] leading-relaxed text-text-main">{ride.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-text-muted">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0">
                            <Bike size={13} className="text-[#EB712B]" />
                          </div>
                          <span className="font-medium text-xs text-text-main">
                            Sport Type: <span className="text-[#EB712B] font-bold">{ride.rideType}</span>
                          </span>
                        </div>
                      </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 py-2 z-10">
                      <div className="bg-surface p-3 rounded-xl border border-border text-center flex flex-col items-center justify-center">
                        <span className="text-xs font-extrabold text-text-main tracking-tight whitespace-nowrap">{ride.speed}</span>
                        <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold mt-1.5">Speed</span>
                      </div>
                      <div className="bg-surface p-3 rounded-xl border border-border text-center flex flex-col items-center justify-center">
                        <span className="text-xs font-extrabold text-text-main tracking-tight whitespace-nowrap">{ride.distance}</span>
                        <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold mt-1.5">Distance</span>
                      </div>
                      <div className="bg-surface p-3 rounded-xl border border-border text-center flex flex-col items-center justify-center">
                        <span className="text-xs font-extrabold text-text-main tracking-tight whitespace-nowrap">{ride.participants}</span>
                        <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold mt-1.5">Participants</span>
                      </div>
                    </div>

                    {/* Action/Footer Panel */}
                    <div className="flex items-center justify-between gap-2 border-t border-border pt-4 z-10">
                      <button 
                        onClick={() => handleJoinRide(ride.id)}
                        className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer text-white ${
                          ride.isRideJoined 
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_15px_rgba(16,185,129,0.2)]" 
                            : "bg-[#EB712B] hover:bg-[#d66525] shadow-[0_4px_15px_rgba(235,113,43,0.2)]"
                        }`}
                      >
                        {ride.isRideJoined ? (
                          <>
                            Joined <CheckCircle2 size={14} />
                          </>
                        ) : ride.isPaymentRequired ? (
                          <>
                            Pay & Join {ride.priceFormatted ? `(${ride.priceFormatted})` : ''} <CreditCard size={14} />
                          </>
                        ) : (
                          <>
                            Click to Join Activity <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                      <div className="flex items-center gap-2 bg-surface pl-1 pr-3 py-1 rounded-xl border border-border shrink-0 max-w-[120px]">
                        {ride.organizerAvatar ? (
                          <img 
                            src={ride.organizerAvatar} 
                            alt={ride.organizer} 
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const fallbackNode = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                              if (fallbackNode) fallbackNode.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-7 h-7 rounded-full bg-main-bg border border-border flex items-center justify-center font-bold text-[9px] text-text-muted shrink-0 uppercase"
                          style={{ display: ride.organizerAvatar ? 'none' : 'flex' }}
                        >
                          {(ride.organizer || "Organizer").split(" ").map((n: string) => n[0] || "").join("").substring(0, 2)}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[7px] uppercase font-extrabold text-text-muted tracking-wider">Organizer</span>
                          <span className="text-[10px] font-bold text-text-main truncate leading-tight">{ride.organizer}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Empty State Display */
          <div className="flex flex-col items-center justify-center bg-main-bg border border-border rounded-3xl p-16 text-center shadow-2xl">
            <Compass size={48} className="text-text-muted animate-pulse mb-4" />
            <h3 className="font-extrabold text-lg text-text-main tracking-tight">No activities found</h3>
            <p className="text-text-muted text-xs mt-1 max-w-sm">
              We couldn't find any activities matching your search filters. Try resetting or adjusting your search parameters.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedType("All"); }}
              className="mt-6 px-6 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-text-main hover:bg-hover transition-all cursor-pointer"
            >
              Clear Search & Filters
            </button>
          </div>
        )}

        {/* Universal Share Modal */}
        {shareTarget && (
          <UniversalShareModal
            isOpen={!!shareTarget}
            onClose={() => setShareTarget(null)}
            title={shareTarget.title}
            description={`Join ${shareTarget.title} hosted by ${shareTarget.clubName}!`}
            url={`${window.location.origin}/view/userside/dashboard/ride/${shareTarget.id}`}
            image={shareTarget.image}
            category="Activity"
          />
        )}
      </div>
    </div>
  );
};

export default Ride;