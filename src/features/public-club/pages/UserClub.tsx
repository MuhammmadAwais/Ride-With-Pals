import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, LayoutGrid, List, Globe, Lock, ArrowLeft, CheckCircle2, AlertCircle, MapPin, Users } from "lucide-react";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import { setUser } from "@/features/auth/slices/authSlice";

import Ride from "./Ride";
import News from "../../ClubSide/News";
import Leaderboard from "../../ClubSide/Leaderboard";
import Discount from "../../ClubSide/Discount";
import Overviews from "./Overviews";
import Shop from "./Shop"; 
import Marketplace from "./Marketplace";

interface ClubData {
  id: string;
  name: string;
  activityType: string;
  status: "PUBLIC" | "PRIVATE";
  members: string;
  logo: string;
  isPaid: boolean;
  price: string;
}

const myClubsData: ClubData[] = [
  {
    id: "1",
    name: "Red Rock Cyclists",
    activityType: "Mountain Biking",
    status: "PUBLIC",
    members: "248",
    logo: "/Images/CycleImage2.png",
    isPaid: true,
    price: "50.00"
  },
  {
    id: "2",
    name: "Apex Running Club",
    activityType: "Running",
    status: "PRIVATE",
    members: "112",
    logo: "/Images/PersonImage.png",
    isPaid: false,
    price: "0"
  },
  {
    id: "3",
    name: "Desert Trail Riders",
    activityType: "Biking",
    status: "PUBLIC",
    members: "184",
    logo: "/Images/CycleImage3.png",
    isPaid: false,
    price: "0"
  },
  {
    id: "4",
    name: "Windrunners Track Club",
    activityType: "Running",
    status: "PRIVATE",
    members: "76",
    logo: "/Images/MountainImage.png",
    isPaid: true,
    price: "15.00"
  }
];

const discoverClubsData: ClubData[] = [
  {
    id: "1",
    name: "Red Rock Cyclists",
    activityType: "Biking",
    status: "PUBLIC",
    members: "248 Pals joined",
    logo: "/Images/CyclingPicture.jpg",
    isPaid: true,
    price: "50.00"
  },
  {
    id: "2",
    name: "Apex Running Club",
    activityType: "Running",
    status: "PUBLIC",
    members: "112 Pals joined",
    logo: "/Images/CyclingPicture.jpg",
    isPaid: false,
    price: "0"
  },
  {
    id: "4",
    name: "Private Elite Runners",
    activityType: "Running",
    status: "PRIVATE",
    members: "45 Pals joined",
    logo: "/Images/CyclingPicture.jpg",
    isPaid: true,
    price: "25.00"
  },
  {
    id: "5",
    name: "Desert Trail Riders",
    activityType: "Biking",
    status: "PUBLIC",
    members: "184 Pals joined",
    logo: "/Images/CycleImage3.png",
    isPaid: false,
    price: "0"
  },
  {
    id: "6",
    name: "Windrunners Track Club",
    activityType: "Running",
    status: "PRIVATE",
    members: "76 Pals joined",
    logo: "/Images/MountainImage.png",
    isPaid: true,
    price: "15.00"
  },
  {
    id: "7",
    name: "Sierra Climbing Guild",
    activityType: "Climbing",
    status: "PUBLIC",
    members: "54 Pals joined",
    logo: "/Images/HikingPicture.jpg",
    isPaid: false,
    price: "0"
  },
  {
    id: "8",
    name: "Vegas Velo Road Racing",
    activityType: "Biking",
    status: "PUBLIC",
    members: "310 Pals joined",
    logo: "/Images/CycleRock2.jpg",
    isPaid: true,
    price: "80.00"
  },
  {
    id: "9",
    name: "Apex Aero Triathletes",
    activityType: "Triathlon",
    status: "PRIVATE",
    members: "88 Pals joined",
    logo: "/Images/PersonImage.png",
    isPaid: true,
    price: "120.00"
  }
];

type TabType = "rides" | "news" | "leaderboard" | "shop" | "discounts" | "marketplace" | "members" | "overviews";

