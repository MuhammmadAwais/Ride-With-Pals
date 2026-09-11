import { apiSlice } from '@/api/apiSlice';
import { StripeTypes } from '@/api/types';

export const stripeApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    connectStripe: builder.mutation<StripeTypes.ConnectStripeResponseResponse, StripeTypes.ConnectStripeParams>({
      query: (params) => ({
        url: '/user/club/stripe/connect',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        return response?.response || response || {};
      },
      invalidatesTags: ['Club'],
    }),

    checkStripeAccountStatus: builder.query<StripeTypes.CheckStripeAccountStatusResponseResponse, StripeTypes.CheckStripeAccountStatusParams>({
      query: (params) => ({
        url: '/user/club/stripe/status',
        method: 'GET',
        params,
      }),
      transformResponse: (response: any) => {
        return response?.response || response || {};
      },
      keepUnusedDataFor: 0,
      providesTags: ['Club'],
    }),

    disconnectStripe: builder.mutation<any, { clubId: number }>({
      query: (body) => ({
        url: '/user/club/stripe/disconnect',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Club'],
    }),
  }),
});

export const {
  useConnectStripeMutation,
  useCheckStripeAccountStatusQuery,
  useDisconnectStripeMutation,
} = stripeApiSlice;
