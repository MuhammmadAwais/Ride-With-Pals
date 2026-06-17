import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const handleAccept = (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'accepted' } : req));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="w-full text-white rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden ">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EB712B]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end mb-10 px-6 pt-6">
        <div>
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-[#EB712B] rounded-full" />
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Joining Requests</h2>
          </div>
          <p className="text-gray-400 text-xs md:text-sm mt-4 max-w-md font-medium leading-relaxed">
            Manage pending athlete memberships with <span className="text-[#EB712B]">precision and professional oversight</span>.
          </p>
        </div>
        
        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-[#121212] rounded-xl border border-white/5 shadow-lg">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-[#EB712B]" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-[#EB712B] animate-ping" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">
            {requests.filter(r => r.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* List Container */}
      <div className="w-full px-6">
        <div className="hidden md:grid grid-cols-4 text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-4 px-2">
          <span>Athlete</span>
          <span>Organization</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="space-y-2">
          {paginatedRequests.map((req) => (
            <div 
              key={req.id} 
              className="grid grid-cols-[1fr,auto] md:grid-cols-4 items-center p-3 rounded-2xl bg-[#0f0f0f] border border-white/[0.04] hover:border-[#EB712B]/20 hover:bg-[#141414] transition-all duration-300"
            >
              {/* Athlete */}
              <div className="flex items-center gap-4">
                <img src={req.image} alt={req.name} onError={(e) => (e.currentTarget.src = '/default-avatar.png')} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                <div>
                  <div className="font-bold text-sm text-white">{req.name}</div>
                  <div className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">{req.id}</div>
                </div>
              </div>
              
              {/* Org (Hidden on mobile) */}
              <div className="hidden md:block text-sm font-medium text-gray-400">{req.org}</div>
              
              {/* Status (Hidden on mobile) */}
              <div className="hidden md:block">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border border-white/[0.05] uppercase tracking-wider ${req.status === 'accepted' ? 'bg-green-500/10 text-green-500' : 'bg-[#1a1a1a] text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  {req.status}
                </span>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2">
                {req.status === 'pending' ? (
                  <>
                    <button onClick={() => handleReject(req.id)} className="p-2 rounded-xl border border-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-gray-500 hover:text-red-400 transition-all">
                      <X size={16} />
                    </button>
                    <button onClick={() => handleAccept(req.id)} className="flex items-center gap-2 text-xs px-4 py-2 bg-[#EB712B] hover:bg-[#ff7e36] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#EB712B]/20">
                      <Check size={14} /> Accept
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-green-500 px-4 py-2">Accepted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6 px-6 pb-6 border-t border-white/[0.08] pt-6">
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-[0.2em]">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1.5">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.05] bg-[#121212] hover:bg-[#1a1a1a] disabled:opacity-20 transition-all">
            <ChevronLeft size={16} />
          </button>
          <div className="px-4 h-8 flex items-center text-[11px] font-bold bg-white/[0.03] rounded-lg border border-white/[0.05]">{currentPage}</div>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/[0.05] bg-[#121212] hover:bg-[#1a1a1a] disabled:opacity-20 transition-all">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};