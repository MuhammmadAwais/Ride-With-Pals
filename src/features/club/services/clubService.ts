import { backendApi } from "@/api/backendApi";
import type { CreateClubPayload } from "../types/clubTypes";

export const ClubService = {
  // Organizers: owned = true. Athletes: owned = undefined (fetches all clubs).
  getAllClubs: async (owned?: boolean) => {
    const params = owned ? { owned: true } : {};
    const response = await backendApi.get("/user/clubs/all", { params });
    return response.data;
  },

  // Athletes: Get only the clubs they have successfully joined.
  getJoinedClubs: async () => {
    const response = await backendApi.get("/user/clubs");
    return response.data;
  },

  getClubById: async (clubId: number) => {
    const response = await backendApi.get(`/user/club?clubId=${clubId}`);
    return response.data;
  },

  createClubProfile: async (payload: CreateClubPayload) => {
    const response = await backendApi.post("/user/club/profile", payload);
    return response.data;
  },

  joinClub: async (clubId: number, invitationCode?: string) => {
    const payload: any = { clubId };
    if (invitationCode) payload.invitationCode = invitationCode;
    const response = await backendApi.post("/user/club/join", payload);
    return response.data;
  },

  leaveClub: async (clubId: number) => {
    const response = await backendApi.put("/user/club/leave", { clubId });
    return response.data;
  },

  getClubMembers: async (clubId: number, limit = 10, offset = 0, search = '') => {
    const params: any = { clubId, limit, offset };
    if (search) params.search = search;
    const response = await backendApi.get("/user/club/members", { params });
    return response.data;
  },

  getClubJoinRequests: async (clubId: number, limit = 10, offset = 0) => {
    const params = { clubId, limit, offset };
    const response = await backendApi.get("/user/club/join-requests", { params });
    return response.data;
  },

  manageJoinRequest: async (requestId: number, status: 'approved' | 'rejected') => {
    const response = await backendApi.put("/user/club/join-request", { requestId, status });
    return response.data;
  },

  removeClubMember: async (clubId: number, memberId: number) => {
    const response = await backendApi.delete("/user/club/member", {
      data: { clubId, memberId }
    });
    return response.data;
  },

  // ── Rides ───────────────────────────────────────────────────────────────────
  addRide: async (data: any) => {
    const response = await backendApi.post("/user/ride", data);
    return response.data;
  },
  editRide: async (data: any) => {
    const response = await backendApi.put("/user/ride", data);
    return response.data;
  },
  getPublicRides: async (searchQuery = "", limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/activity/rides/public", { params: { search: searchQuery, limit, offset } });
    return response.data;
  },
  getClubRides: async (clubId: number, status: string, search = "", limit = 10, offset = 0) => {
    const params: any = { clubId, status, search, limit, offset };
    const response = await backendApi.get("/user/club/rides", { params });
    return response.data;
  },
  getRideDetailsById: async (rideId: number) => {
    const response = await backendApi.get("/user/ride", { params: { rideId } }); // Usually it's /user/ride with params or /user/ride/:id depending on backend
    return response.data;
  },
  joinPublicRide: async (rideId: number) => {
    const response = await backendApi.post("/user/ride/join", { rideId });
    return response.data;
  },
  saveRide: async (rideId: number) => {
    const response = await backendApi.post("/user/ride/save", { rideId });
    return response.data;
  },
  userSavedRides: async (search = "", limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/rides/saved", { params: { search, limit, offset } });
    return response.data;
  },

  // ── News ────────────────────────────────────────────────────────────────────
  getAllNews: async (clubId: number, search = "", limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/club/news/all", { params: { clubId, search, limit, offset } });
    return response.data;
  },
  addNews: async (data: { title: string, description: string, image: string, clubId: number }) => {
    const response = await backendApi.post("/user/club/news", data);
    return response.data;
  },
  editNews: async (data: { id: number, title: string, description: string, image: string, clubId: number }) => {
    const response = await backendApi.put("/user/club/news", data);
    return response.data;
  },
  getNewsById: async (newsId: number) => {
    const response = await backendApi.get("/user/club/news", { params: { newsId } });
    return response.data;
  },
  addNewsComment: async (newsId: number, comment: string) => {
    const response = await backendApi.post("/user/club/news/comment", { newsId, comment });
    return response.data;
  },

  // ── Shop & Marketplace ──────────────────────────────────────────────────────
  getAllShopItems: async (clubId: number, search = "", limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/club/shop/items", { params: { clubId, search, limit, offset } });
    return response.data;
  },
  addShopItem: async (data: any) => {
    const response = await backendApi.post("/user/club/shop", data);
    return response.data;
  },
  updateShopItem: async (data: any) => {
    const response = await backendApi.put("/user/club/shop", data);
    return response.data;
  },
  deleteShopItem: async (shopItemId: number) => {
    const response = await backendApi.delete("/user/club/shop", { data: { shopItemId } });
    return response.data;
  },
  buyShopItem: async (data: any) => {
    const response = await backendApi.post("/user/club/shop/buy", data);
    return response.data;
  },
  getMyPurchases: async (statusId: number[], search = "", limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/club/shop/purchases", { params: { statusId, search, limit, offset } });
    return response.data;
  },
  getClubOrdersList: async (statusId: number[], clubId?: number, search = "", limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/club/shop/orders", { params: { statusId, clubId, search, limit, offset } });
    return response.data;
  },
  updateOrderStatus: async (orderId: number, statusId: number) => {
    const response = await backendApi.put("/user/club/shop/order/status", { orderId, statusId });
    return response.data;
  },

  // ── Leaderboards & Strava ───────────────────────────────────────────────────
  getClubRidesLeaderboard: async (clubId: number) => {
    const response = await backendApi.get("/user/club/leaderboard/rides", { params: { clubId } });
    return response.data;
  },
  getClubKmLeaderboard: async (clubId: number, period: string) => {
    const response = await backendApi.get("/user/club/leaderboard/km", { params: { clubId, period } });
    return response.data;
  },
  getStravaConnectUrl: async () => {
    const response = await backendApi.get("/user/strava/connect");
    return response.data;
  },
  getStravaStatus: async () => {
    const response = await backendApi.get("/user/strava/status");
    return response.data;
  },
  disconnectStrava: async () => {
    const response = await backendApi.delete("/user/strava/disconnect");
    return response.data;
  },

  // ── Marketplace ─────────────────────────────────────────────────────────────
  addMarketPlaceItem: async (data: any) => {
    const response = await backendApi.post("/user/club/marketplace", data);
    return response.data;
  },
  updateMarketPlaceItem: async (data: any) => {
    const response = await backendApi.put("/user/club/marketplace", data);
    return response.data;
  },
  deleteMarketPlaceItem: async (marketPlaceItemId: number) => {
    const response = await backendApi.delete("/user/club/marketplace", { data: { marketPlaceItemId } });
    return response.data;
  },
  getMarketPlaceItemById: async (marketPlaceItemId: number) => {
    const response = await backendApi.get("/user/club/marketplace/item", { params: { marketPlaceItemId } });
    return response.data;
  },
  shareMarketPlaceItem: async (clubId: number, marketPlaceItemId: number) => {
    const response = await backendApi.post("/user/club/marketplace/share", { clubId, marketPlaceItemId });
    return response.data;
  },
  getAllMarketPlaceItems: async (clubId?: number, search = "", limit = 10, offset = 0) => {
    const params: any = { limit, offset };
    if (clubId) params.clubId = clubId;
    if (search) params.search = search;
    const response = await backendApi.get("/user/club/marketplace", { params });
    return response.data;
  },
  getMyMarketListing: async (clubId?: number, search = "", limit = 10, offset = 0) => {
    const params: any = { limit, offset };
    if (clubId) params.clubId = clubId;
    if (search) params.search = search;
    const response = await backendApi.get("/user/club/marketplace/my-listings", { params });
    return response.data;
  },

  // ── Discounts ───────────────────────────────────────────────────────────────
  getDiscounts: async (clubId: number, search = "", limit = 10, offset = 0) => {
    const params: any = { clubId, limit, offset };
    if (search) params.search = search;
    const response = await backendApi.get("/user/club/shop/discount", { params });
    return response.data;
  },
  addDiscount: async (data: any) => {
    const response = await backendApi.post("/user/club/shop/discount", data);
    return response.data;
  },

  // ── Memberships & Stripe ────────────────────────────────────────────────────
  getStripeConnectUrl: async (clubId: number) => {
    const response = await backendApi.get("/user/club/stripe/connect", { params: { clubId } });
    return response.data;
  },
  getStripeStatus: async (clubId: number) => {
    const response = await backendApi.get("/user/club/stripe/status", { params: { clubId } });
    return response.data;
  },
  getClubMembershipPlans: async (clubId: number) => {
    const response = await backendApi.get("/user/club/membership/plans", { params: { clubId } });
    return response.data;
  },
  createClubMembershipPlan: async (data: any) => {
    const response = await backendApi.post("/user/club/membership/plan", data);
    return response.data;
  },
  updateClubMembershipPlan: async (data: any) => {
    const response = await backendApi.put("/user/club/membership/plan", data);
    return response.data;
  },
  deleteClubMembershipPlan: async (clubId: number, planId: number) => {
    const response = await backendApi.delete("/user/club/membership/plan", { data: { clubId, planId } });
    return response.data;
  },
  getClubSubscribers: async (clubId: number, limit = 10, offset = 0) => {
    const response = await backendApi.get("/user/club/membership/subscribers", { params: { clubId, limit, offset } });
    return response.data;
  },
  subscribeToClubMembership: async (clubId: number, planId: number) => {
    const response = await backendApi.post("/user/club/membership/subscribe", { clubId, planId });
    return response.data;
  },
  getMyClubMembership: async (clubId: number) => {
    const response = await backendApi.get("/user/club/membership/me", { params: { clubId } });
    return response.data;
  },
  manualPay: async (clubId: number, userId: number, planId: number) => {
    const response = await backendApi.post("/user/club/membership/manual-pay", { clubId, userId, planId });
    return response.data;
  },

  // ── Club Administration & Permissions ───────────────────────────────────────
  getClubDashboardStats: async (clubId: number) => {
    const response = await backendApi.get("/user/club/dashboard/stats", { params: { clubId } });
    return response.data;
  },
  getClubPermissions: async (clubId: number) => {
    const response = await backendApi.get("/user/club/permissions", { params: { clubId } });
    return response.data;
  },
  saveRolePermissions: async (clubId: number, roleId: number, permissions: any[]) => {
    const response = await backendApi.put("/user/club/permissions/role", { clubId, roleId, permissions });
    return response.data;
  },
  saveMemberPermissions: async (clubId: number, userIds: number[], permissions: any[]) => {
    const response = await backendApi.put("/user/club/permissions/members", { clubId, userIds, permissions });
    return response.data;
  },
  updateMemberFullAccess: async (clubId: number, userId: number, isFullAccess: boolean) => {
    const response = await backendApi.put("/user/club/permissions/full-access", { clubId, userId, isFullAccess });
    return response.data;
  },
  getClubDetailsById: async (clubId: number) => {
    const response = await backendApi.get("/user/club", { params: { clubId } });
    return response.data;
  },
  editClub: async (data: any) => {
    const response = await backendApi.put("/user/club", data);
    return response.data;
  },
  getClubTerms: async (clubId: number) => {
    const response = await backendApi.get("/user/club/terms", { params: { clubId } });
    return response.data;
  },


  // ── Club Discounts ────────────────────────────────────────────────────────
  getClubDiscounts: async (clubId: number, search: string = "") => {
    const response = await backendApi.get("/user/club/shop/discount", { params: { clubId, search } });
    return response.data;
  },
  addClubDiscount: async (data: any) => {
    const response = await backendApi.post("/user/club/shop/discount", data);
    return response.data;
  },

  createClubTerms: async (clubId: number, termsAndConditions: string) => {
    const response = await backendApi.post("/user/club/terms", { clubId, termsAndConditions });
    return response.data;
  },
  updateClubTerms: async (clubId: number, termsAndConditions: string) => {
    const response = await backendApi.put("/user/club/terms", { clubId, termsAndConditions });
    return response.data;
  },
  updateMemberRole: async (clubId: number, userId: number, roleId: number) => {
    const response = await backendApi.put("/user/club/member/role", { clubId, userId, roleId });
    return response.data;
  },
  cancelOrder: async (orderId: number) => {
    const response = await backendApi.put("/user/club/shop/order/cancel", { orderId });
    return response.data;
  }
};
