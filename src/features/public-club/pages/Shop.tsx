import React, { useState, useEffect } from "react";
import { Heart, MapPin, Grid3X3, List, Search, Filter, ShoppingBag, X, CheckCircle2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  location: string;
  image: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "S-Works Prevail 3 Helmet",
    price: "$250",
    location: "San Francisco, CA",
    image: "/Images/HelmetImage4.jpg" 
  },
  {
    id: "2",
    name: "Cycling Jeresy",
    price: "$45",
    location: "Austin, TX",
    image: "/Images/Jeresy (1).jpg" 
  },
  {
    id: "3",
    name: "Pro Grip Elite Gloves",
    price: "$80",
    location: "London, UK",
    image: "/Images/cyclingGloveImage.png" 
  },
  {
    id: "4",
    name: "Carbon Fiber Pro Bike",
    price: "$2,500",
    location: "Seattle, WA",
    image: "/Images/CycleImage.png"
  },
  {
    id: "5",
    name: "Speed Glasses",
    price: "$35",
    location: "Portland, OR",
    image: "/Images/SpeedGlassesImage.jpg"
  },
  {
    id: "6",
    name: "Aero Helmet V2",
    price: "$120",
    location: "Denver, CO",
    image: "/Images/headImage.png"
  }
];

interface ShopProps {
  clubId?: string;
}

export default function Shop({ }: ShopProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for tracking favorites by product ID
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Track images that fail to load so we can show a fallback placeholder
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Modal state for Buy Now interaction
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // State for professional order success screen
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-close success screen after 2.5 seconds and close modal
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setSelectedProduct(null);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Toggle favorite status for a product
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

  // Filter products based on the search query (filters by name or location)
  const filteredProducts = MOCK_PRODUCTS.filter((product) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 w-full">
      
      {/* Header Section: Title & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-text-main">
            Premium Equipment
          </h1>
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted mt-1.5">
            Showing {filteredProducts.length} items from elite verified sellers
          </p>
        </div>

        {/* Controls: Search, Filter, & View Toggles */}
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
                viewMode === "grid" 
                  ? "bg-hover text-text-main" 
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <Grid3X3 size={16} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                viewMode === "list" 
                  ? "bg-hover text-text-main" 
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid / List */}
      {filteredProducts.length === 0 ? (
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
            return (
              <div 
                key={product.id}
                className={`bg-surface border border-border rounded-3xl p-4 space-y-4 transition-all duration-300 hover:border-[#EB712B]/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[#EB712B]/5 flex flex-col justify-between ${
                  viewMode === "list" ? "sm:flex-row sm:items-center sm:gap-6 sm:space-y-0 p-4" : ""
                }`}
              >
                {/* Product Image Wrapper */}
                <div className={`relative bg-main-bg rounded-2xl overflow-hidden border border-border flex items-center justify-center group shrink-0 ${
                  viewMode === "list" ? "w-28 h-28 aspect-square" : "w-full aspect-[4/3]"
                }`}>
                  {imageErrors[product.id] ? (
                    // Fallback placeholder if image fails to load
                    <div className="w-full h-full bg-main-bg flex flex-col items-center justify-center gap-1.5 text-text-muted">
                      <span className="font-black text-[10px] uppercase tracking-wider">Premium Gear</span>
                    </div>
                  ) : (
                    // Actual Image rendered properly
                    <img 
                      src={product.image} 
                      alt={product.name}
                      onError={() => handleImageError(product.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  
                  {/* Favorite/Like Heart */}
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

                {/* Product Info */}
                <div className={`space-y-3 flex-1 px-1 flex flex-col justify-between h-full ${viewMode === "list" ? "space-y-1" : ""}`}>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-black uppercase tracking-tight text-text-main line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                      <span className="text-base font-black tracking-tight text-[#EB712B] shrink-0">
                        {product.price}
                      </span>
                    </div>

                    {/* Small modified button sitting inline with the location */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-wider truncate max-w-[60%]">
                        <MapPin size={12} className="shrink-0 text-text-muted" />
                        <span className="truncate">{product.location}</span>
                      </div>
                      
                      <button 
                        onClick={() => setSelectedProduct(product)}
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

      {/* Checkout/Buy Now Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-main-bg/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-border rounded-3xl p-6 relative shadow-2xl space-y-6">
            
            {/* Conditional Display: Success Screen vs Purchase Screen */}
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center animate-fade-in">
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
              <>
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-5 right-5 text-text-muted hover:text-text-main cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>

                <div>
                  <h2 className="text-lg font-black uppercase tracking-wider text-text-main pr-6">Complete Purchase</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mt-1">Review your item and proceed to checkout</p>
                </div>

                {/* Selected Product Summary */}
                <div className="flex gap-4 bg-main-bg p-3 rounded-2xl border border-border items-center">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    className="w-16 h-16 object-cover rounded-xl border border-border shrink-0"
                  />
                  <div className="overflow-hidden space-y-1">
                    <h3 className="text-xs font-bold uppercase text-text-main truncate">{selectedProduct.name}</h3>
                    <span className="text-[10px] font-extrabold text-[#EB712B] block">{selectedProduct.price}</span>
                  </div>
                </div>

                {/* Payment Details / Disclaimer */}
                <div className="bg-[#EB712B]/5 border border-[#EB712B]/10 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-black text-[#EB712B] uppercase tracking-wider block">Secured Checkout</span>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    You are purchasing <strong>{selectedProduct.name}</strong> from a verified elite seller. 
                    Your payment method will be charged securely.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="flex-1 py-3.5 bg-hover hover:bg-white/10 border border-border rounded-2xl text-xs font-extrabold text-text-muted uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      // Trigger professional success UI display
                      setIsSuccess(true);
                    }}
                    className="flex-1 py-3.5 bg-[#EB712B] hover:bg-[#d05c1c] text-white rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer transition-all shadow-lg shadow-[#EB712B]/20"
                  >
                    Pay {selectedProduct.price}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}