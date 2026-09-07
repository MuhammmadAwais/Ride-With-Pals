/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Globe, Lock, MapPin, Users, ShieldCheck, Bike, Activity, Trophy, Filter, X, Map as MapIcon } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setUser } from "@/features/auth/slices/authSlice";
import { fetchMyClubs, fetchExploreClubs, fetchJoinedClubs } from "@/features/club/slices/clubSlice";
import { useActiveClub } from "@/hooks/useActiveClub";
import { ClubMapView } from "../components/ClubMapView";
import { useGetClubMembersListQuery } from "@/features/club/api/clubApiSlice";
import { extractMembersList } from "./ClubDetails";

const getClubTypeName = (typeId?: number | string) => {
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

const renderSportBadge = (typeId?: number | string) => {
  const t = getClubTypeName(typeId);
  if (t === "Running") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-400 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
        <Activity size={11} className="shrink-0" /> Running
      </span>
    );
  }
  if (t === "Triathlon") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-purple-300 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
        <Trophy size={11} className="shrink-0" /> Triathlon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#ff8c42] border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
      <Bike size={11} className="shrink-0" /> Cycling
    </span>
  );
};

const getClubImage = (logo?: string | null, coverImage?: string | null): string => {
  const img = logo || coverImage;
  if (!img || img === "null" || img.trim() === "") {
    return "/Images/CycleImage2.png";
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:") || img.startsWith("/")) {
    return img;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

const getMemberCount = (club: any) => {
  if (!club) return 0;

  // Prioritize live approved members array if present
  const list =
    club.clubMembers ||
    club.ClubMembers ||
    club.club_members ||
    club.members ||
    club.Members ||
    club.user_clubs ||
    club.userClubs ||
    club.UserClubs ||
    club.participants ||
    club.Participants;

  if (Array.isArray(list) && list.length > 0) {
    return list.length;
  }

  const val =
    club._count?.user_clubs ??
    club._count?.members ??
    club._count?.users ??
    club.membersCount ??
    club.members_count ??
    club.memberCount ??
    club.member_count ??
    club.participantCount ??
    club.participant_count ??
    club.totalMembers ??
    club.total_members ??
    club.userCount ??
    club.user_count ??
    club.count ??
    club.total;

  const count = Number(val);
  if (!isNaN(count) && count > 0) return count;
  return 0;
};

const ClubMemberCountText: React.FC<{ club: any; className?: string; as?: "span" | "p" }> = ({ 
  club, 
  className,
  as = "span" 
}) => {
  const clubId = club?.id || club?.clubId;
  const { data: membersData } = useGetClubMembersListQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const count = React.useMemo(() => {
    if (membersData !== undefined && membersData !== null) {
      const list = extractMembersList(membersData);
      return list.length;
    }
    const fromClub = extractMembersList(
      club?.clubMembers || club?.members || club?.user_clubs || club?.participants
    );
    if (fromClub.length > 0) return fromClub.length;
    return getMemberCount(club);
  }, [membersData, club]);

  const text = `${count} Pals joined`;

  if (as === "p") {
    return <p className={className}>{text}</p>;
  }
  return <span className={className}>{text}</span>;
};

const isClubOwned = (club: any, user: any, myClubs: any[]) => {
  if (!club) return false;
  if (club.isOwner === true || club.owned === true || club.isManaged === true) return true;
  if (user?.id && (club.ownerId === user.id || club.userId === user.id || club.owner_id === user.id)) return true;
  if (myClubs && myClubs.some(c => (c.id === club.id || (c as any).clubId === club.id || c.id === (club as any).clubId))) return true;
  return false;
};

export default function UserClub() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { myClubs, joinedClubs, exploreClubs } = useAppSelector((s) => s.club);
  const { setActiveClub } = useActiveClub();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "map">("grid");
  const [myClubsViewMode, setMyClubsViewMode] = useState<"list" | "grid" | "map">("grid");
  const [mapFilterType, setMapFilterType] = useState<"all" | "my">("all");

  // Mobile-matched Filter State
  const [clubTypeFilter, setClubTypeFilter] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  const [sportTypeFilter, setSportTypeFilter] = useState<"ALL" | "CYCLING" | "RUNNING" | "TRIATHLON">("ALL");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempClubType, setTempClubType] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");
  const [tempSportType, setTempSportType] = useState<"ALL" | "CYCLING" | "RUNNING" | "TRIATHLON">("ALL");

  React.useEffect(() => {
    dispatch(fetchMyClubs());
    dispatch(fetchJoinedClubs());
    dispatch(fetchExploreClubs());
  }, [dispatch]);

  const combinedMyClubs = React.useMemo(() => {
    const map = new Map();
    myClubs.forEach((c) => map.set(c.id, { ...c, isManaged: true }));
    (joinedClubs || []).forEach((c) => {
      if (!map.has(c.id)) {
        map.set(c.id, { ...c, isManaged: false });
      }
    });
    return Array.from(map.values());
  }, [myClubs, joinedClubs]);

  const filterClub = (club: any) => {
    // 1. Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = club.clubName?.toLowerCase().includes(q);
      const matchLoc = club.location?.toLowerCase().includes(q);
      const matchType = getClubTypeName(club.clubTypeId)?.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchType) return false;
    }

    // 2. Club Type Filter (PUBLIC = 1, PRIVATE != 1)
    if (clubTypeFilter === "PUBLIC") {
      if (club.clubPrivacyId !== 1) return false;
    } else if (clubTypeFilter === "PRIVATE") {
      if (club.clubPrivacyId === 1) return false;
    }

    // 3. Sport Type Filter (CYCLING / RUNNING / TRIATHLON)
    if (sportTypeFilter !== "ALL") {
      const sportName = getClubTypeName(club.clubTypeId).toUpperCase();
      if (sportName !== sportTypeFilter) return false;
    }

    return true;
  };

  const filteredMyClubs = combinedMyClubs.filter(filterClub);
  const filteredDiscoverClubs = exploreClubs.filter(filterClub);

  const handleSelectMyClub = (club: any) => {
    if (club.isManaged) {
      setActiveClub(club);
    }
    navigate(`/view/userside/club/${club.id}`);
  };

  const handleSelectDiscoverClub = (comm: any) => {
    navigate(`/view/userside/club/${comm.id}`);
  };

  // --- MAP VIEW: TAKES PAGE AREA WITH OVERFLOW HIDDEN ---
  if (viewMode === "map") {
    const clubsForMap =
      mapFilterType === "my"
        ? filteredMyClubs
        : Array.from(
            new Map(
              [...filteredMyClubs, ...filteredDiscoverClubs].map((c) => [c.id, c])
            ).values()
          );

    return (
      <div className="w-full h-[calc(100vh-80px)] overflow-hidden relative">
        <ClubMapView
          clubs={clubsForMap}
          user={user}
          currentFilterType={mapFilterType}
          onFilterTypeChange={(type) => setMapFilterType(type)}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            setMyClubsViewMode(mode);
          }}
          onSelectClub={(club) => {
            if (club.isManaged) {
              setActiveClub(club);
            }
            navigate(`/view/userside/club/${club.id}`);
          }}
        />
      </div>
    );
  }

  // --- DEFAULT VIEW: HUB & SEARCH ---
  return (
    <div className="min-h-screen text-text-main font-sans w-full flex justify-center px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="w-full max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 pb-2">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase text-text-main">
              Athletic Clubs
            </h1>
            <p className="text-text-muted text-xs sm:text-sm font-medium">
              Manage your personal hubs or discover training communities around the region.
            </p>
          </div>

          <button
            onClick={() => {
              if (user) {
                dispatch(setUser({
                  ...user,
                  role: 'owner'
                }));
              }
              navigate("/club-profile-setup");
            }}
            className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer shadow-sm transition-all duration-200 active:scale-[0.98] text-center shrink-0"
          >
            + Create Club
          </button>
        </div>

        {/* Modern Dividing Line */}
        <div className="relative w-full">
          <div className="h-px w-full bg-border/60" />
          <div className="absolute left-0 top-0 h-px w-24 bg-[#EB712B]" />
        </div>

        {/* Search Input Bar + Filter Button */}
        <div className="space-y-3 w-full">
          <div className="flex gap-2 sm:gap-3 w-full items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={18}
              />
              <input
                type="text"
                placeholder="Search communities by name or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl py-3 sm:py-3.5 pl-11 pr-9 text-xs sm:text-sm focus:outline-none focus:border-[#EB712B] transition-colors text-text-main placeholder:text-text-muted/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-1 transition-colors"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setTempClubType(clubTypeFilter);
                setTempSportType(sportTypeFilter);
                setShowFilterModal(true);
              }}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shrink-0 border ${
                clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL"
                  ? "bg-[#EB712B] text-white border-[#EB712B]"
                  : "bg-surface text-text-main border-border hover:border-text-muted/50"
              }`}
            >
              <Filter size={16} />
              <span className="hidden xs:inline sm:inline">Filter</span>
              {(clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL") && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>

          {/* Minimalist Sport Filter Pills (Fast 1-click toggling, NO EMOJIS) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "ALL", label: "All Sports", icon: null },
              { id: "CYCLING", label: "Cycling", icon: Bike },
              { id: "RUNNING", label: "Running", icon: Activity },
              { id: "TRIATHLON", label: "Triathlon", icon: Trophy },
            ].map((sport) => {
              const Icon = sport.icon;
              const active = sportTypeFilter === sport.id;
              return (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => setSportTypeFilter(sport.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    active
                      ? "bg-[#EB712B] text-white border-[#EB712B]"
                      : "bg-surface text-text-muted border-border hover:border-text-muted/40 hover:text-text-main"
                  }`}
                >
                  {Icon && <Icon size={12} className="shrink-0" />}
                  <span>{sport.label}</span>
                </button>
              );
            })}

            <span className="text-[11px] text-text-muted font-medium ml-auto pl-2 hidden sm:inline whitespace-nowrap">
              {filteredMyClubs.length + filteredDiscoverClubs.length} {filteredMyClubs.length + filteredDiscoverClubs.length === 1 ? "community" : "communities"}
            </span>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL") && (
          <div className="flex flex-wrap items-center gap-2 -mt-4">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">
              Active:
            </span>
            {clubTypeFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-bold uppercase tracking-wider">
                Type: {clubTypeFilter}
                <X
                  size={12}
                  className="cursor-pointer hover:text-white"
                  onClick={() => setClubTypeFilter("ALL")}
                />
              </span>
            )}
            {sportTypeFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-bold uppercase tracking-wider">
                Sport: {sportTypeFilter}
                <X
                  size={12}
                  className="cursor-pointer hover:text-white"
                  onClick={() => setSportTypeFilter("ALL")}
                />
              </span>
            )}
            <button
              onClick={() => {
                setClubTypeFilter("ALL");
                setSportTypeFilter("ALL");
              }}
              className="text-[10px] font-bold text-text-muted hover:text-text-main underline cursor-pointer ml-1"
            >
              Reset
            </button>
          </div>
        )}

        {/* --- FILTER MODAL (Portal Mounted to Document Body for Unclipped Full-Viewport Backdrop) --- */}
        {showFilterModal &&
          createPortal(
            <div
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
              onClick={() => setShowFilterModal(false)}
            >
              <div
                className="bg-[#18181B] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-6 my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    Filter
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(false)}
                    className="text-text-muted hover:text-white transition-colors p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Club Type Section */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted block">
                    Club Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["ALL", "PUBLIC", "PRIVATE"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setTempClubType(type)}
                        className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all ${
                          tempClubType === type
                            ? "bg-[#EB712B] text-white border-[#EB712B] shadow-lg shadow-[#EB712B]/20"
                            : "bg-surface/60 text-text-muted border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sport Type Section */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase tracking-wider text-text-muted block">
                    Sport Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ALL", "CYCLING", "RUNNING", "TRIATHLON"] as const).map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => setTempSportType(sport)}
                        className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 ${
                          tempSportType === sport
                            ? "bg-[#EB712B] text-white border-[#EB712B] shadow-lg shadow-[#EB712B]/20"
                            : "bg-surface/60 text-text-muted border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {sport === "CYCLING" && <Bike size={14} />}
                        {sport === "RUNNING" && <Activity size={14} />}
                        {sport === "TRIATHLON" && <Trophy size={14} />}
                        <span>{sport}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setClubTypeFilter(tempClubType);
                      setSportTypeFilter(tempSportType);
                      setShowFilterModal(false);
                    }}
                    className="w-full py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#EB712B]/20 transition-all active:scale-95 cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClubTypeFilter("ALL");
                      setSportTypeFilter("ALL");
                      setShowFilterModal(false);
                    }}
                    className="w-full py-2.5 text-text-muted hover:text-white font-bold text-xs underline uppercase tracking-wider transition-colors text-center cursor-pointer"
                  >
                    Clear Filter
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* --- MY CLUBS SECTION --- */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-text-main">
                My Clubs
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border text-text-muted">
                {filteredMyClubs.length}
              </span>
            </div>

            <div className="h-px flex-1 bg-border/40 hidden md:block" />

            {/* List / Grid / Map Toggle View for My Clubs */}
            <div className="flex bg-surface border border-border rounded-lg p-0.5 gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setMyClubsViewMode("grid")}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  myClubsViewMode === "grid"
                    ? "bg-white/10 text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="Grid View"
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setMyClubsViewMode("list")}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  myClubsViewMode === "list"
                    ? "bg-white/10 text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="List View"
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMyClubsViewMode("map");
                  setViewMode("map");
                  setMapFilterType("my");
                }}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  myClubsViewMode === "map"
                    ? "bg-white/10 text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="Map View"
                title="Map View"
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>

          {filteredMyClubs.length === 0 ? (
            <div className="bg-surface/40 border border-border/80 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted">
                <Bike size={18} />
              </div>
              <div className="space-y-0.5 max-w-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-text-main">
                  {searchQuery || clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL"
                    ? "No matching managed clubs"
                    : "No managed clubs yet"}
                </p>
                <p className="text-[11px] text-text-muted">
                  {searchQuery || clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL"
                    ? "Try clearing your search query or sport filter."
                    : "Clubs you manage or create will appear here."}
                </p>
              </div>
            </div>
          ) : myClubsViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredMyClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => handleSelectMyClub(club)}
                  className="bg-surface border border-border/80 rounded-2xl overflow-hidden group flex flex-col transition-all duration-300 hover:border-border hover:shadow-md cursor-pointer"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-40 w-full bg-main-bg overflow-hidden shrink-0">
                    <img
                      src={getClubImage(club.logo, club.coverImage)}
                      alt={club.clubName}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    {/* Subtle dark gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-1.5">
                      {renderSportBadge(club.clubTypeId)}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isClubOwned(club, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm"
                            title="You manage this club"
                          >
                            <ShieldCheck size={11} className="shrink-0 text-amber-400" />
                            <span>Owned</span>
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shrink-0 shadow-sm ${
                          club.clubPrivacyId === 1 
                            ? "bg-black/60 text-emerald-400 border-emerald-500/30" 
                            : "bg-black/60 text-rose-400 border-rose-500/30"
                        }`}>
                          {club.clubPrivacyId === 1 ? <Globe size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />}
                          <span>{club.clubPrivacyId === 1 ? 'Public' : 'Private'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Details Content */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3.5 bg-surface">
                    <div className="space-y-1 min-w-0 w-full">
                      <h3 className="text-sm font-bold tracking-tight text-text-main uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {club.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-normal min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted/70 shrink-0" />
                        <span className="truncate">{club.location || "Location not specified"}</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-border/40" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                        <Users size={12} className="text-text-muted/70 shrink-0" />
                        <ClubMemberCountText club={club} />
                      </div>
                      <span className="text-[11px] font-bold text-[#EB712B] group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5">
                        {club.isManaged ? "Manage" : "View"} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMyClubs.map((club) => (
                <div
                  key={club.id}
                  onClick={() => handleSelectMyClub(club)}
                  className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-border hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 w-full min-w-0">
                    <img
                      src={getClubImage(club.logo, club.coverImage)}
                      alt={club.clubName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    <div className="space-y-1 w-full min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renderSportBadge(club.clubTypeId)}
                        {isClubOwned(club, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                            title="You manage this club"
                          >
                            <ShieldCheck size={10} className="shrink-0 text-amber-400" /> Owned
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          club.clubPrivacyId === 1 
                            ? "bg-black/60 text-emerald-400 border-emerald-500/30" 
                            : "bg-black/60 text-rose-400 border-rose-500/30"
                        }`}>
                          {club.clubPrivacyId === 1 ? <Globe size={10} className="shrink-0" /> : <Lock size={10} className="shrink-0" />} {club.clubPrivacyId === 1 ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold tracking-tight group-hover:text-[#EB712B] transition-colors uppercase truncate">
                        {club.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-normal min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted/70 shrink-0" />
                        <span className="truncate">{club.location || "Location not specified"}</span>
                      </div>
                      <ClubMemberCountText club={club} as="p" className="text-[11px] text-text-muted font-medium" />
                    </div>
                  </div>
                  <span className="text-[#EB712B] font-bold text-xs tracking-wider uppercase group-hover:translate-x-0.5 transition-transform shrink-0 self-end sm:self-center">
                    {club.isManaged ? "Manage →" : "View →"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Subtle Modern Section Divider */}
        <div className="h-px w-full bg-border/40" />

        {/* --- DISCOVER ALL CLUBS SECTION --- */}
        <section className="space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-black tracking-wide uppercase text-text-main">
                Discover All Clubs
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-surface border border-border text-text-muted">
                {filteredDiscoverClubs.length}
              </span>
            </div>

            <div className="h-px flex-1 bg-border/40 hidden md:block" />

            {/* List / Grid / Map Toggle View for Discover Clubs */}
            <div className="flex bg-surface border border-border rounded-lg p-0.5 gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  viewMode === "grid"
                    ? "bg-white/10 text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="Grid View"
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  viewMode === "list"
                    ? "bg-white/10 text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="List View"
                title="List View"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("map");
                  setMapFilterType("all");
                }}
                className={`p-2 rounded-md cursor-pointer transition-colors ${
                  (viewMode as any) === "map"
                    ? "bg-white/10 text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="Map View"
                title="Map View"
              >
                <MapIcon size={16} />
              </button>
            </div>
          </div>

          {filteredDiscoverClubs.length === 0 ? (
            <div className="bg-surface/40 border border-border/80 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-surface border border-border flex items-center justify-center text-text-muted">
                <Bike size={18} />
              </div>
              <div className="space-y-0.5 max-w-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-text-main">
                  No matching clubs found
                </p>
                <p className="text-[11px] text-text-muted">
                  Try adjusting your search query or sport filter.
                </p>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  onClick={() => handleSelectDiscoverClub(comm)}
                  className="bg-surface border border-border/80 rounded-2xl overflow-hidden group flex flex-col transition-all duration-300 hover:border-border hover:shadow-md cursor-pointer"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-40 w-full bg-main-bg overflow-hidden shrink-0">
                    <img
                      src={getClubImage(comm.logo, comm.coverImage)}
                      alt={comm.clubName}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    {/* Subtle dark gradient scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10 gap-1.5">
                      {renderSportBadge(comm.clubTypeId)}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isClubOwned(comm, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm"
                            title="You manage this club"
                          >
                            <ShieldCheck size={11} className="shrink-0 text-amber-400" />
                            <span>Owned</span>
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shrink-0 shadow-sm ${
                          comm.clubPrivacyId === 1 
                            ? "bg-black/60 text-emerald-400 border-emerald-500/30" 
                            : "bg-black/60 text-rose-400 border-rose-500/30"
                        }`}>
                          {comm.clubPrivacyId === 1 ? <Globe size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />}
                          <span>{comm.clubPrivacyId === 1 ? 'Public' : 'Private'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Details Content */}
                  <div className="p-4 flex flex-col justify-between flex-1 gap-3.5 bg-surface">
                    <div className="space-y-1 min-w-0 w-full">
                      <h3 className="text-sm font-bold tracking-tight text-text-main uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {comm.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-normal min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted/70 shrink-0" />
                        <span className="truncate">{comm.location || "Location not specified"}</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-border/40" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-medium">
                        <Users size={12} className="text-text-muted/70 shrink-0" />
                        <ClubMemberCountText club={comm} />
                      </div>
                      <span className="text-[11px] font-bold text-[#EB712B] group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-0.5">
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  onClick={() => handleSelectDiscoverClub(comm)}
                  className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-border hover:shadow-xs transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 w-full min-w-0">
                    <img
                      src={getClubImage(comm.logo, comm.coverImage)}
                      alt={comm.clubName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    <div className="space-y-1 w-full min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renderSportBadge(comm.clubTypeId)}
                        {isClubOwned(comm, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0"
                            title="You manage this club"
                          >
                            <ShieldCheck size={10} className="shrink-0 text-amber-400" /> Owned
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                          comm.clubPrivacyId === 1 
                            ? "bg-black/60 text-emerald-400 border-emerald-500/30" 
                            : "bg-black/60 text-rose-400 border-rose-500/30"
                        }`}>
                          {comm.clubPrivacyId === 1 ? <Globe size={10} className="shrink-0" /> : <Lock size={10} className="shrink-0" />} {comm.clubPrivacyId === 1 ? 'Public' : 'Private'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold tracking-tight group-hover:text-[#EB712B] transition-colors uppercase truncate">
                        {comm.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-normal min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted/70 shrink-0" />
                        <span className="truncate">{comm.location || "Location not specified"}</span>
                      </div>
                      <ClubMemberCountText club={comm} as="p" className="text-[11px] text-text-muted font-medium" />
                    </div>
                  </div>
                  <span className="text-[#EB712B] font-bold text-xs tracking-wider uppercase group-hover:translate-x-0.5 transition-transform shrink-0 self-end sm:self-center">
                    View &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}