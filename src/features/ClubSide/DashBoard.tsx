import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  Search, Bell, Mail, Users, Bike, Menu, 
  UserPlus, AlertCircle, ChevronRight, ShieldCheck, ShoppingBag, Plus,
  Percent, Package, Crown ,ArrowUpRight
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { 
  useGetClubDashboardStatsQuery, 
  useGetJoinedClubsQuery,
  useGetClubRidesQuery,
  useGetClubMembersListQuery,
  useGetClubJoinRequestQuery,
  useManageJoinGroupRequestMutation
} from '@/features/club/api/clubApiSlice';
import { useForClubOwnerOrderListQuery } from '@/features/club/api/shopOrderApiSlice';
import { useGetClubDiscountsQuery } from '@/features/club/api/discountApiSlice';
import { useGetTheShopItemsQuery } from '@/features/club/api/shopApiSlice';
import { useListMembershipPlansQuery } from '@/features/club/api/membershipApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useAppSelector } from '@/hooks/useAppSelector';
import { toast } from 'sonner';

const extractArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.response)) return data.response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#EB712B] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-white/20">
        {`${payload[0].name || 'Value'}: ${payload[0].value}`}
      </div>
    );
  }
  return null;
};

const DashboardSkeleton = () => (
  <div className="w-full animate-pulse space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="bg-surface/50 h-32 rounded-3xl border border-border p-6 flex flex-col justify-between" />
      ))}
    </div>
    <div className="bg-surface/50 h-72 rounded-3xl border border-border p-8" />
  </div>
);

