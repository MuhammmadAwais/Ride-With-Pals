import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Lock, Crown, Car, Sparkles, Loader2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { toast } from "sonner";
import {
  useSubscriptionPlanListQuery,
  useSubscribeToAnyPlanMutation,
} from "@/features/subscriptions/api/subscriptionApiSlice";

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

const AuthSubscription = () => {
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const [selectedPlan, setSelectedPlan] = useState<string>("yearly");
  const [subscribingId, setSubscribingId] = useState<number | null>(null);

  // Get SaaS subscription plans from API
  const { data: plansResponse, isLoading: isLoadingPlans } = useSubscriptionPlanListQuery();
  const plans = plansResponse?.rows || [];

  const [subscribeToAnyPlan] = useSubscribeToAnyPlanMutation();

  const paidPlans = plans.filter(
    (p: any) => parseFloat(String(p.price || '0')) > 0 && !p.name?.toLowerCase().includes('free')
  );

  const handleSelectFree = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sessionStorage.setItem('selected_subscription_plan', 'free');
    if (user?.role === 'owner' || user?.role === 'organizer') {
      navigate("/club-profile-setup");
    } else {
      navigate("/create-profile");
    }
  };

  const handleContinueWithPlan = (e: React.MouseEvent, plan: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!plan || !plan.id) return;
    if (parseFloat(String(plan.price || '0')) === 0) {
      handleSelectFree();
      return;
    }
    // Save selected plan and continue onboarding without forcing Stripe redirect
    sessionStorage.setItem('selected_subscription_plan', String(plan.id));
    toast.success(`Selected ${plan.name} plan!`);
    if (user?.role === 'owner' || user?.role === 'organizer') {
      navigate("/club-profile-setup");
    } else {
      navigate("/create-profile");
    }
  };

  const handleStripeCheckout = async (e: React.MouseEvent, plan: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!plan || !plan.id) return;
    if (parseFloat(String(plan.price || '0')) === 0) {
      handleSelectFree();
      return;
    }

    setSubscribingId(plan.id);
    try {
      const res = await subscribeToAnyPlan({ planId: plan.id }).unwrap();
      if (res?.checkoutUrl && typeof res.checkoutUrl === 'string' && res.checkoutUrl.startsWith('http')) {
        window.location.href = res.checkoutUrl; // Redirect to Stripe
      } else {
        toast.error("Could not initiate checkout.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start checkout");
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-x-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#EB712B]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        
        {/* Top Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-[#141414] border border-[#262626] text-gray-300 text-[11px] font-bold px-5 py-2 rounded-full uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-[#EB712B]" /> Subscription Portal
          </span>
          <h1 className="text-5xl font-extrabold mt-8 mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
            Subscription Plans
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed font-medium">
            Choose the tier that fuels your performance goals. Unlock advanced tracking, marketplace perks, and elite community status.
          </p>
        </div>

        {isLoadingPlans ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#EB712B] mb-4" size={48} />
            <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Loading Subscription Plans...</p>
          </div>
        ) : (
          /* Plans Grid */
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* FREE LIMITED PLAN */}
            <div 
              onClick={() => setSelectedPlan("free")}
              className={`bg-[#121212] border rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden ${
                selectedPlan === "free" 
                  ? "border-[#EB712B] shadow-xl shadow-[#EB712B]/10 scale-[1.02]" 
                  : "border-[#1f1f1f] hover:border-[#333333] hover:scale-[1.01]"
              }`}
            >
              <div>
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest block mb-3 bg-[#1a1a1a] px-3 py-1 rounded-md w-max">
                  Basic Tier
                </span>
                <h2 className="text-2xl font-black mb-1 tracking-tight">Free Limited Plan</h2>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-5xl font-black tracking-tighter">$0</span>
                  <span className="text-gray-500 text-sm font-semibold">/month</span>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-[#EB712B]/10 flex items-center justify-center text-[#EB712B] shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                    2 items in Marketplace
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-[#EB712B]/10 flex items-center justify-center text-[#EB712B] shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                    Basic ride tracking
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-300">
                    <span className="w-6 h-6 rounded-full bg-[#EB712B]/10 flex items-center justify-center text-[#EB712B] shrink-0">
                      <Check className="w-4 h-4" />
                    </span>
                    Public club access
                  </li>
                  <li className="flex items-center gap-3 text-sm font-medium text-gray-600">
                    <span className="w-6 h-6 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-700 border border-[#262626] shrink-0">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    Advanced Performance Analytics
                  </li>
                </ul>
              </div>

              <button 
                type="button"
                onClick={(e) => handleSelectFree(e)}
                className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 border cursor-pointer ${
                  selectedPlan === "free"
                    ? "bg-white text-black border-white hover:bg-gray-200"
                    : "bg-[#1a1a1a] text-gray-300 border-[#333333] hover:bg-[#222]"
                }`}
              >
                Continue with Free →
              </button>
            </div>

            {/* PAID SUBSCRIPTION PLAN(S) */}
            {paidPlans.map((plan: any) => {
              const planFeatures = getPlanFeatures(plan);
              const isSelected = selectedPlan === String(plan.id) || selectedPlan === "yearly";

              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(String(plan.id))}
                  className={`relative bg-[#121212] border-2 rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer overflow-hidden shadow-2xl ${
                    isSelected 
                      ? "border-[#EB712B] shadow-[#EB712B]/10 scale-[1.02]" 
                      : "border-[#262626] hover:border-[#EB712B]/50 hover:scale-[1.01]"
                  }`}
                >
                  {/* Animated Glow Accent / Popular Tag */}
                  <div className="absolute top-0 right-8 flex items-center gap-2">
                    <span className="animate-pulse bg-[#EB712B] text-white text-[9px] font-extrabold px-3 py-1 rounded-b-lg uppercase tracking-wider shadow-md">
                      Save 20%
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-extrabold text-[#EB712B] uppercase tracking-widest block bg-[#EB712B]/10 px-3 py-1 rounded-md">
                        Elite Performance
                      </span>
                      <div className="flex gap-1.5 text-[#EB712B] bg-[#1a1a1a] p-2 rounded-xl border border-[#262626]">
                        <Car className="w-5 h-5" /> 
                        <Crown className="w-5 h-5" />
                      </div>
                    </div>
                    
                    <h2 className="text-2xl font-black mb-1 tracking-tight">{plan.name}</h2>
                    {plan.description && (
                      <p className="text-gray-400 text-xs mb-3 font-medium">{plan.description}</p>
                    )}
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-5xl font-black tracking-tighter">${formatPlanPrice(plan.price)}</span>
                      <span className="text-gray-500 text-sm font-semibold">/{plan.billingInterval || "year"}</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {planFeatures.map((feat: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-sm font-medium text-gray-200">
                          <span className="w-6 h-6 rounded-full bg-[#EB712B]/10 flex items-center justify-center text-[#EB712B] shrink-0">
                            <Check className="w-4 h-4" />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <button 
                      type="button"
                      onClick={(e) => handleContinueWithPlan(e, plan)}
                      className="w-full py-4 bg-[#EB712B] text-white rounded-2xl font-extrabold hover:bg-[#d16226] transition-all duration-300 cursor-pointer shadow-lg shadow-[#EB712B]/20 flex items-center justify-center gap-2 tracking-wide hover:translate-y-[-1px] border-0 outline-none"
                    >
                      Select Plan & Continue →
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleStripeCheckout(e, plan)}
                      disabled={subscribingId !== null}
                      className="w-full py-2.5 bg-transparent text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border border-white/10 hover:border-white/20 flex items-center justify-center gap-1.5"
                    >
                      {subscribingId === plan.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        "Pay Now with Stripe"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

          </div>
        )}
        
        <p className="text-center text-xs text-gray-500 mt-8 font-semibold">
          No hidden fees. You can upgrade or downgrade your plan at any time.
        </p>
      </div>
    </div>
  );
};

export default AuthSubscription;