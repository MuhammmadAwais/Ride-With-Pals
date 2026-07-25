import { apiSlice } from '@/api/apiSlice';
import { MembershipTypes } from '@/api/types';

export const membershipApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribeToMembershipPlan: builder.mutation<MembershipTypes.SubscribeToMembershipPlanResponseResponse, MembershipTypes.SubscribeToMembershipPlanRequest>({
      query: (body) => ({
        url: '/user/club/membership/subscribe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    getMyMembershipInfo: builder.query<MembershipTypes.Row, MembershipTypes.GetMyMembershipInfoParams>({
      query: (params) => ({
        url: '/user/club/membership/me',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    createClubMembershipPlan: builder.mutation<MembershipTypes.ResponseElement, MembershipTypes.CreateClubMembershipPlanRequest>({
      query: (body) => ({
        url: '/user/club/membership/plan',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    updateClubMembershipPlan: builder.mutation<MembershipTypes.ResponseElement, MembershipTypes.UpdateClubMembershipPlanRequest>({
      query: (body) => ({
        url: '/user/club/membership/plan',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    deleteMembershipPlan: builder.mutation<MembershipTypes.DeleteMembershipPlanResponse, MembershipTypes.DeleteMembershipPlanParams>({
      query: (params) => ({
        url: '/user/club/membership/plan',
        method: 'DELETE',
        body: params,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    listMembershipPlans: builder.query<MembershipTypes.ResponseElement[], MembershipTypes.ListMembershipPlansParams>({
      query: (params) => ({
        url: '/user/club/membership/plans',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    getMembershipPlanInfoByID: builder.query<MembershipTypes.ResponseElement, MembershipTypes.GetMembershipPlanInfoByIDParams>({
      query: (params) => ({
        url: '/user/club/membership/plan',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    listSubscribedMember: builder.query<MembershipTypes.ListSubscribedMemberResponseResponse, MembershipTypes.ListSubscribedMemberParams>({
      query: (params) => ({
        url: '/user/club/membership/subscribers',
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    changeClubMemberFeeStatus: builder.mutation<MembershipTypes.Row, MembershipTypes.ChangeClubMemberFeeStatusRequest>({
      query: (body) => ({
        url: '/user/club/membership/manual-pay',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),
  }),
});

export const {
  useSubscribeToMembershipPlanMutation,
  useGetMyMembershipInfoQuery,
  useCreateClubMembershipPlanMutation,
  useUpdateClubMembershipPlanMutation,
  useDeleteMembershipPlanMutation,
  useListMembershipPlansQuery,
  useGetMembershipPlanInfoByIDQuery,
  useListSubscribedMemberQuery,
  useChangeClubMemberFeeStatusMutation,
} = membershipApiSlice;
