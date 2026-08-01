import React, { useState } from 'react';
import { Crown, Check, Loader2, X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  useListMembershipPlansQuery,
  useGetMyMembershipInfoQuery,
  useSubscribeToMembershipPlanMutation,
} from '@/features/club/api/membershipApiSlice';

interface ClubMembershipModalProps {
  clubId: number;
  isOpen: boolean;
  onClose: () => void;
}

const fmtCurrency = (amount: number, currency = 'EUR') => {
  const sym: Record<string, string> = { EUR: '€', USD: '$', GBP: '£' };
  return `${sym[currency] || ''}${Number(amount).toFixed(2)}`;
};

const fmtDate = (d?: string | Date | null) =>
  d
    ? new Date(d).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export const ClubMembershipModal: React.FC<ClubMembershipModalProps> = ({
  clubId,
  isOpen,
  onClose,
}) => {
  const [subscribingId, setSubscribingId] = useState<number | null>(null);

  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useListMembershipPlansQuery({ clubId }, { skip: !isOpen });

  const {
    data: myInfo,
    isLoading: myInfoLoading,
    refetch: refetchMyInfo,
  } = useGetMyMembershipInfoQuery({ clubId }, { skip: !isOpen });

  const [subscribe] = useSubscribeToMembershipPlanMutation();

  if (!isOpen) return null;

  const plans: any[] = plansData || [];
  const currentStatus = myInfo?.status || 'none';
  const myPlanId = myInfo?.planId || myInfo?.plan?.id;

  const handleSubscribe = async (plan: any) => {
    setSubscribingId(plan.id);
    try {
      await subscribe({
        clubId: Number(clubId),
        planId: plan.id,
      }).unwrap();
      toast.success(`Successfully subscribed to ${plan.name}!`);
      refetchMyInfo();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to subscribe to membership plan.');
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[80] p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#EB712B]/20 to-[#EB712B]/5 border border-[#EB712B]/30 rounded-2xl flex items-center justify-center text-[#EB712B] shadow-sm">
              <Crown size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EB712B]">
                Official Membership
              </span>
              <h3 className="text-xl font-black text-text-main tracking-tight">
                Club Membership Plans
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-hover transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Membership Status Banner */}
        {!myInfoLoading && (
          <div className="bg-main-bg border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  currentStatus === 'active'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : currentStatus === 'pending_payment'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'bg-slate-500/15 text-slate-400'
                }`}
              >
                {currentStatus === 'active' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Your Current Membership Status
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs font-black uppercase ${
                      currentStatus === 'active'
                        ? 'text-emerald-400'
                        : currentStatus === 'pending_payment'
                        ? 'text-amber-400'
                        : 'text-text-main'
                    }`}
                  >
                    {currentStatus === 'active'
                      ? 'Active Member'
                      : currentStatus === 'pending_payment'
                      ? 'Pending Payment'
                      : 'No Active Membership'}
                  </span>
                  {myInfo?.plan?.name && (
                    <span className="text-xs font-bold text-text-muted">
                      ({myInfo.plan.name})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {myInfo?.currentPeriodEnd && (
              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Valid Until
                </p>
                <p className="text-xs font-bold text-text-main mt-0.5">
                  {fmtDate(myInfo.currentPeriodEnd)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Membership Plans List */}
        <div className="space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-text-muted">
            Available Membership Plans
          </h4>

          {plansLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 size={32} className="animate-spin text-[#EB712B]" />
              <p className="text-xs font-bold text-text-muted">
                Loading plans...
              </p>
            </div>
          ) : plansError ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400 text-xs font-bold flex items-center justify-center gap-2">
              <AlertCircle size={16} /> Failed to load club membership plans.
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-main-bg border border-dashed border-border rounded-2xl p-10 text-center space-y-2">
              <Crown size={36} className="text-text-muted mx-auto opacity-30" />
              <p className="text-sm font-bold text-text-main">
                No Membership Fee Plans Offered
              </p>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                This club does not currently require a paid membership fee plan for athletes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {plans.map((plan: any) => {
                const isCurrentPlan = myPlanId === plan.id;
                const isSubscribingThis = subscribingId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`bg-main-bg border rounded-2xl p-5 transition-all ${
                      isCurrentPlan
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-border hover:border-[#EB712B]/40'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Plan Title & Features */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-base font-black text-text-main">
                            {plan.name}
                          </h5>
                          {isCurrentPlan && (
                            <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 size={11} /> Current Plan
                            </span>
                          )}
                        </div>

                        {plan.features && plan.features.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {plan.features.map((feature: string, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border rounded-xl text-xs text-text-main font-medium"
                              >
                                <Check
                                  size={12}
                                  className="text-[#EB712B] shrink-0"
                                />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {plan.endDate && (
                          <p className="text-[10px] text-text-muted">
                            Plan validity period ends on{' '}
                            <span className="font-bold">
                              {fmtDate(plan.endDate)}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Right: Price & Button */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border">
                        <div className="text-left md:text-right">
                          <div className="text-xl font-black text-text-main">
                            {fmtCurrency(plan.price, plan.currency)}
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-text-muted capitalize">
                            / {plan.billingInterval}
                          </div>
                        </div>

                        {isCurrentPlan ? (
                          <button
                            type="button"
                            disabled
                            className="px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black rounded-xl cursor-not-allowed flex items-center gap-1.5"
                          >
                            <CheckCircle2 size={14} /> Subscribed
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSubscribe(plan)}
                            disabled={subscribingId !== null}
                            className="px-6 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black rounded-xl cursor-pointer transition-all shadow-md shadow-[#EB712B]/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                          >
                            {isSubscribingThis ? (
                              <>
                                <Loader2
                                  size={14}
                                  className="animate-spin text-white"
                                />
                                Subscribing...
                              </>
                            ) : (
                              'Subscribe Now'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-main-bg border border-border hover:bg-hover text-text-main text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
