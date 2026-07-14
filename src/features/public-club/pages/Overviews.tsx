import { useState, useEffect } from "react";
import { MapPin, Users, ShieldCheck, ExternalLink, Activity } from "lucide-react";
import { ClubService } from "@/features/club/services/clubService";

interface OverviewsProps {
  clubId?: number | string;
}

const useClubOverview = (clubId?: number | string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [clubDetails, setClubDetails] = useState<any | null>(null);
  const [admins, setAdmins] = useState<any[]>([]);

  useEffect(() => {
    if (!clubId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch club details
        try {
          const clubRes = await ClubService.getClubById(Number(clubId));
          const clubData = clubRes?.response || clubRes?.data || clubRes;
          setClubDetails(clubData);
        } catch (e) {
          console.error("Failed to load club details:", e);
        }

        // Fetch club members to extract administrators (might fail with 403 if not joined yet)
        try {
          const membersRes = await ClubService.getClubMembers(Number(clubId), 50, 0);
          const membersList = membersRes?.response?.rows || membersRes?.response?.data || membersRes?.data?.data || membersRes?.data || membersRes?.rows || membersRes?.response || [];
          
          // Filter admins and owners
          const adminUsers = Array.isArray(membersList) 
            ? membersList.filter((m: any) => {
                const role = m.role?.toLowerCase();
                return role === 'owner' || role === 'organizer' || role === 'admin';
              })
            : [];
          
          setAdmins(adminUsers);
        } catch (e) {
          console.warn("Failed to load club members (user might not be joined yet):", e);
          setAdmins([]);
        }
      } catch (err) {
        console.error("Failed to load club overview data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [clubId]);

  // Description paragraphs fallback
  const rawDescription = clubDetails?.description;
  const descriptionParagraphs = rawDescription 
    ? rawDescription.split('\n').filter((p: string) => p.trim() !== '')
    : ["N/A"];

  // Administrators list fallback
  const displayAdmins = admins.length > 0 
    ? admins.map((m: any) => ({
        id: m.id?.toString() || m.userId?.toString() || String(Math.random()),
        name: ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || m.username || 'Administrator',
        joined: m.createdAt ? `Joined ${new Date(m.createdAt).toLocaleDateString()}` : "Member",
        status: m.role || "Admin",
        avatar: m.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      }))
    : [
        {
          id: "1",
          name: "Esther Howard",
          joined: "Member since January 2024",
          status: "Actively Ride",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
        },
        {
          id: "2",
          name: "Cameron Williamson",
          joined: "Joined March 2024",
          status: "Everyday Ride",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        }
      ];

  // Location display
  const displayLocation = {
    city: clubDetails?.location 
      ? clubDetails.location.split(',')[0].trim() 
      : "N/A",
    address: clubDetails?.location || "N/A",
    type: "Club Location & Training Facility"
  };

  // Membership statistics
  const totalMembersVal = clubDetails?.memberCount || 0;
  const displayStats = {
    totalMembers: totalMembersVal.toLocaleString(),
    capacityPercentage: Math.min(100, Math.max(10, Math.round((totalMembersVal / 200) * 100))),
    passionateRide: "70% this mo.",
    avgSession: "68.2K"
  };

  return {
    isLoading,
    description: descriptionParagraphs,
    administrators: displayAdmins,
    location: displayLocation,
    stats: displayStats
  };
};

export default function Overviews({ clubId }: OverviewsProps) {
  const { isLoading, description, administrators, location, stats } = useClubOverview(clubId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full animate-pulse">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-surface border border-border rounded-3xl h-64" />
          <div className="bg-surface border border-border rounded-3xl h-44" />
        </div>
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-3xl h-40" />
          <div className="bg-surface border border-border rounded-3xl h-56" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
      
      <div className="lg:col-span-2 space-y-8">
        
        <div className="bg-surface border border-border rounded-3xl p-8 space-y-5 relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:border-border">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#EB712B]/5 rounded-full blur-3xl" />
          
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-text-main flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#EB712B] rounded-full" />
            Club Description
          </h2>
          <div className="space-y-4 text-text-muted text-xs leading-relaxed font-medium">
            {description.map((paragraph: string, index: number) => (
              <p key={index} className="text-text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Administrator Section */}
        <div className="space-y-5">
          <h2 className="text-sm font-black uppercase tracking-[0.15em] text-text-main flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#EB712B] rounded-full" />
            Administrators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {administrators.map((admin) => (
              <div 
                key={admin.id}
                className="bg-surface border border-border hover:border-[#EB712B]/30 rounded-3xl p-5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-black/40"
              >
                <img 
                  src={admin.avatar} 
                  alt={admin.name} 
                  className="w-14 h-14 rounded-2xl object-cover border border-border shadow-inner"
                />
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black uppercase tracking-tight text-text-main truncate">
                      {admin.name}
                    </h4>
                    <ShieldCheck size={16} className="text-[#EB712B] shrink-0" />
                  </div>
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.05em] mt-0.5 truncate">
                    {admin.joined}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-hover text-text-muted border border-border rounded-xl text-[9px] font-black uppercase tracking-wider mt-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> {admin.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        
        {/* Location Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 space-y-4 transition-all duration-300 hover:border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-text-main flex items-center gap-2.5">
              <MapPin size={18} className="text-[#EB712B]" /> Location
            </h3>
            <button className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-main cursor-pointer transition-colors bg-hover px-2.5 py-1.5 rounded-lg border border-border">
              Map <ExternalLink size={10} />
            </button>
          </div>
          <div className="bg-main-bg/50 p-4 rounded-2xl border border-border space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wide text-text-main">{location.city}</h4>
            <p className="text-[10px] font-medium text-text-muted leading-relaxed">
              {location.address}
            </p>
            <div className="pt-2 border-t border-border">
              <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider">
                {location.type}
              </span>
            </div>
          </div>
        </div>

        {/* Members Statistics Card */}
        <div className="bg-surface border border-border rounded-3xl p-6 space-y-5 transition-all duration-300 hover:border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-text-main flex items-center gap-2.5">
              <Users size={18} className="text-[#EB712B]" /> Membership
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-text-main">{stats.totalMembers}</span>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">registered</span>
            </div>
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">
              Club capacity status indicator
            </p>

            {/* Capacity Bar */}
            <div className="w-full h-2.5 bg-hover rounded-full mt-5 overflow-hidden relative flex items-center">
              <div 
                className="h-full bg-gradient-to-r from-[#EB712B] to-[#ff8f50] rounded-full relative overflow-hidden transition-all duration-500" 
                style={{ width: `${stats.capacityPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white/20 skew-x-[-45deg] w-10 animate-[ping_2s_infinite]" />
              </div>
            </div>
            <div className="flex justify-between text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">
              <span>0</span>
              <span className="text-[#EB712B]">{stats.capacityPercentage}% Capacity</span>
              <span>Max</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-5 mt-2">
              <div className="bg-hover p-3.5 rounded-2xl border border-border">
                <span className="block text-[8px] font-black text-text-muted uppercase tracking-wider">Passionate Ride</span>
                <span className="block text-xs font-black text-[#EB712B] uppercase tracking-wide mt-1.5 flex items-center gap-1">
                  <Activity size={12} /> {stats.passionateRide}
                </span>
              </div>
              <div className="bg-hover p-3.5 rounded-2xl border border-border">
                <span className="block text-[8px] font-black text-text-muted uppercase tracking-wider">Avg Session</span>
                <span className="block text-xs font-black text-text-main uppercase tracking-wide mt-1.5">
                  {stats.avgSession}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}