import { apiSlice } from '@/api/apiSlice';
import { MembershipTypes } from '@/api/types';

const normalizeBillingInterval = (val?: string): string => {
  if (!val) return 'monthly';
  const lower = val.toLowerCase();
  if (lower.includes('year') || lower.includes('annual') || lower === '12 month' || lower === '12 months') return 'annual';
  if (lower.includes('quarter') || lower === '3 month' || lower === '3 months') return 'quarterly';
  if (lower.includes('semi') || lower === '6 month' || lower === '6 months') return 'semi-annual';
  if (lower.includes('one') || lower === 'one-time') return 'one-time';
  if (lower === 'month' || lower === 'monthly' || lower === '1 month') return 'monthly';
  return val;
};

export const membershipApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    subscribeToMembershipPlan: builder.mutation<MembershipTypes.SubscribeToMembershipPlanResponseResponse, MembershipTypes.SubscribeToMembershipPlanRequest>({
      query: (body) => ({
        url: '/user/club/membership/subscribe',
        method: 'POST',
        body: {
          clubId: Number(body.clubId),
          planId: Number((body as any).planId ?? (body as any).feeId ?? (body as any).id),
        },
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    getMyMembershipInfo: builder.query<MembershipTypes.Row, MembershipTypes.GetMyMembershipInfoParams>({
      query: (params) => ({
        url: '/user/club/membership/me',
        method: 'GET',
        params,
      }),
      transformResponse: (res: any) => {
        const data = res?.response ?? res?.data ?? res;
        if (Array.isArray(data)) {
          return data[0] || null;
        }
        return data;
      },
      providesTags: ['Subscription'],
    }),

    createClubMembershipPlan: builder.mutation<MembershipTypes.ResponseElement, MembershipTypes.CreateClubMembershipPlanRequest>({
      query: (body) => ({
        url: '/user/club/membership/fee',
        method: 'POST',
        body: {
          clubId: Number(body.clubId),
          name: String(body.name),
          price: Number(body.price),
          currency: ((body as any).currency || 'EUR').toUpperCase(),
          billingInterval: normalizeBillingInterval((body as any).billingInterval || (body as any).duration),
          startDate: (body as any).startDate || new Date().toISOString(),
          endDate: (body as any).endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          allowStripe: (body as any).allowStripe ?? true,
          allowManual: (body as any).allowManual ?? true,
          autoRenew: Boolean((body as any).autoRenew),
          assignmentTarget: (body as any).assignmentTarget || 'all',
          assignedMemberIds: Array.isArray((body as any).assignedMemberIds) ? (body as any).assignedMemberIds : [],
          saveAsDraft: Boolean((body as any).saveAsDraft),
          ...(Array.isArray((body as any).features) && { features: (body as any).features }),
        },
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    updateClubMembershipPlan: builder.mutation<MembershipTypes.ResponseElement, MembershipTypes.UpdateClubMembershipPlanRequest>({
      query: (body) => ({
        url: '/user/club/membership/fee',
        method: 'PUT',
        body: {
          feeId: Number((body as any).feeId ?? (body as any).planId ?? (body as any).id),
          clubId: Number(body.clubId),
          name: String(body.name),
          price: Number(body.price),
          currency: ((body as any).currency || 'EUR').toUpperCase(),
          billingInterval: normalizeBillingInterval((body as any).billingInterval || (body as any).duration),
          startDate: (body as any).startDate || new Date().toISOString(),
          endDate: (body as any).endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          allowStripe: (body as any).allowStripe ?? true,
          allowManual: (body as any).allowManual ?? true,
          autoRenew: Boolean((body as any).autoRenew),
          assignmentTarget: (body as any).assignmentTarget || 'all',
          assignedMemberIds: Array.isArray((body as any).assignedMemberIds) ? (body as any).assignedMemberIds : [],
          saveAsDraft: Boolean((body as any).saveAsDraft),
          ...(Array.isArray((body as any).features) && { features: (body as any).features }),
        },
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    deleteMembershipPlan: builder.mutation<MembershipTypes.DeleteMembershipPlanResponse, MembershipTypes.DeleteMembershipPlanParams>({
      query: (params) => ({
        url: '/user/club/membership/plan',
        method: 'DELETE',
        body: {
          clubId: Number(params.clubId),
          planId: Number((params as any).planId ?? (params as any).feeId ?? (params as any).id),
        },
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    listMembershipPlans: builder.query<MembershipTypes.ResponseElement[], MembershipTypes.ListMembershipPlansParams>({
      query: (params) => ({
        url: '/user/club/membership/plans',
        method: 'GET',
        params,
      }),
      transformResponse: (res: any) => {
        // apiSlice.ts auto-unwraps { statusCode, message, response } → response at the base level
        const data = res?.response ?? res?.data ?? res;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.rows)) return data.rows;
        if (Array.isArray(data?.plans)) return data.plans;
        if (Array.isArray(data?.activeFees)) return data.activeFees;
        if (Array.isArray(data?.subscriptions)) return data.subscriptions;
        return [];
      },
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
        url: '/user/club/membership/members',
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

    getClubMembershipOverview: builder.query<MembershipTypes.ClubMembershipOverviewResponse, MembershipTypes.GetClubMembershipOverviewParams>({
      query: (params) => ({
        url: '/user/club/membership/overview',
        method: 'GET',
        params,
      }),
      transformResponse: (res: any) => {
        return res?.response ?? res?.data ?? res ?? {};
      },
      providesTags: ['Subscription'],
    }),

    exemptMemberFee: builder.mutation<any, MembershipTypes.ExemptMemberFeeRequest>({
      query: (body) => ({
        url: '/user/club/membership/exempt',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    changeAssignedFee: builder.mutation<any, MembershipTypes.ChangeAssignedFeeRequest>({
      query: (body) => ({
        url: '/user/club/membership/change/fee',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    resetMembershipFeePending: builder.mutation<any, MembershipTypes.ResetMembershipFeePendingRequest>({
      query: (body) => ({
        url: '/user/club/membership/reset-pending',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Subscription', 'Club'],
    }),

    sendPaymentReminderNotification: builder.mutation<any, { clubId: number; feeId: number; target: 'pending' | 'expired' }>({
      query: (body) => ({
        url: '/user/club/membership/pay/reminder/notification',
        method: 'POST',
        body,
      }),
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
  useGetClubMembershipOverviewQuery,
  useExemptMemberFeeMutation,
  useChangeAssignedFeeMutation,
  useResetMembershipFeePendingMutation,
  useSendPaymentReminderNotificationMutation,
} = membershipApiSlice;
