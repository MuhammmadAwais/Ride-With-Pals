import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import {
  useUpdateClubInfoByIdMutation,
  useDeleteClubMutation,
  useTransferClubOwnershipMutation,
  useGetClubMembersListQuery,
} from '@/features/club/api/clubApiSlice';
import { RideService } from '@/api/backendApi';
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  ImagePlus,
  AlertTriangle,
  Trash2,
  ArrowRightLeft,
  Search,
  X,
  Check,
  ShieldAlert,
  User,
  Users,
  Coins,
} from "lucide-react";
import { useActiveClub } from "@/hooks/useActiveClub";
import { useAppSelector } from "@/hooks/useAppSelector";

export default function EditClub() {
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const { clubId: clubIdStr, activeClub, clearActiveClub } = useActiveClub();
  const [updateClub, { isLoading }] = useUpdateClubInfoByIdMutation();
  const [deleteClubMutation, { isLoading: isDeletingClub }] = useDeleteClubMutation();
  const [transferOwnershipMutation, { isLoading: isTransferring }] = useTransferClubOwnershipMutation();

  const { data: membersData, isLoading: isMembersLoading } = useGetClubMembersListQuery(
    { clubId: Number(clubIdStr) },
    { skip: !clubIdStr }
  );

  // Transfer Ownership state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

  // Delete Club state (2-Step Safety Confirmation)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

  const [clubName, setClubName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [clubType, setClubType] = useState("Cycling");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isWomenAndNonBinary, setIsWomenAndNonBinary] = useState(false);
  const [restrictUnpaidMembers, setRestrictUnpaidMembers] = useState(false);
  const [restrictClubShop, setRestrictClubShop] = useState(false);
  const [restrictJoinActivities, setRestrictJoinActivities] = useState(false);
  const [currency, setCurrency] = useState("EUR");
  const [bannerFile, setBannerFile] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<string | null>(null);
  const [bannerFileObj, setBannerFileObj] = useState<File | null>(null);
  const [logoFileObj, setLogoFileObj] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (activeClub) {
      setClubName(activeClub.clubName || "");
      setEmail(activeClub.email || "");
      setPhone(activeClub.phone || "");
      setVisibility(activeClub.clubPrivacyId === 2 ? "Private" : "Public");
      setIsWomenAndNonBinary(Boolean(activeClub.isWomenAndNonBinary));
      setRestrictUnpaidMembers(Boolean(activeClub.restrictUnpaidMembers));
      setRestrictClubShop(Boolean(activeClub.restrictClubShop));
      setRestrictJoinActivities(Boolean(activeClub.restrictJoinActivities));
      setCurrency((activeClub.currency || "EUR").toUpperCase());

      let typeStr = "Cycling";
      if (activeClub.clubTypeId === 2) {
        typeStr = "Running";
      } else if (activeClub.clubTypeId === 3) {
        typeStr = "Triathlon";
      }
      setClubType(typeStr);
      setLocation(activeClub.location || "");
      setDescription(activeClub.description || "");
      setBannerFile(activeClub.coverImage || null);
      setLogoFile(activeClub.logo || null);
    }
  }, [activeClub]);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFileObj(file);
      setBannerFile(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFileObj(file);
      setLogoFile(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoFileObj(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!clubIdStr) {
        toast.error(t`No club selected`);
        return;
      }

      setIsUploading(true);

      let updatedLogo = logoFile;
      let updatedBanner = bannerFile;

      if (logoFileObj) {
        const formData = new FormData();
        formData.append("file", logoFileObj);
        const res = await RideService.uploadFile(formData);
        if (res?.response?.fileName) {
          updatedLogo = res.response.fileName;
        }
      }

      if (bannerFileObj) {
        const formData = new FormData();
        formData.append("file", bannerFileObj);
        const res = await RideService.uploadFile(formData);
        if (res?.response?.fileName) {
          updatedBanner = res.response.fileName;
        }
      }

      // Map visibility ("Public"/"Private") to clubPrivacyId (1/2)
      const clubPrivacyId = visibility === 'Private' ? 2 : 1;

      // Map clubType string to clubTypeId number
      let clubTypeId = 1;
      if (clubType === 'Running') {
        clubTypeId = 2;
      } else if (clubType === 'Triathlon') {
        clubTypeId = 3;
      }

      await updateClub({
        clubId: Number(clubIdStr),
        clubName,
        email,
        phone,
        clubPrivacyId,
        clubTypeId,
        location,
        description,
        isWomenAndNonBinary,
        restrictUnpaidMembers,
        restrictClubShop: restrictUnpaidMembers ? restrictClubShop : false,
        restrictJoinActivities: restrictUnpaidMembers ? restrictJoinActivities : false,
        currency: currency.toLowerCase(),
        logo: updatedLogo || "",
        clubImage: updatedBanner || ""
      }).unwrap();

      toast.success(t`Club profile updated successfully!`);
      navigate(-1);
    } catch (err: any) {
      console.error("Failed to save club profile:", err);
      toast.error(err?.response?.data?.message || err?.data?.message || err?.message || t`Failed to update club.`);
    } finally {
      setIsUploading(false);
    }
  };

  // Candidate members for transfer: exclude current user and existing owner
  const eligibleMembers = useMemo(() => {
    const rawList: any[] = Array.isArray(membersData) ? membersData : ((membersData as any)?.response || []);
    return rawList.filter((m: any) => {
      const isSelf = currentUserId && m.userId === currentUserId;
      const isOwnerRole = (m.role || '').toLowerCase() === 'owner';
      return !isSelf && !isOwnerRole;
    });
  }, [membersData, currentUserId]);

  const filteredEligibleMembers = useMemo(() => {
    const query = memberSearch.toLowerCase().trim();
    if (!query) return eligibleMembers;
    return eligibleMembers.filter((m: any) => {
      const name = (m.fullName || m.name || '').toLowerCase();
      const em = (m.email || '').toLowerCase();
      return name.includes(query) || em.includes(query);
    });
  }, [eligibleMembers, memberSearch]);

  const selectedMember = useMemo(() => {
    return eligibleMembers.find((m: any) => m.userId === selectedMemberId);
  }, [eligibleMembers, selectedMemberId]);

  const handleConfirmTransfer = async () => {
    if (!clubIdStr || !selectedMemberId) return;
    try {
      await transferOwnershipMutation({
        clubId: Number(clubIdStr),
        newOwnerId: selectedMemberId,
      }).unwrap();

      const memberName = selectedMember?.fullName || t`Selected member`;
      toast.success(t`Club ownership successfully transferred to ${memberName}!`);
      setIsTransferModalOpen(false);
      navigate('/view/userside/home');
    } catch (err: any) {
      console.error("Failed to transfer ownership:", err);
      toast.error(err?.data?.message || err?.response?.data?.message || err?.message || t`Failed to transfer club ownership.`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clubIdStr) return;
    if (deleteConfirmInput.trim() !== "DELETE") {
      toast.error(t`Please type DELETE in all caps to confirm.`);
      return;
    }

    try {
      await deleteClubMutation({ clubId: Number(clubIdStr) }).unwrap();
      toast.success(t`Club "${clubName || activeClub?.clubName || 'Club'}" was deleted permanently.`);
      clearActiveClub();
      setIsDeleteModalOpen(false);
      navigate('/view/userside/home');
    } catch (err: any) {
      console.error("Failed to delete club:", err);
      toast.error(err?.data?.message || err?.response?.data?.message || err?.message || t`Failed to delete club.`);
    }
  };

  const modalRoot = typeof document !== 'undefined' ? (document.getElementById('modal-root') || document.body) : null;

  return (
    <div className="min-h-screen bg-surface text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-400 hover:text-white font-extrabold text-[10px] tracking-widest uppercase bg-hover border border-white/5 px-6 py-3.5 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:border-white/10 cursor-pointer mb-10 shadow-xl"
        >
          <ArrowLeft size={14} className="text-[#EB712B]" />
          <span><Trans>Back to Dashboard</Trans></span>
        </button>

        {/* Top Title */}
        <h1 className="text-3xl font-black tracking-tight text-white mb-8">
          <Trans>Edit Club Profile</Trans>
        </h1>

        {/* Form Layout */}
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
        >
          {/* LEFT COLUMN: Main Information Grid */}
          <div className="bg-[#181818] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
            <h2 className="text-base font-black tracking-tight text-white border-b border-white/[0.08] pb-4">
              <Trans>General Information</Trans>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Club Name */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Club Name</Trans>
                </label>
                <div className="relative">
                  <Building
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder={t`e.g. Velocity Cycling`}
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Location</Trans>
                </label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="text"
                    placeholder={t`San Francisco, CA`}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Email Address</Trans>
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="email"
                    placeholder={t`contact@club.com`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Phone Number</Trans>
                </label>
                <div className="relative">
                  <Phone
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <input
                    type="tel"
                    placeholder={t`+1 (555) 000-0000`}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10"
                    required
                  />
                </div>
              </div>

              {/* Visibility */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Visibility</Trans>
                </label>
                <div className="relative">
                  <ShieldCheck
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold appearance-none cursor-pointer hover:border-white/10"
                  >
                    <option value="Public">{t`Public`}</option>
                    <option value="Private">{t`Private`}</option>
                  </select>
                  <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <svg
                      width="8"
                      height="5"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="#6B7280"
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

              {/* Club Type */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Club Type</Trans>
                </label>
                <div className="relative">
                  <Building
                    size={14}
                    className="absolute left-4 top-4 text-gray-500"
                  />
                  <select
                    value={clubType}
                    onChange={(e) => setClubType(e.target.value)}
                    className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold appearance-none cursor-pointer hover:border-white/10"
                  >
                    <option value="Cycling">{t`Cycling`}</option>
                    <option value="Running">{t`Running`}</option>
                    <option value="Triathlon">{t`Triathlon`}</option>
                  </select>
                  <div className="absolute right-4 top-0 bottom-0 flex items-center pointer-events-none">
                    <svg
                      width="8"
                      height="5"
                      viewBox="0 0 10 6"
                      fill="none"
                      stroke="#6B7280"
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

            {/* Description */}
            <div className="flex flex-col gap-2.5 pt-2">
              <label className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                <Trans>Description</Trans>
              </label>
              <textarea
                rows={4}
                placeholder={t`Share the story of your club...`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#1F1F1F] border border-white/5 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300 font-bold hover:border-white/10 resize-none"
              />
            </div>

            {/* Women & Non-Binary Switch */}
            <div className="flex items-center justify-between p-4 bg-[#1F1F1F] border border-white/5 rounded-xl transition-all duration-200 hover:border-white/10">
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white"><Trans>Women and non-binary only</Trans></span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Trans>Exclusive</Trans>
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  <Trans>Only women and non-binary members can join this club</Trans>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWomenAndNonBinary((prev) => !prev)}
                aria-label="Toggle Women and non-binary only"
                className={`w-12 h-6.5 rounded-full transition-colors flex items-center p-0.5 border cursor-pointer shrink-0 ${
                  isWomenAndNonBinary
                    ? 'bg-[#EB712B] border-[#EB712B]'
                    : 'bg-[#262626] border-white/10'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-xs ${
                    isWomenAndNonBinary ? 'translate-x-5.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Club Media Container */}
            <div className="bg-[#181818] border border-white/5 rounded-3xl p-8 space-y-6">
              <h2 className="text-base font-black tracking-tight text-white border-b border-white/[0.08] pb-4">
                <Trans>Club Media</Trans>
              </h2>

              {/* Hero Banner Upload Zone */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Hero Banner</Trans>
                </span>
                <div className="bg-[#1F1F1F] border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group transition-all duration-300 hover:border-[#EB712B]/40 cursor-pointer min-h-[140px]">
                  {bannerFile ? (
                    <div className="absolute inset-0">
                      <img
                        src={bannerFile.startsWith('http') || bannerFile.startsWith('blob:') ? bannerFile : `https://api.ridewithpals.com/uploads/${bannerFile}`}
                        alt="Banner Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-black tracking-widest text-white uppercase bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                          <Trans>Change Banner</Trans>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <ImagePlus
                        size={28}
                        className="text-gray-600 mb-2 group-hover:text-[#EB712B] transition-colors"
                      />
                      <p className="text-xs font-black text-white mb-1">
                        <Trans>Click to upload banner</Trans>
                      </p>
                      <p className="text-[9px] font-semibold text-gray-500">
                        <Trans>16:9 ratio recommended [JPG, PNG]</Trans>
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleBannerChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Club Logo Upload Zone */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-extrabold text-gray-400 tracking-[0.2em] uppercase">
                  <Trans>Club Logo</Trans>
                </span>
                <div className="flex items-center gap-6 bg-[#1F1F1F] border border-white/5 rounded-2xl p-4">
                  <div className="w-16 h-16 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center relative overflow-hidden group/logo hover:border-[#EB712B]/50 transition-colors flex-shrink-0">
                    {logoFile ? (
                      <img
                        src={logoFile.startsWith('http') || logoFile.startsWith('blob:') ? logoFile : `https://api.ridewithpals.com/uploads/${logoFile}`}
                        alt="Logo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] font-bold text-gray-500 tracking-wider text-center px-2">
                        <Trans>Upload Logo</Trans>
                      </span>
                    )}
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleLogoChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-medium text-gray-400 leading-relaxed max-w-[200px]">
                      <Trans>Recommended size: 400x400px. Square format will be automatically cropped to a circle.</Trans>
                    </p>
                    <div className="flex gap-4 mt-2">
                      <label
                        htmlFor="logo-upload-input"
                        className="text-[10px] font-extrabold text-[#EB712B] hover:text-[#ff8036] uppercase tracking-wider cursor-pointer"
                      >
                        <Trans>Change</Trans>
                      </label>
                      <input
                        id="logo-upload-input"
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[10px] font-extrabold text-gray-500 hover:text-white uppercase tracking-wider cursor-pointer"
                      >
                        <Trans>Remove</Trans>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Club Governance & Membership Restrictions Card */}
            <div className="bg-[#1F1F1F] border border-white/5 rounded-3xl p-6 sm:p-7 space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                      <Trans>Governance & Membership Restrictions</Trans>
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                      <Trans>Configure participation rules and enforcement for unpaid club members.</Trans>
                    </p>
                  </div>
                </div>
              </div>

              {/* Currency Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#161616] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/5 text-gray-400">
                    <Coins size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      <Trans>Club Operating Currency</Trans>
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      <Trans>Default currency applied to memberships, merchandise, and wallet accounting.</Trans>
                    </span>
                  </div>
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[#262626] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#EB712B] cursor-pointer"
                >
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>

              {/* Master Toggle: Restrict Unpaid Members */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161616] border border-white/5">
                <div className="pr-4">
                  <span className="text-xs font-bold text-white block">
                    <Trans>Restrict Unpaid Members</Trans>
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    <Trans>Enable rules that limit club privileges when athlete fees are overdue.</Trans>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !restrictUnpaidMembers;
                    setRestrictUnpaidMembers(next);
                    if (!next) {
                      setRestrictJoinActivities(false);
                      setRestrictClubShop(false);
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    restrictUnpaidMembers ? 'bg-[#EB712B]' : 'bg-[#333333]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      restrictUnpaidMembers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Sub-Restrictions (active only if restrictUnpaidMembers is true) */}
              <div className={`space-y-3 transition-opacity duration-200 ${restrictUnpaidMembers ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                {/* Restrict Activities */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161616]/60 border border-white/5">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-white block">
                      <Trans>Restrict Group Rides & Events</Trans>
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      <Trans>Unpaid members cannot register for or RSVP to club activities.</Trans>
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!restrictUnpaidMembers}
                    onClick={() => setRestrictJoinActivities(!restrictJoinActivities)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      restrictJoinActivities && restrictUnpaidMembers ? 'bg-[#EB712B]' : 'bg-[#333333]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        restrictJoinActivities && restrictUnpaidMembers ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Restrict Club Shop */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#161616]/60 border border-white/5">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-white block">
                      <Trans>Restrict Official Club Shop</Trans>
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      <Trans>Only members with active paid status can purchase official merchandise.</Trans>
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!restrictUnpaidMembers}
                    onClick={() => setRestrictClubShop(!restrictClubShop)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      restrictClubShop && restrictUnpaidMembers ? 'bg-[#EB712B]' : 'bg-[#333333]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        restrictClubShop && restrictUnpaidMembers ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading || isUploading}
                className="w-full py-4 bg-[#EB712B] hover:bg-[#ff8036] text-white rounded-2xl text-xs font-black tracking-[0.15em] uppercase cursor-pointer shadow-lg shadow-[#EB712B]/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-[#EB712B]/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading || isUploading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {isUploading ? <Trans>Uploading Images...</Trans> : <Trans>Saving Changes...</Trans>}
                  </>
                ) : (
                  <Trans>Save Changes</Trans>
                )}
              </button>
            </div>

            {/* Footer */}
            <p className="text-[9px] font-medium text-center text-gray-500 tracking-wide pt-2">
              <Trans>Last saved: Just now</Trans>
            </p>
          </div>
        </form>

        {/* Danger Zone Section */}
        <div className="mt-14 pt-10 border-t border-red-500/20">
          <div className="bg-[#181112] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex items-center gap-3.5 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shadow-lg shadow-red-500/10">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-white tracking-wide uppercase">
                  <Trans>Danger Zone</Trans>
                </h2>
                <p className="text-xs text-red-400/80 font-medium mt-0.5">
                  <Trans>High-impact, irreversible administrative actions for this club</Trans>
                </p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Transfer Ownership Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#201517] border border-red-500/15 gap-4 hover:border-amber-500/30 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <ArrowRightLeft size={16} className="text-amber-400" />
                    <Trans>Transfer Club Ownership</Trans>
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                    <Trans>Transfer ownership of this club to an active member. You will lose primary ownership authority, Stripe billing controls, and member management powers.</Trans>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMemberId(null);
                    setMemberSearch("");
                    setIsTransferModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer hover:border-amber-500/60 shadow-lg shadow-amber-500/5 flex items-center justify-center gap-2"
                >
                  <ArrowRightLeft size={14} />
                  <span><Trans>Transfer Ownership</Trans></span>
                </button>
              </div>

              {/* Delete Club Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-[#201517] border border-red-500/15 gap-4 hover:border-red-500/30 transition-colors">
                <div>
                  <h3 className="text-sm font-bold text-red-400 mb-1 flex items-center gap-2">
                    <Trash2 size={16} className="text-red-400" />
                    <Trans>Permanently Delete Club</Trans>
                  </h3>
                  <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
                    <Trans>Permanently delete this club, its member lists, scheduled rides, news feed, discounts, and history. This action cannot be reversed.</Trans>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteStep(1);
                    setDeleteConfirmInput("");
                    setIsDeleteModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-red-500/40 bg-red-500/15 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider transition-all duration-200 shrink-0 cursor-pointer shadow-lg shadow-red-500/10 hover:shadow-red-500/25 flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  <span><Trans>Delete Club</Trans></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Transfer Club Ownership Modal ────────────────────────────────────── */}
      {isTransferModalOpen && modalRoot && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsTransferModalOpen(false); }}
        >
          <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#161618]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ArrowRightLeft size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    <Trans>Transfer Club Ownership</Trans>
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    <Trans>Choose a member to receive primary ownership of this club.</Trans>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder={t`Search club members by name or email...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141416] rounded-xl border border-white/10 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              {/* Members List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {isMembersLoading ? (
                  <div className="py-10 text-center text-xs text-gray-400">
                    <span className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    <Trans>Loading eligible club members...</Trans>
                  </div>
                ) : filteredEligibleMembers.length === 0 ? (
                  <div className="py-10 text-center text-xs text-gray-400 bg-white/5 rounded-2xl p-6 border border-white/5">
                    <Users size={28} className="mx-auto mb-2 text-gray-500" />
                    <p className="font-bold text-white mb-1"><Trans>No eligible members found</Trans></p>
                    <p className="text-gray-400 text-[11px]">
                      {memberSearch ? t`No members match your search.` : t`Only existing active members can be transferred ownership.`}
                    </p>
                  </div>
                ) : (
                  filteredEligibleMembers.map((member: any) => {
                    const isSelected = selectedMemberId === member.userId;
                    const avatar = member.profileImage ? (member.profileImage.startsWith('http') || member.profileImage.startsWith('blob:') ? member.profileImage : `https://api.ridewithpals.com/uploads/${member.profileImage}`) : null;
                    return (
                      <div
                        key={member.userId}
                        onClick={() => setSelectedMemberId(member.userId)}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500/40 text-white'
                            : 'bg-[#141416] border-white/5 hover:border-white/20 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[#202024] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                            {avatar ? (
                              <img src={avatar} alt={member.fullName || 'Member'} className="w-full h-full object-cover" />
                            ) : (
                              <User size={18} className="text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {member.fullName || t`Member #${member.userId}`}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {member.email || t`No email`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400">
                            {member.role || t`Member`}
                          </span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-amber-400 bg-amber-400 text-black' : 'border-white/20'}`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Warning Callout when selected */}
              {selectedMember && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle size={15} />
                    <span><Trans>Transfer Confirmation</Trans></span>
                  </div>
                  <p>
                    <Trans>
                      Are you sure you want to transfer ownership of <strong className="text-white font-semibold">{clubName || activeClub?.clubName}</strong> to <strong className="text-white font-semibold">{selectedMember.fullName || selectedMember.email}</strong>?
                      You will be demoted to an administrator and will no longer have owner-level privileges.
                    </Trans>
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#161618]">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                disabled={isTransferring}
                className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Trans>Cancel</Trans>
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={!selectedMemberId || isTransferring}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all duration-200 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {isTransferring ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span><Trans>Transferring...</Trans></span>
                  </>
                ) : (
                  <>
                    <ArrowRightLeft size={14} />
                    <span><Trans>Confirm Transfer</Trans></span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        modalRoot
      )}

      {/* ─── Delete Club Two-Step Safety Modal ────────────────────────────────── */}
      {isDeleteModalOpen && modalRoot && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget && !isDeletingClub) setIsDeleteModalOpen(false); }}
        >
          <div className="bg-[#1C1214] border border-red-500/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-red-500/20 bg-[#221316]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30">
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    {deleteStep === 1 ? <Trans>Permanently Delete Club</Trans> : <Trans>Final Confirmation Required</Trans>}
                  </h3>
                  <p className="text-xs text-red-400 font-medium">
                    {deleteStep === 1 ? <Trans>Step 1 of 2: Risk Assessment</Trans> : <Trans>Step 2 of 2: Safeguard Verification</Trans>}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { if (!isDeletingClub) setIsDeleteModalOpen(false); }}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {deleteStep === 1 ? (
                <>
                  {/* Club Preview Badge */}
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-black/30 border border-red-500/20">
                    <div className="w-12 h-12 rounded-full bg-[#181112] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {logoFile ? (
                        <img
                          src={logoFile.startsWith('http') || logoFile.startsWith('blob:') ? logoFile : `https://api.ridewithpals.com/uploads/${logoFile}`}
                          alt="Club"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white truncate text-base">
                        {clubName || activeClub?.clubName}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {location || activeClub?.location || t`No location specified`} • {clubType}
                      </p>
                    </div>
                  </div>

                  {/* Destruction Impact Warning Box */}
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 space-y-2 leading-relaxed">
                    <p className="font-bold text-red-400 flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <Trans>This action is completely irreversible.</Trans>
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 text-gray-300">
                      <li><Trans>All members and admins will immediately lose access.</Trans></li>
                      <li><Trans>All scheduled rides, GPS route data, and comments will be permanently erased.</Trans></li>
                      <li><Trans>All club shop merchandise, member fees, and history will be cancelled.</Trans></li>
                      <li><Trans>This club name and profile cannot be recovered by support.</Trans></li>
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
                        To confirm permanent deletion of <strong className="text-white font-bold">{clubName || activeClub?.clubName}</strong>, please type <span className="font-mono font-black text-red-400 tracking-widest px-1.5 py-0.5 bg-black/40 border border-red-500/30 rounded">DELETE</span> in capital letters in the input below:
                      </Trans>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      autoFocus
                      value={deleteConfirmInput}
                      onChange={(e) => setDeleteConfirmInput(e.target.value)}
                      placeholder="DELETE"
                      className="w-full text-center font-mono tracking-[0.25em] text-base uppercase py-3.5 bg-black/50 border border-red-500/40 rounded-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    <div className="flex items-center justify-between text-[11px] px-1 font-semibold">
                      <span className="text-gray-400"><Trans>Must match exactly:</Trans></span>
                      {deleteConfirmInput.trim() === "DELETE" ? (
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
              {deleteStep === 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trans>Cancel</Trans>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer"
                  >
                    <Trans>I Understand, Continue</Trans>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setDeleteStep(1)}
                    disabled={isDeletingClub}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <Trans>Back</Trans>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    disabled={deleteConfirmInput.trim() !== "DELETE" || isDeletingClub}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-lg shadow-red-600/30"
                  >
                    {isDeletingClub ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      )}
    </div>
  );
}
