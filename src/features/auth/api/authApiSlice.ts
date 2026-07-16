import { apiSlice } from '@/api/apiSlice';
import { AuthTypes } from '@/api/types';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<AuthTypes.SignupResponseResponse, AuthTypes.SignupRequest>({
      query: (body) => ({
        url: '/user/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
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
