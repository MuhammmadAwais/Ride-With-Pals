import React from "react";
import { X, Bike, Activity, Trophy, Calendar, MapPin, Users, ArrowRight, Download, Share2 } from "lucide-react";
import { GoogleCalendarIcon } from "@/components/common/GoogleCalendarIcon";
import { buildGoogleCalendarUrl, downloadGpxFile } from "../utils/activityUtils";
import { toast } from "sonner";

export interface RideMapItem {
  id: number;
  title: string;
  clubName: string;
  date: string;
  time?: string;
  location: string;
  rideType: string;
  speed: string;
  distance: string;
  participants: string;
  organizer: string;
  organizerAvatar: string | null;
  image: string;
  isPublic: boolean;
  gpxFile?: string | null;
  description?: string;
  terrainBadges?: string[];
  isPaymentRequired?: boolean;
  price?: number;
  priceFormatted?: string;
}

interface ActivityMapPreviewCardProps {
  ride: RideMapItem;
  onClose: () => void;
  onSelectRide: (rideId: number | string) => void;
  onShare?: (ride: RideMapItem) => void;
}

export const ActivityMapPreviewCard: React.FC<ActivityMapPreviewCardProps> = ({
  ride,
  onClose,
  onSelectRide,
  onShare,
}) => {
  if (!ride) return null;

  const sportName = ride.rideType || "Cycling";

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const gcalUrl = buildGoogleCalendarUrl({
      id: ride.id,
      title: ride.title,
      date: ride.date,
      time: ride.time,
      location: ride.location,
      description: ride.description,
      clubName: ride.clubName,
      distance: ride.distance,
      speed: ride.speed,
      rideType: ride.rideType,
    });
    window.open(gcalUrl, "_blank", "noopener,noreferrer");
    toast.success("Opening Google Calendar...");
  };

  const handleDownloadGpx = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadGpxFile({
      id: ride.id,
      title: ride.title,
      clubName: ride.clubName,
      location: ride.location,
      date: ride.date,
      rideType: ride.rideType,
      gpxFile: ride.gpxFile,
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(ride);
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/view/userside/dashboard/ride/${ride.id}`);
      toast.success("Activity link copied to clipboard!");
    }
  };

  return (
    <div
      onClick={() => onSelectRide(ride.id)}
      className="absolute bottom-6 left-4 sm:left-6 z-[1000] w-[340px] sm:w-[420px] bg-surface dark:bg-[#161616] border border-border/80 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl flex cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] group backdrop-blur-md"
      role="button"
      tabIndex={0}
    >
      {/* Left section: Cover Image & Title */}
      <div className="relative w-[46%] h-52 bg-main-bg dark:bg-black overflow-hidden shrink-0">
        <img
          src={ride.image || "/Images/CycleImage2.png"}
          alt={ride.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
          }}
        />

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-surface/85 dark:bg-black/60 hover:bg-surface dark:hover:bg-black/90 text-text-main dark:text-white flex items-center justify-center transition-all cursor-pointer border border-border dark:border-white/10 shadow-xs"
          aria-label="Close preview"
        >
          <X size={15} />
        </button>

        {/* Badges on Image (Road/Trail/Social) */}
        {ride.terrainBadges && ride.terrainBadges.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-wrap gap-1 max-w-[100px] justify-end">
            {ride.terrainBadges.map((badge, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider backdrop-blur-md border ${
                  badge === "Road"
                    ? "bg-sky-950/80 border-sky-500/40 text-sky-300"
                    : badge === "Trail"
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                    : badge === "Social"
                    ? "bg-indigo-950/80 border-indigo-500/40 text-indigo-300"
                    : "bg-amber-950/80 border-amber-500/40 text-amber-300"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Ride Title & Club Name */}
        <div className="absolute bottom-3 left-3 right-3 text-left">
          <h4 className="font-extrabold text-white text-sm leading-snug line-clamp-1 group-hover:text-[#EB712B] transition-colors uppercase">
            {ride.title}
          </h4>
          <p className="text-white/80 text-[11px] font-medium mt-0.5 tracking-wide line-clamp-1">
            {ride.clubName}
          </p>
        </div>
      </div>

      {/* Right section: Telemetry & Actions */}
      <div className="w-[54%] p-3.5 sm:p-4 flex flex-col justify-between bg-surface dark:bg-[#161616] text-left">
        {/* Top: Sport Badge + Public / Private */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-hover dark:bg-white/5 border border-border dark:border-white/10 text-text-main dark:text-white rounded-full text-[10px] font-bold tracking-wide">
            {sportName === "Running" ? (
              <Activity size={11} className="text-amber-500 dark:text-amber-400 shrink-0" />
            ) : sportName === "Triathlon" ? (
              <Trophy size={11} className="text-purple-600 dark:text-purple-300 shrink-0" />
            ) : (
              <Bike size={11} className="text-[#EB712B] shrink-0" />
            )}
            <span>{sportName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {ride.isPaymentRequired && (
              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {ride.priceFormatted || "Paid"}
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                ride.isPublic
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}
            >
              {ride.isPublic ? "Public" : "Private"}
            </span>
          </div>
        </div>

        {/* Middle: Details (Date, Location, Distance) */}
        <div className="space-y-1 my-auto py-1">
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted dark:text-gray-300">
            <Calendar size={11} className="text-text-muted dark:text-gray-400 shrink-0" />
            <span className="truncate">{ride.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-text-muted dark:text-gray-300">
            <MapPin size={11} className="text-text-muted dark:text-gray-400 shrink-0" />
            <span className="truncate">{ride.location}</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 text-[10px] text-text-main dark:text-gray-300 font-semibold">
            {ride.distance !== "N/A" && (
              <span className="px-1.5 py-0.5 rounded bg-hover dark:bg-white/5 border border-border dark:border-white/10 text-[9px]">
                {ride.distance}
              </span>
            )}
            <span className="flex items-center gap-1 text-text-muted dark:text-gray-400 text-[9px]">
              <Users size={10} className="shrink-0" />
              <span>{ride.participants} joined</span>
            </span>
          </div>
        </div>

        {/* Quick Utility Action Buttons: GCal, GPX, Share */}
        <div className="flex items-center gap-1 py-1 border-t border-border/80 dark:border-white/10">
          <button
            type="button"
            onClick={handleAddToCalendar}
            className="p-1.5 rounded-lg bg-hover dark:bg-white/5 hover:bg-hover/80 dark:hover:bg-white/10 border border-border dark:border-white/10 text-text-muted hover:text-text-main dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer"
            title="Add to Google Calendar"
          >
            <GoogleCalendarIcon size={14} />
          </button>
          <button
            type="button"
            onClick={handleDownloadGpx}
            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-bold"
            title="Download GPX Route"
          >
            <Download size={11} /> GPX
          </button>
          <button
            type="button"
            onClick={handleShareClick}
            className="p-1.5 rounded-lg bg-hover dark:bg-white/5 hover:bg-[#EB712B]/10 border border-border dark:border-white/10 hover:border-[#EB712B]/30 text-text-muted hover:text-[#EB712B] dark:text-gray-300 dark:hover:text-[#EB712B] transition-all cursor-pointer ml-auto"
            title="Share Activity"
          >
            <Share2 size={13} />
          </button>
        </div>

        {/* Bottom CTA Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectRide(ride.id);
          }}
          className="w-full py-1.5 px-3 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-[10px] font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1 shadow-md cursor-pointer"
        >
          <span>View Activity</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};
