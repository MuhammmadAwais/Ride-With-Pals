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
  }),
});

export const {
  useGetUserNotificationQuery,
  useGetClubNotificationsQuery,
  useMarkAsReadNotificationsMutation,
  useSendSubscriptionReminderMutation,
  useSendSubscriptionReminderToEveryoneMutation,
} = notificationApiSlice;
