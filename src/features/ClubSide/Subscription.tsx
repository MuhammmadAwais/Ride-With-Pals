import { Check, Crown, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  useMySubscriptionQuery,
  useListClubSubscriptionQuery,
  useSubscribeToClubPlanMutation,
  useClubCustomerPortalMutation,
  useGetMySubscriptionQuery,
} from '@/features/subscriptions/api/subscriptionApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';

const Subscription = () => {
  const navigate = useNavigate();
  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : undefined;

  // 1. Fetch user-level app subscription (separate from club subscription)
  const { data: userSub } = useGetMySubscriptionQuery();

  // 2. Fetch current club subscription
  const { data: currentSub, isLoading: isLoadingSub, isError: isErrorSub } = useMySubscriptionQuery(
    { clubId: clubId || 0 },
    { skip: !clubId }
  );

  // 2. Fetch available club subscription plans
  const { data: plansData, isLoading: isLoadingPlans } = useListClubSubscriptionQuery(
    { clubId: clubId || 0 },
    { skip: !clubId }
  );

  // 3. Checkout mutation
  const [subscribeToClubPlan, { isLoading: isStartingCheckout }] = useSubscribeToClubPlanMutation();

  // 4. Customer Portal mutation
  const [clubCustomerPortal, { isLoading: isOpeningPortal }] = useClubCustomerPortalMutation();

  const handleCheckout = async (planId: number) => {
    if (!clubId) {
      toast.error("No club selected.");
      return;
    }

    try {
      const res = await subscribeToClubPlan({
        clubId,
        planId,
        successUrl: `https://app.ridewithpals.com/view/clubside/dashboard`,
        cancelUrl: `https://app.ridewithpals.com/view/clubside/subscription`,
      }).unwrap();

      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Could not initiate checkout.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start checkout");
      console.error(err);
    }
  };

  const handleOpenPortal = async () => {
    if (!clubId) return;

    try {
      const res = await clubCustomerPortal({ clubId }).unwrap();
      if (res?.url) {
        window.location.href = res.url;
      } else {
        toast.error("Could not open billing portal.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to open billing portal");
      console.error(err);
    }
  };

  if (!clubId) {
    return (
      <div className="min-h-screen text-text-main p-8 md:p-16 bg-main-bg flex flex-col items-center justify-center">
        <p className="text-text-muted text-lg mb-4">Please select a club to manage subscription.</p>
        <button onClick={() => navigate('/profile')} className="px-6 py-3 rounded-xl bg-surface border border-border hover:bg-hover transition-colors font-bold text-sm">
          Go to Profile
        </button>
      </div>
    );
  }

  const isPro = currentSub && currentSub.status === "active";

  return (
    <div className="min-h-screen text-text-main p-8 md:p-16 bg-main-bg">
      <button 
        onClick={() => navigate('/view/clubside/profile')} 
        className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-all duration-300 mb-12 border-0 bg-transparent cursor-pointer outline-none"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-sm font-bold uppercase tracking-widest">Back</span>
      </button>

      {/* Header */}
      <div className="relative flex flex-col items-center text-center mb-16 px-4">
        <div className="absolute top-0 -z-10 w-64 h-64 bg-[#EB712B]/10 rounded-full blur-[100px]" />
        
        <h1 className="text-5xl md:text-6xl font-black text-text-main tracking-tighter mb-6 max-w-2xl">
          Club <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB712B] to-[#ff8c4a]">Subscription Plan</span>
        </h1>
        
        <p className="text-text-muted text-lg max-w-lg leading-relaxed">
          Tailor your workspace to your needs. Choose the perfect plan to unlock full administrative power.
        </p>
      </div>

      {/* ✅ User-level app subscription banner (separate from club subscription) */}
      {userSub && (
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-surface border border-border p-6 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-xl flex items-center justify-center shrink-0">
              <Crown className="text-[#EB712B]" size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-[#EB712B]">Your App Subscription</p>
              <p className="text-sm font-bold text-text-main">{userSub.plan?.name || 'Free Plan'}</p>
              {userSub.currentPeriodEnd && (
                <p className="text-[10px] text-text-muted mt-0.5">Renews: {new Date(userSub.currentPeriodEnd).toLocaleDateString()}</p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
              userSub.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-border/50 text-text-muted border-border'
            }`}>
              {userSub.status || 'inactive'}
            </span>
          </div>
        </div>
      )}

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
          {currentSub && (
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
                  {currentSub.plan?.name || "Premium Membership"}
                </h2>
                <p className="text-xs font-semibold text-text-muted">
                  Current period ends: {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
                </p>
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
                {["2 items in Marketplace", "Basic feature set", "Standard Route Tracking"].map((item, i) => (
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

            {/* Premium Yearly Tier */}
            {plansData && plansData.map((plan) => {
              const isPlanActive = currentSub?.planId === plan.id && isPro;

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
                    ${plan.price} <span className="text-sm text-text-muted font-medium">/ {plan.billingInterval || "year"}</span>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-grow">
                    {[
                      plan.config?.unlimitedItemInMarketplace && "Unlimited Marketplace Items",
                      plan.config?.unlimitedClubMembers && "Unlimited Club Members",
                      plan.config?.clubStripeIntegration && "Stripe Direct Payout Integrations",
                      plan.config?.unlimitedRides && "Unlimited Group Rides & Events",
                    ].filter(Boolean).map((feat, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-text-main">
                        <Check size={18} className="text-[#EB712B]" /> {feat}
                      </div>
                    ))}
                  </div>
                  
                  {isPlanActive ? (
                    <button 
                      onClick={handleOpenPortal}
                      disabled={isOpeningPortal}
                      className="w-full bg-[#EB712B] text-white py-4 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 border-0 cursor-pointer outline-none"
                    >
                      {isOpeningPortal && <Loader2 size={16} className="animate-spin" />}
                      Manage on Stripe
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleCheckout(plan.id)} 
                      disabled={isStartingCheckout}
                      className="w-full bg-[#EB712B] hover:bg-[#ff8c4a] text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_10px_20px_-10px_rgba(235,113,43,0.5)] flex items-center justify-center gap-2 border-0 cursor-pointer outline-none disabled:opacity-50"
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

export default Subscription;
