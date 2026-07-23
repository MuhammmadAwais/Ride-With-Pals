import { useState, useMemo } from 'react';
import { Bike, Globe, Trophy, Award, Filter, TrendingUp, Activity } from 'lucide-react';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { useGetClubLeaderboardAppRidesQuery } from '@/features/club/api/clubApiSlice';
import { useGetStravaLeaderboardDataQuery } from '@/features/club/api/stravaApiSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useActiveClub } from '@/hooks/useActiveClub';

const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="relative p-6 bg-surface border border-border backdrop-blur-xl rounded-3xl overflow-hidden hover:border-[#EB712B]/40 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold">{title}</p>
      <div className="p-2 rounded-xl bg-hover group-hover:bg-[#EB712B] transition-colors duration-500">
        <Icon size={16} className="text-[#EB712B] group-hover:text-white transition-colors duration-500" />
      </div>
    </div>
    <div className="text-3xl font-extrabold text-text-main tracking-tighter">{value}</div>
    <div className="mt-4 w-full h-1 bg-border rounded-full overflow-hidden">
      <div className="w-1/3 h-full bg-[#EB712B] rounded-full transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
    </div>
  </div>
);

const LeaderboardSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded bg-[#222]" />
          <div className="w-10 h-10 rounded-full bg-[#222]" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-[#222] rounded" />
            <div className="w-32 h-3 bg-[#222] rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-[#222] rounded-full" />
        <div className="w-24 h-8 bg-[#222] rounded" />
      </div>
    ))}
  </div>
);

export const Leaderboard = ({ clubId }: { clubId?: string | number }) => {
  const [activeTab, setActiveTab] = useState<'app' | 'strava'>('app');
  const joinedClubs = useAppSelector((state) => state.club.myClubs) || [];
  
  const { clubId: reduxClubId, setActiveClub } = useActiveClub();

  let activeClubId = clubId || reduxClubId;
  if (!activeClubId && joinedClubs.length > 0) {
    activeClubId = joinedClubs[0].id.toString();
  }

  const handleClubChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newClubId = e.target.value;
    const clubObj = joinedClubs.find((c: any) => c.id.toString() === newClubId);
    if (clubObj) setActiveClub(clubObj as any);
  };

  // App Rides query
  const { data: rawLeaderboard, isLoading: isLoadingApp } = useGetClubLeaderboardAppRidesQuery(
    { clubId: Number(activeClubId) },
    { skip: !activeClubId || activeTab !== 'app' }
  );

  // Strava query
  const { data: stravaData, isLoading: isLoadingStrava } = useGetStravaLeaderboardDataQuery(
    { clubId: Number(activeClubId) },
    { skip: !activeClubId || activeTab !== 'strava' }
  );

  const isLoading = activeTab === 'app' ? isLoadingApp : isLoadingStrava;

  const leaderboardData = useMemo(() => {
    if (activeTab === 'app') {
      const raw = rawLeaderboard as any;
      const dataArray = raw?.rows || raw?.data || raw?.response?.data || [];
      const items = Array.isArray(dataArray) ? dataArray : Array.isArray(rawLeaderboard) ? rawLeaderboard : [];
      
      return items.map((item: any, index: number) => ({
        id: index + 1,
        name: item.userName || item.name || 'Unknown Rider',
        role: item.role || 'Member',
        team: item.team || 'RWP Squad',
        status: item.status || 'Active',
        rides: item.ridesCount || item.totalRides || 0,
        attendance: `${item.attendance || 100}%`,
        avatar: item.profileImage || null
      }));
    } else {
      const items = Array.isArray(stravaData) ? stravaData : (stravaData as any)?.rows || [];
      return items.map((item: any, index: number) => ({
        id: index + 1,
        name: item.fullName || 'Strava Rider',
        role: 'Strava',
        team: item.totalDistance ? `${item.totalDistance} km` : 'Strava Sync',
        status: 'Active',
        rides: item.totalRides || item.ridesCount || 0,
        attendance: item.totalElevation ? `${item.totalElevation}m elev` : '100%',
        avatar: item.profileImage || null
      }));
    }
  }, [activeTab, rawLeaderboard, stravaData]);

  const columns: Column<any>[] = [
    {
      key: 'id',
      label: 'Rank',
      sortable: true,
      render: (user) => <div className="text-[#EB712B]/50 font-black text-xl">{user.id < 10 ? `0${user.id}` : user.id}</div>
    },
    {
      key: 'name',
      label: 'Member Identity',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border border-border" alt="" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#252525] border border-border flex items-center justify-center font-bold text-[#EB712B] text-xs uppercase">
              {user.name.substring(0, 2)}
            </div>
          )}
          <div>
            <div className="font-bold text-text-main transition-colors">{user.name}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest">{user.role} • {user.team}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (user) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${user.status === 'Active' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-border text-text-muted'}`}>
          {user.status === 'Active' && <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span></span>}
          {user.status}
        </span>
      )
    },
    {
      key: 'rides',
      label: 'Performance',
      sortable: true,
      headerClass: "text-right",
      cellClass: "text-right",
      render: (user) => (
        <div>
          <div className="font-bold text-sm text-text-main">{user.rides} <span className="text-text-muted font-normal">Rides</span></div>
          <div className="flex justify-end items-center gap-2 mt-1">
            <span className="text-[9px] text-text-muted font-bold">{user.attendance}</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="text-text-main p-6 md:p-16 font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20">
            <TrendingUp size={14} className="text-[#EB712B]" />
            <span className="text-[10px] font-bold tracking-widest text-[#EB712B] uppercase">Performance Analytics</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-text-main tracking-tighter">Leaderboard</h1>
          <p className="text-text-muted text-sm max-w-xl">
            Live metrics and performance ranking for current club members.
          </p>
        </div>

        {/* Club Selector & Source Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'app' ? 'bg-[#EB712B] text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <Bike size={14} /> App Rides
            </button>
            <button
              onClick={() => setActiveTab('strava')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'strava' ? 'bg-[#FC4C02] text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <Activity size={14} /> Strava
            </button>
          </div>

          {joinedClubs.length > 0 && (
            <div className="relative">
              <select
                value={activeClubId}
                onChange={handleClubChange}
                className="w-full sm:w-64 bg-surface border border-border rounded-xl px-4 py-3 text-xs font-bold text-text-main appearance-none cursor-pointer hover:border-[#EB712B]/40 transition-colors focus:outline-none"
              >
                {joinedClubs.map((club: any) => (
                  <option key={club.id} value={club.id} className="bg-surface text-text-main">
                    {club.clubName || club.name}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={14} />
            </div>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <StatCard title="Active Racers" value={leaderboardData.length.toString()} icon={Bike} />
        <StatCard title="Total Rides" value={leaderboardData.reduce((acc, curr) => acc + curr.rides, 0).toString()} icon={Trophy} />
        <StatCard title="Top Participant" value={leaderboardData[0]?.name || "N/A"} icon={Award} />
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-[32px] p-6 lg:p-8 shadow-2xl">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : leaderboardData.length > 0 ? (
          <DataTable data={leaderboardData} columns={columns} />
        ) : (
          <div className="text-center py-12 text-text-muted font-bold text-xs uppercase tracking-wider">
            No leaderboard data found for this club under {activeTab === 'app' ? 'App Rides' : 'Strava'}.
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
