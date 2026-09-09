import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MapPin, 
  Grid3X3, 
  List, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Share2, 
  Upload, 
  Loader2, 
  X, 
  Package,
  SlidersHorizontal,
  RotateCcw,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/useAppSelector";
import { ROUTES } from "@/Constants";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import {
  useGetMarketplaceListQuery,
  useAddMarketPlaceItemMutation,
  useDeleteMarketPlaceItemMutation,
  useGetOwnListingsQuery,
  useShareMarketPlaceItemMutation,
} from "@/features/club/api/marketplaceApiSlice";

import { useUploadFileMutation } from "@/features/auth/api/authApiSlice";
import { useActiveClub } from "@/hooks/useActiveClub";
import { useGetJoinedClubsQuery } from "@/features/club/api/clubApiSlice";
import { resolveImageUrl } from "../services/clubGeocoding";

export const getMarketplaceFallbackImage = (name?: string): string => {
  const n = (name || "").toLowerCase();
  if (n.includes("watch") || n.includes("coros") || n.includes("garmin")) {
    return "/Images/SmartWatch.jpg";
  }
  if (n.includes("bottle") || n.includes("altavoz") || n.includes("speaker") || n.includes("water")) {
    return "/Images/BottleImage.png";
  }
  if (n.includes("sram") || n.includes("cambio") || n.includes("bike") || n.includes("cycle") || n.includes("libro")) {
    return "/Images/CycleImage2.png";
  }
  if (n.includes("glove")) {
    return "/Images/CycleGloves.jfif";
  }
  return "/Images/HelmetImage4.jpg";
};

const ProductCardImage = ({
  src,
  alt,
  fallbackSrc,
}: {
  src: string;
  alt: string;
  fallbackSrc: string;
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isFailed, setIsFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsFailed(false);
  }, [src]);

  const handleImageError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    } else {
      setIsFailed(true);
    }
  };

  if (isFailed) {
    return (
      <div className="w-full h-full bg-[#1c1c1c] flex flex-col items-center justify-center gap-1.5 text-text-muted">
        <Package size={22} className="text-[#EB712B]" />
        <span className="font-black text-[10px] uppercase tracking-wider text-text-muted">
          <Trans>Premium Gear</Trans>
        </span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleImageError}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
};

interface Product {
  id: string;
  name: string;
  price: string;
  condition: "NEW" | "USED";
  location: string;
  image: string;
  sellerId: number;
  sellerName?: string;
  sellerAvatar?: string;
  description?: string;
}

interface MarketplaceProps {
  clubId?: string | number;
}

// ── SUCCESS CONFIRMATION MODAL ────────────────────────────────────────────────
interface SuccessModalProps {
  itemName: string;
  onClose: () => void;
}

