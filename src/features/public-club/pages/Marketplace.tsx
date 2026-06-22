import React, { useState } from "react";
import { Heart, MapPin, Grid3X3, List, Search, Filter } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  condition: "NEW" | "USED";
  location: string;
  image: string;
  sellerName?: string;
  sellerAvatar?: string;
  description?: string;
}

// Mock Data enriched with seller info and descriptions
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "S-Works Prevail 3 Helmet",
    price: "$250",
    condition: "NEW",
    location: "San Francisco, CA",
    image: "/Images/HelmetImage4.jpg",
    sellerName: "Jane Doe",
    sellerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    description: "Lightly used premium cycling helmet, optimized for aerodynamics, comfort, and maximum ventilation during intense rides. Excellent condition, no crashes."
  },
  {
    id: "2",
    name: "Aero Hydro Stealth XL",
    price: "$45",
    condition: "USED",
    location: "Austin, TX",
    image: "/Images/WaterBottle.jpg",
    sellerName: "Robert Fox",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    description: "Aero Hydro insulated water bottle designed to retain cold temperatures on long cycling tours. Matte stealth finish, minor scuffs on the base but fully functional."
  },
  {
    id: "3",
    name: "Pro Grip Elite Gloves",
    price: "$80",
    condition: "NEW",
    location: "London, UK",
    image: "/Images/Glove.jpg",
    sellerName: "Eleanor Pena",
    sellerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    description: "High-performance breathable cycling gloves with gel-padded palms for superior grip and vibration dampening. Brand new with tags attached."
  }
];

interface MarketplaceProps {
  clubId?: string;
}

// ==========================================
// 1. SUCCESS CONFIRMATION MODAL
// ==========================================
interface SuccessModalProps {
  itemName: string;
  onClose: () => void;
}

