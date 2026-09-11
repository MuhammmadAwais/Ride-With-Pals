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
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { useGetClubMembersListQuery } from '@/features/club/api/clubApiSlice';
import {
  useGetClubPermissionsQuery,
  useSavePermissionsForRoleMutation,
  useApplyPermissionTogglesForSelectedMembersMutation,
  useGrantRevokeFullClubAccessForOneMemberMutation,
  useAssignRoleToMemberMutation,
  useRemoveFullAccessPermissionMutation,
} from '@/features/club/api/permissionApiSlice';
import { resolveImageUrl } from '@/features/public-club/services/clubGeocoding';

// ── Permission Mapping ─────────────────────────────────────────────────────────


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

  const permissionDefinitions = useMemo(() => [
    { id: 1, key: 'publishRides', label: t`Publish Rides`, description: t`Can create and publish group rides` },
    { id: 2, key: 'publishNews', label: t`Publish News`, description: t`Can post club news and announcements` },
    { id: 3, key: 'publishDiscount', label: t`Manage Discounts`, description: t`Can create and manage discount codes` },
    { id: 4, key: 'acceptOrBanUsers', label: t`Accept / Ban Users`, description: t`Can approve or reject join requests` },
    { id: 5, key: 'manageMembershipFee', label: t`Manage Membership Fees`, description: t`Can manage club membership plans and fees` },
  ], []);

  const [applyPermissions] = useApplyPermissionTogglesForSelectedMembersMutation();
  const [grantRevokeFullAccess, { isLoading: isTogglingFull }] = useGrantRevokeFullClubAccessForOneMemberMutation();
  const [assignRole, { isLoading: isAssigningRole }] = useAssignRoleToMemberMutation();
  const [removeFullAccess, { isLoading: isRemovingFull }] = useRemoveFullAccessPermissionMutation();

  const handleAssignRole = async (roleId: number) => {
    if (!targetUserId) return;
    try {
      await assignRole({ clubId, userId: targetUserId, roleId }).unwrap();
      toast.success(t`Role updated for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to assign role.`);
    }
  };

  const handleRemoveFullAccess = async () => {
    if (!targetUserId) return;
    try {
      await removeFullAccess({ clubId, userId: targetUserId }).unwrap();
      toast.success(t`Full access removed for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to remove full access.`);
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
    t`Unnamed Member`
  );

  const targetUserId = Number(member.userId || member.id);

  const handleToggle = (key: string) => {
    setLocalPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!targetUserId) {
      toast.error(t`Invalid member ID`);
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
      toast.success(t`Permissions updated for ${fullName}`);
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to update permissions.`);
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
          ? t`Full access revoked for ${fullName}`
          : t`Full access granted to ${fullName}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to update full access.`);
    }
  };

  const [imgError, setImgError] = useState(false);

  const rawPhoto = (
    member.profileImage ||
    member.profilePhoto ||
    member.profilePicUrl ||
    member.avatar ||
    member.user?.profileImage ||
    member.user?.profilePhoto ||
    member.user?.profilePicUrl
  );
  const photoUrl = resolveImageUrl(rawPhoto);

  const initials = (fullName || 'M')
    .split(' ')
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'M';

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-[#EB712B]/20">
      {/* Member Header */}
      <div className="flex items-center gap-4 p-4">
        {photoUrl && !imgError ? (
          <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden shrink-0 shadow-sm relative">
            <img
              src={photoUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xs font-black text-[#EB712B] select-none">
              {initials}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-text-main truncate">{fullName}</p>
            {isOwner && <span title={t`Club Owner`}><Crown size={14} className="text-[#EB712B] shrink-0" /></span>}
            {isAdmin && !isOwner && <span title={t`Club Admin`}><ShieldCheck size={14} className="text-[#EB712B] shrink-0" /></span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-text-muted capitalize font-semibold">{member.role || t`Member`}</span>
            {member.email && <span className="text-[10px] text-text-muted/60 truncate">• {member.email}</span>}
          </div>
        </div>

        {/* Full Access Badge */}
        {hasFullAccess && !isOwner && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 rounded-full shrink-0">
            <Trans>Full Access</Trans>
          </span>
        )}

        {/* Owner Permanent Access Lock */}
        {isOwner && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full shrink-0 flex items-center gap-1">
            <Lock size={10} /> <Trans>Owner</Trans>
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
                <UserCheck size={14} className="text-[#EB712B]" /> <Trans>Assign Role</Trans>
              </p>
              <p className="text-[10px] text-text-muted mt-0.5"><Trans>Current:</Trans> <span className="capitalize font-bold text-text-main">{member.role || 'member'}</span></p>
            </div>
            <div className="flex items-center gap-2">
              {isAssigningRole && <Loader2 size={14} className="animate-spin text-[#EB712B]" />}
              <select
                onChange={(e) => handleAssignRole(Number(e.target.value))}
                defaultValue=""
                disabled={isAssigningRole}
                className="bg-main-bg border border-border rounded-xl px-3 py-1.5 text-xs text-text-main outline-none focus:border-[#EB712B]/50 cursor-pointer disabled:opacity-50"
              >
                <option value="" disabled>{t`Change role...`}</option>
                <option value="1">{t`Admin`}</option>
                <option value="2">{t`User`}</option>
              </select>
            </div>
          </div>

          {/* Full Access Toggle Card */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
            <div>
              <p className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <Crown size={14} className="text-[#EB712B]" /> <Trans>Full Admin Access</Trans>
              </p>
              <p className="text-[10px] text-text-muted mt-0.5"><Trans>Overrides all permissions and grants complete access</Trans></p>
            </div>
            <div className="flex items-center gap-2">
              {hasFullAccess && (
                <button
                  onClick={handleRemoveFullAccess}
                  disabled={isRemovingFull}
                  className="text-[9px] font-bold uppercase text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg cursor-pointer disabled:opacity-50 transition-colors"
                >
                  {isRemovingFull ? <Loader2 size={10} className="animate-spin" /> : <Trans>Remove</Trans>}
                </button>
              )}
              <button
                onClick={handleFullAccess}
                disabled={isTogglingFull}
                className="cursor-pointer shrink-0 disabled:opacity-50"
                title={hasFullAccess ? t`Revoke full access` : t`Grant full access`}
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
            {permissionDefinitions.map(({ key, label, description }) => {
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
                    title={hasFullAccess ? t`Member already has full access` : undefined}
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
              {isSaving ? <Trans>Saving Permissions...</Trans> : <Trans>Save Permissions</Trans>}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Role Baseline Defaults Component ──────────────────────────────────────────

interface RoleDefaultsSectionProps {
  clubId: number;
}

const RoleDefaultsSection: React.FC<RoleDefaultsSectionProps> = ({ clubId }) => {
  const { data: permissionsData, isLoading, refetch } = useGetClubPermissionsQuery(
    { clubId },
    { skip: !clubId }
  );

  const [saveRolePermissions] = useSavePermissionsForRoleMutation();
  const [savingRoleId, setSavingRoleId] = useState<number | null>(null);

  const permissionDefinitions = useMemo(() => [
    { id: 1, key: 'publishRides', label: t`Publish Rides`, description: t`Can create and publish group rides for the club` },
    { id: 2, key: 'publishNews', label: t`Publish News`, description: t`Can write and publish news articles and announcements` },
    { id: 3, key: 'publishDiscount', label: t`Manage Discounts`, description: t`Can issue and configure partner discount vouchers` },
    { id: 4, key: 'acceptOrBanUsers', label: t`Accept / Ban Users`, description: t`Can moderate join requests and athlete access` },
    { id: 5, key: 'manageMembershipFee', label: t`Manage Membership Fees`, description: t`Can configure membership plans and dues` },
  ], []);

  // Admin Defaults (Role 1)
  const [adminPerms, setAdminPerms] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  // Regular Member Defaults (Role 2)
  const [memberPerms, setMemberPerms] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  });

  // Populate from API
  useEffect(() => {
    if (!permissionsData) return;
    const rolePerms = permissionsData.rolePermissions || [];
    
    // Admin (roleId 1)
    const adminRows = rolePerms.filter((p: any) => p.roleId === 1 || p.roleName?.toLowerCase().includes('admin'));
    if (adminRows.length > 0) {
      const nextAdmin: Record<number, boolean> = {};
      adminRows.forEach((p: any) => {
        nextAdmin[p.permissionId] = Boolean(p.isAllowed);
      });
      setAdminPerms(prev => ({ ...prev, ...nextAdmin }));
    }

    // Member (roleId 2)
    const memberRows = rolePerms.filter((p: any) => p.roleId === 2 || p.roleName?.toLowerCase().includes('user') || p.roleName?.toLowerCase().includes('member'));
    if (memberRows.length > 0) {
      const nextMember: Record<number, boolean> = {};
      memberRows.forEach((p: any) => {
        nextMember[p.permissionId] = Boolean(p.isAllowed);
      });
      setMemberPerms(prev => ({ ...prev, ...nextMember }));
    }
  }, [permissionsData]);

  const handleSaveRole = async (roleId: number, perms: Record<number, boolean>, roleTitle: string) => {
    setSavingRoleId(roleId);
    try {
      const payload = permissionDefinitions.map((def) => ({
        permissionId: def.id,
        isAllowed: Boolean(perms[def.id]),
      }));

      await saveRolePermissions({
        clubId,
        roleId,
        permissions: payload,
      }).unwrap();

      toast.success(t`${roleTitle} baseline permissions saved successfully!`);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to save role permissions.`);
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleToggleAll = (
    value: boolean, 
    setter: React.Dispatch<React.SetStateAction<Record<number, boolean>>>
  ) => {
    const updated: Record<number, boolean> = {};
    permissionDefinitions.forEach((def) => {
      updated[def.id] = value;
    });
    setter(updated);
  };

  if (isLoading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="p-4 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center gap-3 text-xs text-[#EB712B] font-medium">
        <ShieldCheck size={18} className="shrink-0" />
        <span>
          <Trans>Configure default permissions inherited whenever an athlete is assigned the Administrator role or joins as a standard club member.</Trans>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Administrator Role Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20 flex items-center justify-center text-[#EB712B]">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-text-main">
                    <Trans>Administrator Defaults</Trans>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#EB712B]">
                    <Trans>Role ID: 1 • Club Admins</Trans>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleAll(true, setAdminPerms)}
                  className="px-2.5 py-1 text-[10px] font-bold text-text-muted hover:text-text-main bg-main-bg border border-border rounded-lg transition-colors cursor-pointer"
                >
                  <Trans>All</Trans>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAll(false, setAdminPerms)}
                  className="px-2.5 py-1 text-[10px] font-bold text-text-muted hover:text-text-main bg-main-bg border border-border rounded-lg transition-colors cursor-pointer"
                >
                  <Trans>None</Trans>
                </button>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              <Trans>Default baseline capabilities granted to all administrators across this club.</Trans>
            </p>

            <div className="space-y-3">
              {permissionDefinitions.map((def) => {
                const isChecked = Boolean(adminPerms[def.id]);
                return (
                  <div
                    key={def.id}
                    onClick={() => setAdminPerms(prev => ({ ...prev, [def.id]: !prev[def.id] }))}
                    className="flex items-center justify-between p-3.5 bg-main-bg border border-border rounded-2xl cursor-pointer hover:border-[#EB712B]/30 transition-all select-none"
                  >
                    <div className="pr-3">
                      <p className="text-xs font-bold text-text-main">{def.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{def.description}</p>
                    </div>
                    <div className="shrink-0">
                      {isChecked ? (
                        <ToggleRight size={26} className="text-[#EB712B]" />
                      ) : (
                        <ToggleLeft size={26} className="text-text-muted" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleSaveRole(1, adminPerms, t`Administrator`)}
            disabled={savingRoleId === 1}
            className="w-full py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#EB712B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingRoleId === 1 ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span><Trans>Saving...</Trans></span>
              </>
            ) : (
              <span><Trans>Save Administrator Defaults</Trans></span>
            )}
          </button>
        </div>

        {/* Regular Member Role Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-text-main">
                    <Trans>Regular Member Defaults</Trans>
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    <Trans>Role ID: 2 • Standard Athletes</Trans>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleAll(true, setMemberPerms)}
                  className="px-2.5 py-1 text-[10px] font-bold text-text-muted hover:text-text-main bg-main-bg border border-border rounded-lg transition-colors cursor-pointer"
                >
                  <Trans>All</Trans>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAll(false, setMemberPerms)}
                  className="px-2.5 py-1 text-[10px] font-bold text-text-muted hover:text-text-main bg-main-bg border border-border rounded-lg transition-colors cursor-pointer"
                >
                  <Trans>None</Trans>
                </button>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              <Trans>Default baseline capabilities granted to standard athlete members when accepted into the club.</Trans>
            </p>

            <div className="space-y-3">
              {permissionDefinitions.map((def) => {
                const isChecked = Boolean(memberPerms[def.id]);
                return (
                  <div
                    key={def.id}
                    onClick={() => setMemberPerms(prev => ({ ...prev, [def.id]: !prev[def.id] }))}
                    className="flex items-center justify-between p-3.5 bg-main-bg border border-border rounded-2xl cursor-pointer hover:border-blue-500/30 transition-all select-none"
                  >
                    <div className="pr-3">
                      <p className="text-xs font-bold text-text-main">{def.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{def.description}</p>
                    </div>
                    <div className="shrink-0">
                      {isChecked ? (
                        <ToggleRight size={26} className="text-blue-500" />
                      ) : (
                        <ToggleLeft size={26} className="text-text-muted" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => handleSaveRole(2, memberPerms, t`Regular Member`)}
            disabled={savingRoleId === 2}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingRoleId === 2 ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span><Trans>Saving...</Trans></span>
              </>
            ) : (
              <span><Trans>Save Member Defaults</Trans></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page Component ────────────────────────────────────────────────────────

const ClubPermissions: React.FC = () => {
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);
  const [mainView, setMainView] = useState<'members' | 'roleDefaults'>('members');
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
            <h2 className="text-2xl font-bold text-text-main mb-2"><Trans>Owner Access Only</Trans></h2>
            <p className="text-sm text-text-muted max-w-sm mx-auto">
              <Trans>Only the club owner can manage and delegate member permissions. Contact your club owner for access.</Trans>
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
              <span className="text-[9px] font-black uppercase tracking-widest text-[#EB712B]"><Trans>Owner Dashboard</Trans></span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-text-main">
                <Trans>Club Permissions</Trans>
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-muted max-w-2xl">
            <Trans>Delegate specific responsibilities to trusted club members. Expand any member to toggle their individual permissions or grant full admin access.</Trans>
          </p>
        </div>

        {/* Main View Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-surface border border-border rounded-2xl self-start">
          <button
            onClick={() => setMainView('members')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainView === 'members'
                ? 'bg-[#EB712B] text-white shadow-md'
                : 'text-text-muted hover:text-text-main hover:bg-hover'
            }`}
          >
            <Users size={15} />
            <span><Trans>Member Delegation</Trans></span>
          </button>
          <button
            onClick={() => setMainView('roleDefaults')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mainView === 'roleDefaults'
                ? 'bg-[#EB712B] text-white shadow-md'
                : 'text-text-muted hover:text-text-main hover:bg-hover'
            }`}
          >
            <ShieldCheck size={15} />
            <span><Trans>Role Baseline Defaults</Trans></span>
          </button>
        </div>

        {mainView === 'roleDefaults' ? (
          <RoleDefaultsSection clubId={effectiveClubId} />
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t`Total Members`, value: stats.total, icon: <Users size={18} /> },
                { label: t`Admins`, value: stats.admins, icon: <ShieldCheck size={18} /> },
                { label: t`Full Access`, value: stats.fullAccess, icon: <Crown size={18} /> },
                { label: t`Regular Members`, value: stats.regular, icon: <UserCheck size={18} /> },
              ].map((stat, i) => (
                <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 text-[#EB712B] shadow-xs">{stat.icon}</div>
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
                  { key: 'all', label: t`All` },
                  { key: 'admins', label: t`Admins` },
                  { key: 'full', label: t`Full Access` },
                  { key: 'members', label: t`Regular` },
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
                  placeholder={t`Search members by name or email...`}
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
                  {searchQuery ? t`No members match your search` : t`No members found in this category`}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ClubPermissions;
