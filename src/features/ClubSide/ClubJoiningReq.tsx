import { useState } from 'react';
import { Check, X } from 'lucide-react';
import DataTable, { type Column } from "@/components/ui/DataTable";

const initialRequests = [
  { id: 'ATH-90210', name: 'Albert Flores', org: 'Mountain Ride', image: '/Images/GirlImage11.png', status: 'pending' },
  { id: 'ATH-88432', name: 'Marcus Chen', org: 'Velocity Sprint', image: '/Images/Girlmage6.png', status: 'pending' },
  { id: 'ATH-77215', name: 'Sarah Jenkins', org: 'Aqua Dynamics', image: '/Images/GirlImage10.png', status: 'pending' },
  { id: 'ATH-66509', name: 'Elena Rodriguez', org: 'Peak Power', image: '/Images/Girlmage1.png', status: 'pending' },
  { id: 'ATH-55401', name: 'David Miller', org: 'Mountain Ride', image: '/Images/Girlmage3.png', status: 'pending' },
  { id: 'ATH-44302', name: 'James Wilson', org: 'Velocity Sprint', image: '/Images/GirlImage11.png', status: 'pending' },
  { id: 'ATH-33201', name: 'Linda Scott', org: 'Aqua Dynamics', image: '/Images/Girlmage4.png', status: 'pending' },
  { id: 'ATH-22100', name: 'Robert Fox', org: 'Peak Power', image: '/Images/Girlmage5.png', status: 'pending' },
  { id: 'ATH-11990', name: 'Emily Blunt', org: 'Mountain Ride', image: '/Images/GrilImage11.png', status: 'pending' },
  { id: 'ATH-55667', name: 'Chris Evans', org: 'Velocity Sprint', image: '/Images/Girlmage7.png', status: 'pending' },
];

export const ClubJoiningReq = () => {
  const [requests, setRequests] = useState(initialRequests);

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const columns: Column<typeof initialRequests[0]>[] = [
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
        <DataTable data={requests} columns={columns} />
      </div>
    </div>
  );
};