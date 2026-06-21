import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Globe, Lock } from "lucide-react";

const myClubsData = [
  {
    id: "1",
    name: "Red Rock Cyclists",
    activityType: "Mountain Biking",
    status: "PUBLIC",
    members: "248",
    logo: "/Images/CycleImage2.png",
  },
  {
    id: "2",
    name: "Apex Running Club",
    activityType: "Running",
    status: "PRIVATE",
    members: "112",
    logo: "/Images/PersonImage.png",
  },
];

const discoverClubsData = [
  {
    id: "1",
    name: "Red Rock Cyclists",
    activityType: "Biking",
    status: "PUBLIC",
    members: "248 Pals joined",
    logo: "/Images/CyclingPicture.jpg",
  },
  {
    id: "2",
    name: "Apex Running Club",
    activityType: "Running",
    status: "PRIVATE",
    members: "112 Pals joined",
    logo: "/Images/CyclingPicture.jpg",
  },
  {
    id: "3",
    name: "Ironman Triathlons",
    activityType: "Triathlon",
    status: "PUBLIC",
    members: "128 Pals joined",
    logo: "/Images/CyclingPicture.jpg",
  },
];

export default function ClubHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");

  // Functional Search: Filters based on club name or activity type
  const filteredMyClubs = myClubsData.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.activityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscoverClubs = discoverClubsData.filter(
    (comm) =>
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.activityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen text-white font-sans w-full justify-center p-4 sm:p-8">
      <div className="flex-1 p-4 transition-all max-w-7xl w-full mx-auto space-y-12">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.06] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#EB712B] mb-3 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] animate-pulse" />
              Community Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              Athletic Clubs
            </h1>
            <p className="text-gray-400 text-xs tracking-wide mt-2 font-medium max-w-lg">
              Manage your personal hubs or discover elite training communities around the region.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard/create-club")}
            className="w-full md:w-auto px-6 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center shrink-0 border border-[#EB712B]/30"
          >
            + Create Club
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search communities by name or activity type (e.g. Biking, Running)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-[#EB712B] transition-all duration-300 text-white placeholder-gray-500 shadow-inner"
          />
        </div>

        {/* --- MY CLUBS SECTION --- */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-wide uppercase">
              My Clubs
            </h2>
            <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-0.5">
              Communities you manage
            </p>
          </div>

          {filteredMyClubs.length === 0 ? (
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-12 text-center text-gray-500 text-xs font-bold tracking-wider">
              No matching clubs found in your inventory.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMyClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-[#141414] border border-white/[0.06] rounded-3xl overflow-hidden group flex flex-col justify-between h-72 relative transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_0_30px_rgba(235,113,43,0.08)]"
                >
                  {/* Background image dynamically set using club.logo */}
                  <div className="absolute inset-0 bg-zinc-950">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/40 to-transparent" />
                  </div>

                  {/* Card Activity Tag & Upgraded Premium Status Badge */}
                  <div className="relative z-10 p-6 flex justify-between items-start">
                    <span className="px-4 py-1.5 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                      {club.activityType}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg transition-all duration-300 border ${
                      club.status === "PUBLIC" 
                        ? "bg-green-500/10 text-green-300 border-green-500/30 shadow-green-950/20 shadow-sm" 
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-rose-950/20 shadow-sm"
                    }`}>
                      {club.status === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />} {club.status}
                    </span>
                  </div>

                  {/* Card Info */}
                  <div className="relative z-10 p-6 backdrop-blur-[2px]">
                    <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-[#EB712B] transition-colors uppercase">
                      {club.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-extrabold tracking-[0.1em] uppercase">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>Las Vegas, NV</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                      <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 010 7.75"></path>
                        </svg>
                        {club.members} Pals joined
                      </div>
                      <span className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform">
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
              <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mt-0.5">
                Explore external communities
              </p>
            </div>

            {/* List / Grid Toggle View */}
            <div className="flex bg-[#141414] border border-white/10 rounded-xl p-1 gap-1 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
                aria-label="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {filteredDiscoverClubs.length === 0 ? (
            <div className="bg-[#141414] border border-white/5 rounded-3xl p-12 text-center text-gray-500 text-xs font-bold tracking-wider">
              No matching clubs found in public directory.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-[#141414] border border-white/[0.06] rounded-3xl overflow-hidden group flex flex-col justify-between h-72 relative transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_0_30px_rgba(235,113,43,0.08)]"
                >
                  {/* Background image dynamically set using comm.logo */}
                  <div className="absolute inset-0 bg-zinc-950">
                    <img
                      src={comm.logo}
                      alt={comm.name}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/40 to-transparent" />
                  </div>

                  <div className="relative z-10 p-6 flex justify-between items-start">
                    <span className="px-4 py-1.5 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                      {comm.activityType}
                    </span>
                    {/* Upgraded Premium Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border ${
                      comm.status === "PUBLIC" 
                        ? "bg-green-500/10 text-green-300 border-green-500/30 shadow-green-950/20 shadow-sm" 
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-rose-950/20 shadow-sm"
                    }`}>
                      {comm.status === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />} {comm.status}
                    </span>
                  </div>

                  <div className="relative z-10 p-6 backdrop-blur-[2px]">
                    <h3 className="text-xl font-black tracking-tight mb-2 group-hover:text-[#EB712B] transition-colors uppercase">
                      {comm.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-extrabold tracking-[0.1em] uppercase">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      <span>Las Vegas, NV</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-4">
                      <div className="flex items-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-wider">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 010 7.75"></path>
                        </svg>
                        {comm.members}
                      </div>
                      <span className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform">
                        {comm.status === "PUBLIC" ? "Explore →" : "Request →"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table Headers */}
              <div className="hidden md:grid grid-cols-5 text-gray-500 text-[10px] font-black uppercase tracking-widest px-6 mb-4">
                <div>Community</div>
                <div>Activity Type</div>
                <div>Access</div>
                <div>Members</div>
                <div className="text-right">Action</div>
              </div>

              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  className="grid grid-cols-1 md:grid-cols-5 items-center bg-[#141414] border border-white/5 rounded-3xl p-4 px-6 hover:scale-[1.01] hover:border-[#EB712B]/50 hover:shadow-[0_0_25px_rgba(235,113,43,0.1)] transition-all duration-300 gap-y-4 md:gap-y-0"
                >
                  <div className="flex items-center gap-4 font-bold col-span-2 md:col-span-1">
                    {/* List-view image dynamically rendered */}
                    <img
                      src={comm.logo}
                      alt={comm.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                    />
                    <span className="truncate group-hover:text-[#EB712B] transition-colors uppercase tracking-tight">
                      {comm.name}
                    </span>
                  </div>
                  
                  <div className="text-gray-400 text-xs font-semibold md:pl-0">
                    <span className="md:hidden font-black text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Activity Type</span>
                    {comm.activityType}
                  </div>
                  
                  <div>
                    <span className="md:hidden font-black text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Access</span>
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border ${
                      comm.status === "PUBLIC" 
                        ? "bg-green-500/10 text-green-300 border-green-500/30 shadow-green-950/20" 
                        : "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-rose-950/20"
                    }`}>
                      {comm.status === "PUBLIC" ? <Globe size={12} /> : <Lock size={12} />} {comm.status}
                    </span>
                  </div>
                  
                  <div className="text-gray-400 text-xs font-bold tracking-tight">
                    <span className="md:hidden font-black text-[9px] text-gray-500 uppercase tracking-widest block mb-1">Members</span>
                    {comm.members}
                  </div>
                  
                  <div className="text-left md:text-right">
                    <button className={`w-full md:text-auto px-6 py-3 font-black uppercase rounded-xl transition-all cursor-pointer text-xs tracking-wide shadow-lg ${
                      comm.status === "PUBLIC"
                        ? "bg-[#EB712B] hover:bg-[#d05c1c] text-white shadow-[#EB712B]/20"
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 shadow-none"
                    }`}>
                      {comm.status === "PUBLIC" ? "Explore" : "Request Access"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}