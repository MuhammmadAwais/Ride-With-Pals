import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2 } from 'lucide-react';
import type { Club } from '@/features/club/types/clubTypes';

interface ClubSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubs: Club[];
  onSelect: (club: Club) => void;
  isDismissible: boolean;
}

export const ClubSelectionModal: React.FC<ClubSelectionModalProps> = ({
  isOpen,
  onClose,
  clubs,
  onSelect,
  isDismissible,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Translucent Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isDismissible ? onClose : undefined}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Solid Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-full"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EB712B]/40 via-[#EB712B] to-[#EB712B]/40" />

              <div className="flex items-center justify-between mb-6 mt-2 shrink-0">
                <div>
                  <h2 className="text-xl font-black text-text-main uppercase tracking-tight">Select Club</h2>
                  <p className="text-sm text-text-muted mt-1">Choose a club to manage</p>
                </div>
                {isDismissible && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-hover text-text-muted hover:text-text-main transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                {clubs.map((club) => (
                  <button
                    key={club.id}
                    onClick={() => {
                      onSelect(club);
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-main-bg hover:border-[#EB712B]/50 hover:bg-[#EB712B]/5 transition-all group text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-hover overflow-hidden shrink-0 border border-border group-hover:border-[#EB712B]/30 transition-colors">
                      {club.logo ? (
                        <img src={club.logo} alt={club.clubName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <Building2 size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-text-main group-hover:text-[#EB712B] transition-colors truncate">
                        {club.clubName}
                      </h3>
                      <p className="text-xs text-text-muted truncate mt-0.5">
                        {club.memberCount || 0} Member{club.memberCount !== 1 && 's'}
                      </p>
                    </div>
                  </button>
                ))}

                {clubs.length === 0 && (
                  <div className="text-center py-8 shrink-0">
                    <p className="text-text-muted text-sm">No clubs found.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
