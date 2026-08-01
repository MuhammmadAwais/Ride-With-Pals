import React, { useState, useMemo } from 'react';
import {
  Wallet as WalletIcon,
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
  Filter
} from 'lucide-react';
import { useGetUserWalletQuery, type WalletTransaction } from '@/features/wallet/api/walletApiSlice';
import DataTable, { type Column } from '@/components/ui/DataTable';

const UserWallet: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { data: walletResponse, isLoading, refetch } = useGetUserWalletQuery();

  const walletData = walletResponse?.response || {
    totalSpent: 0,
    currency: 'usd',
    transactions: [] as WalletTransaction[],
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
      label: 'Transaction & Club',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center text-[#EB712B]">
            <Building2 size={18} />
          </div>
          <div>
            <div className="font-bold text-sm text-text-main">{t.title || 'Untitled Transaction'}</div>
            <div className="text-[11px] text-text-muted flex items-center gap-1.5 mt-0.5">
              <span>{t.clubName || 'Club Payment'}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">#{t.id}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (t) => (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-hover border border-border text-text-main">
          {t.category || 'General'}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
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
            {(t.type || 'Debit').toUpperCase()}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
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
      label: 'Status',
      sortable: true,
      render: (t) => {
        const status = (t.status || '').toLowerCase();
        if (status === 'completed') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 size={13} /> Completed
            </span>
          );
        }
        if (status === 'pending') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock size={13} /> Pending
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
      label: 'Date',
      sortable: true,
      render: (t) => (
        <span className="text-xs font-medium text-text-muted">
          {t.date ? new Date(t.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EB712B] mb-1">
            <WalletIcon size={16} /> User Wallet & Finance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            My Financial Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Track your memberships, shop purchases, activity fees, and spending history across clubs.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-4 py-2.5 rounded-xl bg-surface hover:bg-hover border border-border text-xs font-bold flex items-center gap-2 text-text-main transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Spent</span>
            <div className="w-10 h-10 rounded-2xl bg-[#EB712B]/10 text-[#EB712B] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">
              {currencySymbol}{Number(walletData.totalSpent || 0).toFixed(2)}
            </div>
            <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={14} /> Total expenditures across all clubs
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Transactions</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">{transactions.length}</div>
            <div className="text-xs text-text-muted mt-1">Recorded ledger activities</div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Completed</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-500">{completedTx.length}</div>
            <div className="text-xs text-text-muted mt-1">
              {transactions.length > 0 ? Math.round((completedTx.length / transactions.length) * 100) : 0}% success rate
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Pending</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-500">{pendingTx.length}</div>
            <div className="text-xs text-text-muted mt-1">Awaiting clearing or confirmation</div>
          </div>
        </div>
      </div>

      {/* ANALYTICS / GRAPHS & BREAKDOWNS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SPENDING BY CATEGORY */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main">Category Breakdown</h3>
              <p className="text-xs text-text-muted">Where your wallet spending goes</p>
            </div>
            <span className="text-xs font-bold text-[#EB712B] bg-[#EB712B]/10 px-3 py-1 rounded-full border border-[#EB712B]/20">
              {categoryBreakdown.length} Categories
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No category spending recorded yet.
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

        {/* SPENDING BY CLUB */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main">Club Spending Distribution</h3>
              <p className="text-xs text-text-muted">Top clubs you interact and spend with</p>
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {clubSpending.length} Clubs
            </span>
          </div>

          {clubSpending.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No club spending recorded yet.
            </div>
          ) : (
            <div className="space-y-4">
              {clubSpending.map((club, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-text-main truncate max-w-[200px]">{club.name}</span>
                    <span className="text-text-muted">
                      {currencySymbol}{club.amount.toFixed(2)} ({club.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(club.percentage, 4)}%` }}
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
            <h3 className="text-lg font-bold text-text-main">Transaction Ledger</h3>
            <p className="text-xs text-text-muted">Complete historical list of wallet transactions</p>
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
                placeholder="Search transactions..."
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
                  {status}
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
                  <option value="All">All Categories</option>
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
            <p className="text-xs font-bold text-text-muted">Loading wallet ledger...</p>
          </div>
        ) : (
          <DataTable
            data={filteredTransactions}
            columns={columns}
            emptyMessage="No wallet transactions found matching your filters."
          />
        )}
      </div>
    </div>
  );
};

export default UserWallet;
