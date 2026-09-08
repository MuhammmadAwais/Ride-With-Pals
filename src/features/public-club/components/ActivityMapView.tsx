import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, LayoutGrid, List as ListIcon, Map as MapIcon, Loader2, Bike, Activity as ActivityIcon, Trophy } from "lucide-react";
import { ActivityMapPreviewCard, type RideMapItem } from "./ActivityMapPreviewCard";
import { getCoordinatesForCountry, resolveClubCoordinates } from "../services/clubGeocoding";

interface ActivityMapViewProps {
  rides: RideMapItem[];
  user?: any;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  onViewModeChange: (mode: "grid" | "list" | "map") => void;
  onSelectRide: (rideId: number | string) => void;
  onShare?: (ride: RideMapItem) => void;
}

interface ActivityMarkerData {
  ride: RideMapItem;
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

// Custom Leaflet icon for Activity Pin
const createActivityPinIcon = (sportType: string, isSelected: boolean) => {
  const isRunning = sportType.toLowerCase().includes("run");
  const isTriathlon = sportType.toLowerCase().includes("triathlon");
  const pinBg = isRunning ? "#f59e0b" : isTriathlon ? "#a855f7" : "#EB712B";
  const iconSvg = isRunning
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>`
    : isTriathlon
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`;

  return L.divIcon({
    className: "custom-activity-pin-container",
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        transform: ${isSelected ? "scale(1.25) translateY(-6px)" : "scale(1)"};
      ">
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: ${pinBg};
          border: 3px solid #ffffff;
          box-shadow: 0 6px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        ">
          ${iconSvg}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${pinBg};
          margin-top: -2px;
          filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));
        "></div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 51],
    popupAnchor: [0, -52],
  });
};

export const ActivityMapView: React.FC<ActivityMapViewProps> = ({
  rides,
  user,
  selectedType = "All",
  onTypeChange,
  onViewModeChange,
  onSelectRide,
  onShare,
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedRide, setSelectedRide] = useState<RideMapItem | null>(null);
  const [markerList, setMarkerList] = useState<ActivityMarkerData[]>([]);
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

  // 2. Resolve Coordinates for all rides
  useEffect(() => {
    let isMounted = true;
    const loadMarkers = async () => {
      setIsLoadingMarkers(true);
      const results: ActivityMarkerData[] = [];
      const refCoords = userLocation || [40.4168, -3.7038];

      for (let i = 0; i < rides.length; i++) {
        const ride = rides[i];
        try {
          const coords = await resolveClubCoordinates(
            { location: ride.location, id: ride.id },
            i,
            refCoords
          );
          results.push({ ride, coords });
        } catch {
          results.push({
            ride,
            coords: [refCoords[0] + (i % 3) * 0.05, refCoords[1] + (i % 3) * 0.05],
          });
        }
      }

      if (isMounted) {
        setMarkerList(results);
        setIsLoadingMarkers(false);

        // If no user location resolved yet, center map on first ride
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
  }, [rides, userLocation]);

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
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[1000] flex flex-wrap items-center gap-2 sm:gap-3">
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

        {/* Sport Type Filters (if onTypeChange provided) */}
        {onTypeChange && (
          <div className="flex bg-surface/90 dark:bg-[#141414]/90 border border-border dark:border-white/10 rounded-2xl p-1 shadow-2xl backdrop-blur-md text-xs font-bold">
            {[
              { id: "All", label: "All", icon: null },
              { id: "Cycling", label: "Cycling", icon: Bike },
              { id: "Running", label: "Running", icon: ActivityIcon },
              { id: "Triathlon", label: "Triathlon", icon: Trophy },
            ].map((sport) => {
              const Icon = sport.icon;
              const isActive = selectedType === sport.id;
              return (
                <button
                  key={sport.id}
                  type="button"
                  onClick={() => onTypeChange(sport.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-text-main/10 text-text-main dark:bg-white/10 dark:text-white shadow-inner"
                      : "text-text-muted hover:text-text-main dark:hover:text-white"
                  }`}
                >
                  {Icon && <Icon size={12} />}
                  <span>{sport.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Total activities in view pill */}
        <div className="hidden md:flex items-center gap-1.5 px-4 py-2.5 bg-surface/90 dark:bg-[#141414]/90 border border-border dark:border-white/10 rounded-2xl text-xs font-bold text-text-muted dark:text-gray-300 shadow-2xl backdrop-blur-md">
          <Bike size={14} className="text-[#EB712B]" />
          <span>{rides.length} Activities Located</span>
          {isLoadingMarkers && <Loader2 size={12} className="animate-spin text-[#EB712B] ml-1" />}
        </div>
      </div>

      {/* ── Top-Right Locate Recenter Button ── */}
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

      {/* ── Leaflet Map Container ── */}
      <MapContainer
        center={mapTarget}
        zoom={mapZoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={["mt0", "mt1", "mt2", "mt3"]}
          maxZoom={20}
        />

        <MapController center={mapTarget} zoom={mapZoom} triggerCount={flyTrigger} />

        {/* User Location Blue Dot Marker */}
        {userLocation && <Marker position={userLocation} icon={userIcon} />}

        {/* Activity Custom Pins */}
        {markerList.map(({ ride, coords }) => {
          const isSelected = selectedRide?.id === ride.id;
          const pinIcon = createActivityPinIcon(ride.rideType, isSelected);

          return (
            <Marker
              key={ride.id}
              position={coords}
              icon={pinIcon}
              eventHandlers={{
                click: () => {
                  setSelectedRide(ride);
                  setMapTarget(coords);
                  setFlyTrigger((p) => p + 1);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {/* ── Bottom Floating Activity Preview Card ── */}
      {selectedRide && (
        <ActivityMapPreviewCard
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
          onSelectRide={onSelectRide}
          onShare={onShare}
        />
      )}
    </div>
  );
};
