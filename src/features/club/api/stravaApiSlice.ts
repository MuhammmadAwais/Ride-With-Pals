/**
 * @fileoverview stravaApiSlice — RTK Query endpoints for Strava integration.
 *
 * Covers:
 * - connectStravaAccount   POST /user/connect/strava
 * - checkStravaStatus      GET  /user/strava/status
 * - disconnectStravaAccount DELETE /user/strava/disconnect
 * - getStravaLeaderboardData GET /user/club/leaderboard/strava
 */
import { apiSlice } from '@/api/apiSlice';

interface StravaStatusResponse {
  connected: boolean;
  status?: string;
  athleteId?: string | number;
  name?: string;
}

interface StravaConnectResponse {
  authUrl?: string;
  url?: string;
  redirectUrl?: string;
}

interface StravaLeaderboardEntry {
  rank: number;
  userId: number;
  fullName: string;
  profileImage?: string | null;
  totalDistance?: number;
  totalElevation?: number;
  totalRides?: number;
  totalTime?: number;
}

export const stravaApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    connectStravaAccount: builder.mutation<StravaConnectResponse, void>({
      query: () => ({
        url: '/user/connect/strava',
        method: 'POST',
      }),
    }),

    checkStravaStatus: builder.query<StravaStatusResponse, void>({
      query: () => ({
        url: '/user/strava/status',
        method: 'GET',
      }),
    }),

    disconnectStravaAccount: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/user/strava/disconnect',
        method: 'DELETE',
      }),
    }),

    getStravaLeaderboardData: builder.query<StravaLeaderboardEntry[], { clubId: number | string }>({
      query: (params) => ({
        url: '/user/club/leaderboard/strava',
        method: 'GET',
        params,
      }),
      providesTags: ['Club'],
    }),
  }),
});

export const {
  useConnectStravaAccountMutation,
  useCheckStravaStatusQuery,
  useDisconnectStravaAccountMutation,
  useGetStravaLeaderboardDataQuery,
} = stravaApiSlice;
