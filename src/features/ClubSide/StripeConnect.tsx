/**
 * @fileoverview StripeConnect — Owner-only Stripe account setup page.
 *
 * Flutter equivalent: Stripe connect onboarding screen (owner-only)
 *
 * Architecture:
 * - Only renders for club owners
 * - Checks current Stripe status via useCheckStripeAccountStatusQuery
 * - "Connect Stripe" calls useConnectStripeMutation → receives onboarding URL → redirects
 * - clubId always from useActiveClub
 */
import React from 'react';
import {
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Shield,
  Zap,
  Globe,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import {
  useConnectStripeMutation,
  useCheckStripeAccountStatusQuery,
} from '@/features/club/api/stripeApiSlice';

const StripeConnect: React.FC = () => {
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);

  const { data: stripeStatus, isLoading: isLoadingStatus } = useCheckStripeAccountStatusQuery(
    { clubId: clubId! },
    { skip: !clubId || !permissions.isOwner }
  );

  const [connectStripe, { isLoading: isConnecting }] = useConnectStripeMutation();

  const isConnected = stripeStatus?.connected || stripeStatus?.status === 'active';
  const isRestricted = stripeStatus?.status === 'restricted';

  const handleConnect = async () => {
    if (!clubId) return;
    try {
      const result = await connectStripe({ clubId }).unwrap();
      const url = result?.onboardingUrl || (result as any)?.url || (result as any)?.response?.onboardingUrl || (result as any)?.response?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.success('Stripe connection initiated! Check your email for the next steps.');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to initiate Stripe connection.');
    }
  };

  // ── Access guard ──────────────────────────────────────────────────────────────
  if (permissions.isLoading || isLoadingStatus) {
    return (
      <div className="min-h-screen bg-main-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  if (!permissions.isOwner) {
    return (
      <div className="min-h-screen bg-main-bg text-text-main p-8 flex items-center justify-center">
        <div className="bg-surface border border-red-500/20 rounded-3xl p-16 text-center max-w-md space-y-5">
          <div className="w-20 h-20 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={36} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-main mb-2">Owner Access Only</h2>
            <p className="text-sm text-text-muted">Only the club owner can configure Stripe payments.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg text-text-main p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="border-b border-border pb-8 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-2xl flex items-center justify-center">
              <CreditCard size={22} className="text-[#EB712B]" />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[#EB712B]">Club Management</span>
              <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-text-main">Stripe Payments</h1>
            </div>
          </div>
          <p className="text-sm text-text-muted">
            Connect your Stripe account to accept membership fees and shop payments from club members.
          </p>
        </div>

        {/* Status Card */}
        <div className={`rounded-3xl p-6 border ${
          isConnected
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : isRestricted
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-surface border-border'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${
              isConnected
                ? 'bg-emerald-500/20 border-emerald-500/30'
                : isRestricted
                  ? 'bg-amber-500/20 border-amber-500/30'
                  : 'bg-surface border-border'
            }`}>
              {isConnected ? (
                <CheckCircle2 size={26} className="text-emerald-400" />
              ) : isRestricted ? (
                <AlertCircle size={26} className="text-amber-400" />
              ) : (
                <CreditCard size={26} className="text-text-muted" />
              )}
            </div>

            <div className="flex-1">
              <p className={`text-base font-bold ${
                isConnected ? 'text-emerald-400' : isRestricted ? 'text-amber-400' : 'text-text-main'
              }`}>
                {isConnected ? 'Stripe Connected' : isRestricted ? 'Account Restricted' : 'Stripe Not Connected'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {isConnected
                  ? 'Your club can now accept payments from athletes.'
                  : isRestricted
                    ? 'Your Stripe account has restrictions. Complete the onboarding to resolve.'
                    : 'Connect a Stripe account to start accepting membership and shop payments.'}
              </p>
              {stripeStatus?.stripeAccountId && (
                <p className="text-[10px] text-text-muted mt-1.5 font-mono">
                  Account: {stripeStatus.stripeAccountId}
                </p>
              )}
            </div>

            {/* Action button */}
            <div className="shrink-0">
              {isConnected ? (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#EB712B]/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                  Manage
                </button>
              ) : (
                <button
                  onClick={handleConnect}
                  disabled={isConnecting || !clubId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-0 disabled:opacity-50"
                >
                  {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                  {isConnecting ? 'Connecting...' : 'Connect Stripe'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature overview cards */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">What Stripe enables</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <Shield size={20} className="text-[#EB712B]" />,
                title: 'Membership Fees',
                desc: 'Automatically collect recurring membership subscriptions from athletes.',
              },
              {
                icon: <Zap size={20} className="text-[#EB712B]" />,
                title: 'Shop Payments',
                desc: 'Accept payments for club merchandise and equipment in your shop.',
              },
              {
                icon: <Globe size={20} className="text-[#EB712B]" />,
                title: 'Global Payouts',
                desc: 'Receive payouts directly to your bank account in your local currency.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-5 space-y-3 hover:border-[#EB712B]/20 transition-colors">
                <div className="w-10 h-10 bg-[#EB712B]/10 rounded-xl flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xs font-bold text-text-main">{item.title}</h3>
                <p className="text-[10px] text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-surface border border-border rounded-3xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">How it works</h2>
          <div className="space-y-3">
            {[
              { step: '1', text: 'Click "Connect Stripe" — you\'ll be redirected to Stripe\'s secure onboarding.' },
              { step: '2', text: 'Complete your account verification including identity, business details, and bank info.' },
              { step: '3', text: 'Return to RideWithPals — your account is linked and payments are ready.' },
              { step: '4', text: 'Athletes can now subscribe to membership plans and purchase from your shop.' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-[#EB712B]/20 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeConnect;
