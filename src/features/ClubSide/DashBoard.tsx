import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Search, Bell, Mail, Users, Car, DollarSign, Wallet, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import { useGetClubDashboardStatsQuery } from '@/features/club/api/clubApiSlice';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return <div className="bg-[#EB712B] text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">{`${payload[0].value}`}</div>;
  }
  return null;
};

const DashboardSkeleton = () => (
  <div className="w-full animate-pulse">
    {/* KPI Cards Skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-surface/50 h-32 rounded-3xl border border-border p-6 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-border" />
          <div className="w-24 h-4 bg-border rounded mt-4" />
          <div className="w-16 h-6 bg-border rounded mt-2" />
        </div>
      ))}
    </div>
    
    <div className="w-full border-t border-border my-8 shadow-sm" />

    {/* Chart Skeleton */}
    <div className="bg-surface/50 p-8 rounded-3xl border border-border h-80 w-full flex flex-col justify-between">
      <div className="w-32 h-6 bg-border rounded mb-6" />
      <div className="w-full h-48 bg-border/40 rounded-xl" />
    </div>

    {/* Extra Analytics Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface/50 p-6 rounded-3xl border border-border h-48" />
      ))}
    </div>
  </div>
);

const ErrorFallback = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-surface border border-border rounded-3xl">
    <div className="p-4 bg-red-500/10 rounded-full text-red-500 mb-4">
      <Users size={32} />
    </div>
    <h3 className="text-lg font-bold text-text-main mb-1">Failed to load statistics</h3>
    <p className="text-sm text-text-muted">{message || 'An error occurred while fetching dashboard stats.'}</p>
  </div>
);

const AnalyticsGrid = ({ stats }: { stats: any }) => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const segments = [
    { color: '#3B82F6', value: 30, label: 'Inter-City' }, 
    { color: '#10B981', value: 30, label: 'Joint' },      
    { color: '#F97316', value: 40, label: 'Solo' },      
  ];

  const chartData = stats?.monthlyGrowth || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      <div className="bg-surface p-6 rounded-3xl border border-border">
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-bold text-text-main">Member Growth</h3>
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded">+24%</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs><linearGradient id="growth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EB712B" stopOpacity={0.3}/><stop offset="95%" stopColor="#EB712B" stopOpacity={0}/></linearGradient></defs>
              <Area type="monotone" dataKey="val" stroke="#EB712B" fill="url(#growth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-surface p-6 rounded-3xl border border-border flex flex-col items-center">
        <h3 className="font-bold w-full mb-2 text-text-main">Target Segments</h3>
        <p className="text-text-muted text-[10px] w-full mb-6 uppercase">Distribution Breakdown</p>
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {segments.map((segment, index) => {
              const cumulativeOffset = segments.slice(0, index).reduce((acc, curr) => acc + curr.value, 0);
              const dashOffset = circumference - (cumulativeOffset / 100) * circumference;
              return (
                <motion.circle key={segment.label} cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={segment.color} strokeWidth={strokeWidth} strokeDasharray={`${circumference} ${circumference}`} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: dashOffset }} transition={{ duration: 1.5, ease: "easeOut" }} />
              );
            })}
          </svg>
          <div className="absolute text-center"><p className="text-2xl font-bold text-text-main">1k</p><p className="text-[10px] uppercase text-text-muted font-bold">Total</p></div>
        </div>
      </div>
      <div className="bg-surface p-6 rounded-3xl border border-border">
        <h3 className="font-bold text-text-main">Revenue Forecast</h3>
        <p className="text-[10px] text-text-muted mb-6">Projected Earnings</p>
        <p className="text-3xl font-black mb-2 text-text-main">${stats?.revenueForecast || '12,450.00'}</p>
        <p className="text-[10px] text-green-400 flex items-center gap-1 mb-4">↗ Expected increase</p>
      </div>
    </div>
  );
};

export const DashboardOverview = ({ stats }: { stats?: any }) => {
  const chartData = stats?.marketplaceSales || [];
  return (
    <div className="w-full">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-10">
        <KPICard title="Total Members" value={stats?.totalMembers || "456"} icon={<Users size={32} className="text-[#EB712B]" />} />
        <KPICard title="Total Rides" value={stats?.totalRides || "102"} icon={<Car size={32} className="text-[#EB712B]" />} />
        <KPICard title="Earning" value={`$${stats?.totalEarnings || "5,000"}`} icon={<DollarSign size={32} className="text-[#EB712B]" />} />
        <KPICard title="Balance" value={`$${stats?.walletBalance || "10,000"}`} icon={<Wallet size={32} className="text-[#EB712B]" />} />
      </div>

      {/* Elegant Divider Line */}
      <div className="w-full border-t border-border my-8 shadow-sm" />

      {/* Marketplace Sales and Analytics */}
      <div className="bg-surface p-8 rounded-3xl border border-border w-full">
        <h2 className="text-xl font-bold mb-6 text-text-main">Marketplace Sales</h2>
        <div className="h-64 lg:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EB712B" stopOpacity={0.4}/><stop offset="95%" stopColor="#EB712B" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-secondary-text)" />
              <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="var(--color-secondary-text)" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EB712B', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="val" stroke="#EB712B" strokeWidth={3} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <AnalyticsGrid stats={stats} />
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

  const clubIdStr = localStorage.getItem("selectedClubId");
  const clubId = clubIdStr ? Number(clubIdStr) : 0;

  const { data: stats, isLoading, isError } = useGetClubDashboardStatsQuery(
    { clubId },
    { skip: !!defaultView || !clubId }
  );

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
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-surface rounded-xl border border-border"><Menu size={20} /></button>
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
          ) : isLoading ? (
            <DashboardSkeleton />
          ) : isError ? (
            <ErrorFallback />
          ) : (
            <DashboardOverview stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
}

function KPICard({ title, value, icon }: any) {
  return (
    <div className="bg-surface p-6 rounded-3xl border border-border hover:border-[#EB712B] transition-colors duration-300 w-full cursor-pointer">
      {icon}
      <h3 className="text-text-muted text-xs uppercase font-semibold mt-4">{title}</h3>
      <p className="text-2xl text-text-main font-black mt-1">{value}</p>
    </div>
  );
}
