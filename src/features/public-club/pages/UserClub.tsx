import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Bike, Activity, Trophy, Filter, X, Map as MapIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setUser } from "@/features/auth/slices/authSlice";
import { fetchMyClubs, fetchExploreClubs, fetchJoinedClubs } from "@/features/club/slices/clubSlice";
import { useActiveClub } from "@/hooks/useActiveClub";
import { ClubMapView } from "../components/ClubMapView";
import { ClubCard, getClubTypeName } from "../components/ClubCard";
import { cn } from "@/lib/utils";

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

  // Modern Pagination State for Discover All Clubs
  const [discoverPage, setDiscoverPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const discoverSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    dispatch(fetchMyClubs());
    dispatch(fetchJoinedClubs());
    dispatch(fetchExploreClubs());
  }, [dispatch]);

  // Reset pagination when search, filters, or items-per-page change
  useEffect(() => {
    setDiscoverPage(1);
  }, [searchQuery, clubTypeFilter, sportTypeFilter, itemsPerPage]);

  const combinedMyClubs = useMemo(() => {
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

  // Paginated clubs slice
  const totalPages = Math.max(1, Math.ceil(filteredDiscoverClubs.length / itemsPerPage));
  const paginatedDiscoverClubs = useMemo(() => {
    const startIndex = (discoverPage - 1) * itemsPerPage;
    return filteredDiscoverClubs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDiscoverClubs, discoverPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setDiscoverPage(newPage);
    if (discoverSectionRef.current) {
      discoverSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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
                <ClubCard
                  key={club.id}
                  club={club}
                  user={user}
                  myClubs={myClubs}
                  onClick={handleSelectMyClub}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredMyClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  user={user}
                  myClubs={myClubs}
                  onClick={handleSelectMyClub}
                  viewMode="list"
                />
              ))}
            </div>
          )}
        </section>

        {/* Subtle Modern Section Divider */}
        <div className="h-px w-full bg-border/40" />

        {/* --- DISCOVER ALL CLUBS SECTION --- */}
        <section ref={discoverSectionRef} className="space-y-4 sm:space-y-5">
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
              {paginatedDiscoverClubs.map((comm) => (
                <ClubCard
                  key={comm.id}
                  club={comm}
                  user={user}
                  myClubs={myClubs}
                  onClick={handleSelectDiscoverClub}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {paginatedDiscoverClubs.map((comm) => (
                <ClubCard
                  key={comm.id}
                  club={comm}
                  user={user}
                  myClubs={myClubs}
                  onClick={handleSelectDiscoverClub}
                  viewMode="list"
                />
              ))}
            </div>
          )}

          {/* Modern Responsive Pagination Controls */}
          {filteredDiscoverClubs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <p className="text-xs text-text-muted font-medium">
                  Showing <span className="text-text-main font-bold">{(discoverPage - 1) * itemsPerPage + 1}</span> to <span className="text-text-main font-bold">{Math.min(discoverPage * itemsPerPage, filteredDiscoverClubs.length)}</span> of <span className="text-text-main font-bold">{filteredDiscoverClubs.length}</span> clubs
                </p>

                {filteredDiscoverClubs.length > 8 && (
                  <div className="flex items-center gap-1.5 text-xs text-text-muted pl-2 border-l border-border/60">
                    <span className="text-[11px] uppercase font-semibold">Per page:</span>
                    {[8, 16, 24].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setItemsPerPage(size);
                          setDiscoverPage(1);
                        }}
                        className={cn(
                          "px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer",
                          itemsPerPage === size
                            ? "bg-[#EB712B] text-white"
                            : "bg-surface hover:bg-hover text-text-muted hover:text-text-main border border-border"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 select-none">
                <button
                  type="button"
                  onClick={() => handlePageChange(discoverPage - 1)}
                  disabled={discoverPage === 1}
                  className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hover transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span className="hidden sm:inline">Prev</span>
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= discoverPage - 1 && pageNum <= discoverPage + 1)
                    ) {
                      const isActive = pageNum === discoverPage;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isActive}
                          className={cn(
                            "w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                            isActive
                              ? "bg-[#EB712B] text-white shadow-md cursor-default"
                              : "bg-surface border border-border text-text-muted hover:text-text-main hover:bg-hover"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === discoverPage - 2 && pageNum > 1) ||
                      (pageNum === discoverPage + 2 && pageNum < totalPages)
                    ) {
                      return (
                        <span key={pageNum} className="w-6 text-center text-text-muted text-xs">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(discoverPage + 1)}
                  disabled={discoverPage === totalPages}
                  className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-hover transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}