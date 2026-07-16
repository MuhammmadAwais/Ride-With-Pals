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
      invalidatesTags: ['Club'],
    }),

    checkStripeAccountStatus: builder.query<StripeTypes.CheckStripeAccountStatusResponseResponse, StripeTypes.CheckStripeAccountStatusParams>({
      query: (params) => ({
        url: '/user/club/stripe/status',
        method: 'GET',
        params,
      }),
      providesTags: ['Club'],
    }),
  }),
});

export const {
  useConnectStripeMutation,
  useCheckStripeAccountStatusQuery,
} = stripeApiSlice;
