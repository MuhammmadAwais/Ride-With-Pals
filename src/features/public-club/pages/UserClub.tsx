/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Globe, Lock, MapPin, Users, ShieldCheck, Bike, Activity, Trophy, Filter, X } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setUser } from "@/features/auth/slices/authSlice";
import { fetchMyClubs, fetchExploreClubs, fetchJoinedClubs } from "@/features/club/slices/clubSlice";
import { useActiveClub } from "@/hooks/useActiveClub";

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
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md whitespace-nowrap shrink-0">
        <Activity size={11} className="shrink-0" /> RUNNING
      </span>
    );
  }
  if (t === "Triathlon") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md whitespace-nowrap shrink-0">
        <Trophy size={11} className="shrink-0" /> TRIATHLON
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md whitespace-nowrap shrink-0">
      <Bike size={11} className="shrink-0" /> CYCLING
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
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

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

  // --- DEFAULT VIEW: HUB & SEARCH ---
  return (
    <div className="flex min-h-screen text-text-main font-sans w-full justify-center p-4 sm:p-8 ">
      <div className="flex-1 p-4 transition-all max-w-7xl w-full mx-auto space-y-12">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.06] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#EB712B] mb-3 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] animate-pulse" />
              Community Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-text-main">
              Athletic Clubs
            </h1>
            <p className="text-text-muted text-xs tracking-wide mt-2 font-medium max-w-lg">
              Manage your personal hubs or discover elite training communities around the region.
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
            className="w-full md:w-auto px-6 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center shrink-0 border border-[#EB712B]/30"
          >
            + Create Club
          </button>
        </div>

        {/* Search Input Bar + Filter Button */}
        <div className="flex flex-col sm:flex-row gap-3 w-full items-center">
          <div className="relative w-full">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
              size={20}
            />
            <input
              type="text"
              placeholder="Search communities by name or activity type (e.g. Cycling, Running, Triathlon)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-[#EB712B] transition-all duration-300 text-text-main placeholder-gray-500 shadow-inner"
            />
          </div>

          <button
            onClick={() => {
              setTempClubType(clubTypeFilter);
              setTempSportType(sportTypeFilter);
              setShowFilterModal(true);
            }}
            className={`flex items-center justify-center gap-2.5 px-7 py-5 rounded-2xl font-black uppercase text-xs tracking-wider cursor-pointer transition-all duration-300 shrink-0 border ${
              clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL"
                ? "bg-[#EB712B] text-white border-[#EB712B] shadow-lg shadow-[#EB712B]/20"
                : "bg-surface text-text-main border-border hover:border-[#EB712B]/50"
            }`}
          >
            <Filter size={18} />
            <span>Filter</span>
            {(clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL") && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>
        </div>

        {/* Active Filter Chips */}
        {(clubTypeFilter !== "ALL" || sportTypeFilter !== "ALL") && (
          <div className="flex flex-wrap items-center gap-2 -mt-8">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">
              Active Filters:
            </span>
            {clubTypeFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black uppercase tracking-wider">
                Club Type: {clubTypeFilter}
                <X
                  size={12}
                  className="cursor-pointer hover:text-white"
                  onClick={() => setClubTypeFilter("ALL")}
                />
              </span>
            )}
            {sportTypeFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black uppercase tracking-wider">
                Sport Type: {sportTypeFilter}
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
              className="text-[10px] font-bold text-text-muted hover:text-text-main underline cursor-pointer ml-2"
            >
              Clear all
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
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-wide uppercase">
              My Clubs
            </h2>
            <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase mt-0.5">
              Communities you manage
            </p>
          </div>

          {filteredMyClubs.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted text-xs font-bold tracking-wider">
              No matching clubs found in your inventory.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMyClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-surface border border-border rounded-3xl overflow-hidden group flex flex-col h-[320px] transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_12px_30px_rgba(235,113,43,0.08)]"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-36 w-full bg-main-bg overflow-hidden shrink-0">
                    <img
                      src={getClubImage(club.logo, club.coverImage)}
                      alt={club.clubName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    {/* Subtle dark gradient overlay to ensure floating badges are readable */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 gap-2">
                      {renderSportBadge(club.clubTypeId)}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isClubOwned(club, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/95 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md border border-amber-300/40 whitespace-nowrap shrink-0"
                            title="You own this club"
                          >
                            <ShieldCheck size={11} className="shrink-0" /> OWNED
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg transition-all duration-300 border whitespace-nowrap shrink-0 ${
                          club.clubPrivacyId === 1 
                            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10 shadow-green-950/20 shadow-sm" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 shadow-rose-950/20 shadow-sm"
                        }`}>
                          {club.clubPrivacyId === 1 ? <Globe size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />} {club.clubPrivacyId === 1 ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Details Content */}
                  <div className="p-5 flex flex-col justify-between flex-1 bg-surface">
                    <div className="space-y-1.5 min-w-0 w-full">
                      <h3 className="text-base font-black tracking-tight text-text-main uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {club.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold tracking-wider uppercase min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">{club.location || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        <Users size={13} className="text-text-muted" />
                        <span>{getMemberCount(club)} Pals joined</span>
                      </div>
                      <span 
                        onClick={() => handleSelectMyClub(club)} 
                        className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        {club.isManaged ? "Manage →" : "View Club →"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- DISCOVER ALL CLUBS SECTION --- */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black tracking-wide uppercase">
                Discover All Clubs
              </h2>
              <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase mt-0.5">
                Explore external communities
              </p>
            </div>

            {/* List / Grid Toggle View */}
            <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white/10 text-text-main shadow-inner"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white/10 text-text-main shadow-inner"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {filteredDiscoverClubs.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted text-xs font-bold tracking-wider">
              No matching clubs found in public directory.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-surface border border-border rounded-3xl overflow-hidden group flex flex-col h-[320px] transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_12px_30px_rgba(235,113,43,0.08)]"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-36 w-full bg-main-bg overflow-hidden shrink-0">
                    <img
                      src={getClubImage(comm.logo, comm.coverImage)}
                      alt={comm.clubName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    {/* Subtle dark gradient overlay to ensure floating badges are readable */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 gap-2">
                      {renderSportBadge(comm.clubTypeId)}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isClubOwned(comm, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/95 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md border border-amber-300/40 whitespace-nowrap shrink-0"
                            title="You own this club"
                          >
                            <ShieldCheck size={11} className="shrink-0" /> OWNED
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border whitespace-nowrap shrink-0 ${
                          comm.clubPrivacyId === 1 
                            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10 shadow-green-950/20 shadow-sm" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 shadow-rose-950/20 shadow-sm"
                        }`}>
                          {comm.clubPrivacyId === 1 ? <Globe size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />} {comm.clubPrivacyId === 1 ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Details Content */}
                  <div className="p-5 flex flex-col justify-between flex-1 bg-surface">
                    <div className="space-y-1.5 min-w-0 w-full">
                      <h3 className="text-base font-black tracking-tight text-text-main uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {comm.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold tracking-wider uppercase min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">{comm.location || "N/A"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        <Users size={13} className="text-text-muted" />
                        <span>{getMemberCount(comm)} Pals joined</span>
                      </div>
                      <span 
                        onClick={() => handleSelectDiscoverClub(comm)} 
                        className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-surface border border-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-[#EB712B]/30 transition-all"
                >
                  <div className="flex items-center gap-6 w-full min-w-0">
                    <img
                      src={getClubImage(comm.logo, comm.coverImage)}
                      alt={comm.clubName}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
                      }}
                    />
                    <div className="space-y-1.5 w-full min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {renderSportBadge(comm.clubTypeId)}
                        {isClubOwned(comm, user, myClubs) && (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/95 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md border border-amber-300/40 whitespace-nowrap shrink-0"
                            title="You own this club"
                          >
                            <ShieldCheck size={10} className="shrink-0" /> OWNED
                          </span>
                        )}
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border whitespace-nowrap shrink-0 ${
                          comm.clubPrivacyId === 1 
                            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10"
                        }`}>
                          {comm.clubPrivacyId === 1 ? <Globe size={10} className="shrink-0" /> : <Lock size={10} className="shrink-0" />} {comm.clubPrivacyId === 1 ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight group-hover:text-[#EB712B] transition-colors uppercase truncate">
                        {comm.clubName}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold tracking-wider uppercase min-w-0 w-full">
                        <MapPin size={12} className="text-text-muted shrink-0" />
                        <span className="truncate">{comm.location || "N/A"}</span>
                      </div>
                      <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase">
                        {getMemberCount(comm)} Pals joined
                      </p>
                    </div>
                  </div>
                  <span 
                    onClick={() => handleSelectDiscoverClub(comm)} 
                    className="text-[#EB712B] font-black text-xs tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer shrink-0"
                  >
                    View Hub &rarr;
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