import { apiSlice } from '@/api/apiSlice';

export interface WalletTransaction {
  id: string;
  title: string;
  category: string;
  type: 'debit' | 'credit' | string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'failed' | string;
  clubName?: string;
  customerName?: string;
  date: string;
}

export interface UserWalletData {
  totalSpent: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface ClubWalletData {
  pendingEarnings: number;
  totalEarnings: number;
  transactions: WalletTransaction[];
}

export interface UserWalletResponse {
  statusCode: number;
  message: string;
  response: UserWalletData;
}

export interface ClubWalletResponse {
  statusCode: number;
  message: string;
  response: ClubWalletData;
}

export const walletApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserWallet: builder.query<UserWalletResponse, void>({
      query: () => ({
        url: '/user/wallet',
        method: 'GET',
      }),
      providesTags: ['Wallet'],
    }),

    getClubWallet: builder.query<ClubWalletResponse, { clubId: number | string }>({
      query: ({ clubId }) => ({
        url: `/user/club/wallet?clubId=${clubId}`,
        method: 'GET',
      }),
      providesTags: ['Wallet'],
    }),
  }),
});

export const {
  useGetUserWalletQuery,
  useGetClubWalletQuery,
} = walletApiSlice;
