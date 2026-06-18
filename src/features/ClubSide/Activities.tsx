import { useState } from "react";
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
  level: "ADVANCED" | "PRO ELITE" | "INTERMEDIATE";
  status: "IN PROGRESS" | "SCHEDULED" | "OPEN" | "COMPLETED" | "ARCHIVED";
  participants: string;
  progress: number;
  imageUrl: string;
  leaderImageUrl: string;
}

const girlImages = [
  "Girlmage1.png",
  "Girlmage2.png",
  "Girlmage3.png",
  "Girlmage4.png",
  "Girlmage5.png",
  "GrilImage11.png",
  "GirlImage11.png",
  "GirlImage11.png",
  "Girlmage9.png",
  "GirlImage10.png",
];
const leaderImages = [
  "Girlmage1.png",
  "Girlmage2.png",
  "Girlmage3.png",
  "Girlmage4.png",
  "Girlmage5.png",
  "GrilImage11.png",
  "GirlImage11.png",
  "GirlImage11.png",
  "Girlmage9.png",
  "GirlImage10.png",
];

const SummaryCard = ({ label, value, subtext, icon, isLive }: any) => (
  <div
    className={`p-6 rounded-2xl border ${isLive ? "bg-[#161616] border-orange-500/40" : "border-zinc-800 bg-[#111111]"}`}
  >
    <div className="flex justify-between items-start mb-4">
      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
        {label}
      </span>
      <span className="text-orange-500">{icon}</span>
    </div>
    <div className="text-3xl font-black mb-1">{value}</div>
    <div className="text-[10px] text-zinc-500 font-medium">{subtext}</div>
  </div>
);

const ActivitiesRegistry = () => {
  const [activeTab, setActiveTab] = useState("Active");

  const [activities] = useState<Activity[]>(
    Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Activity ${i + 1}`,
      region: "Alpine Range",
      distance: "80 KM",
      level: "ADVANCED",
      status:
        i % 3 === 0 ? "COMPLETED" : i % 5 === 0 ? "ARCHIVED" : "IN PROGRESS",
      participants: "18 / 38",
      progress: i % 3 === 0 ? 100 : 50,
      imageUrl: `/Images/${girlImages[i % 10]}`,
      leaderImageUrl: `/Images/${leaderImages[i % 10]}`,
    })),
  );

  const filteredActivities = activities.filter((act) => {
    if (activeTab === "Active")
      return (
        act.status === "IN PROGRESS" ||
        act.status === "SCHEDULED" ||
        act.status === "OPEN"
      );
    if (activeTab === "Completed") return act.status === "COMPLETED";
    if (activeTab === "Archived") return act.status === "ARCHIVED";
    return true;
  });

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
    <div className="min-h-screen p-4 md:p-8 text-white font-sans ">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold">Activities Registry</h1>
        </div>

        {/* Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            label="TOTAL ACTIVE"
            value="24"
            subtext="+12% from last week"
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
            value="08"
            subtext="Activities in progress"
            icon={<Bike size={20} />}
            isLive={true}
          />
        </div>

        {/* --- TABS AND TABLE SECTION --- */}
        <div className="flex flex-col gap-6">
          {/* Tab Switcher */}
          <div className="flex bg-[#111111] p-1.5 rounded-xl border border-zinc-800 w-full md:w-fit">
            {["Active", "Completed", "Archived"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-3 md:px-6 py-2.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-[#EB712B] text-white shadow-lg"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table Container */}
          <div className="bg-[#111111] rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800/60 bg-[#0c0c0c]">
                    {[
                      "Activity",
                      "Leadership",
                      "Metrics",
                      "Level",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="p-6 text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredActivities.map((act) => (
                    <tr
                      key={act.id}
                      className="group hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={act.imageUrl}
                            className="w-12 h-12 rounded-2xl object-cover"
                            alt=""
                          />
                          <div>
                            <div className="font-bold text-sm group-hover:text-orange-500 transition-colors">
                              {act.name}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {act.region}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <img
                          src={act.leaderImageUrl}
                          className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                          alt=""
                        />
                      </td>
                      <td className="p-6">
                        <div className="font-mono text-sm font-bold text-zinc-300">
                          {act.distance}
                        </div>
                        <div className="w-20 h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${act.progress}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-zinc-700 bg-zinc-900 text-zinc-400">
                          {act.level}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-xs font-medium">
                          {act.status === "COMPLETED" ? (
                            <CheckCircle2
                              size={14}
                              className="text-emerald-400"
                            />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          )}
                          {act.status}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <ChevronRight
                          size={20}
                          className="text-zinc-600 group-hover:text-white transition-transform group-hover:translate-x-1"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="p-8 bg-[#111111] rounded-3xl border border-zinc-800 mt-8">
          <h3 className="text-xl font-bold mb-1">Data Velocity Over Time</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions as any} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesRegistry;
