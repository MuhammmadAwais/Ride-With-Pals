import React from 'react';
import { X, Mail, Phone, Globe, Calendar, Loader2, User, MessageSquare, Clock, MapPin, ShieldCheck, Activity } from 'lucide-react';
import { useGetOtherUserInfoQuery } from '@/features/auth/api/authApiSlice';
import { useNavigate } from 'react-router-dom';

interface UserProfileModalProps {
  userId: number | string;
  onClose: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, onClose }) => {
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetOtherUserInfoQuery({ userId });

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSendMessage = () => {
    if (!user) return;
    onClose();
    navigate('/view/userside/support', {
      state: {
        targetUserId: user.id,
        targetUserName: user.fullName || `User #${user.id}`,
        targetUserAvatar: user.profileImage || undefined,
      }
    });
  };

  const genderLabel = user?.genderId === 1 ? 'Male' : user?.genderId === 2 ? 'Female' : 'Not specified';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-lg bg-surface border border-border rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#EB712B]/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/60 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EB712B]"></span>
            <span className="text-xs font-black uppercase tracking-widest text-[#EB712B]">
              Member Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 relative z-10 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 size={32} className="animate-spin text-[#EB712B]" />
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">Loading user profile...</p>
            </div>
          ) : isError || !user ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <User size={28} className="text-red-400" />
              </div>
              <h3 className="text-base font-bold text-text-main">Profile not found</h3>
              <p className="text-xs text-text-muted max-w-xs">Unable to load details for this user.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Banner / Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 p-5 bg-main-bg/60 rounded-3xl border border-white/5 relative">
                <div className="relative shrink-0">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName || 'Member'}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-[#EB712B]/40 shadow-xl"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#EB712B]/20 text-[#EB712B] flex items-center justify-center font-black text-2xl border-2 border-[#EB712B]/40 shadow-xl">
                      {(user.fullName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-surface rounded-full shadow-md" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-black text-text-main truncate">
                    {user.fullName || 'No name provided'}
                  </h3>
                  <p className="text-xs text-[#EB712B] font-bold mt-0.5 truncate">{user.email}</p>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
                    <span className="px-3 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {user.isAthleteProfile ? 'Athlete' : 'Club Member'}
                    </span>
                    {user.country && (
                      <span className="px-3 py-1 bg-white/5 text-text-muted border border-white/10 rounded-full text-[10px] font-bold flex items-center gap-1">
                        <MapPin size={10} /> {user.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bento Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-main-bg/80 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Phone size={12} className="text-[#EB712B]" /> Phone
                  </p>
                  <p className="text-xs font-bold text-text-main truncate">{user.phone || 'Not provided'}</p>
                </div>

                <div className="p-4 bg-main-bg/80 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#EB712B]" /> Date of Birth
                  </p>
                  <p className="text-xs font-bold text-text-main truncate">{user.dob || 'Not provided'}</p>
                </div>

                <div className="p-4 bg-main-bg/80 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <User size={12} className="text-[#EB712B]" /> Gender
                  </p>
                  <p className="text-xs font-bold text-text-main truncate">{genderLabel}</p>
                </div>

                <div className="p-4 bg-main-bg/80 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#EB712B]" /> Member Since
                  </p>
                  <p className="text-xs font-bold text-text-main truncate">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>

                <div className="p-4 bg-main-bg/80 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Activity size={12} className="text-[#EB712B]" /> Preferred Unit
                  </p>
                  <p className="text-xs font-bold text-text-main capitalize truncate">
                    {user.unit || user.scale || 'Kilometer'}
                  </p>
                </div>

                <div className="p-4 bg-main-bg/80 rounded-2xl border border-white/5 space-y-1">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Clock size={12} className="text-[#EB712B]" /> Time Format / Zone
                  </p>
                  <p className="text-xs font-bold text-text-main truncate">
                    {user.timeFormat || '12h'} {user.timezone ? `(${user.timezone})` : ''}
                  </p>
                </div>
              </div>

              {/* Bio Section */}
              {user.description && (
                <div className="p-5 bg-main-bg/80 rounded-2xl border border-white/5">
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mb-2">
                    Biography / About
                  </p>
                  <p className="text-xs text-text-main leading-relaxed font-medium italic">
                    "{user.description}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSendMessage}
                  className="flex-1 bg-[#EB712B] hover:bg-[#ff7e36] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#EB712B]/20 transition-all cursor-pointer active:scale-95"
                >
                  <MessageSquare size={16} /> Send Direct Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
