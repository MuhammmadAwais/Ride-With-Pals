import { useState } from "react";
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
  Compass
} from "lucide-react";

const initialRides = [
  {
    id: 1,
    title: "Run and Fit",
    clubName: "Cyc Rock Cycle",
    date: "20 Jan, 2026 - 10:00 AM",
    location: "6391 Elgin St. Celina, Delaware 10299",
    rideType: "Gravel",
    speed: "28km/h",
    distance: "80km",
    participants: "10",
    organizer: "Arlene McCoy"
  },
  {
    id: 2,
    title: "Coastal Cruise",
    clubName: "Ocean Drive Riders",
    date: "22 Jan, 2026 - 07:30 AM",
    location: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
    rideType: "Road",
    speed: "32km/h",
    distance: "120km",
    participants: "24",
    organizer: "Cody Fisher"
  },
  {
    id: 3,
    title: "Mountain Pass Express",
    clubName: "Apex Ascents",
    date: "24 Jan, 2026 - 06:00 AM",
    location: "4140 Washington Ave. Manchester, Kentucky 39495",
    rideType: "MTB",
    speed: "18km/h",
    distance: "45km",
    participants: "8",
    organizer: "Robert Fox"
  },
  {
    id: 4,
    title: "Urban Night Sprint",
    date: "28 Jan, 2026 - 08:30 PM",
    clubName: "Neon Hub",
    location: "8502 Preston Rd. Inglewood, Maine 98380",
    rideType: "Criterium",
    speed: "45km/h",
    distance: "30km",
    participants: "15",
    organizer: "Esther Howard"
  },
  {
    id: 5,
    title: "Early Bird Loop",
    clubName: "Sunrise Spinners",
    date: "28 Jan, 2026 - 08:30 AM",
    location: "2718 Thornridge Cir. Syracuse, Connecticut 35624",
    rideType: "Road",
    speed: "26km/h",
    distance: "80km",
    participants: "12",
    organizer: "Jenny Wilson"
  },
  {
    id: 6,
    title: "Gravel Grind XL",
    clubName: "Dirty Spokes",
    date: "28 Jan, 2026 - 08:30 AM",
    location: "3517 W. Gray St. Utica, Pennsylvania 87867",
    rideType: "Gravel",
    speed: "33km/h",
    distance: "180km",
    participants: "18",
    organizer: "Guy Hawkins"
  }
];

interface RideProps {
  clubId?: string | number;
}

const Ride: React.FC<RideProps> = ({ clubId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  console.log("Active club ID context:", clubId);

  const filteredRides = initialRides.filter(ride => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch = 
      ride.title.toLowerCase().includes(query) || 
      ride.clubName.toLowerCase().includes(query) ||
      ride.location.toLowerCase().includes(query);
    
    const matchesType = selectedType === "All" || ride.rideType === selectedType;

    return matchesSearch && matchesType;
  });

  const handleJoinRide = (id: number | string) => {
    navigate(`/dashboard/ride/${id}`);
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-10 font-sans select-none w-full">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8 mb-4">
          <div className="space-y-2.5 relative">
            <div className="absolute -left-10 top-0 w-20 h-20 bg-[#EB712B]/10 rounded-full blur-3xl pointer-events-none" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Upcoming Rides
            </h1>
            <p className="text-gray-400 font-medium text-sm max-w-xl">
              Discover and join elite scheduled cycling group rides in your region.
            </p>
          </div>
        </div>

        {/* Functional Search & Filters Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111111] border border-white/5 p-4 rounded-2xl">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text"
              placeholder="Search by ride title, club, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171717] border border-white/5 pl-12 pr-4 py-3.5 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Ride Type Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter size={16} className="text-gray-500 shrink-0 hidden md:block" />
            {["All", "Road", "Gravel", "MTB", "Criterium"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                  selectedType === type 
                    ? "bg-[#EB712B] border-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]" 
                    : "bg-[#171717] border-white/5 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {filteredRides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.map((ride) => (
              <div 
                key={ride.id} 
                className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#EB712B]/40 transition-all group relative overflow-hidden shadow-2xl"
              >
                {/* Background accent glow on hover */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#EB712B]/5 rounded-full blur-3xl group-hover:bg-[#EB712B]/10 transition-all duration-500 pointer-events-none" />

                {/* Card Header */}
                <div className="space-y-4 z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg tracking-tight text-white group-hover:text-[#EB712B] transition-colors">
                        {ride.title}
                      </h3>
                      <p className="text-[10px] uppercase font-extrabold text-gray-500 tracking-wider mt-0.5">
                        Club Name: <span className="text-gray-300 font-semibold">{ride.clubName}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/5 px-2.5 py-1 rounded-lg shrink-0">
                      <Flame size={12} className="text-[#EB712B]" />
                      <span className="text-[9px] font-extrabold uppercase text-[#EB712B] tracking-wider">Elite</span>
                    </div>
                  </div>

                  {/* Info Rows */}
                  <div className="space-y-2.5 bg-[#171717] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Calendar size={15} className="text-gray-500 shrink-0" />
                      <span className="font-medium truncate text-xs">{ride.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <MapPin size={15} className="text-gray-500 shrink-0" />
                      <span className="font-medium truncate text-[11px] leading-relaxed">{ride.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-300">
                      <Bike size={15} className="text-gray-500 shrink-0" />
                      <span className="font-medium text-xs">
                        Ride Type: <span className="text-[#EB712B] font-bold">{ride.rideType}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-6 z-10">
                  <div className="bg-[#151515] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-extrabold text-white tracking-tight">{ride.speed}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1.5">Speed</span>
                  </div>
                  <div className="bg-[#151515] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-extrabold text-white tracking-tight">{ride.distance}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1.5">Distance</span>
                  </div>
                  <div className="bg-[#151515] p-3 rounded-xl border border-white/5 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-extrabold text-white tracking-tight">{ride.participants}</span>
                    <span className="text-[8px] uppercase tracking-wider text-gray-500 font-bold mt-1.5">Participants</span>
                  </div>
                </div>

                {/* Action/Footer Panel */}
                <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-4 z-10">
                  <button 
                    onClick={() => handleJoinRide(ride.id)}
                    className="flex-1 bg-[#EB712B] hover:bg-[#d66525] py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(235,113,43,0.2)] cursor-pointer"
                  >
                    Click to Join Ride <ArrowRight size={14} />
                  </button>
                  <div className="flex items-center gap-2 bg-[#171717] pl-1 pr-3 py-1 rounded-xl border border-white/5 shrink-0 max-w-[120px]">
                    <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-white/5 flex items-center justify-center font-bold text-[9px] text-gray-400 shrink-0 uppercase">
                      {ride.organizer.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[7px] uppercase font-extrabold text-gray-500 tracking-wider">Organizer</span>
                      <span className="text-[10px] font-bold text-white truncate leading-tight">{ride.organizer}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State Display */
          <div className="flex flex-col items-center justify-center bg-[#111111] border border-white/5 rounded-3xl p-16 text-center shadow-2xl">
            <Compass size={48} className="text-gray-600 animate-pulse mb-4" />
            <h3 className="font-extrabold text-lg text-white tracking-tight">No rides found</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-sm">
              We couldn't find any elite cycling events matching your search filters. Try resetting or adjusting your search parameters.
            </p>
            <button 
              onClick={() => { setSearchQuery(""); setSelectedType("All"); }}
              className="mt-6 px-6 py-2.5 bg-[#171717] border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
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