import { useState } from 'react';
import { Check, Crown, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useGetMySubscriptionQuery,
  useSubscriptionPlanListQuery,
  useSubscribeToAnyPlanMutation,
  useLazyCreateCustomerPortalQuery,
} from '@/features/subscriptions/api/subscriptionApiSlice';

const formatPlanPrice = (price: any): string => {
  const num = parseFloat(String(price || '0'));
  if (isNaN(num)) return '0';
  if (num >= 500 && num % 100 === 0) {
    return (num / 100).toFixed(0);
  }
  return num.toFixed(0);
};

const getPlanFeatures = (plan: any): string[] => {
  if (plan.features && Array.isArray(plan.features) && plan.features.length > 0) {
    return plan.features;
  }
  const list: string[] = [];
  if (plan.config?.unlimitedItemInMarketplace || plan.config?.unlimitedMarketplace) {
    list.push("Unlimited Marketplace Listings");
  } else if (plan.config?.marketplaceItems) {
    list.push(`Up to ${plan.config.marketplaceItems} Marketplace Items`);
  } else {
    list.push("Unlimited Marketplace Listings");
  }
  if (plan.config?.unlimitedRides || plan.config?.numberOfRides) {
    if (plan.config.unlimitedRides) {
      list.push("Unlimited Group Rides & Events");
    } else {
      list.push(`Up to ${plan.config.numberOfRides} Group Rides & Events`);
    }
  } else {
    list.push("Unlimited Group Rides & Events");
  }
  if (plan.config?.unlimitedClubMembers) {
    list.push("Unlimited Club Members");
  } else {
    list.push("Up to 50 Club Members");
  }
  if (plan.config?.clubStripeIntegration) {
    list.push("Stripe Direct Payout Integrations");
  }
  if (plan.config?.paidActivities) {
    list.push("Paid Activities & Ticketing");
  }
  if (plan.config?.stravaConnection) {
    list.push("Strava & GPS Route Syncing");
  }
  list.push("Advanced Performance Analytics");
  list.push("Verified Pro Badge");
  return Array.from(new Set(list));
};

const SuccessModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
    <div className="bg-surface border border-border p-8 rounded-[2rem] max-w-md w-full text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB712B]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="mx-auto w-24 h-24 bg-[#EB712B]/10 rounded-full flex items-center justify-center mb-6">
        <Crown size={48} className="text-[#EB712B]" />
      </div>
      <h2 className="text-3xl font-black text-text-main mb-4 tracking-tight">Subscription Active!</h2>
      <p className="text-text-muted mb-8 leading-relaxed">
        Welcome to the Premium Plan! You now have full access to marketplace listings, unlimited rides, and all premium features.
      </p>
      <button 
        onClick={onClose}
        className="w-full bg-[#EB712B] text-white py-4 rounded-2xl font-bold hover:bg-[#ff8c4a] transition-colors border-0 cursor-pointer outline-none shadow-lg"
      >
        Return to App
      </button>
    </div>
  </div>
);

