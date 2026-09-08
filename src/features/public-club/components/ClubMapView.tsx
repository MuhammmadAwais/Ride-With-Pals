import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, LayoutGrid, List as ListIcon, Map as MapIcon, Loader2, Users } from "lucide-react";
import { ClubMapPreviewCard } from "./ClubMapPreviewCard";
import { getCoordinatesForCountry, resolveClubCoordinates } from "../services/clubGeocoding";

interface ClubMapViewProps {
  clubs: any[];
  user?: any;
  currentFilterType?: "all" | "my";
  onFilterTypeChange?: (type: "all" | "my") => void;
  onViewModeChange: (mode: "grid" | "list" | "map") => void;
  onSelectClub: (club: any) => void;
}

interface ClubMarkerData {
  club: any;
  coords: [number, number];
}

// Controller component to smoothly fly/pan to coordinates
function MapController({
  center,
  zoom,
  triggerCount,
}: {
  center: [number, number] | null;
  zoom?: number;
  triggerCount: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, triggerCount, map]);

  return null;
}

// Custom Leaflet icon for user's location (Blue Dot with pulsing ring)
const createUserLocationIcon = () =>
  L.divIcon({
    className: "user-location-marker",
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.25);
          box-shadow: 0 0 14px rgba(37, 99, 235, 0.6);
          animation: pulse 2s infinite ease-in-out;
        "></div>
        <div style="
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: #2563eb;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          position: relative;
          z-index: 2;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.85); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 0.3; }
          100% { transform: scale(0.85); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

// Custom Leaflet icon for Club Pin (matching Image 2 & Image 3)
const createClubPinIcon = (avatarUrl: string, isSelected: boolean) =>
  L.divIcon({
    className: "custom-club-pin-container",
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: ${isSelected ? "scale(1.2) translateY(-6px)" : "scale(1)"};
      ">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #EB712B;
          border: 3.5px solid #ffffff;
          padding: 2px;
          box-shadow: 0 6px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(235,113,43,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        ">
          <img 
            src="${avatarUrl}" 
            style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" 
            onerror="this.src='/Images/CycleImage2.png'"
          />
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 7px solid transparent;
          border-right: 7px solid transparent;
          border-top: 10px solid #EB712B;
          margin-top: -3px;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
        "></div>
      </div>
    `,
    iconSize: [48, 58],
    iconAnchor: [24, 57],
    popupAnchor: [0, -58],
  });

export const ClubMapView: React.FC<ClubMapViewProps> = ({
  clubs,
  user,
  currentFilterType = "all",
  onFilterTypeChange,
  onViewModeChange,
  onSelectClub,
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedClub, setSelectedClub] = useState<any | null>(null);
  const [markerList, setMarkerList] = useState<ClubMarkerData[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(true);

  // Map view target state
  const [mapTarget, setMapTarget] = useState<[number, number]>([40.4168, -3.7038]); // Default center
  const [mapZoom, setMapZoom] = useState<number>(6);
  const [flyTrigger, setFlyTrigger] = useState<number>(0);

  // 1. Resolve User Location (GPS -> Country Capital -> Fallback)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setMapTarget(coords);
          setMapZoom(12);
          setFlyTrigger((p) => p + 1);
        },
        () => {
          // GPS Failed or Denied: Check user's profile country
          const capitalCoords = getCoordinatesForCountry(user?.country);
          if (capitalCoords) {
            setUserLocation(capitalCoords);
            setMapTarget(capitalCoords);
            setMapZoom(7);
            setFlyTrigger((p) => p + 1);
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      const capitalCoords = getCoordinatesForCountry(user?.country);
      if (capitalCoords) {
        setUserLocation(capitalCoords);
        setMapTarget(capitalCoords);
        setMapZoom(7);
        setFlyTrigger((p) => p + 1);
      }
    }
  }, [user?.country]);

  // 2. Resolve Coordinates for all filtered clubs
  useEffect(() => {
    let isMounted = true;
    const loadMarkers = async () => {
      setIsLoadingMarkers(true);
      const results: ClubMarkerData[] = [];
      const refCoords = userLocation || [40.4168, -3.7038];

      for (let i = 0; i < clubs.length; i++) {
        const club = clubs[i];
        try {
          const coords = await resolveClubCoordinates(club, i, refCoords);
          results.push({ club, coords });
        } catch {
          // If geocoding fails, fallback near base coords
          results.push({
            club,
            coords: [refCoords[0] + (i % 3) * 0.05, refCoords[1] + (i % 3) * 0.05],
          });
        }
      }

      if (isMounted) {
        setMarkerList(results);
        setIsLoadingMarkers(false);

        // If no user location resolved yet, center map on first club
        if (!userLocation && results.length > 0) {
          setMapTarget(results[0].coords);
          setMapZoom(9);
          setFlyTrigger((p) => p + 1);
        }
      }
    };

    loadMarkers();
    return () => {
      isMounted = false;
    };
  }, [clubs, userLocation]);

  // Handler for recenter button
  const handleRecenter = () => {
    if (userLocation) {
      setMapTarget(userLocation);
      setMapZoom(13);
      setFlyTrigger((p) => p + 1);
    } else if (markerList.length > 0) {
      setMapTarget(markerList[0].coords);
      setMapZoom(9);
      setFlyTrigger((p) => p + 1);
    }
  };

  const userIcon = useMemo(() => createUserLocationIcon(), []);

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-black select-none">
      {/* ── Top Floating Control Bar ── */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[1000] flex flex-wrap items-center gap-3">
        {/* View Mode Toggle Switch (Grid, List, Map) */}
        <div className="flex bg-surface/90 dark:bg-[#141414]/90 border border-border dark:border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className="p-2.5 rounded-xl text-text-muted hover:text-text-main dark:hover:text-white hover:bg-hover dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Grid View"
          >
            <LayoutGrid size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className="p-2.5 rounded-xl text-text-muted hover:text-text-main dark:hover:text-white hover:bg-hover dark:hover:bg-white/5 transition-all cursor-pointer"
            title="List View"
          >
            <ListIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("map")}
            className="p-2.5 rounded-xl bg-[#EB712B] text-white shadow-md transition-all cursor-pointer"
            title="Map View"
          >
            <MapIcon size={18} />
          </button>
        </div>

        {/* Club Filter Switch (All vs My Clubs) if handler provided */}
        {onFilterTypeChange && (
          <div className="flex bg-surface/90 dark:bg-[#141414]/90 border border-border dark:border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-md text-xs font-black uppercase tracking-wider">
            <button
              type="button"
              onClick={() => onFilterTypeChange("all")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                currentFilterType === "all"
                  ? "bg-text-main/10 text-text-main dark:bg-white/10 dark:text-white shadow-inner"
                  : "text-text-muted hover:text-text-main dark:hover:text-white"
              }`}
            >
              All Clubs
            </button>
            <button
              type="button"
              onClick={() => onFilterTypeChange("my")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                currentFilterType === "my"
                  ? "bg-text-main/10 text-text-main dark:bg-white/10 dark:text-white shadow-inner"
                  : "text-text-muted hover:text-text-main dark:hover:text-white"
              }`}
            >
              My Clubs
            </button>
          </div>
        )}

        {/* Total clubs in view pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-surface/90 dark:bg-[#141414]/90 border border-border dark:border-white/10 rounded-2xl text-xs font-bold text-text-muted dark:text-gray-300 shadow-2xl backdrop-blur-md">
          <Users size={14} className="text-[#EB712B]" />
          <span>{clubs.length} Clubs Located</span>
          {isLoadingMarkers && <Loader2 size={12} className="animate-spin text-[#EB712B] ml-1" />}
        </div>
      </div>

      {/* ── Top-Right Locate Recenter Button (Matching Image 3) ── */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          type="button"
          onClick={handleRecenter}
          className="w-11 h-11 rounded-2xl bg-surface/90 hover:bg-surface dark:bg-[#141414]/90 dark:hover:bg-[#1f1f1f] text-text-main dark:text-white hover:text-[#EB712B] border border-border dark:border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          title="Recenter to my location"
          aria-label="Recenter location"
        >
          <Navigation size={20} className={userLocation ? "text-[#EB712B]" : "text-text-main dark:text-white"} />
        </button>
      </div>

      {/* ── Map Container ── */}
      <MapContainer
        center={mapTarget}
        zoom={mapZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Google Maps Roadmap Tile Layer matching Image 2 & 3 */}
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        <MapController center={mapTarget} zoom={mapZoom} triggerCount={flyTrigger} />

        {/* User Location Blue Dot Marker */}
        {userLocation && <Marker position={userLocation} icon={userIcon} />}

        {/* Club Custom Pins */}
        {markerList.map(({ club, coords }) => {
          const isSelected = selectedClub?.id === club.id;
          const avatarUrl =
            club.logo || club.coverImage || "/Images/CycleImage2.png";
          const resolvedAvatar = avatarUrl.startsWith("http") || avatarUrl.startsWith("/")
            ? avatarUrl
            : `https://api.ridewithpals.com/uploads/${avatarUrl}`;

          const pinIcon = createClubPinIcon(resolvedAvatar, isSelected);

          return (
            <Marker
              key={club.id}
              position={coords}
              icon={pinIcon}
              eventHandlers={{
                click: () => {
                  setSelectedClub(club);
                  setMapTarget(coords);
                  setFlyTrigger((p) => p + 1);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* ── Bottom Floating Club Preview Card (Matching Image 3) ── */}
      {selectedClub && (
        <ClubMapPreviewCard
          club={selectedClub}
          onClose={() => setSelectedClub(null)}
          onNavigate={onSelectClub}
        />
      )}
    </div>
  );
};
