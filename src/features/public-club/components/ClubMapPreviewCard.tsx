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

  // Prioritize live approved members array if present
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
      className="absolute bottom-6 left-4 sm:left-6 z-[1000] w-[330px] sm:w-[390px] h-[190px] bg-[#161616] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/90 flex cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99] group backdrop-blur-md"
      role="button"
      tabIndex={0}
    >
      {/* Left section: Cover Image with Overlays */}
      <div className="relative w-[50%] h-full bg-black overflow-hidden shrink-0">
        <img
          src={getClubImage(club.logo, club.coverImage)}
          alt={club.clubName || "Club"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/Images/CycleImage2.png";
          }}
        />

        {/* Gradient Scrim for readable text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

        {/* Close Button on Top Left */}
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

        {/* Club Name & Member Count at bottom of image */}
        <div className="absolute bottom-3.5 left-3.5 right-2 text-left">
          <h4 className="font-extrabold text-white text-base leading-snug line-clamp-1 group-hover:text-[#EB712B] transition-colors">
            {club.clubName}
          </h4>
          <p className="text-gray-300 text-[11px] font-medium mt-0.5 tracking-wide">
            {memberCount} member{memberCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Right section: Info & Badges */}
      <div className="w-[50%] p-3.5 sm:p-4 flex flex-col justify-between items-end bg-[#161616] text-right">
        {/* Top Right Sport Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-full text-[11px] font-bold tracking-wide">
          <span>{sportName}</span>
          {sportName === "Running" ? (
            <Activity size={13} className="text-amber-500" />
          ) : sportName === "Triathlon" ? (
            <Trophy size={13} className="text-purple-400" />
          ) : (
            <Bike size={13} className="text-[#EB712B]" />
          )}
        </div>

        {/* Middle Right Crown & Avatar */}
        <div className="flex flex-col items-end my-auto">
          <Crown size={18} className="text-amber-400 fill-amber-400 mb-1 drop-shadow-sm" />
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 bg-zinc-800 shadow-md">
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

        {/* Bottom Right Privacy Badge */}
        <div className="flex items-center">
          <span
            className={`px-4 py-1.5 rounded-xl text-[11px] font-black tracking-wider uppercase shadow-md transition-all ${
              isPublic
                ? "bg-[#EB712B] text-white hover:bg-[#ff8036]"
                : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
            }`}
          >
            {isPublic ? "Public" : "Private"}
          </span>
        </div>
      </div>
    </div>
  );
};
