import { useState, useMemo } from 'react';
import { Search, User, MoreVertical, X, Mail, ShieldAlert, Ban, MessageSquare, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { toast } from 'sonner';
import { useGetClubMembersListQuery, useRemoveClubMemberMutation } from '@/features/club/api/clubApiSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import UserProfileModal from './components/UserProfileModal';


export interface Member {
  id: string;
  profilePhoto: string;
  name: string;
  phoneNo: string;
  email: string;
  role: 'Admin' | 'Member';
  subscriptionPlan: 'Silver' | 'Gold' | 'Diamond';
  joinDate: string;
  status: 'Active' | 'Suspended';
}

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#222]" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-[#222] rounded" />
            <div className="w-32 h-3 bg-[#222] rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-[#222] rounded-full" />
        <div className="w-24 h-4 bg-[#222] rounded" />
        <div className="w-12 h-4 bg-[#222] rounded" />
        <div className="w-16 h-4 bg-[#222] rounded" />
        <div className="w-20 h-4 bg-[#222] rounded" />
      </div>
    ))}
  </div>
);

import { useActiveClub } from '@/hooks/useActiveClub';

interface MembersProps {
  clubId?: string | number;
}

const Members: React.FC<MembersProps> = ({ clubId: propClubId }) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const { clubId: activeClubIdRedux, setActiveClub } = useActiveClub();
  let activeClubIdStr = propClubId?.toString() || activeClubIdRedux?.toString() || null;
  
  const joinedRows = useAppSelector((state) => state.club.myClubs) || [];
  
  if (!activeClubIdStr && joinedRows.length > 0) {
    activeClubIdStr = joinedRows[0].id.toString();
    setActiveClub(joinedRows[0] as any);
  }

  const effectiveClubId = activeClubIdStr ? Number(activeClubIdStr) : 0;
  const { data: membersData, isLoading } = useGetClubMembersListQuery(
    { clubId: effectiveClubId },
    { skip: !effectiveClubId }
  );

  const [removeMember, { isLoading: isRemoving }] = useRemoveClubMemberMutation();

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember({ clubId: effectiveClubId, userId: Number(userId) }).unwrap();
      toast.success("Member removed successfully!");
      setActiveMenuId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to remove member.");
    }
  };

  const formattedMembers = useMemo<Member[]>(() => {
    if (!membersData) return [];
    return membersData.map((m: any) => ({
      id: (m.userId || m.id)?.toString(),
      profilePhoto: m.profileImage || "",
      name: ((m.firstName || '') + ' ' + (m.lastName || '')).trim() || m.username || 'Unnamed',
      phoneNo: m.phoneNumber || 'N/A',
      email: m.email || 'N/A',
      role: (m.role === 'Admin' ? 'Admin' : 'Member'),
      subscriptionPlan: (['Silver', 'Gold', 'Diamond'].includes(m.subscriptionPlan) ? m.subscriptionPlan : 'Silver') as 'Silver' | 'Gold' | 'Diamond',
      joinDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
      status: 'Active',
    }));
  }, [membersData]);

  const filteredMembers = useMemo(() => {
    if (!searchInput) return formattedMembers;
    
    const lowerSearch = searchInput.toLowerCase();
    return formattedMembers.filter((member) => {
      return (
        member.name.toLowerCase().includes(lowerSearch) ||
        member.phoneNo.toLowerCase().includes(lowerSearch) ||
        member.email.toLowerCase().includes(lowerSearch) ||
        member.role.toLowerCase().includes(lowerSearch)
      );
    });
  }, [searchInput, formattedMembers]);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  const columns: Column<Member>[] = [
    {
      key: 'name',
      label: 'Member',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-hover flex items-center justify-center flex-shrink-0 border border-border overflow-hidden">
            {row.profilePhoto ? (
              <img src={row.profilePhoto} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-text-muted" />
            )}
          </div>
          <div>
            <div className="text-sm font-bold text-text-main">{row.name}</div>
            <div className="text-[10px] text-text-muted">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
          row.role === 'Admin' ? 'bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20' : 'bg-hover text-text-muted border border-border'
        }`}>
          {row.role}
        </span>
      ),
    },
    { 
      key: 'phoneNo', 
      label: 'Phone no.', 
      sortable: true,
      render: (row) => <span className="text-sm font-medium text-text-main">{row.phoneNo}</span>
    },
    { 
      key: 'subscriptionPlan', 
      label: 'Plan', 
      sortable: true,
      render: (row) => <span className="text-sm font-medium text-text-main">{row.subscriptionPlan}</span>
    },
    { 
      key: 'joinDate', 
      label: 'Join Date', 
      sortable: true,
      render: (row) => <span className="text-xs text-text-muted">{row.joinDate}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          <span className="text-xs font-medium text-text-main">{row.status}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: (row) => (
        <div className="relative flex justify-end">
          <button 
            onClick={(e) => toggleMenu(row.id, e)}
            className="p-2 rounded-lg hover:bg-hover text-text-muted hover:text-text-main transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          
            {activeMenuId === row.id && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1">
                  <button 
                    onClick={() => { setSelectedUserId(Number(row.id)); setActiveMenuId(null); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-text-main hover:bg-hover rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} className="text-[#EB712B]" /> View Profile
                  </button>
                  <button 
                    onClick={() => navigate('/view/clubside/support', { 
                      state: { 
                        targetUserId: Number(row.id), 
                        targetUserName: row.name, 
                        targetUserAvatar: row.profilePhoto 
                      } 
                    })}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-text-main hover:bg-hover rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageSquare size={14} /> Message
                  </button>
                <div className="h-px bg-border my-1" />
                <button 
                  onClick={() => handleRemoveMember(row.id)}
                  disabled={isRemoving}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Ban size={14} /> Remove Member
                </button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full text-text-main font-sans min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight mb-2">Members Management</h1>
          <p className="text-xs md:text-sm text-text-muted max-w-2xl">
            Efficiently manage your community members, assign roles, and moderate user activity.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
              <Search size={16} className="text-text-muted group-focus-within:text-[#EB712B]" />
            </div>
            <input
              type="text"
              placeholder="Search members..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-surface border border-border text-text-main text-sm font-medium rounded-xl pl-11 pr-10 py-2.5 outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all placeholder:text-text-muted shadow-sm"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-[#EB712B] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden min-h-[400px]">
        {isLoading ? (
          <TableSkeleton />
        ) : filteredMembers.length > 0 ? (
          <DataTable
            data={filteredMembers}
            columns={columns}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <User size={48} className="text-text-muted mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-text-main mb-1">No members found</h3>
            <p className="text-sm text-text-muted">No members match your search criteria.</p>
          </div>
        )}

        {/* User Profile Modal */}
        {selectedUserId && (
          <UserProfileModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Members;