export default function UserClub() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
  const [selectedClub, setSelectedClub] = useState<ClubData | null>(null);
  // const [isDiscoverContext, setIsDiscoverContext] = useState(false); 

  const [isMember, setIsMember] = useState(false);
  const [showCodeScreen, setShowCodeScreen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [codeError, setCodeError] = useState("");
  
  const [showDepositScreen, setShowDepositScreen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [activeTab, setActiveTab] = useState<TabType>("overviews");

  const filteredMyClubs = myClubsData.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.activityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDiscoverClubs = discoverClubsData.filter(
    (comm) =>
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.activityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMyClub = (club: ClubData) => {
    // setIsDiscoverContext(false); 
    setSelectedClub(club);
    setIsMember(true);
    setShowCodeScreen(false);
    setShowDepositScreen(false);
    setCodeError("");
  };

  const handleSelectDiscoverClub = (comm: ClubData) => {
    // setIsDiscoverContext(true); 
    setSelectedClub(comm);
    setIsMember(comm.status === "PRIVATE" ? false : true);
    setShowCodeScreen(false);
    setShowDepositScreen(false);
    setJoinCode("");
    setCodeError("");
  };

  const handleBackToHub = () => {
    setSelectedClub(null);
    setShowCodeScreen(false);
    setShowDepositScreen(false);
    setIsMember(false);
    setCodeError("");
    setPaymentSuccess(false);
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setAccountHolder("");
  };

  const handleJoinClubClick = () => {
    if (selectedClub?.status === "PRIVATE") {
      setShowCodeScreen(true);
    } else if (selectedClub?.isPaid) {
      setShowDepositScreen(true);
    } else {
      setIsMember(true);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode === "111") {
      setCodeError("");
      setShowCodeScreen(false);
      if (selectedClub?.isPaid) {
        setShowDepositScreen(true);
      } else {
        setIsMember(true);
      }
    } else {
      setCodeError("Incorrect code entered. Please use '111' to proceed.");
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

  // Validation Checkers
  const isCardComplete = cardNumber.replace(/\s/g, "").length === 16;
  const isExpiryComplete = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDate);
  const isCvvComplete = cvv.length >= 3 && cvv.length <= 4 && /^\d+$/.test(cvv);
  const isHolderComplete = accountHolder.trim().length > 2;

  const isFormValid = isCardComplete && isExpiryComplete && isCvvComplete && isHolderComplete;

  const handleDepositConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    setPaymentSuccess(true);
    setTimeout(() => {
      setIsMember(true);
      setShowDepositScreen(false);
      setPaymentSuccess(false);
    }, 2000);
  };

  if (selectedClub) {
    // const currentRole: "organizer" | "athlete" = isDiscoverContext ? "athlete" : "organizer";

    return (
      <div className="flex min-h-screen text-text-main font-sans w-full justify-center p-4 sm:p-8">
        <div className="flex-1 transition-all max-w-7xl w-full mx-auto space-y-8">
          
          {/* Back button */}
          <button
            onClick={handleBackToHub}
            className="inline-flex items-center gap-2 text-text-muted hover:text-text-main text-xs font-bold tracking-wider uppercase cursor-pointer transition-all bg-surface px-5 py-3 rounded-xl border border-border"
          >
            <ArrowLeft size={16} /> Back to Hub
          </button>

          {/* Large Hero/Banner Section */}
          <div className="relative h-64 w-full rounded-3xl overflow-hidden border border-border">
            <img 
              src={selectedClub.logo} 
              alt={selectedClub.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
            
            <div className="absolute inset-x-6 bottom-6 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-center gap-5">
                <img 
                  src={selectedClub.logo} 
                  alt={selectedClub.name} 
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-xl shrink-0"
                />
                <div>
                  <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border mb-1.5 ${
                    selectedClub.status === "PUBLIC" 
                      ? "bg-green-500/10 text-green-300 border-green-500/30" 
                      : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                  }`}>
                    {selectedClub.status === "PUBLIC" ? <Globe size={10} /> : <Lock size={10} />} {selectedClub.status}
                  </span>
                  <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight leading-none break-words max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl text-white">{selectedClub.name}</h2>
                  <p className="text-white/70 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Activity: {selectedClub.activityType}</p>
                </div>
              </div>

              {!isMember && !showCodeScreen && !showDepositScreen && (
                <button 
                  onClick={handleJoinClubClick}
                  className="px-6 py-3.5 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black tracking-widest uppercase cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 shrink-0"
                >
                  Join Club
                </button>
              )}

              {isMember && (
                <div className="px-6 py-3.5 bg-hover border border-border text-text-muted rounded-xl text-xs font-black tracking-widest uppercase cursor-default shrink-0">
                  ✓ Joined
                </div>
              )}
            </div>
          </div>

          {/* SCREEN 2: Code Verification (Modern Popup) */}
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
                  
                  {/* Professional Inline Error Message */}
                  {codeError && (
                    <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-[10px] font-bold tracking-wide animate-pulse">
                      <AlertCircle size={14} className="shrink-0" />
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

          {/* SCREEN 3: Deposit Modal (Sleek Overlay Form with secure fields) */}
          {showDepositScreen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/60 backdrop-blur-sm overflow-y-auto">
              <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-md space-y-6 my-8 shadow-2xl relative">
                
                {paymentSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center animate-fade-in">
                    <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20 text-green-400">
                      <CheckCircle2 size={48} className="animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tight text-text-main">Payment Successful!</h3>
                      <p className="text-text-muted text-[10px] mt-1 tracking-wider">Redirecting you to your club dashboard...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-center">
                      <h3 className="text-xl font-black uppercase tracking-tight">Secure Checkout</h3>
                      <p className="text-text-muted text-[10px] mt-1 tracking-wider">Club entry fee: <span className="text-[#EB712B] font-bold">${selectedClub.price}</span></p>
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
                      <div>
                        <label className="block text-[10px] text-text-muted uppercase mb-1">Amount to pay</label>
                        <input
                          type="text"
                          disabled
                          value={`$${selectedClub.price}`}
                          className="w-full bg-hover border border-border rounded-xl p-4 text-text-muted focus:outline-none cursor-not-allowed"
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

          {/* NAVIGATION TABS - Unlocks/locks content dynamically using optional chaining */}
          <div className="flex bg-main-bg border border-border rounded-2xl p-2 gap-2 w-full md:w-fit overflow-x-auto mt-6">
            {(["rides", "news", "leaderboard", "shop", "discounts", "marketplace", "overviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative flex-1 md:flex-initial px-6 py-4 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all text-center whitespace-nowrap ${
                  activeTab === tab 
                    ? "text-text-main bg-hover" 
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute left-1/2 bottom-1 -translate-x-1/2 w-4 h-1 bg-[#EB712B] rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="mt-6">
            {isMember ? (
              <>
                {activeTab === "rides" && <Ride clubId={selectedClub?.id} />}
                {activeTab === "news" && <News clubId={selectedClub?.id} />}
                {activeTab === "leaderboard" && <Leaderboard clubId={selectedClub?.id} />}
                {activeTab === "discounts" && <Discount role={"athlete"} />}        
                {activeTab === "shop" && <Shop clubId={selectedClub?.id} />} 
                {activeTab === "marketplace" && <Marketplace clubId={selectedClub?.id} />} 
                {activeTab === "overviews" && <Overviews clubId={selectedClub?.id} />}
              </>
            ) : (
              <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted text-xs font-bold tracking-wider">
                Join this club to view its {activeTab}.
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // --- DEFAULT VIEW: HUB & SEARCH ---
  return (
    <div className="flex min-h-screen text-text-main font-sans w-full justify-center p-4 sm:p-8 ">
      <div className="flex-1 p-4 transition-all max-w-7xl w-full mx-auto space-y-12">
        
        {/* Top Header & Overview */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/[0.06] pb-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#EB712B] mb-3 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] animate-pulse" />
              Community Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase text-text-main">
              Athletic Clubs
            </h1>
            <p className="text-text-muted text-xs tracking-wide mt-2 font-medium max-w-lg">
              Manage your personal hubs or discover elite training communities around the region.
            </p>
          </div>

          <button
            onClick={() => {
              if (user) {
                dispatch(setUser({
                  ...user,
                  role: 'owner'
                }));
              }
              navigate("/club-profile-setup");
            }}
            className="w-full md:w-auto px-6 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black tracking-wider uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 hover:scale-105 active:scale-95 text-center shrink-0 border border-[#EB712B]/30"
          >
            + Create Club
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative w-full">
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted"
            size={20}
          />
          <input
            type="text"
            placeholder="Search communities by name or activity type (e.g. Biking, Running)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-[#EB712B] transition-all duration-300 text-text-main placeholder-gray-500 shadow-inner"
          />
        </div>

        {/* --- MY CLUBS SECTION --- */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-wide uppercase">
              My Clubs
            </h2>
            <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase mt-0.5">
              Communities you manage
            </p>
          </div>

          {filteredMyClubs.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted text-xs font-bold tracking-wider">
              No matching clubs found in your inventory.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMyClubs.map((club) => (
                <div
                  key={club.id}
                  className="bg-surface border border-border rounded-3xl overflow-hidden group flex flex-col h-[320px] transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_12px_30px_rgba(235,113,43,0.08)]"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-36 w-full bg-main-bg overflow-hidden shrink-0">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    {/* Subtle dark gradient overlay to ensure floating badges are readable */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                      <span className="px-3.5 py-1.5 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                        {club.activityType}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg transition-all duration-300 border ${
                        club.status === "PUBLIC" 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10 shadow-green-950/20 shadow-sm" 
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 shadow-rose-950/20 shadow-sm"
                      }`}>
                        {club.status === "PUBLIC" ? <Globe size={11} /> : <Lock size={11} />} {club.status}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Details Content */}
                  <div className="p-5 flex flex-col justify-between flex-1 bg-surface">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black tracking-tight text-text-main uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {club.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold tracking-wider uppercase">
                        <MapPin size={12} className="text-text-muted" />
                        <span>Las Vegas, NV</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        <Users size={13} className="text-text-muted" />
                        <span>{club.members} Pals joined</span>
                      </div>
                      <span 
                        onClick={() => handleSelectMyClub(club)} 
                        className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        Manage &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- DISCOVER ALL CLUBS SECTION --- */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-black tracking-wide uppercase">
                Discover All Clubs
              </h2>
              <p className="text-text-muted text-[10px] font-bold tracking-widest uppercase mt-0.5">
                Explore external communities
              </p>
            </div>

            {/* List / Grid Toggle View */}
            <div className="flex bg-surface border border-border rounded-xl p-1 gap-1 w-fit">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  viewMode === "grid"
                    ? "bg-white/10 text-text-main shadow-inner"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-white/10 text-text-main shadow-inner"
                    : "text-text-muted hover:text-text-main hover:bg-hover"
                }`}
                aria-label="List View"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {filteredDiscoverClubs.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center text-text-muted text-xs font-bold tracking-wider">
              No matching clubs found in public directory.
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-surface border border-border rounded-3xl overflow-hidden group flex flex-col h-[320px] transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_12px_30px_rgba(235,113,43,0.08)]"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-36 w-full bg-main-bg overflow-hidden shrink-0">
                    <img
                      src={comm.logo}
                      alt={comm.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                    />
                    {/* Subtle dark gradient overlay to ensure floating badges are readable */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
                    
                    {/* Floating Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                      <span className="px-3.5 py-1.5 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-md">
                        {comm.activityType}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-lg border ${
                        comm.status === "PUBLIC" 
                          ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10 shadow-green-950/20 shadow-sm" 
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10 shadow-rose-950/20 shadow-sm"
                      }`}>
                        {comm.status === "PUBLIC" ? <Globe size={11} /> : <Lock size={11} />} {comm.status}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Details Content */}
                  <div className="p-5 flex flex-col justify-between flex-1 bg-surface">
                    <div className="space-y-1.5">
                      <h3 className="text-base font-black tracking-tight text-text-main uppercase group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {comm.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold tracking-wider uppercase">
                        <MapPin size={12} className="text-text-muted" />
                        <span>Las Vegas, NV</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                        <Users size={13} className="text-text-muted" />
                        <span>{comm.members}</span>
                      </div>
                      <span 
                        onClick={() => handleSelectDiscoverClub(comm)} 
                        className="text-[#EB712B] font-black text-[10px] tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer"
                      >
                        View &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDiscoverClubs.map((comm) => (
                <div
                  key={comm.id}
                  className="bg-surface border border-border rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-6 group hover:border-[#EB712B]/30 transition-all"
                >
                  <div className="flex items-center gap-6 w-full">
                    <img
                      src={comm.logo}
                      alt={comm.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1 bg-[#EB712B] text-white rounded-xl text-[9px] font-black uppercase tracking-widest w-fit shadow-md">
                          {comm.activityType}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${
                          comm.status === "PUBLIC" 
                            ? "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-300 dark:border-green-500/30 dark:bg-green-500/10" 
                            : "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 dark:bg-rose-500/10"
                        }`}>
                          {comm.status === "PUBLIC" ? <Globe size={10} /> : <Lock size={10} />} {comm.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-black tracking-tight group-hover:text-[#EB712B] transition-colors uppercase">
                        {comm.name}
                      </h3>
                      <p className="text-[10px] text-text-muted font-bold tracking-wider uppercase">
                        {comm.members}
                      </p>
                    </div>
                  </div>
                  <span 
                    onClick={() => handleSelectDiscoverClub(comm)} 
                    className="text-[#EB712B] font-black text-xs tracking-widest uppercase group-hover:translate-x-1 transition-transform cursor-pointer shrink-0"
                  >
                    View Hub &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}