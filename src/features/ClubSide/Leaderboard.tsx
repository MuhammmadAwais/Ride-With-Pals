// import React from 'react';
import { Bike, Globe, Trophy, Award, Filter, TrendingUp } from 'lucide-react';

const LEADERBOARD_DATA = [
  { id: 1, name: "Savannah Nguyen", role: "Elite Rookie", team: "Pro Team Alpha", rides: 12, attendance: "100%", status: "Active" },
  { id: 2, name: "Marcus Thorne", role: "Vet Pro", team: "Cycle Masters", rides: 10, attendance: "98%", status: "Active" },
  { id: 3, name: "Elena Gilbert", role: "Elite Rookie", team: "Speed Kings", rides: 9, attendance: "95%", status: "On Break" },
  { id: 4, name: "Ahmad Khan", role: "Pro Lead", team: "Summit Riders", rides: 8, attendance: "92%", status: "Active" },
];

const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="relative p-6 bg-[#0a0a0a]/50 border border-white/[0.08] backdrop-blur-xl rounded-3xl overflow-hidden hover:border-[#EB712B]/40 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">{title}</p>
      <div className="p-2 rounded-xl bg-white/[0.03] group-hover:bg-[#EB712B] transition-colors duration-500">
        <Icon size={16} className="text-[#EB712B] group-hover:text-black transition-colors duration-500" />
      </div>
    </div>
    <div className="text-3xl font-extrabold text-white tracking-tighter">{value}</div>
    <div className="mt-4 w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
      <div className="w-1/3 h-full bg-[#EB712B] rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
    </div>
  </div>
);

export const Leaderboard = () => {
  return (
    <div className="min-h-screen text-white p-6 md:p-16 font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20">
            <TrendingUp size={14} className="text-[#EB712B]" />
            <span className="text-[10px] font-bold tracking-widest text-[#EB712B] uppercase">Performance Analytics</span>
          </div>
          <h1 className="text-4xl md:text-4.4xl font-extrabold tracking-tighter text-white">Leaderboard</h1>
          <p className="text-gray-400 text-sm md:text-base max-w-lg leading-relaxed tracking-wide">
            <span className="text-[#EB712B] font-bold">Global Performance Index:</span> Tracking elite cycling metrics and club rankings across the continental federation circuit.
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button className="group flex items-center gap-2 px-5 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl hover:border-white/20 transition-all active:scale-95 text-xs font-bold tracking-widest text-gray-400 hover:text-white">
            <Filter size={14} className="group-hover:rotate-180 transition-transform duration-500" /> Strava Imported
          </button>
          <button className="px-6 py-3 bg-[#1a1a1a] border border-[#EB712B]/50 text-[#EB712B] rounded-xl hover:bg-[#EB712B] hover:text-white transition-all duration-300 text-xs font-bold tracking-widest ">
            Rides Attended
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard title="Total Active Rides" value="1,284" icon={Bike} />
        <StatCard title="Federation Avg" value="94.2%" icon={Globe} />
        <StatCard title="Top Clubs" value="12 Elite" icon={Trophy} />
        <StatCard title="Records Broken" value="08" icon={Award} />
      </section>

      {/* Main Table */}
      <section className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-2 shadow-2xl overflow-x-auto">
        <div className="grid grid-cols-12 px-8 py-6 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold border-b border-white/5 min-w-[700px]">
          <div className="col-span-1">Rank</div>
          <div className="col-span-5">Member Identity</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3 text-right">Performance</div>
        </div>

        <div className="divide-y divide-white/[0.03] min-w-[700px]">
          {LEADERBOARD_DATA.map((user) => (
            <div key={user.id} className="grid grid-cols-12 items-center px-8 py-5  transition-all group border-l-2 border-l-transparent hover:border-l-[#EB712B]">
              <div className="col-span-1 text-[#EB712B]/50 group-hover:text-[#EB712B] font-black text-xl">0{user.id}</div>
              <div className="col-span-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#252525] border border-white/5 flex items-center justify-center font-bold text-[#EB712B] text-xs">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-[#EB712B] transition-colors">{user.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role} • {user.team}</div>
                </div>
              </div>
              <div className="col-span-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${user.status === 'Active' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-gray-500/20 text-gray-500'}`}>
                  {user.status === 'Active' && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span></span>}
                  {user.status}
                </span>
              </div>
              <div className="col-span-3 text-right">
                <div className="font-bold text-sm">{user.rides} <span className="text-gray-600 font-normal">Rides</span></div>
                <div className="flex justify-end items-center gap-2 mt-1">
                  <span className="text-[9px] text-gray-500 font-bold">{user.attendance}</span>
                  <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#EB712B] rounded-full" style={{ width: user.attendance }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Leaderboard;