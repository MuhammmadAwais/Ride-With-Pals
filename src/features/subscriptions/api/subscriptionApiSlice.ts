import { apiSlice } from '@/api/apiSlice';
import { SubscriptionTypes } from '@/api/types';

export const subscriptionApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listClubSubscription: builder.query<SubscriptionTypes.ResponseElement[], SubscriptionTypes.ListClubSubscriptionParams>({
      query: (params) => ({
        url: '/user/club/subscription/plans',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    mySubscription: builder.query<SubscriptionTypes.GetMySubscriptionResponseResponse, SubscriptionTypes.MySubscriptionParams>({
      query: (params) => ({
        url: '/user/club/subscription/me',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    subscribeToClubPlan: builder.mutation<SubscriptionTypes.SubscribeToClubPlanResponse, SubscriptionTypes.SubscribeToClubPlanRequest>({
      query: ({ clubId, ...body }) => ({
        url: '/user/club/subscription/subscribe',
        method: 'POST',
        params: { clubId },
        body,
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),

    clubCustomerPortal: builder.mutation<SubscriptionTypes.ClubCustomerPortalResponse, SubscriptionTypes.ClubCustomerPortalRequest>({
      query: ({ clubId }) => ({
        url: '/user/club/subscription/customer-portal',
        method: 'POST',
        params: { clubId },
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),

    getMySubscription: builder.query<SubscriptionTypes.GetMySubscriptionResponseResponse, void>({
      query: () => ({
        url: '/user/subscription/me',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    subscriptionPlanList: builder.query<SubscriptionTypes.SubscriptionPlanListResponseResponse, void>({
      query: () => ({
        url: '/user/subscription/plans',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
    }),

    subscribeToAnyPlan: builder.mutation<SubscriptionTypes.SubscribeToAnyPlanResponseResponse, SubscriptionTypes.SubscribeToAnyPlanRequest>({
      query: (body) => ({
        url: '/user/subscription/subscribe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'User'],
    }),

    createCustomerPortal: builder.query<SubscriptionTypes.CreateCustomerPortalResponse, SubscriptionTypes.CreateCustomerPortalParams>({
      query: (params) => ({
        url: '/user/subscription/customer-portal',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),
  }),
});

export const {
  useListClubSubscriptionQuery,
  useMySubscriptionQuery,
  useSubscribeToClubPlanMutation,
  useClubCustomerPortalMutation,
  useGetMySubscriptionQuery,
  useSubscriptionPlanListQuery,
  useSubscribeToAnyPlanMutation,
  useCreateCustomerPortalQuery,
} = subscriptionApiSlice;