function SuccessModal({ itemName, onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#1C1C1C] text-white rounded-3xl p-6 w-full max-w-sm relative border border-white/10 shadow-2xl space-y-4">
        {/* Success Icon / Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1F3326] border border-[#4E9F6D]/30 rounded-2xl flex items-center justify-center text-[#69B475]">
            ✓
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wider text-[#69B475]">Premium Marketplace</p>
            <h3 className="text-base font-black tracking-tight text-white">Order Confirmed!</h3>
          </div>
        </div>

        {/* Message body */}
        <p className="text-xs font-medium text-gray-300 leading-relaxed">
          Thank you for your purchase of the <span className="font-black text-white">{itemName}</span>. Your transaction is successful, and a confirmation email has been sent. Your professional gear will ship soon!
        </p>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-[#69B475] hover:bg-[#589762] text-[#0D1310] text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg"
        >
          Return to Marketplace
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 2. PURCHASE MODAL SUB-COMPONENT
// ==========================================
interface PurchaseModalProps {
  item: Product;
  onCancel: () => void;
  onConfirm: (itemName: string) => void;
}

function PurchaseModal({ item, onCancel, onConfirm }: PurchaseModalProps) {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#121212] text-white rounded-3xl p-6 w-full max-w-md relative border border-white/10 shadow-2xl">
        
        {/* Item Showcase Banner */}
        <div className="relative w-full h-48 bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 mb-5 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4 justify-between">
            <span className="text-base font-black text-white tracking-tight line-clamp-1">{item.name}</span>
            <span className="text-lg font-black text-[#EB712B] shrink-0">{item.price}</span>
          </div>
        </div>

        {/* Seller / Profile Info */}
        <div className="flex items-center justify-between bg-[#181818] border border-white/5 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <img 
              src={item.sellerAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.sellerName}`} 
              alt={item.sellerName} 
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Sold by</p>
              <h4 className="text-xs font-black uppercase tracking-tight text-white">{item.sellerName || "Elite Seller"}</h4>
            </div>
          </div>
          <div className="w-9 h-9 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-white/10 transition-colors">
            💬
          </div>
        </div>

        {/* Description Block */}
        <div className="space-y-2 mb-6">
          <h5 className="text-[10px] font-black uppercase tracking-wider text-gray-400">Description</h5>
          <p className="text-[11px] font-medium text-gray-300 leading-relaxed max-h-20 overflow-y-auto pr-2">
            {item.description || "No detailed description provided for this premium gear."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl bg-[#1A1A1A] hover:bg-[#242424] border border-white/10 text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(item.name)}
            className="flex-1 py-3.5 rounded-xl bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black tracking-wider uppercase transition-colors cursor-pointer shadow-lg shadow-[#EB712B]/20"
          >
            Pay {item.price}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN MARKETPLACE COMPONENT
// ==========================================
export default function Marketplace({ }: MarketplaceProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [purchasingItem, setPurchasingItem] = useState<Product | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [purchasedItemName, setPurchasedItemName] = useState("");

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

  const filteredProducts = MOCK_PRODUCTS.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmPurchase = (itemName: string) => {
    setPurchasedItemName(itemName);
    setPurchasingItem(null);
    setShowSuccess(true);
  };

  return (
    <div className="space-y-8 w-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white">
            Premium Equipment
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mt-1.5">
            Showing 1,248 items from elite verified sellers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search gear or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-[#141414] border border-white/5 rounded-2xl text-xs font-medium text-white placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-colors"
            />
          </div>

          <button className="h-10 px-4 bg-[#141414] border border-white/5 hover:border-white/15 rounded-2xl flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300 transition-all cursor-pointer">
            <Filter size={14} /> Filter
          </button>

          <div className="flex bg-[#141414] border border-white/5 rounded-2xl p-1.5 gap-1">
            <button 
              onClick={() => setViewMode("grid")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "grid" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "list" ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-[#141414] border border-white/5 rounded-3xl">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">No equipment found matching your search</p>
        </div>
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" 
            : "flex flex-col gap-4"
        }>
          {filteredProducts.map((product) => {
            const isLiked = favorites.has(product.id);
            return (
              <div 
                key={product.id}
                className={`bg-[#141414] border border-white/5 rounded-3xl p-4 transition-all duration-300 hover:border-[#EB712B]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#EB712B]/5 flex flex-col justify-between ${
                  viewMode === "list" ? "flex !flex-row items-center gap-6 space-y-0 p-4" : "space-y-4"
                }`}
              >
                <div className={`flex gap-4 w-full ${viewMode === "list" ? "!flex-row !w-auto !items-center" : "flex-col"}`}>
                  <div className={`relative aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center group shrink-0 ${
                    viewMode === "list" ? "w-28 h-28" : "w-full"
                  }`}>
                    {imageErrors[product.id] ? (
                      <div className="w-full h-full bg-[#161616] flex flex-col items-center justify-center gap-1.5 text-gray-500">
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
                      className={`absolute top-3 right-3 w-8 h-8 bg-[#141414]/80 backdrop-blur-md border rounded-xl flex items-center justify-center transition-all cursor-pointer group/btn shadow-md ${
                        isLiked 
                          ? "text-red-500 border-red-500/30 bg-red-500/10" 
                          : "text-gray-400 border-white/10 hover:text-red-500 hover:border-red-500/20"
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
                        <h3 className="text-xs font-black uppercase tracking-tight text-white line-clamp-1">
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

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-3 border-t border-white/5">
                      <MapPin size={12} className="shrink-0 text-gray-500" />
                      <span className="truncate">{product.location}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setPurchasingItem(product)}
                  className={`w-full py-3 bg-[#EB712B] hover:bg-[#d05c19] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                    viewMode === "list" ? "max-w-[160px] !mt-0 shrink-0" : "mt-4"
                  }`}
                >
                  Buy Now
                </button>
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

      {/* Success Success Pop Up */}
      {showSuccess && (
        <SuccessModal 
          itemName={purchasedItemName} 
          onClose={() => setShowSuccess(false)} 
        />
      )}

    </div>
  );
}