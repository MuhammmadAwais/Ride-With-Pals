import { useState } from 'react';
import { Plus, Search, Tag, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Shared database for Active items
const SHARED_ACTIVE_DISCOUNTS = [
  { id: 1, title: 'Rock Life Title', code: '5245J64', expiry: '20 Jan, 2026', description: 'Applicable on all premium membership tiers. Requires a minimum spend of $50.' },
  { id: 2, title: 'Summer Essentials', code: 'SUMMER20', expiry: '30 Aug, 2026', description: 'Get 20% off on all summer collection items. This offer is valid exclusively for premium members.' },
  { id: 3, title: 'Early Bird Access', code: 'BIRD26', expiry: '15 Feb, 2026', description: 'Early registration bonus for the upcoming 2026 annual gala.' },
  { id: 4, title: 'Weekend Special', code: 'WKND50', expiry: '10 Mar, 2026', description: 'Flat 50% discount on all weekend facility bookings.' },
  { id: 5, title: 'New Member Gift', code: 'WELCOME10', expiry: '01 Apr, 2026', description: 'A welcome gift for our newly registered members. Enjoy 10% off your first three purchases.' },
  { id: 6, title: 'Referral Bonus', code: 'REF500', expiry: '20 May, 2026', description: 'Refer a friend to join our club and receive a $500 credit toward your next subscription renewal.' },
  { id: 7, title: 'VIP Exclusive', code: 'VIPGOLD', expiry: '15 Jun, 2026', description: 'Special pricing for Gold tier members on luxury amenity rentals.' },
  { id: 8, title: 'Flash Sale', code: 'FLASH24', expiry: '05 Jul, 2026', description: 'Limited time flash sale valid for 24 hours only. Applicable on select inventory items.' },
  { id: 9, title: 'Monthly Reward', code: 'MONTHLY10', expiry: '30 Jul, 2026', description: 'Monthly loyalty reward for consistent club visitors.' },
];

// Organizer Expired Database
const EXPIRED_DISCOUNTS = [
  { id: 10, title: 'Old Winter Promo', code: 'WINTER10', expiry: '01 Jan, 2026', description: 'This promotion offered a flat 10% discount during the winter solstice event.' },
  { id: 11, title: 'Black Friday 2025', code: 'BLACKFRI25', expiry: '29 Nov, 2025', description: 'Expired site-wide discount code.' },
  { id: 12, title: 'Holiday Bash', code: 'PARTY2025', expiry: '25 Dec, 2025', description: 'End of year holiday party voucher.' },
  { id: 13, title: 'Spring Kickoff', code: 'SPRING25', expiry: '20 Mar, 2025', description: 'Seasonal kickoff offer for the spring season.' },
  { id: 14, title: 'Loyalty Trial', code: 'TRIAL99', expiry: '15 Feb, 2025', description: 'A limited-time trial period for new members.' },
  { id: 15, title: 'Founders Week', code: 'FOUNDER50', expiry: '05 Jan, 2025', description: 'Historical promo code from our Founders Week.' }
];

// Reusable Coupon Card matching UI specs
const CouponCard = ({ title, code, expiry, description }: any) => (
  <div className="group relative bg-[#161616] border border-white/[0.05] rounded-3xl p-5 md:p-6 overflow-hidden transition-all duration-500 hover:border-[#EB712B]/30 shadow-xl">
    <div className="absolute inset-0 bg-gradient-to-br from-[#EB712B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative z-10">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1a1a1a] flex items-center justify-center border border-white/[0.03]">
            <span className="text-lg">🏷️</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{title}</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Promotion</p>
          </div>
        </div>
        <div className="bg-[#EB712B]/10 px-3 py-1 rounded-full border border-[#EB712B]/20 shrink-0 flex items-center">
          <span className="text-[#EB712B] text-[10px] font-black uppercase tracking-wider">20% OFF</span>
        </div>
      </div>
    
      {/* Code & Expiry */}
      <div className="bg-[#050505] p-4 rounded-2xl border border-white/[0.03] mb-4">
        <div className="flex justify-between items-center gap-4">
          <div className="min-w-0">
            <p className="text-[9px] text-gray-600 uppercase font-bold mb-0.5">Promo Code</p>
            <span className="font-mono text-sm font-bold text-white tracking-widest block truncate">{code}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] text-gray-600 uppercase font-bold mb-0.5">Expires</p>
            <span className="text-xs font-medium text-red-700">{expiry}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-4">
        <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-2">Description</h4>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 md:line-clamp-3">
          {description}
        </p>
      </div>
    </div>
  </div>
);

interface DiscountProps {
  role?: "organizer" | "athlete";
}

const Discount: React.FC<DiscountProps> = ({ role = "organizer" }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Filters out the promo with ID 1 for the Athlete user and applies keyword matching search query
  const filteredActivePromos = SHARED_ACTIVE_DISCOUNTS.filter(promo => 
    promo.id !== 1 && 
    (promo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
     promo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     promo.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ==========================================
  // ATHLETE INTERFACE VIEW (Promo Wallet & Public Club View)
  // ==========================================
  if (role === "athlete") {
    return (
      <div className="px-4 py-8 md:p-8 min-h-screen text-white w-full font-sans select-none">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
            <div className="space-y-1.5">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Sparkles className="text-[#eb712a]" size={28} /> Discount
              </h1>
              <p className="text-gray-500 text-xs md:text-sm max-w-lg leading-relaxed">
                Active promotional discounts ready to be applied at your ride checkout.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search promo codes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 pl-11 pr-4 py-3 rounded-xl text-xs font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/40 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
            {filteredActivePromos.length > 0 ? (
              filteredActivePromos.map((promo) => (
                <CouponCard key={promo.id} {...promo} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-3 border border-dashed border-white/10 rounded-3xl">
                <AlertCircle size={36} className="text-gray-600 animate-pulse" />
                <p className="text-xs font-bold text-gray-400">No promo codes found matching your criteria.</p>
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
  const discountsToDisplay = activeTab === 'active' ? SHARED_ACTIVE_DISCOUNTS : EXPIRED_DISCOUNTS;

  return (
    <div className="px-4 py-8 md:p-8 min-h-screen text-white font-sans select-none w-full">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 max-w-7xl mx-auto border-b border-white/5 pb-6">
        <div className="w-full lg:w-auto space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-black mb-2 flex items-center gap-3">
            <Tag className="text-[#eb712a]" size={28} /> Discounts & Promotions
          </h1>
          <p className="text-gray-500 text-xs md:text-sm max-w-lg leading-relaxed">
            Configure and monitor high-performance campaign protocols.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Tab */}
          <div className="flex bg-[#0a0a0a] p-1 rounded-full border border-white/[0.05] w-full lg:w-auto overflow-hidden">
            <button
              onClick={() => setActiveTab('active')}
              className={`flex-1 lg:px-8 py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'active' 
                  ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`flex-1 lg:px-8 py-2.5 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 cursor-pointer ${
                activeTab === 'expired' 
                  ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]' 
                  : 'text-gray-500 hover:text-white'
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