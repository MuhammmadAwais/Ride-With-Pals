/**
 * @fileoverview ClubPermissions — Owner-only page to delegate permissions to members.
 *
 * Architecture:
 * - clubId always from useActiveClub (Redux)
 * - permissions.isOwner gates the entire page
 * - Fetches members directly via useGetClubMembersListQuery from clubApiSlice
 * - Per-member permission toggles for all 5 permission types
 * - Full-access grant/revoke button per member
 * - Role assignment (Admin / User)
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
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { useGetClubMembersListQuery } from '@/features/club/api/clubApiSlice';
import {
  useApplyPermissionTogglesForSelectedMembersMutation,
  useGrantRevokeFullClubAccessForOneMemberMutation,
  useAssignRoleToMemberMutation,
  useRemoveFullAccessPermissionMutation,
} from '@/features/club/api/permissionApiSlice';

// ── Permission Mapping ─────────────────────────────────────────────────────────

const PERMISSION_DEFINITIONS = [
  { id: 1, key: 'publishRides', label: 'Publish Rides', description: 'Can create and publish group rides' },
  { id: 2, key: 'publishNews', label: 'Publish News', description: 'Can post club news and announcements' },
  { id: 3, key: 'publishDiscount', label: 'Manage Discounts', description: 'Can create and manage discount codes' },
  { id: 4, key: 'acceptOrBanUsers', label: 'Accept / Ban Users', description: 'Can approve or reject join requests' },
  { id: 5, key: 'manageMembershipFee', label: 'Manage Membership Fees', description: 'Can manage club membership plans and fees' },
];

const PERMISSION_KEY_TO_ID: Record<string, number> = {
  publishRides: 1,
  publishNews: 2,
  publishDiscount: 3,
  acceptOrBanUsers: 4,
  manageMembershipFee: 5,
};

// ── Member Card ────────────────────────────────────────────────────────────────

interface MemberCardProps {
  member: any;
  clubId: number;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, clubId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const initialPerms = useMemo(() => ({
    publishRides: Boolean(member.permissions?.publishRides),
    publishNews: Boolean(member.permissions?.publishNews),
    publishDiscount: Boolean(member.permissions?.publishDiscount),
    acceptOrBanUsers: Boolean(member.permissions?.acceptOrBanUsers),
    manageMembershipFee: Boolean(member.permissions?.manageMembershipFee),
  }), [member.permissions]);

  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>(initialPerms);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalPerms(initialPerms);
  }, [initialPerms]);

  const [applyPermissions] = useApplyPermissionTogglesForSelectedMembersMutation();
  const [grantRevokeFullAccess, { isLoading: isTogglingFull }] = useGrantRevokeFullClubAccessForOneMemberMutation();
  const [assignRole, { isLoading: isAssigningRole }] = useAssignRoleToMemberMutation();
  const [removeFullAccess, { isLoading: isRemovingFull }] = useRemoveFullAccessPermissionMutation();

  const handleAssignRole = async (roleId: number) => {
    if (!targetUserId) return;
    try {
      await assignRole({ clubId, userId: targetUserId, roleId }).unwrap();
      toast.success(`Role updated for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to assign role.');
    }
  };

  const handleRemoveFullAccess = async () => {
    if (!targetUserId) return;
    try {
      await removeFullAccess({ clubId, userId: targetUserId }).unwrap();
      toast.success(`Full access removed for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to remove full access.');
    }
  };

  const role = (member.role || 'user').toLowerCase();
  const isOwner = role === 'owner';
  const isAdmin = role === 'admin' || role === 'organizer';
  const hasFullAccess = Boolean(member.isFullAccess || member.permissions?.fullAccess);

  const fullName = (
    member.fullName ||
    ((member.firstName || '') + ' ' + (member.lastName || '')).trim() ||
    member.username ||
    'Unnamed Member'
  );

  const targetUserId = Number(member.userId || member.id);

  const handleToggle = (key: string) => {
    setLocalPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!targetUserId) {
      toast.error('Invalid member ID');
      return;
    }
    setIsSaving(true);
    try {
      const formattedPermissions = Object.entries(localPerms).map(([key, isAllowed]) => ({
        permissionId: PERMISSION_KEY_TO_ID[key] || 1,
        isAllowed: Boolean(isAllowed),
      }));

      await applyPermissions({
        clubId,
        userIds: [targetUserId],
        permissions: formattedPermissions,
      }).unwrap();
      toast.success(`Permissions updated for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFullAccess = async () => {
    if (!targetUserId) return;
    try {
      await grantRevokeFullAccess({
        clubId,
        userId: targetUserId,
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
          src={member.profileImage || member.profilePhoto || '/Images/ProfileImage.png'}
          alt={fullName}
          className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Images/ProfileImage.png';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-text-main truncate">{fullName}</p>
            {isOwner && <span title="Club Owner"><Crown size={14} className="text-[#EB712B] shrink-0" /></span>}
            {isAdmin && !isOwner && <span title="Club Admin"><ShieldCheck size={14} className="text-[#EB712B] shrink-0" /></span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-text-muted capitalize font-semibold">{member.role || 'Member'}</span>
            {member.email && <span className="text-[10px] text-text-muted/60 truncate">• {member.email}</span>}
          </div>
        </div>

        {/* Full Access Badge */}
        {hasFullAccess && !isOwner && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 rounded-full shrink-0">
            Full Access
          </span>
        )}

        {/* Owner Permanent Access Lock */}
        {isOwner && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full shrink-0 flex items-center gap-1">
            <Lock size={10} /> Owner
          </span>
        )}

        {/* Expand Toggle — for all non-owner members */}
        {!isOwner && (
          <button
            onClick={() => setIsExpanded((p) => !p)}
            className="p-2 rounded-xl hover:bg-hover text-text-muted transition-colors cursor-pointer"
            aria-label="Toggle permissions panel"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Permission Toggles (Expanded view) */}
      {isExpanded && !isOwner && (
        <div className="border-t border-border p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-surface/50">
          
          {/* Role Assignment */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b border-border">
            <div>
              <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <UserCheck size={14} className="text-[#EB712B]" /> Assign Role
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">Current: <span className="capitalize font-bold text-text-main">{member.role || 'member'}</span></p>
            </div>
            <div className="flex items-center gap-2">
              {isAssigningRole && <Loader2 size={14} className="animate-spin text-[#EB712B]" />}
              <select
                onChange={(e) => handleAssignRole(Number(e.target.value))}
                defaultValue=""
                disabled={isAssigningRole}
                className="bg-main-bg border border-border rounded-xl px-3 py-1.5 text-xs text-text-main outline-none focus:border-[#EB712B]/50 cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>Change role...</option>
                <option value="1">Admin</option>
                <option value="2">User</option>
              </select>
            </div>
          </div>

          {/* Full Access Toggle Card */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
            <div>
              <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Crown size={14} className="text-[#EB712B]" /> Full Admin Access
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">Overrides all permissions and grants complete access</p>
            </div>
            <div className="flex items-center gap-2">
              {hasFullAccess && (
                <button
                  onClick={handleRemoveFullAccess}
                  disabled={isRemovingFull}
                  className="text-[9px] font-bold uppercase text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isRemovingFull ? <Loader2 size={10} className="animate-spin" /> : 'Remove'}
                </button>
              )}
              <button
                onClick={handleFullAccess}
                disabled={isTogglingFull}
                className="cursor-pointer shrink-0 disabled:opacity-50"
                title={hasFullAccess ? 'Revoke full access' : 'Grant full access'}
              >
                {isTogglingFull ? (
                  <Loader2 size={24} className="animate-spin text-[#EB712B]" />
                ) : hasFullAccess ? (
                  <ToggleRight size={30} className="text-[#EB712B]" />
                ) : (
                  <ToggleLeft size={30} className="text-text-muted" />
                )}
              </button>
            </div>
          </div>

          {/* Individual Permission Items */}
          <div className="space-y-3">
            {PERMISSION_DEFINITIONS.map(({ key, label, description }) => {
              const isChecked = localPerms[key] || hasFullAccess;
              return (
                <div key={key} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-text-main">{label}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    disabled={hasFullAccess}
                    className="cursor-pointer shrink-0 disabled:opacity-40"
                    title={hasFullAccess ? 'Member already has full access' : undefined}
                  >
                    {isChecked ? (
                      <ToggleRight size={28} className="text-[#EB712B]" />
                    ) : (
                      <ToggleLeft size={28} className="text-text-muted" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Save Button */}
          {!hasFullAccess && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 flex items-center justify-center gap-2 disabled:opacity-50 mt-3"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? 'Saving Permissions...' : 'Save Permissions'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page Component ────────────────────────────────────────────────────────

const ClubPermissions: React.FC = () => {
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'admins' | 'full' | 'members'>('all');

  // Fetch members directly using RTK Query
  const effectiveClubId = clubId ? Number(clubId) : 0;
  const { data: membersData, isLoading: isLoadingMembers } = useGetClubMembersListQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const members = useMemo(() => {
    if (!membersData) return [];
    if (Array.isArray(membersData)) return membersData;
    return (membersData as any)?.rows || (membersData as any)?.data || (membersData as any)?.members || [];
  }, [membersData]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = members.length;
    const admins = members.filter((m: any) => {
      const r = (m.role || '').toLowerCase();
      return r === 'admin' || r === 'organizer' || r === 'owner';
    }).length;
    const fullAccess = members.filter((m: any) => m.isFullAccess || m.permissions?.fullAccess).length;
    const regular = members.filter((m: any) => {
      const r = (m.role || '').toLowerCase();
      return !['admin', 'organizer', 'owner'].includes(r);
    }).length;
    return { total, admins, fullAccess, regular };
  }, [members]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m: any) => {
      // Tab filter
      const r = (m.role || '').toLowerCase();
      const isFull = Boolean(m.isFullAccess || m.permissions?.fullAccess);

      if (activeTab === 'admins' && !['admin', 'organizer', 'owner'].includes(r)) return false;
      if (activeTab === 'full' && !isFull && r !== 'owner') return false;
      if (activeTab === 'members' && ['admin', 'organizer', 'owner'].includes(r)) return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const name = (m.fullName || (m.firstName || '') + ' ' + (m.lastName || '') + ' ' + (m.username || '')).toLowerCase();
      const email = (m.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [members, activeTab, searchQuery]);

  // Loading state — waiting for permissions or initial members load
  if (permissions.isLoading || (isLoadingMembers && members.length === 0)) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center p-8">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  // ✅ Access denied — non-owners cannot delegate permissions
  if (!permissions.isOwner) {
    return (
      <div className="min-h-screen bg-main-bg text-text-main p-8 md:p-16 flex items-center justify-center">
        <div className="bg-surface border border-red-500/20 rounded-3xl p-12 text-center max-w-lg space-y-5">
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
            <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center justify-center shrink-0">
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
            Delegate specific responsibilities to trusted club members. Expand any member to toggle their individual permissions or grant full admin access.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Members', value: stats.total, icon: <Users size={18} /> },
            { label: 'Admins', value: stats.admins, icon: <ShieldCheck size={18} /> },
            { label: 'Full Access', value: stats.fullAccess, icon: <Crown size={18} /> },
            { label: 'Regular Members', value: stats.regular, icon: <UserCheck size={18} /> },
          ].map((stat, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="text-[#EB712B] shrink-0">{stat.icon}</div>
              <div>
                <p className="text-xl font-black text-text-main">{stat.value}</p>
                <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls: Search & Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
            {[
              { key: 'all', label: 'All' },
              { key: 'admins', label: 'Admins' },
              { key: 'full', label: 'Full Access' },
              { key: 'members', label: 'Regular' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-[#EB712B] text-white shadow-sm'
                    : 'text-text-muted hover:text-text-main hover:bg-hover'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border pl-11 pr-4 py-2.5 rounded-xl text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
            />
          </div>
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
        ) : filteredMembers.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-3">
            <Users size={32} className="text-text-muted mx-auto opacity-40" />
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">
              {searchQuery ? 'No members match your search' : 'No members found in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member: any) => (
              <MemberCard
                key={member.userId || member.id}
                member={member}
                clubId={effectiveClubId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubPermissions;
