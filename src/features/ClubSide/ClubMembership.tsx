/**
 * @fileoverview ClubMembership — dual-mode page for membership plans.
 *
 * Flutter equivalent:
 * - Owner: createClubMembershipPlan / listMembershipPlans / deleteMembershipPlan
 * - Athlete: subscribeToMembershipPlan / getMyMembershipInfo / listMembershipPlans
 *
 * Architecture:
 * - Role detection via useClubPermissions
 * - If isOwner → shows "Manage Plans" UI (create/edit/delete)
 * - If member → shows "Subscribe" UI (view plans + subscribe button)
 * - clubId always from useActiveClub (Redux)
 */
import React, { useState } from 'react';
import {
  Crown,
  Plus,
  Trash2,
  Check,
  Loader2,
  CreditCard,
  Star,
  X,
  Edit2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import {
  useListMembershipPlansQuery,
  useCreateClubMembershipPlanMutation,
  useUpdateClubMembershipPlanMutation,
  useDeleteMembershipPlanMutation,
  useGetMyMembershipInfoQuery,
  useSubscribeToMembershipPlanMutation,
} from '@/features/club/api/membershipApiSlice';
import {
  useCheckStripeAccountStatusQuery,
  useConnectStripeMutation,
} from '@/features/club/api/stripeApiSlice';

// ── Plan Form (owner) ─────────────────────────────────────────────────────────

interface PlanFormProps {
  clubId: number;
  plan?: any;
  onClose: () => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ clubId, plan, onClose }) => {
  const isEditing = !!plan;
  const [name, setName] = useState(plan?.name || '');
  const [price, setPrice] = useState(plan?.price?.toString() || '');
  const [duration, setDuration] = useState(plan?.duration || '1 Month');
  const [autoRenew, setAutoRenew] = useState(plan?.autoRenew ?? true);
  const [features, setFeatures] = useState<string[]>(plan?.features || []);
  const [featureInput, setFeatureInput] = useState('');

  const [createPlan, { isLoading: isCreating }] = useCreateClubMembershipPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateClubMembershipPlanMutation();
  const isBusy = isCreating || isUpdating;

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeatures((prev) => [...prev, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      const isYearly = duration.toLowerCase().includes('year') || duration.toLowerCase().includes('12');
      const payload = {
        clubId,
        name: name.trim(),
        price: Number(price),
        currency: 'USD',
        billingInterval: isYearly ? 'yearly' : 'monthly',
        discountPercent: 0,
        autoRenew,
        features,
      };
      if (isEditing) {
        await updatePlan({ ...payload, planId: plan.id }).unwrap();
        toast.success('Plan updated successfully!');
      } else {
        await createPlan(payload).unwrap();
        toast.success('Plan created successfully!');
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to save plan.');
    }
  };

  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <form
        onSubmit={handleSubmit}
        className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-lg relative border border-border shadow-2xl space-y-5"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-wider text-text-main">
            {isEditing ? 'Edit Plan' : 'Create Membership Plan'}
          </h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Plan Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
              placeholder="e.g. Premium Monthly"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Price (USD) *</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
              placeholder="29.99"
              min="0"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs text-text-main outline-none focus:border-[#EB712B]"
            >
              {['1 Month', '3 Months', '6 Months', '12 Months'].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 flex items-center justify-between p-3 bg-main-bg border border-border rounded-xl">
            <div>
              <p className="text-xs font-bold text-text-main">Auto-Renew</p>
              <p className="text-[10px] text-text-muted">Automatically renew when plan expires</p>
            </div>
            <button
              type="button"
              onClick={() => setAutoRenew((p: boolean) => !p)}
              className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${autoRenew ? 'bg-[#EB712B]' : 'bg-border'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${autoRenew ? 'left-5' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">Features</label>
          <div className="space-y-2 mb-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-main-bg border border-border rounded-xl px-3 py-2">
                <span className="text-xs text-text-main">{f}</span>
                <button
                  type="button"
                  onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-text-muted hover:text-red-500 cursor-pointer ml-2"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              className="flex-1 bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
              placeholder="Add a feature..."
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-3 bg-surface border border-border rounded-xl text-xs font-bold text-text-muted hover:text-text-main hover:border-[#EB712B]/40 transition-colors cursor-pointer"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="flex-1 py-3 bg-surface border border-border text-text-main text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="flex-1 py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0 outline-none disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isBusy && <Loader2 size={14} className="animate-spin" />}
            {isBusy ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── Owner View ─────────────────────────────────────────────────────────────────

const OwnerMembershipView: React.FC<{ clubId: number }> = ({ clubId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const { data: plansData, isLoading } = useListMembershipPlansQuery({ clubId });
  const [deletePlan, { isLoading: isDeleting }] = useDeleteMembershipPlanMutation();

  // ✅ Check Stripe status — warn owner if Stripe not connected
  const { data: stripeStatus } = useCheckStripeAccountStatusQuery({ clubId });
  const isStripeConnected = stripeStatus?.connected || stripeStatus?.status === 'active';
  const [connectStripe, { isLoading: isConnectingStripe }] = useConnectStripeMutation();

  const handleConnectStripe = async () => {
    if (!clubId) return;
    try {
      const result = await connectStripe({ clubId: Number(clubId) }).unwrap();
      const url = result?.onboardingUrl || (result as any)?.url || (result as any)?.response?.onboardingUrl || (result as any)?.response?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.success('Stripe connection initiated!');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to initiate Stripe connection.');
    }
  };

  const plans = plansData || [];

  const handleDelete = async (planId: number) => {
    try {
      await deletePlan({ planId }).unwrap();
      toast.success('Plan deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete plan.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Stripe warning banner */}
      {!isStripeConnected && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
          <CreditCard size={18} className="text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-400">Stripe Not Connected</p>
            <p className="text-[10px] text-amber-400/70 mt-0.5">
              Connect a Stripe account to accept membership payments from athletes.
            </p>
          </div>
          <button
            onClick={handleConnectStripe}
            disabled={isConnectingStripe}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 border-0 outline-none"
          >
            {isConnectingStripe && <Loader2 size={12} className="animate-spin" />}
            {isConnectingStripe ? 'Connecting...' : 'Connect Stripe'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-main">Membership Plans</h2>
          <p className="text-xs text-text-muted mt-1">{plans.length} plan{plans.length !== 1 ? 's' : ''} created</p>
        </div>
        <button
          onClick={() => { setEditingPlan(null); setShowForm(true); }}
          className="px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0 flex items-center gap-2"
        >
          <Plus size={14} /> Add Plan
        </button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-3xl p-8 animate-pulse space-y-4">
              <div className="w-1/2 h-5 bg-[#222] rounded" />
              <div className="w-1/3 h-8 bg-[#222] rounded" />
              <div className="space-y-2">{[1, 2, 3].map((j) => <div key={j} className="w-full h-3 bg-[#222] rounded" />)}</div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-surface border border-dashed border-border rounded-3xl p-16 text-center space-y-4">
          <Crown size={40} className="text-[#EB712B] mx-auto opacity-50" />
          <h3 className="text-lg font-bold text-text-main">No Membership Plans Yet</h3>
          <p className="text-sm text-text-muted">Create your first plan for athletes to subscribe to.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-[#EB712B] text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border-0"
          >
            Create First Plan
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan: any) => (
            <div key={plan.id} className="bg-surface border border-border rounded-3xl p-6 space-y-4 relative group hover:border-[#EB712B]/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-text-main">{plan.name}</h3>
                  <p className="text-xs text-text-muted mt-1">{plan.duration} · {plan.autoRenew ? 'Auto-renew' : 'No auto-renew'}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setEditingPlan(plan); setShowForm(true); }}
                    className="p-2 rounded-xl bg-surface hover:bg-hover border border-border text-text-muted hover:text-[#EB712B] transition-colors cursor-pointer"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    disabled={isDeleting}
                    className="p-2 rounded-xl bg-surface hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-muted hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="text-3xl font-black text-[#EB712B]">
                ${plan.price} <span className="text-sm text-text-muted font-medium">/ {plan.duration}</span>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="space-y-2">
                  {plan.features.map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                      <Check size={12} className="text-[#EB712B]" />
                      {f}
                    </div>
                  ))}
                </div>
              )}

              {/* Subscriber count */}
              <div className="pt-3 border-t border-border flex items-center gap-2 text-[10px] text-text-muted">
                <Users size={12} />
                <span>Subscriber data available in Members tab</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PlanForm
          clubId={clubId}
          plan={editingPlan}
          onClose={() => { setShowForm(false); setEditingPlan(null); }}
        />
      )}
    </div>
  );
};

// ── Athlete View ───────────────────────────────────────────────────────────────

const AthleteMembershipView: React.FC<{ clubId: number }> = ({ clubId }) => {
  const [subscribingId, setSubscribingId] = useState<number | null>(null);

  const { data: plansData, isLoading: isLoadingPlans } = useListMembershipPlansQuery({ clubId });
  const { data: myMembership, isLoading: isLoadingMine } = useGetMyMembershipInfoQuery({ clubId });
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeToMembershipPlanMutation();

  const plans = plansData || [];
  const activePlanId = myMembership?.planId;
  const isSubscribed = myMembership && myMembership.status === 'active';

  const handleSubscribe = async (planId: number) => {
    setSubscribingId(planId);
    try {
      await subscribe({ clubId, planId }).unwrap();
      toast.success('Successfully subscribed to plan!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to subscribe.');
    } finally {
      setSubscribingId(null);
    }
  };

  if (isLoadingPlans || isLoadingMine) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active membership banner */}
      {isSubscribed && (
        <div className="bg-[#EB712B]/10 border border-[#EB712B]/30 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#EB712B]/20 rounded-2xl flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-[#EB712B]" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#EB712B]">Active Membership</p>
            <p className="text-sm font-bold text-text-main mt-0.5">
              {myMembership?.plan?.name || 'Club Member'}
            </p>
            {myMembership?.currentPeriodEnd && (
              <p className="text-[10px] text-text-muted mt-0.5">
                Expires: {new Date(myMembership.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-xl font-bold text-text-main mb-2">Available Plans</h2>
        <p className="text-xs text-text-muted mb-6">Choose a membership plan to unlock club benefits.</p>

        {plans.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center">
            <Crown size={36} className="text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold text-text-muted">No membership plans available yet.</p>
            <p className="text-xs text-text-muted mt-1">Check back later or contact the club owner.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: any) => {
              const isActive = activePlanId === plan.id && isSubscribed;
              const isBusy = isSubscribing && subscribingId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`bg-surface border rounded-3xl p-6 space-y-5 relative transition-all duration-300 ${
                    isActive
                      ? 'border-[#EB712B] shadow-[0_0_30px_rgba(235,113,43,0.15)]'
                      : 'border-border hover:border-[#EB712B]/30'
                  }`}
                >
                  {isActive && (
                    <div className="absolute -top-3 left-6 bg-[#EB712B] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <Star size={9} /> Current Plan
                    </div>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-text-main">{plan.name}</h3>
                    <p className="text-xs text-text-muted mt-1">{plan.duration} · {plan.autoRenew ? 'Auto-renew' : 'One-time'}</p>
                  </div>

                  <div className="text-3xl font-black text-[#EB712B]">
                    ${plan.price} <span className="text-sm text-text-muted font-medium">/ {plan.duration}</span>
                  </div>

                  {plan.features && plan.features.length > 0 && (
                    <div className="space-y-2">
                      {plan.features.map((f: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                          <Check size={12} className="text-[#EB712B]" /> {f}
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isActive || isBusy}
                    className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-0 flex items-center justify-center gap-2 ${
                      isActive
                        ? 'bg-[#EB712B]/20 text-[#EB712B] cursor-not-allowed'
                        : 'bg-[#EB712B] hover:bg-[#d05c19] text-white hover:shadow-[0_10px_20px_-10px_rgba(235,113,43,0.5)]'
                    } disabled:opacity-60`}
                  >
                    {isBusy && <Loader2 size={14} className="animate-spin" />}
                    {isActive ? 'Current Plan' : (isBusy ? 'Subscribing...' : 'Subscribe Now')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────

const ClubMembership: React.FC = () => {
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);

  if (!clubId) {
    return (
      <div className="min-h-screen bg-main-bg text-text-main p-8 flex items-center justify-center">
        <div className="bg-surface border border-border rounded-3xl p-12 text-center max-w-md space-y-4">
          <Crown size={40} className="text-text-muted mx-auto opacity-40" />
          <h2 className="text-xl font-bold text-text-main">No Club Selected</h2>
          <p className="text-sm text-text-muted">Select a club to view membership plans.</p>
        </div>
      </div>
    );
  }

  if (permissions.isLoading) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg text-text-main p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="border-b border-border pb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center justify-center">
              <Crown size={22} className="text-[#EB712B]" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#EB712B]">
                {permissions.isOwner ? 'Club Management' : 'Athlete Hub'}
              </span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-text-main">
                Club Membership
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-muted max-w-2xl">
            {permissions.isOwner
              ? 'Create and manage membership plans for your athletes. Set pricing, duration, and included features.'
              : 'Subscribe to a membership plan to access premium club features and benefits.'}
          </p>
        </div>

        {/* ✅ Role-gated views — mirrors Flutter's conditional rendering */}
        {permissions.isOwner ? (
          <OwnerMembershipView clubId={Number(clubId)} />
        ) : (
          <AthleteMembershipView clubId={Number(clubId)} />
        )}
      </div>
    </div>
  );
};

export default ClubMembership;
