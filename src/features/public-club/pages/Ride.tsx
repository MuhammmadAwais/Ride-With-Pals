import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Bike,   
  Flame,
  ArrowRight,
  Search,
  Filter,
  X,
  Compass,
  CheckCircle2,
  Bookmark
} from "lucide-react";

import { useGetPublicRidesQuery } from "@/features/club/api/clubApiSlice";
import { useSaveRideMutation, useUnsaveRideMutation } from "@/features/club/api/savedRidesApiSlice";
import { toast } from "sonner";

interface RideItem {
  id: number;
  title: string;
  clubName: string;
  date: string;
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
}

interface RideProps {
  clubId?: string | number;
}

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

const Ride: React.FC<RideProps> = ({ clubId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [savedRideIds, setSavedRideIds] = useState<Set<number>>(new Set());

  const activeClubId = clubId ? parseInt(clubId.toString()) : undefined;

  const { data: rawData, isLoading } = useGetPublicRidesQuery(
    { search: '', limit: 50, offset: 0, clubId: activeClubId },
  );

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

  const rides = useMemo<RideItem[]>(() => {
    const items = rawData?.response?.data || rawData?.data || rawData || [];
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
      return {
        id: item.id || item.rideId,
        title: item.ridename || item.title || item.name || "Ride Event",
        clubName: item.club?.clubName || item.clubName || "Independent",
        date: item.date || item.startDate || "TBD",
        location: item.meetingPoint || item.location || "TBD",
        rideType: item.sportSubTypeName || item.activityTypeName || item.type || item.rideType || "Road",
        speed: displaySpeed,
        distance: displayDistance,
        participants: item.joinedParticipantsCount?.toString() || (Array.isArray(item.joinedParticipants) ? item.joinedParticipants.length.toString() : "0"),
        organizer: organizerName,
        organizerAvatar: organizerAvatar,
        isRideJoined: item.isRideJoined !== undefined ? item.isRideJoined : false,
        isSaved: savedRideIds.has(item.id || item.rideId),
        image: bannerImage
      };
    });
  }, [rawData, savedRideIds]);

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

  return (
    <div className="min-h-screen text-text-main p-6 md:p-10 font-sans select-none w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8 mb-4">
          <div className="space-y-2.5 relative">
            <div className="absolute -left-10 top-0 w-20 h-20 bg-[#EB712B]/10 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-text-main via-text-main to-text-muted bg-clip-text text-transparent">
              Upcoming Rides
            </h1>
            <p className="text-text-muted font-medium text-sm max-w-xl">
              Discover and join elite scheduled cycling group rides in your region.
            </p>
          </div>
        </div>

        {/* Functional Search & Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-main-bg border border-border p-4 rounded-2xl">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Search by ride title, club, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border pl-12 pr-4 py-3.5 rounded-xl text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
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

          {/* Ride Type Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter size={16} className="text-text-muted shrink-0 hidden md:block" />
            {["All", "Road", "Gravel", "MTB", "Criterium"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                  selectedType === type 
                    ? "bg-[#EB712B] border-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]" 
                    : "bg-surface border-border text-text-muted hover:text-text-main hover:border-text-muted"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RideCardSkeleton />
            <RideCardSkeleton />
            <RideCardSkeleton />
          </div>
        ) : filteredRides.length > 0 ? (
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
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-surface/85 backdrop-blur-md border border-border px-2.5 py-1 rounded-lg shrink-0">
                    <Flame size={12} className="text-[#EB712B]" />
                    <span className="text-[9px] font-extrabold uppercase text-[#EB712B] tracking-wider">Elite</span>
                  </div>
                </div>

                {/* Card content with padding */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  {/* Card Header */}
                  <div className="space-y-4 z-10">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg tracking-tight text-text-main group-hover:text-[#EB712B] transition-colors line-clamp-1">
                          {ride.title}
                        </h3>
                        <p className="text-[10px] uppercase font-extrabold text-text-muted tracking-wider mt-0.5">
                          Club Name: <span className="text-text-main font-semibold">{ride.clubName}</span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSave(ride.id);
                        }}
                        className={`p-2 rounded-xl border transition-all cursor-pointer ${
                          ride.isSaved
                            ? "bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]"
                            : "bg-surface border-border text-text-muted hover:text-text-main"
                        }`}
                      >
                        <Bookmark size={15} fill={ride.isSaved ? "#EB712B" : "none"} />
                      </button>
                    </div>

                    {/* Info Rows */}
                    <div className="space-y-2.5 bg-surface p-4 rounded-xl border border-border">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <Calendar size={15} className="text-text-muted shrink-0" />
                        <span className="font-medium truncate text-xs text-text-main">{ride.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <MapPin size={15} className="text-text-muted shrink-0" />
                        <span className="font-medium truncate text-[11px] leading-relaxed text-text-main">{ride.location}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <Bike size={15} className="text-text-muted shrink-0" />
                        <span className="font-medium text-xs text-text-main">
                          Ride Type: <span className="text-[#EB712B] font-bold">{ride.rideType}</span>
                        </span>
                      </div>
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
                      ) : (
                        <>
                          Click to Join Ride <ArrowRight size={14} />
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
        ) : (
          /* Empty State Display */
          <div className="flex flex-col items-center justify-center bg-main-bg border border-border rounded-3xl p-16 text-center shadow-2xl">
            <Compass size={48} className="text-text-muted animate-pulse mb-4" />
            <h3 className="font-extrabold text-lg text-text-main tracking-tight">No rides found</h3>
            <p className="text-text-muted text-xs mt-1 max-w-sm">
              We couldn't find any elite cycling events matching your search filters. Try resetting or adjusting your search parameters.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedType("All"); }}
              className="mt-6 px-6 py-2.5 bg-surface border border-border rounded-xl text-xs font-bold text-text-main hover:bg-hover transition-all cursor-pointer"
            >
              Clear Search & Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Ride;