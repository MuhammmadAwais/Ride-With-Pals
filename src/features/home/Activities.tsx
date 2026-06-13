import { useState } from 'react';
import { Bike, BarChart3, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

// --- Types ---
interface Activity {
  id: number;
  name: string;
  region: string;
  distance: string;
  level: 'ADVANCED' | 'PRO ELITE' | 'INTERMEDIATE';
  status: 'IN PROGRESS' | 'SCHEDULED' | 'OPEN' | 'COMPLETED' | 'ARCHIVED';
  participants: string;
  progress: number;
  imageUrl: string;
  leaderImageUrl: string;
}

// 1. Define your 10 unique images
const girlImages = [
  "Girlmage1.png", "Girlmage2.png", "Girlmage3.png", "Girlmage4.png", "Girlmage5.png",
  "GrilImage11.png", "GirlImage11.png", "GirlImage11.png", "Girlmage9.png", "GirlImage10.png"
];

const leaderImages = [
  "Girlmage1.png", "Girlmage2.png", "Girlmage3.png", "Girlmage4.png", "Girlmage5.png",
  "GrilImage11.png", "GirlImage11.png", "GirlImage11.png", "Girlmage9.png", "GirlImage10.png"
];

const SummaryCard = ({ label, value, subtext, icon, isLive }: any) => (
  <div className={`p-6 rounded-2xl border ${isLive ? 'bg-[#161616] border-orange-500/40' : 'border-zinc-800 bg-[#111111]'}`}>
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{label}</span>
      <span className="text-orange-500">{icon}</span>
    </div>
    <div className="text-3xl font-black mb-1">{value}</div>
    <div className="text-[10px] text-zinc-500 font-medium">{subtext}</div>
  </div>
);

const ActivitiesRegistry = () => {
  const [activeTab, setActiveTab] = useState('Active');
  
  // 2. Map the state using your image arrays
  const [activities] = useState<Activity[]>(Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    name: `Activity ${i + 1}`,
    region: "Alpine Range",
    distance: "80 KM",
    level: "ADVANCED",
    status: i % 3 === 0 ? 'COMPLETED' : i % 5 === 0 ? 'ARCHIVED' : 'IN PROGRESS',
    participants: "18 / 38",
    progress: i % 3 === 0 ? 100 : 50,
    imageUrl: `/Images/${girlImages[i % 10]}`,
    leaderImageUrl: `/Images/${leaderImages[i % 10]}`
  })));

  // ... (Keep existing Filter, chartData, chartOptions, and JSX structure exactly as it is)

  // FILTER LOGIC
  const filteredActivities = activities.filter(act => {
    if (activeTab === 'Active') return act.status === 'IN PROGRESS' || act.status === 'SCHEDULED' || act.status === 'OPEN';
    if (activeTab === 'Completed') return act.status === 'COMPLETED';
    if (activeTab === 'Archived') return act.status === 'ARCHIVED';
    return true;
  });

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Completed Carpools',
        data: [3000, 2500, 9500, 4000, 3500, 4500, 4000, 5000, 4500, 5500, 6000, 7000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'Ride Bookings',
        data: [4000, 3500, 3000, 4500, 4000, 3800, 4200, 4800, 4500, 5000, 5500, 6000],
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#71717a' } },
      y: { min: 0, max: 10000, grid: { color: '#27272a' }, ticks: { color: '#71717a' } }
    }
  };

  return (
    <div className="min-h-screen p-8 text-white font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header/Tabs */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Activities Registry</h1>
         
        </div>

        {/* Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard label="TOTAL ACTIVE" value="24" subtext="+12% from last week" icon={<Bike size={20} />} />
          <SummaryCard label="AVG DISTANCE" value="68 km" subtext="Target: 75km" icon={<BarChart3 size={20} />} />
          <SummaryCard label="ELEVATION GAIN" value="1.4k" subtext="New record set" icon={<TrendingUp size={20} />} />
          <SummaryCard label="LIVE STATUS" value="08" subtext="Activities in progress" icon={<Bike size={20} />} isLive={true} />
        </div>

        {/* --- UPDATED HEADER/TAB SECTION --- */}
<div className="flex justify-between items-center mb-8">
  <h1 className="text-2xl font-bold">Activities Registry</h1>
  <div className="flex bg-[#111111] p-1.5 rounded-xl border border-zinc-800">
    {['Active', 'Completed', 'Archived'].map((tab) => (
      <button 
        key={tab} 
        onClick={() => setActiveTab(tab)} 
        className={`px-5 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${
          activeTab === tab 
            ? 'bg-zinc-800 text-white shadow-lg' 
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
</div>

{/* --- UPDATED TABLE SECTION --- */}
<div className="bg-[#111111] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
  <table className="w-full text-left border-collapse">
    <thead>
      <tr className="border-b border-zinc-800/60 bg-[#0c0c0c]">
        {['Activity', 'Leadership', 'Metrics', 'Level', 'Status', ''].map((h) => (
          <th key={h} className="p-6 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-800/60">
      {filteredActivities.map((act) => (
        <tr 
          key={act.id} 
          className="group hover:bg-[#1a1a1a] transition-colors duration-300 cursor-pointer"
        >
          <td className="p-6">
            <div className="flex items-center gap-4">
              <img src={act.imageUrl} className="w-14 h-14 rounded-2xl object-cover ring-1 ring-white/10" alt="" />
              <div>
                <div className="font-bold text-white group-hover:text-orange-500 transition-colors">{act.name}</div>
                <div className="text-xs text-zinc-500">{act.region}</div>
              </div>
            </div>
          </td>
          <td className="p-6">
            <img src={act.leaderImageUrl} className="w-10 h-10 rounded-full ring-2 ring-[#111111] object-cover" alt="" />
          </td>
          <td className="p-6">
            <div className="font-mono text-sm font-bold tracking-wider text-zinc-300">{act.distance}</div>
            <div className="w-20 h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.5)]" style={{ width: `${act.progress}%` }} />
            </div>
          </td>
          <td className="p-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-zinc-700 bg-zinc-900 text-zinc-400">
              {act.level}
            </span>
          </td>
          <td className="p-6">
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
              {act.status === 'COMPLETED' ? (
                <CheckCircle2 size={14} className="text-emerald-400" /> 
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              )}
              {act.status}
            </div>
          </td>
          <td className="p-6 text-right">
            <ChevronRight 
              size={20} 
              className="text-zinc-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" 
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

        {/* Chart */}
        <div className="p-8">
            <h3 className="text-xl font-bold mb-1">Data Velocity Over Time</h3>
            <p className="text-sm text-zinc-500 mb-6">Monthly Ride Bookings vs Completed Carpools</p>
            <div className="h-64">
                <Line data={chartData} options={chartOptions as any} />
            </div>
            <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2 text-sm font-bold"><span className="w-3 h-3 rounded-full bg-blue-500"/> Completed Carpools</div>
                <div className="flex items-center gap-2 text-sm font-bold"><span className="w-3 h-3 rounded-full bg-orange-500"/> Ride Bookings</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesRegistry;