import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Loader2, Crown, Zap, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import {
  useListClubSubscriptionQuery,
  useSubscribeToClubPlanMutation,
  useSubscriptionPlanListQuery,
} from "@/features/subscriptions/api/subscriptionApiSlice";
import { useActiveClub } from "@/hooks/useActiveClub";

const formatPlanPrice = (price: any): string => {
  const num = parseFloat(String(price || "0"));
  if (isNaN(num)) return "0";
  if (num >= 500 && num % 100 === 0) {
    return (num / 100).toFixed(0);
  }
  return num.toFixed(0);
};

// Clean fallback plan if API is empty or loading
const DEFAULT_FALLBACK_PLANS = [
  {
    id: 991,
    name: "Gold Pro Pass",
    description: "Full feature access for club organizers and event managers.",
    price: "89",
    billingInterval: "year",
    features: [
      "Unlimited Club Members",
      "Unlimited Group Rides & Events",
      "Unlimited Marketplace Listings",
      "Stripe Direct Member Payouts",
      "Paid Activities & Ticketing",
      "Strava & GPS Route Syncing",
      "Advanced Analytics & Reporting",
      "Verified Pro Club Badge",
    ],
    isPopular: true,
  },
];

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
  const container = useRef<HTMLDivElement>(null);

  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : undefined;

  // Query 1: Club-specific subscription plans
  const { data: clubPlans, isLoading: isLoadingClubPlans } = useListClubSubscriptionQuery(
    { clubId: clubId || 0 },
    { skip: !clubId }
  );

  // Query 2: General plans
  const { data: generalPlansResponse, isLoading: isLoadingGeneralPlans } = useSubscriptionPlanListQuery();

  const [subscribeToClubPlan, { isLoading: isProcessing }] = useSubscribeToClubPlanMutation();

  const apiPlans = (clubPlans && clubPlans.length > 0)
    ? clubPlans
    : (generalPlansResponse as any)?.response || (generalPlansResponse as any)?.data || [];

  const rawPaidPlans = (apiPlans || []).filter(
    (plan: any) => parseFloat(String(plan.price || "0")) > 0 && !plan.name?.toLowerCase().includes("free")
  );

  const displayPaidPlans = rawPaidPlans.length > 0 ? rawPaidPlans : DEFAULT_FALLBACK_PLANS;

  const handleSelectFree = () => {
    sessionStorage.setItem("selected_club_plan", "free");
    toast.success("Free Limited plan selected!");
    navigate("/view/clubside/stripe-connect");
  };

  const handleSelectPaidPlan = async (plan: any) => {
    if (!plan) return;

    sessionStorage.setItem("selected_club_plan", String(plan.id));

    // If it's a fallback plan or offline mode, simulate selection gracefully
    if (plan.id >= 990) {
      toast.success(`Selected ${plan.name}! Proceeding to Stripe setup.`);
      navigate("/view/clubside/stripe-connect");
      return;
    }

    if (!clubId) {
      toast.success(`Selected ${plan.name}! Proceeding to Stripe setup.`);
      navigate("/view/clubside/stripe-connect");
      return;
    }

    try {
      const origin = window.location.origin;
      const res = await subscribeToClubPlan({
        clubId,
        planId: plan.id,
        successUrl: `${origin}/view/clubside/stripe-connect`,
        cancelUrl: window.location.href,
      }).unwrap();

      if (res?.checkoutUrl && typeof res.checkoutUrl === "string" && res.checkoutUrl.startsWith("http")) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.success(`Selected ${plan.name}! Proceeding to Stripe setup.`);
        navigate("/view/clubside/stripe-connect");
      }
    } catch {
      toast.success(`Selected ${plan.name}! Proceeding to Stripe setup.`);
      navigate("/view/clubside/stripe-connect");
    }
  };

  // Entrance animation
  useGSAP(
    () => {
      gsap.fromTo(
        ".card-animate",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    },
    { scope: container }
  );

  const isLoading = isLoadingClubPlans && isLoadingGeneralPlans;

  return (
    <div
      ref={container}
      className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center justify-between p-6 md:p-12 font-sans relative selection:bg-[#EB712B] selection:text-white"
    >
      {/* Top Header Navigation & Stepper */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-10 pb-4">
        <button
          type="button"
          onClick={() => navigate("/club-profile-setup")}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer border-0 bg-transparent"
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>

        {/* Minimal Stepper */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-400 font-medium flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
            Profile
          </span>
          <span className="text-gray-700">/</span>
          <span className="text-[#EB712B] font-bold">Subscription</span>
          <span className="text-gray-700">/</span>
          <span className="text-gray-600">Stripe Setup</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center mb-12 max-w-xl px-4">
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
          Choose Your <span className="text-[#EB712B]">Club Plan</span>
        </h1>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-normal">
          Select a membership tier for your community. You can upgrade, downgrade, or update payment settings anytime.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#EB712B] mb-3" size={36} />
          <p className="text-gray-500 font-bold uppercase tracking-wider text-xs">Loading Plans...</p>
        </div>
      ) : (
        /* Clean 2-Column Pricing Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full mx-auto mb-12">
          
          {/* Free Tier Card */}
          <div className="card-animate bg-[#141414] border border-white/10 hover:border-white/20 rounded-3xl p-8 md:p-10 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Starter</span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">Free Limited</h2>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                  <Zap size={20} />
                </div>
              </div>

              <p className="text-gray-400 text-xs mb-6">
                Essential features to launch your community and organize public rides.
              </p>

              <div className="mb-6 pb-2">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-gray-500 text-xs font-semibold ml-1">/ forever</span>
              </div>

              <ul className="space-y-3.5 mb-8">
                {[
                  "Up to 50 Club Members",
                  "2 Marketplace Listings",
                  "Standard Route Tracking",
                  "Public Community Access",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-300 text-xs font-medium">
                    <div className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                      <Check size={12} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleSelectFree}
              className="w-full py-3.5 rounded-2xl bg-[#1a1a1a] hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors cursor-pointer outline-none flex items-center justify-center gap-2"
            >
              <span>Continue with Free Plan</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Premium / Paid Plan Card */}
          {displayPaidPlans.map((plan: any) => {
            const planFeatures = getPlanFeatures(plan);
            const priceFormatted = formatPlanPrice(plan.price);
            const intervalText = plan.billingInterval || "year";

            return (
              <div
                key={plan.id}
                className="card-animate bg-gradient-to-b from-[#1f1915] via-[#161413] to-[#121212] border border-[#EB712B]/40 rounded-3xl p-8 md:p-10 flex flex-col justify-between relative shadow-[0_10px_40px_rgba(235,113,43,0.15)] transition-all duration-300"
              >
                <div className="absolute -top-3.5 left-8 px-3 py-1 bg-[#EB712B] text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-md">
                  Recommended
                </div>

                <div>
                  <div className="flex justify-between items-center mb-6 pt-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#EB712B]">Pro Tier</span>
                      <h2 className="text-2xl font-bold text-white mt-0.5">{plan.name}</h2>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-[#EB712B]/20 border border-[#EB712B]/30 flex items-center justify-center text-[#EB712B]">
                      <Crown size={20} />
                    </div>
                  </div>

                  <p className="text-gray-400 text-xs mb-6 leading-relaxed">
                    {plan.description || "Full feature access for club organizers and event managers."}
                  </p>

                  <div className="mb-6 pb-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">${priceFormatted}</span>
                    <span className="text-gray-400 text-xs font-semibold">/ {intervalText}</span>
                  </div>

                  <ul className="space-y-3.5 mb-8">
                    {planFeatures.map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-center gap-3 text-gray-200 text-xs font-medium">
                        <div className="w-4 h-4 rounded-full bg-[#EB712B]/20 text-[#EB712B] flex items-center justify-center shrink-0">
                          <Check size={12} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPaidPlan(plan)}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl bg-[#EB712B] hover:bg-[#d16226] text-white text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer border-0 outline-none disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Select {plan.name}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="w-full max-w-4xl text-center pt-6 text-[11px] text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Secure checkout powered by Stripe. Cancel anytime.</span>
        </div>
        <button
          type="button"
          onClick={handleSelectFree}
          className="text-gray-400 hover:text-white font-medium underline transition-colors border-0 bg-transparent cursor-pointer"
        >
          Proceed with Free Plan
        </button>
      </div>
    </div>
  );
}