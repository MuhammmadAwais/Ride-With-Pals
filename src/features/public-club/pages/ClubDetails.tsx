/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, MapPin, Users, Activity, ShieldCheck, MessageSquare, Crown, Globe, Lock, Bike, Trophy, LogOut, X, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useGetClubInfoByIdQuery, useGetJoinedClubsQuery, useLeaveClubMutation, useGetClubMembersListQuery } from '@/features/club/api/clubApiSlice';
import { useGetMyMembershipInfoQuery } from '@/features/club/api/membershipApiSlice';
import { useClub } from '@/features/club/hooks/useClub';
import { useAppSelector } from '@/hooks/useAppSelector';
import { ClubMembershipModal } from '../components/ClubMembershipModal';
import { resolveImageUrl } from '../services/clubGeocoding';
import AvatarLightboxModal from '@/components/ui/AvatarLightboxModal';
import { Trans } from '@lingui/react/macro';


// Import refactored tab components
import Ride from './Ride';
import NewsFeed from '@/features/ClubSide/News';
import Leaderboard from '@/features/ClubSide/Leaderboard';
import Marketplace from './Marketplace';
import Discount from '@/features/ClubSide/Discount';
import Members from '@/features/ClubSide/Members';

import Shop from './Shop';
import Overviews from './Overviews';

type TabType = 'Overview' | 'Rides' | 'News' | 'Leaderboard' | 'Marketplace' | 'Shop' | 'Discounts' | 'Members';

const TABS: TabType[] = ['Overview', 'Rides', 'News', 'Leaderboard', 'Marketplace', 'Shop', 'Discounts', 'Members'];

const getMemberCount = (club: any) => {
  if (!club) return 0;
  const val =
    club.participantCount ??
    club.participant_count ??
    club.memberCount ??
    club.member_count ??
    club.totalMembers ??
    club.total_members ??
    club.membersCount ??
    club.members_count ??
    club.userCount ??
    club.user_count ??
    club.count ??
    club.total ??
    club.clubMembers?.length ??
    club.ClubMembers?.length ??
    club.club_members?.length ??
    club.user_clubs?.length ??
    club.userClubs?.length ??
    club.UserClubs?.length ??
    club.members?.length ??
    club.Members?.length ??
    club.users?.length ??
    club.Users?.length ??
    club.participants?.length ??
    club.Participants?.length ??
    club._count?.user_clubs ??
    club._count?.members ??
    club._count?.users;

  const count = Number(val);
  if (!isNaN(count) && count > 0) return count;
  return 0;
};

export const extractMembersList = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.response)) return data.response;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.members)) return data.members;
  if (Array.isArray(data?.clubMembers)) return data.clubMembers;
  return [];
};

const getClubTypeName = (typeId?: any, rawName?: string) => {
  if (rawName && typeof rawName === "string" && rawName.trim() !== "") {
    const lower = rawName.toLowerCase();
    if (lower.includes("run")) return "Running";
    if (lower.includes("triathlon")) return "Triathlon";
    if (lower.includes("cycl") || lower.includes("bike")) return "Cycling";
  }
  if (typeId === 2 || typeId === "2" || String(typeId).toLowerCase() === "running") return "Running";
  if (
    typeId === 3 ||
    typeId === "3" ||
    String(typeId).toLowerCase() === "triathlon" ||
    String(typeId).toLowerCase() === "cycling & running"
  )
    return "Triathlon";
  return "Cycling";
};

const renderSportBadge = (typeId?: any, rawName?: string) => {
  const sport = getClubTypeName(typeId, rawName);
  if (sport === "Running") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
        <Activity size={12} className="shrink-0 text-amber-500" /> <Trans>RUNNING</Trans>
      </span>
    );
  }
  if (sport === "Triathlon") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
        <Trophy size={12} className="shrink-0 text-purple-400" /> <Trans>TRIATHLON</Trans>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/25 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap">
      <Bike size={12} className="shrink-0 text-[#EB712B]" /> <Trans>CYCLING</Trans>
    </span>
  );
};

