import React, { useState, useEffect } from "react";
import { X, MapPin, Locate, Check, ExternalLink, Loader2, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

// Fix Leaflet marker icon issue in React
const customPinIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="
    width: 36px;
    height: 36px;
    background-color: #EB712B;
    border: 3px solid #ffffff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 4px 14px rgba(235,113,43,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="width: 10px; height: 10px; background-color: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string) => void;
  initialLocation?: string;
}

// Helper component to center map on coordinates change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

// Map Click Listener
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation = "",
}) => {
  // Default to London or GPS
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 51.505, lng: -0.09 });
  const [address, setAddress] = useState<string>(initialLocation);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // Reverse geocode lat/lng to readable address
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      if (apiKey) {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const formatted = data.results[0].formatted_address;
          setAddress(formatted);
          setIsGeocoding(false);
          return;
        }
      }

      // Fallback to Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    reverseGeocode(lat, lng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        reverseGeocode(latitude, longitude);
        toast.success("Location updated to your current position!");
      },
      (err) => {
        toast.error("Could not fetch location: " + err.message);
        setIsGeocoding(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      if (apiKey) {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          setCoords({ lat: location.lat, lng: location.lng });
          setAddress(data.results[0].formatted_address);
          setIsSearching(false);
          return;
        }
      }

      // Fallback search via Nominatim
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCoords({ lat, lng });
        setAddress(data[0].display_name);
      } else {
        toast.error("Location not found. Try a different search term.");
      }
    } catch {
      toast.error("Failed to search location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!address.trim()) {
      toast.error("Please pick a valid location.");
      return;
    }
    onSelectLocation(address);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B]">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pick Location on Google Maps</h3>
              <p className="text-xs text-gray-400">Click anywhere on the map or search to select your club location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar & Controls Bar */}
        <div className="p-4 bg-[#111111] border-b border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-2/3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, city, or place..."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2 pl-9 pr-20 text-xs text-white outline-none focus:border-[#EB712B] transition-colors"
            />
            <Search size={14} className="absolute left-3 top-3 text-gray-500" />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer border-0"
            >
              {isSearching ? <Loader2 size={12} className="animate-spin" /> : "Search"}
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white font-medium transition-colors cursor-pointer"
            >
              <Locate size={14} className="text-[#EB712B]" />
              <span>Current GPS</span>
            </button>

            <a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-gray-300 hover:text-white font-medium transition-colors cursor-pointer text-decoration-none"
            >
              <ExternalLink size={14} className="text-blue-400" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative w-full h-[380px] bg-[#111111]">
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={coords.lat} lng={coords.lng} />
            <MapClickHandler onClick={handleMapClick} />
            <Marker position={[coords.lat, coords.lng]} icon={customPinIcon} />
          </MapContainer>

          {isGeocoding && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs text-white shadow-lg">
              <Loader2 size={14} className="animate-spin text-[#EB712B]" />
              <span>Fetching location details...</span>
            </div>
          )}
        </div>

        {/* Modal Footer with Selected Address & Confirm Button */}
        <div className="p-4 md:p-6 bg-[#161616] border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 w-full md:w-3/4">
            <MapPin size={18} className="text-[#EB712B] shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">Selected Location</span>
              <p className="text-xs text-white font-medium line-clamp-2">
                {isGeocoding ? "Loading..." : address || "No location selected"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2 cursor-pointer border-0"
            >
              <Check size={16} />
              <span>Select Location</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
