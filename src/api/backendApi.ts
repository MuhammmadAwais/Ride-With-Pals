import axios from "axios";
import { toast } from "sonner";

let injectedStore: any = null;

export const setupApiStore = (store: any) => {
  injectedStore = store;
};

const API_URL =
  import.meta.env.VITE_APP_BACKEND_API_BASE_URL || "https://api.ridewithpals.com/api";

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

    console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params || config.data || '');

    return config;
  },
  (error) => {
    console.error(`❌ [API Request Error]`, error);
    return Promise.reject(error);
  }
);

// Response Interceptor
backendApi.interceptors.response.use(
  (response) => {
    console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    
    // Normalize data structure if it matches the { statusCode, message, response } pattern
    // This allows existing code like `res?.data` or `res?.response?.data` or `res?.rows` to work globally
    if (response.data && typeof response.data === 'object' && response.data.response) {
      const payload = response.data.response;
      let targetArray: any[] | null = null;
      
      if (Array.isArray(payload)) {
        targetArray = payload;
      } else if (payload.rows && Array.isArray(payload.rows)) {
        targetArray = payload.rows;
      } else if (payload.data && Array.isArray(payload.data)) {
        targetArray = payload.data;
      }
      
      if (targetArray) {
        // Alias for backward compatibility with frontend extraction logic
        response.data.data = targetArray;
        response.data.rows = targetArray;
      }
    }

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
        if (error.config?.method?.toLowerCase() !== 'get') {
          toast.error("You do not have permission to perform this action.");
        }
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


const logWrapper = <T extends Record<string, any>>(serviceName: string, service: T): T => {
  const wrapped: any = {};
  for (const key of Object.keys(service)) {
    const value = service[key];
    if (typeof value === 'function') {
      wrapped[key] = async (...args: any[]) => {
        console.log(`📞 [API Call] ${serviceName}.${key} called with:`, args);
        try {
          const result = await value(...args);
          console.log(`📥 [API Success] ${serviceName}.${key} returned:`, result);
          return result;
        } catch (error: any) {
          if (error.response && [403, 404].includes(error.response.status)) {
            // Silently suppress generic console.error spam for expected permission/not found errors
          } else {
            console.error(`❌ [API Error] ${serviceName}.${key} error:`, error);
          }
          throw error;
        }
      };
    } else {
      wrapped[key] = value;
    }
  }
  return wrapped as T;
};

export const AuthService = logWrapper("AuthService", {
  signup: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/signup', data, { params });
    return response.data;
  },

  forgotPassword: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/forgot/password', { params });
    return response.data;
  },

  resendOTP: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/resend/otp', data, { params });
    return response.data;
  },

  validateOTP: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/validate/otp', data, { params });
    return response.data;
  },

  changePassword: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/change/password', data, { params });
    return response.data;
  },

  login: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/login', data, { params });
    return response.data;
  },

  updatePassword: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/update/password', data, { params });
    return response.data;
  },

  firebaseLogin: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/login/firebase', data, { params });
    return response.data;
  },
});

export const UserService = logWrapper("UserService", {
  upsertAthleteProfile: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/update/athlete/profile', data, { params });
    return response.data;
  },

  userInfo: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/info', { params });
    return response.data;
  },

  updateFcmToken: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/fcm-token', data, { params });
    return response.data;
  },

  updateScaleUnitSettings: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/unit/settings', data, { params });
    return response.data;
  },

  checkEmailExistence: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/check-email', { params });
    return response.data;
  },

  getOtherUserInfo: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/details', { params });
    return response.data;
  },
});

export const RideService = logWrapper("RideService", {
  uploadFile: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/upload/file', data, { params });
    return response.data;
  },

  getClubRides: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/rides', { params });
    return response.data;
  },

  getActivitiesData: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/activity/rides/public', { params });
    return response.data;
  },

  getCalendarTabData: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/activity/rides/by-date', { params });
    return response.data;
  },

  addRides: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/ride', data, { params });
    return response.data;
  },

  getOwnRides: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/rides', { params });
    return response.data;
  },

  getRideInfoByID: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/ride', { params });
    return response.data;
  },

  updateRideInfo: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/ride', data, { params });
    return response.data;
  },

  joinRide: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/ride/join', data, { params });
    return response.data;
  },

  saveRide: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/ride/save', data, { params });
    return response.data;
  },

  unsaveRide: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/ride/unsave', data, { params });
    return response.data;
  },

  getSavedRidesList: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/rides/saved', { params });
    return response.data;
  },
});

