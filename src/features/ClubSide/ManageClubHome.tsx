import React, { useState, useRef, useEffect } from "react";
import { MoreVertical, CreditCard, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import News from "./News";
import Leaderboard from "./Leaderboard";
import Discount from "./Discount";

interface MembershipPlan {
  id: string;
  packageName: string;
  price: string;
  duration: string;
  autoRenew: string;
  discount: string;
  featuresList: string[];
}

const ManageClubHome = () => {
  const navigate = useNavigate();

  // Retrieve dynamically passed values from the Manage Club listing page
  const selectedBanner = localStorage.getItem("selectedClubBanner");
  const selectedLogo = localStorage.getItem("selectedClubLogo");
  const selectedName = localStorage.getItem("selectedClubName") || "Club Name";

  const [activeTab, setActiveTab] = useState("Members");

  // State to track which menu is open across sections
  const [openMenuIndex, setOpenMenuIndex] = useState<{
    section: string;
    index: number;
  } | null>(null);

  // State for Membership Cards (Left-Form interacting with Right-Cards)
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [openCardMenuId, setOpenCardMenuId] = useState<string | null>(null);

  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Membership form states
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("1 Month");
  const [autoRenew, setAutoRenew] = useState("Yes");
  const [discount, setDiscount] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [featuresList, setFeaturesList] = useState<string[]>([
    "Cycling license included",
    "Paid activates included",
    "Free coffee in our coffeeshop",
  ]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuIndex) {
        const refKey = `${openMenuIndex.section}-${openMenuIndex.index}`;
        if (
          menuRefs.current[refKey] &&
          !menuRefs.current[refKey]?.contains(event.target as Node)
        ) {
          setOpenMenuIndex(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuIndex]);

  const handleMenuToggle = (section: string, index: number) => {
    if (openMenuIndex?.section === section && openMenuIndex?.index === index) {
      setOpenMenuIndex(null);
    } else {
      setOpenMenuIndex({ section, index });
    }
  };

  const handleAction = (actionName: string, targetName: string) => {
    console.log(`Triggered "${actionName}" for ${targetName}`);
    if (actionName === "Connect to Stripe") {
      setShowMembershipForm(true);
    }
    setOpenMenuIndex(null);
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput("");
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFeaturesList(featuresList.filter((_, index) => index !== indexToRemove));
  };

  // Create or Update Membership Plan Flow (2-way updating)
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: MembershipPlan = {
      id: editingPlanId ? editingPlanId : Date.now().toString(),
      packageName,
      price,
      duration,
      autoRenew,
      discount,
      featuresList,
    };

    if (editingPlanId) {
      // Update existing card data
      setMembershipPlans(
        membershipPlans.map((p) => (p.id === editingPlanId ? payload : p)),
      );
      console.log("Successfully Updated Membership Plan:", payload);
    } else {
      // Create new card data
      setMembershipPlans([...membershipPlans, payload]);
      console.log("Successfully Created Membership Plan:", payload);
    }

    // Reset Form & Exit Editing Mode
    setEditingPlanId(null);
    setPackageName("");
    setPrice("");
    setDuration("1 Month");
    setAutoRenew("Yes");
    setDiscount("");
    setFeaturesList([
      "Cycling license included",
      "Paid activates included",
      "Free coffee in our coffeeshop",
    ]);
  };

  // Load selected membership plan into the form
  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlanId(plan.id);
    setPackageName(plan.packageName);
    setPrice(plan.price);
    setDuration(plan.duration);
    setAutoRenew(plan.autoRenew);
    setDiscount(plan.discount);
    setFeaturesList(plan.featuresList);
    setShowMembershipForm(true);
    setOpenCardMenuId(null);
  };

  // Delete associated membership plan
  const handleDeletePlan = (id: string) => {
    setMembershipPlans(membershipPlans.filter((plan) => plan.id !== id));
    setOpenCardMenuId(null);
  };

  const renderSection = (title: string, sub: string, items: any[]) => (
    <section className="group/section space-y-4 w-full">
      {/* Section Header */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3">
          {title}
          <span className="text-[10px] font-extrabold text-[#EB712B] px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20 backdrop-blur-md">
            {sub}
          </span>
        </h2>
        <button className="text-[10px] font-black text-gray-500 hover:text-white transition-all tracking-[0.2em] uppercase cursor-pointer">
          View All
        </button>
      </div>

      {/* Modern Container: full width (w-full) */}
      <div className="w-full bg-[#141414]/80 backdrop-blur-xl rounded-3xl border border-white/[0.06] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative">
        {/* Decorative gradient sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#EB712B]/50 to-transparent" />

        {items.map((item, i) => {
          const isOpen =
            openMenuIndex?.section === title && openMenuIndex?.index === i;
          return (
            <div
              key={i}
              className="group/row flex flex-wrap md:flex-nowrap items-center justify-between px-4 sm:px-6 py-5 border-b border-white/[0.03] last:border-0 
                         transition-all duration-300 hover:bg-gradient-to-r hover:from-white/[0.03] hover:via-white/[0.01] hover:to-transparent 
                         relative overflow-visible gap-y-4 md:gap-y-0"
            >
              {/* Left Vertical Accent Line */}
              <div className="absolute left-0 top-0 w-[3px] h-full bg-gradient-to-b from-[#EB712B] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />

              {/* Left Side: Avatar & Core Info */}
              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-5">
                  {/* Premium Avatar Box */}
                  <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] border border-white/10 shadow-lg flex items-center justify-center overflow-hidden relative shrink-0 transition-transform duration-500 group-hover/row:scale-105">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fallback =
                          e.currentTarget.parentElement?.querySelector(
                            ".fallback-text",
                          );
                        if (fallback) fallback.classList.remove("hidden");
                      }}
                    />
                    <span className="fallback-text hidden text-xs text-gray-300 font-black tracking-tight">
                      {item.name.charAt(0)}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#EB712B]/20 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Text details */}
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-gray-200 group-hover/row:text-white transition-colors tracking-tight text-sm leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[9px] text-gray-500 font-extrabold tracking-[0.15em] uppercase mt-1 group-hover/row:text-[#EB712B]/70 transition-colors">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Live Pulse Status & Responsive Action Menu */}
              <div className="flex items-center justify-between w-full md:w-auto md:justify-start gap-8">
                <span className="flex items-center gap-2.5 text-[10px] font-black tracking-[0.1em] text-white/40 bg-white/[0.02] px-3 py-1.5 rounded-full border border-white/5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                  </span>
                  {item.status.toUpperCase()}
                </span>

                {/* Action Menu Dropdown */}
                <div
                  ref={(el: HTMLDivElement | null) => {
                    menuRefs.current[`${title}-${i}`] = el;
                  }}
                  className="relative"
                >
                  <button
                    onClick={() => handleMenuToggle(title, i)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      isOpen
                        ? "bg-white/10 opacity-100 text-white"
                        : "opacity-0 group-hover/row:opacity-100 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <MoreVertical size={16} />
                  </button>

                  {isOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#181818] rounded-2xl border border-white/10 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                      {title === "Club Owners" && (
                        <>
                          <button
                            onClick={() =>
                              handleAction("Add as Admin", item.name)
                            }
                            className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer"
                          >
                            Add as Admin
                          </button>
                          <button
                            onClick={() =>
                              handleAction("Remove access of owner", item.name)
                            }
                            className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer border-t border-white/[0.03]"
                          >
                            Remove access of owner
                          </button>
                        </>
                      )}

                      {title === "Administrators" && (
                        <button
                          onClick={() =>
                            handleAction("Remove Admin Access", item.name)
                          }
                          className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          Remove Admin Access
                        </button>
                      )}

                      {title === "Club Members" && (
                        <>
                          <button
                            onClick={() =>
                              handleAction("Promote to Admin", item.name)
                            }
                            className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/[0.04] hover:text-white transition-colors cursor-pointer"
                          >
                            Promote to Admin
                          </button>
                          <button
                            onClick={() =>
                              handleAction("Promote to Owner", item.name)
                            }
                            className="w-full text-left px-5 py-3 text-xs font-bold text-[#EB712B] hover:bg-[#EB712B]/10 hover:text-[#ff8036] transition-colors cursor-pointer border-t border-white/[0.03]"
                          >
                            Promote to Owner
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#111] text-white p-4 sm:p-8 font-sans w-full">
      {/* Header Banner */}
      <div
        className="relative h-96 md:h-[420px] w-full rounded-3xl mb-8 border border-white/10 shadow-[0_10px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-6 sm:p-8 transition-all duration-700 ease-in-out group/banner cursor-pointer bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: selectedBanner
            ? `url(${selectedBanner})`
            : "none",
          backgroundColor: "#1F1F1F", // Visible dark fallback if no image is set
        }}
      >
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0" />

        {/* Top Navigation Buttons */}
        <div className="relative z-10 flex justify-between w-full items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-3.5 bg-black/40 hover:bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md 
                     transition-all duration-300 ease-in-out cursor-pointer shadow-lg shadow-black/40
                     hover:scale-105 active:scale-95 hover:border-white/30 group/btn flex items-center justify-center"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover/btn:-translate-x-0.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* ADDED EDIT CLUB BUTTON */}
          <button
            className="px-6 py-3.5 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black 
                     tracking-wider uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 
                     transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 
                     hover:shadow-[0_0_25px_rgba(235,113,43,0.5)] border border-[#EB712B]/30 backdrop-blur-md"
          >
            Edit Club
          </button>
        </div>

        {/* Club Info Overlay Section */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 w-full pointer-events-none">
          <div className="flex items-center gap-5">
            {/* CLUB LOGO IMAGE CONTAINER */}
            <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md overflow-hidden flex items-center justify-center shrink-0">
              {selectedLogo ? (
                <img
                  src={selectedLogo}
                  alt="Club Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-gray-400">Logo</span>
              )}
            </div>

            {/* Texts & Badges */}
            <div className="flex flex-col justify-center">
              <span className="inline-flex items-center w-fit gap-1.5 px-3 py-1 bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/30 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EB712B] animate-pulse" />
                Elite Registry
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight break-words drop-shadow-md">
                {selectedName}
              </h1>
            </div>
          </div>

          {/* Founded Badge */}
          <div className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-gray-300 text-[10px] font-bold uppercase tracking-wider shrink-0">
            Founded 2026
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex gap-1 mb-8 border-b border-white/10 overflow-x-auto scrollbar-hide w-full">
        {["Members", "Membership Plans", "Discount", "News", "Leaderboard"].map(
          (tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab !== "Membership Plans") setShowMembershipForm(false);
                }}
                className={`relative px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all duration-500 ease-out cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                {tab}

                {/* Glowing expanding underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#EB712B] shadow-[0_0_15px_#EB712B] rounded-full animate-in fade-in slide-in-from-bottom-2 duration-500" />
                )}
              </button>
            );
          },
        )}
      </nav>

      {/* Dynamic Switching Content Area */}
      <div className="w-full">
        {activeTab === "Members" && <div>{/* Your Members Content */}</div>}

        {activeTab === "Membership Plans" && (
          <div>{/* Your Membership Plans Content */}</div>
        )}

        {activeTab === "Run" && <div>{/* Your Run Content */}</div>}

        {activeTab === "Leaderboard" && (
          <div>{/* Your Leaderboard Content */}</div>
        )}
      </div>

      {/* Dynamic Content Switching */}
      <div className="w-full">
        {activeTab === "Members" && (
          <div className="space-y-12 w-full animate-in fade-in duration-300">
            {renderSection("Club Owners", "02 MEMBERS", [
              {
                name: "Sarah Lane",
                role: "Founder/Leader",
                status: "Active Now",
                avatar: "/Images/GirlImage11.png",
              },
              {
                name: "Albert Rane",
                role: "Co-Founder",
                status: "Active Now",
                avatar: "/Images/Girlmage3.png",
              },
            ])}

            {renderSection("Administrators", "04 STAFF", [
              {
                name: "Marcus Cole",
                role: "System Architect",
                status: "Active Now",
                avatar: "/Images/Girlmage4.png",
              },
              {
                name: "Murphy Antone",
                role: "Event Coordinator",
                status: "Active Now",
                avatar: "/Images/Girlmage5.png",
              },
              {
                name: "Elena Frost",
                role: "Community Lead",
                status: "Active Now",
                avatar: "/Images/Girlmage6.png",
              },
              {
                name: "David Chen",
                role: "Safety Officer",
                status: "Active Now",
                avatar: "/Images/Girlmage1.png",
              },
            ])}

            {renderSection("Club Members", "05 MEMBERS", [
              {
                name: "Jordan Smith",
                role: "Trail Runner",
                status: "Active Now",
                avatar: "/Images/GirlImage10.png",
              },
              {
                name: "Alice Wong",
                role: "Alpine Hiker",
                status: "Away",
                avatar: "/Images/GirlImage11.png",
              },
              {
                name: "Sam Rivera",
                role: "Trail Runner",
                status: "Active Now",
                avatar: "/Images/Girlmage4.png",
              },
              {
                name: "Chloe Kim",
                role: "Alpine Hiker",
                status: "Active Now",
                avatar: "/Images/ProfileImage.png",
              },
              {
                name: "Travis Bell",
                role: "Ultra Marathoner",
                status: "Active Now",
                avatar: "/Images/GrilImage11.png",
              },
            ])}
          </div>
        )}

        {activeTab === "Membership Plans" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500 items-start">
            {/* LEFT SIDE: Membership Form / Stripe View */}
            <div className="w-full flex justify-center">
              {!showMembershipForm ? (
                /* Stripe Connect View */
                <div className="w-full bg-[#141414]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 hover:border-[#EB712B]/30 hover:shadow-[0_0_40px_rgba(235,113,43,0.15)]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#EB712B]/5 via-transparent to-transparent opacity-50 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="z-10 flex flex-col items-center max-w-md text-center">
                    <div className="w-24 h-24 rounded-full bg-[#1E1E1E] border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center relative mb-8 transition-transform duration-500 group-hover:scale-105">
                      <div className="absolute inset-0 rounded-full bg-[#635BFF]/10 animate-pulse" />
                      <CreditCard
                        size={36}
                        className="text-[#635BFF] relative z-10 transition-transform duration-300 group-hover:rotate-6"
                      />
                    </div>

                    <h3 className="text-xl font-black tracking-tight text-white mb-3">
                      Stripe Integration
                    </h3>
                    <p className="text-xs font-medium text-gray-400 mb-8 leading-relaxed">
                      Please connect your Stripe account first to enable
                      subscriptions and automated recurring membership payments.
                    </p>

                    <button
  onClick={() =>
    handleAction("Connect to Stripe", selectedName) // <-- changed from clubName to selectedName
  }
  className="px-8 py-4 bg-[#EB712B] text-white rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer"
>
                      <span className="relative z-10">Connect to Stripe</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Membership Fee Plan Setup Form View (Interactive & Stripe-Ready) */
                <div className="w-full bg-[#181818]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-300 transition-all duration-300 hover:border-white/20">
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {editingPlanId
                        ? "Edit Membership Plan"
                        : "Membership fee plan"}
                    </h3>
                    <span className="text-[9px] font-extrabold bg-[#EB712B]/10 text-[#EB712B] px-2.5 py-1 rounded-full border border-[#EB712B]/20 uppercase tracking-widest animate-pulse">
                      Stripe Ready
                    </span>
                  </div>

                  <form onSubmit={handleCreatePlan} className="space-y-5">
                    {/* Package Name */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[10px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">
                        Package Name
                      </label>
                      <input
                        type="text"
                        value={packageName}
                        onChange={(e) => setPackageName(e.target.value)}
                        placeholder="Annual Junior Membership"
                        className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/20"
                        required
                      />
                    </div>

                    {/* Price & Duration Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">
                          Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-xs font-black text-gray-500">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="00.00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/20"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">
                          Duration
                        </label>
                        <div className="relative group/select">
                          <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] appearance-none cursor-pointer font-bold transition-all duration-500 ease-in-out hover:border-[#EB712B]/50 hover:shadow-[0_0_15px_rgba(235,113,43,0.1)]"
                          >
                            <option>1 Month</option>
                            <option>3 Months</option>
                            <option>6 Months</option>
                            <option>1 Year</option>
                          </select>

                          {/* Custom Dropdown Arrow */}
                          <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none transition-transform duration-300 group-hover/select:translate-y-0.5">
                            <svg
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              fill="none"
                              stroke="#9CA3AF"
                              className="transition-colors duration-300 group-hover/select:stroke-[#EB712B]"
                            >
                              <path
                                d="M1 1L5 5L9 1"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auto Renew & Discount Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">
                          Auto Renew
                        </label>
                        <div className="relative">
                          <select
                            value={autoRenew}
                            onChange={(e) => setAutoRenew(e.target.value)}
                            className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold appearance-none cursor-pointer hover:border-white/20"
                          >
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                          <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
                            <svg
                              width="10"
                              height="6"
                              viewBox="0 0 10 6"
                              fill="none"
                              stroke="#9CA3AF"
                            >
                              <path
                                d="M1 1L5 5L9 1"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="0%"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/20"
                        />
                      </div>
                    </div>

                    {/* Feature Adder */}
                    <div className="flex flex-col gap-2.5 pt-2">
                      <label className="text-[10px] font-extrabold text-gray-400 tracking-[0.15em] uppercase">
                        Features Inclusion
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={featureInput}
                          onChange={(e) => setFeatureInput(e.target.value)}
                          placeholder="Ex: Access to exclusive track days"
                          className="flex-1 bg-[#141414] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/20"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-xl text-white transition-all duration-300 cursor-pointer flex items-center justify-center active:scale-95 hover:rotate-90"
                        >
                          <Plus size={16} className="text-[#EB712B]" />
                        </button>
                      </div>

                      {/* Interactive Feature Bullets */}
                      {featuresList.length > 0 && (
                        <div className="mt-4 space-y-2.5 bg-[#141414]/60 border border-white/[0.03] rounded-2xl p-4 animate-in fade-in duration-200">
                          {featuresList.map((feat, index) => (
                            <div
                              key={index}
                              className="group/item flex items-center justify-between bg-[#1A1A1A] border border-white/5 py-2.5 px-3.5 rounded-xl cursor-pointer hover:border-[#EB712B]/40 transition-all duration-300 hover:translate-x-1"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#EB712B] shadow-[0_0_8px_#EB712B] transition-transform duration-300 group-hover/item:scale-125" />
                                <span className="text-xs font-bold text-gray-200 tracking-tight">
                                  {feat}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(index)}
                                className="opacity-0 group-hover/item:opacity-100 p-1 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-200 cursor-pointer hover:rotate-90"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Submit / Create / Update / Cancel Buttons */}
                    <div className="flex gap-3 pt-4">
                      {editingPlanId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPlanId(null);
                            setShowMembershipForm(false);
                          }}
                          className="py-4 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/15"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-xl text-xs font-black tracking-wider uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-95 hover:shadow-[0_0_25px_rgba(235,113,43,0.5)] border border-[#EB712B]/30 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-all before:duration-700"
                      >
                        <span className="relative z-10">
                          {editingPlanId
                            ? "Save Changes"
                            : "Create Membership Plan"}
                        </span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Dynamic Membership Cards Display Area */}
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-5 duration-500">
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-3 px-1 mb-2">
                Membership Cards
                <span className="text-[10px] font-extrabold text-[#EB712B] px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/20 backdrop-blur-md">
                  {membershipPlans.length} Plans Created
                </span>
              </h2>

              {membershipPlans.length === 0 ? (
                <div className="w-full bg-[#141414]/50 backdrop-blur-xl border border-white/[0.04] rounded-3xl p-12 text-center transition-all duration-300 hover:border-white/10">
                  <p className="text-xs font-black text-gray-600 uppercase tracking-[0.15em]">
                    No membership plans added yet
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Fill out the form on the left to create and preview cards
                    here.
                  </p>
                </div>
              ) : (
                membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="w-full bg-[#161616] rounded-3xl border border-white/10 p-6 relative flex flex-col justify-between overflow-visible shadow-xl transition-all duration-300 hover:border-[#EB712B]/30 hover:shadow-[0_0_30px_rgba(235,113,43,0.1)] group hover:-translate-y-1"
                  >
                    {/* Top Action Dropdown (3-Dots) */}
                    <div className="absolute top-6 right-6 z-40">
                      <button
                        onClick={() =>
                          setOpenCardMenuId(
                            openCardMenuId === plan.id ? null : plan.id,
                          )
                        }
                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-gray-400 hover:text-white transition-all duration-300 cursor-pointer hover:scale-110"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openCardMenuId === plan.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#1C1C1C] rounded-2xl border border-white/10 shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden transition-all">
                          <button
                            onClick={() => handleEditPlan(plan)}
                            className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/[0.04] hover:text-white transition-colors duration-200 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlan(plan.id)}
                            className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200 cursor-pointer border-t border-white/[0.03]"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Pricing Overview */}
                    <div>
                      <span className="inline-block px-3 py-1 bg-[#EB712B]/10 border border-[#EB712B]/20 rounded-full text-[9px] font-black uppercase tracking-widest text-[#EB712B] mb-4 transition-all duration-300 group-hover:bg-[#EB712B]/20">
                        {plan.duration} Subscription
                      </span>
                      <h3 className="text-lg font-black text-white uppercase tracking-tight break-words pr-12 transition-colors duration-300 group-hover:text-[#EB712B]">
                        {plan.packageName}
                      </h3>

                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="text-3xl font-black text-[#EB712B] tracking-tight transition-all duration-300 group-hover:scale-105 group-hover:text-[#ff8036]">
                          ${plan.price}
                        </span>
                        {plan.discount && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse">
                            -{plan.discount}% Off
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/5 my-5 transition-colors duration-300 group-hover:border-white/10" />

                    {/* Feature Lists */}
                    <div>
                      <h4 className="text-[9px] font-extrabold uppercase tracking-widest text-gray-500 mb-3">
                        Included Benefits
                      </h4>
                      <ul className="space-y-2">
                        {plan.featuresList.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2.5 text-xs text-gray-300 font-medium transition-all duration-300 group-hover:translate-x-1"
                          >
                            <div className="w-1 h-1 rounded-full bg-[#EB712B] shrink-0 transition-transform duration-300 group-hover:scale-125" />
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-white/5 my-5 transition-colors duration-300 group-hover:border-white/10" />

                    {/* Additional Status Details Grid */}
                    <div className="grid grid-cols-2 gap-4 bg-[#141414]/50 border border-white/5 rounded-2xl p-4 text-[10px] font-extrabold uppercase tracking-[0.05em] transition-all duration-300 group-hover:bg-[#141414]/80">
                      <div>
                        <span className="block text-gray-500 font-bold mb-1">
                          Auto-Renew
                        </span>
                        <span
                          className={`text-xs transition-colors duration-300 ${plan.autoRenew === "Yes" ? "text-green-400" : "text-gray-400"}`}
                        >
                          {plan.autoRenew}
                        </span>
                      </div>
                      <div>
                        <span className="block text-gray-500 font-bold mb-1">
                          Stripe Status
                        </span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500 shadow-[0_0_8px_#22c55e] animate-ping" />
                          </span>
                          Connected
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "Discount" && <Discount />}

        {activeTab === "News" && <News />}

        {activeTab === "Leaderboard" && <Leaderboard />}
      </div>
    </div>
  );
};

export default ManageClubHome;
