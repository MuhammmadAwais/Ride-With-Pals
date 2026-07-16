import { apiSlice } from '@/api/apiSlice';
import { ClubTypes } from '@/api/types';

export const clubApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClubRides: builder.query<ClubTypes.GetClubRidesResponseResponse, ClubTypes.GetClubRidesParams>({
      query: (params) => ({
        url: '/user/club/rides',
        method: 'GET',
        params,
      }),
      providesTags: ['Ride'],
    }),

    createClubProfile: builder.mutation<ClubTypes.CreateClubProfileResponseResponse, ClubTypes.CreateClubProfileRequest>({
      query: (body) => ({
        url: '/user/club/profile',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Club'],
    }),

    addRides: builder.mutation<ClubTypes.AddRidesResponseResponse, ClubTypes.AddRidesRequest>({
      query: (body) => ({
        url: '/user/ride',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ride'],
    }),

    getOwnRides: builder.query<ClubTypes.GetOwnRidesResponseResponse, ClubTypes.GetOwnRidesParams | void>({
      query: (params) => ({
        url: '/user/rides',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Ride'],
    }),

    getRideInfoById: builder.query<ClubTypes.GetRideInfoByIdResponseResponse, ClubTypes.GetRideInfoByIdParams>({
      query: (params) => ({
        url: '/user/ride',
        method: 'GET',
        params,
      }),
      providesTags: ['Ride'],
    }),

    updateRideInfo: builder.mutation<ClubTypes.UpdateRideInfoResponseResponse, ClubTypes.UpdateRideInfoRequest>({
      query: (body) => ({
        url: '/user/ride',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Ride'],
    }),

    getClubs: builder.query<ClubTypes.ClubsResponseResponse, ClubTypes.GetClubsParams | void>({
      query: (params) => ({
        url: '/user/clubs/all',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Club'],
    }),

    joinClub: builder.mutation<ClubTypes.ClubMemberElement, ClubTypes.JoinClubRequest>({
      query: (body) => ({
        url: '/user/club/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Club'],
    }),

    getJoinedClubs: builder.query<ClubTypes.ClubsResponseResponse, ClubTypes.GetJoinedClubsParams | void>({
      query: (params) => ({
        url: '/user/clubs',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Club'],
    }),

    leaveClub: builder.mutation<ClubTypes.LeaveClubResponse, ClubTypes.LeaveClubRequest>({
      query: (body) => ({
        url: '/user/club/leave',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Club'],
    }),

    joinRide: builder.mutation<ClubTypes.JoinRideResponseResponse, ClubTypes.JoinRideRequest>({
      query: (body) => ({
        url: '/user/ride/join',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ride'],
    }),

    getClubMembersList: builder.query<ClubTypes.GetClubMembersListResponseResponse[], ClubTypes.GetClubMembersListParams>({
      query: (params) => ({
        url: '/user/club/members',
        method: 'GET',
        params,
      }),
      providesTags: ['Club'],
    }),

    getClubJoinRequest: builder.query<ClubTypes.GetClubJoinRequestResponseResponse[], ClubTypes.GetClubJoinRequestParams>({
      query: (params) => ({
        url: '/user/club/join-requests',
        method: 'GET',
        params,
      }),
      providesTags: ['Club'],
    }),

    manageJoinGroupRequest: builder.mutation<ClubTypes.ManageJoinGroupRequestResponseResponse, ClubTypes.ManageJoinGroupRequest>({
      query: (body) => ({
        url: '/user/club/join-request/respond',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Club'],
    }),

    getClubDashboardStats: builder.query<ClubTypes.GetClubDashboardStatsResponseResponse, ClubTypes.GetClubDashboardStatsParams>({
      query: (params) => ({
        url: '/user/club/dashboard/stats',
        method: 'GET',
        params,
      }),
      providesTags: ['Club'],
    }),

    getClubInfoById: builder.query<ClubTypes.CreateClubProfileResponseResponse, ClubTypes.GetClubInfoByIdParams>({
      query: (params) => ({
        url: '/user/club',
        method: 'GET',
        params,
      }),
      providesTags: ['Club'],
    }),

    updateClubInfoById: builder.mutation<ClubTypes.CreateClubProfileResponseResponse, ClubTypes.UpdateClubInfoRequest>({
      query: (body) => ({
        url: '/user/club',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Club'],
    }),

    removeClubMember: builder.mutation<ClubTypes.ManageJoinGroupRequestResponseResponse, ClubTypes.RemoveClubMemberRequest>({
      query: (body) => ({
        url: '/user/club/member',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Club'],
    }),
  }),
});

export const {
  useGetClubRidesQuery,
  useCreateClubProfileMutation,
  useAddRidesMutation,
  useGetOwnRidesQuery,
  useGetRideInfoByIdQuery,
  useUpdateRideInfoMutation,
  useGetClubsQuery,
  useJoinClubMutation,
  useGetJoinedClubsQuery,
  useLeaveClubMutation,
  useJoinRideMutation,
  useGetClubMembersListQuery,
  useGetClubJoinRequestQuery,
  useManageJoinGroupRequestMutation,
  useGetClubDashboardStatsQuery,
  useGetClubInfoByIdQuery,
  useUpdateClubInfoByIdMutation,
  useRemoveClubMemberMutation,
} = clubApiSlice;
