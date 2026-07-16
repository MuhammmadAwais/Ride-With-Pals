import { apiSlice } from '@/api/apiSlice';
import { ShopTypes } from '@/api/types';

export const shopApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addItemToShop: builder.mutation<ShopTypes.AddItemToShopResponseResponse, ShopTypes.AddItemToShopRequest>({
      query: (body) => ({
        url: '/user/club/shop',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),

    updateItemToShop: builder.mutation<ShopTypes.AddItemToShopResponseResponse, ShopTypes.UpdateItemToShopRequest>({
      query: (body) => ({
        url: '/user/club/shop',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),

    getTheShopItems: builder.query<ShopTypes.GetTheShopItemsResponseResponse, ShopTypes.GetTheShopItemsParams>({
      query: (params) => ({
        url: '/user/club/shop',
        method: 'GET',
        params,
      }),
      providesTags: ['Shop'],
    }),

    deleteShopItem: builder.mutation<ShopTypes.DeleteShopItemResponse, ShopTypes.DeleteShopItemRequest>({
      query: (body) => ({
        url: '/user/club/shop',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),

    getTheShopItemByID: builder.query<ShopTypes.Row, ShopTypes.GetTheShopItemByIDParams>({
      query: (params) => ({
        url: '/user/club/shop/item',
        method: 'GET',
        params,
      }),
      providesTags: ['Shop'],
    }),
  }),
});

export const {
  useAddItemToShopMutation,
  useUpdateItemToShopMutation,
  useGetTheShopItemsQuery,
  useDeleteShopItemMutation,
  useGetTheShopItemByIDQuery,
} = shopApiSlice;
