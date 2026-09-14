import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Trash2, 
  ArrowRightLeft, 
  Users, 
  X, 
  Loader2, 
  CheckCircle2, 
  Search, 
  ArrowLeft,
  ShieldAlert,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logout } from '@/features/auth/slices/authSlice';
import { useDeleteAccountMutation } from '@/features/auth/api/authApiSlice';
import { 
  useGetJoinedClubsQuery, 
  useGetClubMembersListQuery, 
  useTransferClubOwnershipMutation 
} from '@/features/club/api/clubApiSlice';
import { resolveImageUrl } from '@/features/public-club/services/clubGeocoding';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId?: number | string;
}

type ModalStep = 'DETECTED' | 'TRANSFER_LIST' | 'PICK_MEMBER' | 'CONFIRM';

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const modalRoot = typeof document !== 'undefined' ? document.getElementById('modal-root') || document.body : null;

  // APIs
  const { data: joinedClubsData, isLoading: isLoadingClubs, refetch: refetchClubs } = useGetJoinedClubsQuery(undefined, {
    skip: !isOpen,
  });
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  const [transferOwnership, { isLoading: isTransferring }] = useTransferClubOwnershipMutation();

  // Extract owned clubs
  const ownedClubs = useMemo(() => {
    const raw = (joinedClubsData as any)?.rows || (joinedClubsData as any)?.response?.rows || joinedClubsData || [];
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((c: any) => {
      const isOwnerRole = c.role?.toLowerCase() === 'owner' || c.isOwner === true;
      const isOwnerUser = currentUserId && (String(c.userId) === String(currentUserId) || String(c.ownerId) === String(currentUserId));
      return isOwnerRole || isOwnerUser;
    });
  }, [joinedClubsData, currentUserId]);

  // State
  const [step, setStep] = useState<ModalStep>('DETECTED');
  const [remainingClubs, setRemainingClubs] = useState<any[]>([]);
  const [confirmDeleteOwnedClubs, setConfirmDeleteOwnedClubs] = useState<boolean>(false);
  const [selectedClubForTransfer, setSelectedClubForTransfer] = useState<any | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [typeConfirmInput, setTypeConfirmInput] = useState('');

  // Lock scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      refetchClubs();
    } else {
      document.body.style.overflow = '';
      setStep('DETECTED');
      setTypeConfirmInput('');
      setSelectedClubForTransfer(null);
      setSelectedMemberId(null);
      setMemberSearch('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, refetchClubs]);

  // Initialize remaining clubs and step when clubs load
  useEffect(() => {
    if (isOpen && !isLoadingClubs) {
      setRemainingClubs(ownedClubs);
      if (ownedClubs.length === 0) {
        setStep('CONFIRM');
        setConfirmDeleteOwnedClubs(false);
      } else {
        setStep('DETECTED');
      }
    }
  }, [isOpen, isLoadingClubs, ownedClubs]);

  // Member query for active transfer candidate club
  const { data: membersData, isLoading: isLoadingMembers } = useGetClubMembersListQuery(
    { clubId: Number(selectedClubForTransfer?.id) },
    { skip: !selectedClubForTransfer?.id }
  );

  const eligibleMembers = useMemo(() => {
    const raw = (membersData as any)?.rows || (membersData as any)?.response || membersData || [];
    const list = Array.isArray(raw) ? raw : [];
    return list.filter((m: any) => {
      const isCurrentOwner = String(m.userId || m.id) === String(currentUserId);
      const isOwnerRole = m.role?.toLowerCase() === 'owner';
      return !isCurrentOwner && !isOwnerRole;
    });
  }, [membersData, currentUserId]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return eligibleMembers;
    const q = memberSearch.toLowerCase();
    return eligibleMembers.filter((m: any) => {
      const name = (m.fullName || `${m.firstName || ''} ${m.lastName || ''}` || m.name || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [eligibleMembers, memberSearch]);

  const handleExecuteTransfer = async () => {
    if (!selectedClubForTransfer?.id || !selectedMemberId) {
      toast.error(t`Please select a member to transfer ownership.`);
      return;
    }

    try {
      await transferOwnership({
        clubId: Number(selectedClubForTransfer.id),
        newOwnerId: selectedMemberId,
      }).unwrap();

      toast.success(t`Ownership of "${selectedClubForTransfer.clubName || 'Club'}" transferred successfully!`);

      // Remove from remaining
      const nextRemaining = remainingClubs.filter((c) => c.id !== selectedClubForTransfer.id);
      setRemainingClubs(nextRemaining);
      setSelectedClubForTransfer(null);
      setSelectedMemberId(null);
      setMemberSearch('');

      if (nextRemaining.length === 0) {
        // All transferred!
        setConfirmDeleteOwnedClubs(false);
        setStep('TRANSFER_LIST'); // will show all transferred celebration
      } else {
        setStep('TRANSFER_LIST');
      }
      refetchClubs();
    } catch (err: any) {
      toast.error(err?.data?.message || t`Failed to transfer club ownership.`);
    }
  };

  const handleFinalDelete = async () => {
    if (typeConfirmInput.trim().toUpperCase() !== 'DELETE') {
      toast.error(t`Please type DELETE to confirm account deletion.`);
      return;
    }

    try {
      await deleteAccount({ confirmDeleteOwnedClubs }).unwrap();
      toast.success(t`Your account has been permanently deleted.`);
      onClose();
      // Clear storage
      dispatch(logout());
      try {
        localStorage.removeItem('rwp_auth_token');
        localStorage.removeItem('active_club_id');
        localStorage.removeItem('rwp_active_role');
      } catch (e) {}
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || t`Failed to delete account. Please try again or contact support.`);
    }
  };

  if (!isOpen || !modalRoot) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeletingAccount) onClose();
      }}
    >
      <div className="bg-surface border border-border rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden relative text-text-main animate-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border bg-main-bg/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="font-black text-lg text-text-main tracking-tight uppercase">
                <Trans>Delete Account</Trans>
              </h2>
              <p className="text-[11px] text-text-muted font-bold tracking-wider uppercase">
                <Trans>Safety Safeguard & Verification</Trans>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeletingAccount}
            className="w-8 h-8 rounded-full bg-surface border border-border hover:border-[#EB712B]/40 flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content Based on Step */}
        <div className="p-7">
          {isLoadingClubs ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 size={36} className="animate-spin text-[#EB712B]" />
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                <Trans>Checking owned clubs...</Trans>
              </p>
            </div>
          ) : step === 'DETECTED' ? (
            /* STEP 1: OWNED CLUBS DETECTED */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-4 rounded-3xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-2">
                  <Building size={36} />
                </div>
                <h3 className="text-xl font-black text-text-main tracking-tight uppercase">
                  <Trans>Owned Clubs Detected</Trans>
                </h3>
                <p className="text-xs text-text-muted leading-relaxed max-w-md mx-auto">
                  <Trans>
                    You currently own <span className="text-[#EB712B] font-bold">{ownedClubs.length} club(s)</span>. 
                    Before deleting your account, you must transfer ownership to another member or choose to permanently delete your clubs with your account.
                  </Trans>
                </p>
              </div>

              {/* Option 1: Transfer Club Ownership */}
              <div
                onClick={() => setStep('TRANSFER_LIST')}
                role="button"
                tabIndex={0}
                className="p-5 rounded-2xl bg-main-bg hover:bg-hover border border-border hover:border-[#EB712B]/50 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#EB712B]/10 text-[#EB712B] group-hover:scale-105 transition-transform">
                    <ArrowRightLeft size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-main group-hover:text-[#EB712B] transition-colors">
                      <Trans>Transfer Club Ownership</Trans>
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      <Trans>Assign another member as the new owner for your clubs</Trans>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#EB712B] px-3 py-1.5 rounded-xl bg-[#EB712B]/10 border border-[#EB712B]/20">
                  <Trans>Transfer</Trans>
                </span>
              </div>

              {/* Option 2: Delete Clubs with Account */}
              <div
                onClick={() => {
                  setConfirmDeleteOwnedClubs(true);
                  setStep('CONFIRM');
                }}
                role="button"
                tabIndex={0}
                className="p-5 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-red-500/15 text-red-500 group-hover:scale-105 transition-transform">
                    <Trash2 size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-red-500">
                      <Trans>Delete Clubs with Account</Trans>
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      <Trans>Permanently delete your owned clubs and all associated data</Trans>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-400 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30">
                  <Trans>Delete All</Trans>
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-2xl border border-border text-text-muted hover:text-text-main text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <Trans>Cancel</Trans>
                </button>
              </div>
            </div>
          ) : step === 'TRANSFER_LIST' ? (
            /* STEP 2: TRANSFER CLUBS LIST */
            <div className="space-y-6">
              {remainingClubs.length === 0 ? (
                /* All Ownership Transferred! */
                <div className="text-center space-y-4 py-4">
                  <div className="inline-flex p-4 rounded-3xl bg-green-500/15 text-green-500 border border-green-500/20">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-text-main uppercase tracking-tight">
                      <Trans>All Ownership Transferred!</Trans>
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      <Trans>You have successfully transferred ownership for all your clubs. You may now proceed with deleting your personal account.</Trans>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDeleteOwnedClubs(false);
                      setStep('CONFIRM');
                    }}
                    className="w-full py-3.5 bg-[#EB712B] hover:bg-[#d05c19] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
                  >
                    <Trans>Continue to Account Deletion</Trans>
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <button
                      type="button"
                      onClick={() => setStep('DETECTED')}
                      className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main font-bold mb-3 transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={14} /> <Trans>Back to options</Trans>
                    </button>
                    <h3 className="text-base font-black text-text-main uppercase tracking-tight">
                      <Trans>Select Club to Transfer</Trans>
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      <Trans>Choose a club to assign a new owner before deleting your account:</Trans>
                    </p>
                  </div>

                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {remainingClubs.map((club) => {
                      const logo = resolveImageUrl(club.logo || club.coverImage) || '/Images/CycleImage2.png';
                      return (
                        <div
                          key={club.id}
                          className="p-4 rounded-2xl bg-main-bg border border-border flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={logo}
                              alt={club.clubName || 'Club'}
                              className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-text-main truncate">
                                {club.clubName || t`Unnamed Club`}
                              </h4>
                              <p className="text-[11px] text-text-muted truncate">
                                {club.location || club.city || t`Cycling Club`}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClubForTransfer(club);
                              setStep('PICK_MEMBER');
                            }}
                            className="px-4 py-2 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-sm"
                          >
                            <Trans>Select Member</Trans>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : step === 'PICK_MEMBER' ? (
            /* STEP 3: PICK MEMBER FOR A CLUB */
            <div className="space-y-5">
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedClubForTransfer(null);
                    setSelectedMemberId(null);
                    setStep('TRANSFER_LIST');
                  }}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main font-bold mb-3 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> <Trans>Back to clubs</Trans>
                </button>
                <h3 className="text-base font-black text-text-main uppercase tracking-tight">
                  <Trans>Transfer: {selectedClubForTransfer?.clubName || t`Club`}</Trans>
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  <Trans>Pick a candidate member to become the new primary owner:</Trans>
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-3 text-text-muted" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder={t`Search member by name...`}
                  className="w-full bg-main-bg border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs text-text-main placeholder-text-muted outline-none focus:border-[#EB712B]"
                />
              </div>

              {/* Members List */}
              {isLoadingMembers ? (
                <div className="py-8 flex justify-center">
                  <Loader2 size={24} className="animate-spin text-[#EB712B]" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-8 text-center bg-main-bg rounded-2xl border border-border p-4">
                  <Users size={28} className="text-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    <Trans>No eligible members found</Trans>
                  </p>
                  <p className="text-[11px] text-text-muted mt-1">
                    <Trans>There are no other active members in this club to transfer ownership to.</Trans>
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {filteredMembers.map((m: any) => {
                    const memberId = Number(m.userId || m.id);
                    const isSelected = selectedMemberId === memberId;
                    const name = m.fullName || `${m.firstName || ''} ${m.lastName || ''}` || m.name || t`Member`;
                    const avatar = resolveImageUrl(m.profileImage || m.avatar);
                    return (
                      <div
                        key={memberId}
                        onClick={() => setSelectedMemberId(memberId)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#EB712B]/10 border-[#EB712B] text-text-main'
                            : 'bg-main-bg hover:bg-hover border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {avatar ? (
                            <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#EB712B]/20 text-[#EB712B] flex items-center justify-center font-bold text-xs uppercase">
                              {name.slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{name}</p>
                            <p className="text-[10px] text-text-muted truncate">{m.role || t`Member`}</p>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#EB712B] bg-[#EB712B]' : 'border-border'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('TRANSFER_LIST')}
                  className="flex-1 py-3 rounded-2xl border border-border text-text-muted hover:text-text-main text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  <Trans>Cancel</Trans>
                </button>
                <button
                  type="button"
                  disabled={!selectedMemberId || isTransferring}
                  onClick={handleExecuteTransfer}
                  className="flex-1 py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {isTransferring ? <Loader2 size={14} className="animate-spin" /> : <ArrowRightLeft size={14} />}
                  <Trans>Confirm Transfer</Trans>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 4: FINAL CONFIRMATION (TYPE "DELETE") */
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-500 space-y-1.5">
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    <AlertTriangle size={15} /> <Trans>Warning: This action is permanent!</Trans>
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    <Trans>
                      Deleting your account will permanently wipe your profile, personal ride logs, achievements, and club associations.
                    </Trans>
                  </p>
                  {confirmDeleteOwnedClubs && (
                    <p className="text-[11px] font-bold text-red-400 pt-1 border-t border-red-500/20">
                      ⚠️ <Trans>All {ownedClubs.length} club(s) owned by you will also be permanently deleted.</Trans>
                    </p>
                  )}
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  <Trans>
                    To prevent accidental deletion, please type <span className="text-red-500 font-bold tracking-wider">DELETE</span> below:
                  </Trans>
                </p>

                <input
                  type="text"
                  value={typeConfirmInput}
                  onChange={(e) => setTypeConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-main-bg border border-border rounded-xl px-4 py-3 text-sm font-bold text-center tracking-widest text-text-main outline-none focus:border-red-500 uppercase transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    if (ownedClubs.length > 0) setStep('DETECTED');
                    else onClose();
                  }}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-text-muted hover:text-text-main text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  <Trans>Cancel</Trans>
                </button>
                <button
                  type="button"
                  disabled={typeConfirmInput.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                  onClick={handleFinalDelete}
                  className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {isDeletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  <Trans>Permanently Delete</Trans>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};
