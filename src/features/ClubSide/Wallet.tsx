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

  const columns: Column<WalletTransaction>[] = [
    {
      key: 'title',
      label: 'Transaction & Customer',
      sortable: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-surface border border-border flex items-center justify-center text-[#EB712B]">
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
            {(t.type || 'Credit').toUpperCase()}
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
        if (status === 'completed' || status === 'success') {
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
            <WalletIcon size={16} /> Club Treasury & Financials
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-main">
            Club Wallet Overview
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Real-time tracking of membership payments, shop sales, and liquidity for your club.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={!effectiveClubId}
          className="px-4 py-2.5 rounded-xl bg-surface hover:bg-hover border border-border text-xs font-bold flex items-center gap-2 text-text-main transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {/* METRICS STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* TOTAL EARNINGS */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Earnings</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">
              {currencySymbol}{Number(walletData.totalEarnings || 0).toFixed(2)}
            </div>
            <div className="text-xs text-emerald-500 font-bold mt-1 flex items-center gap-1">
              <TrendingUp size={14} /> Total cleared revenues
            </div>
          </div>
        </div>

        {/* PENDING EARNINGS */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Pending Earnings</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-500">
              {currencySymbol}{Number(walletData.pendingEarnings || 0).toFixed(2)}
            </div>
            <div className="text-xs text-text-muted mt-1">{pendingTx.length} pending transactions awaiting clearance</div>
          </div>
        </div>

        {/* SUCCESS RATE */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Success Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">
              {transactions.length > 0 ? Math.round((completedTx.length / transactions.length) * 100) : 0}%
            </div>
            <div className="text-xs text-text-muted mt-1">{completedTx.length} completed / {transactions.length} total</div>
          </div>
        </div>

        {/* TOTAL TRANSACTIONS */}
        <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Total Transactions</span>
            <div className="w-10 h-10 rounded-2xl bg-[#EB712B]/10 text-[#EB712B] flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-text-main">{transactions.length}</div>
            <div className="text-xs text-text-muted mt-1">Recorded ledger entries</div>
          </div>
        </div>
      </div>

      {/* ANALYTICS / GRAPHS & BREAKDOWNS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE BY CATEGORY */}
        <div className="bg-surface p-6 sm:p-8 rounded-3xl border border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-main">Revenue by Category</h3>
              <p className="text-xs text-text-muted">Breakdown of earnings across club revenue streams</p>
            </div>
            <span className="text-xs font-bold text-[#EB712B] bg-[#EB712B]/10 px-3 py-1 rounded-full border border-[#EB712B]/20">
              {categoryBreakdown.length} Streams
            </span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No revenue categories recorded yet.
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
              <h3 className="text-lg font-bold text-text-main">Top Contributing Members</h3>
              <p className="text-xs text-text-muted">Members generating the most revenue for the club</p>
            </div>
            <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              {customerBreakdown.length} Members
            </span>
          </div>

          {customerBreakdown.length === 0 ? (
            <div className="py-12 text-center text-sm text-text-muted">
              No member transactions recorded yet.
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
            <h3 className="text-lg font-bold text-text-main">Club Transaction Ledger</h3>
            <p className="text-xs text-text-muted">Full historical list of transactions for this club</p>
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
                  {type}
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
            <p className="text-xs font-bold text-text-muted">Loading club wallet ledger...</p>
          </div>
        ) : (
          <DataTable
            data={filteredTransactions}
            columns={columns}
            emptyMessage="No club wallet transactions found matching your filters."
          />
        )}
      </div>
    </div>
  );
};

export default WalletDashboard;
