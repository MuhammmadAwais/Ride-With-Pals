import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Copy, Zap, Bike, Award, CheckCircle2, Users, Search, X, Check, ShieldAlert
} from "lucide-react";

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet marker icon issues in React
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

// Full Roster Details Database
const FULL_ROSTER_DB = [
  { initials: "AM", name: "Arlene McCoy", role: "Lead Pacer", joinedDate: "May 10, 2026", verified: true },
  { initials: "CF", name: "Cody Fisher", role: "Host + Senior Member", joinedDate: "May 02, 2026", verified: true },
  { initials: "RF", name: "Floyd Miles", role: "Participant", joinedDate: "May 11, 2026", verified: false },
  { initials: "EH", name: "Esther Howard", role: "Participant", joinedDate: "May 12, 2026", verified: true },
  { initials: "JW", name: "Jane Wilson", role: "Participant", joinedDate: "May 12, 2026", verified: false },
  { initials: "GH", name: "Guy Hawkins", role: "Participant", joinedDate: "May 13, 2026", verified: true },
  { initials: "BM", name: "Bessie Cooper", role: "Participant", joinedDate: "May 14, 2026", verified: false },
  { initials: "JS", name: "Jenny Wilson", role: "Participant", joinedDate: "May 14, 2026", verified: true },
  { initials: "DL", name: "Devon Lane", role: "Participant", joinedDate: "May 15, 2026", verified: false },
  { initials: "KB", name: "Kristin Watson", role: "Participant", joinedDate: "May 15, 2026", verified: true },
];

