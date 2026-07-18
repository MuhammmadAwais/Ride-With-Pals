import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Globe, Lock, MapPin, Users } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setUser } from "@/features/auth/slices/authSlice";
import { fetchMyClubs, fetchExploreClubs } from "@/features/club/slices/clubSlice";
import { useActiveClub } from "@/hooks/useActiveClub";

const getClubTypeName = (typeId?: number) => {
  if (typeId === 2) return "Running";
  if (typeId === 3) return "Cycling & Running";
  return "Biking / Cycling";
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

export default function UserClub() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const { myClubs, exploreClubs } = useAppSelector((s) => s.club);
  const { setActiveClub } = useActiveClub();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  React.useEffect(() => {
    dispatch(fetchMyClubs());
    dispatch(fetchExploreClubs());
  }, [dispatch]);

  const filteredMyClubs = myClubs.filter(
    (club) =>
      club.clubName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscoverClubs = exploreClubs.filter(
    (comm) =>
      comm.clubName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMyClub = (club: any) => {
    setActiveClub(club);
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

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
            size={20}
          />
          <input
            type="text"
            placeholder="Search communities by name or activity type (e.g. Biking, Running)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-[#EB712B] transition-all duration-300 text-text-main placeholder-gray-500 shadow-inner"
          />
        </div>

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
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                      <span className="px-3.5 py-1.5 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                        {getClubTypeName(club.clubTypeId)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg transition-all duration-300 border ${
                        club.clubPrivacyId === 1 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10 shadow-green-950/20 shadow-sm" 
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 shadow-rose-950/20 shadow-sm"
                      }`}>
                        {club.clubPrivacyId === 1 ? <Globe size={11} /> : <Lock size={11} />} {club.clubPrivacyId === 1 ? 'PUBLIC' : 'PRIVATE'}
                      </span>
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
                        <span>{club.memberCount || club.totalMembers || club.membersCount || 0} Pals joined</span>
                      </div>
                      <span 
                        onClick={() => handleSelectMyClub(club)} 
                        className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        Manage &rarr;
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
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                      <span className="px-3.5 py-1.5 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                        {getClubTypeName(comm.clubTypeId)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border ${
                        comm.clubPrivacyId === 1 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10 shadow-green-950/20 shadow-sm" 
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 shadow-rose-950/20 shadow-sm"
                      }`}>
                        {comm.clubPrivacyId === 1 ? <Globe size={11} /> : <Lock size={11} />} {comm.clubPrivacyId === 1 ? 'PUBLIC' : 'PRIVATE'}
                      </span>
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
                        <span>{comm.memberCount || comm.totalMembers || comm.membersCount || 0}</span>
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
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest w-fit shadow-md">
                          {getClubTypeName(comm.clubTypeId)}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${
                          comm.clubPrivacyId === 1 
                            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10"
                        }`}>
                          {comm.clubPrivacyId === 1 ? <Globe size={10} /> : <Lock size={10} />} {comm.clubPrivacyId === 1 ? 'PUBLIC' : 'PRIVATE'}
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
                        {comm.memberCount || comm.totalMembers || comm.membersCount || 0} Pals joined
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