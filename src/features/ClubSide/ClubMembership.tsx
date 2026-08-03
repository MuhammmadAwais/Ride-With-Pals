/**
 * @fileoverview ClubMembership — complete membership management page.
 *
 * Owner tabs (matches mobile app):
 *  1. Overview  — stats + plan cards with quick edit/delete
 *  2. Send Requests — bulk payment reminder notifications
 *  3. Members   — full list with status filters + per-member action sheet
 *
 * Athlete view — list available plans + subscribe + active membership banner
 */
import React, { useState } from 'react';
import {
  Crown,
  Plus,
  Trash2,
  Check,
  Loader2,
  CreditCard,
  AlertCircle,
  X,
  Edit2,
  Users,
  Bell,
  BellRing,
  Send,
  CheckCircle2,
  Clock,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Percent,
  ArrowLeftRight,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import {
  useListMembershipPlansQuery,
  useGetMembershipPlanInfoByIDQuery,
  useCreateClubMembershipPlanMutation,
  useUpdateClubMembershipPlanMutation,
  useDeleteMembershipPlanMutation,
  useGetClubMembershipOverviewQuery,
  useListSubscribedMemberQuery,
  useChangeClubMemberFeeStatusMutation,
  useExemptMemberFeeMutation,
  useChangeAssignedFeeMutation,
  useResetMembershipFeePendingMutation,
  useSendPaymentReminderNotificationMutation,
} from '@/features/club/api/membershipApiSlice';
import {
  useCheckStripeAccountStatusQuery,
  useConnectStripeMutation,
} from '@/features/club/api/stripeApiSlice';
import { useSendSubscriptionReminderMutation } from '@/features/subscriptions/api/subscriptionApiSlice';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Paid',       color: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/20' },
  paid:      { label: 'Paid',       color: 'text-green-400',  bg: 'bg-green-500/10 border border-green-500/20' },
  pending:   { label: 'Pending',    color: 'text-amber-400',  bg: 'bg-amber-500/10 border border-amber-500/20' },
  not_renewed:{ label: 'Not Renewed', color: 'text-red-400',  bg: 'bg-red-500/10 border border-red-500/20' },
  exempt:    { label: 'Exempt',     color: 'text-slate-400',  bg: 'bg-slate-500/10 border border-slate-500/20' },
  cancelled: { label: 'Cancelled',  color: 'text-red-400',   bg: 'bg-red-500/10 border border-red-500/20' },
};

const getStatusConfig = (row: any) => {
  if (row.isExempt || row.paymentStatus === 'exempt' || row.status === 'exempt') return STATUS_CONFIG.exempt;
  if (!row.planId && !row.plan) return { label: 'No Fee Assigned', color: 'text-slate-400', bg: 'bg-slate-500/10 border border-slate-500/20' };
  const key = row.paymentStatus || row.status || '';
  return STATUS_CONFIG[key.toLowerCase()] || { label: key || 'Unknown', color: 'text-text-muted', bg: 'bg-surface border border-border' };
};

