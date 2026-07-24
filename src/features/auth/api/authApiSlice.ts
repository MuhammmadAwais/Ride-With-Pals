import { apiSlice } from '@/api/apiSlice';
import { AuthTypes } from '@/api/types';
import { setUser, bypassOtpSuccess } from '../slices/authSlice';
import type { AppUser } from '../types/authTypes';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthTypes.SignupResponseResponse, AuthTypes.SignupRequest>({
      query: (body) => ({
        url: '/user/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user: AppUser = {
            id: data.id,
            email: data.email,
            token: data.token,
            isAthleteProfile: !!data.isAthleteProfile,
            role: 'athlete',
          };
          dispatch(setUser(user));
        } catch (err) {}
      },
    }),

    forgotPassword: builder.query<AuthTypes.ForgotPasswordResponseResponse, AuthTypes.ForgotPasswordParams>({
      query: (params) => ({
        url: '/user/forgot/password',
        method: 'GET',
        params,
      }),
    }),

    resendOtp: builder.mutation<AuthTypes.ResendOtpResponseResponse, AuthTypes.ResendOtpRequest>({
      query: (body) => ({
        url: '/user/resend/otp',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    validateOtp: builder.mutation<AuthTypes.SignupResponseResponse, AuthTypes.ValidateOtpRequest & { token: string }>({
      query: ({ OTP, token }) => ({
        url: '/user/validate/otp',
        method: 'PUT',
        body: { OTP },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user: AppUser = {
            id: data.id,
            email: data.email,
            token: data.token,
            isAthleteProfile: !!data.isAthleteProfile,
            role: data.isAthleteProfile ? 'athlete' : 'organizer',
          };
          dispatch(setUser(user));
        } catch (err) {}
      },
    }),

    changePassword: builder.mutation<AuthTypes.UpdatePasswordResponse, AuthTypes.ChangePasswordRequest & { token: string }>({
      query: ({ password, token }) => ({
        url: '/user/change/password',
        method: 'PUT',
        body: { password },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: ['User'],
    }),

    login: builder.mutation<AuthTypes.SignupResponseResponse, AuthTypes.LoginRequest>({
      query: (body) => ({
        url: '/user/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          let user: AppUser = {
            id: data.id,
            email: data.email,
            token: data.token,
            isAthleteProfile: !!data.isAthleteProfile,
            role: data.isAthleteProfile ? 'athlete' : 'organizer',
          };
          dispatch(setUser(user));
          dispatch(bypassOtpSuccess());
          
          // Fetch full user info behind the scenes to populate missing profile fields
          try {
            const userInfoResult = await dispatch(authApiSlice.endpoints.userInfo.initiate()).unwrap();
            user = {
              ...user,
              isAthleteProfile: !!userInfoResult.isAthleteProfile,
              role: userInfoResult.isAthleteProfile ? 'athlete' : 'organizer',
              fullName: userInfoResult.fullName,
              profileImage: userInfoResult.profileImage,
              dob: userInfoResult.dob,
              country: userInfoResult.country,
              phone: userInfoResult.phone
            };
            dispatch(setUser(user));
          } catch (e) {
            console.warn('Failed to fetch full user info during login', e);
          }
        } catch (err) {}
      },
    }),

    updatePassword: builder.mutation<AuthTypes.UpdatePasswordResponse, AuthTypes.UpdatePasswordRequest>({
      query: (body) => ({
        url: '/user/update/password',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    upsertAthleteProfile: builder.mutation<AuthTypes.UpsertAthleteProfileResponseResponse, AuthTypes.UpsertAthleteProfileRequest>({
      query: (body) => ({
        url: '/user/update/athlete/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as any;
          const currentToken = state?.auth?.user?.token;
          const user: AppUser = {
            id: data.id,
            email: data.email,
            token: currentToken || '',
            isAthleteProfile: data.isAthleteProfile,
            role: 'athlete',
            fullName: data.fullName,
            dob: data.dob,
            country: data.country,
            profileImage: data.profileImage,
            phone: data.phone,
          };
          dispatch(setUser(user));
        } catch (err) {}
      },
    }),

    userInfo: builder.query<AuthTypes.UserInfoResponseResponse, void>({
      query: () => ({
        url: '/user/info',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    uploadFile: builder.mutation<AuthTypes.UploadFileResponseResponse, FormData>({
      query: (body) => ({
        url: '/user/upload/file',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    firebaseLogin: builder.mutation<AuthTypes.SignupResponseResponse, AuthTypes.FirebaseLoginRequest>({
      query: (body) => ({
        url: '/user/login/firebase',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          let user: AppUser = {
            id: data.id,
            email: data.email,
            token: data.token,
            isAthleteProfile: !!data.isAthleteProfile,
            role: data.isAthleteProfile ? 'athlete' : 'organizer',
          };
          dispatch(setUser(user));
          dispatch(bypassOtpSuccess());
          
          try {
            const userInfoResult = await dispatch(authApiSlice.endpoints.userInfo.initiate()).unwrap();
            user = {
              ...user,
              isAthleteProfile: !!userInfoResult.isAthleteProfile,
              role: userInfoResult.isAthleteProfile ? 'athlete' : 'organizer',
              fullName: userInfoResult.fullName,
              profileImage: userInfoResult.profileImage,
              dob: userInfoResult.dob,
              country: userInfoResult.country,
              phone: userInfoResult.phone
            };
            dispatch(setUser(user));
          } catch (e) {
            console.warn('Failed to fetch full user info during firebase login', e);
          }
        } catch (err) {}
      },
    }),


    updateFcmToken: builder.mutation<{ statusCode: number; message: string }, AuthTypes.UpdateFcmTokenRequest>({
      query: (body) => ({
        url: '/user/fcm-token',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    updateScaleUnitSettings: builder.mutation<AuthTypes.UpdateScaleUnitSettingsResponseResponse, AuthTypes.UpdateScaleUnitSettingsRequest>({
      query: (body) => ({
        url: '/user/unit/settings',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    checkEmailExistence: builder.query<AuthTypes.CheckEmailExistenceResponseResponse, AuthTypes.CheckEmailExistenceParams>({
      query: (params) => ({
        url: '/user/check-email',
        method: 'GET',
        params,
      }),
    }),

    getOtherUserInfo: builder.query<AuthTypes.UserInfoResponseResponse, AuthTypes.GetOtherUserInfoParams>({
      query: (params) => ({
        url: '/user/details',
        method: 'GET',
        params,
      }),
      providesTags: ['User'],
    }),
  }),
});

export const {
  useSignupMutation,
  useForgotPasswordQuery,
  useLazyForgotPasswordQuery,
  useResendOtpMutation,
  useValidateOtpMutation,
  useChangePasswordMutation,
  useLoginMutation,
  useUpdatePasswordMutation,
  useUpsertAthleteProfileMutation,
  useUserInfoQuery,
  useUploadFileMutation,
  useFirebaseLoginMutation,
  useUpdateFcmTokenMutation,
  useUpdateScaleUnitSettingsMutation,
  useCheckEmailExistenceQuery,
  useGetOtherUserInfoQuery,
} = authApiSlice;
