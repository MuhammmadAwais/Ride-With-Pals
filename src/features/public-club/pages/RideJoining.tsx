import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Copy, Zap, Bike, Award, CheckCircle2, Users, Search, X, Check, ShieldAlert, Bookmark
} from "lucide-react";
import { toast } from "sonner";
import { useGetRideInfoByIdQuery, useJoinRideMutation } from "@/features/club/api/clubApiSlice";
import { useSaveRideMutation, useUnsaveRideMutation } from "@/features/club/api/savedRidesApiSlice";


import L from 'leaflet';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

const RideJoining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);

  const [mapCenter, setMapCenter] = useState<[number, number]>([45.9184, 6.5862]);
  {mapCenter}

  const rideIdNum = id ? Number(id) : 0;
  const { data: rideResponse, isLoading: loading } = useGetRideInfoByIdQuery(
    { rideId: rideIdNum },
    { skip: !rideIdNum }
  );

  const [joinRide] = useJoinRideMutation();
  const [saveRide] = useSaveRideMutation();
  const [unsaveRide] = useUnsaveRideMutation();
  
  const [isJoined, setIsJoined] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Sync statuses once data loads
  useEffect(() => {
    if (rideResponse && rideResponse.isJoined) {
      setIsJoined(true);
    }
  }, [rideResponse]);

  const rideDetails = useMemo(() => {
    if (!rideResponse) return null;
    const data = rideResponse;
    const meetingPointStr = data.meetingPoint || "TBD";
    
    const leaders = data.rideLeaders?.map((leader: any) => ({
      name: leader.name || "Leader",
      role: "Leader"
    })) || [];
    if (leaders.length === 0 && data.userId) {
      leaders.push({ name: "Host", role: "Host" });
    }

    let bannerImage = "/Images/CycleImage2.png";
    const dataAny = data as any;
    const logoPath = dataAny.club?.logo || dataAny.club?.coverImage || dataAny.logo || dataAny.coverImage || dataAny.image;
    if (logoPath && logoPath !== "null" && logoPath.trim() !== "") {
      bannerImage = (logoPath.startsWith("http://") || logoPath.startsWith("https://") || logoPath.startsWith("/"))
        ? logoPath
        : `https://api.ridewithpals.com/uploads/${logoPath}`;
    }

    return {
      id: data.id || id,
      clubId: data.clubId || data.club?.id,
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      title: data.rideName || "Ride Event",
      host: "Organizer",
      date: data.date ? new Date(data.date).toLocaleDateString() : "TBD",
      type: data.isAsphalt ? "Road Ride" : data.isTrail ? "Trail Ride" : "Ride",
      avgPace: data.pace || "N/A",
      distance: data.distance ? `${data.distance} km` : "N/A",
      activeParticipants: `${data.joinedParticipants?.length || 0} Riders`,
      maxSlope: data.maxSlope ? `${data.maxSlope}%` : "N/A",
      supportCar: data.supportCarDriver ? "Available" : "Not Available",
      elevationGain: data.elevationGain,
      hasLiveBeacon: data.hasLiveBeacon,
      image: bannerImage,
      description: data.description || "No description provided.",
      recommendedBike: data.isTrail ? "MTB / Gravel" : "Road Bike",
      leaders,
      participants: data.joinedParticipants || [],
      meetingPoint: meetingPointStr
    };
  }, [rideResponse, id]);

  const meetingPoint = rideDetails?.meetingPoint;
  useEffect(() => {
    if (meetingPoint && meetingPoint !== "TBD") {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(meetingPoint)}`)
        .then(res => res.json())
        .then(geoData => {
          if (geoData && geoData.length > 0) {
            setMapCenter([parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)]);
          }
        })
        .catch(err => console.error("Geocoding failed", err));
    }
  }, [meetingPoint]);

  const handleJoinClick = async () => {
    if (rideDetails && !rideDetails.isPublic) {
      toast.error("This is a private ride! Redirecting to the club...");
      if (rideDetails.clubId) {
        navigate(`/view/userside/club/${rideDetails.clubId}`);
      }
      return;
    }
    try {
      if (id) {
        await joinRide({ rideId: Number(id) }).unwrap();
        setIsJoined(true);
        toast.success("Successfully joined the ride!");
      }
    } catch (error: any) {
      console.error("Failed to join ride:", error);
      if (error?.status === 403 || error?.data?.message?.toLowerCase().includes("private")) {
        toast.error("This is a private ride! You must join the club first.");
        if (rideDetails?.clubId) {
          navigate(`/view/userside/club/${rideDetails.clubId}`);
        }
      } else {
        toast.error("Failed to join the ride or permission denied.");
      }
    }
  };

  const handleToggleSave = async () => {
    try {
      if (id) {
        if (isSaved) {
          await unsaveRide({ rideId: Number(id) }).unwrap();
          setIsSaved(false);
          toast.success("Ride removed from saved list");
        } else {
          await saveRide({ rideId: Number(id) }).unwrap();
          setIsSaved(true);
          toast.success("Ride saved successfully!");
        }
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast.error("Failed to save the ride.");
    }
  };

  const handleShare = async () => {
    if (rideDetails) {
      const shareUrl = `https://velohub.cc/ride/${rideDetails.id}`;
      await navigator.clipboard.writeText(shareUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const activeParticipants = useMemo(() => {
    return rideDetails?.participants?.map((p: any) => {
      const initials = p.name ? p.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'R';
      return {
        name: p.name || 'Anonymous Rider',
        initials,
        role: 'Participant',
        joinedDate: 'N/A',
        verified: false,
        profilePhoto: p.profile || null
      };
    }) || [];
  }, [rideDetails]);

  const filteredRoster = activeParticipants.filter((user: any) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !rideDetails) {
    return (
      <div className="min-h-screen text-text-main p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#EB712B]"></div>
          <p className="mt-4 text-xs font-bold text-text-muted uppercase tracking-wider">Loading Ride Details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-text-main p-4 md:p-8 font-sans select-none relative antialiased">
      
      <div 
        className={`fixed bottom-6 right-6 bg-surface border border-[#EB712B]/40 text-text-main px-5 py-3.5 rounded-2xl shadow-[0_10px_40px_-15px_rgba(235,113,43,0.3)] flex items-center gap-3 z-50 transition-all duration-300 transform ${
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
          className="flex items-center gap-2.5 text-text-muted hover:text-text-main font-bold text-xs bg-surface border border-border px-5 py-3.5 rounded-2xl w-max transition-all duration-300 cursor-pointer hover:border-[#EB712B]/40 hover:bg-hover hover:-translate-y-0.5 active:translate-y-0"
        >
          <ArrowLeft size={16} /> Back to rides
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Ride Image Banner */}
            <div className="relative h-[380px] w-full bg-surface border border-border rounded-3xl p-2.5 overflow-hidden shadow-2xl group">
              <div className="h-full w-full rounded-2xl overflow-hidden relative z-0">
                <img 
                  src={rideDetails.image} 
                  alt={rideDetails.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/Images/CycleImage2.png"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-main-bg/80 via-transparent to-black/20" />
              </div>

              {/* Glassmorphic Map Overlay Details */}
              <div className="absolute top-6 left-6 right-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pointer-events-none z-10">
                <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-[#EB712B] animate-pulse" /> Elevation Gain: {rideDetails.elevationGain ? `${rideDetails.elevationGain}m` : 'N/A'}
                </div>
                {rideDetails.hasLiveBeacon && (
                  <div className="bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 text-[10px] font-extrabold uppercase tracking-wider text-green-400 flex items-center gap-2 shadow-lg">
                    Live Beacon Active <CheckCircle2 size={14} />
                  </div>
                )}
              </div>
            </div>

            {/* Event Title & Metadata */}
            <div className="bg-surface border border-border rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-border">
              <div className="absolute top-0 right-0 w-56 h-56 bg-[#EB712B]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start gap-4 z-10 relative">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-[#eb712a]">
                    <Zap size={12} /> {rideDetails.type} • {rideDetails.date}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main leading-tight flex items-center gap-3">
                    {rideDetails.title}
                  </h1>
                  <p className="text-xs font-bold text-text-muted tracking-wide">
                    Hosted by <span className="text-text-main font-semibold">{rideDetails.host}</span>
                  </p>
                </div>

                {/* Share Link Actions */}
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={handleToggleSave}
                    className={`w-11 h-11 border rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 ${
                      isSaved 
                        ? "bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]" 
                        : "bg-hover border-border text-text-muted hover:text-text-main"
                    }`}
                    title={isSaved ? "Unsave Ride" : "Save Ride"}
                  >
                    <Bookmark size={16} fill={isSaved ? "#EB712B" : "none"} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 bg-hover border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-text-main transition-all duration-300 cursor-pointer hover:border-border hover:-translate-y-0.5 active:translate-y-0"
                    title="Share Ride"
                  >
                    <Share2 size={16} />
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-11 h-11 bg-hover border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-text-main transition-all duration-300 cursor-pointer hover:border-border hover:-translate-y-0.5 active:translate-y-0"
                    title="Copy Link"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Clickable Quick-Copy Link Box */}
              <div 
                onClick={handleShare}
                className="flex items-center justify-between bg-hover border border-border px-5 py-3.5 rounded-2xl cursor-pointer hover:border-[#EB712B]/40 transition-all duration-300 group hover:shadow-[0_0_25px_rgba(235,113,43,0.1)]"
              >
                <span className="text-[11px] text-text-muted font-mono truncate select-all group-hover:text-text-main">
                  https://velohub.cc/ride/{rideDetails.id}
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-[#EB712B]/10 text-text-muted px-3 py-1.5 rounded-xl group-hover:bg-[#EB712B] group-hover:text-white transition-colors">
                  Tap to Copy
                </span>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-3 gap-4 pt-2 z-10 relative">
                <div className="bg-hover border border-border p-5 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center transition-all duration-300 hover:border-border">
                  <div className="text-base font-extrabold text-[#EB712B] tracking-tight">{rideDetails.avgPace}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">Average Pace</div>
                </div>
                <div className="bg-hover border border-border p-5 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center transition-all duration-300 hover:border-border">
                  <div className="text-base font-extrabold text-text-main tracking-tight">{rideDetails.distance}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">Total Distance</div>
                </div>
                <div className="bg-hover border border-border p-5 rounded-2xl text-center space-y-2 flex flex-col items-center justify-center transition-all duration-300 hover:border-border">
                  <div className="text-base font-extrabold text-text-main tracking-tight">{rideDetails.activeParticipants}</div>
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">Participants</div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-4 border-t border-border pt-6 z-10 relative">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-main">Ride Description</h4>
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line font-medium border-l-2 border-[#EB712B]/40 pl-4 py-1">
                  {rideDetails.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Recommended Bike & Join Card */}
            <div className="bg-surface border border-border rounded-3xl p-8 space-y-6 shadow-xl transition-all duration-300 hover:border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-text-muted">Recommended Bike</span>
                  <h3 className="text-xs font-extrabold text-[#eb712a] tracking-tight bg-hover border border-[#EB712B]/20 px-4 py-2 rounded-xl w-max">
                    {rideDetails.recommendedBike}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-hover border border-border flex items-center justify-center shrink-0 shadow-inner">
                  <Bike size={22} className="text-text-muted" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-hover p-5 rounded-2xl border border-border text-xs">
                <div>
                  <div className="text-[9px] font-extrabold uppercase text-text-muted tracking-wider">Max Slope</div>
                  <div className="font-extrabold text-text-main mt-1 tracking-tight text-sm">{rideDetails.maxSlope}</div>
                </div>
                <div>
                  <div className="text-[9px] font-extrabold uppercase text-text-muted tracking-wider">Support Car</div>
                  <div className="font-extrabold text-green-500 mt-1 tracking-tight text-sm">{rideDetails.supportCar}</div>
                </div>
              </div>

              <button 
                onClick={handleJoinClick}
                disabled={isJoined}
                className={`w-full py-5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2.5 transition-all duration-300 shadow-[0_10px_30px_rgba(235,113,43,0.2)] tracking-wide text-white ${
                  isJoined 
                    ? "bg-green-600 cursor-not-allowed opacity-90" 
                    : "bg-[#eb712a] hover:bg-[#d66525] cursor-pointer hover:-translate-y-1 active:translate-y-0"
                }`}
              >
                {isJoined ? "✓ Joined" : "🚴 Join Elite Ride"}
              </button>

              <div className="text-[9px] font-bold text-center text-text-muted tracking-wide italic">
                *Act fast! Limited availability to secure your spot.
              </div>
            </div>

            {/* Ride Leaders */}
            <div className="bg-surface border border-border rounded-3xl p-8 space-y-5 shadow-xl transition-all duration-300 hover:border-border">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-main">Ride Leaders</h4>
              <div className="space-y-3">
                {rideDetails.leaders.map((leader: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between bg-hover p-4 rounded-2xl border border-border transition-all duration-300 hover:border-border">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-main-bg border border-border flex items-center justify-center font-extrabold text-[11px] text-text-main shadow-md uppercase tracking-wider">
                        {leader.name.split(" ").map((n: string) => n[0]).join("")}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-text-main leading-tight tracking-tight">{leader.name}</span>
                        <span className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider mt-1">{leader.role}</span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-main-bg border border-border flex items-center justify-center text-[9px] text-emerald-500">
                      <Award size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants Grid Widget */}
            <div className="bg-surface border border-border rounded-3xl p-8 space-y-5 shadow-xl transition-all duration-300 hover:border-border">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-main">Participants</h4>
                <span className="text-[9px] font-extrabold bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#eb712a] tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Users size={10} /> {activeParticipants.length} Active
                </span>
              </div>
              
              <div className="flex flex-wrap gap-3 py-1 items-center">
                {activeParticipants.slice(0, 8).map((p: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="w-10 h-10 rounded-2xl bg-hover border border-border flex items-center justify-center font-extrabold text-[10px] text-text-main shadow-md hover:scale-110 hover:border-[#EB712B]/40 transition-all duration-300 cursor-pointer ring-1 ring-black/20 overflow-hidden"
                    title={p.name}
                  >
                    {p.profilePhoto ? (
                      <img src={p.profilePhoto} className="w-full h-full object-cover" alt="" />
                    ) : (
                      p.initials
                    )}
                  </div>
                ))}
                {activeParticipants.length > 8 && (
                  <div 
                    onClick={() => setIsRosterOpen(true)}
                    className="w-10 h-10 rounded-2xl bg-hover border border-border flex items-center justify-center font-extrabold text-[10px] text-text-main cursor-pointer hover:bg-border transition-all duration-300 hover:scale-110"
                  >
                    +{activeParticipants.length - 8}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsRosterOpen(true)}
                className="w-full bg-hover hover:bg-border border border-border py-4 rounded-2xl text-xs font-extrabold text-text-main transition-all duration-300 cursor-pointer tracking-tight flex items-center justify-center gap-2.5 hover:border-border hover:-translate-y-0.5 active:translate-y-0"
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
          <div className="relative w-full max-w-md h-full bg-surface border-l border-border shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <h3 className="font-extrabold text-text-main text-base tracking-tight">Ride Roster</h3>
                <p className="text-[10px] text-text-muted font-medium">Manage and view registered participants</p>
              </div>
              <button 
                onClick={() => setIsRosterOpen(false)}
                className="w-11 h-11 rounded-2xl bg-hover hover:bg-border border border-border flex items-center justify-center text-text-muted hover:text-text-main transition-all duration-300 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Global Roster Search */}
            <div className="p-5 border-b border-border relative shrink-0">
              <Search className="absolute left-8 top-1/2 transform -translate-y-1/2 text-text-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search participant name..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-hover border border-border pl-10 pr-4 py-3.5 rounded-2xl text-xs font-bold text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/40 transition-colors"
              />
            </div>

            {/* Scrollable Participants Directory */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {filteredRoster.length > 0 ? (
                filteredRoster.map((user: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between bg-hover p-4.5 rounded-2xl border border-border group hover:border-border transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-main-bg border border-border flex items-center justify-center font-extrabold text-xs text-text-main shadow-md uppercase tracking-wider shrink-0">
                        {user.initials}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-text-main leading-tight tracking-tight">
                            {user.name}
                          </span>
                          {user.verified && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                              <Check size={10} />
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="text-[8px] font-extrabold text-text-main tracking-wider bg-main-bg px-3 py-1.5 rounded-xl border border-border">
                      Joined: {user.joinedDate}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <ShieldAlert size={36} className="text-text-muted animate-pulse" />
                  <p className="text-xs font-bold text-text-muted">No matching athlete found</p>
                </div>
              )}
            </div>

            {/* Drawer Footer Status */}
            <div className="p-6 border-t border-border bg-hover/40 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Ride Operated By</span>
                <span className="text-xs font-extrabold text-text-main mt-0.5">{rideDetails.host}</span>
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

      {/* Inline animations */}
      <style>{`
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