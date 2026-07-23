/**
 * @fileoverview UserProfileModal — Displays another user's public profile in a modal.
 *
 * API wired:
 * - useGetOtherUserInfoQuery  GET /user/details?userId=X
 */
import React from 'react';
import { X, Mail, Phone, Globe, Calendar, Loader2, User } from 'lucide-react';
import { useGetOtherUserInfoQuery } from '@/features/auth/api/authApiSlice';

interface UserProfileModalProps {
  userId: number | string;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const { data: user, isLoading, isError } = useGetOtherUserInfoQuery({ userId });

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-sm bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#EB712B]">
            Member Profile
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-text-main hover:bg-hover transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={28} className="animate-spin text-[#EB712B]" />
              <p className="text-xs text-text-muted">Loading profile...</p>
            </div>
          ) : isError || !user ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <User size={24} className="text-red-400" />
              </div>
              <p className="text-sm font-bold text-text-main">Profile not found</p>
              <p className="text-xs text-text-muted">Unable to load this user's profile.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="relative">
                  <img
                    src={user.profileImage || '/Images/ProfileImage.png'}
                    alt={user.fullName || 'Member'}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-[#EB712B]/30"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/Images/ProfileImage.png';
                    }}
                  />
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 border-2 border-surface rounded-full" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-main">
                    {user.fullName || 'No name provided'}
                  </h3>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider mt-0.5">
                    {user.isAthleteProfile ? 'Athlete' : 'Member'}
                  </p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="space-y-3">
                {[
                  { icon: <Mail size={14} />, label: 'Email', value: user.email },
                  { icon: <Phone size={14} />, label: 'Phone', value: user.phone || '—' },
                  { icon: <Globe size={14} />, label: 'Country', value: user.country || '—' },
                  {
                    icon: <Calendar size={14} />,
                    label: 'Joined',
                    value: user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : '—',
                  },
                  {
                    icon: <span className="text-[10px] font-black">⚡</span>,
                    label: 'Unit',
                    value: user.unit || user.scale || '—',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-main-bg rounded-xl border border-border"
                  >
                    <div className="text-[#EB712B] shrink-0">{item.icon}</div>
                    <div className="min-w-0">
                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-xs font-semibold text-text-main truncate">{item.value}</p>
                    </div>
                  </div>
                ))}

                {user.description && (
                  <div className="p-3 bg-main-bg rounded-xl border border-border">
                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider mb-1.5">
                      Bio
                    </p>
                    <p className="text-xs text-text-muted leading-relaxed">{user.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
