import { apiSlice } from '@/api/apiSlice';
import { NewsTypes } from '@/api/types';

export const newsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addComment: builder.mutation<NewsTypes.LatestCommentElement, NewsTypes.AddCommentRequest>({
      query: (body) => ({
        url: '/user/club/news/comment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['News'],
    }),

    getAllNewsComments: builder.query<NewsTypes.GetAllNewsCommentsResponseResponse, NewsTypes.GetAllNewsCommentsParams>({
      query: (params) => ({
        url: '/user/club/news/comment/all',
        method: 'GET',
        params,
      }),
      providesTags: ['News'],
    }),

    updateNewsComment: builder.mutation<NewsTypes.LatestCommentElement, NewsTypes.UpdateNewsCommentRequest>({
      query: (body) => ({
        url: '/user/club/news/comment',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['News'],
    }),

    delComment: builder.mutation<NewsTypes.DelCommentResponse, NewsTypes.DelCommentRequest>({
      query: (body) => ({
        url: '/user/club/news/comment',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['News'],
    }),

    addNews: builder.mutation<NewsTypes.AddNewsResponseResponse, NewsTypes.AddNewsRequest>({
      query: (body) => ({
        url: '/user/club/news',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['News'],
    }),

    getNewsById: builder.query<NewsTypes.AddNewsResponseResponse, NewsTypes.GetNewsByIdParams>({
      query: (params) => ({
        url: '/user/club/news',
        method: 'GET',
        params,
      }),
      providesTags: ['News'],
    }),

    updateNews: builder.mutation<NewsTypes.AddNewsResponseResponse, NewsTypes.UpdateNewsRequest>({
      query: (body) => ({
        url: '/user/club/news',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['News'],
    }),

    deleteNews: builder.mutation<NewsTypes.AddNewsResponseResponse, NewsTypes.DeleteNewsRequest>({
      query: (body) => ({
        url: '/user/club/news',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['News'],
    }),

    getAllNews: builder.query<NewsTypes.GetAllNewsResponseResponse, NewsTypes.GetAllNewsParams>({
      query: (params) => ({
        url: '/user/club/news/all',
        method: 'GET',
        params,
      }),
      providesTags: ['News'],
    }),
  }),
});

export const {
  useAddCommentMutation,
  useGetAllNewsCommentsQuery,
  useUpdateNewsCommentMutation,
  useDelCommentMutation,
  useAddNewsMutation,
  useGetNewsByIdQuery,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useGetAllNewsQuery,
} = newsApiSlice;
