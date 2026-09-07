import React from "react";
import { X, Bike, Activity, Trophy, Calendar, MapPin, Users, ArrowRight } from "lucide-react";

export interface RideMapItem {
  id: number;
  title: string;
  clubName: string;
  date: string;
  location: string;
  rideType: string;
  speed: string;
  distance: string;
  participants: string;
  organizer: string;
  organizerAvatar: string | null;
  image: string;
  isPublic: boolean;
}

interface ActivityMapPreviewCardProps {
  ride: RideMapItem;
  onClose: () => void;
  onSelectRide: (rideId: number | string) => void;
}

export const ActivityMapPreviewCard: React.FC<ActivityMapPreviewCardProps> = ({
  ride,
  onClose,
  onSelectRide,
}) => {
  if (!ride) return null;

  const sportName = ride.rideType || "Cycling";

  return (
    <div
      onClick={() => onSelectRide(ride.id)}
      className="absolute bottom-6 left-4 sm:left-6 z-[1000] w-[340px] sm:w-[410px] bg-[#161616] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 flex cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] group backdrop-blur-md"
      role="button"
      tabIndex={0}
    >
      {/* Left section: Cover Image & Title */}
      <div className="relative w-[48%] h-48 bg-black overflow-hidden shrink-0">
        <img
          src={ride.image || "/Images/CycleImage2.png"}
          alt={ride.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
          }}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
          aria-label="Close preview"
        >
          <X size={15} />
        </button>

        {/* Ride Title & Club Name */}
        <div className="absolute bottom-3 left-3 right-3 text-left">
          <h4 className="font-extrabold text-white text-sm leading-snug line-clamp-1 group-hover:text-[#EB712B] transition-colors uppercase">
            {ride.title}
          </h4>
          <p className="text-gray-300 text-[11px] font-medium mt-0.5 tracking-wide line-clamp-1">
            {ride.clubName}
          </p>
        </div>
      </div>

      {/* Right section: Telemetry & Actions */}
      <div className="w-[52%] p-3.5 sm:p-4 flex flex-col justify-between bg-[#161616] text-left">
        {/* Top: Sport Badge + Public / Private */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-bold tracking-wide">
            {sportName === "Running" ? (
              <Activity size={12} className="text-amber-400 shrink-0" />
            ) : sportName === "Triathlon" ? (
              <Trophy size={12} className="text-purple-300 shrink-0" />
            ) : (
              <Bike size={12} className="text-[#EB712B] shrink-0" />
            )}
            <span>{sportName}</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
              ride.isPublic
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {ride.isPublic ? "Public" : "Private"}
          </span>
        </div>

        {/* Middle: Details (Date, Location, Distance) */}
        <div className="space-y-1.5 my-auto py-1">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
            <Calendar size={12} className="text-gray-400 shrink-0" />
            <span className="truncate">{ride.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
            <MapPin size={12} className="text-gray-400 shrink-0" />
            <span className="truncate">{ride.location}</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 text-[10px] text-gray-300 font-semibold">
            {ride.distance !== "N/A" && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                {ride.distance}
              </span>
            )}
            <span className="flex items-center gap-1 text-gray-400">
              <Users size={11} className="shrink-0" />
              <span>{ride.participants} joined</span>
            </span>
          </div>
        </div>

        {/* Bottom CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectRide(ride.id);
          }}
          className="w-full py-2 px-3 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-[11px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1 shadow-md cursor-pointer"
        >
          <span>View Activity</span>
          <ArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};
