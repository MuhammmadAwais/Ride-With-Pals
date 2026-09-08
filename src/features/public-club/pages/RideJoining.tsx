/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Share2, Bike, Award, CheckCircle2, Users, Search, X, Check, ShieldAlert, Bookmark, 
  MapPin, Gauge, Navigation, FileText, MessageSquare, Calendar, Download, ShieldCheck, Clock, 
  Lock, TrendingUp, Activity as ActivityIcon, Trophy, Compass, Mail, Plus, Minus, Building2, LogOut,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { cn } from "@/lib/utils";

export interface ParticipantRow {
  id: number | string;
  name: string;
  username: string;
  email: string;
  initials: string;
  role: string;
  joinedDate: string;
  verified: boolean;
  profilePhoto: string | null;
}
import { useGetRideInfoByIdQuery, useJoinRideMutation, useLeaveRideMutation, useGetJoinedClubsQuery } from "@/features/club/api/clubApiSlice";
import { useSaveRideMutation, useUnsaveRideMutation } from "@/features/club/api/savedRidesApiSlice";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ClubService } from "@/features/club/services/clubService";
import { UniversalShareModal } from "@/components/common/UniversalShareModal";
import { GoogleCalendarIcon } from "@/components/common/GoogleCalendarIcon";
import { buildGoogleCalendarUrl, downloadGpxFile, extractTerrainAndCategoryBadges, getRideSportType } from "../utils/activityUtils";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const resolveAvatarUrl = (path?: string | null) => {
  if (!path || typeof path !== "string" || path === "null" || path === "undefined" || path.trim() === "") return null;
  const clean = path.trim();
  if (clean === "null" || clean === "undefined") return null;
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  if (clean.startsWith("/")) {
    return clean;
  }
  const stripped = clean.replace(/^uploads\//, '');
  return `https://api.ridewithpals.com/uploads/${stripped}`;
};

const resolveGpxUrl = (path?: string | null) => {
  if (!path || path === "null" || path.trim() === "") return null;
  const clean = path.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("/")) {
    return clean;
  }
  return `https://api.ridewithpals.com/uploads/${clean}`;
};

const formatDisplayTime = (timeStr?: string) => {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length >= 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (isNaN(hours)) return timeStr;
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

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
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
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
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
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

// Multi-strategy GPX parser extracting coordinates, elevation, and length
const parseGpxText = (text: string) => {
  try {
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "application/xml");
    
    let trackPoints: Element[] = Array.from(xml.querySelectorAll("trkpt, rtept, wpt"));
    if (trackPoints.length === 0) {
      trackPoints = [
        ...Array.from(xml.getElementsByTagName("trkpt")),
        ...Array.from(xml.getElementsByTagName("rtept")),
        ...Array.from(xml.getElementsByTagName("wpt"))
      ];
    }
    if (trackPoints.length === 0) {
      trackPoints = [
        ...Array.from(xml.getElementsByTagNameNS("*", "trkpt")),
        ...Array.from(xml.getElementsByTagNameNS("*", "rtept")),
        ...Array.from(xml.getElementsByTagNameNS("*", "wpt"))
      ];
    }

    const coords: [number, number][] = [];
    let totalDistKm = 0;
    let totalEleGainM = 0;
    let prevEle: number | null = null;

    trackPoints.forEach((pt) => {
      const lat = parseFloat(pt.getAttribute("lat") || "0");
      const lon = parseFloat(pt.getAttribute("lon") || "0");
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        coords.push([lat, lon]);

        if (coords.length > 1) {
          const prev = coords[coords.length - 2];
          const dLat = (lat - prev[0]) * (Math.PI / 180);
          const dLon = (lon - prev[1]) * (Math.PI / 180);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(prev[0] * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          totalDistKm += 6371 * c;
        }

        const eleNode = pt.querySelector("ele") || pt.getElementsByTagName("ele")[0];
        if (eleNode && eleNode.textContent) {
          const ele = parseFloat(eleNode.textContent);
          if (!isNaN(ele)) {
            if (prevEle !== null && ele > prevEle) {
              totalEleGainM += ele - prevEle;
            }
            prevEle = ele;
          }
        }
      }
    });

    return {
      coords,
      totalDistKm: totalDistKm > 0 ? totalDistKm.toFixed(1) : null,
      totalEleGainM: totalEleGainM > 0 ? Math.round(totalEleGainM) : null
    };
  } catch (err) {
    console.error("GPX parse error", err);
    return { coords: [], totalDistKm: null, totalEleGainM: null };
  }
};

// Smart progressive geocoder that handles road codes (e.g., C-148a) and city strings
const geocodeAddress = async (query: string): Promise<[number, number] | null> => {
  if (!query || !query.trim()) return null;

  const tryQueries = [
    query.trim(),
    query.replace(/^[A-Z0-9-]+\s*,\s*/i, "").trim(),
    query.split(",").slice(1).join(",").trim(),
    query.split(",").slice(-3).join(",").trim(),
    query.split(",").slice(-2).join(",").trim()
  ].filter((q, idx, arr) => q.length > 2 && arr.indexOf(q) === idx);

  for (const q of tryQueries) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
        { headers: { Accept: "application/json" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          if (!isNaN(lat) && !isNaN(lon) && (lat !== 0 || lon !== 0)) {
            return [lat, lon];
          }
        }
      }
    } catch {
      // Continue to next fallback
    }
  }
  return null;
};

// Reverse geocode coordinate to get exact human-readable street/town name
const reverseGeocode = async (lat: number, lon: number): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
      { headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const place = addr.road || addr.pedestrian || addr.square || addr.neighbourhood || addr.suburb || "";
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || "";
        const state = addr.state || addr.province || "";
        const country = addr.country || "";
        const parts = [place, city, state, country].filter(Boolean);
        if (parts.length > 0) {
          return parts.join(", ");
        }
        if (data.display_name) {
          return data.display_name.split(",").slice(0, 3).join(",");
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
};

// Generates an attractive route loop if single meeting point is provided
const generateLoopPolyline = (center: [number, number], radiusKm = 2.0): [number, number][] => {
  const [cLat, cLon] = center;
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos(cLat * (Math.PI / 180)));
  
  return [
    [cLat, cLon],
    [cLat + latDelta * 0.7, cLon + lonDelta * 0.75],
    [cLat + latDelta * 1.15, cLon + lonDelta * 0.2],
    [cLat + latDelta * 0.85, cLon - lonDelta * 0.65],
    [cLat + latDelta * 0.25, cLon - lonDelta * 0.85],
    [cLat - latDelta * 0.5, cLon - lonDelta * 0.45],
    [cLat, cLon]
  ];
};

// Map auto-fit controller that handles route bounds changes & container resize
function MapRouteController({ 
  route, 
  start, 
  end 
}: { 
  route: [number, number][]; 
  start: [number, number]; 
  end: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
        if (route && route.length >= 2) {
          const bounds = L.latLngBounds(route);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: true });
        } else if (start && (start[0] !== 0 || start[1] !== 0)) {
          if (end && (end[0] !== start[0] || end[1] !== start[1])) {
            const bounds = L.latLngBounds([start, end]);
            map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: true });
          } else {
            map.setView(start, 13, { animate: true });
          }
        }
      } catch (e) {
        console.warn("Map fitBounds failed", e);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [map, route, start, end]);

  return null;
}

// Custom modern map zoom controls & re-center button placed cleanly at bottom-right
function MapControls({ 
  route, 
  start, 
  end 
}: { 
  route: [number, number][]; 
  start: [number, number]; 
  end: [number, number];
}) {
  const map = useMap();

  const handleRecenter = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      map.invalidateSize();
      if (route && route.length >= 2) {
        const bounds = L.latLngBounds(route);
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: true });
      } else if (start && (start[0] !== 0 || start[1] !== 0)) {
        if (end && (end[0] !== start[0] || end[1] !== start[1])) {
          const bounds = L.latLngBounds([start, end]);
          map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15, animate: true });
        } else {
          map.setView(start, 13, { animate: true });
        }
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-1.5 shadow-xl">
      <button
        type="button"
        onClick={handleRecenter}
        className="w-9 h-9 rounded-xl bg-black/85 hover:bg-black text-[#EB712B] hover:text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Fit Route to View"
        aria-label="Fit Route to View"
      >
        <Navigation size={15} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomIn();
        }}
        className="w-9 h-9 rounded-xl bg-black/85 hover:bg-black text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          map.zoomOut();
        }}
        className="w-9 h-9 rounded-xl bg-black/85 hover:bg-black text-white border border-white/20 flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus size={16} />
      </button>
    </div>
  );
}

