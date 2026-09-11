import { useState, useMemo, useEffect } from 'react';
import { Bike, Trophy, Award, Filter, TrendingUp, Activity } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { useGetClubLeaderboardAppRidesQuery } from '@/features/club/api/clubApiSlice';
import { useGetStravaLeaderboardDataQuery } from '@/features/club/api/stravaApiSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useActiveClub } from '@/hooks/useActiveClub';
import { resolveImageUrl } from '@/features/public-club/services/clubGeocoding';

const LeaderboardAvatar = ({ avatar, name }: { avatar?: string | null; name: string }) => {
  const [hasError, setHasError] = useState(false);

  // Reset error if avatar changes
  useEffect(() => {
    setHasError(false);
  }, [avatar]);

  const resolvedUrl = useMemo(() => {
    if (!avatar || hasError) return null;
    const url = resolveImageUrl(avatar);
    return url || null;
  }, [avatar, hasError]);

  const initials = useMemo(() => {
    const clean = (name || 'Rider').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'R';
  }, [name]);

  if (!resolvedUrl || hasError) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#252525] border border-border flex items-center justify-center font-bold text-[#EB712B] text-xs uppercase shrink-0 select-none shadow-sm">
        {initials}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full border border-border overflow-hidden shrink-0 bg-[#1c1c1c] shadow-sm flex items-center justify-center">
      <img
        src={resolvedUrl}
        alt={name}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon }: any) => (
  <div className="relative p-5 sm:p-6 bg-surface border border-border/80 backdrop-blur-xl rounded-3xl overflow-hidden hover:border-[#EB712B]/40 hover:shadow-xl transition-all duration-300 group flex items-center gap-4 sm:gap-5">
    {/* Large Prominent Icon Container */}
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#EB712B]/15 via-[#EB712B]/10 to-transparent border border-[#EB712B]/25 flex items-center justify-center shrink-0 group-hover:bg-[#EB712B] group-hover:scale-105 transition-all duration-300 shadow-md">
      <Icon size={28} className="text-[#EB712B] group-hover:text-white transition-colors duration-300 shrink-0" />
    </div>

    {/* Text & Value Side-by-Side with Icon */}
    <div className="min-w-0 flex-1 space-y-1">
      <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] text-text-muted font-black truncate">
        {title}
      </p>
      <div className="text-2xl sm:text-3xl font-black text-text-main tracking-tight truncate leading-tight">
        {value}
      </div>
    </div>

    {/* Bottom Accent Bar on Hover */}
    <div className="absolute bottom-0 inset-x-0 h-1 bg-border/40 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-r from-transparent via-[#EB712B]/60 to-[#EB712B] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
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
      const dataArray = raw?.rows || raw?.data || raw?.response?.rows || raw?.response?.data || [];
      const items = Array.isArray(dataArray) ? dataArray : Array.isArray(rawLeaderboard) ? rawLeaderboard : [];
      
      return items.map((item: any, index: number) => ({
        id: index + 1,
        name: item.userName || item.name || item.fullName || item.user?.fullName || item.user?.username || t`Unknown Rider`,
        role: item.role || item.user?.role || t`Member`,
        team: item.team || 'RWP Squad',
        status: item.status || 'Active',
        rides: item.ridesCount ?? item.rideCount ?? item.totalRides ?? 0,
        attendance: `${item.attendance || 100}%`,
        avatar: item.profileImage || item.profilePhoto || item.profilePicUrl || item.avatar || item.user?.profileImage || item.user?.profilePhoto || null
      }));
    } else {
      const raw = stravaData as any;
      const dataArray = raw?.rows || raw?.data || raw?.response?.rows || raw?.response?.data || [];
      const items = Array.isArray(dataArray) ? dataArray : Array.isArray(stravaData) ? stravaData : [];
      return items.map((item: any, index: number) => ({
        id: index + 1,
        name: item.fullName || item.name || item.userName || (item.firstname ? `${item.firstname} ${item.lastname || ''}`.trim() : 'Strava Rider'),
        role: 'Strava',
        team: item.totalDistance ? `${item.totalDistance} km` : (item.totalKm ? `${item.totalKm} km` : 'Strava Sync'),
        status: 'Active',
        rides: item.totalRides ?? item.ridesCount ?? item.rideCount ?? 0,
        attendance: item.totalElevation ? `${item.totalElevation}m elev` : '100%',
        avatar: item.profileImage || item.profile || item.profile_medium || item.profilePhoto || item.avatar || item.user?.profileImage || null
      }));
    }
  }, [activeTab, rawLeaderboard, stravaData]);

  const columns: Column<any>[] = useMemo(() => [
    {
      key: 'id',
      label: t`Rank`,
      sortable: true,
      render: (user) => <div className="text-[#EB712B]/50 font-black text-xl">{user.id < 10 ? `0${user.id}` : user.id}</div>
    },
    {
      key: 'name',
      label: t`Member Identity`,
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-4">
          <LeaderboardAvatar avatar={user.avatar} name={user.name} />
          <div>
            <div className="font-bold text-text-main transition-colors">{user.name}</div>
            <div className="text-[10px] text-text-muted uppercase tracking-widest">{user.role} • {user.team}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: t`Status`,
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
      label: t`Performance`,
      sortable: true,
      headerClass: "text-right",
      cellClass: "text-right",
      render: (user) => (
        <div>
          <div className="font-bold text-sm text-text-main">{user.rides} <span className="text-text-muted font-normal"><Trans>Rides</Trans></span></div>
          <div className="flex justify-end items-center gap-2 mt-1">
            <span className="text-[9px] text-text-muted font-bold">{user.attendance}</span>
          </div>
        </div>
      )
    }
  ], []);

  return (
    <div className="text-text-main p-6 md:p-16 font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20">
            <TrendingUp size={14} className="text-[#EB712B]" />
            <span className="text-[10px] font-bold tracking-widest text-[#EB712B] uppercase"><Trans>Performance Analytics</Trans></span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-text-main tracking-tighter"><Trans>Leaderboard</Trans></h1>
          <p className="text-text-muted text-sm max-w-xl">
            <Trans>Live metrics and performance ranking for current club members.</Trans>
          </p>
        </div>

        {/* Club Selector & Source Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex bg-surface p-1 rounded-xl border border-border">
            <button
              onClick={() => setActiveTab('app')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'app' ? 'bg-[#EB712B] text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <Bike size={14} /> <Trans>App Rides</Trans>
            </button>
            <button
              onClick={() => setActiveTab('strava')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === 'strava' ? 'bg-[#FC4C02] text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              <Activity size={14} /> <Trans>Strava</Trans>
            </button>
          </div>

          {joinedClubs.length > 0 && (
            <div className="relative">
              <select
                value={activeClubId ?? ''}
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
        <StatCard title={t`Active Racers`} value={leaderboardData.length.toString()} icon={Bike} />
        <StatCard title={t`Total Rides`} value={leaderboardData.reduce((acc: number, curr: any) => acc + curr.rides, 0).toString()} icon={Trophy} />
        <StatCard title={t`Top Participant`} value={leaderboardData[0]?.name || "N/A"} icon={Award} />
      </div>

      {/* Table Section */}
      <div className="bg-surface border border-border rounded-[32px] p-6 lg:p-8 shadow-2xl">
        {isLoading ? (
          <LeaderboardSkeleton />
        ) : leaderboardData.length > 0 ? (
          <DataTable data={leaderboardData} columns={columns} />
        ) : (
          <div className="text-center py-12 text-text-muted font-bold text-xs uppercase tracking-wider">
            <Trans>No leaderboard data found for this club under {activeTab === 'app' ? 'App Rides' : 'Strava'}.</Trans>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