const fmtDate = (d?: string | Date | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fmtCurrency = (amount: number, currency = 'EUR') => {
  const sym: Record<string,string> = { EUR: '€', USD: '$', GBP: '£' };
  return `${sym[currency] || ''}${Number(amount).toFixed(2)}`;
};

const initials = (name?: string) => (name || '?').split(' ').map((w) => w[0]).join('').substring(0, 2).toUpperCase();

// ─────────────────────────────────────────────────────────────────────────────
// PLAN DETAIL MODAL (view full plan details by ID)
// ─────────────────────────────────────────────────────────────────────────────

interface PlanDetailModalProps {
  clubId: number;
  planId: number;
  onClose: () => void;
  onEdit: (plan: any) => void;
  onDelete: (planId: number) => void;
}

const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  clubId,
  planId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { data: planData, isLoading, error } = useGetMembershipPlanInfoByIDQuery({
    clubId,
    planId,
  });
  const plan: any = (planData as any)?.data || (planData as any);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-surface border border-border rounded-3xl p-8 flex items-center gap-3 text-sm font-bold text-text-main shadow-2xl">
          <Loader2 size={20} className="animate-spin text-[#EB712B]" /> Loading Plan Details...
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
        <div className="bg-surface border border-border rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm font-bold text-text-main">Failed to load plan details</p>
          <button onClick={onClose} className="w-full py-2.5 bg-main-bg border border-border rounded-xl text-xs font-bold text-text-main hover:bg-hover transition-all cursor-pointer">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 w-full max-w-lg space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#EB712B]/15 rounded-2xl flex items-center justify-center text-[#EB712B]">
              <Crown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#EB712B]">Plan #{planId}</span>
                {plan.saveAsDraft && (
                  <span className="px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    Draft
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-text-main mt-0.5">{plan.name}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>

        {/* Pricing Banner */}
        <div className="bg-main-bg border border-border rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Fee Amount</p>
            <div className="text-3xl font-black text-[#EB712B] mt-0.5">
              {fmtCurrency(Number(plan.price) || 0, plan.currency)}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Billing Cycle</p>
            <span className="inline-block mt-1 px-3 py-1 bg-surface border border-border rounded-xl text-xs font-bold capitalize text-text-main">
              {plan.billingInterval}
            </span>
          </div>
        </div>

        {/* Configuration details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-main-bg/50 border border-border/60 rounded-2xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Auto Renew</p>
            <p className="text-xs font-bold text-text-main">{plan.autoRenew ? 'Enabled (Automatic)' : 'Disabled (Manual)'}</p>
          </div>
          <div className="bg-main-bg/50 border border-border/60 rounded-2xl p-3.5 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Assignment Target</p>
            <p className="text-xs font-bold text-text-main capitalize">{plan.assignmentTarget || 'All Members'}</p>
          </div>
          {plan.startDate && (
            <div className="bg-main-bg/50 border border-border/60 rounded-2xl p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Start Date</p>
              <p className="text-xs font-bold text-text-main">{fmtDate(plan.startDate)}</p>
            </div>
          )}
          {plan.endDate && (
            <div className="bg-main-bg/50 border border-border/60 rounded-2xl p-3.5 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">End Date</p>
              <p className="text-xs font-bold text-text-main">{fmtDate(plan.endDate)}</p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Included Features & Benefits</p>
          {plan.features && plan.features.length > 0 ? (
            <div className="space-y-2 bg-main-bg border border-border rounded-2xl p-4">
              {plan.features.map((f: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-text-main">
                  <div className="w-4 h-4 rounded-full bg-[#EB712B]/20 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-[#EB712B]" />
                  </div>
                  <span>{f}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted italic">No specific features listed for this plan.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(planId);
            }}
            className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Trash2 size={13} /> Delete Plan
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(plan);
            }}
            className="px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-md"
          >
            <Edit2 size={13} /> Edit Plan
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PLAN FORM MODAL (create / edit)
// ─────────────────────────────────────────────────────────────────────────────

interface PlanFormProps {
  clubId: number;
  plan?: any;
  onClose: () => void;
}

const calculateEndDate = (interval: string, start: Date = new Date()): string => {
  const end = new Date(start);
  const lower = interval.toLowerCase();
  if (lower === 'monthly' || lower === 'month') {
    end.setMonth(end.getMonth() + 1);
  } else if (lower === 'quarterly') {
    end.setMonth(end.getMonth() + 3);
  } else if (lower === 'semi-annual') {
    end.setMonth(end.getMonth() + 6);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end.toISOString();
};

const PlanForm: React.FC<PlanFormProps> = ({ clubId, plan, onClose }) => {
  const isEditing = !!plan;
  const [name, setName] = useState(plan?.name || '');
  const [price, setPrice] = useState(plan?.price?.toString() || '');
  const [currency, setCurrency] = useState(plan?.currency?.toUpperCase() || 'EUR');
  const [billingInterval, setBillingInterval] = useState(plan?.billingInterval || 'quarterly');
  const [showCustomDates, setShowCustomDates] = useState(isEditing && Boolean(plan?.startDate || plan?.endDate));
  const [startDate, setStartDate] = useState(
    plan?.startDate ? plan.startDate.split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    plan?.endDate ? plan.endDate.split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [allowStripe, setAllowStripe] = useState(plan?.allowStripe ?? true);
  const [allowManual, setAllowManual] = useState(plan?.allowManual ?? true);
  const [autoRenew, setAutoRenew] = useState(plan?.autoRenew ?? false);
  const [assignmentTarget, setAssignmentTarget] = useState<'all' | 'specific' | 'none'>(plan?.assignmentTarget || 'all');
  const [saveAsDraft, setSaveAsDraft] = useState(plan?.saveAsDraft ?? false);
  const [features, setFeatures] = useState<string[]>(
    plan?.features || ['Cycling license included', 'Paid activities included', 'Free coffee in our coffeeshop']
  );
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
      const startIso = showCustomDates
        ? new Date(`${startDate}T00:00:00Z`).toISOString()
        : new Date().toISOString();
      const endIso = showCustomDates
        ? new Date(`${endDate}T23:59:59Z`).toISOString()
        : calculateEndDate(billingInterval);

      const payload = {
        clubId,
        name: name.trim(),
        price: Number(price),
        currency: currency.toUpperCase(),
        billingInterval,
        startDate: startIso,
        endDate: endIso,
        allowStripe,
        allowManual,
        autoRenew,
        assignmentTarget,
        assignedMemberIds: plan?.assignedMemberIds || [],
        saveAsDraft,
        features,
      };
      if (isEditing) {
        await updatePlan({ ...payload, feeId: plan.id }).unwrap();
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

  const Toggle = ({ val, set, label, sub }: any) => (
    <div className="flex items-center justify-between p-3 bg-main-bg border border-border rounded-xl">
      <div>
        <p className="text-xs font-bold text-text-main">{label}</p>
        <p className="text-[10px] text-text-muted">{sub}</p>
      </div>
      <button type="button" onClick={() => set((p: boolean) => !p)}
        className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${val ? 'bg-[#EB712B]' : 'bg-border'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${val ? 'left-5' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 animate-in fade-in duration-200">
      <form onSubmit={handleSubmit}
        className="bg-surface text-text-main rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[88vh] overflow-y-auto overflow-x-hidden custom-scrollbar relative border border-border shadow-2xl space-y-6">
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <div>
            <h3 className="text-lg font-black uppercase tracking-wider text-text-main">
              {isEditing ? 'Edit Membership Plan' : 'Create Membership Plan'}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">Configure billing interval, pricing, and payment rules</p>
          </div>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer p-1">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Plan Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
              placeholder="e.g. Annual Membership Fee 2026" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Price *</label>
            <input type="number" step="any" value={price} onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
              placeholder="25.00" min="0" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs text-text-main outline-none focus:border-[#EB712B]">
              {['EUR', 'USD', 'GBP', 'CAD', 'AUD'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">Billing Interval</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'one-time', label: 'One-time' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'semi-annual', label: 'Semi-annual' },
                { value: 'annual', label: 'Annual' },
              ].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setBillingInterval(opt.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    billingInterval === opt.value
                      ? 'bg-[#EB712B] text-white border-[#EB712B]'
                      : 'bg-main-bg border-border text-text-muted hover:border-[#EB712B]/40'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 border border-border rounded-2xl p-4 bg-main-bg/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-text-main">Custom Validity Dates (Optional)</p>
                <p className="text-[10px] text-text-muted">
                  {showCustomDates
                    ? "Specify a fixed start and end date for this plan"
                    : "By default, plan starts immediately and renews automatically per interval"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDates((p) => !p)}
                className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative ${
                  showCustomDates ? 'bg-[#EB712B]' : 'bg-border'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${
                    showCustomDates ? 'left-5' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {showCustomDates && (
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50 animate-in fade-in duration-200">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full bg-surface border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="w-full bg-surface border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
                  />
                </div>
              </div>
            )}
          </div>

          <Toggle val={allowStripe} set={setAllowStripe} label="Allow Stripe" sub="Online payment via card" />
          <Toggle val={allowManual} set={setAllowManual} label="Allow Manual" sub="Offline / Cash transfer" />
          <Toggle val={autoRenew} set={setAutoRenew} label="Auto-Renew" sub="Automatically renew plan" />
          <Toggle val={saveAsDraft} set={setSaveAsDraft} label="Save as Draft" sub="Keep hidden until active" />

          <div className="col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Assignment Target</label>
            <select value={assignmentTarget} onChange={(e) => setAssignmentTarget(e.target.value as any)}
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs text-text-main outline-none focus:border-[#EB712B]">
              <option value="all">All Club Members</option>
              <option value="specific">Specific Members</option>
              <option value="none">None (Voluntary)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-2">Features</label>
          <div className="space-y-2 mb-2 max-h-36 overflow-y-auto custom-scrollbar pr-1">
            {features.map((f, i) => (
              <div key={i} className="flex items-center justify-between bg-main-bg border border-border rounded-xl px-3 py-2">
                <span className="text-xs text-text-main">{f}</span>
                <button type="button" onClick={() => setFeatures((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-text-muted hover:text-red-500 cursor-pointer ml-2"><X size={12} /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              className="flex-1 bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
              placeholder="Add a feature..." />
            <button type="button" onClick={handleAddFeature}
              className="px-4 py-3 bg-surface border border-border rounded-xl text-xs font-bold text-text-muted hover:text-text-main hover:border-[#EB712B]/40 transition-colors cursor-pointer">
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={isBusy}
            className="flex-1 py-3 bg-surface border border-border text-text-main text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer outline-none disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" disabled={isBusy}
            className="flex-1 py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0 outline-none disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#EB712B]/20">
            {isBusy && <Loader2 size={14} className="animate-spin" />}
            {isBusy ? 'Saving...' : (isEditing ? 'Update Plan' : 'Create Plan')}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MARK AS PAID MODAL
// ─────────────────────────────────────────────────────────────────────────────

const MarkAsPaidModal: React.FC<{ row: any; clubId: number; onClose: () => void }> = ({ row, clubId, onClose }) => {
  const [amount, setAmount] = useState(row.plan?.price ? String(row.plan.price) : '');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'bizum' | 'other'>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [markAsPaid, { isLoading }] = useChangeClubMemberFeeStatusMutation();

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      await markAsPaid({
        clubId,
        userId: row.userId,
        feeId: row.planId,
        amount: Number(amount),
        paymentDate: new Date(`${paymentDate}T12:00:00Z`).toISOString(),
        paymentMethod,
        note: note.trim() || undefined,
      } as any).unwrap();
      toast.success(`${row.user?.fullName || 'Member'} marked as paid!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to mark as paid.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-text-main">Mark as Paid Manually</h3>
            <p className="text-[10px] text-text-muted mt-0.5">{row.user?.fullName}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer p-1"><X size={18} /></button>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">Amount (€)</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-main-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-[#EB712B]"
            placeholder="0.00" min="0" step="any" />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">Payment Method</label>
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'bank_transfer', 'bizum', 'other'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setPaymentMethod(m)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border capitalize ${
                  paymentMethod === m ? 'bg-[#EB712B] text-white border-[#EB712B]' : 'bg-main-bg border-border text-text-muted hover:border-[#EB712B]/40'
                }`}>
                {m.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">Payment Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full bg-main-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-[#EB712B]" />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1.5">Note (Optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)}
            className="w-full bg-main-bg border border-border rounded-xl p-3 text-sm text-text-main outline-none focus:border-[#EB712B]"
            placeholder="e.g. Paid at club office" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 bg-surface border border-border text-text-main text-xs font-bold rounded-xl cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading}
            className="flex-1 py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            {isLoading ? 'Saving...' : 'Mark as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CHANGE FEE MODAL
// ─────────────────────────────────────────────────────────────────────────────

const ChangeFeeModal: React.FC<{ row: any; clubId: number; plans: any[]; onClose: () => void }> = ({ row, clubId, plans, onClose }) => {
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
  const [changeFee, { isLoading }] = useChangeAssignedFeeMutation();

  const handleSubmit = async () => {
    if (!selectedFeeId) { toast.error('Please select a fee plan'); return; }
    try {
      await changeFee({ clubId, userId: row.userId, newFeeId: selectedFeeId }).unwrap();
      toast.success(`Fee plan changed for ${row.user?.fullName || 'member'}!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to change fee.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-border rounded-3xl p-6 w-full max-w-sm space-y-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-text-main">Change Assigned Fee</h3>
            <p className="text-[10px] text-text-muted mt-0.5">{row.user?.fullName}</p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer p-1"><X size={18} /></button>
        </div>
        <div className="space-y-2">
          {plans.filter((p) => p.id !== row.planId).map((plan) => (
            <button key={plan.id} type="button" onClick={() => setSelectedFeeId(plan.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedFeeId === plan.id ? 'border-[#EB712B] bg-[#EB712B]/10' : 'border-border hover:border-[#EB712B]/40 bg-main-bg'
              }`}>
              <p className="text-xs font-bold text-text-main">{plan.name}</p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {fmtCurrency(plan.price, plan.currency)} / {plan.billingInterval}
              </p>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-surface border border-border text-text-main text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading || !selectedFeeId}
            className="flex-1 py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {isLoading && <Loader2 size={13} className="animate-spin" />}
            {isLoading ? 'Changing...' : 'Change Fee'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MEMBER ACTION SHEET (matches mobile "Fee Detail" per-member view)
// ─────────────────────────────────────────────────────────────────────────────

const MemberActionSheet: React.FC<{ row: any; clubId: number; plans: any[]; onClose: () => void }> = ({ row, clubId, plans, onClose }) => {
  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [showChangeFee, setShowChangeFee] = useState(false);
  const [sendReminder, { isLoading: isSendingReminder }] = useSendSubscriptionReminderMutation();
  const [exemptMember, { isLoading: isExempting }] = useExemptMemberFeeMutation();
  const [resetPending, { isLoading: isResetting }] = useResetMembershipFeePendingMutation();

  const isExempt = row.isExempt || row.paymentStatus === 'exempt' || row.status === 'exempt';
  const statusCfg = getStatusConfig(row);

  const handleSendReminder = async () => {
    try {
      await sendReminder({ clubId, targetUserId: row.userId }).unwrap();
      toast.success(`Payment reminder sent to ${row.user?.fullName || 'member'}!`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reminder.');
    }
  };

  const handleExempt = async () => {
    try {
      await exemptMember({ clubId, feeId: row.planId, userId: row.userId, isExempt: !isExempt }).unwrap();
      toast.success(isExempt ? 'Exemption removed.' : `${row.user?.fullName || 'Member'} exempted from payment.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update exemption.');
    }
  };

  const handleResetPending = async () => {
    try {
      await resetPending({ clubId, feeId: row.planId, userId: row.userId }).unwrap();
      toast.success(`${row.user?.fullName || 'Member'} reset to pending.`);
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to reset status.');
    }
  };

  if (showMarkPaid) return <MarkAsPaidModal row={row} clubId={clubId} onClose={() => { setShowMarkPaid(false); onClose(); }} />;
  if (showChangeFee) return <ChangeFeeModal row={row} clubId={clubId} plans={plans} onClose={() => { setShowChangeFee(false); onClose(); }} />;

  const FeeAction = ({ icon, label, sublabel, onClick, isLoading: busy, danger, accent }: any) => (
    <button onClick={onClick} disabled={busy}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer disabled:opacity-50 ${
        danger ? 'border-red-500/20 bg-red-500/5 hover:bg-red-500/10' : 'border-border hover:border-[#EB712B]/30 bg-main-bg hover:bg-[#EB712B]/5'
      }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${danger ? 'bg-red-500/15' : accent ? 'bg-[#EB712B]/15' : 'bg-surface'}`}>
        {busy ? <Loader2 size={16} className="animate-spin text-text-muted" /> : icon}
      </div>
      <div className="text-left flex-1">
        <p className={`text-xs font-bold ${danger ? 'text-red-400' : accent ? 'text-[#EB712B]' : 'text-text-main'}`}>{label}</p>
        {sublabel && <p className="text-[10px] text-text-muted mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-[60] p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-surface border border-border rounded-3xl p-5 w-full max-w-lg space-y-5 shadow-2xl mb-2 animate-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}>
        {/* Member Info */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#EB712B]/20 flex items-center justify-center">
              <span className="text-sm font-black text-[#EB712B]">{initials(row.user?.fullName)}</span>
            </div>
            <div>
              <p className="text-sm font-black text-text-main">{row.user?.fullName || 'Member'}</p>
              <p className="text-[10px] text-text-muted">{row.user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            <button onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer p-1"><X size={18} /></button>
          </div>
        </div>

        {/* Fee Info */}
        {row.plan && (
          <div className="bg-main-bg border border-border rounded-2xl p-4 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Membership Fee</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-main">{row.plan?.name || row.planSnapshot?.name}</p>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {row.currentPeriodEnd ? `Expires: ${fmtDate(row.currentPeriodEnd)}` : '—'}
                </p>
              </div>
              <p className="text-base font-black text-[#EB712B]">
                {row.plan?.price ? fmtCurrency(row.plan.price, row.plan.currency) : row.planSnapshot?.price ? `€${row.planSnapshot.price}` : ''}
              </p>
            </div>
          </div>
        )}

        {/* Fee Actions */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-2">Fee Actions</p>
          <div className="space-y-2">
            <FeeAction
              icon={<Send size={16} className="text-[#EB712B]" />}
              label="Send Payment Request"
              sublabel="Send reminder via email and push notification"
              onClick={handleSendReminder}
              isLoading={isSendingReminder}
              accent
            />
            <FeeAction
              icon={<CheckCircle2 size={16} className="text-green-400" />}
              label="Mark as Paid Manually"
              sublabel="Record a cash or offline payment"
              onClick={() => setShowMarkPaid(true)}
            />
            <FeeAction
              icon={<ArrowLeftRight size={16} className="text-sky-400" />}
              label="Change Assigned Fee"
              sublabel="Move this member to a different fee plan"
              onClick={() => setShowChangeFee(true)}
            />
            <FeeAction
              icon={<Percent size={16} className="text-slate-400" />}
              label={isExempt ? 'Remove Exemption' : 'Exempt from Payment'}
              sublabel={isExempt ? 'Re-assign this member to the fee' : 'Mark as not required to pay'}
              onClick={handleExempt}
              isLoading={isExempting}
            />
            <FeeAction
              icon={<RefreshCw size={16} className="text-amber-400" />}
              label="Reset to Pending"
              sublabel="Clear payment status and reset to pending"
              onClick={handleResetPending}
              isLoading={isResetting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEND REQUESTS PANEL (matches mobile "Send Requests" tab)
// ─────────────────────────────────────────────────────────────────────────────

const SendRequestsPanel: React.FC<{ clubId: number; plans: any[]; overview: any }> = ({ clubId, plans, overview }) => {
  const [selectedFeeId, setSelectedFeeId] = useState<number | null>(plans[0]?.id || null);
  const [target, setTarget] = useState<'pending' | 'expired'>('pending');
  const [sendNotification, { isLoading: isSending }] = useSendPaymentReminderNotificationMutation();

  const selectedPlan = plans.find((p) => p.id === selectedFeeId);

  const pendingCount = overview?.pendingMemberCount || 0;
  const notRenewedCount = overview?.notRenewedMemberCount || 0;
  const recipientCount = target === 'pending' ? pendingCount : notRenewedCount;

  const handleSend = async () => {
    if (!selectedFeeId) { toast.error('Please select a fee plan'); return; }
    try {
      await sendNotification({ clubId, feeId: selectedFeeId, target }).unwrap();
      toast.success(`Reminders sent to ${recipientCount} ${target} member${recipientCount !== 1 ? 's' : ''}!`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reminders.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Select Fee */}
      <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-[#EB712B] text-white rounded-full text-xs font-black flex items-center justify-center">1</span>
          <p className="text-xs font-black uppercase tracking-wider text-text-main">Select Membership Fee</p>
        </div>
        <div className="space-y-2">
          {plans.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No active fee plans found.</p>
          ) : (
            plans.map((plan) => (
              <button key={plan.id} type="button" onClick={() => setSelectedFeeId(plan.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedFeeId === plan.id ? 'border-[#EB712B] bg-[#EB712B]/10' : 'border-border hover:border-[#EB712B]/30 bg-main-bg'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-text-main">{plan.name}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {fmtCurrency(plan.price, plan.currency)} / {plan.billingInterval}
                      {pendingCount > 0 && <span className="ml-2 text-amber-400">· {pendingCount} pending</span>}
                      {notRenewedCount > 0 && <span className="ml-2 text-red-400">· {notRenewedCount} not renewed</span>}
                    </p>
                  </div>
                  {selectedFeeId === plan.id && <Check size={14} className="text-[#EB712B] shrink-0" />}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Step 2: Select Recipients */}
      <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-[#EB712B] text-white rounded-full text-xs font-black flex items-center justify-center">2</span>
          <p className="text-xs font-black uppercase tracking-wider text-text-main">Select Recipients</p>
        </div>
        <div className="space-y-2">
          <button type="button" onClick={() => setTarget('pending')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              target === 'pending' ? 'border-[#EB712B] bg-[#EB712B]/10' : 'border-border bg-main-bg hover:border-[#EB712B]/30'
            }`}>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              target === 'pending' ? 'bg-[#EB712B] border-[#EB712B]' : 'border-border'
            }`}>
              {target === 'pending' && <Check size={11} className="text-white" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-text-main">All pending members</p>
              <p className="text-[10px] text-text-muted mt-0.5">{pendingCount} members who haven't paid yet</p>
            </div>
          </button>
          <button type="button" onClick={() => setTarget('expired')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
              target === 'expired' ? 'border-[#EB712B] bg-[#EB712B]/10' : 'border-border bg-main-bg hover:border-[#EB712B]/30'
            }`}>
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              target === 'expired' ? 'bg-[#EB712B] border-[#EB712B]' : 'border-border'
            }`}>
              {target === 'expired' && <Check size={11} className="text-white" />}
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-text-main">Not renewed members</p>
              <p className="text-[10px] text-text-muted mt-0.5">{notRenewedCount} members whose fee has expired</p>
            </div>
          </button>
        </div>
      </div>

      {/* Step 3: Preview */}
      <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-6 h-6 bg-[#EB712B] text-white rounded-full text-xs font-black flex items-center justify-center">3</span>
          <p className="text-xs font-black uppercase tracking-wider text-text-main">Preview Message</p>
        </div>
        <div className="bg-[#EB712B]/5 border border-[#EB712B]/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2">
            <BellRing size={14} className="text-[#EB712B]" />
            <p className="text-xs font-black text-text-main">Your membership fee is pending</p>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed">
            Hi [Member Name],<br />
            Your {selectedPlan?.name || 'membership fee'} of {selectedPlan ? fmtCurrency(selectedPlan.price, selectedPlan.currency) : '—'} is {target === 'pending' ? 'pending' : 'expired'}.
            {selectedPlan?.endDate && <><br />Due date: {fmtDate(selectedPlan.endDate)}</>}<br />
            <span className="text-[#EB712B]">Tap here to pay →</span>
          </p>
        </div>
      </div>

      {/* Send Button */}
      <button onClick={handleSend} disabled={isSending || !selectedFeeId || recipientCount === 0}
        className="w-full py-4 bg-[#EB712B] hover:bg-[#d05c19] text-white text-sm font-black rounded-2xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#EB712B]/20">
        {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        {isSending ? 'Sending...' : `Send to ${recipientCount} Member${recipientCount !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MEMBERS TAB (matches mobile "Member" + "Fee Detail" tabs)
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'not_renewed', label: 'Not Renewed' },
  { key: 'exempt', label: 'Exempt' },
];

const MembersTab: React.FC<{ clubId: number; plans: any[] }> = ({ clubId, plans }) => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const { data: membersData, isLoading, isFetching } = useListSubscribedMemberQuery({
    clubId,
    limit: 50,
    offset: 0,
    status: statusFilter || undefined,
  });

  const members: any[] = Array.isArray(membersData) ? membersData : [];

  return (
    <>
      {selectedMember && (
        <MemberActionSheet
          row={selectedMember}
          clubId={clubId}
          plans={plans}
          onClose={() => setSelectedMember(null)}
        />
      )}

      <div className="space-y-5">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border ${
                statusFilter === tab.key
                  ? 'bg-[#EB712B] text-white border-[#EB712B]'
                  : 'bg-surface border-border text-text-muted hover:text-text-main hover:border-[#EB712B]/30'
              }`}>
              {statusFilter === tab.key && <Check size={10} />}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Member Count */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            {isFetching ? 'Loading...' : `${members.length} member${members.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Members List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#EB712B]" />
          </div>
        ) : members.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-8 text-center">
            <Users size={28} className="text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold text-text-muted">No members found</p>
            <p className="text-xs text-text-muted mt-1">
              {statusFilter ? `No members with status "${statusFilter}".` : 'No subscribed members yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((m: any) => {
              const name = m.name || m.username || m.user?.name || `Member #${m.userId || m.id}`;
              const status = m.status || 'pending';
              const planName = m.planName || m.plan?.name || 'Club Membership';

              const statusBadge = {
                active: { label: 'Paid', bg: 'bg-green-500/10 text-green-400 border-green-500/20' },
                pending: { label: 'Pending', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                not_renewed: { label: 'Not Renewed', bg: 'bg-red-500/10 text-red-400 border-red-500/20' },
                exempt: { label: 'Exempt', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
              }[status as string] || { label: status, bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };

              return (
                <div
                  key={m.id || m.userId}
                  onClick={() => setSelectedMember(m)}
                  className="bg-surface border border-border hover:border-[#EB712B]/40 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-main-bg border border-border flex items-center justify-center font-black text-xs text-[#EB712B] uppercase shrink-0">
                      {name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-main truncate group-hover:text-[#EB712B] transition-colors">
                        {name}
                      </p>
                      <p className="text-[10px] text-text-muted truncate">
                        {planName} {m.currentPeriodEnd && `· Valid until ${fmtDate(m.currentPeriodEnd)}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusBadge.bg}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB (matches mobile "Overview" + "Fee Detail" tabs)
// ─────────────────────────────────────────────────────────────────────────────

const OverviewTab: React.FC<{
  clubId: number;
  plans: any[];
  overview: any;
  overviewLoading: boolean;
  onViewDetail: (planId: number) => void;
  onEdit: (plan: any) => void;
  onDelete: (planId: number) => void;
  isDeleting: boolean;
}> = ({ clubId, plans, overview, overviewLoading, onViewDetail, onEdit, onDelete, isDeleting }) => {
  const totalCollected = overview?.totalCollected || 0;
  const totalExpected = overview?.totalExpected || 0;
  const paidCount = overview?.paidMemberCount || 0;
  const pendingCount = overview?.pendingMemberCount || 0;
  const notRenewedCount = overview?.notRenewedMemberCount || 0;
  const progress = totalExpected > 0 ? Math.min((totalCollected / totalExpected) * 100, 100) : 0;

  const [sendNotification, { isLoading: isSendingReminder }] = useSendPaymentReminderNotificationMutation();

  const handleSendReminder = async () => {
    const firstPlan = plans[0];
    if (!firstPlan) { toast.error('No active fee plans'); return; }
    try {
      await sendNotification({ clubId, feeId: firstPlan.id, target: 'pending' }).unwrap();
      toast.success('Payment reminders sent to all pending members!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reminders.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {overviewLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-2xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Collected', value: fmtCurrency(totalCollected), icon: <DollarSign size={16} className="text-green-400" />, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Expected', value: fmtCurrency(totalExpected), icon: <TrendingUp size={16} className="text-[#EB712B]" />, color: 'text-[#EB712B]', bg: 'bg-[#EB712B]/10' },
              { label: 'Paid', value: String(paidCount), icon: <CheckCircle2 size={16} className="text-green-400" />, color: 'text-green-400', bg: 'bg-green-500/10' },
              { label: 'Pending', value: String(pendingCount + notRenewedCount), icon: <Clock size={16} className="text-amber-400" />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="bg-surface border border-border rounded-2xl p-4">
                <div className={`w-8 h-8 ${stat.bg} rounded-xl flex items-center justify-center mb-2`}>{stat.icon}</div>
                <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider font-bold">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {totalExpected > 0 && (
            <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-text-main">Collection Progress</p>
                <p className="text-xs font-black text-[#EB712B]">{progress.toFixed(0)}%</p>
              </div>
              <div className="w-full h-3 bg-main-bg rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#EB712B] to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-[10px] text-text-muted">
                {fmtCurrency(totalCollected)} collected of {fmtCurrency(totalExpected)} expected
              </p>
            </div>
          )}

          {/* Send Reminder Button */}
          {pendingCount > 0 && (
            <button onClick={handleSendReminder} disabled={isSendingReminder || plans.length === 0}
              className="w-full py-4 bg-[#EB712B] hover:bg-[#d05c19] text-white text-sm font-black rounded-2xl cursor-pointer disabled:opacity-50 flex items-center justify-center gap-3 transition-all shadow-lg shadow-[#EB712B]/20">
              {isSendingReminder ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
              {isSendingReminder ? 'Sending...' : `Send Reminder to ${pendingCount} Pending Member${pendingCount !== 1 ? 's' : ''}`}
            </button>
          )}
        </>
      )}

      {/* Plans */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-3">Active Fee Plans</p>
        {plans.length === 0 ? (
          <div className="bg-surface border border-dashed border-border rounded-2xl p-8 text-center">
            <Crown size={28} className="text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold text-text-muted">No fee plans created yet</p>
            <p className="text-xs text-text-muted mt-1">Click "+ Add Plan" to create your first membership fee.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map((plan: any) => (
              <div key={plan.id} className="bg-surface border border-border rounded-2xl p-5 hover:border-[#EB712B]/20 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div
                    onClick={() => onViewDetail(plan.id)}
                    className="flex-1 min-w-0 cursor-pointer"
                    title="Click to view plan details"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-text-main truncate group-hover:text-[#EB712B] transition-colors">{plan.name}</h3>
                      {plan.saveAsDraft && (
                        <span className="px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 rounded-full text-[9px] font-bold text-slate-400 uppercase tracking-wider">Draft</span>
                      )}
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">
                      {fmtCurrency(plan.price, plan.currency)} / {plan.billingInterval}
                      {plan.endDate && ` · Until ${fmtDate(plan.endDate)}`}
                    </p>
                    {plan.features && plan.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {plan.features.slice(0, 3).map((f: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-main-bg border border-border rounded-full text-[9px] text-text-muted">{f}</span>
                        ))}
                        {plan.features.length > 3 && (
                          <span className="px-2 py-0.5 bg-main-bg border border-border rounded-full text-[9px] text-text-muted">+{plan.features.length - 3} more</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onViewDetail(plan.id)}
                      title="View Plan Details"
                      className="w-8 h-8 bg-main-bg border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-[#EB712B] hover:border-[#EB712B]/30 transition-all cursor-pointer"
                    >
                      <Eye size={13} />
                    </button>
                    <button onClick={() => onEdit(plan)}
                      className="w-8 h-8 bg-main-bg border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-[#EB712B] hover:border-[#EB712B]/30 transition-all cursor-pointer">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => onDelete(plan.id)} disabled={isDeleting}
                      className="w-8 h-8 bg-main-bg border border-border rounded-xl flex items-center justify-center text-text-muted hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer disabled:opacity-50">
                      {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OWNER MEMBERSHIP VIEW
// ─────────────────────────────────────────────────────────────────────────────

const OwnerMembershipView: React.FC<{ clubId: number }> = ({ clubId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [selectedDetailPlanId, setSelectedDetailPlanId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'send' | 'members'>('overview');

  const { data: plansData, isLoading: plansLoading } = useListMembershipPlansQuery({ clubId });
  const { data: overview, isLoading: overviewLoading } = useGetClubMembershipOverviewQuery({ clubId });
  const [deletePlan, { isLoading: isDeleting }] = useDeleteMembershipPlanMutation();

  const { data: stripeStatus } = useCheckStripeAccountStatusQuery({ clubId });
  const isStripeConnected = stripeStatus?.connected || stripeStatus?.status === 'active';
  const [connectStripe, { isLoading: isConnectingStripe }] = useConnectStripeMutation();

  const plans: any[] = plansData || [];

  const handleConnectStripe = async () => {
    if (!clubId) return;
    try {
      const result = await connectStripe({ clubId: Number(clubId) }).unwrap();
      const url = result?.onboardingUrl || (result as any)?.url;
      if (url) window.location.href = url;
      else toast.success('Stripe connection initiated!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to initiate Stripe connection.');
    }
  };

  const handleDelete = async (planId: number) => {
    try {
      await deletePlan({ planId, clubId }).unwrap();
      toast.success('Plan deleted successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete plan.');
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const TABS = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp size={13} /> },
    { key: 'send', label: 'Send Requests', icon: <Send size={13} /> },
    { key: 'members', label: 'Members', icon: <Users size={13} /> },
  ];

  return (
    <>
      {showForm && (
        <PlanForm
          clubId={clubId}
          plan={editingPlan || undefined}
          onClose={() => { setShowForm(false); setEditingPlan(null); }}
        />
      )}

      {selectedDetailPlanId !== null && (
        <PlanDetailModal
          clubId={clubId}
          planId={selectedDetailPlanId}
          onClose={() => setSelectedDetailPlanId(null)}
          onEdit={(plan) => {
            setSelectedDetailPlanId(null);
            handleEdit(plan);
          }}
          onDelete={(id) => {
            setSelectedDetailPlanId(null);
            handleDelete(id);
          }}
        />
      )}

      <div className="space-y-6">
        {/* Stripe warning banner */}
        {!isStripeConnected && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-3">
            <CreditCard size={18} className="text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-amber-400">Stripe Not Connected</p>
              <p className="text-[10px] text-amber-400/70 mt-0.5">Connect Stripe to accept online membership payments.</p>
            </div>
            <button onClick={handleConnectStripe} disabled={isConnectingStripe}
              className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl cursor-pointer hover:bg-amber-500/30 transition-all disabled:opacity-50 shrink-0">
              {isConnectingStripe ? <Loader2 size={12} className="animate-spin" /> : 'Connect'}
            </button>
          </div>
        )}

        {/* Header with tabs + add button */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-xl">
            {TABS.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === tab.key ? 'bg-[#EB712B] text-white shadow-sm' : 'text-text-muted hover:text-text-main hover:bg-hover'
                }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <button onClick={() => { setEditingPlan(null); setShowForm(true); }}
            className="px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-md shadow-[#EB712B]/20 sm:ml-auto">
            <Plus size={14} /> Add Plan
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab
            clubId={clubId}
            plans={plans}
            overview={overview}
            overviewLoading={overviewLoading || plansLoading}
            onViewDetail={(id) => setSelectedDetailPlanId(id)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        )}
        {activeTab === 'send' && (
          <SendRequestsPanel clubId={clubId} plans={plans} overview={overview} />
        )}
        {activeTab === 'members' && (
          <MembersTab clubId={clubId} plans={plans} />
        )}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

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
        <div className="border-b border-border pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center justify-center">
                <Crown size={22} className="text-[#EB712B]" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#EB712B]">
                  Club Management
                </span>
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-text-main">
                  Club Membership
                </h1>
              </div>
            </div>
            <p className="text-sm text-text-muted max-w-2xl">
              Create and manage membership fee plans. Track payments, send reminders, and manage member statuses.
            </p>
          </div>
        </div>

        <OwnerMembershipView clubId={Number(clubId)} />
      </div>
    </div>
  );
};

export default ClubMembership;
