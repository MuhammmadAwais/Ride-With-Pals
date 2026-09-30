import { useState } from 'react';
import { toast } from 'sonner';
import { NotificationService as ApiNotificationService } from '@/api/backendApi';

export const useNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNotifications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiNotificationService.getUserNotification();
      return response.response || response.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch notifications.';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await ApiNotificationService.markAsReadNotifications({ notificationId });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    fetchUserNotifications,
    markAsRead,
    isLoading,
    error,
  };
};

export const NotificationService = {
  getUserNotifications: async (params?: Record<string, any>) => {
    return await ApiNotificationService.getUserNotification({ limit: 10, offset: 0, ...(params || {}) });
  },
  getClubNotifications: async (clubId: number, params?: Record<string, any>) => {
    return await ApiNotificationService.getClubNotifications({ clubId, limit: 10, offset: 0, ...(params || {}) });
  },
  markNotificationAsRead: async (notificationId: number) => {
    return await ApiNotificationService.markAsReadNotifications({ notificationId });
  }
};
