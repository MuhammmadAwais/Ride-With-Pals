import { useState } from 'react';
import { toast } from 'sonner';
import { SubscriptionService as ApiSubscriptionService } from '@/api/backendApi';

export const useSubscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionPlans = async () => {
    setIsLoading(true);
    try {
      const response = await ApiSubscriptionService.subscriptionPlanList();
      return response.response || response.data || [];
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch subscription plans');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const checkout = async (planId: number) => {
    setIsLoading(true);
    try {
      const response = await ApiSubscriptionService.subscribeToAnyPlan({ planId });
      return response;
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to initiate checkout');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchSubscriptionPlans, checkout, isLoading, error };
};

export const SubscriptionService = {
  getSubscriptionPlans: async () => {
    return await ApiSubscriptionService.subscriptionPlanList();
  },
  checkoutSubscription: async (planId: number) => {
    return await ApiSubscriptionService.subscribeToAnyPlan({ planId });
  },
  getClubSubscriptionPlans: async () => {
    return await ApiSubscriptionService.listClubSubscription();
  },
  checkoutClubSubscription: async (clubId: number, planId: number) => {
    return await ApiSubscriptionService.subscribeToClubPlan({
      planId,
      successUrl: `https://app.ridewithpals.com/club/${clubId}/success`,
      cancelUrl: `https://app.ridewithpals.com/club/${clubId}/cancel`,
    }, { clubId });
  },
  createClubBillingPortalSession: async (clubId: number) => {
    return await ApiSubscriptionService.clubCustomerPortal(null, { clubId });
  }
};
