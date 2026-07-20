import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bike,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { ROUTES } from "@/Constants";
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
  numericDistance?: number;
  elevationGain?: number;
  level: "ADVANCED" | "PRO ELITE" | "INTERMEDIATE" | string;
  status: "IN PROGRESS" | "SCHEDULED" | "OPEN" | "COMPLETED" | "ARCHIVED" | string;
  participants: string;
  progress: number;
  imageUrl: string;
  leaderImageUrl: string;
  date?: string | Date;
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Active");

  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : 0;

  const { data: ridesData, isLoading } = useGetClubRidesQuery(
    { clubId },
    { skip: !clubId }
  );

  const activities = useMemo<Activity[]>(() => {
    const rows = ridesData?.rows || (Array.isArray(ridesData) ? ridesData : []);
    const map = new Map();
    rows.forEach((ride: any) => {
      if (ride.id && !map.has(ride.id)) {
        map.set(ride.id, {
          id: ride.id,
          name: ride.rideName || ride.title || ride.name || "Untitled Ride",
          region: ride.meetingPoint || ride.location || "Unknown Region",
          distance: `${ride.distance || 0} km`,
          numericDistance: Number(ride.distance || 0),
          elevationGain: Number(ride.elevationGain || 0),
          level: ride.difficultyLevel || "INTERMEDIATE",
          status: ride.status || "OPEN",
          participants: `${ride.participantsCount || 0} riders`,
          progress: ride.progress || 0,
          imageUrl: ride.coverImage || "/Images/CycleImage2.png",
          leaderImageUrl: ride.leaderImage || (ride.rideLeaders?.[0]?.imageUrl) || "/Images/ProfileImage.png",
          date: ride.date || ride.createdAt
        });
      }
    });
    return Array.from(map.values());
  }, [ridesData]);

  // --- Dynamic Summary Metrics ---
  const totalActiveCount = useMemo(() => {
    return activities.filter((a) =>
      ["IN PROGRESS", "SCHEDULED", "OPEN", "ACTIVE"].includes(a.status.toUpperCase())
    ).length;
  }, [activities]);

  const avgDistance = useMemo(() => {
    if (!activities.length) return "0 km";
    const sum = activities.reduce((acc, a) => acc + (a.numericDistance || 0), 0);
    const avg = Math.round(sum / activities.length);
    return `${avg} km`;
  }, [activities]);

  const totalElevationGain = useMemo(() => {
    if (!activities.length) return "0 m";
    const sum = activities.reduce((acc, a) => acc + (a.elevationGain || 0), 0);
    return sum >= 1000 ? `${(sum / 1000).toFixed(1)}k m` : `${sum} m`;
  }, [activities]);

  const liveStatusCount = useMemo(() => {
    return activities.filter((a) => a.status.toUpperCase() === "IN PROGRESS").length;
  }, [activities]);

  // --- Dynamic Chart Data ---
  const dynamicChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonthIdx = new Date().getMonth();
    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonthIdx - i + 12) % 12;
      labels.push(months[mIdx]);
    }

    const ridesCountPerMonth = new Array(6).fill(0);
    const distancePerMonth = new Array(6).fill(0);

    activities.forEach((act) => {
      if (act.date) {
        const d = new Date(act.date);
        const mName = months[d.getMonth()];
        const labelIdx = labels.indexOf(mName);
        if (labelIdx !== -1) {
          ridesCountPerMonth[labelIdx] += 1;
          distancePerMonth[labelIdx] += act.numericDistance || 0;
        }
      }
    });

    return {
      labels,
      datasets: [
        {
          label: "Total Distance (km)",
          data: distancePerMonth,
          borderColor: "#EB712B",
          backgroundColor: "rgba(235, 113, 43, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
        {
          label: "Active Rides",
          data: ridesCountPerMonth,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
      ],
    };
  }, [activities]);

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "Active")
      return (
        act.status.toUpperCase() === "IN PROGRESS" ||
        act.status.toUpperCase() === "SCHEDULED" ||
        act.status.toUpperCase() === "OPEN" ||
        act.status.toUpperCase() === "ACTIVE"
      );
    if (activeTab === "Completed") return act.status.toUpperCase() === "COMPLETED";
    if (activeTab === "Archived") return act.status.toUpperCase() === "ARCHIVED";
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
            <div className="h-full bg-[#EB712B] rounded-full" style={{ width: `${act.progress || 100}%` }} />
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

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { color: "#a1a1aa", font: { size: 12 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#71717a" } },
      y: {
        beginAtZero: true,
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
        <button
          onClick={() => navigate(ROUTES.ADD_RIDE)}
          className="px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#EB712B]/20 flex items-center gap-2 cursor-pointer border-0 outline-none"
        >
          <Plus size={16} /> Create Ride
        </button>
      </div>

      {/* Dynamic Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          label="TOTAL ACTIVE"
          value={totalActiveCount}
          subtext={`${activities.length} total recorded`}
          icon={<Bike size={20} />}
        />
        <SummaryCard
          label="AVG DISTANCE"
          value={avgDistance}
          subtext={`Across ${activities.length} ${activities.length === 1 ? 'activity' : 'activities'}`}
          icon={<BarChart3 size={20} />}
        />
        <SummaryCard
          label="ELEVATION GAIN"
          value={totalElevationGain}
          subtext="Total cumulative elevation"
          icon={<TrendingUp size={20} />}
        />
        <SummaryCard
          label="LIVE STATUS"
          value={liveStatusCount}
          subtext="Activities currently live"
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

      {/* Dynamic Activity Metrics Chart */}
      <div className="p-8 bg-surface rounded-3xl border border-border mt-8">
        <h3 className="text-xl font-bold mb-1 text-text-main">Activity Metrics Over Time</h3>
        <p className="text-xs text-text-muted mb-4">Monthly distribution of distance and rides created across your club.</p>
        <div className="h-64">
          <Line data={dynamicChartData} options={chartOptions as any} />
        </div>
      </div>
    </div>
  );
};

export default ActivitiesRegistry;
