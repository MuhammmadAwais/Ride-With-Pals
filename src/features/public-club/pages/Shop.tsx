import React, { useState, useEffect, useMemo } from "react";
import { Heart, MapPin, Grid3X3, List, Search, Filter, ShoppingBag, X, CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { useGetTheShopItemsQuery } from "@/features/club/api/shopApiSlice";
import { useBuyShopItemMutation } from "@/features/club/api/shopOrderApiSlice";
import { useGetJoinedClubsQuery } from "@/features/club/api/clubApiSlice";
import type { ShopTypes } from "@/api/types";
import { useActiveClub } from "@/hooks/useActiveClub";
import { toast } from "sonner";

interface ShopProduct {
  id: string;
  name: string;
  price: string;
  rawPrice: number;
  location: string;
  image: string;
}

interface ShopProps {
  clubId?: string | number;
}

export default function Shop({ clubId: propClubId }: ShopProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Checkout form state
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [address, setAddress] = useState({ fullName: "", phone: "", street: "", city: "", postalCode: "", country: "" });

  const { clubId: activeClubIdRedux, setActiveClub } = useActiveClub();
  const resolvedClubId = propClubId || activeClubIdRedux;

  const { data: joinedClubsData } = useGetJoinedClubsQuery(undefined, {
    skip: !!resolvedClubId,
  });

  const activeClubId = useMemo(() => {
    if (resolvedClubId) return resolvedClubId;
    const firstJoined = joinedClubsData?.rows?.[0];
    if (firstJoined) {
      setActiveClub(firstJoined as any);
      return firstJoined.id;
    }
    return undefined;
  }, [resolvedClubId, joinedClubsData, setActiveClub]);

  const { data: shopData, isLoading, isError } = useGetTheShopItemsQuery(
    { clubId: activeClubId!, limit: 50, offset: 0 },
    { skip: !activeClubId }
  );

  const [buyShopItem, { isLoading: isBuying }] = useBuyShopItemMutation();

  // Map API rows → ShopProduct view model
  const products: ShopProduct[] = (shopData?.rows || []).map((item: ShopTypes.Row) => ({
    id: item.id.toString(),
    name: item.name || "Unknown Item",
    price: item.price ? `€${parseFloat(item.price as any).toFixed(2)}` : "Free",
    rawPrice: parseFloat(item.price as any) || 0,
    location: item.gender || "Club Store",
    image: item.image || "/Images/HelmetImage4.jpg",
  }));

  // Auto-close success screen after 2.5 s
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setSelectedProduct(null);
        setQuantity(1);
        setDeliveryMethod("pickup");
        setAddress({ fullName: "", phone: "", street: "", city: "", postalCode: "", country: "" });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBuy = async () => {
    if (!selectedProduct) return;
    if (deliveryMethod === "delivery" && (!address.fullName.trim() || !address.street.trim() || !address.city.trim())) {
      toast.error("Please fill in your delivery address.");
      return;
    }
    try {
      await buyShopItem({
        shopItemId: Number(selectedProduct.id),
        quantity,
        deliveryMethod,
        ...(deliveryMethod === "delivery" ? { orderAddress: address } : {}),
      }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to place order. Please try again.");
    }
  };

  // ── Skeletons ──────────────────────────────────────────────────────────────
  const ShopSkeleton = () => (
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

        {/* Controls */}
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
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${viewMode === "grid" ? "bg-hover text-text-main" : "text-text-muted hover:text-text-main"}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${viewMode === "list" ? "bg-hover text-text-main" : "text-text-muted hover:text-text-main"}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid / List */}
      {isLoading ? (
        <ShopSkeleton />
      ) : isError ? (
        <div className="text-center py-12 bg-surface border border-border rounded-3xl">
          <p className="text-sm font-bold text-red-400 uppercase tracking-wider">Failed to load shop items. Please try again.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-surface border border-border rounded-3xl">
          <p className="text-sm font-bold text-text-muted uppercase tracking-wider">No equipment found matching your search</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          {filteredProducts.map((product) => {
            const isLiked = favorites.has(product.id);
            return (
              <div
                key={product.id}
                className={`bg-surface border border-border rounded-3xl p-4 space-y-4 transition-all duration-300 hover:border-[#EB712B]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#EB712B]/5 flex flex-col justify-between ${viewMode === "list" ? "sm:flex-row sm:items-center sm:gap-6 sm:space-y-0 p-4" : ""}`}
              >
                {/* Product Image */}
                <div className={`relative bg-main-bg rounded-2xl overflow-hidden border border-border flex items-center justify-center group shrink-0 ${viewMode === "list" ? "w-28 h-28 aspect-square" : "w-full aspect-[4/3]"}`}>
                  {imageErrors[product.id] ? (
                    <div className="w-full h-full bg-main-bg flex flex-col items-center justify-center gap-1.5 text-text-muted">
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
                  {/* Favorite button */}
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className={`absolute top-3 right-3 w-8 h-8 bg-surface/80 backdrop-blur-md border rounded-xl flex items-center justify-center transition-all cursor-pointer group/btn shadow-md ${isLiked ? "text-red-500 border-red-500/30 bg-red-500/10" : "text-text-muted border-border hover:text-red-500 hover:border-red-500/20"}`}
                  >
                    <Heart size={14} className={`transition-transform group-hover/btn:scale-115 ${isLiked ? "fill-red-500 scale-110" : ""}`} />
                  </button>
                </div>

                {/* Product Info */}
                <div className={`space-y-3 flex-1 px-1 flex flex-col justify-between h-full ${viewMode === "list" ? "space-y-1" : ""}`}>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xs font-black uppercase tracking-tight text-text-main line-clamp-1">{product.name}</h3>
                      <span className="text-base font-black tracking-tight text-[#EB712B] shrink-0">{product.price}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider truncate max-w-[60%]">
                        <MapPin size={12} className="shrink-0 text-text-muted" />
                        <span className="truncate">{product.location}</span>
                      </div>
                      <button
                        onClick={() => { setSelectedProduct(product); setQuantity(1); setDeliveryMethod("pickup"); }}
                        className="py-1.5 px-3.5 bg-[#EB712B] hover:bg-[#d05c1c] text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#EB712B]/10 shrink-0"
                      >
                        <ShoppingBag size={11} /> Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 space-y-4 text-center">
                <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center text-green-400">
                  <CheckCircle2 size={32} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-black text-text-main uppercase tracking-wider">Order Confirmed!</h3>
                  <p className="text-xs font-medium text-text-muted mt-1.5">
                    Thank you for purchasing <strong className="text-[#EB712B]">{selectedProduct.name}</strong>.
                  </p>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider mt-4">Redirecting you back...</p>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-5 right-5 text-text-muted hover:text-text-main cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-text-main pr-8">Complete Purchase</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1">Review your order and checkout</p>
                </div>

                {/* Item summary */}
                <div className="flex gap-4 bg-main-bg p-3 rounded-2xl border border-border items-center">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-16 h-16 object-cover rounded-xl border border-border shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = '/Images/HelmetImage4.jpg'; }} />
                  <div className="overflow-hidden space-y-1">
                    <h3 className="text-xs font-bold uppercase text-text-main truncate">{selectedProduct.name}</h3>
                    <span className="text-[10px] font-extrabold text-[#EB712B] block">{selectedProduct.price}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-wider mb-2">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-8 h-8 rounded-xl bg-hover border border-border flex items-center justify-center cursor-pointer hover:border-[#EB712B]/30">
                      <Minus size={14} />
                    </button>
                    <span className="font-black text-text-main w-6 text-center">{quantity}</span>
                    <button onClick={() => setQuantity((q) => q + 1)} className="w-8 h-8 rounded-xl bg-hover border border-border flex items-center justify-center cursor-pointer hover:border-[#EB712B]/30">
                      <Plus size={14} />
                    </button>
                    <span className="text-xs text-text-muted ml-2">= <strong className="text-[#EB712B]">€{(selectedProduct.rawPrice * quantity).toFixed(2)}</strong></span>
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-wider mb-2">Delivery Method</p>
                  <div className="flex gap-2">
                    {(["pickup", "delivery"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setDeliveryMethod(m)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${deliveryMethod === m ? "bg-[#EB712B] text-white border-[#EB712B]" : "bg-main-bg border-border text-text-muted hover:border-[#EB712B]/30"}`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address fields (only for delivery) */}
                {deliveryMethod === "delivery" && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-wider">Delivery Address</p>
                    {[
                      { key: "fullName", placeholder: "Full Name" },
                      { key: "phone", placeholder: "Phone" },
                      { key: "street", placeholder: "Street & Number" },
                      { key: "city", placeholder: "City" },
                      { key: "postalCode", placeholder: "Postal Code" },
                      { key: "country", placeholder: "Country" },
                    ].map(({ key, placeholder }) => (
                      <input
                        key={key}
                        type="text"
                        placeholder={placeholder}
                        value={(address as any)[key]}
                        onChange={(e) => setAddress((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full bg-main-bg border border-border rounded-xl px-3 py-2 text-xs text-text-main outline-none focus:border-[#EB712B]/50 transition-all"
                      />
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-3.5 bg-hover hover:bg-white/10 border border-border rounded-2xl text-xs font-extrabold text-text-muted uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBuy}
                    disabled={isBuying}
                    className="flex-1 py-3.5 bg-[#EB712B] hover:bg-[#d05c1c] text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-[#EB712B]/20 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isBuying ? <Loader2 size={14} className="animate-spin" /> : null}
                    {isBuying ? "Placing Order..." : `Pay €${(selectedProduct.rawPrice * quantity).toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}