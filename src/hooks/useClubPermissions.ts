import { useState, useEffect } from 'react';
import { backendApi } from '@/api/backendApi';

export interface ClubPermissions {
  canPublishRides: boolean;
  canPublishNews: boolean;
  canPublishDiscount: boolean;
  canAcceptUsers: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useClubPermissions = (clubId: number | string | undefined): ClubPermissions => {
  const [permissions, setPermissions] = useState({
    canPublishRides: false,
    canPublishNews: false,
    canPublishDiscount: false,
    canAcceptUsers: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) {
      setPermissions({
        canPublishRides: false,
        canPublishNews: false,
        canPublishDiscount: false,
        canAcceptUsers: false,
      });
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    backendApi.get('/user/club/permissions', { params: { clubId } })
      .then((res) => {
        if (!isMounted) return;

        const payload = res.data?.response || res.data;
        const rolePermissions = payload?.rolePermissions || [];

        const canPublishRides = rolePermissions.some(
          (p: any) => p.permissionName === 'Publish Rides' && p.isAllowed
        );
        const canPublishNews = rolePermissions.some(
          (p: any) => p.permissionName === 'Publish News' && p.isAllowed
        );
        const canPublishDiscount = rolePermissions.some(
          (p: any) => p.permissionName === 'Publish Discount' && p.isAllowed
        );
        const canAcceptUsers = rolePermissions.some(
          (p: any) => p.permissionName === 'Accept Users' && p.isAllowed
        );

        setPermissions({
          canPublishRides,
          canPublishNews,
          canPublishDiscount,
          canAcceptUsers,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.response?.data?.message || err.message || 'Failed to fetch club permissions');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [clubId]);

  return {
    ...permissions,
    isLoading,
    error,
  };
};

export default useClubPermissions;
