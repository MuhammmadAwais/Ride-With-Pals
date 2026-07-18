/**
 * @fileoverview ClubPermissions — Owner-only page to delegate permissions to members.
 *
 * Flutter equivalent: Permission management screen locked behind `me.role == 'Owner'`
 *
 * Architecture:
 * - clubId always from useActiveClub (Redux)
 * - permissions.isOwner gates the entire page
 * - Uses permissionApiSlice + clubApiSlice member list
 * - Per-member permission toggles for all 5 permission types
 * - Full-access grant/revoke button per member
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Search,
  Crown,
  ChevronDown,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { fetchClubMembers } from '@/features/club/slices/clubSlice';
import {
  useApplyPermissionTogglesForSelectedMembersMutation,
  useGrantRevokeFullClubAccessForOneMemberMutation,
} from '@/features/club/api/permissionApiSlice';

// ── Permission toggle labels ───────────────────────────────────────────────────

const PERMISSION_LABELS: { key: string; label: string; description: string }[] = [
  { key: 'publishRides', label: 'Publish Rides', description: 'Can create and publish group rides' },
  { key: 'publishNews', label: 'Publish News', description: 'Can post club news and announcements' },
  { key: 'publishDiscount', label: 'Manage Discounts', description: 'Can create and manage discount codes' },
  { key: 'acceptOrBanUsers', label: 'Accept / Ban Users', description: 'Can approve or reject join requests' },
  { key: 'manageMembershipFee', label: 'Manage Membership Fees', description: 'Can manage club membership plans and fees' },
];

// ── Member Card ────────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: any;
  clubId: number;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, clubId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>(
    member.permissions || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const [applyPermissions] = useApplyPermissionTogglesForSelectedMembersMutation();
  const [grantRevokeFullAccess] = useGrantRevokeFullClubAccessForOneMemberMutation();

  const role = (member.role || 'user').toLowerCase();
  const isOwner = role === 'owner';
  const hasFullAccess = member.permissions?.fullAccess === true;

  const fullName =
    (member.firstName || '') + ' ' + (member.lastName || '') ||
    member.username ||
    member.fullName ||
    'Unnamed Member';

  const handleToggle = (key: string) => {
    setLocalPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await applyPermissions({
        clubId,
        userIds: [member.userId || member.id],
        permissions: Object.entries(localPerms).map(([key, isAllowed]) => ({ permissionId: Number(key), isAllowed })),
      }).unwrap();
      toast.success(`Permissions updated for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullAccess = async () => {
    try {
      await grantRevokeFullAccess({
        clubId,
        userId: member.userId || member.id,
        isFullAccess: !hasFullAccess,
      }).unwrap();
      toast.success(
        hasFullAccess
          ? `Full access revoked for ${fullName}`
          : `Full access granted to ${fullName}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update full access.');
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#EB712B]/20">
      {/* Member Header */}
      <div className="flex items-center gap-4 p-4">
        <img
          src={member.profileImage || '/Images/ProfileImage.png'}
          alt={fullName}
          className="w-10 h-10 rounded-xl object-cover border border-border"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Images/ProfileImage.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-text-main truncate">{fullName}</p>
            {isOwner && <Crown size={12} className="text-[#EB712B] shrink-0" />}
          </div>
          <p className="text-[10px] text-text-muted capitalize">{role}</p>
        </div>

        {/* Full Access badge */}
        {hasFullAccess && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 rounded-full shrink-0">
            Full Access
          </span>
        )}

        {/* Expand toggle — only for non-owners */}
        {!isOwner && (
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className="p-2 rounded-xl hover:bg-hover text-text-muted transition-colors cursor-pointer"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {isOwner && (
          <div className="p-2">
            <Lock size={14} className="text-text-muted" />
          </div>
        )}
      </div>

      {/* Permission Toggles (expanded) */}
      {isExpanded && !isOwner && (
        <div className="border-t border-border p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Full Access toggle */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
            <div>
              <p className="text-xs font-bold text-text-main">Full Admin Access</p>
              <p className="text-[10px] text-text-muted mt-0.5">Grants all permissions at once</p>
            </div>
            <button
              onClick={handleFullAccess}
              className="cursor-pointer shrink-0"
              title={hasFullAccess ? 'Revoke full access' : 'Grant full access'}
            >
              {hasFullAccess ? (
                <ToggleRight size={28} className="text-[#EB712B]" />
              ) : (
                <ToggleLeft size={28} className="text-text-muted" />
              )}
            </button>
          </div>

          {/* Individual permissions */}
          {PERMISSION_LABELS.map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-text-main">{label}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{description}</p>
              </div>
              <button
                onClick={() => handleToggle(key)}
                className="cursor-pointer shrink-0"
                disabled={hasFullAccess}
                title={hasFullAccess ? 'Disabled — member has full access' : undefined}
              >
                {localPerms[key] || hasFullAccess ? (
                  <ToggleRight size={28} className="text-[#EB712B]" />
                ) : (
                  <ToggleLeft size={28} className="text-text-muted" />
                )}
              </button>
            </div>
          ))}

          {/* Save button */}
          {!hasFullAccess && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Permissions'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const ClubPermissions: React.FC = () => {
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const { currentClubMembers, isLoadingMembers } = useAppSelector((state) => ({
    currentClubMembers: state.club.currentClubMembers,
    isLoadingMembers: state.club.isLoading,
  }));

  useEffect(() => {
    if (clubId && permissions.isOwner) {
      dispatch(fetchClubMembers({ clubId: Number(clubId) }));
    }
  }, [dispatch, clubId, permissions.isOwner]);

  const members = useMemo(() => {
    return Array.isArray(currentClubMembers) ? currentClubMembers : [];
  }, [currentClubMembers]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m: any) => {
      const name = ((m.firstName || '') + ' ' + (m.lastName || '') + ' ' + (m.username || '')).toLowerCase();
      return name.includes(q);
    });
  }, [members, searchQuery]);

  // Loading state — waiting for permissions to resolve
  if (permissions.isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  // ✅ Access denied — non-owners cannot delegate permissions
  if (!permissions.isOwner) {
    return (
      <div className="min-h-screen bg-main-bg text-text-main p-8 md:p-16 flex items-center justify-center">
        <div className="bg-surface border border-red-500/20 rounded-3xl p-16 text-center max-w-lg space-y-5">
          <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={36} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-main mb-2">Owner Access Only</h2>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              Only the club owner can manage and delegate member permissions. Contact your club owner for access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg text-text-main p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-3 border-b border-border pb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={22} className="text-[#EB712B]" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#EB712B]">Owner Dashboard</span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-text-main">
                Club Permissions
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-muted max-w-2xl">
            Delegate specific responsibilities to trusted club members. Expand any member to toggle their individual permissions. Changes apply immediately.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: members.length, icon: <Users size={16} /> },
            { label: 'Admins', value: members.filter((m: any) => ['admin','organizer'].includes((m.role||'').toLowerCase())).length, icon: <ShieldCheck size={16} /> },
            { label: 'Full Access', value: members.filter((m: any) => m.permissions?.fullAccess).length, icon: <Crown size={16} /> },
            { label: 'Regular Members', value: members.filter((m: any) => !['owner','admin','organizer'].includes((m.role||'').toLowerCase())).length, icon: <Users size={16} /> },
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="text-[#EB712B] shrink-0">{stat.icon}</div>
              <div>
                <p className="text-lg font-black text-text-main">{stat.value}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border pl-11 pr-4 py-3 rounded-xl text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
          />
        </div>

        {/* Member List */}
        {isLoadingMembers ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-4 animate-pulse flex items-center gap-4">
                <div className="w-10 h-10 bg-[#222] rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/3 h-3 bg-[#222] rounded" />
                  <div className="w-1/5 h-2 bg-[#222] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center">
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">
              {searchQuery ? 'No members match your search' : 'No members found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((member: any) => (
              <MemberCard
                key={member.userId || member.id}
                member={member}
                clubId={Number(clubId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubPermissions;
