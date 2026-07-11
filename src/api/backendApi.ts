import axios from "axios";
import { toast } from "sonner";

let injectedStore: any = null;

export const setupApiStore = (store: any) => {
  injectedStore = store;
};

const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL || "http://85.31.238.214:8084/api";

// Create a centralized Axios instance
export const backendApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 seconds timeout
});

// Request Interceptor
backendApi.interceptors.request.use(
  (config) => {
    // Attempt to get the token from Redux state
    const state = injectedStore?.getState();
    const token = state?.auth?.user?.token;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Let Axios handle the boundary for FormData
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
backendApi.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response) {
      // The request was made and the server responded with a status code
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - token might be expired or invalid
        console.error("❌ [API] Unauthorized 401:", data);
        toast.error("Session expired or unauthorized. Please log in again.");
        if (injectedStore) {
          injectedStore.dispatch({ type: 'auth/logout' });
        }
      } else if (status === 403) {
        toast.error("You do not have permission to perform this action.");
      } else if (status >= 500) {
        toast.error("A server error occurred. Please try again later.");
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("❌ [API] Network Error:", error.request);
      toast.error("Network error. Please check your internet connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("❌ [API] Request Setup Error:", error.message);
    }
    return Promise.reject(error);
  }
);
