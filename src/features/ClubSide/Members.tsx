import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  X, 
  Ban, 
  MessageSquare, 
  Eye, 
  Crown, 
  ShieldCheck, 
  Shield, 
  Bike, 
  Copy, 
  SearchX
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { toast } from 'sonner';
import { 
  useGetClubMembersListQuery, 
  useGetClubInfoByIdQuery, 
  useRemoveClubMemberMutation 
} from '@/features/club/api/clubApiSlice';
import { useGetOtherUserInfoQuery, authApiSlice } from '@/features/auth/api/authApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { resolveImageUrl } from '@/features/public-club/services/clubGeocoding';
import UserProfileModal from './components/UserProfileModal';
import AvatarLightboxModal from '@/components/ui/AvatarLightboxModal';

export interface Member {
  id: string;
  userId: number;
  profilePhoto: string;
  name: string;
  initials: string;
  email: string;
  rawRole: string;
  role: 'Owner' | 'Admin' | 'Organizer' | 'Athlete' | 'Member';
  gender: string;
  rawPhone: string | null;
  phoneNo: string;
  joinDate: string;
  clubJoinDate: string | null;
  status: 'Active' | 'Pending' | 'Suspended';
  isOwner: boolean;
  isAdmin: boolean;
}

// ── Dynamic Cell: Avatar with Clean Error Fallback (No Bleeding Text) ──
const MemberAvatar: React.FC<{
  userId: number;
  src?: string | null;
  name: string;
  initials: string;
  onAvatarClick?: (url?: string | null) => void;
}> = ({ userId, src, name, initials, onAvatarClick }) => {
  const { data: user } = useGetOtherUserInfoQuery({ userId }, { skip: !userId });
  const [imgFailed, setImgFailed] = useState(false);

  const photoUrl = resolveImageUrl(user?.profileImage || src);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAvatarClick) onAvatarClick(photoUrl);
  };

  if (photoUrl && !imgFailed) {
    return (
      <div 
        onClick={handleClick}
        className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden shrink-0 shadow-sm cursor-pointer hover:border-[#EB712B] hover:scale-105 transition-all group/avatar relative"
        title={t`Click to preview avatar`}
      >
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="w-10 h-10 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-sm cursor-pointer hover:border-[#EB712B] hover:scale-105 transition-all"
      title={t`Click to preview avatar`}
    >
      <span className="text-xs font-black text-[#EB712B] select-none">
        {initials}
      </span>
    </div>
  );
};

// ── Dynamic Cell: Role Badge ──
const MemberRoleCell: React.FC<{
  userId: number;
  rawRole: string;
  isOwner: boolean;
  role?: Member['role'];
}> = ({ userId, rawRole, isOwner, role: propRole }) => {
  const { data: user } = useGetOtherUserInfoQuery({ userId }, { skip: !userId });

  let role: Member['role'] = propRole || 'Member';
  if (isOwner) {
    role = 'Owner';
  } else if (rawRole.toLowerCase() === 'admin') {
    role = 'Admin';
  } else if (rawRole.toLowerCase() === 'organizer') {
    role = 'Organizer';
  } else if (rawRole.toLowerCase() === 'athlete' || user?.isAthleteProfile === 1) {
    role = 'Athlete';
  } else if (propRole) {
    role = propRole;
  } else if (rawRole && rawRole.trim() !== '') {
    const formatted = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
    if (formatted === 'Owner') role = 'Owner';
    else if (formatted === 'Admin') role = 'Admin';
    else if (formatted === 'Athlete') role = 'Athlete';
    else role = 'Member';
  }

  if (role === 'Owner') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-[#EB712B]/15 text-[#EB712B] border border-[#EB712B]/30 shadow-sm">
        <Crown size={11} className="shrink-0 fill-[#EB712B]/30" />
        <Trans>Owner</Trans>
      </span>
    );
  }
  if (role === 'Admin') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-sm">
        <Shield size={11} className="shrink-0" />
        <Trans>Admin</Trans>
      </span>
    );
  }
  if (role === 'Organizer') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
        <ShieldCheck size={11} className="shrink-0" />
        <Trans>Organizer</Trans>
      </span>
    );
  }
  if (role === 'Athlete') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-sm">
        <Bike size={11} className="shrink-0" />
        <Trans>Athlete</Trans>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface border border-border text-text-muted">
      <Trans>Member</Trans>
    </span>
  );
};