export const StravaService = logWrapper("StravaService", {
  connectStravaAccount: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/strava/connect', { params });
    return response.data;
  },

  checkStravaStatus: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/strava/status', { params });
    return response.data;
  },

  disconnectStravaAccount: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/strava/disconnect', { params });
    return response.data;
  },
});

export const LeaderboardService = logWrapper("LeaderboardService", {
  getStravaLeaderboardData: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/leaderboard/km', { params });
    return response.data;
  },

  getClubLeaderboardAppRides: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/leaderboard/rides', { params });
    return response.data;
  },
});

export const ClubService = logWrapper("ClubService", {
  getClubTerms: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/terms', { params });
    return response.data;
  },

  addClubTerms: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/terms', data, { params });
    return response.data;
  },

  updateClubTerms: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/terms', data, { params });
    return response.data;
  },

  createClubProfile: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/profile', data, { params });
    return response.data;
  },

  clubs: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/clubs/all', { params });
    return response.data;
  },

  joinClub: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/join', data, { params });
    return response.data;
  },

  getJoinedClubs: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/clubs', { params });
    return response.data;
  },

  leaveClub: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/leave', data, { params });
    return response.data;
  },

  getClubMembersList: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/members', { params });
    return response.data;
  },

  getClubJoinRequest: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/join-requests', { params });
    return response.data;
  },

  manageJoinGroupRequest: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/join-request/respond', data, { params });
    return response.data;
  },

  getClubDashboardStats: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/dashboard/stats', { params });
    return response.data;
  },

  getClubInfoByID: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club', { params });
    return response.data;
  },

  updateClubInfoById: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club', data, { params });
    return response.data;
  },

  removeClubMember: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/member', { params });
    return response.data;
  },

  getClubPermissions: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/permissions', { params });
    return response.data;
  },

  savePermissionsForAdminOrUserRole: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/permissions/role', data, { params });
    return response.data;
  },

  applyPermissionTogglesForSelectedMembers: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/permissions/members', data, { params });
    return response.data;
  },

  grantRevokeFullClubAccessForOneMember: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/permissions/full-access', data, { params });
    return response.data;
  },

  assignRoleToMember: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/member/role', data, { params });
    return response.data;
  },

  removeFullAccessPermission: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/permissions/remove-full-access', data, { params });
    return response.data;
  },
});

export const NewsService = logWrapper("NewsService", {
  addComment: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/news/comment', data, { params });
    return response.data;
  },

  getAllNewsComments: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/news/comment/all', { params });
    return response.data;
  },

  updateNewsComment: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/news/comment', data, { params });
    return response.data;
  },

  delComment: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/news/comment', { params });
    return response.data;
  },

  addNews: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/news', data, { params });
    return response.data;
  },

  getNewsById: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/news', { params });
    return response.data;
  },

  updateNews: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/news', data, { params });
    return response.data;
  },

  deleteNews: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/news', { params });
    return response.data;
  },

  getAllNews: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/news/all', { params });
    return response.data;
  },
});

