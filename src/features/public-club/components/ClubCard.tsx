import React, { useState } from "react";
import { Globe, Lock, MapPin, Users, ShieldCheck, Bike, Activity, Trophy } from "lucide-react";
import { useGetClubMembersListQuery } from "@/features/club/api/clubApiSlice";
import { extractMembersList } from "../pages/ClubDetails";
import { cn } from "@/lib/utils";

interface ClubCardProps {
  club: any;
  user: any;
  myClubs: any[];
  onClick: (club: any) => void;
  viewMode?: "grid" | "list";
}

export const getClubTypeName = (typeId?: number | string) => {
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

export const getClubImage = (coverImage?: string | null, logo?: string | null): string => {
  const img = coverImage || logo;
  if (!img || img === "null" || img.trim() === "") {
    return "/Images/CycleImage2.png";
  }
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:") || img.startsWith("/")) {
    return img;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

export const getClubAvatar = (logo?: string | null, coverImage?: string | null): string | null => {
  const img = logo || coverImage;
  if (!img || img === "null" || img.trim() === "") return null;
  if (img.startsWith("http://") || img.startsWith("https://") || img.startsWith("data:") || img.startsWith("/")) {
    return img;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

export const getMemberCount = (club: any) => {
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

export const ClubMemberCountText: React.FC<{ club: any; className?: string; as?: "span" | "p" }> = ({ 
  club, 
  className,
  as = "span" 
}) => {
  const clubId = club?.id || club?.clubId;
  const { data: membersData } = useGetClubMembersListQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const count = React.useMemo(() => {
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

  const text = `${count} Pals joined`;

  if (as === "p") {
    return <p className={className}>{text}</p>;
  }
  return <span className={className}>{text}</span>;
};

export const isClubOwned = (club: any, user: any, myClubs: any[]) => {
  if (!club) return false;
  if (club.isOwner === true || club.owned === true || club.isManaged === true) return true;
  if (user?.id && (club.ownerId === user.id || club.userId === user.id || club.owner_id === user.id)) return true;
  if (myClubs && myClubs.some(c => (c.id === club.id || (c as any).clubId === club.id || c.id === (club as any).clubId))) return true;
  return false;
};

export const ClubCard: React.FC<ClubCardProps> = React.memo(({
  club,
  user,
  myClubs,
  onClick,
  viewMode = "grid",
}) => {
  const [imgError, setImgError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const bgImage = imgError ? "/Images/CycleImage2.png" : getClubImage(club.coverImage, club.logo);
  const avatarImage = avatarError ? null : getClubAvatar(club.logo, club.coverImage);
  const hasDistinctAvatar = avatarImage && avatarImage !== bgImage;

  const sportName = getClubTypeName(club.clubTypeId);
  const isOwned = isClubOwned(club, user, myClubs);
  const isPublic = club.clubPrivacyId === 1;

  const renderSportBadge = () => {
    if (sportName === "Running") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-400 border border-white/15 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
          <Activity size={11} className="shrink-0" />
          <span>Running</span>
        </span>
      );
    }
    if (sportName === "Triathlon") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-purple-300 border border-white/15 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
          <Trophy size={11} className="shrink-0" />
          <span>Triathlon</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md text-[#ff8c42] border border-white/15 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm">
        <Bike size={11} className="shrink-0" />
        <span>Cycling</span>
      </span>
    );
  };

  // ─── LIST VIEW MODE ───
  if (viewMode === "list") {
    return (
      <div
        onClick={() => onClick(club)}
        className="bg-surface border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-border hover:shadow-md transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-4 w-full min-w-0">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-main-bg border border-border">
            <img
              src={bgImage}
              alt={club.clubName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          </div>

          <div className="space-y-1.5 w-full min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {renderSportBadge()}
              {isOwned && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm"
                  title="You manage this club"
                >
                  <ShieldCheck size={10} className="shrink-0 text-amber-400" />
                  <span>Owned</span>
                </span>
              )}
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 backdrop-blur-md shadow-sm",
                isPublic
                  ? "bg-black/60 text-emerald-400 border-emerald-500/30"
                  : "bg-black/60 text-rose-400 border-rose-500/30"
              )}>
                {isPublic ? <Globe size={10} className="shrink-0" /> : <Lock size={10} className="shrink-0" />}
                <span>{isPublic ? 'Public' : 'Private'}</span>
              </span>
            </div>

            <h3 className="text-base font-bold tracking-tight text-text-main group-hover:text-[#EB712B] transition-colors uppercase truncate">
              {club.clubName}
            </h3>

            <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-normal min-w-0 w-full">
              <MapPin size={12} className="text-[#EB712B] shrink-0" />
              <span className="truncate">{club.location || "Location not specified"}</span>
            </div>

            <ClubMemberCountText club={club} as="p" className="text-[11px] text-text-muted font-medium" />
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#EB712B]/10 hover:bg-[#EB712B] text-[#EB712B] hover:text-white font-bold text-xs tracking-wider uppercase transition-all shrink-0 self-end sm:self-center border border-[#EB712B]/20">
          <span>{club.isManaged ? "Manage" : "View"}</span>
          <span>&rarr;</span>
        </span>
      </div>
    );
  }

  // ─── GRID VIEW MODE (Full-bleed card with bottom gradient blur backdrop) ───
  return (
    <div
      onClick={() => onClick(club)}
      className="relative w-full h-[320px] sm:h-[340px] rounded-2xl overflow-hidden border border-border/80 hover:border-[#EB712B]/60 shadow-xs hover:shadow-2xl transition-all duration-300 group cursor-pointer flex flex-col justify-between select-none bg-main-bg"
    >
      {/* 1. Full-Card Background Image */}
      <img
        src={bgImage}
        alt={club.clubName}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0"
        onError={() => setImgError(true)}
      />

      {/* 2. Top Scrim for badge contrast */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/70 via-black/30 to-transparent pointer-events-none z-[1]" />

      {/* 3. Bottom Multi-stop Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 via-45% to-transparent pointer-events-none z-[1]" />

      {/* 4. Top Badges Bar */}
      <div className="relative z-10 p-3 sm:p-3.5 flex justify-between items-center gap-1.5">
        {renderSportBadge()}

        <div className="flex items-center gap-1.5 shrink-0">
          {isOwned && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm"
              title="You manage this club"
            >
              <ShieldCheck size={11} className="shrink-0 text-amber-400" />
              <span>Owned</span>
            </span>
          )}
          <span className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border shrink-0 shadow-sm",
            isPublic
              ? "bg-black/60 text-emerald-400 border-emerald-500/30"
              : "bg-black/60 text-rose-400 border-rose-500/30"
          )}>
            {isPublic ? <Globe size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />}
            <span>{isPublic ? 'Public' : 'Private'}</span>
          </span>
        </div>
      </div>

      {/* 5. Bottom Details with Gradient Blur Backdrop */}
      <div className="relative z-10 p-4 sm:p-4.5 space-y-2.5 backdrop-blur-[2px] rounded-b-2xl">
        <div className="flex items-center gap-2.5 min-w-0">
          {hasDistinctAvatar && (
            <img
              src={avatarImage!}
              alt=""
              className="w-9 h-9 rounded-xl object-cover border border-white/25 shadow-md shrink-0 bg-black/40"
              onError={() => setAvatarError(true)}
            />
          )}

          <div className="space-y-0.5 min-w-0 flex-1">
            <h3 className="text-base font-black tracking-tight text-white uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1 drop-shadow-sm font-poppins">
              {club.clubName}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-white/80 font-normal min-w-0">
              <MapPin size={12} className="text-[#EB712B] shrink-0" />
              <span className="truncate">{club.location || "Location not specified"}</span>
            </div>
          </div>
        </div>

        {/* Thin Modern Divider */}
        <div className="h-px w-full bg-white/15" />

        {/* Bottom Bar: Pals Count & CTA */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <Users size={12} className="text-white/70 shrink-0" />
            <ClubMemberCountText club={club} />
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#EB712B] group-hover:bg-[#ff8036] text-white text-xs font-bold transition-all shadow-sm group-hover:scale-105">
            <span>{club.isManaged ? "Manage" : "View"}</span>
            <span>&rarr;</span>
          </span>
        </div>
      </div>
    </div>
  );
});

ClubCard.displayName = "ClubCard";
export default ClubCard;
