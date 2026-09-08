import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Users, Edit3, Calendar, Clock, MapPin, Gauge, Download, Share2, 
  Bell, BellOff, MessageSquare, Crown, Search, LogOut, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { type ChatUser, type ChatMessage } from '../utils/constants';
import { useGetRideInfoByIdQuery, useLeaveRideMutation } from '@/features/club/api/clubApiSlice';
import { useAppSelector } from '@/hooks/useAppSelector';
import { downloadGpxFile } from '@/features/public-club/utils/activityUtils';
import { UniversalShareModal } from '@/components/common/UniversalShareModal';
import { EditGroupModal } from './EditGroupModal';
import { cn } from '@/lib/utils';

interface GroupChatInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: ChatUser;
  messages: ChatMessage[];
  onOpenProfile: (userId: number | string) => void;
  onStartDirectChat: (targetUserId: number, targetUserName?: string, targetUserAvatar?: string) => void;
  onUpdateGroupDetails?: (updated: { title: string; description?: string; avatar?: string }) => void;
}

const resolveAvatarUrl = (path?: string | null) => {
  if (!path || typeof path !== "string" || path === "null" || path === "undefined" || path.trim() === "") return null;
  const clean = path.trim();
  if (clean === "null" || clean === "undefined") return null;
  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:")) {
    return clean;
  }
  if (clean.startsWith("/")) {
    return clean;
  }
  const stripped = clean.replace(/^uploads\//, '');
  return `https://api.ridewithpals.com/uploads/${stripped}`;
};

export const MemberAvatar: React.FC<{
  src: string | null;
  name: string;
  initials: string;
  size?: string;
  textSize?: string;
}> = ({ src, name, initials, size = "w-10 h-10", textSize = "text-xs" }) => {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(src && !hasError);

  return (
    <div className={cn(size, "rounded-full overflow-hidden bg-main-bg border border-border flex items-center justify-center font-bold text-text-main shadow-xs relative shrink-0")}>
      {showImage ? (
        <img
          src={src!}
          alt=""
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className={cn("w-full h-full flex items-center justify-center font-black uppercase text-[#EB712B] bg-[#EB712B]/10 select-none", textSize)}>
          {initials || (name ? name.substring(0, 2).toUpperCase() : 'AT')}
        </div>
      )}
    </div>
  );
};

