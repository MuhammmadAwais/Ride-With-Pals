import { apiSlice } from '@/api/apiSlice';
import { ShopOrderTypes } from '@/api/types';

export const shopOrderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    forClubOwnerOrderList: builder.query<ShopOrderTypes.ForClubOwnerOrderListResponseResponse, ShopOrderTypes.ForClubOwnerOrderListParams>({
      query: (params) => ({
        url: '/user/club/shop/orders',
        method: 'GET',
        params,
      }),
      providesTags: ['Shop'],
    }),

    forClubOwnerUpdateOrderStatus: builder.mutation<ShopOrderTypes.UpdateShopOrderStatusResponse, ShopOrderTypes.ForClubOwnerUpdateOrderStatusRequest>({
      query: (body) => ({
        url: '/user/club/shop/order/status',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),

    buyShopItem: builder.mutation<ShopOrderTypes.BuyShopItemResponseResponse, ShopOrderTypes.BuyShopItemRequest>({
      query: (body) => ({
        url: '/user/club/shop/buy',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),

    getMyPurchasesList: builder.query<ShopOrderTypes.ForClubOwnerOrderListResponseResponse, ShopOrderTypes.GetMyPurchasesListParams | void>({
      query: (params) => ({
        url: '/user/club/shop/purchases',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Shop'],
    }),

    updateShopOrderStatus: builder.mutation<ShopOrderTypes.UpdateShopOrderStatusResponse, ShopOrderTypes.UpdateShopOrderStatusRequest>({
      query: (body) => ({
        url: '/user/club/shop/order/cancel',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Shop'],
    }),
  }),
});

export const {
  useForClubOwnerOrderListQuery,
  useForClubOwnerUpdateOrderStatusMutation,
  useBuyShopItemMutation,
  useGetMyPurchasesListQuery,
  useUpdateShopOrderStatusMutation,
} = shopOrderApiSlice;
