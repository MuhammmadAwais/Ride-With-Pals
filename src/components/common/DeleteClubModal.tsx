import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, AlertTriangle, Trash2, X, Check, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { useDeleteClubMutation } from "@/features/club/api/clubApiSlice";
import { useActiveClub } from "@/hooks/useActiveClub";

import { useAppDispatch } from "@/hooks/useAppDispatch";
import { deleteClubFromState, fetchMyClubs, fetchJoinedClubs, fetchExploreClubs } from "@/features/club/slices/clubSlice";

interface DeleteClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: number | string;
  clubName?: string;
  clubLogo?: string | null;
  clubLocation?: string;
  clubType?: string;
  onDeleted?: () => void;
}

export const DeleteClubModal: React.FC<DeleteClubModalProps> = ({
  isOpen,
  onClose,
  clubId,
  clubName,
  clubLogo,
  clubLocation,
  clubType = "Cycling",
  onDeleted,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { clearActiveClub } = useActiveClub();
  const [deleteClubMutation, { isLoading }] = useDeleteClubMutation();

  const [step, setStep] = useState<1 | 2>(1);
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setConfirmInput("");
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const modalRoot = typeof document !== "undefined" ? document.getElementById("modal-root") || document.body : null;
  if (!modalRoot) return null;

  const resolvedLogoUrl = clubLogo
    ? clubLogo.startsWith("http") || clubLogo.startsWith("blob:") || clubLogo.startsWith("data:")
      ? clubLogo
      : `https://api.ridewithpals.com/uploads/${clubLogo}`
    : null;

  const handleDelete = async () => {
    if (!clubId) return;
    if (confirmInput.trim() !== "DELETE") {
      toast.error(t`Please type DELETE in all caps to confirm.`);
      return;
    }

    try {
      await deleteClubMutation({ clubId: Number(clubId) }).unwrap();
      toast.success(t`Club "${clubName || 'Club'}" was deleted permanently.`);
      
      // 1. Instantly purge from Redux club state
      dispatch(deleteClubFromState(Number(clubId)));

      // 2. Clear active club & all associated localStorage keys
      clearActiveClub();

      // 3. Trigger background re-fetch for all club lists
      dispatch(fetchMyClubs());
      dispatch(fetchJoinedClubs());
      dispatch(fetchExploreClubs());

      onClose();

      if (onDeleted) {
        onDeleted();
      } else {
        navigate("/view/userside/clubs", { replace: true });
      }
    } catch (err: any) {
      console.error("Failed to delete club:", err);
      toast.error(
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        t`Failed to delete club. Please try again.`
      );
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="bg-[#1C1214] border border-red-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-red-500/20 bg-[#221316]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                {step === 1 ? <Trans>Permanently Delete Club</Trans> : <Trans>Final Confirmation Required</Trans>}
              </h3>
              <p className="text-xs text-red-400 font-medium">
                {step === 1 ? <Trans>Step 1 of 2: Risk Assessment</Trans> : <Trans>Step 2 of 2: Safeguard Verification</Trans>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!isLoading) onClose();
            }}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {step === 1 ? (
            <>
              {/* Club Preview Badge */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-black/40 border border-red-500/20">
                <div className="w-12 h-12 rounded-2xl bg-[#181112] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {resolvedLogoUrl ? (
                    <img
                      src={resolvedLogoUrl}
                      alt={clubName || "Club"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building size={20} className="text-gray-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white truncate text-base">
                    {clubName || t`Active Club`}
                  </h4>
                  <p className="text-xs text-gray-400 truncate">
                    {clubLocation || t`No location specified`} {clubType ? `• ${clubType}` : ""}
                  </p>
                </div>
              </div>

              {/* Destruction Impact Warning Box */}
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 space-y-2.5 leading-relaxed">
                <p className="font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <Trans>This action is completely irreversible.</Trans>
                </p>
                <ul className="list-disc list-inside space-y-1.5 text-gray-300 pl-1">
                  <li><Trans>All members and admins will immediately lose club access.</Trans></li>
                  <li><Trans>All scheduled rides, GPS route data, and comments will be permanently erased.</Trans></li>
                  <li><Trans>All club shop merchandise, membership plans, and discounts will be cancelled.</Trans></li>
                  <li><Trans>This club profile and handle cannot be recovered by support.</Trans></li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 leading-relaxed space-y-2">
                <p className="font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <Trans>Type safety confirmation</Trans>
                </p>
                <p>
                  <Trans>
                    To confirm permanent deletion of <strong className="text-white font-bold">{clubName || t`this club`}</strong>, please type <span className="font-mono font-black text-red-400 tracking-widest px-1.5 py-0.5 bg-black/40 border border-red-500/30 rounded">DELETE</span> in capital letters in the input below:
                  </Trans>
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full text-center font-mono tracking-[0.25em] text-base uppercase py-3.5 bg-black/50 border border-red-500/40 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                />
                <div className="flex items-center justify-between text-[11px] px-1 font-semibold">
                  <span className="text-gray-400"><Trans>Must match exactly:</Trans></span>
                  {confirmInput.trim() === "DELETE" ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <Check size={12} strokeWidth={3} /> <Trans>Ready to delete</Trans>
                    </span>
                  ) : (
                    <span className="text-gray-500 font-mono">DELETE</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-red-500/20 bg-[#221316]">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trans>Cancel</Trans>
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                <Trans>I Understand, Continue</Trans>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trans>Back</Trans>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmInput.trim() !== "DELETE" || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span><Trans>Deleting...</Trans></span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span><Trans>Permanently Delete Club</Trans></span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    modalRoot
  );
};

export default DeleteClubModal;
