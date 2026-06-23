import { Check, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen text-text-main p-8 md:p-16 bg-main-bg">
      <button 
      onClick={() => navigate('/profile')} 
      className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-all duration-300 mb-12"
    >
      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
      <span className="text-sm font-bold uppercase tracking-widest">Back</span>
    </button>

      {/* Header */}
      <div className="relative flex flex-col items-center text-center mb-20 px-4">
  <div className="absolute top-0 -z-10 w-64 h-64 bg-[#EB712B]/10 rounded-full blur-[100px]" />
  

  <h1 className="text-5xl md:text-6xl font-black text-text-main tracking-tighter mb-6 max-w-2xl">
    Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EB712B] to-[#ff8c4a]">Subscription Plan</span>
  </h1>
  
  <p className="text-text-muted text-lg max-w-lg leading-relaxed">
    Tailor your workspace to your needs. Choose the perfect plan to unlock full administrative power.
  </p>
</div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
  {/* Free Plan */}
  <div className="bg-surface border border-border p-8 rounded-[2rem] flex flex-col hover:border-[#EB712B]/30 transition-all duration-300 shadow-xl">
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-bold text-text-main">Free Limited Plan</h3>
        <p className="text-text-muted text-sm mt-1">Essentials for getting started.</p>
      </div>
      <span className="text-[10px] font-bold text-text-muted bg-main-bg px-3 py-1 rounded-full uppercase tracking-widest">Free</span>
    </div>
    
    <div className="text-4xl font-bold text-text-main mb-8">$0 <span className="text-sm text-text-muted font-medium">/ forever</span></div>
    
    <div className="space-y-4 mb-8 flex-grow">
      {["2 items in Marketplace", "Basic feature set"].map((item, i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-text-muted">
          <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center">
            {i === 0 && <div className="w-2 h-2 rounded-full bg-[#EB712B]"></div>}
          </div>
          {item}
        </div>
      ))}
    </div>
    
    <button className="w-full bg-main-bg text-text-muted py-4 rounded-2xl font-bold border border-border cursor-default">
      Current Plan
    </button>
  </div>

  {/* Yearly Plan */}
  <div className="bg-surface border-2 border-[#EB712B] p-8 rounded-[2rem] relative flex flex-col hover:shadow-[0_0_40px_rgba(235,113,43,0.15)] transition-all duration-300">
    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EB712B] text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
    
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-bold text-text-main">Yearly Subscription</h3>
        <p className="text-text-muted text-sm mt-1">Full access to the management suite.</p>
      </div>
      <Crown className="text-[#EB712B]" size={20} />
    </div>
    
    <div className="text-4xl font-bold text-text-main mb-8">$129 <span className="text-sm text-text-muted font-medium">/ year</span></div>
    
    <div className="space-y-4 mb-8 flex-grow">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-text-main">
          <Check size={18} className="text-[#EB712B]" /> Unlimited Marketplace Items
        </div>
      ))}
    </div>
    
   <button 
  onClick={() => navigate('/subscription/payment')} 
  className="w-full bg-[#EB712B] hover:bg-[#ff8c4a] text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-[0_10px_20px_-10px_rgba(235,113,43,0.5)]"
>
  Subscribe Now
</button>
  </div>
</div>
    </div>
  );
};

export default Subscription;
