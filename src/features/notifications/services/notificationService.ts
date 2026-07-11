import { backendApi } from "@/api/backendApi";

export const NotificationService = {
  getUserNotifications: async () => {
    const response = await backendApi.get("/user/notifications");
    return response.data;
  },

  getClubNotifications: async (clubId: number) => {
    const response = await backendApi.get("/user/club/notifications", { params: { clubId } });
    return response.data;
  },

  markNotificationAsRead: async (notificationId: number) => {
    const response = await backendApi.put("/user/notifications/read", { notificationId });
    return response.data;
  },

  sendSubscriptionReminder: async (clubId: number, targetUserId: number) => {
    const response = await backendApi.post("/user/club/membership/remind", { clubId, targetUserId });
    return response.data;
  },

  remindAllUnpaidMembers: async (clubId: number) => {
    const response = await backendApi.post("/user/club/membership/remind-all", { clubId });
    return response.data;
  }
};
