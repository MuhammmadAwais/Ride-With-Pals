import React, { useState, useMemo } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  CreditCard,
  RefreshCw,
  TrendingUp,
  Filter,
  Layers,
  Receipt,
  X,
} from 'lucide-react';
import { useGetUserWalletQuery, type WalletTransaction } from '@/features/wallet/api/walletApiSlice';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';

const UserWallet: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { data: walletResponse, isLoading, refetch } = useGetUserWalletQuery();

  const rawData: any = walletResponse?.response || (walletResponse as any)?.data || walletResponse || {};
  const walletData = {
    totalSpent: Number(rawData.totalSpent || 0),
    currency: rawData.currency || 'usd',
    transactions: (Array.isArray(rawData.transactions) ? rawData.transactions : []) as WalletTransaction[],
  };

  const transactions = useMemo(() => walletData.transactions || [], [walletData.transactions]);

  // Derive currency symbol
  const currencySymbol = useMemo(() => {
    const curr = walletData.currency?.toUpperCase() || 'USD';
    if (curr === 'EUR') return '€';
    if (curr === 'GBP') return '£';
    return '$';
  }, [walletData.currency]);

  // Derived metrics
  const completedTx = useMemo(() => 
    transactions.filter(t => (t.status || '').toLowerCase() === 'completed'),
    [transactions]
  );
  const pendingTx = useMemo(() => 
    transactions.filter(t => (t.status || '').toLowerCase() === 'pending'),
    [transactions]
  );

  // Spending breakdown by Category
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

  // Spending by Club
  const clubSpending = useMemo(() => {
    const map: Record<string, number> = {};
    let total = 0;
    transactions.forEach(t => {
      const club = t.clubName || 'RideWithPals Club';
      const amt = Number(t.amount || 0);
      map[club] = (map[club] || 0) + amt;
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
        (t.clubName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (t.status || '').toLowerCase() === statusFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' ||
        (t.category || '').toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [transactions, searchQuery, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  const columns: Column<WalletTransaction>[] = [
    {
      key: 'title',
      label: t`Transaction & Club`,
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-hover border border-border/80 flex items-center justify-center text-text-muted shrink-0">
            <Building2 size={16} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-text-main truncate">{item.title || t`Untitled Transaction`}</div>
            <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
              <span className="truncate max-w-[140px]">{item.clubName || t`Club Payment`}</span>
              <span>•</span>
              <span className="font-mono text-[10px] text-text-muted/70">#{item.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: t`Category`,
      sortable: true,
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-hover border border-border/70 text-text-main">
          {item.category || t`General`}
        </span>
      ),
    },
    {
      key: 'type',
      label: t`Type`,
      sortable: true,
      render: (item) => {
        const isCredit = (item.type || '').toLowerCase() === 'credit';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
              isCredit
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-hover text-text-muted border-border/70'
            }`}
          >
            {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
            {isCredit ? <Trans>CREDIT</Trans> : <Trans>DEBIT</Trans>}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: t`Amount`,
      sortable: true,
      render: (item) => {
        const isCredit = (item.type || '').toLowerCase() === 'credit';
        return (
          <span className={`text-sm font-black tracking-tight ${isCredit ? 'text-emerald-400' : 'text-text-main'}`}>
            {isCredit ? '+' : '-'}{currencySymbol}{Number(item.amount || 0).toFixed(2)}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: t`Status`,
      sortable: true,
      render: (item) => {
        const status = (item.status || '').toLowerCase();
        if (status === 'completed') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={12} /> <Trans>Completed</Trans>
            </span>
          );
        }
        if (status === 'pending') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock size={12} /> <Trans>Pending</Trans>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle size={12} /> {item.status || <Trans>Unknown</Trans>}
          </span>
        );
      },
    },
    {
      key: 'date',
      label: t`Date`,
      sortable: true,
      render: (item) => (
        <span className="text-xs font-semibold text-text-muted">
          {item.date ? new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10 space-y-8">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-text-main">
            <Trans>My Financial Overview</Trans>
          </h1>
          <p className="text-xs text-text-muted font-medium mt-1">
            <Trans>Track your memberships, gear acquisitions, activity fees, and complete multi-club transaction history.</Trans>
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 rounded-xl bg-surface/50 hover:bg-hover border border-border text-xs font-bold flex items-center gap-2 text-text-main transition-all cursor-pointer shadow-sm hover:border-text-muted/40"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin text-[#EB712B]' : 'text-text-muted'} />
          <span><Trans>Refresh Data</Trans></span>
        </button>
      </div>

      {/* ── 1. ARCHITECTURAL FINANCIAL LEDGER STRIP (Blended Divided Telemetry Bar) ── */}
      <section className="-mx-6 md:-mx-10 px-6 md:px-10 border-y border-border bg-surface/25 backdrop-blur-sm">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x-0 sm:divide-x divide-border">
          
          {/* Spec 01: Total Spent */}
          <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-between gap-4 hover:bg-hover/20 transition-colors group">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block truncate">
                <Trans>Total Spent</Trans>
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-text-main block truncate">
                {currencySymbol}{Number(walletData.totalSpent || 0).toFixed(2)}
              </span>
              <span className="text-[10px] font-bold text-emerald-400/90 flex items-center gap-1 truncate">
                <TrendingUp size={11} className="shrink-0" /> <Trans>Net Expenditures</Trans>
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <DollarSign size={18} className="text-[#EB712B]" />
            </div>
          </div>

          {/* Spec 02: Total Transactions */}
          <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-between gap-4 hover:bg-hover/20 transition-colors group">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block truncate">
                <Trans>Total Transactions</Trans>
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-text-main block truncate">
                {transactions.length}
              </span>
              <span className="text-[10px] font-semibold text-text-muted block truncate">
                <Trans>Recorded Ledger Events</Trans>
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <CreditCard size={18} className="text-[#EB712B]" />
            </div>
          </div>

          {/* Spec 03: Completed */}
          <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-between gap-4 hover:bg-hover/20 transition-colors group">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block truncate">
                <Trans>Completed</Trans>
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-emerald-400 block truncate">
                {completedTx.length}
              </span>
              <span className="text-[10px] font-semibold text-text-muted block truncate">
                <Trans>{transactions.length > 0 ? Math.round((completedTx.length / transactions.length) * 100) : 0}% Settlement Rate</Trans>
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={18} className="text-[#EB712B]" />
            </div>
          </div>

          {/* Spec 04: Pending */}
          <div className="p-4 sm:p-5 lg:p-6 flex items-center justify-between gap-4 hover:bg-hover/20 transition-colors group">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block truncate">
                <Trans>Pending</Trans>
              </span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-amber-400 block truncate">
                {pendingTx.length}
              </span>
              <span className="text-[10px] font-semibold text-text-muted block truncate">
                <Trans>Awaiting Clearance</Trans>
              </span>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent dark:from-[#2a170e] dark:via-[#1c1410] dark:to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shrink-0 shadow-xs">
              <Clock size={18} className="text-[#EB712B]" />
            </div>
          </div>

        </div>
      </section>

      {/* ── 2. DUAL TELEMETRY ANALYTICS (Streamlined, No Clunky Isolated Cards) ── */}
      <section className="w-full border border-border/80 bg-surface/30 rounded-2xl overflow-hidden backdrop-blur-sm shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/80">
          
          {/* SPENDING BY CATEGORY */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-text-main">
                    <Trans>Category Breakdown</Trans>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#EB712B] bg-[#EB712B]/10 px-2.5 py-0.5 rounded-full border border-[#EB712B]/20">
                    <Trans>{categoryBreakdown.length} Categories</Trans>
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5"><Trans>Where your wallet expenditures are allocated</Trans></p>
              </div>
            </div>

            {categoryBreakdown.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-hover border border-border/80 flex items-center justify-center text-text-muted">
                  <Layers size={18} />
                </div>
                <p className="text-xs font-semibold text-text-muted"><Trans>No category spending recorded yet.</Trans></p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-main">{cat.name}</span>
                      <span className="text-text-muted font-mono">
                        {currencySymbol}{cat.amount.toFixed(2)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#EB712B] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SPENDING BY CLUB */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-text-main">
                    <Trans>Club Spending Distribution</Trans>
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider text-text-muted bg-hover px-2.5 py-0.5 rounded-full border border-border/80">
                    <Trans>{clubSpending.length} Clubs</Trans>
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5"><Trans>Communities you interact and transact with</Trans></p>
              </div>
            </div>

            {clubSpending.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-hover border border-border/80 flex items-center justify-center text-text-muted">
                  <Building2 size={18} />
                </div>
                <p className="text-xs font-semibold text-text-muted"><Trans>No club spending recorded yet.</Trans></p>
              </div>
            ) : (
              <div className="space-y-4">
                {clubSpending.map((club, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-main truncate max-w-[200px]">{club.name}</span>
                      <span className="text-text-muted font-mono">
                        {currencySymbol}{club.amount.toFixed(2)} ({club.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(club.percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── 3. TRANSACTION LEDGER (Modern Unified Container) ── */}
      <section className="w-full border border-border/80 bg-surface/30 rounded-2xl p-5 sm:p-7 space-y-6 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt size={17} className="text-[#EB712B]" />
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-text-main">
                <Trans>Transaction Ledger</Trans>
              </h3>
            </div>
            <p className="text-xs text-text-muted mt-0.5"><Trans>Complete historical record of all verified activities</Trans></p>
          </div>

          {/* FILTER AND SEARCH CONTROLS */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t`Search transactions...`}
                className="pl-9 pr-7 py-2 rounded-xl bg-main-bg border border-border text-xs font-medium text-text-main focus:outline-none focus:border-[#EB712B]/60 transition-colors w-44 sm:w-60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer p-0.5 border-0 bg-transparent"
                  title={t`Clear search`}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-main-bg p-1 rounded-xl border border-border">
              {[
                { id: 'All', label: t`All` },
                { id: 'Completed', label: t`Completed` },
                { id: 'Pending', label: t`Pending` }
              ].map((status) => (
                <button
                  key={status.id}
                  onClick={() => setStatusFilter(status.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${
                    statusFilter === status.id
                      ? 'bg-[#EB712B] text-white shadow-sm'
                      : 'text-text-muted hover:text-text-main bg-transparent'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Category Filter Dropdown */}
            {categories.length > 0 && (
              <div className="flex items-center gap-1.5 bg-main-bg px-3 py-1.5 rounded-xl border border-border">
                <Filter size={12} className="text-text-muted" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-text-main focus:outline-none cursor-pointer border-0"
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
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider"><Trans>Loading wallet ledger...</Trans></p>
          </div>
        ) : (
          <DataTable
            data={filteredTransactions}
            columns={columns}
            emptyMessage={t`No wallet transactions found matching your filters.`}
          />
        )}
      </section>

    </div>
  );
};

export default UserWallet;