export const ShopService = logWrapper("ShopService", {
  addItemToShop: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/shop', data, { params });
    return response.data;
  },

  updateItemToShop: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/shop', data, { params });
    return response.data;
  },

  getTheShopItems: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/shop', { params });
    return response.data;
  },

  deleteShopItem: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/shop', { params });
    return response.data;
  },

  getTheShopItemByID: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/shop/item', { params });
    return response.data;
  },

  forClubOwnerOrderList: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/shop/orders', { params });
    return response.data;
  },

  forClubOwnerUpdateOrderStatus: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/shop/order/status', data, { params });
    return response.data;
  },

  buyShopItem: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/shop/buy', data, { params });
    return response.data;
  },

  getMyPurchasesList: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/shop/purchases', { params });
    return response.data;
  },

  updateShopOrderStatus: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/shop/order/cancel', data, { params });
    return response.data;
  },

  getMarketplaceList: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/marketplace', { params });
    return response.data;
  },

  addMarketPlaceItem: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/marketplace', data, { params });
    return response.data;
  },

  updateMarketPlaceItem: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/marketplace', data, { params });
    return response.data;
  },

  getMarketplaceItemInfo: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/marketplace/item', { params });
    return response.data;
  },

  deleteMarketPlaceItem: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/marketplace', { params });
    return response.data;
  },

  getOwnListings: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/marketplace/my-listings', { params });
    return response.data;
  },

  shareMarketPlaceItem: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/marketplace/share', data, { params });
    return response.data;
  },

  getClubDiscounts: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/shop/discount', { params });
    return response.data;
  },

  addDiscount: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/shop/discount', data, { params });
    return response.data;
  },

  updateDiscount: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/shop/discount', data, { params });
    return response.data;
  },

  deleteDiscount: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/shop/discount', { params });
    return response.data;
  },
});

export const SubscriptionService = logWrapper("SubscriptionService", {
  listClubSubscription: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/subscription/plans', { params });
    return response.data;
  },

  mySubscription: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/subscription/me', { params });
    return response.data;
  },

  subscribeToClubPlan: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/subscription/subscribe', data, { params });
    return response.data;
  },

  clubCustomerPortal: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/subscription/customer-portal', data, { params });
    return response.data;
  },

  getMySubscription: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/subscription/me', { params });
    return response.data;
  },

  subscriptionPlanList: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/subscription/plans', { params });
    return response.data;
  },

  subscribeToAnyPlan: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/subscription/subscribe', data, { params });
    return response.data;
  },

  createCustomerPortal: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/subscription/customer-portal', { params });
    return response.data;
  },

  connectStripe: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/stripe/connect', { params });
    return response.data;
  },

  checkStripeAccountStatus: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/stripe/status', { params });
    return response.data;
  },

  sendSubscriptionReminder: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/remind', data, { params });
    return response.data;
  },

  sendSubscriptionReminderToEveryone: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/remind-all', data, { params });
    return response.data;
  },
});

export const MembershipService = logWrapper("MembershipService", {
  subscribeToMembershipPlan: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/subscribe', data, { params });
    return response.data;
  },

  getMyMembershipInfo: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/membership/me', { params });
    return response.data;
  },

  createClubMembershipPlan: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/fee', data, { params });
    return response.data;
  },

  updateClubMembershipPlan: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/club/membership/fee', data, { params });
    return response.data;
  },


  deleteMembershipPlan: async (params?: Record<string, any>) => {
    const response = await backendApi.delete('/user/club/membership/plan', { params });
    return response.data;
  },

  listMembershipPlans: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/membership/plans', { params });
    return response.data;
  },

  membershipPlanInfoByID: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/membership/plan', { params });
    return response.data;
  },

  listSubscribedMember: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/membership/members', { params });
    return response.data;
  },

  changeClubMemberFeeStatus: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/manual-pay', data, { params });
    return response.data;
  },

  getClubMembershipOverview: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/membership/overview', { params });
    return response.data;
  },

  exemptMemberFee: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/exempt', data, { params });
    return response.data;
  },

  changeAssignedFee: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/change/fee', data, { params });
    return response.data;
  },

  resetMembershipFeePending: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.post('/user/club/membership/reset-pending', data, { params });
    return response.data;
  },
});

export const NotificationService = logWrapper("NotificationService", {
  getUserNotification: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/notifications', { params });
    return response.data;
  },

  getClubNotifications: async (params?: Record<string, any>) => {
    const response = await backendApi.get('/user/club/notifications', { params });
    return response.data;
  },

  markAsReadNotifications: async (data?: any, params?: Record<string, any>) => {
    const response = await backendApi.put('/user/notifications/read', data, { params });
    return response.data;
  },
});

