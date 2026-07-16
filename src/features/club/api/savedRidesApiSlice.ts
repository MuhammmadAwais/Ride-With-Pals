import { apiSlice } from '@/api/apiSlice';
import { RideTypes } from '@/api/types';

export const savedRidesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    saveRide: builder.mutation<RideTypes.SaveRideResponse, RideTypes.SaveRideRequest>({
      query: (body) => ({
        url: '/user/ride/save',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ride'],
    }),

    unsaveRide: builder.mutation<RideTypes.UnsaveRideResponse, RideTypes.UnsaveRideRequest>({
      query: (body) => ({
        url: '/user/ride/unsave',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Ride'],
    }),

    getSavedRidesList: builder.query<RideTypes.Response, RideTypes.GetSavedRidesListParams | void>({
      query: (params) => ({
        url: '/user/rides/saved',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Ride'],
    }),
  }),
});

export const {
  useSaveRideMutation,
  useUnsaveRideMutation,
  useGetSavedRidesListQuery,
} = savedRidesApiSlice;
