import { apiSlice } from '@/api/apiSlice';
import { DiscountTypes } from '@/api/types';

export const discountApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getClubDiscounts: builder.query<DiscountTypes.GetClubDiscountsResponseResponse, DiscountTypes.GetClubDiscountsParams>({
      query: (params) => ({
        url: '/user/club/shop/discount',
        method: 'GET',
        params,
      }),
      providesTags: ['Discount'],
    }),

    addDiscount: builder.mutation<DiscountTypes.AddDiscountResponseResponse, DiscountTypes.AddDiscountRequest>({
      query: (body) => ({
        url: '/user/club/shop/discount',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Discount', 'Shop'],
    }),

    updateDiscount: builder.mutation<DiscountTypes.AddDiscountResponseResponse, DiscountTypes.UpdateDiscountRequest>({
      query: (body) => ({
        url: '/user/club/shop/discount',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Discount', 'Shop'],
    }),

    deleteDiscount: builder.mutation<DiscountTypes.DeleteDiscountResponse, DiscountTypes.DeleteDiscountRequest>({
      query: (body) => ({
        url: '/user/club/shop/discount',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Discount', 'Shop'],
    }),
  }),
});

export const {
  useGetClubDiscountsQuery,
  useAddDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
} = discountApiSlice;
