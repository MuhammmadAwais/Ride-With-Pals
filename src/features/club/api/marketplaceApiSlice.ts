import { apiSlice } from '@/api/apiSlice';
import { MarketPlaceTypes } from '@/api/types';

export const marketplaceApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMarketplaceList: builder.query<MarketPlaceTypes.GetMarketplaceListResponseResponse, MarketPlaceTypes.GetMarketplaceListParams>({
      query: (params) => ({
        url: '/user/club/marketplace',
        method: 'GET',
        params,
      }),
      providesTags: ['Marketplace'],
    }),

    addMarketPlaceItem: builder.mutation<MarketPlaceTypes.AddMarketPlaceItemResponseResponse, MarketPlaceTypes.AddMarketPlaceItemRequest>({
      query: (body) => ({
        url: '/user/club/marketplace',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Marketplace'],
    }),

    updateMarketPlaceItem: builder.mutation<MarketPlaceTypes.AddMarketPlaceItemResponseResponse, MarketPlaceTypes.UpdateMarketPlaceItemRequest>({
      query: (body) => ({
        url: '/user/club/marketplace',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Marketplace'],
    }),

    getMarketplaceItemInfo: builder.query<MarketPlaceTypes.ResponseElement, MarketPlaceTypes.GetMarketplaceItemInfoParams>({
      query: (params) => ({
        url: '/user/club/marketplace/item',
        method: 'GET',
        params,
      }),
      providesTags: ['Marketplace'],
    }),

    deleteMarketPlaceItem: builder.mutation<MarketPlaceTypes.DeleteMarketPlaceItemResponse, MarketPlaceTypes.DeleteMarketPlaceItemRequest>({
      query: (body) => ({
        url: '/user/club/marketplace',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Marketplace'],
    }),

    getOwnListings: builder.query<MarketPlaceTypes.GetMarketplaceListResponseResponse, MarketPlaceTypes.GetOwnListingsParams | void>({
      query: (params) => ({
        url: '/user/club/marketplace/my-listings',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: ['Marketplace'],
    }),

    shareMarketPlaceItem: builder.mutation<MarketPlaceTypes.AddMarketPlaceItemResponseResponse, MarketPlaceTypes.ShareMarketPlaceItemRequest>({
      query: (body) => ({
        url: '/user/club/marketplace/share',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Marketplace'],
    }),
  }),
});

export const {
  useGetMarketplaceListQuery,
  useAddMarketPlaceItemMutation,
  useUpdateMarketPlaceItemMutation,
  useGetMarketplaceItemInfoQuery,
  useDeleteMarketPlaceItemMutation,
  useGetOwnListingsQuery,
  useShareMarketPlaceItemMutation,
} = marketplaceApiSlice;
