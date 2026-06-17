import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Wallet, CreditCard, ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, ShieldCheck } from 'lucide-react';

const chartData = {
  '30D': { label: 'Last 30 Days telemetry', bars: [40, 60, 30, 45, 90, 50, 40, 75, 40, 60] },
  '90D': { label: 'Last 90 Days telemetry', bars: [70, 30, 50, 80, 20, 60, 45, 35, 90, 55] },
  '1Y':  { label: 'Last 1 Year telemetry', bars: [30, 40, 60, 30, 50, 70, 80, 40, 30, 90] },
};

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'Sale' | 'Deposit' | 'Withdraw';
  status: 'SUCCESS' | 'PENDING';
}

const transactions: Transaction[] = [
  { id: '#TR-9284-AX', date: 'Oct 24, 2023', amount: 47.00, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9285-BR', date: 'Oct 24, 2023', amount: 35.00, type: 'Deposit', status: 'SUCCESS' },
  { id: '#TR-9286-LM', date: 'Oct 23, 2023', amount: 29.00, type: 'Withdraw', status: 'PENDING' },
  { id: '#TR-9287-PQ', date: 'Oct 22, 2023', amount: 25.00, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9288-WX', date: 'Oct 21, 2023', amount: 60.00, type: 'Deposit', status: 'SUCCESS' },
  { id: '#TR-9289-YZ', date: 'Oct 20, 2023', amount: 42.50, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9290-AB', date: 'Oct 19, 2023', amount: 15.00, type: 'Withdraw', status: 'PENDING' },
  { id: '#TR-9291-CD', date: 'Oct 18, 2023', amount: 88.00, type: 'Deposit', status: 'SUCCESS' },
  { id: '#TR-9292-EF', date: 'Oct 17, 2023', amount: 33.00, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9293-GH', date: 'Oct 16, 2023', amount: 55.00, type: 'Withdraw', status: 'SUCCESS' },

  { id: '#TR-9294-IJ', date: 'Oct 15, 2023', amount: 120.00, type: 'Deposit', status: 'SUCCESS' },
  { id: '#TR-9295-KL', date: 'Oct 15, 2023', amount: 12.50, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9296-MN', date: 'Oct 14, 2023', amount: 45.00, type: 'Withdraw', status: 'PENDING' },
  { id: '#TR-9297-OP', date: 'Oct 13, 2023', amount: 200.00, type: 'Deposit', status: 'SUCCESS' },
  { id: '#TR-9298-QR', date: 'Oct 12, 2023', amount: 55.25, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9299-ST', date: 'Oct 11, 2023', amount: 30.00, type: 'Withdraw', status: 'SUCCESS' },
  { id: '#TR-9300-UV', date: 'Oct 10, 2023', amount: 75.00, type: 'Deposit', status: 'SUCCESS' },
  { id: '#TR-9301-WX', date: 'Oct 09, 2023', amount: 10.00, type: 'Sale', status: 'SUCCESS' },
  { id: '#TR-9302-YZ', date: 'Oct 08, 2023', amount: 95.00, type: 'Withdraw', status: 'PENDING' },
  { id: '#TR-9293-GH', date: 'Oct 16, 2023', amount: 55.00, type: 'Withdraw', status: 'SUCCESS' },  
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'Sale') return <CreditCard size={16} />;
  if (type === 'Deposit') return <ArrowDownRight size={16} />;
  return <ArrowUpRight size={16} />;
};

const StatCard = ({ title, value, icon: Icon, iconColor, bgColor }: any) => (
  <div className="bg-[#111111] p-6 rounded-3xl border border-[#1f1f1f] flex items-center gap-5 hover:border-[#333] transition-colors">
    <div className={`p-4 rounded-2xl ${bgColor} flex items-center justify-center`}>
      <Icon size={24} className={iconColor} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">{title}</p>
      <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

export default function WalletDashboard() {
  const [range, setRange] = useState<'30D' | '90D' | '1Y'>('30D');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  
  const itemsPerPage = 4;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = transactions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4 md:p-8 min-h-screen text-white font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="relative group mb-12">
  {/* Decorative Background Accent */}
  <div className="absolute -left-4 top-0 w-1 h-12 bg-[#EB712B] rounded-full blur-[1px]"></div>
  
  <div className="pl-6">
    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase  leading-none">
      Financial 
      <span className="text-[#EB712B] ">   Wallet</span>
    </h1>
    <p className="mt-6 text-gray-400 font-bold text-5xl tracking-widest uppercase text-[10px]">
      Monitoring liquidity and operational performance metrics. <span className="text-[#EB712B]">Lindsey Culhane</span>
    </p>
  </div>
</div>
        <button className="group flex items-center gap-3 bg-[#121212] px-6 py-3 rounded-2xl border border-white/10 text-sm font-bold text-white transition-all duration-300 hover:border-[#EB712B] hover:bg-[#1a1a1a] hover:shadow-[0_0_20px_rgba(235,113,43,0.15)] active:scale-95">
  <div className="bg-[#1a1a1a] p-1.5 rounded-lg group-hover:bg-[#EB712B] transition-colors duration-300">
    <Download size={14} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
  </div>
  Export Report
</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-gradient-to-br from-[#EB712B] to-[#44200a] p-8 rounded-[2rem] text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Principal Manager</h3>
                <p className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Ahmad Khan</p>
              </div>
            </div>
            <div className="space-y-1 mb-10">
              <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">Current Balance</p>
              <h2 className="text-3xl font-extrabold tracking-tighter text-white">$500.00</h2>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={() => setIsDepositModalOpen(true)} className="flex-1 bg-[#F5E6D3] text-[#A65E36] py-4 rounded-2xl font-bold hover:bg-[#EBDCC5] transition-all">Deposit</button>
              <button onClick={() => setIsWithdrawModalOpen(true)} className="flex-1 bg-black/10 backdrop-blur-sm border border-white/10 py-4 rounded-2xl font-bold hover:bg-black/20 hover:border-white/20 transition-all">Withdraw</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1a1a1a] p-8 rounded-3xl border border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h3 className="font-bold text-lg">Earnings Over Time</h3>
              <p className="text-xs text-gray-500">{chartData[range].label}</p>
            </div>
            <div className="flex bg-[#0a0a0a] rounded-xl p-1 border border-white/5">
              {(['30D', '90D', '1Y'] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`px-4 py-1.5 text-xs rounded-lg ${range === r ? 'bg-[#333]' : 'text-gray-500'}`}>{r}</button>
              ))}
            </div>
          </div>
          <div className="h-40 flex items-end gap-2">
  {chartData[range].bars.map((h, i) => (
    <div key={i} className="flex-1 h-full flex flex-col justify-end">
      <div 
        className="w-full rounded-t-md bg-[#EB712B] transition-all duration-500 ease-in-out" 
        style={{ height: `${h}%` }} 
      />
    </div>
  ))}
</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Growth" value="+14.2%" icon={TrendingUp} iconColor="text-emerald-500" bgColor="bg-emerald-500/10" />
        <StatCard title="Avg Ticket" value="$124.50" icon={DollarSign} iconColor="text-[#EB712B]" bgColor="bg-[#EB712B]/10" />
        <StatCard title="Trust Score" value="99.8%" icon={ShieldCheck} iconColor="text-purple-500" bgColor="bg-purple-500/10" />
      </div>
      <div className="bg-[#111111] rounded-3xl mt-7 border border-[#1f1f1f] overflow-hidden shadow-2xl">
  {/* Horizontal scrolling wrapper for mobile */}
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse min-w-[600px]">
      <thead className="bg-[#0a0a0a] text-gray-500 text-[10px] uppercase font-bold tracking-[0.25em]">
        <tr>
          <th className="py-6 pl-8">Transaction ID</th>
          <th className="py-6">Date</th>
          <th className="py-6">Type</th>
          <th className="py-6">Amount ($)</th>
          <th className="py-6 pr-8 text-right">Status</th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.map((item, index) => (
          <tr key={index} className="border-b border-[#1f1f1f] text-sm hover:bg-[#1a1a1a] transition-colors">
            <td className="py-6 pl-8 font-bold text-gray-200">{item.id}</td>
            <td className="py-6 text-gray-400">{item.date}</td>
            <td className="py-6 flex items-center gap-3 text-gray-300">
              <div className="p-2 rounded-xl bg-[#0a0a0a] border border-[#1f1f1f]">
                <TypeIcon type={item.type} />
              </div>
              {item.type}
            </td>
            <td className="py-6 font-bold text-white">
              {item.type === 'Withdraw' ? '-' : '+'}${item.amount.toFixed(2)}
            </td>
            <td className="py-6 pr-8 text-right">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                item.status === 'SUCCESS' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination with < and > */}
  <div className="flex flex-col sm:flex-row justify-between items-center px-8 py-5 bg-[#0a0a0a] border-t border-[#1f1f1f] gap-4">
    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
      Showing page {currentPage}
    </span>
    <div className="flex gap-2">
      <button 
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#111] border border-[#1f1f1f] text-gray-400 hover:text-white hover:border-[#EB712B] transition-all"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#EB712B] text-black font-black">
        {currentPage}
      </div>
      <button 
        onClick={() => setCurrentPage(p => (startIndex + itemsPerPage < transactions.length ? p + 1 : p))} 
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#111] border border-[#1f1f1f] text-gray-400 hover:text-white hover:border-[#EB712B] transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
</div>

      {isDepositModalOpen && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
    <div className="bg-[#121212] border border-white/[0.08] p-8 rounded-[2rem] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight">Deposit Funds</h2>
        <button 
          onClick={() => setIsDepositModalOpen(false)} 
          className="text-gray-500 hover:text-white transition-colors duration-200"
        >
          ✕
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-5">
        {[
          { label: 'Card number', placeholder: '1564-2451-5468' },
          { label: 'Account holder', placeholder: 'Jenny Wilson' }
        ].map((field) => (
          <div key={field.label}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
              {field.label}
            </label>
            <input 
              className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300"
              placeholder={field.placeholder} 
            />
          </div>
        ))}

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">Expiry</label>
            <input className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300" placeholder="02/25" />
          </div>
          <div className="flex-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">CVV</label>
            <input className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300" placeholder="125" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">Amount</label>
          <input className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300" placeholder="$00.00" />
        </div>

        {/* Action Button */}
        <button className="w-full bg-[#EB712B] hover:bg-[#ff8c4a] text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_10px_20px_-10px_rgba(235,113,43,0.5)] mt-4">
          Confirm Deposit
        </button>
      </div>
    </div>
  </div>
)}

      {isWithdrawModalOpen && (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
    <div className="bg-[#121212] border border-white/[0.08] p-8 rounded-[2rem] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight">Withdraw Funds</h2>
        <button 
          onClick={() => setIsWithdrawModalOpen(false)} 
          className="text-gray-500 hover:text-white transition-colors duration-200"
        >
          ✕
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-6">
        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">Account Number</label>
          <input 
            className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#A65E36] focus:ring-1 focus:ring-[#A65E36] outline-none transition-all duration-300" 
            placeholder="e.g., 9876-5432-10" 
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">Account Holder</label>
          <input 
            className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#A65E36] focus:ring-1 focus:ring-[#A65E36] outline-none transition-all duration-300" 
            placeholder="Full Name" 
          />
        </div>

        <div>
          <div className="flex justify-between mb-2.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Amount</label>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Available: $12,450.80</span>
          </div>
          <div className="relative">
            <input 
              className="w-full bg-[#1a1a1a] border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#A65E36] focus:ring-1 focus:ring-[#A65E36] outline-none transition-all duration-300 pr-16" 
              placeholder="$0.00" 
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#A65E36] hover:text-[#c47141] transition-colors">
              MAX
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-[#A65E36] hover:bg-[#8e502e] text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_10px_20px_-10px_rgba(166,94,54,0.5)]">
          Confirm Withdrawal
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}