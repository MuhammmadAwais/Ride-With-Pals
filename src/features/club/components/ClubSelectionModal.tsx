import React, { useEffect } from 'react';
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

const formatImageUrl = (img?: string): string => {
  if (!img || img === 'null' || img.trim() === '') return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  if (img.startsWith('/')) {
    if (img.startsWith('/Images/')) return img;
    return `https://api.ridewithpals.com${img}`;
  }
  return `https://api.ridewithpals.com/uploads/${img}`;
};

export const ClubSelectionModal: React.FC<ClubSelectionModalProps> = ({
  isOpen,
  onClose,
  clubs,
  onSelect,
  isDismissible,
}) => {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
              
             

              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                {clubs.map((club) => {
                  const anyClub = club as any;
                  
                  // Exhaustive check for member count mirroring UserClub
                  const rawCount = 
                    anyClub.participantCount ?? anyClub.participant_count ?? anyClub.memberCount ?? anyClub.member_count ??
                    anyClub.totalMembers ?? anyClub.total_members ?? anyClub.membersCount ?? anyClub.members_count ??
                    anyClub.userCount ?? anyClub.user_count ?? anyClub.count ?? anyClub.total ??
                    anyClub.clubMembers?.length ?? anyClub.ClubMembers?.length ?? anyClub.club_members?.length ??
                    anyClub.user_clubs?.length ?? anyClub.userClubs?.length ?? anyClub.UserClubs?.length ??
                    anyClub.members?.length ?? anyClub.Members?.length ?? anyClub.users?.length ?? anyClub.Users?.length ??
                    anyClub.participants?.length ?? anyClub.Participants?.length ??
                    anyClub._count?.user_clubs ?? anyClub._count?.members ?? anyClub._count?.users ??
                    anyClub.club?.membersCount ?? anyClub.club?.memberCount ?? anyClub.club?.totalMembers ?? 
                    anyClub.club?._count?.members ?? anyClub.club?._count?.users ?? 0;
                  
                  const countNum = Number(rawCount);
                  const mCount = (!isNaN(countNum) && countNum > 0) ? countNum : 0;

                  const actualLogo = anyClub.logo || anyClub.club?.logo || anyClub.image || anyClub.club?.image;
                  const actualBanner = anyClub.coverImage || anyClub.club?.coverImage || anyClub.bannerImage || anyClub.club?.bannerImage;
                  
                  const logoUrl = formatImageUrl(actualLogo);
                  const bannerUrl = formatImageUrl(actualBanner);
                  const name = anyClub.clubName || anyClub.club?.clubName || anyClub.name || anyClub.club?.name || 'Unnamed Club';

                  return (
                    <button
                      key={club.id}
                      onClick={() => {
                        onSelect(club);
                        onClose();
                      }}
                      className="relative w-full flex items-center gap-4 p-4 rounded-2xl border border-border bg-main-bg hover:border-[#EB712B]/50 hover:shadow-lg transition-all group text-left overflow-hidden hover:-translate-y-0.5"
                    >
                      {/* Banner Background */}
                      {bannerUrl && (
                        <div 
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                          style={{
                            backgroundImage: `url(${bannerUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                      )}
                      {/* Left Accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EB712B]/20 group-hover:bg-[#EB712B] transition-colors duration-300 z-10" />

                      <div className="relative z-10 w-14 h-14 rounded-2xl bg-hover overflow-hidden shrink-0 border-2 border-surface group-hover:border-[#EB712B]/30 transition-colors shadow-sm ml-1">
                        {logoUrl ? (
                          <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface">
                            <Building2 size={24} />
                          </div>
                        )}
                      </div>
                      
                      <div className="relative z-10 flex-1 min-w-0">
                        <h3 className="text-lg font-black text-text-main group-hover:text-[#EB712B] transition-colors truncate">
                          {name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 bg-surface/80 backdrop-blur-sm border border-border rounded-md text-[10px] font-bold text-text-muted">
                            {mCount} Member{mCount !== 1 && 's'}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {clubs.length === 0 && (
                  <div className="text-center py-8 shrink-0 bg-main-bg rounded-2xl border border-dashed border-border">
                    <Building2 size={32} className="mx-auto text-text-muted mb-3 opacity-50" />
                    <p className="text-text-muted font-bold">No clubs found.</p>
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
