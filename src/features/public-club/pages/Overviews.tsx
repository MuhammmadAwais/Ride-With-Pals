/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { MapPin, Info, LayoutGrid, Users, Loader2 } from "lucide-react";
import { ClubService } from "@/features/club/services/clubService";

interface OverviewsProps {
  clubId?: number | string;
  club?: any;
}

const getMemberCount = (c: any): number => {
  if (!c) return 0;
  const val =
    c.participantCount ??
    c.participant_count ??
    c.memberCount ??
    c.member_count ??
    c.totalMembers ??
    c.total_members ??
    c.membersCount ??
    c.members_count ??
    c.ClubMembers?.length ??
    c.club_members?.length ??
    c.user_clubs?.length ??
    c.userClubs?.length ??
    c.UserClubs?.length ??
    c.members?.length ??
    c.Members?.length ??
    c.users?.length ??
    c.Users?.length ??
    c.participants?.length ??
    c.Participants?.length ??
    c._count?.user_clubs ??
    c._count?.members ??
    c._count?.users;

  const count = Number(val);
  if (!isNaN(count) && count > 0) return count;
  return 0;
};

const getClubTypeName = (typeId?: number | string, fallback?: string): string => {
  const id = Number(typeId);
  if (id === 1) return "Cycling";
  if (id === 2) return "Running";
  if (id === 3) return "Triathlon";
  return fallback || "Cycling";
};

const getClubPrivacyName = (privacyId?: number | string, fallback?: string): string => {
  const id = Number(privacyId);
  if (id === 1) return "Public";
  if (id === 2) return "Private";
  if (typeof fallback === "string" && fallback.trim() !== "") return fallback;
  return "Public";
};

export default function Overviews({ clubId, club: propClub }: OverviewsProps) {
  const [fetchedClubData, setFetchedClubData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasPropClub = Boolean(propClub && Object.keys(propClub).length > 0);
  const clubData = hasPropClub ? propClub : fetchedClubData;

  useEffect(() => {
    if (hasPropClub || !clubId) return;

    const loadClub = async () => {
      setIsLoading(true);
      try {
        const res = await ClubService.getClubById(Number(clubId));
        const data = res?.response || res?.data || res || {};
        setFetchedClubData(data);
      } catch (err) {
        console.error("Failed to load club in Overview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadClub();
  }, [clubId, hasPropClub]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  const club = clubData || {};

  // Extract description
  const descriptionText =
    club.aboutClub ||
    club.description ||
    club.about_club ||
    club.about ||
    "No description provided.";

  // Extract location
  const locationText =
    club.location ||
    club.address ||
    club.fullAddress ||
    "No location specified.";

  // Extract Club Info
  const sportType = getClubTypeName(club.clubTypeId, club.clubType || club.sportType);
  const privacy = getClubPrivacyName(club.clubPrivacyId, club.privacy || club.clubPrivacy);

  // Extract Contact
  const email =
    club.email ||
    club.contactEmail ||
    club.contact_email ||
    club.contactInfo ||
    club.creator?.email ||
    club.owner?.email ||
    club.user?.email ||
    "N/A";

  const phone =
    club.phone ||
    club.contactPhone ||
    club.contact_phone ||
    club.phoneNumber ||
    undefined;

  // Extract Member Count
  const memberCount = getMemberCount(club);

  return (
    <div className="max-w-3xl w-full space-y-6 text-text-main">
      {/* Description Section */}
      <div className="space-y-2">
        <h3 className="text-base sm:text-lg font-bold text-text-main">
          Description
        </h3>
        <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
          {descriptionText}
        </p>
      </div>

      {/* Location Card */}
      <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B] shrink-0">
            <MapPin size={18} />
          </div>
          <h4 className="text-base font-bold text-text-main">
            Location
          </h4>
        </div>
        <p className="text-sm font-medium text-text-muted leading-relaxed mt-4">
          {locationText}
        </p>
      </div>

      {/* Club Info & Contact (2-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Club Info Card */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-main shrink-0">
              <Info size={18} />
            </div>
            <h4 className="text-base font-bold text-text-main">
              Club Info
            </h4>
          </div>
          <div className="mt-5 space-y-1.5 text-xs sm:text-sm text-text-muted">
            <p>
              <span className="font-bold text-text-main">Type: </span>
              {sportType}
            </p>
            <p>
              <span className="font-bold text-text-main">Privacy: </span>
              {privacy}
            </p>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-text-main shrink-0">
              <LayoutGrid size={18} />
            </div>
            <h4 className="text-base font-bold text-text-main">
              Contact
            </h4>
          </div>
          <div className="mt-5 space-y-1.5 text-xs sm:text-sm text-text-muted">
            <p className="truncate" title={email}>
              <span className="font-bold text-text-main">Email: </span>
              {email}
            </p>
            {phone && (
              <p className="truncate" title={phone}>
                <span className="font-bold text-text-main">Phone: </span>
                {phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-base sm:text-lg font-bold text-text-main">
          Members
        </h3>
        <div className="bg-surface border border-border rounded-3xl p-5 sm:p-6 flex items-center gap-4 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-text-main shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h4 className="text-base font-bold text-text-main">
              {memberCount} Members
            </h4>
            <p className="text-xs text-text-muted mt-0.5">
              Active Club Members
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}