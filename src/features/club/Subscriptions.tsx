import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import {
  useListClubSubscriptionQuery,
  useSubscribeToClubPlanMutation,
} from "@/features/subscriptions/api/subscriptionApiSlice";
import { useActiveClub } from "@/hooks/useActiveClub";

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
  list.push("Advanced Analytics & Reporting");
  list.push("Verified Pro Badge");
  return Array.from(new Set(list));
};

export default function Subscriptions() {
  const navigate = useNavigate();
  const container = useRef(null);

  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : undefined;

  // Get club subscription plans from API
  const { data: plans, isLoading: isLoadingPlans } = useListClubSubscriptionQuery(
    { clubId: clubId || 0 },
    { skip: !clubId }
  );

  const [subscribeToClubPlan, { isLoading: isProcessing }] = useSubscribeToClubPlanMutation();

  const handleSelectFree = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sessionStorage.setItem('selected_club_plan', 'free');
    navigate("/club-profile-setup");
  };

  const handleContinueWithPlan = (e: React.MouseEvent, plan: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!plan || !plan.id) return;
    sessionStorage.setItem('selected_club_plan', String(plan.id));
    toast.success(`Selected ${plan.name} plan!`);
    navigate("/club-profile-setup");
  };

  const handleCheckout = async (e: React.MouseEvent, planId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!clubId) {
      toast.error("Please create or select a club first before upgrading.");
      navigate("/club-profile-setup");
      return;
    }

    try {
      const origin = window.location.origin;
      const res = await subscribeToClubPlan({
        clubId,
        planId,
        successUrl: `${origin}/dashboard`,
        cancelUrl: window.location.href,
      }).unwrap();

      if (res?.checkoutUrl && typeof res.checkoutUrl === 'string' && res.checkoutUrl.startsWith('http')) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Could not initiate checkout.");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to start checkout");
      console.error(err);
    }
  };

  useGSAP(() => {
    gsap.fromTo(".card-reveal", 
      { opacity: 0, y: 40 }, 
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        stagger: 0.2, 
        ease: "power2.out" 
      }
    );
  }, { scope: container });

  const paidPlans = (plans || []).filter(
    (plan: any) => parseFloat(plan.price || '0') > 0 && !plan.name?.toLowerCase().includes('free')
  );

  return (
    <div ref={container} className="min-h-screen bg-[#111111] flex flex-col items-center justify-center p-6 md:p-12 font-sans selection:bg-[#EB712B] selection:text-white">
      
      {/* Header Section */}
      <div className="relative text-center mb-20 px-4">
        <h1
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text mb-6 tracking-tight uppercase"
          style={{
            backgroundImage: "linear-gradient(to bottom, #E2E8F0 0%, #94A3B8 50%, #EB712B 100%)",
            WebkitBackgroundClip: "text",
            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.3))",
          }}
        >
          Subscribe to Your Legacy
        </h1>

        <p className="text-gray-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-light">
          Choose the plan that aligns with your performance goals. Our tiers are designed to scale with your ambition.
        </p>
      </div>

      {isLoadingPlans ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#EB712B] mb-4" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Loading Subscription Plans...</p>
        </div>
      ) : (
        /* Subscription Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mb-16">
          
          {/* Free Plan */}
          <div className="card-reveal opacity-0 group bg-[#161616] border border-white/5 rounded-2xl p-8 flex flex-col transition-all duration-700 hover:border-white/20 hover:rounded-tr-[64px] hover:rounded-bl-[64px] hover:-translate-y-2 hover:shadow-2xl">
            <div className="mb-6">
              <span className="text-[11px] font-bold tracking-[0.2em] text-gray-500 uppercase">Entry</span>
              <h2 className="text-2xl font-bold text-white mt-1">Free Limited</h2>
              <div className="flex items-baseline gap-1 mt-3">
                <span className="text-4xl font-black tracking-tighter text-white">$0</span>
                <span className="text-gray-500 text-xs font-semibold">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {["2 Marketplace Items", "Public Community Access", "Standard Route Tracking"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-400 text-sm">
                  <Check size={16} className="text-gray-700" /> {item}
                </li>
              ))}
            </ul>

            <div className="pt-8 border-t border-white/5">
              <button 
                type="button"
                onClick={handleSelectFree} 
                className="w-full py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-all duration-300 cursor-pointer border-0 outline-none"
              >
                Continue with Free
              </button>
            </div>
          </div>

          {/* Gold Pass / Paid Plan(s) */}
          {paidPlans.map((plan: any) => {
            const planFeatures = getPlanFeatures(plan);

            return (
              <div 
                key={plan.id}
                className="card-reveal opacity-0 group bg-[#1a1a1a] border border-[#EB712B]/20 rounded-2xl p-8 flex flex-col relative overflow-hidden transition-all duration-700 hover:border-[#EB712B]/50 hover:rounded-tr-[64px] hover:rounded-bl-[64px] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(235,113,43,0.15)]"
              >
                <div className="absolute top-6 right-6 px-3 py-1 bg-[#EB712B]/10 text-[#EB712B] text-[10px] font-bold tracking-widest uppercase rounded-full border border-[#EB712B]/20">
                  Best Value
                </div>

                <div className="mb-6">
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#EB712B] uppercase">Pro Tier</span>
                  <h2 className="text-2xl font-bold text-white mt-1">{plan.name}</h2>
                  {plan.description && (
                    <p className="text-gray-400 text-xs mt-1 font-medium">{plan.description}</p>
                  )}
                  <div className="flex items-baseline gap-2 mt-3">
                    <h2 className="text-3xl font-bold text-white">${formatPlanPrice(plan.price)}</h2>
                    <span className="text-gray-500 text-xs">/ {plan.billingInterval || "year"}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {planFeatures.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-200 text-sm">
                      <Check size={16} className="text-[#EB712B]" /> {item}
                    </li>
                  ))}
                </ul>

                <div className="pt-8 border-t border-white/10 space-y-2.5">
                  <button 
                    type="button"
                    onClick={(e) => handleContinueWithPlan(e, plan)} 
                    className="w-full py-3 rounded-xl bg-[#EB712B] text-white text-sm font-semibold transition-all duration-300 hover:bg-[#d16226] flex items-center justify-center gap-2 shadow-[0_8px_16px_-4px_rgba(235,113,43,0.4)] border-0 outline-none cursor-pointer"
                  >
                    Select Plan & Continue <ArrowRight size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleCheckout(e, plan.id)} 
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-transparent text-gray-400 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border border-white/10 hover:border-white/20 flex items-center justify-center gap-1.5"
                  >
                    {isProcessing ? (
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

      {/* Footer Navigation */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 gap-6">
        <button
          onClick={() => navigate("/club-profile-setup")}
          className="flex items-center gap-2 text-gray-500 text-xs font-medium hover:text-white transition-colors border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Profile
        </button>
      </div>
    </div>
  );
}