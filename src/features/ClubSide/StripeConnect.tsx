/**
 * @fileoverview StripeConnect — Commercial-grade Stripe account setup & management page.
 *
 * Architecture:
 * - Restricted to club owners (with graceful permission checking).
 * - Checks live Stripe status via useCheckStripeAccountStatusQuery.
 * - Initiates secure Stripe onboarding via useConnectStripeMutation ({ clubId }).
 * - Provides enterprise-level status reporting, error recovery, and direct support integration.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Globe,
  ArrowRight,
  Copy,
  Check,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
  Users,
  Building2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import {
  useConnectStripeMutation,
  useCheckStripeAccountStatusQuery,
} from '@/features/club/api/stripeApiSlice';
import { ROUTES } from '@/Constants';

const StripeConnect: React.FC = () => {
  const navigate = useNavigate();
  const { clubId } = useActiveClub();
  const permissions = useClubPermissions(clubId || undefined);

  const { data: stripeStatus, isLoading: isLoadingStatus, refetch } = useCheckStripeAccountStatusQuery(
    { clubId: clubId! },
    { 
      skip: !clubId || !permissions.isOwner,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  const [connectStripe, { isLoading: isConnecting }] = useConnectStripeMutation();
  const [connectError, setConnectError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  const stripeData = (stripeStatus as any)?.response || stripeStatus || {};
  const isConnected = Boolean(
    stripeData?.connected || 
    stripeData?.status === 'active' || 
    stripeData?.onboardingComplete || 
    stripeData?.chargesEnabled
  );
  const isRestricted = stripeData?.status === 'restricted';
  const stripeAccountId = stripeData?.stripeAccountId || stripeStatus?.stripeAccountId;

  const handleCopyAccount = () => {
    if (!stripeAccountId) return;
    navigator.clipboard.writeText(stripeAccountId);
    setCopiedAccount(true);
    toast.success('Stripe Account ID copied to clipboard');
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleConnect = async () => {
    if (!clubId) return;
    setConnectError(null);
    try {
      // Strictly send only { clubId: Number(clubId) } to conform to backend validation
      const result = await connectStripe({ clubId: Number(clubId) }).unwrap();
      const url = result?.onboardingUrl || (result as any)?.url || (result as any)?.response?.onboardingUrl || (result as any)?.response?.url;
      if (url) {
        window.location.href = url;
      } else {
        toast.success('Stripe connection initiated! Please complete onboarding.');
      }
    } catch (err: any) {
      const serverMsg = err?.data?.message || err?.message;
      // In commercial mode, avoid exposing raw internal schema errors to user
      const friendlyMsg = (serverMsg && !serverMsg.includes('not allowed'))
        ? serverMsg
        : 'Unable to open Stripe onboarding portal. Your account may need re-authorization or verification by our support team.';
      setConnectError(friendlyMsg);
      toast.error('Could not initiate Stripe connection. Please see options below.');
    }
  };

  const handleContactSupport = () => {
    navigate(ROUTES.SUPPORT_OWNER, {
      state: {
        prefilledSubject: 'Stripe Merchant Account Assistance',
        prefilledMessage: `Hi Support Team, I need assistance connecting/refreshing Stripe for Club ID: ${clubId}.`,
      },
    });
  };

  // ── Access guard ──────────────────────────────────────────────────────────────
  if (permissions.isLoading || isLoadingStatus) {
    return (
      <div className="min-h-screen bg-main-bg flex flex-col items-center justify-center space-y-4">
        <Loader2 size={36} className="animate-spin text-[#EB712B]" />
        <p className="text-xs font-semibold text-text-muted uppercase tracking-widest">
          Checking Payment Gateway Status...
        </p>
      </div>
    );
  }

  if (!permissions.isOwner) {
    return (
      <div className="min-h-screen bg-main-bg text-text-main p-8 flex items-center justify-center">
        <div className="bg-surface border border-red-500/20 rounded-3xl p-12 text-center max-w-md space-y-5 shadow-2xl">
          <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text-main mb-2">Club Owner Access Only</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Only the primary club owner has permission to configure merchant payouts, Stripe integration, and banking details.
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full py-3 bg-surface hover:bg-hover border border-border text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main-bg text-text-main p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Top Header */}
        <div className="border-b border-border pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#EB712B]/10 border border-[#EB712B]/20 text-[#EB712B] text-[10px] font-black uppercase tracking-widest rounded-md">
                Commercial Payouts
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md font-semibold">
                <ShieldCheck size={12} /> PCI-DSS Compliant
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Stripe Payments & Billing
            </h1>
            <p className="text-xs md:text-sm text-text-muted max-w-xl leading-relaxed">
              Connect your club's Stripe merchant account to collect recurring membership dues, process merchandise orders, and receive automated bank payouts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2.5 bg-surface hover:bg-hover border border-border text-text-muted hover:text-white rounded-xl transition-all cursor-pointer"
              title="Refresh Status"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={handleContactSupport}
              className="flex items-center gap-2 px-4 py-2.5 bg-surface hover:bg-hover border border-border text-text-muted hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <HelpCircle size={15} className="text-[#EB712B]" />
              Need Help?
            </button>
          </div>
        </div>

        {/* Live Status Card */}
        <div className={`rounded-3xl p-6 md:p-8 border shadow-xl relative overflow-hidden transition-all ${
          isConnected
            ? 'bg-gradient-to-br from-emerald-950/30 to-surface border-emerald-500/30'
            : isRestricted
              ? 'bg-gradient-to-br from-amber-950/30 to-surface border-amber-500/30'
              : 'bg-gradient-to-br from-surface to-surface/60 border-border'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg ${
                isConnected
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : isRestricted
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-[#EB712B]/10 border-[#EB712B]/30 text-[#EB712B]'
              }`}>
                {isConnected ? (
                  <CheckCircle2 size={32} />
                ) : isRestricted ? (
                  <AlertCircle size={32} />
                ) : (
                  <CreditCard size={32} />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    {isConnected ? 'Stripe Gateway Active' : isRestricted ? 'Action Required on Stripe' : 'Stripe Not Connected'}
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isRestricted
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : isRestricted ? 'bg-amber-400' : 'bg-slate-400'}`} />
                    {isConnected ? 'Ready for Payments' : isRestricted ? 'Restricted' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-text-muted leading-relaxed max-w-lg">
                  {isConnected
                    ? 'Your club merchant gateway is fully verified and receiving member payments with direct bank payouts enabled.'
                    : isRestricted
                      ? 'Your Stripe account requires additional identity or banking information to complete verification.'
                      : 'Link your Stripe account to unlock automated membership dues billing and merchandise store checkout.'}
                </p>

                {stripeAccountId && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono text-text-muted bg-main-bg/80 px-2.5 py-1 rounded-lg border border-border flex items-center gap-2">
                      <Building2 size={12} className="text-[#EB712B]" />
                      {stripeAccountId}
                    </span>
                    <button
                      onClick={handleCopyAccount}
                      className="p-1 hover:bg-hover rounded text-text-muted hover:text-white transition-colors cursor-pointer"
                      title="Copy Account ID"
                    >
                      {copiedAccount ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {isConnected ? (
                <>
                  <button
                    onClick={() => handleConnect()}
                    disabled={isConnecting}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-surface hover:bg-hover border border-border text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isConnecting ? <Loader2 size={15} className="animate-spin text-[#EB712B]" /> : <ExternalLink size={15} />}
                    Stripe Portal
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#EB712B] hover:bg-[#ff8243] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 shadow-lg shadow-[#EB712B]/20"
                  >
                    Club Dashboard <ArrowRight size={15} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleConnect()}
                    disabled={isConnecting || !clubId}
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#EB712B] hover:bg-[#ff8243] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 disabled:opacity-50 shadow-xl shadow-[#EB712B]/25 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isConnecting ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                    {isConnecting ? 'Opening Portal...' : isRestricted ? 'Complete Verification' : 'Connect Stripe Account'}
                  </button>
                  <button
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="flex items-center justify-center gap-2 px-4 py-3.5 bg-surface hover:bg-hover border border-border text-text-muted hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Skip for Now
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Active Features Pill Bar */}
          {isConnected && (
            <div className="mt-6 pt-6 border-t border-emerald-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-xl">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Direct Bank Payouts Active
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-xl">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Cards & Apple/Google Pay Ready
              </div>
              <div className="flex items-center gap-2.5 text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-3 py-2 rounded-xl">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> Automated Renewal Billing
              </div>
            </div>
          )}
        </div>

        {/* Commercial Assistance Banner (Graceful error handling) */}
        {connectError && (
          <div className="bg-surface border border-[#EB712B]/30 rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EB712B]/15 border border-[#EB712B]/30 flex items-center justify-center shrink-0 text-[#EB712B] mt-0.5">
                <HelpCircle size={24} />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Merchant Account Setup Assistance</h3>
                  <button
                    onClick={() => setConnectError(null)}
                    className="text-xs text-text-muted hover:text-white cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  {connectError}
                </p>
                <div className="bg-main-bg/80 p-4 rounded-2xl border border-border text-xs text-text-muted space-y-2">
                  <p className="font-semibold text-white">Why am I seeing this?</p>
                  <p className="leading-relaxed">
                    When connecting your club with Stripe, Stripe generates a single-use secure verification session. If a previous onboarding link expired or credentials require a platform refresh, our support team can instantly synchronize your club merchant profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleConnect()}
                disabled={isConnecting}
                className="px-5 py-2.5 bg-surface hover:bg-hover border border-border text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
              >
                {isConnecting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Retry Connection
              </button>
              <button
                onClick={handleContactSupport}
                className="px-6 py-2.5 bg-[#EB712B] hover:bg-[#ff8243] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border-0 flex items-center gap-2 shadow-lg shadow-[#EB712B]/20"
              >
                <MessageSquare size={14} />
                Open Support Ticket
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights for Club Owners */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Commercial Payment Capabilities
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-3 hover:border-[#EB712B]/30 transition-all">
              <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-xl flex items-center justify-center text-[#EB712B]">
                <Users size={22} />
              </div>
              <h3 className="text-sm font-bold text-white">Membership Plans</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Configure tiered monthly or annual subscriptions with automatic renewal billing, grace periods, and payment tracking.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 space-y-3 hover:border-[#EB712B]/30 transition-all">
              <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-xl flex items-center justify-center text-[#EB712B]">
                <ShoppingBag size={22} />
              </div>
              <h3 className="text-sm font-bold text-white">Merchandise Shop</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Sell official kits, cycling apparel, and accessories directly to club members with instant checkout and order management.
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6 space-y-3 hover:border-[#EB712B]/30 transition-all">
              <div className="w-12 h-12 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-xl flex items-center justify-center text-[#EB712B]">
                <Globe size={22} />
              </div>
              <h3 className="text-sm font-bold text-white">Global Direct Payouts</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Receive funds deposited directly into your club's bank account in your preferred currency with transparent accounting.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Walkthrough */}
        <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-lg">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
              How Stripe Onboarding Works
            </h2>
            <p className="text-xs text-text-muted">
              Setup is fully automated and takes less than 3 minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Initiate Link',
                desc: 'Click "Connect Stripe" to generate your single-sign-on verification link.',
              },
              {
                step: '02',
                title: 'Submit Details',
                desc: 'Enter your club or organization details and connect your preferred bank account.',
              },
              {
                step: '03',
                title: 'Instant Approval',
                desc: 'Stripe automatically verifies your merchant credentials in real time.',
              },
              {
                step: '04',
                title: 'Collect Revenue',
                desc: 'Publish paid membership tiers and accept payments across mobile & web.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-main-bg/60 p-4 rounded-2xl border border-border/80 space-y-2">
                <span className="text-xs font-black text-[#EB712B] font-mono">{s.step}</span>
                <h4 className="text-xs font-bold text-white">{s.title}</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Security Footer */}
        <div className="p-4 bg-surface/50 border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-emerald-400" />
            <span>Encrypted with bank-grade 256-bit AES encryption. Powered by Stripe Connect.</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://stripe.com/connect"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              About Stripe <ExternalLink size={12} />
            </a>
            <button
              onClick={handleContactSupport}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 text-xs text-text-muted"
            >
              Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StripeConnect;