export default function ClubDetails() {

  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('Overview');
  const currentUser = useAppSelector((state) => state.auth.user);

  // Join / Leave Flow State
  const { handleJoinClub, isJoining } = useClub();
  const [leaveClub, { isLoading: isLeaving }] = useLeaveClubMutation();
  const { data: joinedClubsData } = useGetJoinedClubsQuery();
  const joinedRows = joinedClubsData?.rows || [];
  const { myClubs } = useAppSelector((s) => s.club);
  const isMember = joinedRows.some((c: any) => c.id === Number(clubId)) || myClubs.some((c: any) => c.id === Number(clubId));


  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showClubAvatarPreview, setShowClubAvatarPreview] = useState(false);
  const [showCodeScreen, setShowCodeScreen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [codeError, setCodeError] = useState("");
  
  const [showDepositScreen, setShowDepositScreen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  // Lock body scroll and handle Escape key when modals are open
  useEffect(() => {
    if (showLeaveModal || showCodeScreen || showDepositScreen || showMembershipModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLeaveModal, showCodeScreen, showDepositScreen, showMembershipModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLeaveModal) setShowLeaveModal(false);
        if (showCodeScreen) setShowCodeScreen(false);
        if (showDepositScreen) setShowDepositScreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLeaveModal, showCodeScreen, showDepositScreen]);

  const { data: clubData, isLoading, isError } = useGetClubInfoByIdQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const { data: membersData } = useGetClubMembersListQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const { data: myMembershipInfo } = useGetMyMembershipInfoQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );
  
  const hasActiveMembership = myMembershipInfo?.status === 'active';

  // Fallback to empty object if response is structured differently
  const club: any = (clubData as any)?.response || (clubData as any)?.data || clubData || {};

  const resolvedMembersList = useMemo(() => {
    const list = extractMembersList(membersData);
    if (list.length > 0) return list;
    const fromClub = extractMembersList(club?.clubMembers || club?.members || club?.user_clubs || club?.participants);
    if (fromClub.length > 0) return fromClub;
    return [];
  }, [membersData, club]);

  const dynamicMemberCount = useMemo(() => {
    if (resolvedMembersList.length > 0) return resolvedMembersList.length;
    return getMemberCount(club);
  }, [resolvedMembersList, club]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-main-bg">
        <Loader2 size={32} className="animate-spin text-[#EB712B]" />
      </div>
    );
  }

  if (isError || !clubData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-main-bg p-4 text-center space-y-4">
        <ShieldCheck size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-text-main">Club Not Found</h2>
        <p className="text-sm text-text-muted">The club you are looking for does not exist or you do not have permission to view it.</p>
        <button 
          onClick={() => navigate('/view/userside/clubs')}
          className="px-6 py-2.5 bg-[#EB712B] text-white font-bold rounded-xl hover:bg-[#d05c19]"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  const coverImage =
    resolveImageUrl(club.coverImage) ||
    resolveImageUrl(club.bannerImage) ||
    resolveImageUrl(club.logo) ||
    '/Images/CycleImage2.png';

  const logoImage =
    resolveImageUrl(club.logo) ||
    resolveImageUrl(club.avatar) ||
    resolveImageUrl(club.coverImage) ||
    '/Images/CycleImage2.png';

  const isOwner = club.userId === currentUser?.id;

  const handleMessageOwner = () => {
    if (club.userId) {
      navigate('/view/userside/support', { 
        state: { 
          targetUserId: club.userId,
          targetUserName: club.user?.fullName || club.user?.firstName || 'Club Owner',
          targetUserAvatar: club.user?.profileImage || '/Images/CycleImage.png'
        } 
      });
    } else {
      toast.error("Unable to find club owner's details.");
    }
  };

  const handleRequestMembership = async () => {
    if (club.restrictUnpaidMembers) {
      setShowDepositScreen(true);
    } else {
      await handleJoinClub(club.id);
    }
  };

  const handleJoinClubClick = async () => {
    if (club.clubPrivacyId === 2) {
      setShowCodeScreen(true);
    } else if (club.restrictUnpaidMembers) {
      setShowDepositScreen(true);
    } else {
      await handleJoinClub(club.id);
    }
  };

  const handleLeaveClubClick = () => {
    setShowLeaveModal(true);
  };

  const handleConfirmLeave = async () => {
    const targetClubId = club?.id || Number(clubId);
    if (!targetClubId) return;
    try {
      await leaveClub({ clubId: targetClubId }).unwrap();
      setShowLeaveModal(false);
      toast.success("You have left the club successfully.");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to leave the club.");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleJoinClub(club.id, joinCode);
    if (success) {
      setCodeError("");
      setShowCodeScreen(false);
      if (club.restrictUnpaidMembers) {
        setShowDepositScreen(true);
      }
    } else {
      setCodeError("Failed to join with code.");
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const groups = val.match(/.{1,4}/g);
    setCardNumber(groups ? groups.join(" ") : "");
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      val = val.slice(0,2) + "/" + val.slice(2,4);
    }
    setExpiryDate(val);
  };

  const isCardComplete = cardNumber.replace(/\s/g, "").length === 16;
  const isExpiryComplete = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate);
  const isCvvComplete = cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv);
  const isHolderComplete = accountHolder.trim().length > 2;
  const isFormValid = isCardComplete && isExpiryComplete && isCvvComplete && isHolderComplete;

  const handleDepositConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setPaymentSuccess(true);
    setTimeout(async () => {
      await handleJoinClub(club.id);
      setShowDepositScreen(false);
      setPaymentSuccess(false);
    }, 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Overviews clubId={clubId} club={club} membersCount={dynamicMemberCount} />
          </div>
        );
      case 'Rides':
        return <Ride clubId={clubId} />;
      case 'News':
        return <NewsFeed clubId={clubId} club={club} />;
      case 'Leaderboard':
        return <Leaderboard clubId={clubId} />;
      case 'Marketplace':
        return <Marketplace clubId={clubId} />;
      case 'Shop':
        return <Shop clubId={clubId} />;
      case 'Discounts':
        return <Discount role="athlete" clubId={clubId} />;
      case 'Members':
        return <Members clubId={clubId} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-main-bg text-text-main font-sans overflow-x-hidden select-none pb-20">
      
      {/* ── Dynamic Hero Header ── */}
      <div className="relative h-60 sm:h-72 md:h-80 lg:h-[340px] w-full overflow-hidden bg-black select-none">
        <img 
          src={coverImage} 
          alt={club.clubName || "Club Cover"} 
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage2.png'; }}
        />
        {/* Layered Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-main-bg via-main-bg/60 to-black/35" />
        
        {/* Top Floating Bar: Back Button + Sport Tag */}
        <div className="absolute top-6 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-center z-20">
          <button 
            onClick={() => navigate('/view/userside/clubs')}
            className="px-3.5 py-2 bg-black/60 hover:bg-black/85 backdrop-blur-xl border border-white/15 rounded-2xl flex items-center gap-2 text-white text-xs font-bold transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer group"
            title="Back to clubs"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline"><Trans>Back to Clubs</Trans></span>
          </button>

          {/* Top-Right Sport Pill on Banner */}
          {renderSportBadge(club.clubTypeId, club.sport || club.sportType || club.category)}
        </div>
      </div>

      {/* ── Club Identity Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-16 sm:-mt-20 md:-mt-24 z-10">
        <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-end justify-between mb-8">
          
          {/* Left Block: Avatar + Name & Info */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-end min-w-0 flex-1 w-full">
            
            {/* Club Logo Avatar */}
            <div 
              onClick={() => setShowClubAvatarPreview(true)}
              className="relative shrink-0 group cursor-pointer"
              title="Click to preview club avatar"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-main-bg bg-surface flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-102">
                <img 
                  src={logoImage} 
                  alt={club.clubName || "Club Logo"} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage.png'; }}
                />
              </div>
              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Eye size={24} className="text-white drop-shadow-md" />
              </div>
              {club.isVerified && (
                <div 
                  className="absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 w-8 h-8 bg-emerald-500 rounded-2xl border-2 border-main-bg flex items-center justify-center pointer-events-none"
                  title="Verified Club"
                >
                  <ShieldCheck size={16} className="text-white" />
                </div>
              )}
            </div>

            {/* Middle Info Column: Title & Metadata Chips */}
            <div className="space-y-2.5 min-w-0 flex-1 w-full">
              {/* Title in ONE single line */}
              <h1 
                className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black tracking-tight text-text-main uppercase leading-tight whitespace-nowrap truncate"
                title={club.clubName || "Unnamed Club"}
              >
                {club.clubName || "Unnamed Club"}
              </h1>

              {/* Badges / Chips Row */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-bold">
                {/* Truncated Address Chip with hover tooltip */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 border border-border rounded-xl text-xs font-semibold text-text-muted hover:text-text-main transition-colors max-w-full min-w-0"
                  title={club.location || "Global"}
                >
                  <MapPin size={13} className="text-[#EB712B] shrink-0" />
                  <span className="truncate max-w-[180px] sm:max-w-[260px] md:max-w-[360px] lg:max-w-[480px]">
                    {club.location || <Trans>Global</Trans>}
                  </span>
                </div>

                {/* Members Chip */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface/90 border border-border rounded-xl text-xs font-bold text-text-muted whitespace-nowrap">
                  <Users size={13} className="text-[#EB712B] shrink-0" />
                  <span>{dynamicMemberCount} {dynamicMemberCount === 1 ? <Trans>Member</Trans> : <Trans>Members</Trans>}</span>
                </div>

                {/* Privacy Chip */}
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider border whitespace-nowrap ${
                  club.clubPrivacyId === 1 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  {club.clubPrivacyId === 1 ? <Globe size={12} /> : <Lock size={12} />}
                  <span>{club.clubPrivacyId === 1 ? <Trans>Public Club</Trans> : <Trans>Private Club</Trans>}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Block: Action Buttons (Responsive flex-wrap) */}
          <div className="shrink-0 flex flex-wrap items-center gap-2.5 sm:gap-3 w-full xl:w-auto pt-2 xl:pt-0">
            {/* Membership Button (Only shown when club hasMembershipFee is true or active membership exists) */}
            {Boolean(club?.hasMembershipFee || hasActiveMembership) && (
              <button
                type="button"
                onClick={() => setShowMembershipModal(true)}
                title="View & Subscribe to Club Membership Plans"
                className={`inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer border ${
                  hasActiveMembership
                    ? 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-400'
                }`}
              >
                <Crown size={16} className={hasActiveMembership ? "text-emerald-400" : "text-amber-400"} />
                <span>{hasActiveMembership ? ((myMembershipInfo as any)?.feeName || myMembershipInfo?.plan?.name || <Trans>Active Member</Trans>) : <Trans>Membership</Trans>}</span>
              </button>
            )}

            {/* Request / Join / Leave Club Buttons */}
            {!isMember && !showCodeScreen && !showDepositScreen && (
              club.clubPrivacyId === 2 ? (
                <>
                  <button 
                    onClick={handleRequestMembership}
                    disabled={isJoining}
                    className="inline-flex items-center justify-center px-6 sm:px-7 py-3 bg-[#EB712B] hover:bg-[#ff8036] text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isJoining ? <Trans>Requesting...</Trans> : <Trans>Request Membership</Trans>}
                  </button>
                  <button 
                    onClick={handleJoinClubClick}
                    disabled={isJoining}
                    className="inline-flex items-center justify-center px-5 py-3 bg-surface border border-border hover:bg-hover text-text-main text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer hover:border-white/20"
                  >
                    <Trans>Join with Code</Trans>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleJoinClubClick}
                  disabled={isJoining}
                  className="inline-flex items-center justify-center px-7 py-3 bg-[#EB712B] hover:bg-[#ff8036] text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isJoining ? <Trans>Joining...</Trans> : <Trans>Join Club</Trans>}
                </button>
              )
            )}

            {/* Joined Status / Leave Club */}
            {isMember && (
              <button 
                onClick={handleLeaveClubClick}
                disabled={isLeaving}
                className="inline-flex items-center justify-center px-6 py-3 bg-hover hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-muted hover:text-red-500 transition-colors text-xs font-black uppercase tracking-wider rounded-2xl cursor-pointer disabled:opacity-50"
                title="Click to leave club"
              >
                {isLeaving ? <Trans>Leaving...</Trans> : <Trans>✓ Joined (Leave)</Trans>}
              </button>
            )}

            {/* Message Club Owner */}
            {!isOwner && (
              <button 
                onClick={handleMessageOwner}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-surface border border-border hover:bg-hover text-text-main hover:text-[#EB712B] hover:border-[#EB712B]/30 text-xs font-black uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer"
              >
                <MessageSquare size={15} />
                <span><Trans>Message</Trans></span>
              </button>
            )}
          </div>
        </div>


        {/* ── Navigation Tabs ── */}
        <div className="border-b border-border/50 mb-8 overflow-x-auto custom-scrollbar">
          <div className="flex gap-8 min-w-max px-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-black uppercase tracking-wider transition-all duration-300 relative outline-none cursor-pointer border-0 bg-transparent ${
                  activeTab === tab 
                    ? 'text-[#EB712B]' 
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab === 'Overview' ? <Trans>Overview</Trans> :
                 tab === 'Rides' ? <Trans>Rides</Trans> :
                 tab === 'News' ? <Trans>News</Trans> :
                 tab === 'Leaderboard' ? <Trans>Leaderboard</Trans> :
                 tab === 'Marketplace' ? <Trans>Marketplace</Trans> :
                 tab === 'Shop' ? <Trans>Shop</Trans> :
                 tab === 'Discounts' ? <Trans>Discounts</Trans> :
                 <Trans>Members</Trans>}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-[#EB712B] rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content Area ── */}
        <div className="min-h-[400px]">
          {activeTab === 'Overview' ? renderTabContent() : isMember ? renderTabContent() : (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted text-xs font-bold tracking-wider mt-8">
              <Trans>Join this club to view its {activeTab}.</Trans>
            </div>
          )}
        </div>

      </div>

      {/* ── MODALS ── */}
      {showCodeScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl relative">
            <div className="text-center">
              <h3 className="text-xl font-black uppercase tracking-tight"><Trans>Join Verification</Trans></h3>
              <p className="text-text-muted text-[10px] mt-1 tracking-wider"><Trans>Please enter the club join code (Hint: 111)</Trans></p>
            </div>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <input
                type="text"
                placeholder="— — —"
                maxLength={3}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full bg-main-bg border border-border rounded-xl p-4 text-center text-lg font-bold tracking-widest focus:outline-none focus:border-[#EB712B] text-text-main placeholder-gray-600"
              />
              {codeError && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[10px] font-bold tracking-wide animate-pulse">
                  <Activity size={14} className="shrink-0" />
                  <span>{codeError}</span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCodeScreen(false)}
                  className="flex-1 py-4 bg-hover hover:bg-border text-text-muted rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all border border-border"
                >
                  <Trans>Cancel</Trans>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-[#EB712B]/10"
                >
                  <Trans>Verify</Trans>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDepositScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-md space-y-6 my-8 shadow-2xl relative">
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-fade-in">
                <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20 text-green-400">
                  <ShieldCheck size={48} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-text-main"><Trans>Payment Successful!</Trans></h3>
                  <p className="text-text-muted text-[10px] mt-1 tracking-wider"><Trans>Adding you to the club...</Trans></p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight"><Trans>Secure Checkout</Trans></h3>
                  <p className="text-text-muted text-[10px] mt-1 tracking-wider"><Trans>Club entry fee:</Trans> <span className="text-[#EB712B] font-bold">${club.price || 50}</span></p>
                </div>
                <form onSubmit={handleDepositConfirm} className="space-y-4 text-xs font-bold tracking-wider">
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase mb-1"><Trans>Card number</Trans></label>
                    <input
                      type="text"
                      placeholder="1111 1111 1111 1111"
                      maxLength={19}
                      value={cardNumber}
                      onChange={handleCardChange}
                      className="w-full bg-main-bg border border-border rounded-xl p-4 text-text-main focus:outline-none focus:border-[#EB712B]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] text-text-muted uppercase mb-1"><Trans>Expiry Date</Trans></label>
                      <input
                        type="text"
                        placeholder="12/26"
                        maxLength={5}
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="w-full bg-main-bg border border-border rounded-xl p-4 text-text-main focus:outline-none focus:border-[#EB712B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-text-muted uppercase mb-1"><Trans>CVV</Trans></label>
                      <input
                        type="text"
                        placeholder="XXX"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-main-bg border border-border rounded-xl p-4 text-text-main focus:outline-none focus:border-[#EB712B]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase mb-1"><Trans>Account holder</Trans></label>
                    <input
                      type="text"
                      placeholder="Full name on card"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      className="w-full bg-main-bg border border-border rounded-xl p-4 text-text-main focus:outline-none focus:border-[#EB712B]"
                    />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDepositScreen(false)}
                      className="w-full py-4 bg-hover hover:bg-border text-text-muted rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all border border-border"
                    >
                      <Trans>Cancel</Trans>
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid}
                      className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shadow-lg ${
                        isFormValid 
                          ? "bg-[#EB712B] hover:bg-[#ff8036] text-white border-transparent cursor-pointer shadow-[#EB712B]/10" 
                          : "bg-hover text-text-muted border-border cursor-not-allowed shadow-none"
                      }`}
                    >
                      <Trans>Pay Securely</Trans>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Leave Club Confirmation Modal ── */}
      {showLeaveModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowLeaveModal(false)}
        >
          <div 
            className="bg-surface border border-border/90 p-6 sm:p-8 rounded-3xl w-full max-w-md space-y-6 shadow-2xl relative animate-in zoom-in-95 duration-200 text-text-main"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLeaveModal(false)}
              className="absolute top-5 right-5 text-text-muted hover:text-text-main p-2 rounded-xl hover:bg-hover transition-colors cursor-pointer border-0 bg-transparent"
              title="Close modal"
            >
              <X size={18} />
            </button>

            {/* Header Icon & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <LogOut size={22} />
              </div>
              <div className="pr-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
                  <Trans>Club Membership</Trans>
                </span>
                <h3 className="text-xl font-black text-text-main tracking-tight mt-0.5">
                  <Trans>Leave this Club?</Trans>
                </h3>
              </div>
            </div>

            {/* Club Preview Card with Banner Image in Background */}
            <div className="relative rounded-2xl overflow-hidden border border-border/80 p-4 shadow-lg group">
              {/* Banner Image Background */}
              <img 
                src={coverImage} 
                alt="Club Banner" 
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage2.png'; }}
              />
              {/* Dark Gradient Overlay for crisp text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/65 backdrop-blur-[1px]" />

              {/* Foreground Content */}
              <div className="relative z-10 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 bg-surface/90 shrink-0 flex items-center justify-center shadow-md">
                  <img 
                    src={logoImage} 
                    alt={club.clubName || club.name || "Club Logo"} 
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage.png'; }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-black text-white truncate tracking-tight">
                    {club.clubName || club.name || <Trans>This Club</Trans>}
                  </h4>
                  <p className="text-[11px] text-gray-300 font-medium truncate mt-0.5 flex items-center gap-1.5">
                    <MapPin size={11} className="text-[#EB712B] shrink-0" />
                    <span>{club.location || club.city || <Trans>Community Club</Trans>}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Explanation Notice */}
            <p className="text-xs text-text-muted font-medium leading-relaxed">
              <Trans>Are you sure you want to leave <span className="font-bold text-text-main">{club.clubName || club.name || 'this club'}</span>? You will lose access to member-only scheduled rides, club leaderboards, and exclusive activity perks.</Trans>
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                disabled={isLeaving}
                className="flex-1 py-3.5 px-4 bg-hover hover:bg-border text-text-main rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all border border-border outline-none disabled:opacity-50"
              >
                <Trans>Cancel</Trans>
              </button>
              <button
                type="button"
                onClick={handleConfirmLeave}
                disabled={isLeaving}
                className="flex-1 py-3.5 px-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all border border-transparent shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 outline-none disabled:opacity-50"
              >
                {isLeaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span><Trans>Leaving...</Trans></span>
                  </>
                ) : (
                  <span><Trans>Leave Club</Trans></span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ClubMembershipModal
        clubId={Number(clubId)}
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
      />

      <AvatarLightboxModal
        isOpen={showClubAvatarPreview}
        onClose={() => setShowClubAvatarPreview(false)}
        imageUrl={logoImage}
        name={club.clubName || "Club"}
        subtitle={club.location || club.sport || "Ride With Pals Club"}
        tag="Club Avatar"
        fallbackInitials={(club.clubName || "C").slice(0, 2).toUpperCase()}
      />
    </div>
  );
}