function SuccessModal({ itemName, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-sm relative border border-border shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F3326] border border-[#4E9F6D]/30 rounded-2xl flex items-center justify-center text-[#69B475]">
            ✓
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-[#69B475]">
              <Trans>Premium Marketplace</Trans>
            </p>
            <h3 className="text-base font-black tracking-tight text-text-main">
              <Trans>Order Confirmed!</Trans>
            </h3>
          </div>
        </div>

        <p className="text-xs font-medium text-text-muted leading-relaxed">
          <Trans>Thank you for your purchase of the</Trans> <span className="font-black text-text-main">{itemName}</span>. <Trans>Your transaction is successful, and a confirmation email has been sent. Your professional gear will ship soon!</Trans>
        </p>

        <button 
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#69B475] hover:bg-[#589762] text-[#0D1310] text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg border-0 outline-none"
        >
          <Trans>Return to Marketplace</Trans>
        </button>
      </div>
    </div>
  );
}


// ── ADD LISTING MODAL ─────────────────────────────────────────────────────────
interface AddListingModalProps {
  onClose: () => void;
  activeClubId: number;
}

function AddListingModal({ onClose, activeClubId }: AddListingModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState<"NEW" | "USED">("USED");
  const [description, setDescription] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [addListing, { isLoading: isAdding }] = useAddMarketPlaceItemMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t`Please enter a product name.`);
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error(t`Please enter a valid price.`);
      return;
    }

    try {
      let finalImageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await uploadFile(formData).unwrap();
        finalImageUrl = uploadRes.fileName;
      }

      await addListing({
        clubId: activeClubId,
        productName: name.trim(),
        price: Number(price),
        condition,
        description: description.trim(),
        image: finalImageUrl || undefined,
      }).unwrap();

      toast.success(t`Listing created successfully!`);
      onClose();
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || t`Failed to create listing.`);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-lg relative border border-border shadow-2xl space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-wider text-text-main">
            <Trans>Create Listing</Trans>
          </h3>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text-main border-0 bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => fileInputRef.current?.click()} 
            className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#EB712B]/50 transition-colors overflow-hidden relative bg-main-bg"
          >
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="w-full h-full object-contain" />
            ) : (
              <>
                {isUploading ? <Loader2 className="text-[#EB712B] animate-spin mb-2" size={20} /> : <Upload className="text-[#EB712B] mb-2" size={20} />}
                <span className="text-[10px] text-text-muted font-bold">
                  {isUploading ? <Trans>Uploading...</Trans> : <Trans>Upload Product Image</Trans>}
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                <Trans>Product Name</Trans>
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
                placeholder={t`e.g. Carbon Helmet`}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                <Trans>Price (USD)</Trans>
              </label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
                placeholder={t`e.g. 150`}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
                <Trans>Condition</Trans>
              </label>
              <select 
                value={condition} 
                onChange={(e) => setCondition(e.target.value as "NEW" | "USED")} 
                className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs text-text-main outline-none focus:border-[#EB712B]"
              >
                <option value="USED">{t`Used`}</option>
                <option value="NEW">{t`New`}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">
              <Trans>Description</Trans>
            </label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main resize-none"
              placeholder={t`Provide a detailed description of the gear condition, sizing, etc.`}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isAdding || isUploading}
            className="flex-1 py-3.5 rounded-xl bg-surface hover:bg-hover border border-border text-text-main text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer outline-none disabled:opacity-50"
          >
            <Trans>Cancel</Trans>
          </button>
          <button 
            type="submit" 
            disabled={isAdding || isUploading}
            className="flex-1 py-3.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2 border-0 outline-none disabled:opacity-50"
          >
            {(isAdding || isUploading) && <Loader2 size={16} className="animate-spin" />}
            {isAdding || isUploading ? <Trans>Publishing...</Trans> : <Trans>Publish Listing</Trans>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── SHARE LISTING MODAL ───────────────────────────────────────────────────────
interface ShareListingModalProps {
  itemId: number;
  onClose: () => void;
}

function ShareListingModal({ itemId, onClose }: ShareListingModalProps) {
  const { data: joinedClubsResponse, isLoading: isLoadingClubs } = useGetJoinedClubsQuery();
  const [shareItem, { isLoading: isSharing }] = useShareMarketPlaceItemMutation();

  const clubs = joinedClubsResponse?.rows || [];

  const handleShare = async (clubId: number) => {
    try {
      await shareItem({ clubId, marketPlaceItemId: itemId }).unwrap();
      toast.success(t`Shared successfully to the club bulletin board!`);
      onClose();
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || t`Failed to share listing.`);
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-sm relative border border-border shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black uppercase tracking-wider text-text-main">
            <Trans>Cross-post Listing</Trans>
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main border-0 bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-text-muted">
          <Trans>Select one of your joined clubs to share this listing onto their marketplace stream.</Trans>
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {isLoadingClubs ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-[#EB712B]" />
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">
              <Trans>You haven't joined any other clubs yet.</Trans>
            </div>
          ) : (
            clubs.map((c: { id: number; logo?: string; clubName: string }) => (
              <button
                key={c.id}
                onClick={() => handleShare(c.id)}
                disabled={isSharing}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-main-bg border border-border hover:border-[#EB712B]/40 transition-colors text-left cursor-pointer outline-none disabled:opacity-50"
              >
                <img
                  src={resolveImageUrl(c.logo) || "/Images/CycleImage.png"}
                  alt={c.clubName}
                  onError={(e) => { (e.target as HTMLImageElement).src = '/Images/CycleImage.png'; }}
                  className="w-8 h-8 rounded-lg object-cover border border-border"
                />
                <span className="text-xs font-bold text-text-main truncate">{c.clubName}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── SKELETONS ───────────────────────────────────────────────────────────────
const GridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="bg-surface border border-border rounded-3xl p-4 space-y-4">
        <div className="w-full aspect-[4/3] bg-[#222] rounded-2xl" />
        <div className="space-y-2 px-1">
          <div className="w-2/3 h-3 bg-[#222] rounded" />
          <div className="w-1/3 h-3 bg-[#222] rounded" />
        </div>
        <div className="flex justify-between items-center border-t border-border pt-3">
          <div className="w-16 h-3 bg-[#222] rounded" />
          <div className="w-20 h-7 bg-[#222] rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const ListSkeleton = () => (
  <div className="flex flex-col gap-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-surface border border-border rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center gap-5 md:gap-6">
        <div className="w-full md:w-56 h-48 md:h-36 rounded-2xl bg-[#222] shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <div className="w-28 h-4 bg-[#222] rounded" />
          <div className="w-2/3 h-6 bg-[#222] rounded" />
          <div className="w-full h-3 bg-[#222] rounded" />
          <div className="w-40 h-4 bg-[#222] rounded" />
        </div>
        <div className="w-full md:w-48 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border/70 md:pl-6 space-y-3">
          <div className="w-16 h-3 bg-[#222] rounded md:ml-auto" />
          <div className="w-24 h-6 bg-[#222] rounded md:ml-auto" />
          <div className="w-full h-11 bg-[#222] rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

// ── MAIN MARKETPLACE COMPONENT ────────────────────────────────────────────────
export default function Marketplace({ clubId: propClubId }: MarketplaceProps) {
  const [activeTab, setActiveTab] = useState<"All" | "MyListings">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter & Sorting state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [conditionFilter, setConditionFilter] = useState<"ALL" | "NEW" | "USED">("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const filterRef = useRef<HTMLDivElement>(null);

  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const navigate = useNavigate();

  // Create Listing Form state
  const [showAddModal, setShowAddModal] = useState(false);
  // Share state
  const [sharingItemId, setSharingItemId] = useState<number | null>(null);
  // Success modal state
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedItemName, setPurchasedItemName] = useState("");

  // Dismiss filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (conditionFilter !== "ALL") count++;
    if (sortOrder !== "newest") count++;
    if (minPrice !== "" || maxPrice !== "") count++;
    return count;
  }, [conditionFilter, sortOrder, minPrice, maxPrice]);

  const handleClearFilters = () => {
    setConditionFilter("ALL");
    setSortOrder("newest");
    setMinPrice("");
    setMaxPrice("");
    setSearchQuery("");
  };

  // Authenticated user
  const currentUser = useAppSelector((state) => state.auth.user);

  // ✅ FIX: Resolve clubId exclusively from useActiveClub — no first-club fallback.
  // The fallback to joinedClubs[0] caused the marketplace to show a random club's
  // listings when the user hadn't explicitly selected a club.
  const { clubId: activeClubIdRedux } = useActiveClub();
  const activeClubId = propClubId || activeClubIdRedux;

  // RTK Queries & Mutations
  const { data: marketplaceResponse, isLoading: isLoadingListings, isError: isErrorListings } = useGetMarketplaceListQuery(
    { clubId: activeClubId!, limit: 50, offset: 0 },
    { skip: !activeClubId || activeTab === "MyListings" }
  );

  const { data: ownListingsResponse, isLoading: isLoadingOwn, isError: isErrorOwn } = useGetOwnListingsQuery(
    { limit: 50, offset: 0 },
    { skip: activeTab === "All" }
  );

  const [deleteListing, { isLoading: isDeleting }] = useDeleteMarketPlaceItemMutation();

  const isLoading = isLoadingListings || isLoadingOwn;
  const isError = isErrorListings || isErrorOwn;

  const products = useMemo<Product[]>(() => {
    const rawRows = activeTab === "All" 
      ? marketplaceResponse?.rows || [] 
      : ownListingsResponse?.rows || [];

    return rawRows.map((item) => {
      const fallback = getMarketplaceFallbackImage(item.productName);
      const resolved = resolveImageUrl(item.image);
      return {
        id: item.id.toString(),
        name: item.productName || t`Unknown Item`,
        price: item.price ? `$${parseFloat(item.price).toFixed(2)}` : t`Free`,
        condition: (item.condition?.toUpperCase() === "NEW" ? "NEW" : "USED") as "NEW" | "USED",
        location: item.club?.clubName || t`Global Marketplace`,
        image: resolved || fallback,
        sellerId: item.sellerId,
        sellerName: item.seller?.fullName || t`Elite Seller`,
        sellerAvatar: resolveImageUrl(item.seller?.profileImage) || undefined,
        description: item.description,
      };
    });
  }, [marketplaceResponse, ownListingsResponse, activeTab]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prevFavorites) => {
      const updated = new Set(prevFavorites);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteListing({ marketPlaceItemId: Number(id) }).unwrap();
      toast.success(t`Listing deleted successfully!`);
    } catch (err) {
      toast.error((err as { data?: { message?: string } })?.data?.message || t`Failed to delete listing.`);
      console.error(err);
    }
  };

  const filteredProducts = useMemo<Product[]>(() => {
    return products
      .filter((product) => {
        // 1. Search filter
        const query = searchQuery.trim().toLowerCase();
        if (query) {
          const matchName = product.name.toLowerCase().includes(query);
          const matchLocation = product.location.toLowerCase().includes(query);
          const matchDesc = product.description?.toLowerCase().includes(query) ?? false;
          const matchSeller = product.sellerName?.toLowerCase().includes(query) ?? false;
          if (!matchName && !matchLocation && !matchDesc && !matchSeller) {
            return false;
          }
        }

        // 2. Condition filter
        if (conditionFilter !== "ALL" && product.condition !== conditionFilter) {
          return false;
        }

        // 3. Price range filter
        const numericPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
        if (minPrice !== "") {
          const min = parseFloat(minPrice);
          if (!isNaN(min) && numericPrice < min) return false;
        }
        if (maxPrice !== "") {
          const max = parseFloat(maxPrice);
          if (!isNaN(max) && numericPrice > max) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) || 0;
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) || 0;
        if (sortOrder === "price-asc") {
          return priceA - priceB;
        }
        if (sortOrder === "price-desc") {
          return priceB - priceA;
        }
        // Default newest
        return Number(b.id) - Number(a.id);
      });
  }, [products, searchQuery, conditionFilter, sortOrder, minPrice, maxPrice]);

  const handleBuyNow = (product: Product) => {
    if (!currentUser) {
      toast.error(t`Please log in to purchase items.`);
      return;
    }
    setPurchasedItemName(product.name);

    const formattedMessage = `🛒 Interested in Purchasing: ${product.name}
💰 Price: ${product.price}
📍 Location: ${product.location || 'Marketplace'}
Condition: ${product.condition}

Hi ${product.sellerName || 'there'}! I saw your listing for "${product.name}" on the Ride With Pals Marketplace and I'm interested in buying it. Is it still available?`;

    const supportRoute = currentUser.isAthleteProfile ? ROUTES.SUPPORT_ATHLETE : ROUTES.SUPPORT_OWNER;

    navigate(supportRoute, {
      state: {
        targetUserId: product.sellerId,
        targetUserName: product.sellerName || 'Elite Seller',
        targetUserAvatar: product.sellerAvatar,
        prefillMessage: formattedMessage,
      }
    });
  };

  return (
    <div className="space-y-6 w-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-text-main">
              <Trans>Premium Equipment</Trans>
            </h1>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted mt-1.5">
            <Trans>Showing {filteredProducts.length} items from elite verified riders & clubs</Trans>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder={t`Search gear, brand, or club...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-8 bg-surface border border-border rounded-2xl text-xs font-medium text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main border-0 bg-transparent cursor-pointer p-0.5"
                title={t`Clear search`}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Interactive Filter Popover */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen((prev) => !prev)}
              className={`h-10 px-4 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border outline-none ${
                activeFilterCount > 0 || isFilterOpen
                  ? "bg-[#EB712B] text-white border-[#EB712B] shadow-md shadow-[#EB712B]/20"
                  : "bg-surface border-border hover:border-[#EB712B]/50 text-text-muted hover:text-text-main"
              }`}
            >
              <Filter size={14} className={activeFilterCount > 0 || isFilterOpen ? "text-white" : "text-text-muted"} />
              <span><Trans>Filter</Trans></span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#EB712B] text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 sm:w-88 bg-surface border border-border rounded-2xl p-5 shadow-2xl backdrop-blur-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={15} className="text-[#EB712B]" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-text-main">
                      <Trans>Marketplace Filters</Trans>
                    </h4>
                  </div>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="text-[10px] font-bold text-[#EB712B] hover:underline cursor-pointer border-0 bg-transparent flex items-center gap-1"
                    >
                      <RotateCcw size={10} /> <Trans>Reset</Trans>
                    </button>
                  )}
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    <Trans>Equipment Condition</Trans>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-main-bg rounded-xl border border-border">
                    {(["ALL", "NEW", "USED"] as const).map((cond) => (
                      <button
                        key={cond}
                        onClick={() => setConditionFilter(cond)}
                        className={`py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border-0 outline-none ${
                          conditionFilter === cond
                            ? "bg-[#EB712B] text-white shadow-sm"
                            : "text-text-muted hover:text-text-main bg-transparent"
                        }`}
                      >
                        {cond === "ALL" ? <Trans>All</Trans> : cond === "NEW" ? <Trans>New</Trans> : <Trans>Used</Trans>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    <Trans>Sort Order</Trans>
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: "newest", label: t`Newest Listings First` },
                      { id: "price-asc", label: t`Price: Low to High` },
                      { id: "price-desc", label: t`Price: High to Low` },
                    ].map((sort) => (
                      <button
                        key={sort.id}
                        onClick={() => setSortOrder(sort.id as any)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border flex items-center justify-between outline-none ${
                          sortOrder === sort.id
                            ? "bg-[#EB712B]/10 border-[#EB712B]/40 text-[#EB712B]"
                            : "bg-main-bg border-border text-text-muted hover:text-text-main hover:border-text-muted/30"
                        }`}
                      >
                        <span>{sort.label}</span>
                        {sortOrder === sort.id && <Check size={14} className="text-[#EB712B]" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-text-muted block">
                    <Trans>Price Range (USD)</Trans>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted">$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={t`Min`}
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-main-bg border border-border rounded-xl py-2 pl-7 pr-3 text-xs text-text-main outline-none focus:border-[#EB712B]"
                      />
                    </div>
                    <span className="text-text-muted text-xs font-bold">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-text-muted">$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder={t`Max`}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-main-bg border border-border rounded-xl py-2 pl-7 pr-3 text-xs text-text-main outline-none focus:border-[#EB712B]"
                      />
                    </div>
                  </div>
                  {/* Quick price presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: t`Under $50`, min: "", max: "50" },
                      { label: t`$50 - $200`, min: "50", max: "200" },
                      { label: t`$200+`, min: "200", max: "" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          setMinPrice(preset.min);
                          setMaxPrice(preset.max);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border cursor-pointer transition-all outline-none ${
                          minPrice === preset.min && maxPrice === preset.max
                            ? "bg-[#EB712B]/20 border-[#EB712B] text-[#EB712B]"
                            : "bg-main-bg border-border text-text-muted hover:text-text-main"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] font-bold text-text-muted">
                    {filteredProducts.length} <Trans>items found</Trans>
                  </span>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-0 outline-none shadow-md shadow-[#EB712B]/20"
                  >
                    <Trans>Done</Trans>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-surface border border-border rounded-2xl p-1.5 gap-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "grid" ? "bg-hover text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
              title={t`Grid View`}
            >
              <Grid3X3 size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "list" ? "bg-hover text-text-main shadow-sm" : "text-text-muted hover:text-text-main"
              }`}
              title={t`List View`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider mr-1">
            <Trans>Active Filters:</Trans>
          </span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black uppercase tracking-wider">
              Search: "{searchQuery}"
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setSearchQuery("")}
              />
            </span>
          )}
          {conditionFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black uppercase tracking-wider">
              Condition: {conditionFilter}
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setConditionFilter("ALL")}
              />
            </span>
          )}
          {sortOrder !== "newest" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black uppercase tracking-wider">
              Sort: {sortOrder === "price-asc" ? "Price Low to High" : "Price High to Low"}
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => setSortOrder("newest")}
              />
            </span>
          )}
          {(minPrice !== "" || maxPrice !== "") && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EB712B]/10 border border-[#EB712B]/30 text-[#EB712B] text-[10px] font-black uppercase tracking-wider">
              Price: {minPrice ? `$${minPrice}` : "$0"} - {maxPrice ? `$${maxPrice}` : "∞"}
              <X
                size={12}
                className="cursor-pointer hover:text-white"
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
              />
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="text-[10px] font-bold text-text-muted hover:text-[#EB712B] underline cursor-pointer ml-1 transition-colors"
          >
            <Trans>Clear all</Trans>
          </button>
        </div>
      )}

      {/* Tabs and Actions Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="bg-surface p-1 rounded-xl border border-border flex shrink-0">
          <button 
            onClick={() => setActiveTab("All")} 
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === "All" ? "bg-[#EB712B] text-white" : "text-text-muted hover:text-text-main bg-transparent"}`}
          >
            <Trans>All Gear</Trans>
          </button>
          <button 
            onClick={() => setActiveTab("MyListings")} 
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === "MyListings" ? "bg-[#EB712B] text-white" : "text-text-muted hover:text-text-main bg-transparent"}`}
          >
            <Trans>My Listings</Trans>
          </button>
        </div>

        {activeClubId && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-0 outline-none shadow-md shadow-[#EB712B]/10"
          >
            <Plus size={16} /> <Trans>Add Listing</Trans>
          </button>
        )}
      </div>

      {/* Product List */}
      {isLoading ? (
        viewMode === "list" ? <ListSkeleton /> : <GridSkeleton />
      ) : isError ? (
        <div className="text-center py-12 bg-surface border border-border rounded-3xl text-red-500 font-bold text-xs uppercase tracking-wider">
          <Trans>Failed to load marketplace listings. Please try again.</Trans>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-main-bg border border-border flex items-center justify-center mx-auto text-[#EB712B]">
            <Package size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black uppercase tracking-wide text-text-main">
              <Trans>No equipment found</Trans>
            </h3>
            <p className="text-xs font-medium text-text-muted">
              {activeFilterCount > 0 || searchQuery
                ? <Trans>No listings match your selected search or filter criteria.</Trans>
                : <Trans>There are currently no listings available in this category.</Trans>}
            </p>
          </div>
          {(activeFilterCount > 0 || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="px-5 py-2.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-0 outline-none shadow-md"
            >
              <Trans>Reset Filters & Search</Trans>
            </button>
          )}
        </div>
      ) : viewMode === "list" ? (
        /* MODERN LIST VIEW (Balanced layout, zero distortion, rich content) */
        <div className="flex flex-col gap-4">
          {filteredProducts.map((product) => {
            const isLiked = favorites.has(product.id);
            const isOwner = currentUser && product.sellerId === currentUser.id;

            return (
              <div 
                key={product.id}
                className="bg-surface border border-border rounded-3xl p-4 sm:p-5 transition-all duration-300 hover:border-[#EB712B]/40 hover:shadow-xl group flex flex-col md:flex-row items-stretch md:items-center gap-5 md:gap-6 relative overflow-hidden"
              >
                {/* Product Thumbnail with Badges & Favorite */}
                <div className="relative w-full md:w-56 h-48 md:h-40 rounded-2xl overflow-hidden bg-main-bg border border-border shrink-0 flex items-center justify-center group/img">
                  <ProductCardImage 
                    src={product.image} 
                    alt={product.name}
                    fallbackSrc={getMarketplaceFallbackImage(product.name)}
                  />
                  
                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className={`absolute top-3 right-3 w-8 h-8 bg-surface/85 backdrop-blur-md border rounded-xl flex items-center justify-center transition-all cursor-pointer z-10 ${
                      isLiked 
                        ? "text-red-500 border-red-500/30 bg-red-500/10" 
                        : "text-text-muted border-border hover:text-red-500 hover:border-red-500/20"
                    }`}
                  >
                    <Heart 
                      size={14} 
                      className={`transition-transform hover:scale-115 ${isLiked ? "fill-red-500 scale-110" : ""}`} 
                    />
                  </button>

                  {/* Condition Tag on Image */}
                  <div className="absolute bottom-3 left-3 z-10">
                    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                      product.condition === "NEW" 
                        ? "bg-[#112217]/90 text-green-400 border-green-500/30" 
                        : "bg-[#251912]/90 text-[#EB712B] border-[#EB712B]/30"
                    }`}>
                      {product.condition === "NEW" ? <Trans>New Condition</Trans> : <Trans>Pre-Owned</Trans>}
                    </span>
                  </div>
                </div>

                {/* Center Content: Title, Description, Seller & Location */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1 gap-2.5">
                  <div>
                    {/* Location Badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider bg-main-bg border border-border px-2.5 py-1 rounded-lg">
                        <MapPin size={11} className="text-[#EB712B] shrink-0" />
                        <span className="truncate max-w-[200px]">{product.location}</span>
                      </div>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        • <Trans>Verified Rider Gear</Trans>
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-text-main group-hover:text-[#EB712B] transition-colors truncate">
                      {product.name}
                    </h3>

                    {/* Description Preview */}
                    <p className="text-xs text-text-muted/80 line-clamp-2 leading-relaxed mt-1.5 font-medium">
                      {product.description || <Trans>Authentic gear listed by community member. Inquire with seller directly for specifications, sizing, and pickup options.</Trans>}
                    </p>
                  </div>

                  {/* Seller Attribution Line */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                    {product.sellerAvatar ? (
                      <img
                        src={product.sellerAvatar}
                        alt={product.sellerName || "Seller"}
                        className="w-5 h-5 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-main-bg border border-border flex items-center justify-center text-[9px] font-black text-text-muted shrink-0">
                        {product.sellerName?.charAt(0) || "U"}
                      </div>
                    )}
                    <span className="text-[11px] font-semibold text-text-muted truncate">
                      <Trans>Listed by</Trans> <span className="text-text-main font-bold">{product.sellerName}</span>
                    </span>
                  </div>
                </div>

                {/* Right Action & Pricing Column */}
                <div className="shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-border/70 md:pl-6 min-w-[200px]">
                  <div className="text-left md:text-right">
                    <span className="text-[9px] font-black uppercase tracking-wider text-text-muted block">
                      <Trans>Listing Price</Trans>
                    </span>
                    <span className="text-2xl font-black tracking-tight text-[#EB712B]">
                      {product.price}
                    </span>
                  </div>

                  <div className="w-full sm:w-auto md:w-full flex items-center gap-2">
                    {isOwner ? (
                      <>
                        <button 
                          onClick={() => setSharingItemId(Number(product.id))}
                          className="flex-1 py-3 px-3 bg-surface hover:bg-hover border border-border text-text-main text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 outline-none"
                        >
                          <Share2 size={13} /> <Trans>Share</Trans>
                        </button>
                        <button 
                          onClick={(e) => handleDelete(product.id, e)}
                          disabled={isDeleting}
                          className="py-3 px-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-red-500 rounded-xl transition-colors cursor-pointer outline-none flex items-center justify-center"
                          title={t`Delete listing`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleBuyNow(product)}
                        className="w-full py-3 px-6 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer border-0 outline-none shadow-md shadow-[#EB712B]/20 flex items-center justify-center gap-2"
                      >
                        <Trans>Buy Now</Trans>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MODERN GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isLiked = favorites.has(product.id);
            const isOwner = currentUser && product.sellerId === currentUser.id;

            return (
              <div 
                key={product.id}
                className="bg-surface border border-border rounded-3xl p-4 transition-all duration-300 hover:border-[#EB712B]/40 hover:-translate-y-1 hover:shadow-xl group flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Image with Badges & Favorite */}
                  <div className="relative w-full aspect-[4/3] bg-main-bg rounded-2xl overflow-hidden border border-border flex items-center justify-center group/img shrink-0">
                    <ProductCardImage 
                      src={product.image} 
                      alt={product.name}
                      fallbackSrc={getMarketplaceFallbackImage(product.name)}
                    />
                    
                    <button 
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className={`absolute top-3 right-3 w-8 h-8 bg-surface/85 backdrop-blur-md border rounded-xl flex items-center justify-center transition-all cursor-pointer z-10 ${
                        isLiked 
                          ? "text-red-500 border-red-500/30 bg-red-500/10" 
                          : "text-text-muted border-border hover:text-red-500 hover:border-red-500/20"
                      }`}
                    >
                      <Heart 
                        size={14} 
                        className={`transition-transform hover:scale-115 ${isLiked ? "fill-red-500 scale-110" : ""}`} 
                      />
                    </button>

                    <div className="absolute bottom-3 left-3 z-10">
                      <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md border ${
                        product.condition === "NEW" 
                          ? "bg-[#112217]/90 text-green-400 border-green-500/30" 
                          : "bg-[#251912]/90 text-[#EB712B] border-[#EB712B]/30"
                      }`}>
                        {product.condition === "NEW" ? <Trans>New</Trans> : <Trans>Used</Trans>}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 px-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-black uppercase tracking-tight text-text-main group-hover:text-[#EB712B] transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <span className="text-base font-black tracking-tight text-[#EB712B] shrink-0">
                        {product.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                      <MapPin size={12} className="shrink-0 text-[#EB712B]" />
                      <span className="truncate">{product.location}</span>
                    </div>

                    {product.sellerName && (
                      <div className="flex items-center gap-1.5 text-[10px] text-text-muted font-semibold pt-1 border-t border-border/50">
                        <span className="text-text-muted"><Trans>By</Trans></span>
                        <span className="text-text-main font-bold truncate">{product.sellerName}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="w-full mt-4 pt-3 border-t border-border/60">
                  {isOwner ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSharingItemId(Number(product.id))}
                        className="flex-1 py-2.5 bg-surface hover:bg-hover border border-border text-text-main text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 outline-none"
                      >
                        <Share2 size={13} /> <Trans>Share</Trans>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(product.id, e)}
                        disabled={isDeleting}
                        className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-red-500 rounded-xl transition-colors cursor-pointer outline-none flex items-center justify-center"
                        title={t`Delete listing`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleBuyNow(product)}
                      className="w-full py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0 outline-none shadow-md shadow-[#EB712B]/20"
                    >
                      <Trans>Buy Now</Trans>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* Success Pop Up */}
      {showSuccess && (
        <SuccessModal 
          itemName={purchasedItemName} 
          onClose={() => setShowSuccess(false)} 
        />
      )}

      {/* Create Listing Modal */}
      {showAddModal && activeClubId && (
        <AddListingModal 
          activeClubId={Number(activeClubId)} 
          onClose={() => setShowAddModal(false)} 
        />
      )}

      {/* Share/Cross-post Modal */}
      {sharingItemId !== null && (
        <ShareListingModal 
          itemId={sharingItemId} 
          onClose={() => setSharingItemId(null)} 
        />
      )}

    </div>
  );
}