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
  getUserNotifications: async () => {
    return await ApiNotificationService.getUserNotification();
  },
  getClubNotifications: async (clubId: number) => {
    return await ApiNotificationService.getClubNotifications({ clubId });
  },
  markNotificationAsRead: async (notificationId: number) => {
    return await ApiNotificationService.markAsReadNotifications({ notificationId });
  }
};
