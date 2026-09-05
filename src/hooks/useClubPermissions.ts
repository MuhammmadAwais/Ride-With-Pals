import { useMemo } from 'react';
import { useGetClubMembersListQuery } from '@/features/club/api/clubApiSlice';
import { useAppSelector } from '@/hooks/useAppSelector';

export interface ClubPermissions {
  canPublishRides: boolean;
  canPublishNews: boolean;
  canPublishDiscount: boolean;
  canAcceptUsers: boolean;
  canManageMembershipFee: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  role: string | null;
  isLoading: boolean;
  error: any;
}

export const useClubPermissions = (clubId: number | string | undefined): ClubPermissions => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);
  const myClubs = useAppSelector((state) => state.club.myClubs);

  const effectiveClubId = clubId ? Number(clubId) : 0;
  
  const { data: membersData, isLoading, error } = useGetClubMembersListQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId || !currentUserId }
  );

  const memberList: any[] = useMemo(() => {
    if (!membersData) return [];
    if (Array.isArray(membersData)) return membersData;
    return (membersData as any)?.rows || (membersData as any)?.data || (membersData as any)?.members || (membersData as any)?.response || [];
  }, [membersData]);

  // Check if current user is an owner/manager in myClubs
  const isClubOwnedByMe = useMemo(() => {
    if (!effectiveClubId) return false;
    return myClubs.some(
      (c: any) => Number(c.id || c.clubId) === effectiveClubId && (c.isOwner === true || c.owned === true || c.isManaged === true)
    );
  }, [effectiveClubId, myClubs]);

  const currentUserMember = useMemo(() => {
    if (!currentUserId || memberList.length === 0) return null;
    return memberList.find(
      (m: any) => String(m.userId || m.user_id || m.user?.id || m.id) === String(currentUserId)
    );
  }, [memberList, currentUserId]);

  if (!effectiveClubId || !currentUserId) {
    return {
      canPublishRides: false,
      canPublishNews: false,
      canPublishDiscount: false,
      canAcceptUsers: false,
      canManageMembershipFee: false,
      isOwner: false,
      isAdmin: false,
      role: null,
      isLoading,
      error: error || null,
    };
  }

  const role = currentUserMember?.role || (isClubOwnedByMe ? 'Owner' : (currentUserRole === 'owner' ? 'Owner' : 'Member'));
  const normalizedRole = (role || '').toLowerCase();
  const isOwner = isClubOwnedByMe || normalizedRole === 'owner';
  const isAdmin = isOwner || normalizedRole === 'admin' || normalizedRole === 'organizer';

  const permissions = currentUserMember?.permissions || {};
  const isFullAccess = Boolean(currentUserMember?.isFullAccess || permissions.fullAccess);

  const canPublishRides = isOwner || isAdmin || isFullAccess || Boolean(permissions.publishRides || permissions.canPublishRides);
  const canPublishNews = isOwner || isAdmin || isFullAccess || Boolean(permissions.publishNews || permissions.canPublishNews);
  const canPublishDiscount = isOwner || isAdmin || isFullAccess || Boolean(permissions.publishDiscount || permissions.canPublishDiscount);
  const canAcceptUsers = isOwner || isAdmin || isFullAccess || Boolean(permissions.acceptOrBanUsers || permissions.canAcceptUsers);
  const canManageMembershipFee = isOwner || isAdmin || isFullAccess || Boolean(permissions.manageMembershipFee || permissions.canManageMembershipFee);

  return {
    canPublishRides,
    canPublishNews,
    canPublishDiscount,
    canAcceptUsers,
    canManageMembershipFee,
    isOwner,
    isAdmin,
    role,
    isLoading,
    error: error || null,
  };
};

export default useClubPermissions;

