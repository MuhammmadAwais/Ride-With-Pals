import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { Search, Bell, Mail, Users, Car, DollarSign, Wallet, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';


const data = [
  { name: 'Jan', val: 4000 }, { name: 'Feb', val: 10500 }, { name: 'Mar', val: 6200 },
  { name: 'Apr', val: 7800 }, { name: 'May', val: 5500 }, { name: 'Jun', val: 13000 },
  { name: 'Jul', val: 10500 }, { name: 'Aug', val: 7500 }, { name: 'Sep', val: 10000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return <div className="bg-[#EB712B] text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">{`${payload[0].value}`}</div>;
  }
  return null;
};

const AnalyticsGrid = () => {
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
 const segments = [
    { color: '#3B82F6', value: 30, label: 'Inter-City', radius: 45 }, 
    { color: '#10B981', value: 30, label: 'Joint', radius: 35 },      
    { color: '#F97316', value: 40, label: 'Solo', radius: 25 },       
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {/* Member Growth */}
      <div className="bg-[#161616] p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-bold">Member Growth</h3>
          <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-1 rounded">+24%</span>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs><linearGradient id="growth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EB712B" stopOpacity={0.3}/><stop offset="95%" stopColor="#EB712B" stopOpacity={0}/></linearGradient></defs>
              <Area type="monotone" dataKey="val" stroke="#EB712B" fill="url(#growth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Target Segments Donut Chart */}
      <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 flex flex-col items-center">
        <h3 className="font-bold w-full mb-2">Target Segments</h3>
        <p className="text-gray-400 text-[10px] w-full mb-6 uppercase">Distribution Breakdown</p>
        <div className="relative flex items-center justify-center">
          <svg width={size} height={size} className="rotate-[-90deg]">
            {segments.map((segment, index) => {
              const cumulativeOffset = segments.slice(0, index).reduce((acc, curr) => acc + curr.value, 0);
              const dashOffset = circumference - (cumulativeOffset / 100) * circumference;
              return (
                <motion.circle
                  key={segment.label}
                  cx={size / 2} cy={size / 2} r={radius} fill="none"
                  stroke={segment.color} strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              );
            })}
          </svg>
          <div className="absolute text-center">
            <p className="text-2xl font-bold">1k</p>
            <p className="text-[10px] uppercase text-gray-500 font-bold">Total</p>
          </div>
        </div>
        <div className="flex gap-4 mt-6 text-[10px]">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} /> 
              {seg.label}
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="bg-[#161616] p-6 rounded-3xl border border-white/5">
        <h3 className="font-bold">Revenue Forecast</h3>
        <p className="text-[10px] text-gray-500 mb-6">Projected Q4 Earnings</p>
        <p className="text-3xl font-black mb-2">$12,450.00</p>
        <p className="text-[10px] text-green-400 flex items-center gap-1 mb-4">↗ Expected 15% increase</p>
        <div className="h-16">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.slice(0, 5)}><Area type="monotone" dataKey="val" stroke="#EB712B" fill="transparent" /></AreaChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export const DashboardOverview = () => (
  <div className="w-full">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <KPICard title="Total Members" value="456" icon={<Users className="text-[#EB712B]" />} />
      <KPICard title="Total Rides" value="102" icon={<Car className="text-[#EB712B]" />} />
      <KPICard title="Earning" value="$5,000" icon={<DollarSign className="text-[#EB712B]" />} />
      <KPICard title="Balance" value="$10,000" icon={<Wallet className="text-[#EB712B]" />} />
    </div>

    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 w-full">
      <h2 className="text-xl font-bold mb-6">Marketplace Sales</h2>
      <div className="h-64 lg:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs><linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EB712B" stopOpacity={0.4}/><stop offset="95%" stopColor="#EB712B" stopOpacity={0}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#666" />
            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#666" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EB712B', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="val" stroke="#EB712B" strokeWidth={3} fill="url(#colorVal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
    <AnalyticsGrid />
  </div>
);

export default function DashBoard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      default: return 'Dashboard';
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#111111] text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="flex-1 h-full overflow-y-auto p-8 relative">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 bg-[#161616] rounded-xl border border-white/5"><Menu size={20} /></button>
            <h2 className="text-2xl font-bold">{getPageTitle()}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#161616] px-4 py-2 rounded-xl border border-white/5"><Search size={16} className="text-gray-500 mr-2" /><input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-40" /></div>
            <button className="text-gray-400 hover:text-[#EB712B]"><Mail size={20} /></button>
            <button className="text-gray-400 hover:text-[#EB712B]"><Bell size={20} /></button>
          </div>
        </header>
        <div className="my-4 border-t border-white/20" />
        <div className="w-full"><Outlet /></div>
        
      </main>
      <div className="my-4 border-t border-white/20" />
    </div>
    
  );
}

function KPICard({ title, value, icon }: any) {
  return (
    <div className="bg-[#161616] p-6 rounded-3xl border border-white/5 hover:border-[#EB712B] transition-colors duration-300 w-full cursor-pointer">
      {icon}
      <h3 className="text-gray-400 text-xs uppercase font-semibold mt-4">{title}</h3>
      <p className="text-2xl font-black mt-1">{value}</p>
      
    </div>
    
  );
}