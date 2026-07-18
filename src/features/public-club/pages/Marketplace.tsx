import React, { useState, useMemo, useRef } from "react";
import { Heart, MapPin, Grid3X3, List, Search, Filter, Plus, Trash2, Share2, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/hooks/useAppSelector";
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
            <p className="text-[9px] font-black uppercase tracking-wider text-[#69B475]">Premium Marketplace</p>
            <h3 className="text-base font-black tracking-tight text-text-main">Order Confirmed!</h3>
          </div>
        </div>

        <p className="text-xs font-medium text-text-muted leading-relaxed">
          Thank you for your purchase of the <span className="font-black text-text-main">{itemName}</span>. Your transaction is successful, and a confirmation email has been sent. Your professional gear will ship soon!
        </p>

        <button 
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#69B475] hover:bg-[#589762] text-[#0D1310] text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg border-0 outline-none"
        >
          Return to Marketplace
        </button>
      </div>
    </div>
  );
}

// ── PURCHASE MODAL SUB-COMPONENT ──────────────────────────────────────────────
interface PurchaseModalProps {
  item: Product;
  onCancel: () => void;
  onConfirm: (itemName: string) => void;
}

function PurchaseModal({ item, onCancel, onConfirm }: PurchaseModalProps) {
  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-md relative border border-border shadow-2xl">
        
        <div className="relative w-full h-48 bg-main-bg rounded-2xl overflow-hidden border border-border mb-5 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4 justify-between">
            <span className="text-base font-black text-white tracking-tight line-clamp-1">{item.name}</span>
            <span className="text-lg font-black text-[#EB712B] shrink-0">{item.price}</span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-surface border border-border rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <img 
              src={item.sellerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerName}`} 
              alt={item.sellerName} 
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Sold by</p>
              <h4 className="text-xs font-black uppercase tracking-tight text-text-main">{item.sellerName || "Elite Seller"}</h4>
            </div>
          </div>
          <div className="w-9 h-9 bg-hover rounded-xl border border-border flex items-center justify-center text-text-muted cursor-pointer hover:bg-border transition-colors">
            💬
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-text-muted">Description</h5>
          <p className="text-[11px] font-medium text-text-muted leading-relaxed max-h-20 overflow-y-auto pr-2">
            {item.description || "No detailed description provided for this premium gear."}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl bg-surface hover:bg-hover border border-border text-text-main text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer outline-none"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(item.name)}
            className="flex-1 py-3.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg shadow-[#EB712B]/20 border-0 outline-none"
          >
            Pay {item.price}
          </button>
        </div>
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
      toast.error("Please enter a product name.");
      return;
    }
    if (!price || Number(price) <= 0) {
      toast.error("Please enter a valid price.");
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

      toast.success("Listing created successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create listing.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <form onSubmit={handleSubmit} className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-lg relative border border-border shadow-2xl space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-wider text-text-main">Create Listing</h3>
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
                <span className="text-[10px] text-text-muted font-bold">{isUploading ? "Uploading..." : "Upload Product Image"}</span>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Product Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
                placeholder="e.g. Carbon Helmet"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Price (USD)</label>
              <input 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main"
                placeholder="e.g. 150"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Condition</label>
              <select 
                value={condition} 
                onChange={(e) => setCondition(e.target.value as "NEW" | "USED")} 
                className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs text-text-main outline-none focus:border-[#EB712B]"
              >
                <option value="USED">Used</option>
                <option value="NEW">New</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted block mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3} 
              className="w-full bg-main-bg border border-border rounded-xl p-3 text-xs outline-none focus:border-[#EB712B] text-text-main resize-none"
              placeholder="Provide a detailed description of the gear condition, sizing, etc."
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
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isAdding || isUploading}
            className="flex-1 py-3.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg flex items-center justify-center gap-2 border-0 outline-none disabled:opacity-50"
          >
            {(isAdding || isUploading) && <Loader2 size={16} className="animate-spin" />}
            {isAdding || isUploading ? "Publishing..." : "Publish Listing"}
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
      toast.success("Shared successfully to the club bulletin board!");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to share listing.");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-main-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-surface text-text-main rounded-3xl p-6 w-full max-w-sm relative border border-border shadow-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black uppercase tracking-wider text-text-main">Cross-post Listing</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-main border-0 bg-transparent cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-text-muted">Select one of your joined clubs to share this listing onto their marketplace stream.</p>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {isLoadingClubs ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 size={24} className="animate-spin text-[#EB712B]" />
            </div>
          ) : clubs.length === 0 ? (
            <div className="text-center py-6 text-xs text-text-muted">You haven't joined any other clubs yet.</div>
          ) : (
            clubs.map((c: any) => (
              <button
                key={c.id}
                onClick={() => handleShare(c.id)}
                disabled={isSharing}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-main-bg border border-border hover:border-[#EB712B]/40 transition-colors text-left cursor-pointer outline-none disabled:opacity-50"
              >
                <img src={c.logo || "/Images/CycleImage.png"} alt={c.clubName} className="w-8 h-8 rounded-lg object-cover border border-border" />
                <span className="text-xs font-bold text-text-main truncate">{c.clubName}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN MARKETPLACE COMPONENT ────────────────────────────────────────────────
export default function Marketplace({ clubId: propClubId }: MarketplaceProps) {
  const [activeTab, setActiveTab] = useState<"All" | "MyListings">("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [purchasingItem, setPurchasingItem] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedItemName, setPurchasedItemName] = useState("");

  // Create Listing Form state
  const [showAddModal, setShowAddModal] = useState(false);
  // Share state
  const [sharingItemId, setSharingItemId] = useState<number | null>(null);

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

    return rawRows.map((item) => ({
      id: item.id.toString(),
      name: item.productName || "Unknown Item",
      price: item.price ? `$${parseFloat(item.price).toFixed(2)}` : "Free",
      condition: (item.condition?.toUpperCase() === "NEW" ? "NEW" : "USED") as "NEW" | "USED",
      location: item.club?.clubName || "Global Marketplace",
      image: item.image || "/Images/HelmetImage4.jpg",
      sellerId: item.sellerId,
      sellerName: item.seller?.fullName || "Elite Seller",
      sellerAvatar: item.seller?.profileImage || undefined,
      description: item.description,
    }));
  }, [marketplaceResponse, ownListingsResponse, activeTab]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

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
      toast.success("Listing deleted successfully!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete listing.");
      console.error(err);
    }
  };

  const filteredProducts = products.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmPurchase = (itemName: string) => {
    setPurchasedItemName(itemName);
    setPurchasingItem(null);
    setShowSuccess(true);
  };

  // ── Skeletons ──────────────────────────────────────────────────────────────
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

  return (
    <div className="space-y-8 w-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-text-main">
            Premium Equipment
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted mt-1.5">
            Showing {filteredProducts.length} items from elite verified sellers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search gear or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-surface border border-border rounded-2xl text-xs font-medium text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-colors"
            />
          </div>

          <button className="h-10 px-4 bg-surface border border-border hover:border-text-muted rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted transition-all cursor-pointer">
            <Filter size={14} /> Filter
          </button>

          <div className="flex bg-surface border border-border rounded-2xl p-1.5 gap-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "grid" ? "bg-hover text-text-main" : "text-text-muted hover:text-text-main"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "list" ? "bg-hover text-text-main" : "text-text-muted hover:text-text-main"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs and Actions Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="bg-surface p-1 rounded-xl border border-border flex shrink-0">
          <button 
            onClick={() => setActiveTab("All")} 
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === "All" ? "bg-[#EB712B] text-white" : "text-text-muted hover:text-text-main bg-transparent"}`}
          >
            All Gear
          </button>
          <button 
            onClick={() => setActiveTab("MyListings")} 
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 outline-none ${activeTab === "MyListings" ? "bg-[#EB712B] text-white" : "text-text-muted hover:text-text-main bg-transparent"}`}
          >
            My Listings
          </button>
        </div>

        {activeClubId && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 border-0 outline-none shadow-md shadow-[#EB712B]/10"
          >
            <Plus size={16} /> Add Listing
          </button>
        )}
      </div>

      {/* Product List */}
      {isLoading ? (
        <GridSkeleton />
      ) : isError ? (
        <div className="text-center py-12 bg-surface border border-border rounded-3xl text-red-500 font-bold text-xs uppercase tracking-wider">
          Failed to load marketplace listings. Please try again.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-3xl">
          <p className="text-sm font-bold text-text-muted uppercase tracking-wider">No equipment found matching your search</p>
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-4"
        }>
          {filteredProducts.map((product) => {
            const isLiked = favorites.has(product.id);
            const isOwner = currentUser && product.sellerId === currentUser.id;

            return (
              <div 
                key={product.id}
                className={`bg-surface border border-border rounded-3xl p-4 transition-all duration-300 hover:border-[#EB712B]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#EB712B]/5 flex flex-col justify-between ${
                  viewMode === "list" ? "flex !flex-row items-center gap-6 space-y-0 p-4" : "space-y-4"
                }`}
              >
                <div className={`flex gap-4 w-full ${viewMode === "list" ? "!flex-row !w-auto !items-center" : "flex-col"}`}>
                  <div className={`relative bg-main-bg rounded-2xl overflow-hidden border border-border flex items-center justify-center group shrink-0 ${
                    viewMode === "list" ? "w-28 h-28 aspect-square" : "w-full aspect-[4/3]"
                  }`}>
                    {imageErrors[product.id] ? (
                      <div className="w-full h-full bg-surface flex flex-col items-center justify-center gap-1.5 text-text-muted">
                        <span className="font-black text-[10px] uppercase tracking-wider">Premium Gear</span>
                      </div>
                    ) : (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        onError={() => handleImageError(product.id)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    
                    <button 
                      onClick={(e) => toggleFavorite(product.id, e)}
                      className={`absolute top-3 right-3 w-8 h-8 bg-surface/80 backdrop-blur-md border rounded-xl flex items-center justify-center transition-all cursor-pointer group/btn shadow-md ${
                        isLiked 
                          ? "text-red-500 border-red-500/30 bg-red-500/10" 
                          : "text-text-muted border-border hover:text-red-500 hover:border-red-500/20"
                      }`}
                    >
                      <Heart 
                        size={14} 
                        className={`transition-transform group-hover/btn:scale-115 ${isLiked ? "fill-red-500 scale-110" : ""}`} 
                      />
                    </button>
                  </div>

                  <div className={`space-y-3 flex-1 px-1 w-full ${viewMode === "list" ? "space-y-1 border-t-0 pt-0" : ""}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-text-main line-clamp-1">
                          {product.name}
                        </h3>
                        <span className={`inline-block text-[8px] font-black tracking-wider px-2.5 py-1 rounded-lg border mt-2 ${
                          product.condition === "NEW" 
                            ? "bg-green-500/5 text-green-400 border-green-500/20" 
                            : "bg-[#EB712B]/5 text-[#EB712B] border-[#EB712B]/20"
                        }`}>
                          {product.condition}
                        </span>
                      </div>
                      <span className="text-base font-black tracking-tight text-[#EB712B] shrink-0">
                        {product.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider pt-3 border-t border-border">
                      <MapPin size={12} className="shrink-0 text-text-muted" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-2 ${viewMode === "list" ? "max-w-[280px] shrink-0" : "w-full mt-4"}`}>
                  {isOwner ? (
                    <>
                      <button 
                        onClick={() => setSharingItemId(Number(product.id))}
                        className="flex-1 py-3 bg-surface hover:bg-hover border border-border text-text-main text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 outline-none"
                      >
                        <Share2 size={14} /> Share
                      </button>
                      <button 
                        onClick={(e) => handleDelete(product.id, e)}
                        disabled={isDeleting}
                        className="py-3 px-4 bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-red-500 rounded-xl transition-colors cursor-pointer outline-none flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => setPurchasingItem(product)}
                      className="w-full py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer border-0 outline-none"
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Primary Payment Modal */}
      {purchasingItem && (
        <PurchaseModal 
          item={purchasingItem}
          onCancel={() => setPurchasingItem(null)}
          onConfirm={confirmPurchase}
        />
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