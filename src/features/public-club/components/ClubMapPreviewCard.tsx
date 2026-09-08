import React from "react";
import { X, Crown, Bike, Activity, Trophy } from "lucide-react";
import { useGetClubMembersListQuery } from "@/features/club/api/clubApiSlice";
import { extractMembersList } from "../pages/ClubDetails";

interface ClubMapPreviewCardProps {
  club: any;
  onClose: () => void;
  onNavigate: (club: any) => void;
}

const getClubImage = (logo?: string | null, coverImage?: string | null): string => {
  const img = coverImage || logo;
  if (!img || img === "null" || img.trim() === "") {
    return "/Images/CycleImage2.png";
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:") || img.startsWith("/")) {
    return img;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

const getClubAvatar = (logo?: string | null, coverImage?: string | null): string => {
  const img = logo || coverImage;
  if (!img || img === "null" || img.trim() === "") {
    return "/Images/CycleImage2.png";
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:") || img.startsWith("/")) {
    return img;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

const getMemberCount = (club: any) => {
  if (!club) return 0;

  const list =
    club.clubMembers ||
    club.ClubMembers ||
    club.club_members ||
    club.members ||
    club.Members ||
    club.user_clubs ||
    club.userClubs ||
    club.UserClubs ||
    club.participants ||
    club.Participants;

  if (Array.isArray(list) && list.length > 0) {
    return list.length;
  }

  const val =
    club._count?.user_clubs ??
    club._count?.members ??
    club._count?.users ??
    club.membersCount ??
    club.members_count ??
    club.memberCount ??
    club.member_count ??
    club.participantCount ??
    club.participant_count ??
    club.totalMembers ??
    club.total_members ??
    club.userCount ??
    club.user_count ??
    club.count ??
    club.total;

  const count = Number(val);
  if (!isNaN(count) && count > 0) return count;
  return 0;
};

const getClubTypeName = (typeId?: number | string) => {
  if (typeId === 2 || typeId === "2" || String(typeId).toLowerCase() === "running") return "Running";
  if (
    typeId === 3 ||
    typeId === "3" ||
    String(typeId).toLowerCase() === "triathlon" ||
    String(typeId).toLowerCase() === "cycling & running"
  )
    return "Triathlon";
  return "Cycling";
};

export const ClubMapPreviewCard: React.FC<ClubMapPreviewCardProps> = ({
  club,
  onClose,
  onNavigate,
}) => {
  const clubId = club?.id || club?.clubId;
  const { data: membersData } = useGetClubMembersListQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const sportName = getClubTypeName(club?.clubTypeId);
  const memberCount = React.useMemo(() => {
    if (membersData !== undefined && membersData !== null) {
      const list = extractMembersList(membersData);
      return list.length;
    }
    const fromClub = extractMembersList(
      club?.clubMembers || club?.members || club?.user_clubs || club?.participants
    );
    if (fromClub.length > 0) return fromClub.length;
    return getMemberCount(club);
  }, [membersData, club]);

  const isPublic = club?.clubPrivacyId === 1;

  if (!club) return null;

  return (
    <div
      onClick={() => onNavigate(club)}
      className="absolute bottom-6 left-4 sm:left-6 z-[1000] w-[320px] sm:w-[380px] h-[195px] rounded-3xl overflow-hidden shadow-2xl border border-border/80 dark:border-white/10 cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] group bg-surface"
      role="button"
      tabIndex={0}
    >
      {/* Full-bleed background image */}
      <img
        src={getClubImage(club.logo, club.coverImage)}
        alt={club.clubName || "Club"}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
        }}
      />

      {/* Close Button — top left */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-surface/85 dark:bg-black/60 hover:bg-surface dark:hover:bg-black/85 text-text-main dark:text-white flex items-center justify-center transition-all cursor-pointer border border-border dark:border-white/15 backdrop-blur-sm z-10 shadow-xs"
        aria-label="Close preview"
      >
        <X size={15} />
      </button>

      {/* Sport badge — top right */}
      <div className="absolute top-3 right-3 z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface/90 dark:bg-black/60 backdrop-blur-sm border border-border dark:border-white/15 text-text-main dark:text-white rounded-full text-[11px] font-bold tracking-wide shadow-xs">
          <span>{sportName}</span>
          {sportName === "Running" ? (
            <Activity size={12} className="text-amber-500 dark:text-amber-400" />
          ) : sportName === "Triathlon" ? (
            <Trophy size={12} className="text-purple-600 dark:text-purple-400" />
          ) : (
            <Bike size={12} className="text-[#EB712B]" />
          )}
        </div>
      </div>

      {/* Crown + Avatar — stacked below sport badge, right side */}
      <div className="absolute top-[44px] right-3.5 flex flex-col items-center gap-0.5 z-10">
        <Crown size={13} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400 drop-shadow" />
        <div className="w-9 h-9 rounded-2xl overflow-hidden border-2 border-border dark:border-white/25 bg-surface dark:bg-zinc-900 shadow-lg mt-0.5">
          <img
            src={getClubAvatar(club.logo, club.coverImage)}
            alt="Club avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
            }}
          />
        </div>
      </div>

      {/* Bottom Floating Frosted Glass Deck */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 p-3 rounded-2xl bg-white/85 dark:bg-[#121212]/85 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-lg z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Left: name + members */}
          <div className="min-w-0 flex-1">
            <h4 className="font-extrabold text-text-main dark:text-white text-sm leading-snug line-clamp-1 group-hover:text-[#EB712B] transition-colors">
              {club.clubName}
            </h4>
            <p className="text-text-muted dark:text-gray-300 text-[11px] font-medium mt-0.5 tracking-wide">
              {memberCount} member{memberCount === 1 ? "" : "s"}
            </p>
          </div>

          {/* Right: privacy pill */}
          <div className="shrink-0">
            <span
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider uppercase shadow transition-all ${
                isPublic
                  ? "bg-[#EB712B] text-white"
                  : "bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 backdrop-blur-sm"
              }`}
            >
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
