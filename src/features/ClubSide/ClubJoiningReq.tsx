import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { ClubService } from '@/api/backendApi';

export const ClubJoiningReq = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async () => {
    let clubId = localStorage.getItem("selectedClubId");
    if (!clubId) {
      try {
        const clubsRes = await ClubService.getJoinedClubs();
        const clubs = clubsRes?.response?.data || clubsRes?.data || clubsRes || [];
        if (clubs.length > 0) {
          clubId = clubs[0].id.toString();
          localStorage.setItem("selectedClubId", clubId);
        }
      } catch (e) {
        console.error("Failed to fetch user's joined clubs for joining requests", e);
      }
    }
    if (!clubId) return;

    setIsLoading(true);
    try {
      const response = await ClubService.getClubJoinRequest({ clubId: Number(clubId) });
      const items = response?.response?.data || response?.data || response || [];
      const mapped = items.map((req: any) => ({
        id: req.id?.toString() || Math.random().toString(),
        name: req.user?.name || req.name || 'Unknown Athlete',
        image: req.user?.profileImage || req.image || '/default-avatar.png',
        org: req.org || req.club?.name || 'RWP Rider',
        status: req.status?.toLowerCase() || 'pending'
      }));
      setRequests(mapped);
    } catch (err) {
      console.error("Failed to fetch club joining requests", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      await ClubService.manageJoinGroupRequest({ requestId: Number(id), status: 'approved' });
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req));
    } catch (err) {
      console.error("Failed to accept request", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await ClubService.manageJoinGroupRequest({ requestId: Number(id), status: 'rejected' });
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error("Failed to reject request", err);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'name',
      label: 'Athlete',
      sortable: true,
      render: (req) => (
        <div className="flex items-center gap-4">
          <img src={req.image} alt={req.name} onError={(e) => (e.currentTarget.src = '/default-avatar.png')} className="w-10 h-10 rounded-xl object-cover border border-border" />
          <div>
            <div className="font-bold text-sm text-text-main">{req.name}</div>
            <div className="text-[10px] text-text-muted font-medium tracking-widest uppercase">{req.id}</div>
          </div>
        </div>
      )
    },
    {
      key: 'org',
      label: 'Organization',
      sortable: true,
      render: (req) => <div className="text-sm font-medium text-text-muted">{req.org}</div>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (req) => (
        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border border-border uppercase tracking-wider ${req.status === 'accepted' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-surface text-text-muted'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
          {req.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (req) => (
        <div className="flex justify-end gap-2">
          {req.status === 'pending' ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleReject(req.id); }} className="p-2 rounded-xl border border-border hover:bg-red-500/10 hover:border-red-500/20 text-text-muted hover:text-red-400 transition-all">
                <X size={16} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleAccept(req.id); }} className="flex items-center gap-2 text-xs px-4 py-2 bg-[#EB712B] hover:bg-[#ff7e36] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#EB712B]/20">
                <Check size={14} /> Accept
              </button>
            </>
          ) : (
            <span className="text-xs font-bold text-green-500 px-4 py-2">Accepted</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="w-full text-text-main rounded-3xl border border-border shadow-2xl relative overflow-hidden bg-surface">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EB712B]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end mb-10 px-6 pt-6 relative z-10">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#EB712B] rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-text-main">Joining Requests</h2>
          </div>
          <p className="text-text-muted text-xs md:text-sm mt-4 max-w-md font-medium leading-relaxed">
            Manage pending athlete memberships with <span className="text-[#EB712B]">precision and professional oversight</span>.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-main-bg rounded-xl border border-border shadow-lg">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-[#EB712B]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#EB712B] animate-ping" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
            {requests.filter(r => r.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="relative z-10 border-t border-border">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EB712B]"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            No joining requests available.
          </div>
        ) : (
          <DataTable data={requests} columns={columns} />
        )}
      </div>
    </div>
  );
};
