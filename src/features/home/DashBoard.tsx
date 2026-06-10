import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, Users, Car, DollarSign, Wallet, Newspaper, 
  Settings, UserCircle, Search, X, Trophy, Percent, UserPlus, Menu, Bell, Mail 
} from 'lucide-react';
import Activities from './Activities';

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

const DashboardOverview = () => (
  <div className="w-full ">
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

export default function ProfessionalDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex w-screen h-screen bg-[#111111] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 w-72 h-full bg-[#111111] border-r border-white/10 p-6 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex justify-between items-center mb-10 px-2 shrink-0">
          <img src="/Images/Logo.png" alt="Logo" className="h-12 w-auto" />
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white p-2 rounded-full hover:bg-[#EB712B] transition-colors"><X size={24} /></button>
        </div>

        <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto">
          <NavItem onClick={() => {setActiveTab('Dashboard'); setIsOpen(false);}} active={activeTab === 'Dashboard'} label="Dashboard" icon={<LayoutDashboard size={18} />} />
          <NavItem onClick={() => {setActiveTab('Activities'); setIsOpen(false);}} active={activeTab === 'Activities'} label="Activities" icon={<Users size={18} />} />
          <NavItem onClick={() => {setActiveTab('Product'); setIsOpen(false);}} active={activeTab === 'Product'} label="Product" icon={<Car size={18} />} />
          <NavItem label="Order" icon={<Wallet size={18} />} />
          <NavItem label="Profile" icon={<UserCircle size={18} />} />
          <div className="my-4 border-t border-white/10" />
          <NavItem label="News" icon={<Newspaper size={18} />} />
          <NavItem label="Leaderboard" icon={<Trophy size={18} />} />
          <NavItem label="Discount" icon={<Percent size={18} />} />
          <NavItem label="Club Joining Request" icon={<UserPlus size={18} />} />
          <div className="mt-auto pt-4">
            <NavItem label="Settings" icon={<Settings size={18} />} />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsOpen(true)} className="lg:hidden text-white"><Menu size={24} /></button>
            <h2 className="text-lg font-semibold">{activeTab}</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#161616] px-4 py-2 rounded-xl border border-white/5 focus-within:border-[#EB712B] transition-colors duration-300">
  <Search size={16} className="text-gray-500 mr-2" />
  <input 
    value={searchQuery} 
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search..." 
    className="bg-transparent border-none outline-none text-sm w-40 placeholder:text-gray-600" 
  />
</div>
            <button className="text-gray-400 hover:text-[#EB712B] transition-colors"><Mail size={20} /></button>
            <button className="text-gray-400 hover:text-[#EB712B] transition-colors"><Bell size={20} /></button>
            {/* <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#EB712B] to-orange-400" /> */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 w-full">
          {activeTab === 'Dashboard' && <DashboardOverview />}
          {activeTab === 'Activities' && <Activities />}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div onClick={onClick} className={`flex items-center gap-4 cursor-pointer px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-[#eb712a] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
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