import { backendApi } from "@/api/backendApi";

export const SubscriptionService = {
  getSubscriptionPlans: async () => {
    const response = await backendApi.get("/user/subscription/plans");
    return response.data;
  },

  checkoutSubscription: async (planId: number) => {
    const response = await backendApi.post("/user/subscription/subscribe", { planId });
    return response.data;
  },

  getClubSubscriptionPlans: async () => {
    const response = await backendApi.get("/user/club/subscription/plans");
    return response.data;
  },

  checkoutClubSubscription: async (clubId: number, planId: number) => {
    const response = await backendApi.post(`/user/club/subscription/subscribe?clubId=${clubId}`, {
      planId,
      successUrl: `https://app.ridewithpals.com/club/${clubId}/success`,
      cancelUrl: `https://app.ridewithpals.com/club/${clubId}/cancel`,
    });
    return response.data;
  },

  createClubBillingPortalSession: async (clubId: number) => {
    const response = await backendApi.post(`/user/club/subscription/customer-portal?clubId=${clubId}`);
    return response.data;
  }
};