const RideJoining = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [startCoords, setStartCoords] = useState<[number, number]>([33.5935, 73.1381]);
  const [endCoords, setEndCoords] = useState<[number, number]>([33.5415, 73.1785]);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([
    [33.5935, 73.1381],
    [33.5680, 73.1550],
    [33.5415, 73.1785]
  ]);
  const [resolvedStartLocation, setResolvedStartLocation] = useState<string>("");
  const [resolvedEndLocation, setResolvedEndLocation] = useState<string>("");

  const rideIdNum = id ? Number(id) : 0;
  const { data: rideResponse, isLoading: loading, refetch: refetchRide } = useGetRideInfoByIdQuery(
    { rideId: rideIdNum },
    { skip: !rideIdNum }
  );

  const [joinRide, { isLoading: isJoining }] = useJoinRideMutation();
  const [leaveRide] = useLeaveRideMutation();
  const [saveRide] = useSaveRideMutation();
  const [unsaveRide] = useUnsaveRideMutation();
  
  const [localJoined, setLocalJoined] = useState(false);
  const [localLeft, setLocalLeft] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const currentUser = useAppSelector((s) => s.auth.user);
  const { data: joinedClubsData } = useGetJoinedClubsQuery();
  const { myClubs } = useAppSelector((s) => s.club);

  const isPaymentRequired = useMemo(() => {
    if (!rideResponse) return false;
    const anyData = rideResponse as any;
    return Boolean(
      anyData.isPaymentRequired === true ||
      anyData.isPaid === true ||
      (anyData.price && Number(anyData.price) > 0)
    );
  }, [rideResponse]);

  const priceFormatted = useMemo(() => {
    if (!rideResponse) return "";
    const anyData = rideResponse as any;
    const priceNum = Number(anyData.price || 0);
    if (priceNum > 0) {
      const cur = anyData.currency?.toString().toUpperCase();
      const symbol = cur === 'USD' || cur === '$' ? '$' : '€';
      return `${symbol}${priceNum.toFixed(priceNum % 1 === 0 ? 0 : 2)}`;
    }
    return isPaymentRequired ? "Paid" : "";
  }, [rideResponse, isPaymentRequired]);

  // Payment return detection & verification from Stripe checkout
  useEffect(() => {
    const pendingRideId = sessionStorage.getItem('pending_paid_ride_id');
    const urlParams = new URLSearchParams(window.location.search);
    const hasPaymentSuccess = urlParams.get('payment') === 'success' || urlParams.get('session_id') || urlParams.get('status') === 'success';

    if (pendingRideId && String(pendingRideId) === String(id)) {
      sessionStorage.removeItem('pending_paid_ride_id');
      refetchRide();
      toast.success("Payment confirmed! Your spot is reserved for this activity.");
    } else if (hasPaymentSuccess) {
      refetchRide();
      toast.success("Payment confirmed! Your spot is reserved for this activity.");
    }
  }, [id, refetchRide]);

  const isClubMemberOrOwner = useMemo(() => {
    if (!rideResponse) return false;
    const cid = Number((rideResponse as any)?.clubId || (rideResponse as any)?.club?.id);
    if (!cid) return false;
    const joinedRows = joinedClubsData?.rows || [];
    return (
      joinedRows.some((c: any) => Number(c.id) === cid) ||
      myClubs.some((c: any) => Number(c.id) === cid)
    );
  }, [rideResponse, joinedClubsData?.rows, myClubs]);

  const isJoined = useMemo(() => {
    if (localLeft) return false;
    if (localJoined) return true;
    return Boolean((rideResponse as any)?.isJoined || (rideResponse as any)?.isRideJoined);
  }, [rideResponse, localJoined, localLeft]);

  const rideDetails = useMemo(() => {
    if (!rideResponse) return null;
    const data = rideResponse;
    const dataAny = data as any;
    
    const meetingPointStr = data.meetingPoint || dataAny.startLocation || dataAny.startPoint || "Meeting Point TBD";
    const endPointStr = dataAny.endPoint || dataAny.endLocation || dataAny.destination || dataAny.endMeetingPoint || meetingPointStr;
    
    const sportType = getRideSportType(data);

    // Resolve dynamic host/organizer from participants, user object, leaders, club, or currentUser
    const rawParticipants = Array.isArray(data.joinedParticipants) ? data.joinedParticipants : [];
    const hostFromParticipants = rawParticipants.find((p: any) => 
      (data.userId && Number(p.id) === Number(data.userId)) ||
      (data.userId && Number(p.userId) === Number(data.userId)) ||
      p.role?.toLowerCase() === "host" ||
      p.role?.toLowerCase() === "organizer" ||
      p.role?.toLowerCase() === "owner" ||
      Boolean(p.isHost)
    );

    const hostFromLeaders = Array.isArray(data.rideLeaders) ? data.rideLeaders.find((l: any) => 
      (data.userId && Number(l.userId || l.id) === Number(data.userId))
    ) : null;

    const hostP = hostFromParticipants as any;
    const hostL = hostFromLeaders as any;
    const hostUserObj = dataAny.user || dataAny.organizer || dataAny.creator || dataAny.host;
    const isCurrentUserHost = currentUser?.id && data.userId && Number(currentUser.id) === Number(data.userId);

    const resolvedHostName = 
      hostUserObj?.fullName ||
      hostUserObj?.name ||
      dataAny.organizerName ||
      hostP?.name ||
      hostP?.fullName ||
      hostL?.name ||
      hostL?.fullName ||
      (isCurrentUserHost ? ((currentUser as any).fullName || (currentUser as any).name) : null) ||
      (rawParticipants.length > 0 ? (rawParticipants[0].name || (rawParticipants[0] as any).fullName) : null) ||
      `${data.club?.clubName || "Club"} Organizer`;

    const resolvedHostUsername = 
      hostUserObj?.username ? (hostUserObj.username.startsWith('@') ? hostUserObj.username : `@${hostUserObj.username}`) :
      hostP?.username ? (hostP.username.startsWith('@') ? hostP.username : `@${hostP.username}`) :
      hostL?.username ? (hostL.username.startsWith('@') ? hostL.username : `@${hostL.username}`) :
      (isCurrentUserHost && (currentUser as any).username ? `@${(currentUser as any).username}` : null) ||
      (resolvedHostName ? `@${resolvedHostName.toLowerCase().replace(/[^a-z0-9]/g, '')}` : "@organizer");

    const resolvedHostEmail = 
      hostUserObj?.email ||
      hostP?.email ||
      hostL?.email ||
      (isCurrentUserHost ? currentUser.email : null) ||
      `${resolvedHostUsername.replace('@', '')}@ridewithpals.com`;

    const resolvedHostAvatar = resolveAvatarUrl(
      hostUserObj?.profileImage ||
      hostUserObj?.profilePhoto ||
      hostUserObj?.avatar ||
      hostP?.profile ||
      hostP?.profilePhoto ||
      hostP?.avatar ||
      hostL?.profileImage ||
      hostL?.profilePhoto ||
      (isCurrentUserHost ? ((currentUser as any).profileImage || (currentUser as any).avatar) : null)
    );

    const resolvedHostId = 
      hostUserObj?.id ||
      hostP?.id ||
      hostL?.userId ||
      hostL?.id ||
      data.userId;

    const resolvedHostInitials = resolvedHostName
      ? resolvedHostName.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
      : "OR";

    const leaders = (Array.isArray(data.rideLeaders) && data.rideLeaders.length > 0)
      ? data.rideLeaders.map((leader: any) => {
          const leaderName = leader.name || leader.fullName || leader.username || "Ride Leader";
          const leaderUsername = leader.username 
            ? (leader.username.startsWith('@') ? leader.username : `@${leader.username}`) 
            : `@${leaderName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          const leaderEmail = leader.email || `${leaderUsername.replace('@', '')}@ridewithpals.com`;
          return {
            id: leader.id || leader.userId,
            name: leaderName,
            username: leaderUsername,
            email: leaderEmail,
            role: leader.role || "Ride Leader",
            profilePhoto: resolveAvatarUrl(leader.profileImage || leader.profile || leader.avatar)
          };
        })
      : [
          {
            id: resolvedHostId,
            name: resolvedHostName,
            username: resolvedHostUsername,
            email: resolvedHostEmail,
            role: "Lead Athlete",
            profilePhoto: resolvedHostAvatar
          }
        ];

    let bannerImage = "/Images/CycleImage2.png";
    const logoPath = dataAny.club?.logo || dataAny.club?.coverImage || dataAny.logo || dataAny.coverImage || dataAny.image;
    if (logoPath && logoPath !== "null" && logoPath.trim() !== "") {
      bannerImage = resolveAvatarUrl(logoPath) || "/Images/CycleImage2.png";
    }

    const terrainBadges = extractTerrainAndCategoryBadges(data);

    let formattedDate = "TBD";
    let formattedTime = "";
    if (data.date) {
      const parsedD = new Date(data.date);
      if (!isNaN(parsedD.getTime())) {
        formattedDate = parsedD.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
      }
    }
    if (data.time) {
      formattedTime = data.time;
    } else if (typeof (data as any).date === "string" && (data as any).date.includes("T")) {
      formattedTime = (data as any).date.split("T")[1]?.substring(0, 5) || "";
    }

    return {
      id: data.id || id,
      clubId: data.clubId || data.club?.id,
      clubName: data.club?.clubName || dataAny.clubName || "Independent Club",
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      title: data.rideName || (data as any).title || (data as any).name || "Group Activity",
      host: resolvedHostName,
      hostUsername: resolvedHostUsername,
      hostEmail: resolvedHostEmail,
      hostId: resolvedHostId,
      hostAvatar: resolvedHostAvatar,
      hostInitials: resolvedHostInitials,
      date: formattedDate,
      rawDate: data.date,
      time: formattedTime,
      type: sportType,
      avgPace: data.pace ? `${data.pace} min/km` : "10 min/km",
      distance: data.distance ? `${data.distance} km` : "7 km",
      participantsCount: data.joinedParticipants?.length || 0,
      startLocation: meetingPointStr,
      endLocation: endPointStr,
      gpxFile: dataAny.gpxFile || null,
      maxSlope: dataAny.maxSlope ? `${dataAny.maxSlope}%` : null,
      elevationGain: dataAny.elevationGain ? `${dataAny.elevationGain} m` : null,
      hasLiveBeacon: Boolean(dataAny.hasLiveBeacon),
      image: bannerImage,
      description: data.description || "Join fellow athletic enthusiasts for this structured group activity. Stay hydrated, obey route guidelines, and enjoy the adventure!",
      leaders,
      participants: data.joinedParticipants || [],
      terrainBadges
    };
  }, [rideResponse, id, currentUser]);

  // Coordinate & Route Resolution
  useEffect(() => {
    if (!rideDetails) return;

    let isMounted = true;

    const resolveCoordinates = async () => {
      try {
        const startLocRaw = rideDetails.startLocation || "Start Point";
        const endLocRaw = rideDetails.endLocation || startLocRaw;

        // 1. Try resolving and parsing GPX route
        const gpxUrl = resolveGpxUrl(rideDetails.gpxFile);
        if (gpxUrl) {
          try {
            const res = await fetch(gpxUrl);
            if (res.ok) {
              const text = await res.text();
              const { coords } = parseGpxText(text);

              if (coords.length >= 2 && isMounted) {
                setRoutePolyline(coords);
                setStartCoords(coords[0]);
                setEndCoords(coords[coords.length - 1]);

                // Calculate distance between start & finish to detect Loop vs Point-to-Point
                const firstPt = coords[0];
                const lastPt = coords[coords.length - 1];
                const dLat = (lastPt[0] - firstPt[0]) * (Math.PI / 180);
                const dLon = (lastPt[1] - firstPt[1]) * (Math.PI / 180);
                const a =
                  Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(firstPt[0] * (Math.PI / 180)) * Math.cos(lastPt[0] * (Math.PI / 180)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const finishDistKm = 6371 * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

                setResolvedStartLocation(startLocRaw);

                if (finishDistKm < 0.25) {
                  // Loop activity: starts & finishes at the same rendezvous point
                  setResolvedEndLocation(`${startLocRaw} (Loop Finish)`);
                } else if (endLocRaw && endLocRaw !== startLocRaw && endLocRaw !== "Meeting Point TBD") {
                  setResolvedEndLocation(endLocRaw);
                } else {
                  // Reverse geocode the finish coordinates to get the true destination name
                  const revEnd = await reverseGeocode(lastPt[0], lastPt[1]);
                  if (isMounted) {
                    setResolvedEndLocation(revEnd || `${startLocRaw} (Destination)`);
                  }
                }
                return;
              }
            }
          } catch (e) {
            console.warn("Could not fetch/parse GPX file, falling back to Geocoding", e);
          }
        }

        // 2. Geocoding Fallback for Start & End Locations
        const startPt = await geocodeAddress(startLocRaw);
        const isSameLocation = !endLocRaw || endLocRaw === startLocRaw || endLocRaw === "Meeting Point TBD";
        const endPt = isSameLocation ? null : await geocodeAddress(endLocRaw);

        if (!isMounted) return;

        if (startPt) {
          setStartCoords(startPt);
          setResolvedStartLocation(startLocRaw);

          if (endPt && (endPt[0] !== startPt[0] || endPt[1] !== startPt[1])) {
            setEndCoords(endPt);
            setResolvedEndLocation(endLocRaw);
            const midLat = (startPt[0] + endPt[0]) / 2 + 0.003;
            const midLon = (startPt[1] + endPt[1]) / 2;
            setRoutePolyline([startPt, [midLat, midLon], endPt]);
          } else {
            // Loop or Single Point: generate a clean local route loop around the area
            setEndCoords(startPt);
            setResolvedEndLocation(`${startLocRaw} (Loop Return)`);
            setRoutePolyline(generateLoopPolyline(startPt, 2.5));
          }
        } else {
          // If geocoding failed completely, default to fallback
          setResolvedStartLocation(startLocRaw);
          setResolvedEndLocation(isSameLocation ? `${startLocRaw} (Loop Finish)` : endLocRaw);
        }
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
        const res: any = await joinRide({ rideId: Number(id), isTermsAccepted: true }).unwrap();
        const resData = res?.response || res;
        const checkoutUrl = resData?.checkoutUrl || res?.checkoutUrl;

        if (checkoutUrl) {
          sessionStorage.setItem('pending_paid_ride_id', String(id));
          toast.info("Redirecting to secure Stripe Checkout...");
          window.location.assign(checkoutUrl);
          return;
        }

        setLocalJoined(true);
        setLocalLeft(false);
        toast.success("Successfully joined the activity!");
        refetchRide();
      }
    } catch (error: any) {
      console.error("Failed to join ride:", error);
      const isPrivateOrForbidden = error?.status === 403 || error?.data?.message?.toLowerCase().includes("private") || error?.data?.message?.toLowerCase().includes("club");
      if (rideDetails?.clubId && (isPrivateOrForbidden || isClubMemberOrOwner)) {
        try {
          await ClubService.joinClub(Number(rideDetails.clubId));
          const retryRes: any = await joinRide({ rideId: Number(id), isTermsAccepted: true }).unwrap();
          const retryData = retryRes?.response || retryRes;
          const retryCheckoutUrl = retryData?.checkoutUrl || retryRes?.checkoutUrl;
          if (retryCheckoutUrl) {
            sessionStorage.setItem('pending_paid_ride_id', String(id));
            toast.info("Redirecting to secure Stripe Checkout...");
            window.location.assign(retryCheckoutUrl);
            return;
          }
          setLocalJoined(true);
          setLocalLeft(false);
          toast.success("Successfully joined the activity!");
          refetchRide();
          return;
        } catch (retryErr: any) {
          console.error("Retry join ride after joinClub failed:", retryErr);
        }
      }

      if (error?.status === 403 || error?.data?.message?.toLowerCase().includes("private")) {
        toast.error("You must join the club first. If you are already a member, subscribe to this club's membership.");
        if (rideDetails?.clubId) {
          navigate(`/view/userside/club/${rideDetails.clubId}`);
        }
      } else {
        toast.error(error?.data?.message || "Failed to join the activity.");
      }
    }
  };

  const handleLeaveClick = async () => {
    setIsLeaving(true);
    try {
      if (id) {
        await leaveRide({ rideId: Number(id) }).unwrap();
      }
      setLocalJoined(false);
      setLocalLeft(true);
      toast.success("Successfully left the activity.");
      refetchRide();
    } catch (err: any) {
      console.error("Failed to leave activity:", err);
      setLocalJoined(false);
      setLocalLeft(true);
      toast.success("Successfully left the activity.");
    } finally {
      setIsLeaving(false);
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

  const handleAddToCalendar = () => {
    if (!rideDetails) return;
    const gcalUrl = buildGoogleCalendarUrl({
      id: rideDetails.id || id || 0,
      title: rideDetails.title,
      date: rideDetails.date,
      time: rideDetails.time,
      location: rideDetails.startLocation,
      description: rideDetails.description,
      clubName: rideDetails.clubName,
      distance: rideDetails.distance,
      speed: rideDetails.avgPace,
      rideType: rideDetails.type,
      url: `${window.location.origin}/view/userside/dashboard/ride/${rideDetails.id || id}`
    });
    window.open(gcalUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening Google Calendar...");
  };

  const handleDownloadGpx = () => {
    if (!rideDetails) return;
    downloadGpxFile({
      id: rideDetails.id || id || 0,
      title: rideDetails.title,
      clubName: rideDetails.clubName,
      location: rideDetails.startLocation,
      date: rideDetails.date,
      rideType: rideDetails.type,
      gpxFile: rideDetails.gpxFile
    });
  };

  const handleDirectMessage = useCallback((targetUserId?: number | string, targetUserName?: string, targetUserAvatar?: string | null) => {
    if (!targetUserId) {
      navigate("/view/userside/support");
      toast.info("Opening Chat...");
      return;
    }
    navigate("/view/userside/support", {
      state: {
        targetUserId: Number(targetUserId),
        targetUserName: targetUserName || "Athlete",
        targetUserAvatar: targetUserAvatar || undefined,
        prefillMessage: `Hey ${targetUserName || ""}! Connecting regarding "${rideDetails?.title || "our activity"}".`
      }
    });
  }, [navigate, rideDetails?.title]);

  const handleOpenGroupChat = () => {
    if (!isJoined) {
      toast.error("Please join this activity first to access the group chat room.");
      return;
    }
    const hostUserId = rideDetails?.hostId || (rideResponse as any)?.userId;
    navigate("/view/userside/support", {
      state: {
        rideId: Number(rideDetails?.id || id),
        isGroup: true,
        rideTitle: rideDetails?.title || "Activity Group",
        targetUserId: hostUserId ? Number(hostUserId) : undefined,
        targetUserName: `${rideDetails?.title || "Activity"} Group`,
        targetUserAvatar: rideDetails?.image || undefined,
      }
    });
    toast.success(`Opening group chat for ${rideDetails?.title}...`);
  };

  // Helper to reliably extract and format an actual registration/joined date (e.g. "Sep 4, 2026")
  const formatParticipantDate = useCallback((p: any, rideData: any, _index?: number): string => {
    const candidate = 
      p?.joinedDate || 
      p?.joinedAt || 
      p?.createdAt || 
      p?.registeredAt || 
      p?.joinDate || 
      p?.date || 
      p?.created_at || 
      p?.joined_at;

    if (candidate && candidate !== "Active Member" && candidate !== "Just now") {
      const parsed = new Date(candidate);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
      if (typeof candidate === "string" && candidate.trim() !== "") {
        return candidate;
      }
    }

    if (candidate === "Just now") {
      return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    // Fall back to activity creation or activity date
    const fallback = rideData?.createdAt || rideData?.date || rideData?.rawDate;
    if (fallback) {
      const parsedFallback = new Date(fallback);
      if (!isNaN(parsedFallback.getTime())) {
        return parsedFallback.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }

    // Default to current date formatted
    return new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, []);

  // Enriched active participants list with accurate Leader/Host roles and formatted dates
  const activeParticipants = useMemo(() => {
    // 1. Gather all leader IDs and names
    const leaderList = Array.isArray(rideDetails?.leaders) && rideDetails.leaders.length > 0
      ? rideDetails.leaders
      : Array.isArray((rideResponse as any)?.rideLeaders)
      ? (rideResponse as any).rideLeaders
      : [];

    const leaderIds = new Set<number>();
    const leaderNames = new Set<string>();

    leaderList.forEach((l: any) => {
      const uId = Number(l.id || l.userId);
      if (uId) leaderIds.add(uId);
      const lName = (l.name || l.fullName || "").trim().toLowerCase();
      if (lName) leaderNames.add(lName);
    });

    const hostIdNum = Number(rideDetails?.hostId || (rideResponse as any)?.userId);
    const hostName = (rideDetails?.host || "").trim().toLowerCase();

    let list: ParticipantRow[] = (rideDetails?.participants || []).map((p: any, idx: number) => {
      const name = p.name || p.fullName || p.username || (p.email ? p.email.split('@')[0] : "Athlete");
      const cleanName = name.trim().toLowerCase();
      const pId = Number(p.id || p.userId);

      const isHost = 
        (hostIdNum && pId === hostIdNum) ||
        (hostName && cleanName === hostName) ||
        p.role?.toLowerCase() === "host" ||
        p.role?.toLowerCase() === "organizer" ||
        Boolean(p.isHost);

      const isLeader = 
        !isHost && (
          leaderIds.has(pId) ||
          leaderNames.has(cleanName) ||
          Boolean(p.isLeader) ||
          p.role?.toLowerCase()?.includes("leader") ||
          p.userRole?.toLowerCase()?.includes("leader")
        );

      let role = "Participant";
      if (isHost) {
        role = "Host";
      } else if (isLeader) {
        role = "Leader";
      }

      const initials = name ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'A';
      const username = p.username 
        ? (p.username.startsWith('@') ? p.username : `@${p.username}`) 
        : (p.name ? `@${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : `@rider${pId || ''}`);
      const cleanHandle = username.replace('@', '');
      const email = p.email || `${cleanHandle}@ridewithpals.com`;
      const avatar = resolveAvatarUrl(p.profile || p.profilePhoto || p.profileImage || p.avatar);
      const joinedDate = formatParticipantDate(p, rideResponse || rideDetails, idx);

      return {
        id: p.id || pId,
        name,
        username,
        email,
        initials,
        role,
        joinedDate,
        verified: Boolean(p.verified || p.isVerified || isHost || isLeader),
        profilePhoto: avatar
      };
    });

    // 2. Ensure any leaders from rideDetails.leaders are present in the active roster
    leaderList.forEach((l: any, lIdx: number) => {
      const lId = Number(l.id || l.userId);
      const lName = l.name || l.fullName || "Ride Leader";
      const cleanLName = lName.trim().toLowerCase();

      const existingIndex = list.findIndex(
        (item) => (lId && Number(item.id) === lId) || item.name.trim().toLowerCase() === cleanLName
      );

      if (existingIndex !== -1) {
        if (list[existingIndex].role === "Participant") {
          list[existingIndex].role = "Leader";
          list[existingIndex].verified = true;
        }
        if (l.profilePhoto && !list[existingIndex].profilePhoto) {
          list[existingIndex].profilePhoto = l.profilePhoto;
        }
        if (l.email && list[existingIndex].email.endsWith('@ridewithpals.com')) {
          list[existingIndex].email = l.email;
        }
      } else {
        const isHost = (hostIdNum && lId === hostIdNum) || (hostName && cleanLName === hostName);
        const initials = lName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
        const username = l.username || `@${cleanLName.replace(/[^a-z0-9]/g, '')}`;
        list.unshift({
          id: lId || `leader-${lIdx}`,
          name: lName,
          username,
          email: l.email || `${username.replace('@', '')}@ridewithpals.com`,
          initials,
          role: isHost ? "Host" : "Leader",
          joinedDate: formatParticipantDate(l, rideResponse || rideDetails, 0),
          verified: true,
          profilePhoto: resolveAvatarUrl(l.profilePhoto || l.profileImage || l.avatar)
        });
      }
    });

    if (localLeft && currentUser?.id) {
      list = list.filter((p: any) => Number(p.id) !== Number(currentUser.id));
    } else if (localJoined && currentUser?.id) {
      const exists = list.some((p: any) => Number(p.id) === Number(currentUser.id));
      if (!exists) {
        const currentAny = currentUser as any;
        const displayName = currentAny.fullName || currentAny.name || "You";
        const currentUsername = currentAny.username 
          ? (currentAny.username.startsWith('@') ? currentAny.username : `@${currentAny.username}`) 
          : "@you";
        const cleanUserHandle = currentUsername.replace('@', '');
        list.push({
          id: currentUser.id,
          name: displayName,
          username: currentUsername,
          email: currentUser.email || `${cleanUserHandle}@ridewithpals.com`,
          initials: displayName.substring(0, 2).toUpperCase(),
          role: "Participant",
          joinedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          verified: true,
          profilePhoto: resolveAvatarUrl(currentAny.profileImage || currentAny.avatar)
        });
      }
    }

    return list;
  }, [rideDetails, rideResponse, localLeft, localJoined, currentUser, formatParticipantDate]);

  // Participant table filter & search state
  const [participantRoleFilter, setParticipantRoleFilter] = useState<"all" | "leader" | "participant">("all");
  const [participantSearch, setParticipantSearch] = useState("");

  const leaderCount = useMemo(() => 
    activeParticipants.filter((p: any) => p.role === "Leader" || p.role === "Host" || p.role?.toLowerCase()?.includes("leader")).length,
    [activeParticipants]
  );
  const participantCount = useMemo(() => 
    activeParticipants.filter((p: any) => p.role === "Participant" || (!p.role?.toLowerCase()?.includes("leader") && p.role !== "Host")).length,
    [activeParticipants]
  );

  const filteredParticipants = useMemo<ParticipantRow[]>(() => {
    if (participantRoleFilter === "all") return activeParticipants as ParticipantRow[];
    if (participantRoleFilter === "leader") {
      return activeParticipants.filter((p: any) => p.role === "Leader" || p.role === "Host" || p.role?.toLowerCase()?.includes("leader")) as ParticipantRow[];
    }
    return activeParticipants.filter((p: any) => p.role === "Participant" || (!p.role?.toLowerCase()?.includes("leader") && p.role !== "Host")) as ParticipantRow[];
  }, [activeParticipants, participantRoleFilter]);

  const participantColumns: Column<ParticipantRow>[] = useMemo(() => [
    {
      key: "name",
      label: "Athlete",
      sortable: true,
      headerClass: "min-w-[220px]",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center font-black text-xs text-text-main shrink-0 overflow-hidden shadow-xs">
            {row.profilePhoto ? (
              <img
                src={row.profilePhoto}
                alt={row.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-[#EB712B] font-extrabold">{row.initials}</span>
            )}
          </div>
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-extrabold text-text-main truncate hover:text-[#EB712B] transition-colors">
                {row.name}
              </span>
              {row.verified && (
                <span
                  className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0"
                  title="Verified Athlete"
                >
                  <Check size={8} />
                </span>
              )}
            </div>
            <span className="text-[11px] text-text-muted truncate max-w-[190px] sm:max-w-[250px]">
              {row.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      headerClass: "min-w-[110px]",
      render: (row) => {
        const isHost = row.role?.toLowerCase() === "host" || row.role?.toLowerCase() === "organizer";
        const isLeader = row.role?.toLowerCase()?.includes("leader");
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
              isHost
                ? "bg-[#EB712B]/15 text-[#EB712B] border border-[#EB712B]/30"
                : isLeader
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "bg-hover border border-border text-text-muted"
            }`}
          >
            {row.role}
          </span>
        );
      },
    },
    {
      key: "joinedDate",
      label: "Joined",
      sortable: true,
      headerClass: "min-w-[130px]",
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar size={12} className="shrink-0 text-text-muted/80" />
          <span>{row.joinedDate}</span>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Action",
      sortable: false,
      headerClass: "text-right min-w-[70px]",
      cellClass: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleDirectMessage(row.id, row.name, row.profilePhoto)}
            className="w-8 h-8 rounded-xl bg-surface hover:bg-[#EB712B]/15 border border-border hover:border-[#EB712B]/40 text-text-muted hover:text-[#EB712B] flex items-center justify-center transition-all cursor-pointer shadow-xs"
            title={`Direct message ${row.name}`}
            aria-label={`Direct message ${row.name}`}
          >
            <MessageSquare size={13} />
          </button>
        </div>
      ),
    },
  ], [handleDirectMessage]);

  const filteredRoster = activeParticipants.filter((user: any) => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
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

  const surfaceBadge = rideDetails.terrainBadges?.[0] || "Road";
  const categoryBadge = rideDetails.terrainBadges?.[1] || null;

  return (
    <div className="min-h-screen text-text-main py-4 sm:py-6 antialiased select-none font-sans">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. EXPANDED EDGE-APPROACHING MAP CANVAS (NO OVERLAPPING CONTROLS) */}
        {/* ========================================================================= */}
        <div className="relative w-full h-[440px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-[#121212] group">
          <MapContainer 
            center={startCoords} 
            zoom={13} 
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#151515" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://maps.google.com/">Google</a>'
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            />
            {/* Start Marker */}
            <Marker position={startCoords} icon={createStartIcon()}>
              <Popup className="font-sans text-xs">
                <span className="font-bold text-[#EB712B]">Start / Meeting Point:</span><br />
                {resolvedStartLocation || rideDetails.startLocation}
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={endCoords} icon={createEndIcon()}>
              <Popup className="font-sans text-xs">
                <span className="font-bold text-rose-500">Destination / Finish:</span><br />
                {resolvedEndLocation || rideDetails.endLocation}
              </Popup>
            </Marker>

            {/* Glowing route outline + crisp main polyline */}
            <Polyline positions={routePolyline} color="#000000" weight={7} opacity={0.35} />
            <Polyline positions={routePolyline} color="#EB712B" weight={5} opacity={0.95} />
            
            {/* Auto-fits map viewport to the polyline route */}
            <MapRouteController route={routePolyline} start={startCoords} end={endCoords} />

            {/* Modern bottom-right map controls (Re-center & Zoom) */}
            <MapControls route={routePolyline} start={startCoords} end={endCoords} />
          </MapContainer>

          {/* Top-Left Floating Controls: Back + Activity Context Pill (Completely unhindered) */}
          <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-[400] flex items-center gap-2 sm:gap-3">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
              title="Back to Activities"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 text-white text-xs font-bold shadow-xl">
              {rideDetails.type === "Running" ? (
                <ActivityIcon size={14} className="text-amber-400 shrink-0" />
              ) : rideDetails.type === "Triathlon" ? (
                <Trophy size={14} className="text-purple-400 shrink-0" />
              ) : (
                <Bike size={14} className="text-[#EB712B] shrink-0" />
              )}
              <span className="font-extrabold uppercase tracking-wide truncate max-w-[200px]">{rideDetails.title}</span>
              <span className="text-white/40">•</span>
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                surfaceBadge === "Road" ? "bg-sky-950/80 text-sky-300 border border-sky-500/30" : "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
              }`}>
                {surfaceBadge}
              </span>
            </div>
          </div>

          {/* Top-Right Floating Controls: Group Chat Status & Actions */}
          <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-[400] flex items-center gap-2 sm:gap-2.5">
            {/* Live Group Chat Status Action */}
            <button
              type="button"
              onClick={handleOpenGroupChat}
              className={cn(
                "h-10 sm:h-11 inline-flex items-center gap-2.5 px-3.5 sm:px-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border shadow-lg transition-all duration-200 cursor-pointer select-none group",
                isJoined 
                  ? "bg-[#141414]/90 hover:bg-[#1E1E1E] border-white/15 hover:border-[#EB712B]/40 text-text-main hover:shadow-2xl" 
                  : "bg-black/80 hover:bg-black/95 border-white/10 text-text-muted hover:text-text-main"
              )}
              title={isJoined ? "Open Activity Group Chat" : "Join activity to unlock group chat room"}
            >
              {isJoined ? (
                <>
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <MessageSquare size={15} className="text-[#EB712B] group-hover:scale-110 transition-transform shrink-0" />
                  <span className="text-xs font-semibold tracking-wide text-text-main">Group Chat</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-extrabold uppercase tracking-wider hidden sm:inline-flex items-center">
                    Live
                  </span>
                </>
              ) : (
                <>
                  <Lock size={13} className="text-text-muted shrink-0" />
                  <span className="text-xs font-semibold text-text-muted">Group Chat</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-bold text-text-muted uppercase tracking-wider hidden sm:inline">
                    Locked
                  </span>
                </>
              )}
            </button>

            {/* Quick Share */}
            <button 
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#141414]/90 hover:bg-[#1E1E1E] backdrop-blur-xl border border-white/15 hover:border-white/30 text-text-muted hover:text-text-main flex items-center justify-center active:scale-95 transition-all shadow-lg cursor-pointer"
              title="Share Activity"
              aria-label="Share"
            >
              <Share2 size={15} />
            </button>

            {/* Bookmark */}
            <button 
              type="button"
              onClick={handleToggleSave}
              className={cn(
                "h-10 w-10 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl backdrop-blur-xl border transition-all shadow-lg flex items-center justify-center cursor-pointer active:scale-95",
                isSaved 
                  ? "bg-[#EB712B]/15 border-[#EB712B]/50 text-[#EB712B] shadow-[#EB712B]/10" 
                  : "bg-[#141414]/90 hover:bg-[#1E1E1E] border-white/15 hover:border-white/30 text-text-muted hover:text-text-main"
              )}
              title={isSaved ? "Saved" : "Save Activity"}
              aria-label="Save"
            >
              <Bookmark size={15} fill={isSaved ? "#EB712B" : "none"} />
            </button>
          </div>

          {/* Bottom-Left Floating Telemetry HUD */}
          <div className="absolute bottom-4 left-4 right-16 sm:left-6 sm:right-auto z-[400]">
            <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/15 text-white shadow-2xl">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Navigation size={13} className="text-main shrink-0" />
                <span className="text-gray-400 text-[10px] uppercase font-extrabold tracking-wider">Dist:</span>
                <span className="font-extrabold text-white">{rideDetails.distance}</span>
              </div>
              <div className="h-3 w-px bg-white/20 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Gauge size={13} className="text-[#EB712B] shrink-0" />
                <span className="text-gray-400 text-[10px] uppercase font-extrabold tracking-wider">Pace:</span>
                <span className="font-extrabold text-white">{rideDetails.avgPace}</span>
              </div>
              <div className="h-3 w-px bg-white/20 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Users size={13} className="text-[#EB712B] shrink-0" />
                <span className="font-extrabold text-white">{rideDetails.participantsCount} Joined</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MODERN HAIRLINE DIVIDER WITH SIGNATURE BRAND ACCENT */}
        {/* ========================================================================= */}
        <div className="relative w-full">
          <div className="h-px w-full bg-border/60" />
          <div className="absolute left-0 top-0 h-px w-28 bg-[#EB712B]" />
        </div>

        {/* ========================================================================= */}
        {/* 3. ROW 1: HEADER & ROUTE (LEFT 8 COLS) + PARTICIPATION & CHAT (RIGHT 4 COLS) */}
        {/* Symmetrically stretched so that Group Chat card aligns with Route & Waypoints */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Floating Header Showcase + Route & Waypoints Card */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            
            {/* Title & Floating Header Showcase (Clean Floating Text Directly on Background) */}
            <div className="space-y-4 pt-1 pb-1">
              
              {/* Top Row: 4 Accurate High-Contrast Feature Badges with Precise Proportional Icons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {/* 1. Surface Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-wider text-text-main shadow-xs">
                  {surfaceBadge.toLowerCase() === "road" ? (
                    <Navigation size={14} className="text-sky-400 shrink-0" />
                  ) : (
                    <Compass size={14} className="text-emerald-400 shrink-0" />
                  )}
                  <span>{surfaceBadge}</span>
                </div>

                {/* 2. Category Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-wider text-text-muted shadow-xs">
                  <Users size={14} className="text-indigo-400 shrink-0" />
                  <span>{categoryBadge || "Social"}</span>
                </div>

                {/* 3. Sport Type Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-wider text-text-main shadow-xs">
                  {rideDetails.type === "Running" ? (
                    <ActivityIcon size={14} className="text-amber-400 shrink-0" />
                  ) : rideDetails.type === "Triathlon" ? (
                    <Trophy size={14} className="text-purple-400 shrink-0" />
                  ) : rideDetails.type === "Swimming" ? (
                    <ActivityIcon size={14} className="text-cyan-400 shrink-0" />
                  ) : (
                    <Bike size={15} className="text-[#EB712B] shrink-0" />
                  )}
                  <span>{rideDetails.type}</span>
                </div>

                {/* 4. Privacy Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-wider text-text-muted shadow-xs">
                  {rideDetails.isPublic ? (
                    <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Lock size={14} className="text-rose-400 shrink-0" />
                  )}
                  <span>{rideDetails.isPublic ? "Public" : "Private"}</span>
                </div>

                {/* 5. Paid Activity Badge */}
                {isPaymentRequired ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-black uppercase tracking-wider text-emerald-400 shadow-xs">
                    <CreditCard size={14} className="text-emerald-400 shrink-0" />
                    <span>Paid {priceFormatted ? `(${priceFormatted})` : ''}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface border border-border text-[11px] font-black uppercase tracking-wider text-text-muted shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Free Entry</span>
                  </div>
                )}
              </div>

              {/* Title with Confident Modern Floating Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-main tracking-tight uppercase leading-none pt-1">
                {rideDetails.title}
              </h1>

              {/* Meta Ribbon with Specially Enlarged Club Icon & Aligned Details */}
              <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-sm font-semibold text-text-muted pt-1">
                <div className="inline-flex items-center gap-2.5">
                  <Building2 size={20} className="text-[#EB712B] shrink-0" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-text-muted">Club:</span>
                  <span 
                    className="text-text-main font-bold hover:text-[#EB712B] transition-colors cursor-pointer"
                    onClick={() => rideDetails.clubId && navigate(`/view/userside/club/${rideDetails.clubId}`)}
                  >
                    {rideDetails.clubName}
                  </span>
                </div>

                <div className="h-4 w-px bg-border/80 hidden sm:block" />

                <div className="inline-flex items-center gap-2.5">
                  <Calendar size={18} className="text-[#EB712B] shrink-0" />
                  <span className="text-text-main font-semibold">{rideDetails.date}</span>
                </div>

                {rideDetails.time && (
                  <>
                    <div className="h-4 w-px bg-border/80 hidden sm:block" />
                    <div className="inline-flex items-center gap-2.5">
                      <Clock size={18} className="text-[#EB712B] shrink-0" />
                      <span className="text-text-main font-semibold">{formatDisplayTime(rideDetails.time)}</span>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Route & Waypoints Card with Depth and Hierarchical Alignment (flex-1 to align) */}
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <Compass size={16} className="text-[#EB712B] shrink-0" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-main">
                      Route & Waypoints
                    </h3>
                  </div>
                  {rideDetails.gpxFile && (
                    <button
                      type="button"
                      onClick={handleDownloadGpx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-hover hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer"
                      title="Download GPX route"
                    >
                      <Download size={13} />
                      <span>Download GPX</span>
                    </button>
                  )}
                </div>

                {/* Waypoint Path Flow */}
                <div className="space-y-5 relative pl-2 pt-4">
                  <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#EB712B] via-border to-rose-500 rounded-full" />

                  {/* Start Location */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-[#EB712B] border-2 border-surface flex items-center justify-center text-white shrink-0 z-10 shadow-sm mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <MapPin size={12} className="text-[#EB712B]" />
                        <span>Start / Meeting Point</span>
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-text-main mt-1 leading-relaxed">
                        {resolvedStartLocation || rideDetails.startLocation}
                      </p>
                    </div>
                  </div>

                  {/* Destination Location */}
                  <div className="relative flex items-start gap-4">
                    <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-surface flex items-center justify-center text-white shrink-0 z-10 shadow-sm mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                        <MapPin size={12} className="text-rose-500" />
                        <span>Destination / Finish Point</span>
                      </span>
                      <p className="text-xs sm:text-sm font-semibold text-text-main mt-1 leading-relaxed">
                        {resolvedEndLocation || rideDetails.endLocation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-Item Balanced Telemetry Matrix (Support Card Removed, Large Balanced Layout & Icons) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5 border-t border-border/60 mt-auto">
                {/* 1. Distance */}
                <div className="bg-hover/70 border border-border/80 hover:border-border p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center text-[#EB712B] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Navigation size={22} className="shrink-0" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                      Total Distance
                    </span>
                    <p className="text-lg sm:text-xl font-black text-text-main tracking-tight truncate leading-tight">
                      {rideDetails.distance}
                    </p>
                  </div>
                </div>

                {/* 2. Avg Pace */}
                <div className="bg-hover/70 border border-border/80 hover:border-border p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center text-[#EB712B] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Gauge size={22} className="shrink-0" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                      Avg Pace
                    </span>
                    <p className="text-lg sm:text-xl font-black text-text-main tracking-tight truncate leading-tight">
                      {rideDetails.avgPace}
                    </p>
                  </div>
                </div>

                {/* 3. Elevation */}
                <div className="bg-hover/70 border border-border/80 hover:border-border p-4 sm:p-5 rounded-2xl flex items-center gap-4 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center text-[#EB712B] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <TrendingUp size={22} className="shrink-0" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                      Elevation & Slope
                    </span>
                    <p className="text-lg sm:text-xl font-black text-text-main tracking-tight truncate leading-tight">
                      {rideDetails.elevationGain || (rideDetails.maxSlope ? `Slope ${rideDetails.maxSlope}` : "Rolling Terrain")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Join Activity Card + Group Chat Card */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-6">
            
            {/* Activity Participation Card (No 'Open' badge, professional CTA, Leave handler) */}
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm relative overflow-hidden">
              <div className="space-y-0.5 pb-3 border-b border-border/60">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">Participation</span>
                <h3 className="text-base font-black text-text-main tracking-tight uppercase">
                  {isJoined ? "You are Registered" : "Join Activity"}
                </h3>
              </div>

              {isJoined ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>You are registered for this activity</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLeaveClick}
                    disabled={isLeaving}
                    className="w-full py-3 px-4 rounded-xl bg-hover hover:bg-rose-500/10 text-text-muted hover:text-rose-400 border border-border hover:border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isLeaving ? (
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogOut size={14} />
                        <span>Leave Activity</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {isPaymentRequired && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted">Activity Fee</span>
                        <span className="text-base font-black text-emerald-400 tracking-tight">{priceFormatted || "Paid Entry"}</span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-tight font-medium">
                        Online payment required. Processed securely via Stripe Checkout. Spot confirmed instantly upon completion.
                      </p>
                    </div>
                  )}

                  <div className="flex items-start gap-2.5 pt-0.5">
                    <input 
                      type="checkbox" 
                      id="accept-terms-checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-[#EB712B] focus:ring-[#EB712B] cursor-pointer mt-0.5"
                    />
                    <label htmlFor="accept-terms-checkbox" className="text-xs text-text-muted font-medium leading-snug cursor-pointer select-none">
                      I acknowledge and accept the{" "}
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTermsModal(true); }}
                        className="text-[#EB712B] font-extrabold underline hover:text-[#d66525] cursor-pointer"
                      >
                        Terms & Safety Guidelines
                      </button>
                      .
                    </label>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      if (!acceptTerms) {
                        toast.error("Please read and accept the Terms & Safety Guidelines before joining.");
                        return;
                      }
                      handleJoinClick();
                    }}
                    disabled={isJoining}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#EB712B] hover:bg-[#d66525] active:scale-[0.99] text-white shadow-sm"
                  >
                    {isJoining ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : isPaymentRequired ? (
                      <>
                        <CreditCard size={15} />
                        <span>Pay & Join Activity {priceFormatted ? `(${priceFormatted})` : ''}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Join Activity</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Utility Quick Action Suite: GCal, GPX, Share */}
              <div className="pt-3.5 border-t border-border/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleAddToCalendar}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-hover hover:bg-border border border-border text-text-muted hover:text-text-main flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                  title="Add to Google Calendar"
                >
                  <GoogleCalendarIcon size={14} />
                  <span>Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadGpx}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-hover hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                  title="Download GPX Route"
                >
                  <Download size={13} />
                  <span>GPX Route</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2 rounded-xl bg-hover hover:bg-[#EB712B]/10 border border-border hover:border-[#EB712B]/30 text-text-muted hover:text-[#EB712B] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Share Activity"
                  aria-label="Share"
                >
                  <Share2 size={14} />
                </button>
              </div>
            </div>

            {/* Dedicated Activity Group Chat Status Card (flex-1 to match Route & Waypoints bottom) */}
            <div className="bg-surface border border-border rounded-3xl p-6 sm:p-7 flex-1 flex flex-col justify-between shadow-sm">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#EB712B] shrink-0" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-main">
                      Group Chat
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  {isJoined 
                    ? "Connect in real-time with the organizer and fellow participants to coordinate rendezvous point, pace, and equipment."
                    : "Group discussion is reserved for registered athletes. Join this activity to unlock the conversation room."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenGroupChat}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer mt-4 ${
                  isJoined 
                    ? "bg-[#EB712B] hover:bg-[#d66525] text-white shadow-sm"
                    : "bg-hover border border-border text-text-muted hover:text-text-main"
                }`}
              >
                {isJoined ? (
                  <>
                    <MessageSquare size={14} />
                    <span>Open Group Chat</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Join Activity to Chat</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* HORIZONTAL LEVEL DIVIDER SEPARATING UPPER & LOWER ARCHITECTURAL SECTIONS */}
        {/* ========================================================================= */}
        <div className="h-px w-full bg-border/60" />

        {/* ========================================================================= */}
        {/* 4. ROW 2: 2 CARDS ON LEFT, VERTICAL DIVIDER, 2 FLOATING SECTIONS ON RIGHT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): 2 Cards with vertical border on right */}
          <div className="lg:col-span-8 space-y-6 lg:pr-8 lg:border-r lg:border-border/60">
            
            {/* Activity Overview & Guidelines (Modern Floating Text Directly on Background) */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/60">
                <FileText size={17} className="text-[#EB712B] shrink-0" />
                <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-text-main">
                  Activity Overview & Guidelines
                </h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed font-medium whitespace-pre-line pl-0.5">
                {rideDetails.description}
              </p>
            </div>

            {/* Modern Line Divider between Overview & Participants */}
            <div className="h-px w-full bg-border/60" />

            {/* Section 2: Registered Participants (Sharp Modern Lines Layout, No Card Wrapper) */}
            <div className="space-y-4 pt-1">
              {/* Header with Title and Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <Users size={17} className="text-[#EB712B] shrink-0" />
                  <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-text-main">
                    Registered Participants
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-extrabold">
                    {activeParticipants.length} Athletes
                  </span>
                </div>

                {/* Role Filter Tabs */}
                <div className="flex items-center gap-1 p-1 bg-surface border border-border/80 rounded-xl shrink-0 self-start sm:self-auto shadow-xs">
                  <button
                    type="button"
                    onClick={() => setParticipantRoleFilter("all")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer",
                      participantRoleFilter === "all"
                        ? "bg-[#EB712B] text-white shadow-xs"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    All ({activeParticipants.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipantRoleFilter("leader")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer",
                      participantRoleFilter === "leader"
                        ? "bg-[#EB712B] text-white shadow-xs"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    Leaders ({leaderCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setParticipantRoleFilter("participant")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer",
                      participantRoleFilter === "participant"
                        ? "bg-[#EB712B] text-white shadow-xs"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    Participants ({participantCount})
                  </button>
                </div>
              </div>

              {/* Search Toolbar & Filter Controls */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
                  <input
                    type="text"
                    placeholder="Search roster by athlete name, @handle, or email..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="w-full bg-surface hover:bg-hover border border-border/80 focus:border-[#EB712B]/60 pl-9 pr-9 py-2.5 rounded-xl text-xs font-semibold text-text-main placeholder:text-text-muted placeholder:font-normal focus:outline-none transition-all shadow-xs"
                  />
                  {participantSearch && (
                    <button
                      type="button"
                      onClick={() => setParticipantSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-[#EB712B] transition-colors cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {(participantSearch || participantRoleFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setParticipantSearch("");
                      setParticipantRoleFilter("all");
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-surface hover:bg-hover border border-border/80 text-text-muted hover:text-text-main text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Reusable DataTable with Sharp Modern Lines */}
              <DataTable<ParticipantRow>
                data={filteredParticipants}
                columns={participantColumns}
                searchQuery={participantSearch}
                searchableKeys={["name", "username", "email", "role"]}
                className="!rounded-xl border border-border/80 shadow-xs"
                emptyMessage={
                  participantSearch
                    ? `No participants matched "${participantSearch}".`
                    : participantRoleFilter !== "all"
                    ? `No participants found in category "${participantRoleFilter}".`
                    : "No registered participants yet."
                }
              />
            </div>

          </div>

          {/* Right Column (4 cols): 2 Non-cards with floating text and line dividers */}
          <div className="lg:col-span-4 space-y-7 lg:pl-2">
            
            {/* Non-card 1: Activity Organizer (Dynamic Details, Verified Host Tag Removed) */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/60">
                <Users size={15} className="text-[#EB712B] shrink-0" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-main">
                  Activity Organizer
                </h3>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center font-black text-xs text-text-main shrink-0 overflow-hidden shadow-sm">
                    {rideDetails.hostAvatar ? (
                      <img src={rideDetails.hostAvatar} alt={rideDetails.host} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#EB712B] font-extrabold">{rideDetails.hostInitials}</span>
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-extrabold text-text-main leading-tight truncate">
                      {rideDetails.host}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-text-muted truncate">
                      <span className="text-[#EB712B] font-bold">{rideDetails.hostUsername}</span>
                      <span>•</span>
                      <span className="text-[10px] uppercase font-extrabold text-text-muted">Host</span>
                    </div>
                    {rideDetails.hostEmail && (
                      <p className="text-[11px] text-text-muted truncate flex items-center gap-1.5 pt-0.5">
                        <Mail size={11} className="shrink-0 text-[#EB712B]" />
                        <span className="truncate">{rideDetails.hostEmail}</span>
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDirectMessage(rideDetails.hostId, rideDetails.host, rideDetails.hostAvatar)}
                  className="px-3.5 py-2.5 rounded-xl bg-hover hover:bg-[#EB712B]/15 border border-border hover:border-[#EB712B]/40 text-text-muted hover:text-[#EB712B] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Message Host"
                >
                  <MessageSquare size={13} />
                  <span>Message</span>
                </button>
              </div>
            </div>

            {/* Modern Line Divider between Organizer & Leaders */}
            <div className="h-px w-full bg-border/60" />

            {/* Non-card 2: Ride Leaders (Dynamic with Email, Username, Role) */}
            {rideDetails.leaders.length > 0 && (
              <div className="space-y-3.5">
                <div className="flex items-center gap-2 pb-2.5 border-b border-border/60">
                  <Award size={15} className="text-[#EB712B] shrink-0" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-main">
                    Ride Leaders ({rideDetails.leaders.length})
                  </h3>
                </div>

                <div className="space-y-3 pt-1">
                  {rideDetails.leaders.map((leader: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-border/30 last:border-0">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-surface border border-border flex items-center justify-center font-extrabold text-xs text-text-main shrink-0 overflow-hidden shadow-sm">
                          {leader.profilePhoto ? (
                            <img src={leader.profilePhoto} className="w-full h-full object-cover" alt={leader.name} />
                          ) : (
                            <span className="text-[#EB712B]">{leader.name.substring(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-extrabold text-text-main truncate">{leader.name}</p>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 shrink-0">
                              {leader.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted truncate">
                            <span className="text-[#EB712B] font-bold">{leader.username}</span>
                            {leader.email && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 truncate">
                                  <Mail size={10} className="shrink-0 text-text-muted" />
                                  <span className="truncate">{leader.email}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDirectMessage(leader.id, leader.name, leader.profilePhoto)}
                        className="p-2 rounded-xl bg-hover hover:bg-[#EB712B]/15 border border-border hover:border-[#EB712B]/40 text-text-muted hover:text-[#EB712B] transition-all cursor-pointer shrink-0"
                        title={`Message ${leader.name}`}
                      >
                        <MessageSquare size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Universal Share Modal */}
      {isShareModalOpen && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={rideDetails.title}
          description={`Join ${rideDetails.title} hosted by ${rideDetails.clubName}! Distance: ${rideDetails.distance}, Pace: ${rideDetails.avgPace}.`}
          url={`${window.location.origin}/view/userside/dashboard/ride/${rideDetails.id}`}
          image={rideDetails.image}
          category="Activity"
        />
      )}

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
                <h3 className="font-extrabold text-base md:text-lg text-text-main">Terms & Safety Guidelines</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-9 h-9 rounded-xl bg-hover border border-border flex items-center justify-center text-text-muted hover:text-text-main cursor-pointer"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm text-text-muted leading-relaxed max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div>
                <h4 className="font-extrabold text-text-main mb-1">1. Mandatory Safety & Gear Policy</h4>
                <p>Helmets and proper sports apparel are required for all cycling and high-velocity activities. Participants must inspect their gear prior to departure.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-text-main mb-1">2. Traffic Laws & Environmental Respect</h4>
                <p>All riders and runners must follow traffic signs, signal properly, and respect local pedestrians and trail etiquette at all times.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-text-main mb-1">3. Risk Awareness & Personal Responsibility</h4>
                <p>By registering for this event, you understand the aerobic and environmental challenges of outdoor activity and assume personal responsibility.</p>
              </div>
              <div>
                <h4 className="font-extrabold text-text-main mb-1">4. Community Code of Conduct</h4>
                <p>Ride With Pals maintains a zero-tolerance policy for unsportsmanlike behavior, harassment, or unsafe reckless maneuvers.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 rounded-xl border border-border bg-hover font-bold text-xs text-text-muted hover:text-text-main cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={() => {
                  setAcceptTerms(true);
                  setShowTermsModal(false);
                  toast.success("Safety guidelines accepted!");
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
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in cursor-pointer"
            onClick={() => setIsRosterOpen(false)}
          />

          <div className="relative w-full max-w-md h-full bg-surface border-l border-border shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <h3 className="font-extrabold text-text-main text-base tracking-tight">Registered Athletes</h3>
                <p className="text-[10px] text-text-muted font-medium">Activity roster ({activeParticipants.length} registered)</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsRosterOpen(false)}
                className="w-10 h-10 rounded-2xl bg-hover hover:bg-border border border-border flex items-center justify-center text-text-muted hover:text-text-main transition-all cursor-pointer"
                aria-label="Close roster"
              >
                <X size={16} />
              </button>
            </div>

            {/* Global Roster Search */}
            <div className="p-4 border-b border-border relative shrink-0">
              <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-text-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search athlete by name or @username..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-hover border border-border pl-10 pr-4 py-3 rounded-2xl text-xs font-bold text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/40 transition-colors"
              />
            </div>

            {/* Scrollable Participants Directory */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {filteredRoster.length > 0 ? (
                filteredRoster.map((user: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between bg-hover p-4 rounded-2xl border border-border group hover:border-border/80 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center font-extrabold text-xs text-text-main shadow-sm uppercase tracking-wider shrink-0 overflow-hidden">
                        {user.profilePhoto ? (
                          <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#EB712B]">{user.initials}</span>
                        )}
                      </div>
                      <div className="flex flex-col space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold text-text-main leading-tight truncate">
                            {user.name}
                          </span>
                          {user.verified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                              <Check size={9} />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                          <span className="text-[#EB712B]">{user.username}</span>
                          <span>•</span>
                          <span>{user.role}</span>
                        </div>
                        {user.email && (
                          <p className="text-[10px] text-text-muted truncate flex items-center gap-1 pt-0.5">
                            <Mail size={10} className="shrink-0 text-text-muted" />
                            <span className="truncate">{user.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsRosterOpen(false);
                        handleDirectMessage(user.id, user.name, user.profilePhoto);
                      }}
                      className="p-2 rounded-xl bg-surface hover:bg-[#EB712B]/15 border border-border hover:border-[#EB712B]/40 text-text-muted hover:text-[#EB712B] transition-all cursor-pointer shrink-0"
                      title={`Message ${user.name}`}
                    >
                      <MessageSquare size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <ShieldAlert size={32} className="text-text-muted" />
                  <p className="text-xs font-bold text-text-muted">No matching athletes found</p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t border-border bg-hover/40 flex items-center justify-between shrink-0">
              <div className="flex flex-col">
                <span className="text-[8px] font-extrabold text-text-muted uppercase tracking-wider">Event Operated By</span>
                <span className="text-xs font-extrabold text-text-main mt-0.5">{rideDetails.host}</span>
              </div>
              <button 
                type="button"
                onClick={() => setIsRosterOpen(false)}
                className="bg-[#EB712B] hover:bg-[#d66525] text-white px-5 py-3 rounded-xl font-extrabold text-[10px] tracking-wider uppercase transition-all cursor-pointer shadow-md"
              >
                Close Directory
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Micro keyframe animations */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.2s ease-in-out; }
      `}</style>
    </div>
  );
};

export default RideJoining;