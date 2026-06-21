import { ChevronLeft, Package, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // This is your orderId (e.g., EP-29482)
  const location = useLocation();
  
  // Get the order data passed from the navigation state
  const order = location.state?.order;

  return (
    <div className="w-full min-h-screen text-zinc-100 font-sans p-6 md:p-10">
      {/* Navigation Header - fixed route to point to plain /order */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/order')} 
          className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all cursor-pointer"
        >
          <div className="p-2 rounded-full bg-[#161616] group-hover:bg-[#1f1f1f] border border-white/5">
            <ChevronLeft size={18} />
          </div>
          <span className="text-xs font-medium uppercase tracking-widest">Back to Orders</span>
        </button>
      </div>

      {/* Main Title Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
        <div>
          <div className="text-[10px] text-[#EB712B] font-bold uppercase tracking-[0.2em] mb-2">Order Reference</div>
          {/* Dynamically displaying the correct ID */}
          <h1 className="text-4xl font-extrabold text-white">#{id}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
            order?.status === 'Delivered' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <CheckCircle2 size={12} /> 
            {order?.status || 'In Progress'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-96 rounded-3xl overflow-hidden bg-[#161616] border border-white/5 group">
            <img src={order?.image || "/Images/BottleImage4.png"} alt="Product" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            <div className="absolute bottom-0 p-10">
              <h2 className="text-3xl font-bold mb-2">{order?.productName || "Product Name"}</h2>
              <p className="text-zinc-400">{order?.category || "Category"}</p>
            </div>
          </div>

          <div className="bg-[#161616] p-10 rounded-3xl border border-white/5">
            <h3 className="text-lg font-semibold mb-8 flex items-center gap-2">Technical Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
              {[
                { l: 'Material', v: 'BPA-Free Polymer' }, { l: 'Capacity', v: '750ml' }, 
                { l: 'Insulation', v: 'Vacuum Seal' }, { l: 'Weight', v: '340g' }, 
                { l: 'SKU', v: id }, { l: 'Status', v: 'Pristine' }
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">{s.l}</p>
                  <p className="text-sm font-medium text-zinc-200">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-[#161616] p-5 rounded-3xl border border-white/5">
            <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
            <div className="space-y-6 mb-8">
              {[
                { icon: <Package size={16}/>, l: 'Customer', v: order?.recipient || 'N/A' },
                { icon: <MapPin size={16}/>, l: 'Location', v: 'Las Vegas, NV' },
                { icon: <Calendar size={16}/>, l: 'Date', v: order?.date || 'Oct 24, 2024' }
              ].map((i) => (
                <div key={i.l} className="flex items-center gap-4">
                  <div className="text-zinc-600">{i.icon}</div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-zinc-500">{i.l}</span>
                    <span className="text-sm font-medium">{i.v}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 mb-6 flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-[#EB712B]">{order?.price || "$0.00"}</span>
            </div>

            {order?.status === 'Delivered' ? (
              <div className="w-full py-4 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center font-bold text-sm uppercase tracking-widest">
                Delivered
              </div>
            ) : (
              <button className="w-full py-4 rounded-xl bg-[#EB712B] text-white font-bold text-sm hover:bg-[#d66525] transition-colors mb-3 cursor-pointer">
                Mark as Delivered
              </button>
            )}
          </div>

          <div className="bg-[#161616] p-8 rounded-3xl border border-white/5">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Clock size={18} /> Timeline
            </h3>
            <div className="relative border-l border-white/10 ml-2 space-y-8">
              {['Order Placed', 'Processing', 'In Transit'].map((step, i) => (
                <div key={step} className="relative pl-6">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${i < 2 ? 'bg-emerald-500' : 'bg-white/20'}`} />
                  <p className={`text-sm font-semibold ${i < 2 ? 'text-white' : 'text-zinc-500'}`}>{step}</p>
                  <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider">{order?.date || "Oct 24, 2024"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;