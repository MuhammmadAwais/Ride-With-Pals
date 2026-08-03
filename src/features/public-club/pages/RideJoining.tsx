/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Bike, Award, CheckCircle2, Users, Search, X, Check, ShieldAlert, Bookmark, MapPin, Gauge, Navigation,  FileText
} from "lucide-react";
import { toast } from "sonner";
import { useGetRideInfoByIdQuery, useJoinRideMutation, useGetJoinedClubsQuery } from "@/features/club/api/clubApiSlice";
import { useSaveRideMutation, useUnsaveRideMutation } from "@/features/club/api/savedRidesApiSlice";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ClubService } from "@/features/club/services/clubService";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createStartIcon = () => {
  return L.divIcon({
    className: "custom-start-pin",
    html: `<div style="
      width: 32px;
      height: 32px;
      background-color: #EB712B;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const createEndIcon = () => {
  return L.divIcon({
    className: "custom-end-pin",
    html: `<div style="
      width: 32px;
      height: 32px;
      background-color: #EF4444;
      border: 3px solid #ffffff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const RideJoining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [startCoords, setStartCoords] = useState<[number, number]>([33.5935, 73.1381]); // Islamabad default
  const [endCoords, setEndCoords] = useState<[number, number]>([33.5415, 73.1785]); // Islamabad default
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([
    [33.5935, 73.1381],
    [33.5680, 73.1550],
    [33.5415, 73.1785]
  ]);

  const rideIdNum = id ? Number(id) : 0;
  const { data: rideResponse, isLoading: loading } = useGetRideInfoByIdQuery(
    { rideId: rideIdNum },
    { skip: !rideIdNum }
  );

  const [joinRide] = useJoinRideMutation();
  const [saveRide] = useSaveRideMutation();
  const [unsaveRide] = useUnsaveRideMutation();
  
  const [localJoined, setLocalJoined] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data: joinedClubsData } = useGetJoinedClubsQuery();
  const joinedRows = joinedClubsData?.rows || [];
  const { myClubs } = useAppSelector((s) => s.club);

  const isClubMemberOrOwner = useMemo(() => {
    if (!rideResponse) return false;
    const cid = Number((rideResponse as any)?.clubId || (rideResponse as any)?.club?.id);
    if (!cid) return false;
    return (
      joinedRows.some((c: any) => Number(c.id) === cid) ||
      myClubs.some((c: any) => Number(c.id) === cid)
    );
  }, [rideResponse, joinedRows, myClubs]);

  const isJoined = Boolean((rideResponse as any)?.isJoined || localJoined);

  const rideDetails = useMemo(() => {
    if (!rideResponse) return null;
    const data = rideResponse;
    const dataAny = data as any;
    
    const meetingPointStr = data.meetingPoint || dataAny.startLocation || dataAny.startPoint || "Ghauri Town Phase 2, Zone IV, Islamabad Capital Territory, 46330, Pakistan";
    const endPointStr = dataAny.endPoint || dataAny.endLocation || dataAny.destination || dataAny.endMeetingPoint || "Jinnah Garden, Zone V, Islamabad Capital Territory, 45750, Pakistan";
    
    const rawActivityType = dataAny.activityTypeName || dataAny.activityType?.name || (dataAny.activityTypeId === 1 ? "Cycling" : dataAny.activityTypeId === 2 ? "Running" : dataAny.activityTypeId === 3 ? "Triathlon" : dataAny.activityTypeId === 4 ? "Swimming" : null);
    const sportType = rawActivityType || (data.isAsphalt ? "Cycling" : data.isTrail ? "Running" : "Cycling");

    const leaders = data.rideLeaders?.map((leader: any) => ({
      name: leader.name || leader.fullName || "Leader",
      role: "Leader",
      profilePhoto: leader.profileImage || leader.profile || null
    })) || [];
    if (leaders.length === 0 && data.userId) {
      leaders.push({ name: "Host", role: "Host", profilePhoto: null });
    }

    let bannerImage = "/Images/CycleImage2.png";
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
      title: data.rideName || "test ride",
      host: dataAny.user?.fullName || "Organizer",
      date: data.date ? new Date(data.date).toLocaleDateString() : "TBD",
      type: sportType,
      avgPace: data.pace ? `${data.pace}` : "010 min/km",
      distance: data.distance ? `${data.distance} km` : "7 km",
      activeParticipants: `${data.joinedParticipants?.length || 0} Riders`,
      participantsCount: data.joinedParticipants?.length || 0,
      startLocation: meetingPointStr,
      endLocation: endPointStr,
      gpxFile: dataAny.gpxFile || null,
      maxSlope: dataAny.maxSlope ? `${dataAny.maxSlope}%` : "0%",
      supportCar: data.supportCarDriver ? "Available" : "Not Available",
      elevationGain: dataAny.elevationGain || 0,
      hasLiveBeacon: dataAny.hasLiveBeacon || false,
      image: bannerImage,
      description: data.description || "No description provided.",
      leaders,
      participants: data.joinedParticipants || []
    };
  }, [rideResponse, id]);

  useEffect(() => {
    if (!rideDetails) return;

    let isMounted = true;

    const resolveCoordinates = async () => {
      try {
        if (rideDetails.gpxFile && typeof rideDetails.gpxFile === "string" && (rideDetails.gpxFile.startsWith("http") || rideDetails.gpxFile.startsWith("/"))) {
          try {
            const res = await fetch(rideDetails.gpxFile);
            const text = await res.text();
            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "application/xml");
            const points = xml.querySelectorAll("trkpt, rtept, wpt");
            const coords: [number, number][] = [];
            points.forEach((pt) => {
              const lat = parseFloat(pt.getAttribute("lat") || "0");
              const lon = parseFloat(pt.getAttribute("lon") || "0");
              if (lat && lon) coords.push([lat, lon]);
            });
            if (coords.length >= 2 && isMounted) {
              setRoutePolyline(coords);
              setStartCoords(coords[0]);
              setEndCoords(coords[coords.length - 1]);
              return;
            }
          } catch (e) {
            console.warn("Could not parse GPX file, falling back to Nominatim Geocoding", e);
          }
        }

        const startRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rideDetails.startLocation)}`
        ).then(r => r.json()).catch(() => []);
        
        const endRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(rideDetails.endLocation)}`
        ).then(r => r.json()).catch(() => []);

        if (!isMounted) return;

        const startPt: [number, number] = (startRes && startRes.length > 0)
          ? [parseFloat(startRes[0].lat), parseFloat(startRes[0].lon)]
          : [33.5935, 73.1381];

        const endPt: [number, number] = (endRes && endRes.length > 0)
          ? [parseFloat(endRes[0].lat), parseFloat(endRes[0].lon)]
          : [33.5415, 73.1785];

        setStartCoords(startPt);
        setEndCoords(endPt);

        const midLat = (startPt[0] + endPt[0]) / 2 + 0.003;
        const midLon = (startPt[1] + endPt[1]) / 2;
        setRoutePolyline([startPt, [midLat, midLon], endPt]);
      } catch (err) {
        console.error("Coordinate resolution error:", err);
      }
    };

    resolveCoordinates();

    return () => {
      isMounted = false;
    };
  }, [rideDetails]);

  const handleJoinClick = async () => {
    if (rideDetails && !rideDetails.isPublic && !isClubMemberOrOwner) {
      toast.error("This is a private ride! You must join the club first.");
      if (rideDetails.clubId) {
        navigate(`/view/userside/club/${rideDetails.clubId}`);
      }
      return;
    }
    try {
      if (id) {
        await joinRide({ rideId: Number(id) }).unwrap();
        setLocalJoined(true);
        toast.success("Successfully joined the activity!");
      }
    } catch (error: any) {
      console.error("Failed to join ride:", error);
      const isPrivateOrForbidden = error?.status === 403 || error?.data?.message?.toLowerCase().includes("private") || error?.data?.message?.toLowerCase().includes("club");
      if (rideDetails?.clubId && (isPrivateOrForbidden || isClubMemberOrOwner)) {
        try {
          await ClubService.joinClub(Number(rideDetails.clubId));
          await joinRide({ rideId: Number(id) }).unwrap();
          setLocalJoined(true);
          toast.success("Successfully joined the activity!");
          return;
        } catch (retryErr: any) {
          console.error("Retry join ride after joinClub failed:", retryErr);
        }
      }

      if (error?.status === 403 || error?.data?.message?.toLowerCase().includes("private")) {
        toast.error("You must join the club first. Incase if you already a member subscribe to membership of this club.");
        if (rideDetails?.clubId) {
          navigate(`/view/userside/club/${rideDetails.clubId}`);
        }
      } else {
        toast.error(error?.data?.message || "Failed to join the activity.");
      }
    }
  };

  const handleToggleSave = async () => {
    try {
      if (id) {
        if (isSaved) {
          await unsaveRide({ rideId: Number(id) }).unwrap();
          setIsSaved(false);
          toast.success("Activity removed from saved list");
        } else {
          await saveRide({ rideId: Number(id) }).unwrap();
          setIsSaved(true);
          toast.success("Activity saved successfully!");
        }
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast.error("Failed to save the activity.");
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
          <p className="mt-4 text-xs font-bold text-text-muted uppercase tracking-wider">Loading Activity Details...</p>
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

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Interactive Google Map Banner */}
        <div className="relative w-full h-[420px] md:h-[480px] rounded-3xl overflow-hidden border border-border shadow-2xl">
          <MapContainer 
            center={startCoords} 
            zoom={13} 
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#1a1a1a" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com/">Google</a>'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
            <Marker position={startCoords} icon={createStartIcon()}>
              <Popup className="font-sans text-xs">
                <strong>Start:</strong> {rideDetails.startLocation}
              </Popup>
            </Marker>
            <Marker position={endCoords} icon={createEndIcon()}>
              <Popup className="font-sans text-xs">
                <strong>End:</strong> {rideDetails.endLocation}
              </Popup>
            </Marker>
            <Polyline positions={routePolyline} color="#EB712B" weight={5} opacity={0.9} />
          </MapContainer>

          {/* Map Controls Overlay */}
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-5 left-5 z-[400] w-12 h-12 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
            title="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="absolute top-5 right-5 z-[400] flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="w-12 h-12 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
              title="Share Activity"
            >
              <Share2 size={20} />
            </button>
            <button 
              onClick={() => toast.info("Activity chat room opening...")}
              className="w-12 h-12 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
              title="Activity Chat"
            >
              <Users size={20} />
            </button>
          </div>
        </div>

        {/* Activity Details Card (Matching Mobile Screen 1) */}
        <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main leading-tight">
              {rideDetails.title}
            </h1>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={handleToggleSave}
                className={`w-11 h-11 border rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                  isSaved 
                    ? "bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]" 
                    : "bg-hover border-border text-text-muted hover:text-text-main"
                }`}
                title={isSaved ? "Unsave Activity" : "Save Activity"}
              >
                <Bookmark size={16} fill={isSaved ? "#EB712B" : "none"} />
              </button>
              <button 
                onClick={handleShare}
                className="w-11 h-11 bg-hover border border-border rounded-2xl flex items-center justify-center text-text-muted hover:text-text-main transition-all duration-300 cursor-pointer"
                title="Share Activity"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Start / End Location & Sport Type Specs */}
          <div className="space-y-3.5 pt-2 border-t border-border/60">
            <div className="flex items-start gap-3.5">
              <MapPin size={18} className="text-[#EB712B] shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm font-medium text-text-main leading-relaxed">
                <span className="font-extrabold text-text-muted mr-1.5">Start:</span>
                {rideDetails.startLocation}
              </p>
            </div>

            <div className="flex items-start gap-3.5">
              <MapPin size={18} className="text-[#EB712B] shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm font-medium text-text-main leading-relaxed">
                <span className="font-extrabold text-text-muted mr-1.5">End:</span>
                {rideDetails.endLocation}
              </p>
            </div>

            <div className="flex items-center gap-3.5">
              <Bike size={18} className="text-[#EB712B] shrink-0" />
              <span className="text-xs md:text-sm font-extrabold text-text-main">
                {rideDetails.type}
              </span>
            </div>
          </div>

          {/* 3 Metrics Cards Grid */}
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="bg-hover border border-border p-4 md:p-5 rounded-2xl relative flex flex-col justify-between overflow-hidden">
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-main tracking-tight">{rideDetails.avgPace}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mt-1">Pace</div>
              </div>
              <Gauge size={20} className="text-[#EB712B] absolute bottom-3 right-3 opacity-80" />
            </div>

            <div className="bg-hover border border-border p-4 md:p-5 rounded-2xl relative flex flex-col justify-between overflow-hidden">
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-main tracking-tight">{rideDetails.distance}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mt-1">Distance</div>
              </div>
              <Navigation size={20} className="text-[#EB712B] absolute bottom-3 right-3 opacity-80" />
            </div>

            <div className="bg-hover border border-border p-4 md:p-5 rounded-2xl relative flex flex-col justify-between overflow-hidden">
              <div>
                <div className="text-base md:text-lg font-extrabold text-text-main tracking-tight">{rideDetails.participantsCount}</div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mt-1">Participants</div>
              </div>
              <Users size={20} className="text-[#EB712B] absolute bottom-3 right-3 opacity-80" />
            </div>
          </div>

          {/* Verification Check (Terms & Conditions Checkbox) */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/60">
            <input 
              type="checkbox" 
              id="accept-terms-checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-5 h-5 rounded border-border text-[#EB712B] focus:ring-[#EB712B] cursor-pointer"
            />
            <label htmlFor="accept-terms-checkbox" className="text-xs md:text-sm text-text-main font-medium select-none cursor-pointer">
              I have read and accept the{" "}
              <button 
                type="button" 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                className="text-[#EB712B] font-extrabold underline hover:text-[#d66525] cursor-pointer"
              >
                Terms & Conditions.
              </button>
            </label>
          </div>

          {/* Click to Join Activity Button */}
          <button 
            onClick={() => {
              if (!acceptTerms && !isJoined) {
                toast.error("Please read and accept the Terms & Conditions before joining.");
                return;
              }
              handleJoinClick();
            }}
            disabled={isJoined}
            className={`w-full py-4 px-3 rounded-full font-extrabold text-xs md:text-sm flex items-center justify-between transition-all duration-300 tracking-wide text-white cursor-pointer ${
              isJoined 
                ? "bg-emerald-600 cursor-not-allowed opacity-90" 
                : "bg-[#2A2A2A] hover:bg-[#333333] border border-[#3A3A3A]"
            }`}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isJoined ? "bg-emerald-500" : "bg-[#EB712B]"}`}>
              {<CheckCircle2 size={20} /> }
            </div>
            <span className="flex-1 text-center pr-11 font-extrabold tracking-tight">
              {isJoined ? "✓ You Have Joined This Activity" : "Click to Join Activity"}
            </span>
          </button>
        </div>

        {/* Ride Leaders */}
        <div className="bg-surface border border-border rounded-3xl p-8 space-y-5 shadow-xl">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-text-main">Ride Leaders</h4>
          <div className="space-y-3">
            {rideDetails.leaders.map((leader: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-hover p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-main-bg border border-border flex items-center justify-center font-extrabold text-[11px] text-text-main shadow-md uppercase tracking-wider overflow-hidden">
                    {leader.profilePhoto ? (
                      <img src={leader.profilePhoto} className="w-full h-full object-cover" alt="" />
                    ) : (
                      leader.name.split(" ").map((n: string) => n[0]).join("")
                    )}
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
        <div className="bg-surface border border-border rounded-3xl p-8 space-y-5 shadow-xl">
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
                className="w-10 h-10 rounded-2xl bg-hover border border-border flex items-center justify-center font-extrabold text-[10px] text-text-main shadow-md hover:scale-110 transition-all duration-300 cursor-pointer overflow-hidden"
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
            className="w-full bg-hover hover:bg-border border border-border py-4 rounded-2xl text-xs font-extrabold text-text-main transition-all duration-300 cursor-pointer tracking-tight flex items-center justify-center gap-2.5"
          >
            <Users size={14} /> View Full Roster
          </button>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowTermsModal(false)}
          />
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl z-10 animate-scale-up">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="text-[#EB712B]" size={20} />
                <h3 className="font-extrabold text-base md:text-lg text-text-main">Terms & Conditions</h3>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-9 h-9 rounded-xl bg-hover border border-border flex items-center justify-center text-text-muted hover:text-text-main cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-text-muted leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <h4 className="font-extrabold text-text-main mb-1">1. Safety & Helmet Policy</h4>
                <p>Mandatory helmet and safety gear for all participants. Riders must ensure their bicycle or running gear is in safe working order prior to the start of the activity.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-text-main mb-1">2. Traffic Laws & Compliance</h4>
                <p>All participants must obey local traffic signals, laws, and regulations. Riders are responsible for their own safety on public roads and trails.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-text-main mb-1">3. Assumption of Risk & Liability Release</h4>
                <p>By joining this activity, you acknowledge the inherent risks associated with outdoor sporting activities and release the activity host, ride leaders, and Ride With Pals from any liability.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-text-main mb-1">4. Community Code of Conduct</h4>
                <p>Treat all fellow riders, leaders, and members of the public with respect and sportsmanship throughout the activity.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border bg-hover font-bold text-xs text-text-muted hover:text-text-main cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAcceptTerms(true);
                  setShowTermsModal(false);
                  toast.success("Terms accepted!");
                }}
                className="px-5 py-2.5 rounded-xl bg-[#EB712B] hover:bg-[#d66525] font-extrabold text-xs text-white cursor-pointer shadow-lg shadow-orange-500/20"
              >
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Slide-Over Roster Directory Drawer */}
      {isRosterOpen && (
        <div className="fixed inset-0 z-[99999] flex justify-end">
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