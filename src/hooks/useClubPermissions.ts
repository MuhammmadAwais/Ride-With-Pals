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
  
  const { data: members, isLoading, error } = useGetClubMembersListQuery(
    { clubId: clubId ? Number(clubId) : 0 },
    { skip: !clubId || !currentUserId }
  );

  const currentUserMember = members?.find(
    (m: any) => String(m.userId) === String(currentUserId)
  );

  if (!clubId || !currentUserId || !currentUserMember) {
    return {
      canPublishRides: false,
      canPublishNews: false,
      canPublishDiscount: false,
      canAcceptUsers: false,
      canManageMembershipFee: false,
      isOwner: false,
      isAdmin: false,
      role: null,
      isLoading: isLoading,
      error: error || null,
    };
  }

  const role = currentUserMember.role || 'User';
  const normalizedRole = role.toLowerCase();
  const isOwner = normalizedRole === 'owner';
  const isAdmin = isOwner || normalizedRole === 'admin' || normalizedRole === 'organizer';

  // Owners have full access to all actions
  const permissions = currentUserMember.permissions || {};
  const canPublishRides = isOwner || !!permissions.publishRides;
  const canPublishNews = isOwner || !!permissions.publishNews;
  const canPublishDiscount = isOwner || !!permissions.publishDiscount;
  const canAcceptUsers = isOwner || !!permissions.acceptOrBanUsers;
  const canManageMembershipFee = isOwner || !!permissions.manageMembershipFee;

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

