import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Plus,
  Eye,
  Edit2,
  Copy,
  MapPin,
  Image as ImageIcon,
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
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { updateStepFields, resetRideForm } from "@/features/club/slices/addRideSlice";
import { useActiveClub } from "@/hooks/useActiveClub";
import { useClubPermissions } from "@/hooks/useClubPermissions";
import { resolveImageUrl } from "@/features/public-club/services/clubGeocoding";
import AvatarLightboxModal from "@/components/ui/AvatarLightboxModal";
import { toast } from "sonner";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

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
  endingPoint?: string;
  distance: string;
  numericDistance?: number;
  elevationGain?: number;
  level: "ADVANCED" | "PRO ELITE" | "INTERMEDIATE" | string;
  status: "IN PROGRESS" | "SCHEDULED" | "OPEN" | "COMPLETED" | "ARCHIVED" | string;
  participants: string;
  progress: number;
  imageUrl: string;
  leaderImageUrl: string;
  leaderName: string;
  date?: string;
  time?: string;
  description?: string;
  pace?: string;
  categoryTypeId?: number;
  activityTypeId?: number;
  sportSubTypeId?: number;
  isPublic?: boolean;
  isRecurringActivity?: boolean;
  recurringActivities?: string[];
  expiryDate?: string;
  isStops?: boolean;
  stops?: number[];
  isWomenAndNonBinary?: boolean;
  isPaymentRequired?: boolean;
  price?: number;
  termsAndConditions?: string;
  gpxFile?: string;
  rideLeaders?: any[];
  supportCarDriver?: any;
  rawRide?: any;
}

