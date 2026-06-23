import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { useTableSort } from "@/hooks/useTableSort";
import DataTable, { type Column } from "@/components/ui/DataTable";

const chartData = {
  "30D": {
    label: "Last 30 Days telemetry",
    bars: [40, 60, 30, 45, 90, 50, 40, 75, 40, 60],
  },
  "90D": {
    label: "Last 90 Days telemetry",
    bars: [70, 30, 50, 80, 20, 60, 45, 35, 90, 55],
  },
  "1Y": {
    label: "Last 1 Year telemetry",
    bars: [30, 40, 60, 30, 50, 70, 80, 40, 30, 90],
  },
};

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: "Sale" | "Deposit" | "Withdraw";
  status: "SUCCESS" | "PENDING";
}

const transactions: Transaction[] = [
  {
    id: "#TR-9284-AX",
    date: "Oct 24, 2023",
    amount: 47.0,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9285-BR",
    date: "Oct 24, 2023",
    amount: 35.0,
    type: "Deposit",
    status: "SUCCESS",
  },
  {
    id: "#TR-9286-LM",
    date: "Oct 23, 2023",
    amount: 29.0,
    type: "Withdraw",
    status: "PENDING",
  },
  {
    id: "#TR-9287-PQ",
    date: "Oct 22, 2023",
    amount: 25.0,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9288-WX",
    date: "Oct 21, 2023",
    amount: 60.0,
    type: "Deposit",
    status: "SUCCESS",
  },
  {
    id: "#TR-9289-YZ",
    date: "Oct 20, 2023",
    amount: 42.5,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9290-AB",
    date: "Oct 19, 2023",
    amount: 15.0,
    type: "Withdraw",
    status: "PENDING",
  },
  {
    id: "#TR-9291-CD",
    date: "Oct 18, 2023",
    amount: 88.0,
    type: "Deposit",
    status: "SUCCESS",
  },
  {
    id: "#TR-9292-EF",
    date: "Oct 17, 2023",
    amount: 33.0,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9293-GH",
    date: "Oct 16, 2023",
    amount: 55.0,
    type: "Withdraw",
    status: "SUCCESS",
  },

  {
    id: "#TR-9294-IJ",
    date: "Oct 15, 2023",
    amount: 120.0,
    type: "Deposit",
    status: "SUCCESS",
  },
  {
    id: "#TR-9295-KL",
    date: "Oct 15, 2023",
    amount: 12.5,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9296-MN",
    date: "Oct 14, 2023",
    amount: 45.0,
    type: "Withdraw",
    status: "PENDING",
  },
  {
    id: "#TR-9297-OP",
    date: "Oct 13, 2023",
    amount: 200.0,
    type: "Deposit",
    status: "SUCCESS",
  },
  {
    id: "#TR-9298-QR",
    date: "Oct 12, 2023",
    amount: 55.25,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9299-ST",
    date: "Oct 11, 2023",
    amount: 30.0,
    type: "Withdraw",
    status: "SUCCESS",
  },
  {
    id: "#TR-9300-UV",
    date: "Oct 10, 2023",
    amount: 75.0,
    type: "Deposit",
    status: "SUCCESS",
  },
  {
    id: "#TR-9301-WX",
    date: "Oct 09, 2023",
    amount: 10.0,
    type: "Sale",
    status: "SUCCESS",
  },
  {
    id: "#TR-9302-YZ",
    date: "Oct 08, 2023",
    amount: 95.0,
    type: "Withdraw",
    status: "PENDING",
  },
  {
    id: "#TR-9293-GH",
    date: "Oct 16, 2023",
    amount: 55.0,
    type: "Withdraw",
    status: "SUCCESS",
  },
];

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "Sale") return <CreditCard size={16} />;
  if (type === "Deposit") return <ArrowDownRight size={16} />;
  return <ArrowUpRight size={16} />;
};

