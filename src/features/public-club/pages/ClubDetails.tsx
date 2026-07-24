import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, MapPin, Users, Activity, ShieldCheck, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useGetClubInfoByIdQuery, useGetJoinedClubsQuery, useLeaveClubMutation, useGetClubMembersListQuery } from '@/features/club/api/clubApiSlice';
import { useClub } from '@/features/club/hooks/useClub';
import { useAppSelector } from '@/hooks/useAppSelector';

// Import refactored tab components
import Ride from './Ride';
import NewsFeed from '@/features/ClubSide/News';
import Leaderboard from '@/features/ClubSide/Leaderboard';
import Marketplace from './Marketplace';
import Discount from '@/features/ClubSide/Discount';
import Members from '@/features/ClubSide/Members';

type TabType = 'Overview' | 'Rides' | 'News' | 'Leaderboard' | 'Marketplace' | 'Discounts' | 'Members';

const TABS: TabType[] = ['Overview', 'Rides', 'News', 'Leaderboard', 'Marketplace', 'Discounts', 'Members'];

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


  const [showCodeScreen, setShowCodeScreen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [codeError, setCodeError] = useState("");
  
  const [showDepositScreen, setShowDepositScreen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const { data: clubData, isLoading, isError } = useGetClubInfoByIdQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

  const { data: membersData } = useGetClubMembersListQuery(
    { clubId: Number(clubId) },
    { skip: !clubId }
  );

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

  // Fallback to empty object if response is structured differently
  const club: any = (clubData as any)?.response || (clubData as any)?.data || clubData || {};

  const coverImage = club.coverImage 
    ? (club.coverImage.startsWith('http') ? club.coverImage : `https://api.ridewithpals.com/uploads/${club.coverImage}`) 
    : '/Images/CycleImage2.png';

  const logoImage = club.logo 
    ? (club.logo.startsWith('http') ? club.logo : `https://api.ridewithpals.com/uploads/${club.logo}`)
    : '/Images/CycleImage.png';

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

  const handleJoinClubClick = async () => {
    if (club.clubPrivacyId === 2) {
      setShowCodeScreen(true);
    } else if (club.restrictUnpaidMembers) {
      setShowDepositScreen(true);
    } else {
      await handleJoinClub(club.id);
    }
  };

  const handleLeaveClub = async () => {
    const targetClubId = club?.id || Number(clubId);
    if (!targetClubId) return;
    if (!window.confirm("Are you sure you want to leave this club?")) return;
    try {
      await leaveClub({ clubId: targetClubId }).unwrap();
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
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* About Section */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-black uppercase tracking-wide text-text-main">About the Club</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {club.aboutClub || "No description provided."}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border mt-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">Members</p>
                  <p className="text-lg font-black text-text-main">{membersData?.length || club.totalMembers || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">Ride Type</p>
                  <p className="text-sm font-bold text-[#EB712B]">{club.clubType || 'All'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">Status</p>
                  <p className="text-sm font-bold text-emerald-400">{club.isPrivate ? 'Private' : 'Public'}</p>
                </div>
              </div>
            </div>

            {/* Club Guidelines */}
            <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
              <h3 className="text-lg font-black uppercase tracking-wide text-text-main">Club Guidelines</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {club.clubRules || "No rules provided."}
              </p>
            </div>
          </div>
        );
      case 'Rides':
        return <Ride clubId={clubId} />;
      case 'News':
        return <NewsFeed clubId={clubId} />;
      case 'Leaderboard':
        return <Leaderboard clubId={clubId} />;
      case 'Marketplace':
        return <Marketplace clubId={clubId} />;
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
      <div className="relative h-64 md:h-80 lg:h-96 w-full">
        <img 
          src={coverImage} 
          alt="Club Cover" 
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage2.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-main-bg via-main-bg/50 to-transparent" />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 bg-surface/80 backdrop-blur-md border border-border rounded-xl flex items-center justify-center hover:bg-hover transition-colors shadow-lg z-10"
        >
          <ChevronLeft size={20} className="text-text-main" />
        </button>
      </div>

      {/* ── Club Identity Section ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 z-10">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
          
          <div className="relative shrink-0">
            <img 
              src={logoImage} 
              alt="Club Logo" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-main-bg shadow-2xl bg-surface"
              onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage.png'; }}
            />
            {club.isVerified && (
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-2 border-main-bg flex items-center justify-center shadow-lg">
                <ShieldCheck size={16} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-text-main">
              {club.clubName || "Unnamed Club"}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-text-muted uppercase tracking-wider">
              <span className="flex items-center gap-1"><MapPin size={14} className="text-[#EB712B]"/> {club.location || "Global"}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Users size={14} className="text-[#EB712B]"/> {club.totalMembers || 0} Members</span>
              <span>•</span>
              <span className="text-emerald-400">{club.clubPrivacyId === 1 ? "Public Club" : "Private Club"}</span>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-auto flex gap-3">
            {!isMember && !showCodeScreen && !showDepositScreen && (
              <button 
                onClick={handleJoinClubClick}
                disabled={isJoining}
                className="flex-1 md:flex-none px-8 py-3.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(235,113,43,0.3)] active:scale-95 disabled:opacity-50"
              >
                {isJoining ? "Joining..." : "Join Club"}
              </button>
            )}
            {isMember && (
              <button 
                onClick={handleLeaveClub}
                disabled={isLeaving}
                className="flex-1 md:flex-none px-8 py-3.5 bg-hover hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-muted hover:text-red-500 transition-colors text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-50"
                title="Click to leave club"
              >
                {isLeaving ? "Leaving..." : "✓ Joined (Leave)"}
              </button>
            )}
            {!isOwner && (
              <button 
                onClick={handleMessageOwner}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-surface border border-border hover:bg-hover text-text-main text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95"
              >
                <MessageSquare size={16} />
                Message
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
                {tab}
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
              Join this club to view its {activeTab}.
            </div>
          )}
        </div>

      </div>

      {/* ── MODALS ── */}
      {showCodeScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-sm space-y-6 shadow-2xl relative">
            <div className="text-center">
              <h3 className="text-xl font-black uppercase tracking-tight">Join Verification</h3>
              <p className="text-text-muted text-[10px] mt-1 tracking-wider">Please enter the club join code (Hint: 111)</p>
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
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-[#EB712B]/10"
                >
                  Verify
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
                  <h3 className="text-lg font-black uppercase tracking-tight text-text-main">Payment Successful!</h3>
                  <p className="text-text-muted text-[10px] mt-1 tracking-wider">Adding you to the club...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="text-xl font-black uppercase tracking-tight">Secure Checkout</h3>
                  <p className="text-text-muted text-[10px] mt-1 tracking-wider">Club entry fee: <span className="text-[#EB712B] font-bold">${club.price || 50}</span></p>
                </div>
                <form onSubmit={handleDepositConfirm} className="space-y-4 text-xs font-bold tracking-wider">
                  <div>
                    <label className="block text-[10px] text-text-muted uppercase mb-1">Card number</label>
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
                      <label className="block text-[10px] text-text-muted uppercase mb-1">Expiry Date</label>
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
                      <label className="block text-[10px] text-text-muted uppercase mb-1">CVV</label>
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
                    <label className="block text-[10px] text-text-muted uppercase mb-1">Account holder</label>
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
                      Cancel
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
                      Pay Securely
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