const getInitials = (name: string) => {
  if (!name) return "L";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

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
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("Active");

  const { clubId: clubIdStr } = useActiveClub();
  const clubId = clubIdStr ? Number(clubIdStr) : 0;
  const permissions = useClubPermissions(clubId || undefined);

  const { data: ridesData, isLoading } = useGetClubRidesQuery(
    { clubId },
    { skip: !clubId }
  );

  // Lightbox Modal state
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl?: string;
    name?: string;
    subtitle?: string;
    tag?: string;
    actionLabel?: string;
    onAction?: () => void;
  }>({ isOpen: false });

  const activities = useMemo<Activity[]>(() => {
    const rows = ridesData?.rows || (Array.isArray(ridesData) ? ridesData : []);
    const map = new Map();
    rows.forEach((ride: any) => {
      if (ride.id && !map.has(ride.id)) {
        const leaderName =
          ride.rideLeaders?.[0]?.fullName ||
          ride.rideLeaders?.[0]?.name ||
          ride.rideLeaders?.[0]?.user?.fullName ||
          ride.user?.fullName ||
          ride.creator?.fullName ||
          "Leader";

        const rawLeaderImage =
          ride.rideLeaders?.[0]?.profileImage ||
          ride.rideLeaders?.[0]?.user?.profileImage ||
          ride.user?.profileImage ||
          ride.creator?.profileImage ||
          ride.leaderImage ||
          ride.profileImage ||
          "";

        const leaderImageUrl = resolveImageUrl(rawLeaderImage);

        const rawCoverImage =
          ride.coverImage ||
          ride.image ||
          ride.activityImage ||
          ride.club?.coverImage ||
          ride.club?.logo ||
          "";

        const imageUrl = resolveImageUrl(rawCoverImage) || "/Images/CycleImage2.png";

        map.set(ride.id, {
          id: ride.id,
          name: ride.rideName || ride.title || ride.name || "Untitled Ride",
          region: ride.meetingPoint || ride.location || "Unknown Region",
          endingPoint: ride.endingPoint || "",
          distance: `${ride.distance || 0} km`,
          numericDistance: Number(ride.distance || 0),
          elevationGain: Number(ride.elevationGain || 0),
          level: ride.difficultyLevel || ride.level || "INTERMEDIATE",
          status: ride.status || "OPEN",
          participants: `${ride.participantsCount || (Array.isArray(ride.joinedParticipants) ? ride.joinedParticipants.length : 0)} riders`,
          progress: ride.progress || 0,
          imageUrl,
          leaderImageUrl,
          leaderName,
          date: ride.date ? String(ride.date).substring(0, 10) : "",
          time: ride.time ? String(ride.time).substring(0, 5) : "",
          description: ride.description || "",
          pace: ride.pace || "Medium",
          categoryTypeId: ride.categoryTypeId || 1,
          activityTypeId: ride.activityTypeId || 2,
          sportSubTypeId: ride.sportSubTypeId || 5,
          isPublic: ride.isPublic !== undefined ? ride.isPublic : true,
          isRecurringActivity: Boolean(ride.isRecurringActivity),
          recurringActivities: ride.recurringActivities || [],
          expiryDate: ride.expiryDate || "",
          isStops: Boolean(ride.isStops),
          stops: ride.stops || [],
          isWomenAndNonBinary: Boolean(ride.isWomenAndNonBinary),
          isPaymentRequired: Boolean(ride.isPaymentRequired || (ride.price && Number(ride.price) > 0)),
          price: Number(ride.price || 0),
          termsAndConditions: ride.termsAndConditions || "",
          gpxFile: ride.gpxFile || "",
          rideLeaders: ride.rideLeaders || [],
          supportCarDriver: ride.supportCarDriver || null,
          rawRide: ride,
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
          label: t`Total Distance (km)`,
          data: distancePerMonth,
          borderColor: "#EB712B",
          backgroundColor: "rgba(235, 113, 43, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        },
        {
          label: t`Active Rides`,
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

  // Handler for Option A Edit (Full 3-Step Wizard Navigation matching Mobile App)
  const handleOpenEdit = (act: Activity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/view/clubside/edit-ride/${act.id}`);
  };

  // Handler for Duplicate Activity
  const handleDuplicate = (act: Activity, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dispatch(resetRideForm());
    dispatch(
      updateStepFields({
        rideName: `${act.name} (Copy)`,
        meetingPoint: act.region,
        endingPoint: act.endingPoint || "",
        distance: act.numericDistance || 0,
        elevationGain: act.elevationGain || 0,
        pace: act.pace || "Medium",
        description: act.description || "",
        currentStep: 1,
      })
    );
    toast.info(t`Loaded activity template. You can customize and publish.`);
    navigate(ROUTES.ADD_RIDE);
  };

  const columns: Column<Activity>[] = [
    {
      key: 'name',
      label: t`Activity`,
      sortable: true,
      render: (act) => (
        <div className="flex items-center gap-4 group/item">
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setLightboxData({
                isOpen: true,
                imageUrl: act.imageUrl,
                name: act.name,
                subtitle: act.region,
                tag: t`Activity Cover`,
                actionLabel: t`View Full Details`,
                onAction: () => navigate(`/view/userside/dashboard/ride/${act.id}`),
              });
            }}
            className="relative cursor-zoom-in shrink-0 group/img"
            title={t`Click to preview image`}
          >
            <img 
              src={act.imageUrl} 
              className="w-12 h-12 rounded-2xl object-cover border border-border bg-[#1e1e1e] group-hover/img:scale-105 transition-transform" 
              alt={act.name}
              onError={(e) => {
                e.currentTarget.src = "/Images/CycleImage2.png";
              }}
            />
            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
              <ImageIcon size={14} className="text-white" />
            </div>
          </div>
          <div 
            onClick={() => navigate(`/view/userside/dashboard/ride/${act.id}`)}
            className="cursor-pointer"
          >
            <div className="font-bold text-sm text-text-main group-hover/item:text-[#EB712B] transition-colors">{act.name}</div>
            <div className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-[#EB712B]" />
              <span>{act.region}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'leader',
      label: t`Leadership`,
      sortable: false,
      render: (act) => {
        const initials = getInitials(act.leaderName);
        return (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (act.leaderImageUrl) {
                setLightboxData({
                  isOpen: true,
                  imageUrl: act.leaderImageUrl,
                  name: act.leaderName,
                  subtitle: t`Ride Leader`,
                  tag: t`Leadership`,
                });
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer" 
            title={act.leaderName}
          >
            <div className="relative w-10 h-10 shrink-0">
              {act.leaderImageUrl ? (
                <img
                  src={act.leaderImageUrl}
                  alt={act.leaderName}
                  className="w-10 h-10 rounded-full object-cover border border-border shadow-sm hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-10 rounded-full bg-[#EB712B]/20 text-[#EB712B] font-bold text-xs items-center justify-center border border-[#EB712B]/30 shrink-0 ${
                  act.leaderImageUrl ? "hidden" : "flex"
                }`}
              >
                {initials}
              </div>
            </div>
            <span className="text-xs font-semibold text-text-main hidden xl:inline truncate max-w-[120px]">
              {act.leaderName}
            </span>
          </div>
        );
      }
    },
    {
      key: 'distance',
      label: t`Metrics`,
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
      label: t`Level`,
      sortable: true,
      render: (act) => (
        <span className="px-3 py-1 rounded-full text-[10px] font-bold border border-border bg-hover text-text-muted uppercase">{act.level}</span>
      )
    },
    {
      key: 'status',
      label: t`Status`,
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
      label: t`Actions`,
      sortable: false,
      render: (act) => (
        <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
          {/* View Details */}
          <button
            type="button"
            onClick={() => navigate(`/view/userside/dashboard/ride/${act.id}`)}
            className="w-8 h-8 rounded-lg bg-hover border border-border hover:border-[#EB712B]/50 hover:bg-[#EB712B]/10 hover:text-[#EB712B] text-text-muted flex items-center justify-center transition-all cursor-pointer"
            title={t`View activity details`}
          >
            <Eye size={15} />
          </button>

          {/* Edit Activity (Admin/Owner) -> Full 3-Step Wizard Option A */}
          {(permissions.canPublishRides || permissions.isOwner || permissions.isAdmin) && (
            <button
              type="button"
              onClick={(e) => handleOpenEdit(act, e)}
              className="w-8 h-8 rounded-lg bg-hover border border-border hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 text-text-muted flex items-center justify-center transition-all cursor-pointer"
              title={t`Edit activity (3-Step Wizard)`}
            >
              <Edit2 size={14} />
            </button>
          )}

          {/* Duplicate Activity (Admin/Owner) */}
          {(permissions.canPublishRides || permissions.isOwner || permissions.isAdmin) && (
            <button
              type="button"
              onClick={(e) => handleDuplicate(act, e)}
              className="w-8 h-8 rounded-lg bg-hover border border-border hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 text-text-muted flex items-center justify-center transition-all cursor-pointer"
              title={t`Duplicate activity template`}
            >
              <Copy size={14} />
            </button>
          )}

          {/* Chevron */}
          <button
            type="button"
            onClick={() => navigate(`/view/userside/dashboard/ride/${act.id}`)}
            className="w-8 h-8 rounded-lg hover:bg-hover text-text-muted hover:text-text-main flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent"
            title={t`Open details`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )
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
          <h1 className="text-3xl font-bold tracking-tight text-text-main"><Trans>Activities</Trans></h1>
          <p className="text-text-muted mt-2 text-sm max-w-md">
            <Trans>Review, manage, edit, and organize all recorded rides across your club network.</Trans>
          </p>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADD_RIDE)}
          className="px-5 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#EB712B]/20 flex items-center gap-2 cursor-pointer border-0 outline-none"
        >
          <Plus size={16} /> <Trans>Create Ride</Trans>
        </button>
      </div>

      {/* Dynamic Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          label={t`TOTAL ACTIVE`}
          value={totalActiveCount}
          subtext={t`Scheduled & In-Progress`}
          icon={<CheckCircle2 size={24} />}
          isLive={liveStatusCount > 0}
        />
        <SummaryCard
          label={t`AVERAGE DISTANCE`}
          value={avgDistance}
          subtext={t`Across all recorded rides`}
          icon={<ChevronRight size={24} />}
        />
        <SummaryCard
          label={t`ELEVATION GAIN`}
          value={totalElevationGain}
          subtext={t`Cumulative vertical ascent`}
          icon={<ChevronRight size={24} />}
        />
        <SummaryCard
          label={t`LIVE STATUS`}
          value={liveStatusCount > 0 ? t`Active (${liveStatusCount})` : t`Standby`}
          subtext={liveStatusCount > 0 ? t`Rides currently on the road` : t`No active live rides`}
          icon={<CheckCircle2 size={24} />}
          isLive={liveStatusCount > 0}
        />
      </div>

      {/* Main Table Area */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-border">
          {["Active", "Completed", "Archived"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-6 text-sm font-bold transition-all border-b-2 cursor-pointer outline-none ${
                activeTab === tab
                  ? "border-[#EB712B] text-[#EB712B]"
                  : "border-transparent text-text-muted hover:text-text-main"
              }`}
            >
              {tab === "Active" ? <Trans>Active</Trans> : tab === "Completed" ? <Trans>Completed</Trans> : <Trans>Archived</Trans>}
            </button>
          ))}
        </div>

        {/* Dynamic Data Table */}
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl relative min-h-[200px]">
          {isLoading ? (
            <TableSkeleton />
          ) : filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              <Trans>No activities found for this club yet.</Trans>
            </div>
          ) : (
            <DataTable 
              data={filteredActivities} 
              columns={columns} 
            />
          )}
        </div>
      </div>

      {/* Dynamic Activity Metrics Chart */}
      <div className="p-8 bg-surface rounded-3xl border border-border mt-8">
        <h3 className="text-xl font-bold mb-1 text-text-main"><Trans>Activity Metrics Over Time</Trans></h3>
        <p className="text-xs text-text-muted mb-4"><Trans>Monthly distribution of distance and rides created across your club.</Trans></p>
        <div className="h-64">
          <Line data={dynamicChartData} options={chartOptions as any} />
        </div>
      </div>

      {/* --- Lightbox Modal for Cover Images & Avatars --- */}
      <AvatarLightboxModal
        isOpen={lightboxData.isOpen}
        onClose={() => setLightboxData({ isOpen: false })}
        imageUrl={lightboxData.imageUrl}
        name={lightboxData.name}
        subtitle={lightboxData.subtitle}
        tag={lightboxData.tag}
        actionLabel={lightboxData.actionLabel}
        onAction={lightboxData.onAction}
      />
    </div>
  );
};

export default ActivitiesRegistry;
