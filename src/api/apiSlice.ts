import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { toast } from 'sonner';
import { logout } from '@/features/auth/slices/authSlice';

// 1 & 2: Configure fetchBaseQuery with baseUrl mapped to import.meta.env.VITE_APP_BACKEND_API_BASE_URL
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_APP_BACKEND_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // 3: Extract the active session JWT token from the global Redux state paths
    const state = getState() as any;
    const token = state?.auth?.user?.token || state?.auth?.token;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// 4: Custom baseQuery wrapper to capture global API events & log requests/responses
const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const requestUrl = typeof args === 'string' ? args : args.url;
  const requestMethod = typeof args === 'string' ? 'GET' : (args.method || 'GET');
  const requestBody = typeof args === 'string' ? undefined : args.body;
  const requestParams = typeof args === 'string' ? undefined : args.params;

  console.groupCollapsed(`🚀 [API REQUEST] ${requestMethod.toUpperCase()} ${requestUrl}`);
  console.log('📍 Endpoint:', requestUrl);
  console.log('⚡ Method:', requestMethod);
  if (requestParams) console.log('🔍 Query Params:', requestParams);
  if (requestBody) console.log('📦 Sending Request Body:', requestBody);
  console.log('🏷️ RTK Endpoint:', api.endpoint);
  console.groupEnd();

  const result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    console.groupCollapsed(`❌ [API ERROR] ${requestMethod.toUpperCase()} ${requestUrl}`);
    console.log('📍 Endpoint:', requestUrl);
    console.log('⚠️ Status Code:', result.error.status);
    console.log('💥 Received Error Payload:', result.error.data || result.error);
    console.groupEnd();

    if (result.error.status === 401) {
      // If a 401 response is caught, automatically trigger a logout cleanup action
      api.dispatch(logout());
    } else if (result.error.status === 500) {
      // If a 500 error occurs, catch the payload and issue an error notice using the sonner library
      toast.error('Internal Server Error. Please try again later.');
    }
    return result;
  }

  console.groupCollapsed(`✅ [API RESPONSE] ${requestMethod.toUpperCase()} ${requestUrl}`);
  console.log('📍 Endpoint:', requestUrl);
  console.log('📥 Receiving Response Data:', result.data);
  if (result.data && typeof result.data === 'object' && 'response' in result.data) {
    console.log('🔓 Unwrapped Payload Data:', (result.data as any).response);
  }
  console.groupEnd();

  // 5: The backend encapsulates payloads in a { statusCode, message, response } JSON envelope.
  // Implement the transform hook at this base level to peel back this envelope and pass pure response data.
  if (result.data && typeof result.data === 'object' && 'response' in result.data) {
    return { data: (result.data as any).response };
  }

  return result;
};

// Generate the central base slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: customBaseQuery,
  // 6: Initialize the global tagTypes caching manifest array
  tagTypes: [
    'User',
    'Club',
    'Ride',
    'News',
    'Shop',
    'Marketplace',
    'Subscription',
    'Notification',
    'Permission',
    'Discount',
    'Wallet',
    'EmailNotification'
  ],
  // 7: Export an empty endpoints array for decoupled slice injection
  endpoints: () => ({}),
});
