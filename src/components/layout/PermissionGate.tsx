import React from 'react';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { useAppSelector } from '@/hooks/useAppSelector';

export interface PermissionGateProps {
  requiredPermission: 'Publish Rides' | 'Publish News' | 'Publish Discount' | 'Accept Users' | string;
  clubId?: number | string;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  requiredPermission,
  clubId,
  children,
}) => {
  const currentClubId = useAppSelector((state) => state.club.currentClub?.id);
  const activeClubId = clubId ?? currentClubId;

  const permissions = useClubPermissions(activeClubId);

  let hasPermission = false;

  if (requiredPermission === 'Publish Rides') {
    hasPermission = permissions.canPublishRides;
  } else if (requiredPermission === 'Publish News') {
    hasPermission = permissions.canPublishNews;
  } else if (requiredPermission === 'Publish Discount') {
    hasPermission = permissions.canPublishDiscount;
  } else if (requiredPermission === 'Accept Users') {
    hasPermission = permissions.canAcceptUsers;
  }

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
};

export default PermissionGate;
