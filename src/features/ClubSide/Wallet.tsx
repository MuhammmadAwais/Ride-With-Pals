import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Filter,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { toast } from 'sonner';
import { useGetClubWalletQuery, type WalletTransaction } from '@/features/wallet/api/walletApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetJoinedClubsQuery } from '@/features/club/api/clubApiSlice';
import DataTable, { type Column } from '@/components/ui/DataTable';

const WalletDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const { clubId: clubIdStr, setActiveClub } = useActiveClub();
  const myClubsFromReduxRaw = useAppSelector((state) => state.club.myClubs);
  const myClubsFromRedux = useMemo(() => myClubsFromReduxRaw || [], [myClubsFromReduxRaw]);
  const { data: joinedClubsData } = useGetJoinedClubsQuery();

  const extractClubs = (data: any): any[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.rows)) return data.rows;
    if (Array.isArray(data.response?.rows)) return data.response.rows;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };

  useEffect(() => {
    if (!clubIdStr || clubIdStr === 0) {
      const clubsList = extractClubs(joinedClubsData).length > 0
        ? extractClubs(joinedClubsData)
        : myClubsFromRedux;
      if (clubsList.length > 0) {
        setActiveClub(clubsList[0]);
      }
    }
  }, [clubIdStr, joinedClubsData, myClubsFromRedux, setActiveClub]);

  const effectiveClubId = (clubIdStr && clubIdStr !== 0)
    ? Number(clubIdStr)
    : (extractClubs(joinedClubsData)[0]?.id || myClubsFromRedux[0]?.id || 0);

  useEffect(() => {
    if (effectiveClubId) {
      console.log("📦 [Club Wallet] Calling GET /user/club/wallet?clubId=" + effectiveClubId);
    }
  }, [effectiveClubId]);

  const { data: walletResponse, isLoading, refetch } = useGetClubWalletQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  useEffect(() => {
    if (walletResponse) {
      console.log("📦 [Club Wallet] Received API response:", walletResponse);
    }
  }, [walletResponse]);

  const rawData: any = walletResponse?.response || (walletResponse as any)?.data || walletResponse || {};
  const walletData = {
    pendingEarnings: Number(rawData.pendingEarnings || 0),
    totalEarnings: Number(rawData.totalEarnings || 0),
    transactions: (Array.isArray(rawData.transactions) ? rawData.transactions : []) as WalletTransaction[],
  };

  const transactions = useMemo(() => walletData.transactions || [], [walletData.transactions]);

  // Derive currency symbol from the first transaction or default to '$'
  const currencySymbol = useMemo(() => {
    const curr = transactions[0]?.currency?.toUpperCase() || 'USD';
    if (curr === 'EUR') return '€';
    if (curr === 'GBP') return '£';
    return '$';
  }, [transactions]);

  // Derived metrics
  const completedTx = useMemo(() => 
    transactions.filter(t => (t.status || '').toLowerCase() === 'completed'),
    [transactions]
  );
  const pendingTx = useMemo(() => 
    transactions.filter(t => (t.status || '').toLowerCase() === 'pending'),
    [transactions]
  );

  // Revenue breakdown by Category
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    transactions.forEach(t => {
      const cat = t.category || 'General';
      const amt = Number(t.amount || 0);
      map[cat] = (map[cat] || 0) + amt;
      total += amt;
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Top Contributing Customers / Members
  const customerBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    transactions.forEach(t => {
      const customer = t.customerName || 'Anonymous Member';
      const amt = Number(t.amount || 0);
      map[customer] = (map[customer] || 0) + amt;
      total += amt;
    });
    return Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    })).sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Filtered transactions for DataTable
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch =
        (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (t.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === 'All' ||
        (t.type || '').toLowerCase() === typeFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' ||
        (t.category || '').toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, statusFilter, typeFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  const columns: Column<WalletTransaction>[] = useMemo(() => [
    {
      key: 'title',
      label: t`Transaction & Customer`,
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center text-[#EB712B] shadow-xs">
            <Users size={18} />
          </div>
          <div>
            <div className="font-bold text-sm text-text-main">{t.title || 'Untitled Transaction'}</div>
            <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
              <span>{t.customerName || 'Club Member'}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">#{t.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: t`Category`,
      sortable: true,
      render: (t) => (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-hover border border-border text-text-main">
          {t.category || 'General'}
        </span>
      ),
    },
    {
      key: 'type',
      label: t`Type`,
      sortable: true,
      render: (t) => {
        const isCredit = (t.type || '').toLowerCase() === 'credit';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isCredit
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}
          >
            {isCredit ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
            {(t.type || 'Credit').toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: t`Amount`,
      sortable: true,
      render: (t) => {
        const isCredit = (t.type || '').toLowerCase() === 'credit';
        return (
          <span className={`text-sm font-extrabold ${isCredit ? 'text-emerald-500' : 'text-text-main'}`}>
            {isCredit ? '+' : '-'}{currencySymbol}{Number(t.amount || 0).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: t`Status`,
      sortable: true,
      render: (t) => {
        const status = (t.status || '').toLowerCase();
        if (status === 'completed' || status === 'success') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={13} /> <Trans>Completed</Trans>
            </span>
          );
        }
        if (status === 'pending') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock size={13} /> <Trans>Pending</Trans>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle size={13} /> {t.status || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: t`Date`,
      sortable: true,
      render: (t) => (
        <span className="text-xs font-medium text-text-muted">
          {t.date ? new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
  ], [currencySymbol]);

  return (
    <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EB712B] mb-1">
            <WalletIcon size={16} /> <Trans>Club Treasury & Financials</Trans>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            <Trans>Club Wallet Overview</Trans>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            <Trans>Real-time tracking of membership payments, shop sales, and liquidity for your club.</Trans>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            disabled={!effectiveClubId}
            className="px-5 py-2.5 rounded-xl bg-[#EB712B] hover:bg-[#ff8036] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-[#EB712B]/20 cursor-pointer disabled:opacity-50 border-0"
          >
            <ArrowUpRight size={15} />
            <Trans>Request Payout</Trans>
          </button>

          <button
            onClick={() => refetch()}
            disabled={!effectiveClubId}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-hover border border-border text-xs font-bold flex items-center gap-2 text-text-main transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <Trans>Refresh Data</Trans>
          </button>
        </div>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL EARNINGS */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider"><Trans>Total Earnings</Trans></span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">
              {currencySymbol}{Number(walletData.totalEarnings || 0).toFixed(2)}
            </div>
            <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={14} /> <Trans>Total cleared revenues</Trans>
            </div>
          </div>
        </div>

        {/* PENDING EARNINGS */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider"><Trans>Pending Earnings</Trans></span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-500">
              {currencySymbol}{Number(walletData.pendingEarnings || 0).toFixed(2)}
            </div>
            <div className="text-xs text-text-muted mt-1"><Trans>{pendingTx.length} pending transactions awaiting clearance</Trans></div>
          </div>
        </div>

        {/* SUCCESS RATE */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider"><Trans>Success Rate</Trans></span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">
              {transactions.length > 0 ? Math.round((completedTx.length / transactions.length) * 100) : 0}%
            </div>
            <div className="text-xs text-text-muted mt-1"><Trans>{completedTx.length} completed / {transactions.length} total</Trans></div>
          </div>
        </div>

        {/* TOTAL TRANSACTIONS */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider"><Trans>Total Transactions</Trans></span>
            <div className="w-10 h-10 rounded-2xl bg-[#EB712B]/10 text-[#EB712B] flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">{transactions.length}</div>
            <div className="text-xs text-text-muted mt-1"><Trans>Recorded ledger entries</Trans></div>
          </div>
        </div>
      </div>

      {/* ANALYTICS / GRAPHS & BREAKDOWNS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE BY CATEGORY */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main"><Trans>Revenue by Category</Trans></h3>
              <p className="text-xs text-text-muted"><Trans>Breakdown of earnings across club revenue streams</Trans></p>
            </div>
            <span className="text-xs font-bold text-[#EB712B] bg-[#EB712B]/10 px-3 py-1 rounded-full border border-[#EB712B]/20">
              <Trans>{categoryBreakdown.length} Streams</Trans>
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              <Trans>No revenue categories recorded yet.</Trans>
            </div>
          ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-main">{cat.name}</span>
                    <span className="text-text-muted">
                      {currencySymbol}{cat.amount.toFixed(2)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#EB712B] to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOP CONTRIBUTING CUSTOMERS */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main"><Trans>Top Contributing Members</Trans></h3>
              <p className="text-xs text-text-muted"><Trans>Members generating the most revenue for the club</Trans></p>
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              <Trans>{customerBreakdown.length} Members</Trans>
            </span>
          </div>

          {customerBreakdown.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              <Trans>No member transactions recorded yet.</Trans>
            </div>
          ) : (
            <div className="space-y-4">
              {customerBreakdown.map((cust, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-main truncate max-w-[200px]">{cust.name}</span>
                    <span className="text-text-muted">
                      {currencySymbol}{cust.amount.toFixed(2)} ({cust.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(cust.percentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TRANSACTIONS TABLE SECTION */}
      <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-text-main"><Trans>Club Transaction Ledger</Trans></h3>
            <p className="text-xs text-text-muted"><Trans>Full historical list of transactions for this club</Trans></p>
          </div>

          {/* FILTER AND SEARCH CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t`Search transactions...`}
                className="pl-9 pr-4 py-2 rounded-xl bg-main-bg border border-border text-xs font-medium text-text-main focus:outline-none focus:border-[#EB712B] transition-colors w-48 sm:w-64"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-main-bg p-1 rounded-xl border border-border">
              {['All', 'Completed', 'Pending'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === status
                      ? 'bg-[#EB712B] text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {status === 'All' ? <Trans>All</Trans> : status === 'Completed' ? <Trans>Completed</Trans> : <Trans>Pending</Trans>}
                </button>
              ))}
            </div>

            {/* Type Filter Tabs */}
            <div className="flex items-center bg-main-bg p-1 rounded-xl border border-border">
              {['All', 'Credit', 'Debit'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === type
                      ? 'bg-[#EB712B] text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {type === 'All' ? <Trans>All</Trans> : type === 'Credit' ? <Trans>Credit</Trans> : <Trans>Debit</Trans>}
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 bg-main-bg px-3 py-2 rounded-xl border border-border">
                <Filter size={13} className="text-text-muted" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-text-main focus:outline-none cursor-pointer"
                >
                  <option value="All">{t`All Categories`}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* DATA TABLE */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw size={24} className="animate-spin text-[#EB712B]" />
            <p className="text-xs font-bold text-text-muted"><Trans>Loading club wallet ledger...</Trans></p>
          </div>
        ) : (
          <DataTable
            data={filteredTransactions}
            columns={columns}
            emptyMessage={t`No club wallet transactions found matching your filters.`}
          />
        )}
      </div>

      {/* WITHDRAW / PAYOUT MODAL */}
      {isWithdrawModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsWithdrawModalOpen(false); }}
        >
          <div className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-main-bg/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-text-main">
                    <Trans>Withdraw Funds</Trans>
                  </h3>
                  <p className="text-xs text-text-muted font-medium mt-0.5">
                    <Trans>Initiate payout to your club bank or payout account.</Trans>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!accountNumber.trim()) {
                  toast.error(t`Please enter your bank or card account number.`);
                  return;
                }
                if (!accountHolder.trim()) {
                  toast.error(t`Please enter the account holder name.`);
                  return;
                }
                const amt = parseFloat(withdrawAmount);
                if (isNaN(amt) || amt <= 0) {
                  toast.error(t`Please enter a valid payout amount.`);
                  return;
                }
                setIsSubmittingWithdraw(true);
                setTimeout(() => {
                  setIsSubmittingWithdraw(false);
                  setIsWithdrawModalOpen(false);
                  setAccountNumber('');
                  setAccountHolder('');
                  setWithdrawAmount('');
                  toast.success(t`Payout request for ${currencySymbol}${amt.toFixed(2)} submitted successfully!`);
                }, 800);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  <Trans>Account Number / IBAN</Trans>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="0000-0000-0000-0000"
                  className="w-full px-4 py-3 bg-main-bg border border-border rounded-xl font-mono text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none focus:border-[#EB712B] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  <Trans>Account Holder Name</Trans>
                </label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder={t`e.g. Club Treasurer / Organization Name`}
                  className="w-full px-4 py-3 bg-main-bg border border-border rounded-xl text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none focus:border-[#EB712B] transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    <Trans>Payout Amount ({currencySymbol})</Trans>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(walletData.totalEarnings.toString())}
                    className="text-xs font-bold text-[#EB712B] hover:underline cursor-pointer"
                  >
                    <Trans>Max ({currencySymbol}{Number(walletData.totalEarnings || 0).toFixed(2)})</Trans>
                  </button>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-main-bg border border-border rounded-xl font-mono text-sm font-semibold text-text-main placeholder:text-text-muted focus:outline-none focus:border-[#EB712B] transition-colors"
                  required
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="w-full py-3.5 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-[#EB712B]/20 flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50"
                >
                  {isSubmittingWithdraw ? <RefreshCw size={14} className="animate-spin" /> : <ArrowUpRight size={15} />}
                  <Trans>Confirm Withdrawal</Trans>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;
