import { apiSlice } from '@/api/apiSlice';
import { NotificationTypes } from '@/api/types';

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotification: builder.query<NotificationTypes.GetUserNotificationResponseResponse, NotificationTypes.GetUserNotificationParams | void>({
      query: (params) => ({
        url: '/user/notifications',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Notification'],
    }),

    getClubNotifications: builder.query<NotificationTypes.GetUserNotificationResponseResponse, NotificationTypes.GetClubNotificationsParams>({
      query: (params) => ({
        url: '/user/club/notifications',
        method: 'GET',
        params,
      }),
      providesTags: ['Notification'],
    }),

    markAsReadNotifications: builder.mutation<NotificationTypes.ResponseElement, NotificationTypes.MarkAsReadNotificationsRequest>({
      query: (body) => ({
        url: '/user/notifications/read',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    sendSubscriptionReminder: builder.mutation<NotificationTypes.ResponseElement, NotificationTypes.SendSubscriptionReminderRequest>({
      query: (body) => ({
        url: '/user/club/membership/remind',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    sendSubscriptionReminderToEveryone: builder.mutation<NotificationTypes.SendSubscriptionReminderToEveryoneResponseResponse, NotificationTypes.SendSubscriptionReminderToEveryoneRequest>({
      query: (body) => ({
        url: '/user/club/membership/remind-all',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),

    getEmailNotificationSettings: builder.query<{ statusCode: number; message: string; response: EmailNotificationSettings }, void>({
      query: () => ({
        url: '/user/email/notification/settings',
        method: 'GET',
      }),
      providesTags: ['EmailNotification' as any],
    }),

    updateEmailNotificationSettings: builder.mutation<{ statusCode: number; message: string; response: EmailNotificationSettings }, EmailNotificationSettings>({
      query: (body) => ({
        url: '/user/email/notification/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['EmailNotification' as any],
    }),
  }),
});

export interface EmailNotificationSettings {
  feePaymentRequests: boolean;
  newRide: boolean;
  clubJoinResponse: boolean;
  rideUpdates: boolean;
  orderStatus: boolean;
  subscriptionStatus: boolean;
  clubJoinRequest: boolean;
}

export const {
  useGetUserNotificationQuery,
  useGetClubNotificationsQuery,
  useMarkAsReadNotificationsMutation,
  useSendSubscriptionReminderMutation,
  useSendSubscriptionReminderToEveryoneMutation,
  useGetEmailNotificationSettingsQuery,
  useUpdateEmailNotificationSettingsMutation,
} = notificationApiSlice;