const RideJoining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Local state for Roster Slide-Over Drawer, Search, and Toast Notification
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Mock geographic coordinates for the Map (French Alps / Haute-Savoie area)
  const mapCenter: [number, number] = [45.9184, 6.5862];

  const rideDetails = {
    id: id || "1",
    title: "Mountain Pass Express",
    host: "Cody Fisher + Pro Cycling Elite",
    date: "May 14, 2026 • 08:00 AM",
    type: "Premium Endurance Ride",
    avgPace: "28km/h",
    distance: "80km",
    activeParticipants: "10 Riders",
    maxSlope: "12%",
    supportCar: "Available",
    description: `Experience the ultimate alpine challenge with VeloHub's premier "Mountain Ride." This route is specifically designed for high-performance athletes looking to test their endurance across the legendary peaks of the Haute-Savoie. \n\nThe journey begins in the valley with a crisp 15km warm-up before hitting the primary ascent. Our route leaders will maintain a steady 28km/h pace, ensuring the group remains cohesive through the technical hairpins. Expect high-altitude gradients exceeding 12% in the final 5km. Post-ride nutrition and support vehicles are provided for all registered members.`,
    recommendedBike: "Gravel / Road Pro",
    leaders: [
      { name: "Arlene McCoy", role: "Lead Pacer + 12k Uts" },
      { name: "Cody Fisher", role: "Host + Senior Member" }
    ],
    participants: [
      "AM", "CF", "RF", "EH", "JW", "GH", "BM", "JS", "DL", "KB"
    ]
  };

  const handleJoinClick = () => {
    navigate(`/ride/confirmation/${rideDetails.id}`);
  };

  const handleShare = async () => {
    const shareUrl = `https://velohub.cc/ride/${rideDetails.id}`;
    await navigator.clipboard.writeText(shareUrl);
    
    // Trigger stylish custom toast notification
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Filter directory via search input
  const filteredRoster = FULL_ROSTER_DB.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen text-white p-4 md:p-8 font-sans select-none relative antialiased">
      
      {/* Custom Toast Notification */}
      <div 
        className={`fixed bottom-6 right-6 bg-[#121212] border border-[#EB712B]/40 text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_-15px_rgba(235,113,43,0.3)] flex items-center gap-3 z-50 transition-all duration-300 transform ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-[#EB712B]/20 border border-[#EB712B]/40 flex items-center justify-center text-[#EB712B]">
          <Check size={14} />
        </div>
        <span className="text-xs font-extrabold tracking-tight">Link copied to clipboard!</span>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2.5 text-gray-400 hover:text-white font-bold text-xs bg-[#121212] border border-white/5 px-5 py-3.5 rounded-2xl w-max transition-all duration-300 cursor-pointer hover:border-[#EB712B]/40 hover:bg-[#1a1a1a] hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft size={16} /> Back to rides
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Interactive Dark Landscape Map View */}
            <div className="relative h-[380px] w-full bg-[#121212] border border-white/5 rounded-3xl p-2.5 overflow-hidden shadow-2xl group">
              <MapContainer 
                center={mapCenter} 
                zoom={11} 
                scrollWheelZoom={false}
                className="h-full w-full rounded-2xl z-0 invert-[92%] hue-rotate-[180deg] brightness-[92%] contrast-[85%]"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={mapCenter}>
                  <Popup>
                    <div className="text-black text-xs font-bold p-1">
                      ⛰️ {rideDetails.title} <br /> Starting Point
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>

              {/* Glassmorphic Map Overlay Details */}
              <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none z-10">
                <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#EB712B] animate-pulse" /> Elevation Gain: 1,420m
                </div>
                <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-green-400 flex items-center gap-2 shadow-lg">
                  Live Beacon Active <CheckCircle2 size={14} />
                </div>
              </div>
            </div>

            {/* Event Title & Metadata */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-white/10">
              <div className="absolute top-0 right-0 w-56 h-56 bg-[#EB712B]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start gap-4 z-10 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-[#eb712a]">
                    <Zap size={12} /> {rideDetails.type} • {rideDetails.date}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {rideDetails.title}
                  </h1>
                  <p className="text-xs font-bold text-gray-400 tracking-wide">
                    Hosted by <span className="text-white">{rideDetails.host}</span>
                  </p>
                </div>

                {/* Share Link Actions */}
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 bg-[#1a1a1a] hover:bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 cursor-pointer hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0"
                    title="Share Ride"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 bg-[#1a1a1a] hover:bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 cursor-pointer hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0"
                    title="Copy Link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Clickable Quick-Copy Link Box */}
              <div 
                onClick={handleShare}
                className="flex items-center justify-between bg-[#1a1a1a] border border-white/5 px-5 py-3.5 rounded-2xl cursor-pointer hover:border-[#EB712B]/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(235,113,43,0.1)]"
              >
                <span className="text-[11px] text-gray-400 font-mono truncate select-all group-hover:text-white">
                  https://velohub.cc/ride/{rideDetails.id}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/5 text-gray-300 px-3 py-1.5 rounded-xl group-hover:bg-[#EB712B] group-hover:text-white transition-colors">
                  Tap to Copy
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-4 pt-2 z-10 relative">
                <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center transition-all duration-300 hover:border-white/20">
                  <div className="text-base font-extrabold text-[#EB712B] tracking-tight">{rideDetails.avgPace}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Average Pace</div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center transition-all duration-300 hover:border-white/20">
                  <div className="text-base font-extrabold text-white tracking-tight">{rideDetails.distance}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Total Distance</div>
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 p-5 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center transition-all duration-300 hover:border-white/20">
                  <div className="text-base font-extrabold text-white tracking-tight">{rideDetails.activeParticipants}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-gray-500">Participants</div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-4 border-t border-white/5 pt-6 z-10 relative">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-300">Ride Description</h4>
                <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line font-medium border-l-2 border-[#EB712B]/40 pl-4 py-1">
                  {rideDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Recommended Bike & Join Card */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl transition-all duration-300 hover:border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-gray-500">Recommended Bike</span>
                  <h3 className="text-xs font-extrabold text-[#eb712a] tracking-tight bg-[#1a1a1a] border border-[#EB712B]/20 px-4 py-2 rounded-xl w-max">
                    {rideDetails.recommendedBike}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                  <Bike size={22} className="text-gray-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#1a1a1a] p-5 rounded-2xl border border-white/5 text-xs">
                <div>
                  <div className="text-[9px] font-extrabold uppercase text-gray-500 tracking-wider">Max Slope</div>
                  <div className="font-extrabold text-white mt-1 tracking-tight text-sm">{rideDetails.maxSlope}</div>
                </div>
                <div>
                  <div className="text-[9px] font-extrabold uppercase text-gray-500 tracking-wider">Support Car</div>
                  <div className="font-extrabold text-green-400 mt-1 tracking-tight text-sm">{rideDetails.supportCar}</div>
                </div>
              </div>

              <button 
                onClick={handleJoinClick}
                className="w-full bg-[#eb712a] hover:bg-[#d66525] py-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_10px_30px_rgba(235,113,43,0.2)] cursor-pointer tracking-wide hover:-translate-y-1 active:translate-y-0"
              >
                🚴 Join Elite Ride
              </button>

              <div className="text-[9px] font-bold text-center text-gray-500 tracking-wide italic">
                *Act fast! Limited availability to secure your spot.
              </div>
            </div>

            {/* Ride Leaders */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 space-y-5 shadow-xl transition-all duration-300 hover:border-white/10">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-300">Ride Leaders</h4>
              <div className="space-y-3">
                {rideDetails.leaders.map((leader, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#1a1a1a] p-4 rounded-2xl border border-white/5 transition-all duration-300 hover:border-white/20">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#222] border border-white/10 flex items-center justify-center font-extrabold text-[11px] text-gray-300 shadow-md uppercase tracking-wider">
                        {leader.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-white leading-tight tracking-tight">{leader.name}</span>
                        <span className="text-[8px] font-extrabold text-gray-500 uppercase tracking-wider mt-1">{leader.role}</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-[#222] border border-white/10 flex items-center justify-center text-[9px] text-emerald-400">
                      <Award size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants Grid Widget */}
            <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 space-y-5 shadow-xl transition-all duration-300 hover:border-white/10">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-300">Participants</h4>
                <span className="text-[9px] font-extrabold bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#eb712a] tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Users size={10} /> {rideDetails.participants.length} Active
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3 py-1 items-center">
                {rideDetails.participants.slice(0, 8).map((initials, idx) => (
                  <div 
                    key={idx} 
                    className="w-10 h-10 rounded-2xl bg-[#1a1a1a] border border-white/20 flex items-center justify-center font-extrabold text-[10px] text-gray-300 shadow-md hover:scale-110 hover:border-[#EB712B]/40 transition-all duration-300 cursor-pointer ring-1 ring-black/20"
                    title={initials}
                  >
                    {initials}
                  </div>
                ))}
                {rideDetails.participants.length > 8 && (
                  <div 
                    onClick={() => setIsRosterOpen(true)}
                    className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-extrabold text-[10px] text-white cursor-pointer hover:bg-white/15 transition-all duration-300 hover:scale-110"
                  >
                    +{rideDetails.participants.length - 8}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsRosterOpen(true)}
                className="w-full bg-[#1a1a1a] hover:bg-white/5 border border-white/5 py-4 rounded-2xl text-xs font-extrabold text-white transition-all duration-300 cursor-pointer tracking-tight flex items-center justify-center gap-2.5 hover:border-white/20 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Users size={14} /> View Full Roster
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Roster Directory Drawer */}
      {isRosterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer"
            onClick={() => setIsRosterOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <h3 className="font-extrabold text-white text-base tracking-tight">Ride Roster</h3>
                <p className="text-[10px] text-gray-400 font-medium">Manage and view registered participants</p>
              </div>
              <button 
                onClick={() => setIsRosterOpen(false)}
                className="w-11 h-11 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 border border-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Global Roster Search */}
            <div className="p-5 border-b border-white/5 relative shrink-0">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="text" 
                placeholder="Search participant name..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/5 pl-10 pr-4 py-3.5 rounded-2xl text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/40 transition-colors"
              />
            </div>

            {/* Scrollable Participants Directory */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {filteredRoster.length > 0 ? (
                filteredRoster.map((user, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between bg-[#1a1a1a] p-4.5 rounded-2xl border border-white/5 group hover:border-white/20 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#222] border border-white/10 flex items-center justify-center font-extrabold text-xs text-gray-300 shadow-md uppercase tracking-wider shrink-0">
                        {user.initials}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-white leading-tight tracking-tight">
                            {user.name}
                          </span>
                          {user.verified && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Check size={10} />
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-[8px] font-extrabold text-gray-400 tracking-wider bg-[#121212] px-3 py-1.5 rounded-xl border border-white/5">
                      Joined: {user.joinedDate}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <ShieldAlert size={36} className="text-gray-600 animate-pulse" />
                  <p className="text-xs font-bold text-gray-400">No matching athlete found</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Status */}
            <div className="p-6 border-t border-white/5 bg-[#1a1a1a]/40 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[8px] font-extrabold text-gray-400 uppercase tracking-wider">Ride Operated By</span>
                <span className="text-xs font-extrabold text-white mt-0.5">{rideDetails.host}</span>
              </div>
              <button 
                onClick={() => setIsRosterOpen(false)}
                className="bg-[#eb712a] hover:bg-[#d66525] text-white px-5 py-3.5 rounded-xl font-extrabold text-[10px] tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-orange-500/10 hover:-translate-y-0.5 active:translate-y-0"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline animations and scrollbar design */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default RideJoining;