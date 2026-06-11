import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Bell, Mail, Users, Car, DollarSign, Wallet } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

const data = [
  { name: 'Jan', val: 4000 }, { name: 'Feb', val: 10500 }, { name: 'Mar', val: 6200 },
  { name: 'Apr', val: 7800 }, { name: 'May', val: 5500 }, { name: 'Jun', val: 13000 },
  { name: 'Jul', val: 10500 }, { name: 'Aug', val: 7500 }, { name: 'Sep', val: 10000 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#EB712B] text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
        {`${payload[0].value}`}
      </div>
    );
  }
  return null;
};

// EXPORTED for use in AppRouter.tsx
export const DashboardOverview = () => (
  <div className="w-full">
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <KPICard title="Total Members" value="456" icon={<Users className="text-[#EB712B]" />} />
      <KPICard title="Total Rides" value="102" icon={<Car className="text-[#EB712B]" />} />
      <KPICard title="Earning" value="$5,000" icon={<DollarSign className="text-[#EB712B]" />} />
      <KPICard title="Balance" value="$10,000" icon={<Wallet className="text-[#EB712B]" />} />
    </div>

    <div className="bg-[#161616] p-8 rounded-3xl border border-white/5 shadow-2xl w-full">
      <h2 className="text-xl font-bold mb-6">Marketplace Sales</h2>
      <div className="h-64 lg:h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EB712B" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#EB712B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#666" />
            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#666" />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#EB712B', strokeWidth: 2, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="val" stroke="#EB712B" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// DEFAULT EXPORT for the Layout
export default function DashBoard() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex w-screen h-screen bg-[#111111] text-white overflow-hidden">
      <Sidebar />

      <main className="flex-1 h-full overflow-y-auto p-8">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#161616] px-4 py-2 rounded-xl border border-white/5 focus-within:border-[#EB712B] transition-colors">
              <Search size={16} className="text-gray-500 mr-2" />
              <input 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-gray-600" 
              />
            </div>
            <button className="text-gray-400 hover:text-[#EB712B]"><Mail size={20} /></button>
            <button className="text-gray-400 hover:text-[#EB712B]"><Bell size={20} /></button>
          </div>
        </header>

        <div className="w-full">
          {/* Outlet automatically renders the matched route (Overview, Product, Activities, etc.) */}
          <Outlet />
        </div>
      </main>
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