export const GroupChatInfoDrawer: React.FC<GroupChatInfoDrawerProps> = ({
  isOpen,
  onClose,
  activeUser,
  messages,
  onOpenProfile,
  onStartDirectChat,
  onUpdateGroupDetails,
}) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((s) => s.auth.user);
  const [memberSearch, setMemberSearch] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const rideIdNum = activeUser.rideId ? Number(activeUser.rideId) : 0;
  const { data: rideData, refetch: refetchRide } = useGetRideInfoByIdQuery(
    { rideId: rideIdNum },
    { skip: !rideIdNum }
  );

  const [leaveRide] = useLeaveRideMutation();

  const rideDetails = useMemo(() => {
    if (!rideData) return null;
    const r = rideData as any;
    const rawParticipants = Array.isArray(r.joinedParticipants) ? r.joinedParticipants : [];
    
    const hostFromP = rawParticipants.find((p: any) => 
      (r.userId && Number(p.id || p.userId) === Number(r.userId)) ||
      p.role?.toLowerCase() === "host" ||
      p.role?.toLowerCase() === "organizer" ||
      p.role?.toLowerCase() === "owner" ||
      Boolean(p.isHost)
    );

    const hostUser = r.user || r.organizer || r.creator || hostFromP;
    const isCurUserHost = currentUser?.id && r.userId && Number(currentUser.id) === Number(r.userId);

    const resolvedHostName = 
      hostUser?.fullName ||
      hostUser?.name ||
      r.organizerName ||
      (hostFromP ? (hostFromP.fullName || hostFromP.name) : null) ||
      (isCurUserHost ? (currentUser.fullName || (currentUser as any).name) : null) ||
      (rawParticipants.length > 0 && rawParticipants[0].name ? rawParticipants[0].name : null) ||
      `${r.club?.clubName || "Club"} Organizer`;

    const resolvedHostUsername = 
      hostUser?.username ? (hostUser.username.startsWith('@') ? hostUser.username : `@${hostUser.username}`) :
      (hostFromP && hostFromP.username ? (hostFromP.username.startsWith('@') ? hostFromP.username : `@${hostFromP.username}`) : null) ||
      `@${resolvedHostName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const resolvedHostEmail = 
      hostUser?.email ||
      hostFromP?.email ||
      (isCurUserHost ? currentUser.email : null) ||
      `${resolvedHostName.toLowerCase().replace(/[^a-z0-9]/g, '')}@ridewithpals.com`;

    const resolvedHostAvatar = resolveAvatarUrl(
      hostUser?.profileImage ||
      hostUser?.profilePhoto ||
      hostUser?.avatar ||
      hostFromP?.profile ||
      hostFromP?.profilePhoto ||
      hostFromP?.avatar ||
      (isCurUserHost ? ((currentUser as any)?.profileImage || (currentUser as any)?.avatar) : null)
    );

    return {
      id: r.id || rideIdNum,
      title: r.rideName || r.title || activeUser.name,
      description: r.description || "Official group discussion for participants to coordinate equipment, rendezvous, and safety guidelines.",
      clubId: r.clubId || r.club?.id,
      clubName: r.club?.clubName || "Independent Club",
      meetingPoint: r.meetingPoint || r.startLocation || "Meeting point TBD",
      date: r.date,
      time: r.time,
      distance: r.distance ? `${r.distance} km` : "TBD",
      pace: r.pace ? `${r.pace} min/km` : "Moderate",
      gpxFile: r.gpxFile || null,
      hostId: r.userId || hostUser?.id || (isCurUserHost ? currentUser.id : null),
      hostName: resolvedHostName,
      hostUsername: resolvedHostUsername,
      hostEmail: resolvedHostEmail,
      hostAvatar: resolvedHostAvatar,
      leaders: Array.isArray(r.rideLeaders) ? r.rideLeaders : [],
      participants: rawParticipants,
    };
  }, [rideData, rideIdNum, activeUser.name, currentUser]);

  const isCurrentUserHost = useMemo(() => {
    if (!currentUser?.id) return false;
    if (rideDetails?.hostId && Number(rideDetails.hostId) === Number(currentUser.id)) return true;
    return false;
  }, [currentUser, rideDetails]);

  // Extract accurate participant roster with real names, emails, avatars & roles
  const fullRoster = useMemo(() => {
    const list: Array<{
      id: number | string;
      name: string;
      username: string;
      email: string;
      initials: string;
      avatar: string | null;
      role: 'Host' | 'Leader' | 'Athlete';
      verified: boolean;
    }> = [];

    if (rideDetails) {
      // 1. Host
      const hostInitials = rideDetails.hostName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'OR';

      list.push({
        id: rideDetails.hostId || 'host',
        name: rideDetails.hostName,
        username: rideDetails.hostUsername,
        email: rideDetails.hostEmail,
        initials: hostInitials,
        avatar: rideDetails.hostAvatar,
        role: 'Host',
        verified: true,
      });

      // 2. Leaders
      const leaderIds = new Set<number>();
      rideDetails.leaders.forEach((l: any, lIdx: number) => {
        const lId = Number(l.userId || l.id);
        if (lId) leaderIds.add(lId);

        if (!list.some((item) => Number(item.id) === lId)) {
          const lName = l.name || l.fullName || 'Ride Leader';
          const lUsername = l.username ? (l.username.startsWith('@') ? l.username : `@${l.username}`) : `@${lName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
          const lEmail = l.email || `${lName.toLowerCase().replace(/[^a-z0-9]/g, '')}@ridewithpals.com`;
          const lInitials = lName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'RL';
          const lAvatar = resolveAvatarUrl(l.profileImage || l.avatar || l.profilePhoto || l.profile);

          list.push({
            id: lId || `leader-${lIdx}`,
            name: lName,
            username: lUsername,
            email: lEmail,
            initials: lInitials,
            avatar: lAvatar,
            role: 'Leader',
            verified: true,
          });
        }
      });

      // 3. Participants
      rideDetails.participants.forEach((p: any, idx: number) => {
        const pId = typeof p === 'object' ? Number(p.id || p.userId) : Number(p);
        
        // Skip if already in list (e.g. host or leader)
        if (pId && list.some((item) => Number(item.id) === pId)) {
          return;
        }

        const rawName = typeof p === 'object' 
          ? (p.fullName || p.name || p.user?.fullName || p.user?.name || p.username || (p.email ? p.email.split('@')[0] : `Athlete #${pId || idx + 1}`)) 
          : `Athlete #${pId || idx + 1}`;
        const pName = rawName.trim();
        const pUsername = typeof p === 'object' && (p.username || p.user?.username)
          ? ((p.username || p.user?.username).startsWith('@') ? (p.username || p.user?.username) : `@${p.username || p.user?.username}`) 
          : `@${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
        const pEmail = typeof p === 'object' && (p.email || p.user?.email || p.athlete?.email) 
          ? (p.email || p.user?.email || p.athlete?.email) 
          : `${pName.toLowerCase().replace(/[^a-z0-9]/g, '')}@ridewithpals.com`;
        const pInitials = pName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'AT';
        const rawAvatar = typeof p === 'object' ? (p.profileImage || p.profilePhoto || p.avatar || p.profile || p.user?.profileImage || p.user?.profilePhoto || p.user?.avatar) : null;
        const pAvatar = resolveAvatarUrl(rawAvatar);

        const isLeader = typeof p === 'object' && (leaderIds.has(pId) || Boolean(p.isLeader) || p.role?.toLowerCase() === 'leader');

        list.push({
          id: pId || `athlete-${idx}`,
          name: pName,
          username: pUsername,
          email: pEmail,
          initials: pInitials,
          avatar: pAvatar,
          role: isLeader ? 'Leader' : 'Athlete',
          verified: typeof p === 'object' ? Boolean(p.isVerified || p.verified || isLeader) : false,
        });
      });
    }

    // Fallback if empty roster
    if (list.length === 0) {
      const currentUserName = currentUser?.fullName || (currentUser as any)?.name || 'Athlete';
      const currentUserHandle = (currentUser as any)?.username || 'athlete';
      const userEmail = currentUser?.email || `${currentUserName.toLowerCase().replace(/[^a-z0-9]/g, '')}@ridewithpals.com`;
      const initials = currentUserName.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) || 'ME';
      const userAvatar = resolveAvatarUrl((currentUser as any)?.profileImage || (currentUser as any)?.avatar || (currentUser as any)?.profilePhoto);

      list.push({
        id: Number(currentUser?.id || 1),
        name: currentUserName,
        username: `@${currentUserHandle.replace('@', '')}`,
        email: userEmail,
        initials,
        avatar: userAvatar,
        role: isCurrentUserHost ? 'Host' : 'Athlete',
        verified: true,
      });
    }

    return list;
  }, [rideDetails, currentUser, isCurrentUserHost]);

  // Filtered members
  const filteredRoster = useMemo(() => {
    if (!memberSearch.trim()) return fullRoster;
    const q = memberSearch.toLowerCase();
    return fullRoster.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)
    );
  }, [fullRoster, memberSearch]);

  // Shared media from conversation messages
  const sharedMedia = useMemo(() => {
    return messages.filter((m) => m.type === 'image' || m.type === 'video');
  }, [messages]);

  const handleDownloadGpx = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadGpxFile({
      id: rideIdNum || activeUser.id,
      title: activeUser.name,
      clubName: rideDetails?.clubName,
      location: rideDetails?.meetingPoint,
      date: rideDetails?.date,
      gpxFile: rideDetails?.gpxFile,
    });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Group notifications unmuted.' : 'Group notifications muted.');
  };

  const handleLeaveGroup = async () => {
    if (!rideIdNum) return;
    const confirm = window.confirm('Are you sure you want to leave this activity group? You will be removed from the athlete roster.');
    if (!confirm) return;

    setIsLeaving(true);
    try {
      await leaveRide({ rideId: rideIdNum }).unwrap();
      toast.success('You have left the activity group.');
      refetchRide();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to leave activity');
    } finally {
      setIsLeaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[500] lg:hidden animate-in fade-in duration-200"
      />

      {/* Drawer Container */}
      <div 
        className="fixed lg:static top-0 right-0 bottom-0 z-[510] lg:z-10 w-full sm:w-[380px] lg:w-[360px] xl:w-[390px] h-full bg-surface border-l border-border flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300 select-none text-left"
      >
        {/* Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] border border-[#EB712B]/25 flex items-center justify-center shadow-sm">
              <Users size={14} className="text-[#EB712B]" />
            </div>
            <h3 className="text-sm font-bold text-text-main tracking-wide">Group Information</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-hover text-text-muted hover:text-text-main flex items-center justify-center transition-all cursor-pointer border border-border"
            title="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
          
          {/* 1. Hero Cover & Avatar */}
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="relative group/avatar">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-[#EB712B]/20 to-black border-2 border-border flex items-center justify-center shadow-xl relative">
                {activeUser.avatar ? (
                  <img 
                    src={resolveAvatarUrl(activeUser.avatar) || ''} 
                    alt="" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : null}
                <div 
                  className="w-full h-full items-center justify-center text-2xl font-black text-[#EB712B] bg-[#EB712B]/10 absolute inset-0 -z-10 flex"
                >
                  <Users size={36} />
                </div>
              </div>
              {isCurrentUserHost && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#EB712B] hover:bg-[#d66525] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer border-2 border-surface"
                  title="Edit Group Icon"
                >
                  <Edit3 size={13} />
                </button>
              )}
            </div>

            <div className="space-y-1 max-w-full px-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-lg font-black text-text-main tracking-tight truncate max-w-[260px]">
                  {activeUser.name}
                </h2>
                {isCurrentUserHost && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="text-text-muted hover:text-[#EB712B] transition-colors p-1 cursor-pointer"
                    title="Edit Title & Notice"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                <span className="px-2 py-0.5 rounded-md bg-[#EB712B]/15 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-extrabold uppercase tracking-wider">
                  Activity Group
                </span>
                <span>•</span>
                <span className="font-semibold text-text-muted">{rideDetails?.clubName || 'Club Activity'}</span>
              </div>
            </div>
          </div>

          {/* 2. Action Icons Bar */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* View Activity */}
            <button
              type="button"
              onClick={() => {
                if (rideIdNum) navigate(`/view/userside/dashboard/ride/${rideIdNum}`);
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] hover:bg-hover border border-[#EB712B]/25 hover:border-[#EB712B]/45 text-text-muted hover:text-text-main transition-all cursor-pointer group"
              title="View Activity Details"
            >
              <ExternalLink size={16} className="text-[#EB712B] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Activity</span>
            </button>

            {/* Download GPX */}
            <button
              type="button"
              onClick={handleDownloadGpx}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] hover:bg-hover border border-[#EB712B]/25 hover:border-[#EB712B]/45 text-text-muted hover:text-emerald-400 transition-all cursor-pointer group"
              title="Download GPX Route"
            >
              <Download size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">GPX</span>
            </button>

            {/* Share Group */}
            <button
              type="button"
              onClick={() => setIsShareModalOpen(true)}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-br from-[#2a170e] via-[#1c1410] to-[#120f0e] hover:bg-hover border border-[#EB712B]/25 hover:border-[#EB712B]/45 text-text-muted hover:text-text-main transition-all cursor-pointer group"
              title="Share Activity Group"
            >
              <Share2 size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold">Share</span>
            </button>

            {/* Mute Notifications */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-all cursor-pointer group",
                isMuted 
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400" 
                  : "bg-surface hover:bg-hover border border-border text-text-muted hover:text-text-main"
              )}
              title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
            >
              {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
              <span className="text-[10px] font-bold">{isMuted ? 'Muted' : 'Mute'}</span>
            </button>
          </div>

          {/* 3. Activity Snapshot Card */}
          {rideDetails && (
            <div className="bg-main-bg border border-border rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Activity Snapshot</span>
                <span className="text-xs font-bold text-[#EB712B]">{rideDetails.distance}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-text-muted">
                  <Calendar size={13} className="text-[#EB712B] shrink-0" />
                  <span className="truncate">{rideDetails.date ? new Date(rideDetails.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : 'Upcoming'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Clock size={13} className="text-[#EB712B] shrink-0" />
                  <span className="truncate">{rideDetails.time || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <Gauge size={13} className="text-[#EB712B] shrink-0" />
                  <span className="truncate">{rideDetails.pace}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <MapPin size={13} className="text-[#EB712B] shrink-0" />
                  <span className="truncate" title={rideDetails.meetingPoint}>{rideDetails.meetingPoint}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Guidelines / Notice Board */}
          <div className="bg-main-bg border border-border rounded-2xl p-4 space-y-2 text-xs shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">Pinned Notice / Guidelines</span>
              {isCurrentUserHost && (
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-[10px] font-bold text-[#EB712B] hover:underline cursor-pointer"
                >
                  Edit
                </button>
              )}
            </div>
            <p className="text-text-muted leading-relaxed font-medium line-clamp-4">
              {rideDetails?.description || "Stay hydrated, follow route indicators, and connect here with leaders for questions."}
            </p>
          </div>

          {/* 5. Members / Athletes Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#EB712B]" />
                <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                  Athletes ({fullRoster.length})
                </span>
              </div>
            </div>

            {/* Search members */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-main-bg border border-border focus:border-[#EB712B] text-xs text-text-main outline-none placeholder:text-text-muted/60"
              />
            </div>

            {/* Members List */}
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto custom-scrollbar pr-1">
              {filteredRoster.map((member) => {
                const isMe = currentUser?.id && Number(currentUser.id) === Number(member.id);

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-hover border border-transparent hover:border-border transition-all group/member"
                  >
                    {/* Athlete Avatar & Name */}
                    <div 
                      onClick={() => onOpenProfile(member.id)}
                      className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    >
                      {/* Avatar with robust MemberAvatar */}
                      <div className="relative shrink-0">
                        <MemberAvatar
                          src={member.avatar}
                          name={member.name}
                          initials={member.initials}
                          size="w-10 h-10"
                        />
                        {member.role === 'Host' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center shadow">
                            <Crown size={9} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-text-main truncate group-hover/member:text-[#EB712B] transition-colors">
                            {member.name}
                          </span>
                          {isMe && <span className="text-[10px] text-text-muted font-normal">(You)</span>}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                          <span className="truncate max-w-[140px] sm:max-w-[170px] lowercase text-text-muted font-medium">
                            {member.email}
                          </span>
                          <span>•</span>
                          <span className={cn(
                            "font-black uppercase text-[8px] px-1.5 py-0.5 rounded tracking-wider shrink-0",
                            member.role === 'Host' ? "text-amber-400 bg-amber-400/10 border border-amber-400/25" :
                            member.role === 'Leader' ? "text-[#EB712B] bg-[#EB712B]/10 border border-[#EB712B]/25" : 
                            "text-text-muted bg-surface border border-border"
                          )}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Direct Chat with Member */}
                    {!isMe && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartDirectChat(Number(member.id), member.name, member.avatar || undefined);
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-surface hover:bg-[#EB712B]/20 text-text-muted hover:text-[#EB712B] border border-border hover:border-[#EB712B]/40 transition-all cursor-pointer opacity-0 group-hover/member:opacity-100 shrink-0 shadow-xs"
                        title={`Send private message to ${member.name}`}
                      >
                        <MessageSquare size={13} />
                      </button>
                    )}
                  </div>
                );
              })}

              {filteredRoster.length === 0 && (
                <div className="text-center py-4 text-xs text-text-muted font-medium">
                  No athletes found matching "{memberSearch}"
                </div>
              )}
            </div>
          </div>

          {/* 6. Shared Media Section */}
          {sharedMedia.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                  Shared Media ({sharedMedia.length})
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sharedMedia.slice(0, 6).map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    onClick={() => window.open(item.content, '_blank')}
                    className="aspect-square rounded-xl overflow-hidden bg-main-bg border border-border hover:border-[#EB712B] transition-all cursor-pointer group relative"
                  >
                    <img src={item.content} alt="Media" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Leave Activity Group Button */}
          {!isCurrentUserHost && rideIdNum > 0 && (
            <div className="pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut size={14} />
                <span>{isLeaving ? 'Leaving Activity...' : 'Leave Activity Group'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Group Modal */}
      {rideIdNum > 0 && isEditModalOpen && (
        <EditGroupModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          rideId={rideIdNum}
          currentTitle={activeUser.name}
          currentDescription={rideDetails?.description}
          currentAvatar={activeUser.avatar}
          onSuccess={(updated) => {
            onUpdateGroupDetails?.(updated);
            refetchRide();
          }}
        />
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <UniversalShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={`Join ${activeUser.name} Activity Group`}
          url={`${window.location.origin}/view/userside/dashboard/ride/${rideIdNum}`}
          description={`Join ${activeUser.name} with ${rideDetails?.clubName || 'club athletes'}`}
        />
      )}
    </>
  );
};
