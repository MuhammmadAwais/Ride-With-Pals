import { useState, useMemo } from "react";
import {
  Bike,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { useGetClubRidesQuery } from "@/features/club/api/clubApiSlice";
import { useActiveClub } from "@/hooks/useActiveClub";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
);

// --- Types ---
interface Activity {
  id: number;
  name: string;
  region: string;
  distance: string;
  level: "ADVANCED" | "PRO ELITE" | "INTERMEDIATE" | string;
  status: "IN PROGRESS" | "SCHEDULED" | "OPEN" | "COMPLETED" | "ARCHIVED" | string;
  participants: string;
  progress: number;
  imageUrl: string;
  leaderImageUrl: string;
}

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#222]" />
          <div className="space-y-2">
            <div className="w-28 h-4 bg-[#222] rounded" />
            <div className="w-20 h-3 bg-[#222] rounded" />
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#222]" />
        <div className="w-20 h-4 bg-[#222] rounded" />
        <div className="w-16 h-6 bg-[#222] rounded-full" />
        <div className="w-20 h-4 bg-[#222] rounded" />
      </div>
    ))}
  </div>
);

const SummaryCard = ({ label, value, subtext, icon, isLive }: any) => (
  <div
    className={`p-6 rounded-2xl border ${isLive ? "bg-surface shadow-lg border-[#EB712B]/40" : "border-border bg-surface"}`}
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
        {label}
      </span>
      <span className="text-[#EB712B]">{icon}</span>
    </div>
    <div className="text-3xl font-black mb-1 text-text-main">{value}</div>
    <div className="text-[10px] text-text-muted font-medium">{subtext}</div>
  </div>
);

const ActivitiesRegistry = () => {
  const [activeTab, setActiveTab] = useState("Active");

  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : 0;

  const { data: ridesData, isLoading } = useGetClubRidesQuery(
    { clubId },
    { skip: !clubId }
  );

  const activities = useMemo<Activity[]>(() => {
    const rows = ridesData?.rows || [];
    return rows.map((ride: any) => ({
      id: ride.id,
      name: ride.rideName || ride.title || ride.name || "Untitled Ride",
      region: ride.meetingPoint || ride.location || "Unknown Region",
      distance: `${ride.distance || 0} km`,
      level: ride.difficultyLevel || "INTERMEDIATE",
      status: ride.status || "OPEN",
      participants: `${ride.participantsCount || 0} riders`,
      progress: ride.progress || 0,
      imageUrl: ride.coverImage || "/Images/CycleImage2.png",
      leaderImageUrl: ride.leaderImage || "/Images/ProfileImage.png"
    }));
  }, [ridesData]);

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "Active")
      return (
        act.status === "IN PROGRESS" ||
        act.status === "SCHEDULED" ||
        act.status === "OPEN" ||
        act.status === "active" ||
        act.status === "scheduled" ||
        act.status === "open"
      );
    if (activeTab === "Completed") return act.status === "COMPLETED" || act.status === "completed";
    if (activeTab === "Archived") return act.status === "ARCHIVED" || act.status === "archived";
    return true;
  });

  const columns: Column<Activity>[] = [
    {
      key: 'name',
      label: 'Activity',
      sortable: true,
      render: (act) => (
        <div className="flex items-center gap-4">
          <img src={act.imageUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
          <div>
            <div className="font-bold text-sm text-text-main group-hover:text-[#EB712B] transition-colors">{act.name}</div>
            <div className="text-xs text-text-muted">{act.region}</div>
          </div>
        </div>
      )
    },
    {
      key: 'leader',
      label: 'Leadership',
      sortable: false,
      render: (act) => (
        <img src={act.leaderImageUrl} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
      )
    },
    {
      key: 'distance',
      label: 'Metrics',
      sortable: true,
      render: (act) => (
        <div>
          <div className="font-mono text-sm font-bold text-text-main">{act.distance}</div>
          <div className="w-20 h-1.5 bg-border rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#EB712B] rounded-full" style={{ width: `${act.progress}%` }} />
          </div>
        </div>
      )
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (act) => (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-border bg-hover text-text-muted uppercase">{act.level}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (act) => (
        <div className="flex items-center gap-2 text-xs font-medium text-text-main uppercase">
          {act.status.toUpperCase() === "COMPLETED" ? <CheckCircle2 size={14} className="text-emerald-400" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B]" />}
          {act.status}
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: () => <ChevronRight size={20} className="text-text-muted hover:text-text-main transition-transform cursor-pointer" />
    }
  ];

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Completed Carpools",
        data: [
          3000, 2500, 9500, 4000, 3500, 4500, 4000, 5000, 4500, 5500, 6000,
          7000,
        ],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: "Ride Bookings",
        data: [
          4000, 3500, 3000, 4500, 4000, 3800, 4200, 4800, 4500, 5000, 5500,
          6000,
        ],
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#71717a" } },
      y: {
        min: 0,
        max: 10000,
        grid: { color: "#27272a" },
        ticks: { color: "#71717a" },
      },
    },
  };

  return (
    <div className="p-4 md:p-8 text-text-main font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-main">Activities</h1>
          <p className="text-text-muted mt-2 text-sm max-w-md">
            Review and manage all recorded rides across your club network.
          </p>
        </div>
      </div>

      {/* Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          label="TOTAL ACTIVE"
          value={activities.length || "0"}
          subtext="+0% from last week"
          icon={<Bike size={20} />}
        />
        <SummaryCard
          label="AVG DISTANCE"
          value="68 km"
          subtext="Target: 75km"
          icon={<BarChart3 size={20} />}
        />
        <SummaryCard
          label="ELEVATION GAIN"
          value="1.4k"
          subtext="New record set"
          icon={<TrendingUp size={20} />}
        />
        <SummaryCard
          label="LIVE STATUS"
          value={activities.filter(a => a.status.toLowerCase() === 'in progress').length || "0"}
          subtext="Activities in progress"
          icon={<Bike size={20} />}
          isLive={true}
        />
      </div>

      {/* --- TABS AND TABLE SECTION --- */}
      <div className="flex flex-col gap-6">
        {/* Tab Switcher */}
        <div className="flex bg-surface p-1.5 rounded-xl border border-border w-full md:w-fit">
          {["Active", "Completed", "Archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-3 md:px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                activeTab === tab
                  ? "bg-[#EB712B] text-white shadow-lg"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Container */}
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl relative min-h-[200px]">
          {isLoading ? (
            <TableSkeleton />
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No activities found for this club yet.
            </div>
          ) : (
            <DataTable data={filteredActivities} columns={columns} />
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-8 bg-surface rounded-3xl border border-border mt-8">
        <h3 className="text-xl font-bold mb-1 text-text-main">Data Velocity Over Time</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions as any} />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesRegistry;