// ── Dynamic Cell: Gender ──
const MemberGenderCell: React.FC<{ userId: number; fallbackGender?: string }> = ({ userId, fallbackGender }) => {
  const { data: user } = useGetOtherUserInfoQuery({ userId }, { skip: !userId });
  const genderId = user?.genderId;
  const gender = genderId === 1 ? 'Male' : genderId === 2 ? 'Female' : ((user as any)?.gender || fallbackGender || null);

  if (!gender || gender === 'Not specified' || gender === 'null' || gender === '—') {
    return <span className="text-xs text-text-muted/50">—</span>;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
      gender === 'Male'
        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        : 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
    }`}>
      {gender === 'Male' ? <Trans>Male</Trans> : gender === 'Female' ? <Trans>Female</Trans> : gender}
    </span>
  );
};

// ── Dynamic Cell: Phone Number ──
const MemberPhoneCell: React.FC<{
  userId: number;
  fallbackPhone?: string | null;
}> = ({ userId, fallbackPhone }) => {
  const { data: user } = useGetOtherUserInfoQuery({ userId }, { skip: !userId });
  const phone = user?.phone || fallbackPhone;

  if (!phone || phone.trim() === '' || phone === 'null' || phone === '—') {
    return <span className="text-xs text-text-muted/50">—</span>;
  }

  return <span className="text-xs font-medium text-text-main">{phone}</span>;
};

// ── Dynamic Cell: Join Date ──
const MemberJoinDateCell: React.FC<{
  userId: number;
  formattedDate?: string;
  clubJoinDate?: string | null;
}> = ({ userId, formattedDate, clubJoinDate }) => {
  const { data: user } = useGetOtherUserInfoQuery({ userId }, { skip: !userId });
  if (formattedDate && formattedDate !== '—') {
    return <span className="text-xs text-text-muted font-medium">{formattedDate}</span>;
  }
  const rawDate = clubJoinDate || user?.createdAt;

  if (!rawDate) {
    return <span className="text-xs text-text-muted/50">—</span>;
  }

  try {
    const formatted = new Date(rawDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return <span className="text-xs text-text-muted font-medium">{formatted}</span>;
  } catch {
    return <span className="text-xs text-text-muted/50">—</span>;
  }
};

// ── Dynamic Cell: Status ──
const MemberStatusCell: React.FC<{ status: 'Active' | 'Pending' | 'Suspended' }> = ({ status }) => {
  if (status === 'Active') {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-xs font-semibold text-emerald-400"><Trans>Active</Trans></span>
      </div>
    );
  }
  if (status === 'Pending') {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
        <span className="text-xs font-semibold text-amber-400"><Trans>Pending</Trans></span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-red-500"></span>
      <span className="text-xs font-semibold text-red-400">{status === 'Suspended' ? <Trans>Suspended</Trans> : status}</span>
    </div>
  );
};

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-hover" />
          <div className="space-y-2">
            <div className="w-28 h-4 bg-hover rounded" />
            <div className="w-36 h-3 bg-hover rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-hover rounded-full" />
        <div className="w-14 h-4 bg-hover rounded" />
        <div className="w-24 h-4 bg-hover rounded" />
        <div className="w-20 h-4 bg-hover rounded" />
        <div className="w-16 h-4 bg-hover rounded" />
      </div>
    ))}
  </div>
);

type RoleFilter = 'all' | 'admins' | 'athletes' | 'members';

interface MembersProps {
  clubId?: string | number;
}

const Members: React.FC<MembersProps> = ({ clubId: propClubId }) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [avatarPreviewData, setAvatarPreviewData] = useState<{
    url?: string | null;
    name: string;
    subtitle?: string;
    initials: string;
  } | null>(null);

  const { clubId: activeClubIdRedux, setActiveClub } = useActiveClub();
  let activeClubIdStr = propClubId?.toString() || activeClubIdRedux?.toString() || null;
  
  const joinedRows = useAppSelector((state) => state.club.myClubs) || [];
  
  if (!activeClubIdStr && joinedRows.length > 0) {
    activeClubIdStr = joinedRows[0].id.toString();
    setActiveClub(joinedRows[0]);
  }

  const effectiveClubId = activeClubIdStr ? Number(activeClubIdStr) : 0;
  const isEmbedded = Boolean(propClubId);

  // 1. Fetch live member roster
  const { data: membersData, isLoading: isMembersLoading } = useGetClubMembersListQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  // 2. Fetch club profile & membership details
  const { data: clubData, isLoading: isClubLoading } = useGetClubInfoByIdQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  // 3. Current user permissions in this club
  const { isOwner: isCurrentOwner, isAdmin: isCurrentAdmin, canAcceptUsers } = useClubPermissions(effectiveClubId);
  const canManageMembers = isCurrentOwner || isCurrentAdmin || canAcceptUsers;

  const [removeMember, { isLoading: isRemoving }] = useRemoveClubMemberMutation();

  // Close context menus on outside click
  useEffect(() => {
    const handleGlobalClick = () => {
      if (activeMenuId) setActiveMenuId(null);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [activeMenuId]);

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm(t`Are you sure you want to remove this member from the club?`)) return;
    try {
      await removeMember({ clubId: effectiveClubId, userId: Number(userId) }).unwrap();
      toast.success(t`Member removed successfully!`);
      setActiveMenuId(null);
    } catch (err) {
      toast.error((err as { data?: { message?: string }; message?: string })?.data?.message || (err as Error)?.message || t`Failed to remove member.`);
    }
  };

  // ── Club Object & Owner ID ──
  const club = useMemo(() => {
    if (!clubData) return null;
    return (clubData as any)?.response || clubData;
  }, [clubData]);

  const clubOwnerId = Number(club?.userId || club?.ownerId || club?.owner_id || 0);

  // ── Club Members Map (userId -> { createdAt, status }) ──
  const clubMemberMap = useMemo(() => {
    const map = new Map<number, any>();
    const cms = club?.clubMembers || (club as any)?.members || (club as any)?.user_clubs || [];
    if (Array.isArray(cms)) {
      cms.forEach((cm: any) => {
        const uId = Number(cm.userId || cm.user_id || cm.id);
        if (uId) map.set(uId, cm);
      });
    }
    return map;
  }, [club]);

  // ── Pre-fetch / Cache Detailed User Info for Accurate Table Sorting & Display ──
  const dispatch = useAppDispatch();
  const allApiQueries = useAppSelector((state: any) => state.api?.queries || {});

  const userDetailsMap = useMemo(() => {
    const map = new Map<number, any>();
    Object.entries(allApiQueries).forEach(([k, q]: [string, any]) => {
      if (k.startsWith('getOtherUserInfo(') && q?.status === 'fulfilled' && q?.data) {
        const uId = Number(q.data.id || q.data.userId);
        if (uId) {
          map.set(uId, q.data);
        }
      }
    });
    return map;
  }, [allApiQueries]);

  useEffect(() => {
    if (!membersData) return;
    const rawList: any[] = Array.isArray(membersData) 
      ? membersData 
      : (membersData as any)?.rows || (membersData as any)?.data || (membersData as any)?.members || (membersData as any)?.response || [];

    rawList.forEach((m: any) => {
      const uId = Number(m.userId || m.id || m.user?.id || 0);
      if (uId && !userDetailsMap.has(uId)) {
        dispatch(authApiSlice.endpoints.getOtherUserInfo.initiate({ userId: uId }));
      }
    });
  }, [membersData, dispatch, userDetailsMap]);

  // ── Member Normalization Pipeline ──
  const formattedMembers = useMemo<Member[]>(() => {
    if (!membersData) return [];
    
    // Normalize raw member items array
    const rawList: any[] = Array.isArray(membersData) 
      ? membersData 
      : (membersData as any)?.rows || (membersData as any)?.data || (membersData as any)?.members || (membersData as any)?.response || [];

    return rawList.map((m: any) => {
      const userId = Number(m.userId || m.id || m.user?.id || 0);
      const id = String(userId || m.id || '');
      const cachedUser = userDetailsMap.get(userId);

      // Name & Initials
      const name = cachedUser?.fullName || m.fullName || [m.firstName, m.lastName].filter(Boolean).join(' ') || m.username || m.name || t`Member`;
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'M';

      // Profile Photo
      const rawImage = cachedUser?.profileImage || m.profileImage || m.avatar || m.profilePhoto || m.user?.profileImage;
      const profilePhoto = resolveImageUrl(rawImage);

      // Email
      const email = cachedUser?.email || m.email || m.user?.email || '—';

      // Contact / Phone
      const rawPhone = cachedUser?.phone || m.phoneNumber || m.phone || m.phoneNo || m.mobile || m.user?.phone || m.user?.phoneNumber || null;
      const phoneNo = rawPhone && rawPhone.trim() !== '' && rawPhone !== 'null' ? rawPhone : '—';

      // Gender
      const genderId = cachedUser?.genderId;
      const rawGender = genderId === 1 ? 'Male' : genderId === 2 ? 'Female' : (cachedUser?.gender || (m as any)?.gender || null);
      const gender = rawGender && rawGender !== 'Not specified' && rawGender !== 'null' ? rawGender : '—';

      // Role Detection (Dynamic, aligned directly with backend response)
      const rawRole = String(m.role || cachedUser?.role || 'Member');
      const isOwner = Boolean(userId && clubOwnerId && userId === clubOwnerId) || rawRole.toLowerCase() === 'owner';
      const isAdmin = isOwner || rawRole.toLowerCase() === 'admin';
      const isAthlete = rawRole.toLowerCase() === 'athlete' || Boolean(m.isAthleteProfile) || Boolean(cachedUser?.isAthleteProfile === 1);

      let resolvedRole: Member['role'] = 'Member';
      if (isOwner) resolvedRole = 'Owner';
      else if (isAdmin) resolvedRole = 'Admin';
      else if (rawRole.toLowerCase() === 'organizer') resolvedRole = 'Organizer';
      else if (isAthlete) resolvedRole = 'Athlete';
      else resolvedRole = 'Member';

      // Join Date from club members or user record
      const cm = clubMemberMap.get(userId);
      const clubJoinDate = m.createdAt || m.created_at || m.joinedAt || cm?.createdAt || cm?.created_at || cachedUser?.createdAt || null;
      let joinDate = '—';
      if (clubJoinDate) {
        try {
          joinDate = new Date(clubJoinDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        } catch {
          joinDate = '—';
        }
      }

      // Status from club member record
      const rawStatus = (cm?.status || m.status || 'active').toLowerCase();
      let status: Member['status'] = 'Active';
      if (rawStatus === 'pending') {
        status = 'Pending';
      } else if (rawStatus === 'suspended' || rawStatus === 'banned' || rawStatus === 'cancelled') {
        status = 'Suspended';
      } else {
        status = 'Active';
      }

      return {
        id,
        userId,
        profilePhoto,
        name,
        initials,
        email,
        rawRole,
        role: resolvedRole,
        gender,
        rawPhone,
        phoneNo,
        joinDate,
        clubJoinDate,
        status,
        isOwner,
        isAdmin,
      };
    });
  }, [membersData, clubOwnerId, clubMemberMap, userDetailsMap]);

  // ── Stats Summary ──
  const stats = useMemo(() => {
    const total = formattedMembers.length;
    const admins = formattedMembers.filter((m) => m.role === 'Owner' || m.role === 'Admin').length;
    const athletes = formattedMembers.filter((m) => m.role === 'Athlete').length;
    const regular = formattedMembers.filter((m) => m.role === 'Member').length;
    return { total, admins, athletes, regular };
  }, [formattedMembers]);

  // ── Filter & Search Logic ──
  const filteredMembers = useMemo(() => {
    let list = formattedMembers;

    // Filter tab
    if (roleFilter === 'admins') {
      list = list.filter((m) => m.role === 'Owner' || m.role === 'Admin');
    } else if (roleFilter === 'athletes') {
      list = list.filter((m) => m.role === 'Athlete');
    } else if (roleFilter === 'members') {
      list = list.filter((m) => m.role === 'Member');
    }

    // Live search query
    if (!searchInput.trim()) return list;
    const query = searchInput.toLowerCase();
    return list.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.gender.toLowerCase().includes(query) ||
        (member.phoneNo && member.phoneNo !== '—' && member.phoneNo.toLowerCase().includes(query)) ||
        (member.rawPhone && member.rawPhone.toLowerCase().includes(query))
      );
    });
  }, [formattedMembers, roleFilter, searchInput]);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  // ── DataTable Columns ──
  const columns: Column<Member>[] = useMemo(() => [
    {
      key: 'name',
      label: t`Member`,
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <MemberAvatar
            userId={row.userId}
            src={row.profilePhoto}
            name={row.name}
            initials={row.initials}
            onAvatarClick={(url) => setAvatarPreviewData({
              url,
              name: row.name,
              subtitle: row.email,
              initials: row.initials,
            })}
          />
          <div className="min-w-0">
            <div className="text-sm font-bold text-text-main truncate max-w-[180px] sm:max-w-[240px] flex items-center gap-1.5">
              <span className="truncate">{row.name}</span>
              {row.isOwner && (
                <span title={t`Club Owner`} className="inline-flex">
                  <Crown size={13} className="text-[#EB712B] shrink-0 fill-[#EB712B]/20" />
                </span>
              )}
            </div>
            <div className="text-[11px] text-text-muted truncate max-w-[180px] sm:max-w-[240px]">
              {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: t`Role`,
      sortable: true,
      render: (row) => (
        <MemberRoleCell
          userId={row.userId}
          rawRole={row.rawRole}
          isOwner={row.isOwner}
          role={row.role}
        />
      ),
    },
    {
      key: 'gender',
      label: t`Gender`,
      sortable: true,
      render: (row) => (
        <MemberGenderCell userId={row.userId} fallbackGender={row.gender} />
      ),
    },
    { 
      key: 'phoneNo', 
      label: t`Phone no.`, 
      sortable: true,
      render: (row) => (
        <MemberPhoneCell userId={row.userId} fallbackPhone={row.phoneNo} />
      ),
    },
    { 
      key: 'joinDate', 
      label: t`Join Date`, 
      sortable: true,
      render: (row) => (
        <MemberJoinDateCell userId={row.userId} formattedDate={row.joinDate} clubJoinDate={row.clubJoinDate} />
      ),
    },
    {
      key: 'status',
      label: t`Status`,
      sortable: true,
      render: (row) => (
        <MemberStatusCell status={row.status} />
      ),
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (row) => (
        <div className="relative flex justify-end">
          <button 
            onClick={(e) => toggleMenu(row.id, e)}
            className="p-2 rounded-xl hover:bg-hover text-text-muted hover:text-text-main transition-colors cursor-pointer"
            title={t`Options`}
          >
            <MoreVertical size={16} />
          </button>
          
          {activeMenuId === row.id && (
            <div 
              className="absolute right-0 top-full mt-1 w-52 bg-surface/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => { setSelectedUserId(row.userId); setActiveMenuId(null); }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-text-main hover:bg-hover rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <Eye size={14} className="text-[#EB712B]" />
                <span><Trans>View Profile</Trans></span>
              </button>
              
              <button 
                onClick={() => {
                  setActiveMenuId(null);
                  navigate('/view/clubside/support', { 
                     state: { 
                      targetUserId: row.userId, 
                      targetUserName: row.name, 
                      targetUserAvatar: row.profilePhoto 
                    } 
                  });
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-text-main hover:bg-hover rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <MessageSquare size={14} className="text-blue-400" />
                <span><Trans>Send Message</Trans></span>
              </button>

              {row.email && row.email !== '—' && (
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(row.email);
                    toast.success(t`Copied ${row.email} to clipboard!`);
                    setActiveMenuId(null);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-text-main hover:bg-hover rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer"
                >
                  <Copy size={14} className="text-emerald-400" />
                  <span><Trans>Copy Email</Trans></span>
                </button>
              )}

              {canManageMembers && !row.isOwner && (
                <>
                  <div className="h-px bg-border/60 my-1" />
                  <button 
                    onClick={() => handleRemoveMember(row.id)}
                    disabled={isRemoving}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <Ban size={14} />
                    <span><Trans>Remove Member</Trans></span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      ),
    },
  ], [activeMenuId, canManageMembers, isRemoving, navigate]);

  const isLoading = isMembersLoading || isClubLoading;

  return (
    <div className={isEmbedded ? "w-full text-text-main font-sans space-y-6" : "w-full text-text-main font-sans min-h-screen p-4 md:p-8 space-y-6 overflow-x-hidden"}>
      
      {/* ── Standalone Page Header (Shown when accessed via /members route) ── */}
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight mb-2"><Trans>Members Management</Trans></h1>
            <p className="text-xs md:text-sm text-text-muted max-w-2xl">
              <Trans>Efficiently manage your community members, monitor roles, and view accurate membership details.</Trans>
            </p>
          </div>
        </div>
      )}

      {/* ── Top Bar: Filter Tabs + Search Input ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-2">
        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface/80 border border-border rounded-2xl overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              roleFilter === 'all'
                ? 'bg-[#EB712B] text-white shadow-md shadow-[#EB712B]/20'
                : 'text-text-muted hover:text-text-main hover:bg-hover'
            }`}
          >
            <Trans>All</Trans> <span className="text-[10px] opacity-80 font-normal">({stats.total})</span>
          </button>
          <button
            onClick={() => setRoleFilter('admins')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              roleFilter === 'admins'
                ? 'bg-[#EB712B] text-white shadow-md shadow-[#EB712B]/20'
                : 'text-text-muted hover:text-text-main hover:bg-hover'
            }`}
          >
            <Trans>Leaders & Admins</Trans> <span className="text-[10px] opacity-80 font-normal">({stats.admins})</span>
          </button>
          {stats.athletes > 0 && (
            <button
              onClick={() => setRoleFilter('athletes')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                roleFilter === 'athletes'
                  ? 'bg-[#EB712B] text-white shadow-md shadow-[#EB712B]/20'
                  : 'text-text-muted hover:text-text-main hover:bg-hover'
              }`}
            >
              <Trans>Athletes</Trans> <span className="text-[10px] opacity-80 font-normal">({stats.athletes})</span>
            </button>
          )}
          <button
            onClick={() => setRoleFilter('members')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              roleFilter === 'members'
                ? 'bg-[#EB712B] text-white shadow-md shadow-[#EB712B]/20'
                : 'text-text-muted hover:text-text-main hover:bg-hover'
            }`}
          >
            <Trans>Members</Trans> <span className="text-[10px] opacity-80 font-normal">({stats.regular})</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors">
            <Search size={15} className="text-text-muted group-focus-within:text-[#EB712B]" />
          </div>
          <input
            type="text"
            placeholder={t`Search by name, email, role, or phone...`}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-surface border border-border text-text-main text-xs font-medium rounded-2xl pl-10 pr-9 py-2.5 outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all placeholder:text-text-muted shadow-sm"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-[#EB712B] transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden min-h-[420px]">
        {isLoading ? (
          <TableSkeleton />
        ) : filteredMembers.length > 0 ? (
          <DataTable
            data={filteredMembers}
            columns={columns}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-hover border border-border flex items-center justify-center mb-4 text-text-muted">
              <SearchX size={28} className="opacity-40" />
            </div>
            <h3 className="text-base font-black text-text-main mb-1 uppercase tracking-tight"><Trans>No members found</Trans></h3>
            <p className="text-xs text-text-muted max-w-sm mb-4">
              {searchInput 
                ? t`No members matched your search "${searchInput}".`
                : roleFilter !== 'all' 
                ? t`No members found in the "${roleFilter}" category.`
                : t`This club currently has no joined members.`
              }
            </p>
            {(searchInput || roleFilter !== 'all') && (
              <button
                onClick={() => { setSearchInput(''); setRoleFilter('all'); }}
                className="px-4 py-2 bg-hover hover:bg-border text-text-main text-xs font-bold rounded-xl border border-border transition-colors cursor-pointer"
              >
                <Trans>Reset Filters</Trans>
              </button>
            )}
          </div>
        )}

        {/* User Profile Modal */}
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}

        {/* Member Avatar Lightbox Modal */}
        <AvatarLightboxModal
          isOpen={Boolean(avatarPreviewData)}
          onClose={() => setAvatarPreviewData(null)}
          imageUrl={avatarPreviewData?.url}
          name={avatarPreviewData?.name}
          subtitle={avatarPreviewData?.subtitle}
          tag={t`Member Avatar`}
          fallbackInitials={avatarPreviewData?.initials}
          onAction={() => {
            const m = formattedMembers.find(fm => fm.name === avatarPreviewData?.name);
            if (m) setSelectedUserId(m.userId);
          }}
          actionLabel={t`View Profile`}
        />
      </div>
    </div>
  );
};

export default Members;