const StatCard = ({ title, value, icon: Icon, iconColor, bgColor }: any) => (
  <div className="bg-surface p-6 rounded-3xl border border-border flex items-center gap-5 hover:border-border transition-colors">
    <div
      className={`p-4 rounded-2xl ${bgColor} flex items-center justify-center`}
    >
      <Icon size={24} className={iconColor} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">
        {title}
      </p>
      <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

export default function WalletDashboard() {
  const [range, setRange] = useState<"30D" | "90D" | "1Y">("30D");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const { items: sortedTransactions, requestSort, sortConfig } = useTableSort(transactions);

  const itemsPerPage = 4;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      label: 'Transaction ID',
      sortable: true,
      cellClass: "pl-8 font-bold text-gray-200",
      headerClass: "pl-8"
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      cellClass: "text-gray-400"
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3 text-gray-300">
          <div className="p-2 rounded-xl bg-main-bg border border-border">
            <TypeIcon type={item.type} />
          </div>
          {item.type}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount ($)',
      sortable: true,
      render: (item) => (
        <div className="font-bold text-white">
          {item.type === "Withdraw" ? "-" : "+"}${item.amount.toFixed(2)}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      cellClass: "pr-8 text-right",
      headerClass: "pr-8 text-right",
      render: (item) => (
        <span
          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
            item.status === "SUCCESS"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
          }`}
        >
          {item.status}
        </span>
      )
    }
  ];

  return (
    <div className="p-4 md:p-8 min-h-screen text-text-main font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div className="relative group mb-12">
          {/* Decorative Background Accent */}
          <div className="absolute -left-4 top-0 w-1 h-12 bg-[#EB712B] rounded-full blur-[1px]"></div>

          <div className="pl-6">
            <h1 className="text-4xl md:text-5xl font-black text-text-main tracking-tighter uppercase  leading-none">
              Financial
              <span className="text-[#EB712B] "> Wallet</span>
            </h1>
            <p className="mt-6 text-text-muted font-bold text-5xl tracking-widest uppercase text-[10px]">
              Monitoring liquidity and operational performance metrics.{" "}
              <span className="text-[#EB712B]">Lindsey Culhane</span>
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-[#EB712B] hover:bg-[#EB712B]/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all transform active:scale-95 shadow-lg shadow-[#EB712B]/20">
          <DollarSign size={18} />
          Withdraw Funds
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-surface p-8 rounded-3xl border border-border shadow-2xl relative overflow-hidden group">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#EB712B]/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-[#EB712B]/20 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-text-muted mb-2 font-medium tracking-wide text-sm uppercase">
              <WalletIcon size={16} className="text-[#EB712B]" />
              Available Balance
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-text-main mb-6">
              $12,450.00
            </h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Total Earnings</span>
              <span className="font-bold text-text-main">$45,230.00</span>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className="lg:col-span-2 bg-surface p-8 rounded-3xl border border-border shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-text-main">Revenue Overview</h2>
            <div className="flex bg-hover rounded-lg p-1">
              {(["7D", "30D", "1Y"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setRange(period)}
                  className={`px-4 py-1.5 text-xs rounded-lg ${
                    range === period
                      ? "bg-surface shadow-sm text-text-main font-bold"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {period}
                </button>
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
        <StatCard
          title="Growth"
          value="+14.2%"
          icon={TrendingUp}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          title="Avg Ticket"
          value="$124.50"
          icon={DollarSign}
          iconColor="text-[#EB712B]"
          bgColor="bg-[#EB712B]/10"
        />
        <StatCard
          title="Trust Score"
          value="99.8%"
          icon={ShieldCheck}
          iconColor="text-purple-500"
          bgColor="bg-purple-500/10"
        />
      </div>
      <div className="bg-surface rounded-3xl mt-7 border border-border overflow-hidden shadow-2xl ">
        <DataTable data={paginatedData} columns={columns} sortConfig={sortConfig} onRequestSort={requestSort} />

        {/* Pagination with < and > */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-8 py-5 bg-main-bg border-t border-border gap-4">
          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, transactions.length)} of{" "}
            {transactions.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-main hover:bg-hover hover:border-text-muted cursor-pointer transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#EB712B] text-white font-black">
              {currentPage}
            </div>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  startIndex + itemsPerPage < transactions.length ? p + 1 : p,
                )
              }
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-border text-text-main hover:bg-hover hover:border-text-muted cursor-pointer transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Deposit code */}

      {isDepositModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-surface border border-white/[0.08] p-8 rounded-[2rem] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Deposit Funds
              </h2>
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
                { label: "Card number", placeholder: "1564-2451-5468" },
                { label: "Account holder", placeholder: "Jenny Wilson" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
                    {field.label}
                  </label>
                  <input
                    className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
                    Expiry
                  </label>
                  <input
                    className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300"
                    placeholder="02/25"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
                    CVV
                  </label>
                  <input
                    className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300"
                    placeholder="125"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
                  Amount
                </label>
                <input
                  className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all duration-300"
                  placeholder="$00.00"
                />
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
          <div className="bg-surface border border-white/[0.08] p-8 rounded-[2rem] w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Withdraw Funds
              </h2>
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
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
                  Account Number
                </label>
                <input
                  className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#A65E36] focus:ring-1 focus:ring-[#A65E36] outline-none transition-all duration-300"
                  placeholder="e.g., 9876-5432-10"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] block mb-2.5">
                  Account Holder
                </label>
                <input
                  className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#A65E36] focus:ring-1 focus:ring-[#A65E36] outline-none transition-all duration-300"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                    Amount
                  </label>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    Available: $12,450.80
                  </span>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-hover border border-white/[0.05] p-4 rounded-2xl text-sm text-white focus:border-[#A65E36] focus:ring-1 focus:ring-[#A65E36] outline-none transition-all duration-300 pr-16"
                    placeholder="$0.00"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#EB712B] transition-colors">
                    MAX
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full bg-[#EB712B] text-white py-4 rounded-2xl font-bold transition-all duration-300 ">
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