export const DashboardOverview = ({ stats: passedStats }: { stats?: any }) => {
  const navigate = useNavigate();
  const { clubId, setActiveClub } = useActiveClub();
  const myClubsFromRedux = useAppSelector((state) => state.club.myClubs) || [];
  const { data: joinedClubsData } = useGetJoinedClubsQuery();

  useEffect(() => {
    if (!clubId) {
      const clubsList = extractArray(joinedClubsData).length > 0 
        ? extractArray(joinedClubsData) 
        : myClubsFromRedux;
      if (clubsList.length > 0) {
        console.log("📌 [Dashboard] Auto-selecting active club:", clubsList[0]);
        setActiveClub(clubsList[0] as any);
      }
    }
  }, [clubId, joinedClubsData, myClubsFromRedux, setActiveClub]);

  const effectiveClubId = clubId ? Number(clubId) : 0;

  // Real API Calls for Dashboard Metrics
  const { data: fetchedStats, isLoading: isLoadingStats } = useGetClubDashboardStatsQuery(
    { clubId: effectiveClubId },
    { skip: !!passedStats || !effectiveClubId }
  );

  const { data: ridesResponse } = useGetClubRidesQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const { data: membersResponse } = useGetClubMembersListQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const { data: joinRequestsResponse } = useGetClubJoinRequestQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const { data: ordersResponse } = useForClubOwnerOrderListQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const { data: discountsResponse } = useGetClubDiscountsQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const { data: shopItemsResponse } = useGetTheShopItemsQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const { data: membershipPlansResponse } = useListMembershipPlansQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const [respondToJoinRequest] = useManageJoinGroupRequestMutation();

  const stats = passedStats || fetchedStats;
  const rides = extractArray(ridesResponse);
  const members = extractArray(membersResponse);
  const joinRequests = extractArray(joinRequestsResponse);
  const orders = extractArray(ordersResponse);
  const discounts = extractArray(discountsResponse);
  const shopProducts = extractArray(shopItemsResponse);
  const membershipPlans = extractArray(membershipPlansResponse);

  const pendingRequests = joinRequests.filter((r: any) => r.status?.toLowerCase() === 'pending' || r.status === 0);

  // Compute dynamic stats
  const totalMembersCount = stats?.activeMembers ?? (members.length || 0);
  const newJoinersCount = stats?.newJoiners ?? 0;
  const totalRidesCount = rides.length;
  const totalOrdersCount = orders.length;

  // Discount analytics
  const totalDiscountsCount = discounts.length;
  const expiredDiscountsCount = discounts.filter((d: any) => {
    if (d.isExpired) return true;
    if (d.status === 'expired' || d.status === 0) return true;
    const expiryDate = d.validUntil || d.expiresAt || d.endDate;
    if (expiryDate && new Date(expiryDate) < new Date()) return true;
    return false;
  }).length;
  const activeDiscountsCount = Math.max(0, totalDiscountsCount - expiredDiscountsCount);

  // Shop & Plans analytics
  const totalProductsCount = shopProducts.length;
  const totalPlansCount = membershipPlans.length;

  // Prepare monthly chart data from real rides & orders
  const ridesByMonth = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      last6Months.push({ name: months[idx], rides: 0, sales: 0 });
    }
    
    rides.forEach((r: any) => {
      if (r.createdAt || r.date) {
        const d = new Date(r.createdAt || r.date);
        const mName = months[d.getMonth()];
        const match = last6Months.find(m => m.name === mName);
        if (match) match.rides += 1;
      }
    });

    orders.forEach((o: any) => {
      if (o.createdAt) {
        const d = new Date(o.createdAt);
        const mName = months[d.getMonth()];
        const match = last6Months.find(m => m.name === mName);
        if (match) match.sales += 1;
      }
    });

    return last6Months;
  }, [rides, orders]);

  const handleRespondRequest = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      await respondToJoinRequest({ requestId, status }).unwrap();
      toast.success(`Request ${status} successfully!`);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to process request.");
    }
  };

  if (!passedStats && isLoadingStats) {
    return <DashboardSkeleton />;
  }
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* ── Stripe & Plans Onboarding Alert Banner ── */}
      {stats && (!stats.stripeOnboardingComplete || !stats.hasActivePlans || totalPlansCount === 0) && (
        <div className="bg-surface border border-border p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#EB712B]/10 text-[#EB712B] rounded-2xl shrink-0 border border-[#EB712B]/20">
              <AlertCircle size={26} />
            </div>
            <div>
              <h4 className="text-base font-bold text-text-main">Action Required for Monetization & Full Access</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                {!stats.stripeOnboardingComplete
                  ? "Connect your Stripe account to collect membership dues, ride fees, and marketplace revenues."
                  : "Configure your membership plans so athletes can join and subscribe to your club."}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(!stats.stripeOnboardingComplete ? '/view/clubside/stripe-connect' : '/view/clubside/membership-plans')}
            className="px-6 py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 shrink-0 cursor-pointer"
          >
            {!stats.stripeOnboardingComplete ? "Connect Stripe" : "Create Membership Plans"}
          </button>
        </div>
      )}

      {/* ── BENTO GRID LAYOUT ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {/* ── BENTO TILE 1 (HERO - Col 1-2): Active Members & Community Status ── */}
        <div 
          className="md:col-span-2 bg-surface p-7 rounded-[32px] border border-border hover:border-[#EB712B]/50 transition-all duration-300 shadow-xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/members')}
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3.5 bg-[#EB712B]/10 text-[#EB712B] rounded-2xl border border-[#EB712B]/20 group-hover:scale-105 transition-transform">
                <Users size={24} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#EB712B] bg-[#EB712B]/10 px-2.5 py-1 rounded-full border border-[#EB712B]/20">
                  Community Pulse
                </span>
                <h3 className="text-xl font-black text-text-main mt-1">Club Members</h3>
              </div>
            </div>
            <button className="p-2.5 bg-hover border border-border rounded-xl text-text-muted group-hover:text-[#EB712B] group-hover:border-[#EB712B]/40 transition-all">
              <ArrowUpRight size={18} />
            </button>
          </div>

          <div className="mt-8 flex items-end justify-between relative z-10">
            <div>
              <p className="text-5xl font-black text-text-main tracking-tight">{totalMembersCount}</p>
              <p className="text-xs text-text-muted mt-2 font-medium">Total Registered Club Athletes</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {newJoinersCount > 0 && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  +{newJoinersCount} New Joiners
                </span>
              )}
              <span className="text-[11px] text-text-muted font-semibold">
                {pendingRequests.length} Pending Approval
              </span>
            </div>
          </div>
        </div>

        {/* ── BENTO TILE 2: Club Rides ── */}
        <div 
          className="bg-surface p-7 rounded-[32px] border border-border hover:border-[#3B82F6]/50 transition-all duration-500 shadow-2xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/activities')}
        >
          <div className="flex items-center justify-between">
            <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Bike size={24} />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/view/clubside/add-ride'); }} 
              className="p-2 rounded-xl bg-hover border border-border text-text-muted hover:text-[#EB712B] hover:border-[#EB712B]/30 transition-all"
              title="Create Ride"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="mt-6">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Scheduled Events</span>
            <p className="text-4xl font-black text-text-main mt-1">{totalRidesCount}</p>
            <p className="text-[11px] text-blue-400 mt-2 font-semibold">Active & Past Rides</p>
          </div>
        </div>

        {/* ── BENTO TILE 3: Join Requests Moderation ── */}
        <div 
          className="bg-surface p-7 rounded-[32px] border border-border hover:border-purple-500/50 transition-all duration-500 shadow-2xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/joining-requests')}
        >
          <div className="flex items-center justify-between">
            <div className="p-3.5 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <UserPlus size={24} />
            </div>
            {pendingRequests.length > 0 && (
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                Needs Action
              </span>
            )}
          </div>
          <div className="mt-6">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Pending Requests</span>
            <p className="text-4xl font-black text-text-main mt-1">{pendingRequests.length}</p>
            <p className="text-[11px] text-purple-400 mt-2 font-semibold">
              {pendingRequests.length > 0 ? "Review Applications" : "All Requests Approved"}
            </p>
          </div>
        </div>

        {/* ── BENTO TILE 4: Discounts (Active vs Expired) ── */}
        <div 
          className="bg-surface p-7 rounded-[32px] border border-border hover:border-amber-500/50 transition-all duration-500 shadow-2xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/discount')}
        >
          <div className="flex items-center justify-between">
            <div className="p-3.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Percent size={24} />
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              {activeDiscountsCount} Active
            </span>
          </div>
          <div className="mt-6">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Club Discounts</span>
            <p className="text-4xl font-black text-text-main mt-1">{totalDiscountsCount}</p>
            <p className="text-[11px] text-amber-400 mt-2 font-semibold">
              {expiredDiscountsCount > 0 ? `${expiredDiscountsCount} Expired Offers` : "All Coupons Valid"}
            </p>
          </div>
        </div>

        {/* ── BENTO TILE 5: Shop Products ── */}
        <div 
          className="bg-surface p-7 rounded-[32px] border border-border hover:border-cyan-500/50 transition-all duration-500 shadow-2xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/product')}
        >
          <div className="flex items-center justify-between">
            <div className="p-3.5 bg-cyan-500/10 text-cyan-400 rounded-2xl border border-cyan-500/20 group-hover:scale-110 transition-transform">
              <Package size={24} />
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); navigate('/view/clubside/add-product'); }} 
              className="p-2 rounded-xl bg-hover border border-border text-text-muted hover:text-[#EB712B] hover:border-[#EB712B]/30 transition-all"
              title="Add Product"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="mt-6">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Shop Items</span>
            <p className="text-4xl font-black text-text-main mt-1">{totalProductsCount}</p>
            <p className="text-[11px] text-cyan-400 mt-2 font-semibold">Catalog Inventory</p>
          </div>
        </div>

        {/* ── BENTO TILE 6: Membership Plans ── */}
        <div 
          className="bg-surface p-7 rounded-[32px] border border-border hover:border-rose-500/50 transition-all duration-500 shadow-2xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/membership-plans')}
        >
          <div className="flex items-center justify-between">
            <div className="p-3.5 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <Crown size={24} />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${totalPlansCount > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {totalPlansCount > 0 ? `${totalPlansCount} Active` : 'No Plans'}
            </span>
          </div>
          <div className="mt-6">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Membership Plans</span>
            <p className="text-4xl font-black text-text-main mt-1">{totalPlansCount}</p>
            <p className="text-[11px] text-rose-400 mt-2 font-semibold">Tiered Dues Architecture</p>
          </div>
        </div>

        {/* ── BENTO TILE 7: Total Orders & Stripe Status ── */}
        <div 
          className="bg-surface p-7 rounded-[32px] border border-border hover:border-emerald-500/50 transition-all duration-500 shadow-2xl flex flex-col justify-between group cursor-pointer"
          onClick={() => navigate('/view/clubside/order')}
        >
          <div className="flex items-center justify-between">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${stats?.stripeOnboardingComplete ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {stats?.stripeOnboardingComplete ? 'Stripe Connected' : 'Setup Dues'}
            </span>
          </div>
          <div className="mt-6">
            <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest">Total Purchases</span>
            <p className="text-4xl font-black text-text-main mt-1">{totalOrdersCount}</p>
            <p className="text-[11px] text-emerald-400 mt-2 font-semibold">Shop Orders Placed</p>
          </div>
        </div>

      </div>

      {/* ── BENTO SECONDARY SECTION: Activity Graph + Quick Moderation List ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Area Chart (Col 1-2) */}
        <div className="lg:col-span-2 bg-surface p-8 rounded-[32px] border border-border shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#EB712B]">Trends</span>
              <h3 className="text-xl font-black text-text-main mt-0.5">Club Activity & Sales Velocity</h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold bg-main-bg px-4 py-2 rounded-2xl border border-border">
              <span className="flex items-center gap-1.5 text-[#EB712B]"><span className="w-2.5 h-2.5 rounded-full bg-[#EB712B]" /> Rides</span>
              <span className="flex items-center gap-1.5 text-blue-400"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Sales</span>
            </div>
          </div>

          <div className="w-full">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={ridesByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="ridesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EB712B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EB712B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-secondary-text)" />
                <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-secondary-text)" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rides" name="Rides" stroke="#EB712B" strokeWidth={3} fill="url(#ridesGrad)" />
                <Area type="monotone" dataKey="sales" name="Sales" stroke="#3B82F6" strokeWidth={3} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Action Moderation Box (Col 3) */}
        <div className="bg-surface p-8 rounded-[32px] border border-border shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-text-main">Moderation Queue</h3>
              <button onClick={() => navigate('/view/clubside/joining-requests')} className="text-xs font-bold text-[#EB712B] hover:underline flex items-center gap-1 cursor-pointer">
                View All <ChevronRight size={14} />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-text-muted space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <p className="text-xs font-medium text-text-main">Queue Clean</p>
                <p className="text-[11px] text-text-muted">No pending member join applications.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {pendingRequests.slice(0, 3).map((req: any) => (
                  <div key={req.id} className="p-3.5 bg-main-bg border border-border rounded-2xl flex items-center justify-between gap-3 hover:border-[#EB712B]/30 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img 
                        src={req.user?.profileImage || req.image || '/default-avatar.png'} 
                        alt="User" 
                        className="w-10 h-10 rounded-xl object-cover border border-border shrink-0" 
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-avatar.png'; }}
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-text-main truncate">{req.user?.name || req.name || 'Athlete'}</p>
                        <p className="text-[10px] text-text-muted truncate">{req.user?.email || 'Pending Application'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRespondRequest(req.id, 'approved')} 
                      className="px-3 py-1.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shrink-0 active:scale-95"
                    >
                      Accept
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-border mt-6 flex items-center justify-between text-xs text-text-muted">
            <span>Stripe Account ID:</span>
            <span className="font-mono text-[10px] font-bold text-text-main bg-main-bg px-2 py-1 rounded-lg border border-border">
              {stats?.stripeAccountId || 'Not Connected'}
            </span>
          </div>
        </div>

      </div>

      {/* ── BENTO TERTIARY SECTION: Recent Club Rides Table ── */}
      <div className="bg-surface p-8 rounded-[32px] border border-border shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#EB712B]">Schedule</span>
            <h3 className="text-xl font-black text-text-main mt-0.5">Recent & Upcoming Rides</h3>
          </div>
          <button onClick={() => navigate('/view/clubside/activities')} className="text-xs font-bold text-[#EB712B] hover:underline flex items-center gap-1 cursor-pointer">
            All Activities <ChevronRight size={14} />
          </button>
        </div>

        {rides.length === 0 ? (
          <div className="py-12 text-center text-text-muted space-y-3">
            <Bike size={36} className="mx-auto text-text-muted opacity-50" />
            <p className="text-xs font-medium">No rides created yet for this club.</p>
            <button
              onClick={() => navigate('/view/clubside/add-ride')}
              className="px-5 py-2.5 bg-[#EB712B] text-white text-xs font-bold rounded-2xl hover:bg-[#d05c19] transition-all cursor-pointer shadow-lg shadow-[#EB712B]/20"
            >
              + Create First Ride
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-text-muted tracking-widest">
                  <th className="pb-4 px-4">Ride Name</th>
                  <th className="pb-4 px-4">Date & Time</th>
                  <th className="pb-4 px-4">Meeting Point</th>
                  <th className="pb-4 px-4">Distance</th>
                  <th className="pb-4 px-4">Pace Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs font-medium">
                {rides.slice(0, 4).map((r: any) => (
                  <tr key={r.id} className="hover:bg-main-bg/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-text-main">{r.rideName || r.title || 'Untitled Ride'}</td>
                    <td className="py-4 px-4 text-text-muted">{r.date || 'N/A'} {r.time || ''}</td>
                    <td className="py-4 px-4 text-text-muted">{r.meetingPoint || 'Global'}</td>
                    <td className="py-4 px-4 font-black text-[#EB712B]">{r.distance ? `${r.distance} km` : 'N/A'}</td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-hover border border-border text-text-main text-[10px] font-bold uppercase tracking-wider">
                        {r.pace || 'Moderate'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      </div>

    
  );
};

interface DashBoardProps {
  defaultView?: React.ReactNode;
}

export default function DashBoard({ defaultView }: DashBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/').pop();
    if (!path) return 'Dashboard';
    return path === 'dashboard' ? 'Dashboard' : path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className="flex w-full h-screen bg-main-bg text-text-main overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 h-full overflow-y-auto p-8 relative">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-[#1A1A1A] rounded-xl border border-border"><Menu size={20} /></button>
            <h2 className="text-4xl font-bold capitalize">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-surface px-4 py-2 rounded-xl border border-border"><Search size={16} className="text-text-muted mr-2" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-40 text-text-main placeholder-text-muted" /></div>
            <button className="text-text-muted hover:text-[#EB712B]"><Mail size={20} /></button>
            <button className="text-text-muted hover:text-[#EB712B]"><Bell size={20} /></button>
          </div>
        </header>
        
        <div className="w-full border-t border-border my-8" />  
        
        <div className="w-full">
          {defaultView ? (
            defaultView
          ) : (
            <DashboardOverview />
          )}
        </div>
      </main>
    </div>
  );
}
