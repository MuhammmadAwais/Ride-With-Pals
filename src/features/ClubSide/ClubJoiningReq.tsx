import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Check, 
  X, 
  KeyRound, 
  Users, 
  Plus, 
  Copy, 
  Edit3, 
  Trash2, 
  Sparkles, 
  RefreshCw,
  Search,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { toast } from 'sonner';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { ClubService } from '@/api/backendApi';
import { useActiveClub } from '@/hooks/useActiveClub';
import { 
  useGetClubJoinCodesQuery, 
  useCreateClubJoinCodeMutation, 
  useUpdateClubJoinCodeMutation, 
  useDeleteClubJoinCodeMutation,
  useGetClubJoinRequestQuery,
  useManageJoinGroupRequestMutation
} from '@/features/club/api/clubApiSlice';
import type { ClubJoinCode } from '@/api/types/clubTypes';

export const ClubJoiningReq = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'codes'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState<number | null>(null);

  // Modal States
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ClubJoinCode | null>(null);
  const [deletingCode, setDeletingCode] = useState<ClubJoinCode | null>(null);

  // Active Club context
  const { clubId: reduxClubId, setActiveClub } = useActiveClub();
  const [currentClubId, setCurrentClubId] = useState<number | null>(reduxClubId ? Number(reduxClubId) : null);

  useEffect(() => {
    if (reduxClubId) {
      setCurrentClubId(Number(reduxClubId));
    } else {
      ClubService.getJoinedClubs()
        .then((clubsRes: any) => {
          const clubs = clubsRes?.response?.data || clubsRes?.data || clubsRes || [];
          if (clubs.length > 0) {
            setCurrentClubId(Number(clubs[0].id));
            setActiveClub(clubs[0]);
          }
        })
        .catch((e) => console.error("Failed to fetch clubs", e));
    }
  }, [reduxClubId, setActiveClub]);

  // RTK Queries
  const { 
    data: requestsData, 
    isLoading: isRequestsLoading, 
    isFetching: isRequestsFetching,
    refetch: refetchRequests 
  } = useGetClubJoinRequestQuery(
    { clubId: currentClubId! }, 
    { skip: !currentClubId }
  );

  const { 
    data: joinCodesData, 
    isLoading: isCodesLoading, 
    isFetching: isCodesFetching,
    refetch: refetchCodes 
  } = useGetClubJoinCodesQuery(
    { clubId: currentClubId! }, 
    { skip: !currentClubId }
  );

  // Mutations
  const [manageJoinRequest, { isLoading: isManagingRequest }] = useManageJoinGroupRequestMutation();
  const [createJoinCode, { isLoading: isCreatingCode }] = useCreateClubJoinCodeMutation();
  const [updateJoinCode, { isLoading: isUpdatingCode }] = useUpdateClubJoinCodeMutation();
  const [deleteJoinCode, { isLoading: isDeletingCode }] = useDeleteClubJoinCodeMutation();

  // Normalize requests data
  const requests = useMemo(() => {
    const rawList = Array.isArray(requestsData) 
      ? requestsData 
      : (requestsData as any)?.response || (requestsData as any)?.data || [];
      
    return rawList.map((req: any) => ({
      id: req.id?.toString() || Math.random().toString(),
      requestId: Number(req.id),
      name: req.user?.name || req.name || req.user?.fullName || t`Unknown Athlete`,
      image: req.user?.profileImage || req.image || '/default-avatar.png',
      org: req.org || req.club?.name || t`RWP Rider`,
      status: (req.status || 'pending').toLowerCase(),
      createdAt: req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'
    }));
  }, [requestsData]);

  // Normalize join codes data
  const joinCodes: ClubJoinCode[] = useMemo(() => {
    if (!joinCodesData) return [];
    if (Array.isArray(joinCodesData)) return joinCodesData;
    return (joinCodesData as any)?.response || (joinCodesData as any)?.data || [];
  }, [joinCodesData]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter((r: any) => 
      r.name.toLowerCase().includes(query) || 
      r.org.toLowerCase().includes(query) || 
      r.id.toLowerCase().includes(query)
    );
  }, [requests, searchQuery]);

  // Filtered join codes
  const filteredJoinCodes = useMemo(() => {
    if (!searchQuery.trim()) return joinCodes;
    const query = searchQuery.toLowerCase();
    return joinCodes.filter((c: ClubJoinCode) => 
      c.code.toLowerCase().includes(query)
    );
  }, [joinCodes, searchQuery]);

  // Pending requests count
  const pendingRequestsCount = useMemo(() => {
    return requests.filter((r: any) => r.status === 'pending').length;
  }, [requests]);

  // Active codes count
  const activeCodesCount = useMemo(() => {
    return joinCodes.filter((c: ClubJoinCode) => c.isActive).length;
  }, [joinCodes]);

  // Handle request approval
  const handleAccept = async (requestId: number) => {
    try {
      await manageJoinRequest({ requestId, status: 'approved' }).unwrap();
      toast.success(t`Athlete membership request accepted`);
      refetchRequests();
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to accept request`);
    }
  };

  // Handle request rejection
  const handleReject = async (requestId: number) => {
    try {
      await manageJoinRequest({ requestId, status: 'rejected' }).unwrap();
      toast.success(t`Athlete membership request rejected`);
      refetchRequests();
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to reject request`);
    }
  };

  // Handle Copy Code to clipboard
  const handleCopyCode = (code: string, id: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    toast.success(t`Join code ${code} copied to clipboard!`);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Format expiration date
  const formatExpiry = (expiresAt: string | null | undefined) => {
    if (!expiresAt) return { text: t`No expiration`, isExpired: false, daysLeft: null };
    const date = new Date(expiresAt);
    if (isNaN(date.getTime())) return { text: t`No expiration`, isExpired: false, daysLeft: null };
    
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isExpired = diffMs <= 0;

    const formatted = date.toLocaleDateString(undefined, { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });

    return {
      text: formatted,
      isExpired,
      daysLeft: diffDays
    };
  };

  // Columns for Requests Table
  const requestColumns: Column<any>[] = useMemo(() => [
    {
      key: 'name',
      label: t`Athlete`,
      sortable: true,
      render: (req) => (
        <div className="flex items-center gap-3.5">
          <img 
            src={req.image} 
            alt={req.name} 
            onError={(e) => (e.currentTarget.src = '/default-avatar.png')} 
            className="w-10 h-10 rounded-xl object-cover border border-border shrink-0 shadow-sm" 
          />
          <div>
            <div className="font-bold text-sm text-text-main hover:text-[#EB712B] transition-colors">{req.name}</div>
            <div className="text-[11px] text-text-muted font-medium flex items-center gap-1.5 mt-0.5">
              <span>{t`ID`}: {req.id}</span>
              <span>•</span>
              <span>{req.createdAt}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'org',
      label: t`Organization`,
      sortable: true,
      render: (req) => <div className="text-sm font-medium text-text-muted">{req.org}</div>
    },
    {
      key: 'status',
      label: t`Status`,
      sortable: true,
      render: (req) => {
        const isAccepted = req.status === 'accepted' || req.status === 'approved';
        return (
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full border tracking-wide uppercase ${
            isAccepted 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isAccepted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {isAccepted ? <Trans>Accepted</Trans> : <Trans>Pending</Trans>}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: t`Actions`,
      sortable: false,
      render: (req) => {
        const isAccepted = req.status === 'accepted' || req.status === 'approved';
        return (
          <div className="flex justify-end items-center gap-2">
            {!isAccepted ? (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleReject(req.requestId); }} 
                  disabled={isManagingRequest}
                  title={t`Reject Request`}
                  className="p-2 rounded-xl border border-border hover:bg-red-500/10 hover:border-red-500/30 text-text-muted hover:text-red-500 transition-all disabled:opacity-50"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleAccept(req.requestId); }} 
                  disabled={isManagingRequest}
                  className="flex items-center gap-2 text-xs px-4 py-2 bg-[#EB712B] hover:bg-[#ff7e36] text-white rounded-xl font-bold transition-all shadow-md shadow-[#EB712B]/20 disabled:opacity-50"
                >
                  <Check size={14} /> <Trans>Accept</Trans>
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 px-3 py-1.5 bg-emerald-500/10 rounded-lg">
                <ShieldCheck size={14} /> <Trans>Member</Trans>
              </span>
            )}
          </div>
        );
      }
    }
  ], [isManagingRequest]);

  // Columns for Join Codes Table
  const codeColumns: Column<ClubJoinCode>[] = useMemo(() => [
    {
      key: 'code',
      label: t`Join Code`,
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-xl font-mono text-sm font-bold text-[#EB712B] tracking-wider">
            <KeyRound size={14} />
            <span>{item.code}</span>
          </div>
          <button
            onClick={() => handleCopyCode(item.code, item.id)}
            title={t`Copy to clipboard`}
            className={`p-2 rounded-xl border transition-all ${
              copiedCodeId === item.id 
                ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' 
                : 'border-border text-text-muted hover:text-text-main hover:bg-surface-elevated'
            }`}
          >
            {copiedCodeId === item.id ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )
    },
    {
      key: 'usage',
      label: t`Usage`,
      sortable: true,
      render: (item) => {
        const percent = Math.min(100, Math.round((item.usedCount / (item.usageLimit || 1)) * 100));
        return (
          <div className="w-36">
            <div className="flex justify-between text-xs font-semibold text-text-muted mb-1.5">
              <span>{item.usedCount} <Trans>used</Trans></span>
              <span>{item.usageLimit} <Trans>max</Trans></span>
            </div>
            <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all ${
                  percent >= 90 ? 'bg-red-500' : percent >= 60 ? 'bg-amber-500' : 'bg-[#EB712B]'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'expiresAt',
      label: t`Expiration`,
      sortable: true,
      render: (item) => {
        const expiry = formatExpiry(item.expiresAt);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-text-main">{expiry.text}</span>
            {expiry.daysLeft !== null && (
              <span className={`text-[11px] font-semibold mt-0.5 ${
                expiry.isExpired 
                  ? 'text-red-500' 
                  : expiry.daysLeft <= 7 
                    ? 'text-amber-500' 
                    : 'text-text-muted'
              }`}>
                {expiry.isExpired 
                  ? t`Expired` 
                  : expiry.daysLeft === 1 
                    ? t`1 day left` 
                    : t`${expiry.daysLeft} days left`}
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      label: t`Status`,
      sortable: true,
      render: (item) => {
        const expiry = formatExpiry(item.expiresAt);
        const isActuallyActive = item.isActive && !expiry.isExpired;

        return (
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${
            isActuallyActive 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isActuallyActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            {isActuallyActive ? <Trans>Active</Trans> : expiry.isExpired ? <Trans>Expired</Trans> : <Trans>Inactive</Trans>}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: t`Actions`,
      sortable: false,
      render: (item) => (
        <div className="flex justify-end items-center gap-1.5">
          <button
            onClick={() => {
              setEditingCode(item);
              setIsCodeModalOpen(true);
            }}
            title={t`Edit Code`}
            className="p-2 rounded-xl border border-border hover:bg-surface-elevated text-text-muted hover:text-[#EB712B] transition-all"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => setDeletingCode(item)}
            title={t`Revoke Code`}
            className="p-2 rounded-xl border border-border hover:bg-red-500/10 hover:border-red-500/30 text-text-muted hover:text-red-500 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )
    }
  ], [copiedCodeId]);

  return (
    <div className="w-full text-text-main rounded-3xl border border-border shadow-2xl relative overflow-hidden bg-surface">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#EB712B]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* Main Header */}
      <div className="px-6 md:px-8 pt-8 pb-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3.5">
              <div className="w-1.5 h-8 bg-[#EB712B] rounded-full" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-main">
                <Trans>Club Membership & Access</Trans>
              </h2>
            </div>
            <p className="text-text-muted text-xs md:text-sm mt-3 max-w-xl font-medium leading-relaxed">
              <Trans>Approve pending athlete membership requests and manage invitation join codes for private club onboarding.</Trans>
            </p>
          </div>

          {/* Tab Navigation Pill */}
          <div className="flex items-center gap-1.5 p-1.5 bg-main-bg/80 backdrop-blur-md rounded-2xl border border-border shadow-inner self-start md:self-auto">
            <button
              onClick={() => { setActiveTab('requests'); setSearchQuery(''); }}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'requests'
                  ? 'bg-surface text-text-main shadow-md border border-border'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <Users size={15} className={activeTab === 'requests' ? 'text-[#EB712B]' : ''} />
              <span><Trans>Join Requests</Trans></span>
              {pendingRequestsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EB712B] text-white">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('codes'); setSearchQuery(''); }}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'codes'
                  ? 'bg-surface text-text-main shadow-md border border-border'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              <KeyRound size={15} className={activeTab === 'codes' ? 'text-[#EB712B]' : ''} />
              <span><Trans>Join Codes</Trans></span>
              {activeCodesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  {activeCodesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Toolbar: Search, Refresh & Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border/60">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'requests' ? t`Search athletes or ID...` : t`Search join codes...`}
              className="w-full pl-10 pr-4 py-2 bg-main-bg rounded-xl border border-border text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:border-[#EB712B] transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (activeTab === 'requests') refetchRequests();
                else refetchCodes();
              }}
              disabled={isRequestsFetching || isCodesFetching}
              title={t`Refresh data`}
              className="p-2.5 rounded-xl border border-border hover:bg-surface-elevated text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={(isRequestsFetching || isCodesFetching) ? 'animate-spin text-[#EB712B]' : ''} />
            </button>

            {activeTab === 'codes' && (
              <button
                onClick={() => {
                  setEditingCode(null);
                  setIsCodeModalOpen(true);
                }}
                className="flex items-center gap-2 text-xs px-4 py-2.5 bg-[#EB712B] hover:bg-[#ff7e36] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#EB712B]/20 shrink-0"
              >
                <Plus size={16} />
                <span><Trans>Create Join Code</Trans></span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="relative z-10 border-t border-border">
        {activeTab === 'requests' ? (
          <DataTable
            data={filteredRequests}
            columns={requestColumns}
            isLoading={isRequestsLoading}
            emptyMessage={t`No joining requests found.`}
          />
        ) : (
          <DataTable
            data={filteredJoinCodes}
            columns={codeColumns}
            isLoading={isCodesLoading}
            emptyMessage={t`No join codes created yet. Click "Create Join Code" to invite athletes.`}
          />
        )}
      </div>

      {/* Create / Edit Join Code Modal */}
      {isCodeModalOpen && currentClubId && (
        <JoinCodeModal
          clubId={currentClubId}
          existingCode={editingCode}
          onClose={() => {
            setIsCodeModalOpen(false);
            setEditingCode(null);
          }}
          onSubmit={async (payload) => {
            try {
              if (editingCode) {
                await updateJoinCode({
                  id: editingCode.id,
                  clubId: currentClubId,
                  ...payload,
                }).unwrap();
                toast.success(t`Join code updated successfully!`);
              } else {
                await createJoinCode({
                  clubId: currentClubId,
                  ...payload,
                }).unwrap();
                toast.success(t`Join code created successfully!`);
              }
              setIsCodeModalOpen(false);
              setEditingCode(null);
              refetchCodes();
            } catch (err: any) {
              toast.error(err?.data?.message || t`Failed to save join code`);
            }
          }}
          isSubmitting={isCreatingCode || isUpdatingCode}
        />
      )}

      {/* Revoke / Delete Confirmation Modal */}
      {deletingCode && currentClubId && (
        <DeleteCodeModal
          code={deletingCode}
          onClose={() => setDeletingCode(null)}
          onConfirm={async () => {
            try {
              await deleteJoinCode({
                id: deletingCode.id,
                clubId: currentClubId,
              }).unwrap();
              toast.success(t`Join code revoked successfully!`);
              setDeletingCode(null);
              refetchCodes();
            } catch (err: any) {
              toast.error(err?.data?.message || t`Failed to delete join code`);
            }
          }}
          isDeleting={isDeletingCode}
        />
      )}
    </div>
  );
};

// ─── Create / Edit Join Code Modal ───────────────────────────────────────────

interface JoinCodeModalProps {
  clubId: number;
  existingCode: ClubJoinCode | null;
  onClose: () => void;
  onSubmit: (payload: { code: string; expiresAt: string; usageLimit: number; isActive: boolean }) => Promise<void>;
  isSubmitting: boolean;
}

const JoinCodeModal: React.FC<JoinCodeModalProps> = ({
  existingCode,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  // Default code generation helper
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'RWP-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const [code, setCode] = useState(existingCode?.code || generateRandomCode());
  
  // Expiry date (default 30 days ahead)
  const defaultDateStr = useMemo(() => {
    if (existingCode?.expiresAt) {
      const d = new Date(existingCode.expiresAt);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    }
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, [existingCode]);

  const [expiresAt, setExpiresAt] = useState(defaultDateStr);
  const [usageLimit, setUsageLimit] = useState(existingCode?.usageLimit ?? 100);
  const [isActive, setIsActive] = useState(existingCode?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);

  // Today's date string for min date
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError(t`Please provide a valid join code.`);
      return;
    }
    if (!expiresAt) {
      setError(t`Please select an expiration date.`);
      return;
    }
    if (usageLimit < 1) {
      setError(t`Usage limit must be at least 1.`);
      return;
    }

    // Format ISO string ending in 23:59:59Z for full-day validity
    const isoExpiry = `${expiresAt}T23:59:59.000Z`;

    setError(null);
    await onSubmit({
      code: cleanCode,
      expiresAt: isoExpiry,
      usageLimit: Number(usageLimit),
      isActive,
    });
  };

  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-main-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-text-main">
                {existingCode ? <Trans>Edit Join Code</Trans> : <Trans>Create Join Code</Trans>}
              </h3>
              <p className="text-xs text-text-muted font-medium mt-0.5">
                <Trans>Invite members to enter this code when joining your club.</Trans>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Join Code Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                <Trans>Join Code</Trans>
              </label>
              <button
                type="button"
                onClick={() => setCode(generateRandomCode())}
                className="flex items-center gap-1 text-xs font-bold text-[#EB712B] hover:text-[#ff7e36] transition-colors"
              >
                <Sparkles size={12} />
                <span><Trans>Randomize</Trans></span>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER2026"
                className="w-full px-4 py-3 bg-main-bg border border-border rounded-xl font-mono text-sm font-bold text-text-main placeholder:text-text-muted uppercase focus:outline-none focus:border-[#EB712B] transition-colors"
                required
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">
              <Trans>Athletes will enter this exact code into their mobile or web join dialog.</Trans>
            </p>
          </div>

          {/* Expiration Date & Usage Limit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                <Trans>Expiration Date</Trans>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiresAt}
                  min={todayStr}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 bg-main-bg border border-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-[#EB712B] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                <Trans>Usage Limit</Trans>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  placeholder="100"
                  className="w-full px-4 py-3 bg-main-bg border border-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-[#EB712B] transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Active Status Switch */}
          <div className="flex items-center justify-between p-4 bg-main-bg rounded-2xl border border-border">
            <div>
              <span className="text-sm font-bold text-text-main block">
                <Trans>Code Active</Trans>
              </span>
              <span className="text-xs text-text-muted font-medium">
                <Trans>Disable this toggle to pause athlete redemptions anytime.</Trans>
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                isActive ? 'bg-[#EB712B]' : 'bg-border'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  isActive ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors"
            >
              <Trans>Cancel</Trans>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#EB712B] hover:bg-[#ff7e36] text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-[#EB712B]/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : existingCode ? (
                <Trans>Update Code</Trans>
              ) : (
                <Trans>Create Code</Trans>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

// ─── Delete / Revoke Confirmation Modal ──────────────────────────────────────

interface DeleteCodeModalProps {
  code: ClubJoinCode;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

const DeleteCodeModal: React.FC<DeleteCodeModalProps> = ({
  code,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const modalRoot = document.getElementById('modal-root') || document.body;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl">
            <Trash2 size={22} />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-text-main">
              <Trans>Revoke Join Code</Trans>
            </h3>
            <p className="text-xs text-text-muted font-medium mt-0.5">
              <Trans>This action cannot be undone.</Trans>
            </p>
          </div>
        </div>

        <p className="text-sm text-text-muted leading-relaxed mb-6">
          <Trans>
            Are you sure you want to revoke code <strong className="text-[#EB712B] font-mono">{code.code}</strong>? 
            Athletes will immediately lose the ability to join using this code.
          </Trans>
        </p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl border border-border text-sm font-bold text-text-muted hover:text-text-main hover:bg-surface-elevated transition-colors disabled:opacity-50"
          >
            <Trans>Cancel</Trans>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Trans>Revoke Code</Trans>
            )}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};
