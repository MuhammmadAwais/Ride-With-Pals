import { useState } from 'react';
import { Plus, Search, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Shared database for Active items fallback
const SHARED_ACTIVE_DISCOUNTS: any[] = [];

// Organizer Expired Database fallback
const EXPIRED_DISCOUNTS: any[] = [];

// Reusable Coupon Card matching UI specs
const CouponCard = ({ title, code, expiry, description, percentage }: any) => (
  <div className="group relative bg-surface border border-border rounded-3xl p-5 md:p-6 overflow-hidden transition-all duration-500 hover:border-[#EB712B]/30 shadow-xl">
    <div className="absolute inset-0 bg-gradient-to-br from-[#EB712B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative z-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hover flex items-center justify-center border border-border">
            <span className="text-lg">🏷️</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-text-main text-sm truncate">{title}</h3>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Promotion</p>
          </div>
        </div>
        <div className="bg-[#EB712B]/10 px-3 py-1 rounded-full border border-[#EB712B]/20 shrink-0 flex items-center">
          <span className="text-[#EB712B] text-[10px] font-black uppercase tracking-wider">{percentage || 20}% OFF</span>
        </div>
      </div>
    
      {/* Code & Expiry */}
      <div className="bg-main-bg p-4 rounded-2xl border border-border mb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="min-w-0">
            <p className="text-[9px] text-text-muted uppercase font-bold mb-0.5">Promo Code</p>
            <span className="font-mono text-sm font-bold text-text-main tracking-widest block truncate">{code}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] text-text-muted uppercase font-bold mb-0.5">Expires</p>
            <span className="text-xs font-medium text-red-700">{expiry}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <h4 className="text-[10px] font-bold text-text-main uppercase tracking-wider mb-2">Description</h4>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2 md:line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  </div>
);

interface DiscountProps {
  role?: "organizer" | "athlete";
  clubId?: string | number;
}

import { useEffect } from 'react';
import { ShopService, ClubService } from '@/api/backendApi';

const Discount: React.FC<DiscountProps> = ({ role = "organizer", clubId }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [discounts, setDiscounts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDiscounts = async () => {
      let clubIdStr = clubId ? String(clubId) : localStorage.getItem("selectedClubId");
      if (!clubIdStr) {
        try {
          const clubsRes = await ClubService.getJoinedClubs();
          const clubs = clubsRes?.response?.data || clubsRes?.data || clubsRes || [];
          if (clubs.length > 0) {
            clubIdStr = clubs[0].id.toString();
            localStorage.setItem("selectedClubId", clubIdStr);
          }
        } catch (e) {
          console.error("Failed to fetch user's joined clubs for discounts", e);
        }
      }
      if (!clubIdStr) return;
      try {
        const res = await ShopService.getClubDiscounts({ clubId: Number(clubIdStr), search: searchQuery });
        const items = res?.response?.data || res?.data || res || [];
        const mapped = items.map((d: any) => ({
          id: d.id,
          title: d.title,
          code: d.discountCode,
          expiry: d.validTill ? new Date(d.validTill).toLocaleDateString() : 'N/A',
          description: d.description,
          isActive: d.isActive,
          percentage: d.discountPercentage
        }));
        setDiscounts(mapped);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDiscounts();
  }, [searchQuery]);

  const activeDiscounts = discounts.filter(d => d.isActive !== false);
  const expiredDiscounts = discounts.filter(d => d.isActive === false);

  const filteredActivePromos = activeDiscounts;

  // ==========================================
  // ATHLETE INTERFACE VIEW (Promo Wallet & Public Club View)
  // ==========================================
  if (role === "athlete") {
    return (
      <div className="px-4 py-8 md:p-8 min-h-screen text-text-main w-full font-sans select-none">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-border pb-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-text-main flex items-center gap-3">
                <Sparkles className="text-[#eb712a]" size={28} /> Discount
              </h1>
              <p className="text-text-muted text-xs md:text-sm max-w-lg leading-relaxed">
                Active promotional discounts ready to be applied at your ride checkout.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search promo codes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-border pl-11 pr-4 py-3 rounded-xl text-xs font-bold text-text-main placeholder-text-muted focus:outline-none focus:border-[#EB712B]/40 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
            {filteredActivePromos.length > 0 ? (
              filteredActivePromos.map((promo) => (
                <CouponCard key={promo.id} {...promo} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-border rounded-3xl">
                <AlertCircle size={36} className="text-text-muted animate-pulse" />
                <p className="text-xs font-bold text-text-muted">No promo codes found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CLUB MANAGEMENT / ORGANIZER VIEW
  // ==========================================
  const discountsToDisplay = activeTab === 'active' ? activeDiscounts : expiredDiscounts;

  return (
    <div className="px-4 py-8 md:p-8 min-h-screen text-text-main font-sans select-none w-full">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 max-w-7xl mx-auto border-b border-border pb-6">
        <div className="w-full lg:w-auto space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
            <Tag className="text-[#eb712a]" size={28} /> Discounts & Promotions
          </h1>
          <p className="text-text-muted text-xs md:text-sm max-w-lg leading-relaxed">
            Configure and monitor high-performance campaign protocols.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Tab */}
          <div className="flex bg-surface p-1 rounded-full border border-border w-full lg:w-auto overflow-hidden">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 lg:px-8 py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'active' 
                  ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`flex-1 lg:px-8 py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'expired' 
                  ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Expired
            </button>
          </div>
          
          {/* Add Discount Button */}
          <button 
            onClick={() => navigate('/discount/add')} 
            className="flex items-center gap-2 bg-[#EB712B] text-white px-5 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 cursor-pointer hover:bg-[#d66525]"
          >
            <div className="bg-black/10 p-0.5 rounded-full">
              <Plus size={14} strokeWidth={3} />
            </div>
            Add Discount
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
        {discountsToDisplay.map((item: any) => (
          <CouponCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Discount;