const UserSubscription = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(searchParams.get('success') === 'true');

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    searchParams.delete('success');
    setSearchParams(searchParams, { replace: true });
  };

  // 1. Fetch user-level app subscription
  const { data: userSub, isLoading: isLoadingSub, isError: isErrorSub } = useGetMySubscriptionQuery();

  // 2. Fetch available user subscription plans
  const { data: plansDataResponse, isLoading: isLoadingPlans } = useSubscriptionPlanListQuery();
  const plansData = plansDataResponse?.rows || [];

  // 3. Checkout mutation
  const [subscribeToPlan, { isLoading: isStartingCheckout }] = useSubscribeToAnyPlanMutation();

  // 4. Customer Portal mutation (lazy query)
  const [createCustomerPortal, { isFetching: isOpeningPortal }] = useLazyCreateCustomerPortalQuery();

  const handleCheckout = async (e: React.MouseEvent, planId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await subscribeToPlan({ 
        planId
      }).unwrap();

      if (res?.checkoutUrl && typeof res.checkoutUrl === 'string' && res.checkoutUrl.startsWith('http')) {
        window.location.assign(res.checkoutUrl);
      } else {
        toast.error("Could not initiate checkout.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start checkout");
      console.error(err);
    }
  };

  const handleOpenPortal = async () => {
    try {
      const res = await createCustomerPortal({ type: 'user' }).unwrap();
      const portalUrl = typeof res === 'string'
        ? res
        : (res?.url || (res as any)?.portalUrl || (res as any)?.response?.url || (res as any)?.response?.portalUrl);

      if (typeof portalUrl === 'string' && portalUrl.startsWith('http')) {
        window.location.assign(portalUrl);
      } else {
        toast.error((res as any)?.message || "Could not open billing portal.");
      }
    } catch (err: any) {
      const errMsg = err?.data?.message || err?.data?.error || err?.message || "Failed to open billing portal";
      toast.error(errMsg);
      console.error('Customer Portal Error:', err);
    }
  };

  const isPro = userSub && userSub.status === "active";

  return (
    <div className="min-h-screen text-text-main p-8 md:p-16 bg-main-bg w-full relative">
      {showSuccessModal && <SuccessModal onClose={handleCloseModal} />}

      <button 
        onClick={() => navigate('/view/userside/profile')} 
        className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-all duration-300 mb-12 border-0 bg-transparent cursor-pointer outline-none"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-sm font-bold uppercase tracking-widest">Back</span>
      </button>

      {/* Header */}
      <div className="relative flex flex-col items-center text-center mb-16 px-4">
        <div className="absolute top-0 -z-10 w-64 h-64 bg-[#EB712B]/10 rounded-full blur-[100px]" />
        
        <h1 className="text-5xl md:text-6xl font-black text-text-main tracking-tighter mb-6 max-w-2xl">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB712B] to-[#ff8c4a]">Subscription Plan</span>
        </h1>
        
        <p className="text-text-muted text-lg max-w-lg leading-relaxed">
          Upgrade your account to unlock premium features, including full access to the marketplace and unlimited rides.
        </p>
      </div>

      {isLoadingSub || isLoadingPlans ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#EB712B] mb-4" size={48} />
          <p className="text-text-muted font-bold uppercase tracking-wider text-xs">Loading Subscription Details...</p>
        </div>
      ) : isErrorSub ? (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl max-w-lg mx-auto">
          <p className="text-red-500 font-bold uppercase text-xs">Failed to load subscription data.</p>
        </div>
      ) : (
        <div className="space-y-12 max-w-5xl mx-auto">
          {/* Active Subscription Status Banner */}
          {userSub && userSub.status !== 'inactive' && (
            <div className="bg-surface border border-border p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#EB712B]/20 transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB712B]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#EB712B] bg-[#EB712B]/10 border border-[#EB712B]/20 px-3 py-1 rounded-full">
                    Active Subscription
                  </span>
                  {isPro && <Crown className="text-[#EB712B]" size={18} />}
                </div>
                <h2 className="text-2xl font-black text-text-main">
                  {userSub.plan?.name || "Premium Membership"}
                </h2>
                {userSub.currentPeriodEnd && (
                  <p className="text-xs font-semibold text-text-muted">
                    Current period ends: {new Date(userSub.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>

              <button 
                onClick={handleOpenPortal}
                disabled={isOpeningPortal}
                className="px-6 py-3.5 rounded-2xl bg-surface hover:bg-hover border border-border text-text-main text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 outline-none disabled:opacity-50"
              >
                {isOpeningPortal ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                Manage on Stripe
              </button>
            </div>
          )}

          {/* Pricing Plans Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className={`bg-surface border p-8 rounded-[2rem] flex flex-col hover:border-[#EB712B]/30 transition-all duration-300 shadow-xl ${!isPro ? 'border-[#EB712B]' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-text-main">Free Limited Plan</h3>
                  <p className="text-text-muted text-sm mt-1">Essentials for getting started.</p>
                </div>
                <span className="text-[10px] font-bold text-text-muted bg-main-bg px-3 py-1 rounded-full uppercase tracking-widest">Free</span>
              </div>
              
              <div className="text-4xl font-bold text-text-main mb-8">$0 <span className="text-sm text-text-muted font-medium">/ forever</span></div>
              
              <div className="space-y-4 mb-8 flex-grow">
                {["Limited items in Marketplace", "Basic feature set", "Standard Route Tracking"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-text-muted">
                    <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-[#EB712B]"></div>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              
              <button 
                disabled 
                className="w-full bg-main-bg text-text-muted py-4 rounded-2xl font-bold border border-border cursor-not-allowed outline-none"
              >
                {!isPro ? "Current Plan" : "Downgrade via Customer Portal"}
              </button>
            </div>

            {/* Premium Tiers */}
            {plansData && plansData.filter((plan: any) => parseFloat(plan.price || '0') > 0 && !plan.name?.toLowerCase().includes('free')).map((plan) => {
              const isPlanActive = userSub?.planId === plan.id && isPro;

              return (
                <div 
                  key={plan.id}
                  className={`bg-surface border p-8 rounded-[2rem] relative flex flex-col hover:shadow-[0_0_40px_rgba(235,113,43,0.15)] transition-all duration-300 ${
                    isPlanActive ? 'border-2 border-[#EB712B] shadow-[0_0_40px_rgba(235,113,43,0.15)]' : 'border-border'
                  }`}
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EB712B] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-text-main">{plan.name}</h3>
                      <p className="text-text-muted text-sm mt-1">{plan.description}</p>
                    </div>
                    <Crown className="text-[#EB712B]" size={20} />
                  </div>
                  
                  <div className="text-4xl font-bold text-text-main mb-8">
                    ${formatPlanPrice(plan.price)} <span className="text-sm text-text-muted font-medium">/ {plan.billingInterval || "month"}</span>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-grow">
                    {getPlanFeatures(plan).map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-text-main">
                        <Check size={18} className="text-[#EB712B]" /> {feat}
                      </div>
                    ))}
                  </div>
                  
                  {isPlanActive ? (
                    <button 
                      type="button"
                      onClick={handleOpenPortal}
                      disabled={isOpeningPortal}
                      className="w-full bg-[#EB712B] text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border-0 cursor-pointer outline-none"
                    >
                      {isOpeningPortal && <Loader2 size={16} className="animate-spin" />}
                      Manage on Stripe
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={(e) => handleCheckout(e, plan.id)} 
                      disabled={isStartingCheckout}
                      className="w-full bg-main-bg hover:bg-[#EB712B] text-text-main hover:text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border border-border hover:border-[#EB712B] cursor-pointer outline-none"
                    >
                      {isStartingCheckout && <Loader2 size={16} className="animate-spin" />}
                      Subscribe Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSubscription;
