import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const productCatalog = [
  { name: 'Bicycle', cat: 'Carbon Fiber Pro', img: '/Images/CycleImage.png', price: 100.00 },
  { name: 'Pro Gloves', cat: 'Apparel', img: '/Images/CycleGloves.jfif', price: 25.00 },
  { name: 'Aero Helmet', cat: 'Protection', img: '/Images/GirlImage11.png', price: 55.00 },
  { name: 'Racing Shoes', cat: 'Footwear', img: '/Images/shoesImage.png', price: 80.00 },
  { name: 'Hydration Pack', cat: 'Accessories', img: '/Images/BottleImage4.png', price: 30.00 }
];

const allOrders = Array.from({ length: 38 }, (_, i) => {
  const randomProduct = productCatalog[Math.floor(Math.random() * productCatalog.length)];
  return {
    id: `${i + 1}`,
    orderId: `EP-294${80 + i}`,
    productName: randomProduct.name, 
    category: randomProduct.cat,
    image: randomProduct.img,
    price: `$ ${randomProduct.price.toFixed(2)}`,
    recipient: i % 2 === 0 ? 'Cameron Williamson' : 'Jane Cooper',
    address: '6391 Elgin St. Celina, DE',
    date: 'Oct 24, 2024',
    status: i % 3 === 0 ? 'Delivered' : 'Active',
  };
});

const Order = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Delivered'>('Active');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();
  const [orders, setOrders] = useState(allOrders);


  const filteredOrders = allOrders.filter(order => 
    activeTab === 'Active' ? order.status !== 'Delivered' : order.status === 'Delivered'
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  

  return (
    <div className="w-full text-white font-sans bg-[#111111] min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-zinc-500 text-xs md:text-sm">Oversee real-time logistics and athlete fulfillment streams.</p>
        </div>
        <div className="bg-[#161616] p-1 rounded-xl border border-zinc-800 flex shrink-0">
          <button 
            onClick={() => { setActiveTab('Active'); setCurrentPage(1); }} 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Active' ? 'bg-[#EB712B] text-white' : 'text-zinc-500'}`}
          >
            Active
          </button>
          <button 
            onClick={() => { setActiveTab('Delivered'); setCurrentPage(1); }} 
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Delivered' ? 'bg-[#EB712B] text-white' : 'text-zinc-500'}`}
          >
            Delivered
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 md:grid-cols-7 px-4 py-3 text-[9px] md:text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">
        <div className="col-span-2">Product</div>
        <div className="hidden md:block">Order ID</div>
        <div className="hidden md:block">Price</div>
        <div className="hidden md:block">Recipient</div>
        <div className="hidden md:block">Date</div>
        <div className="text-right col-span-2 md:col-span-1">Status</div>
      </div>

      <div className="space-y-3">
        {currentOrders.map((order) => (
          <div key={order.id} className="group relative grid grid-cols-4 md:grid-cols-7 items-center p-4 md:p-5 rounded-2xl bg-[#121212] border border-white/[0.03] transition-all duration-500 hover:border-[#EB712B]/40 hover:bg-[#141414]">
            <div className="col-span-2 flex items-center gap-3 md:gap-5 z-10">
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                <img src={order.image} alt={order.productName} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-zinc-100">{order.productName}</h3>
                <p className="text-[9px] md:text-[10px] text-zinc-500 font-medium uppercase">{order.category}</p>
              </div>
            </div>
            
            <p className="hidden md:block text-xs font-mono text-zinc-500">#{order.orderId}</p>
            <p className="hidden md:block text-sm font-semibold text-zinc-300">{order.price}</p>
            <div className="hidden md:block text-xs">
              <p className="font-medium text-zinc-300">{order.recipient}</p>
            </div>
            <p className="hidden md:block text-xs text-zinc-500">{order.date}</p>
            
<div className="flex justify-end col-span-2 md:col-span-1 z-10">
  {order.status === 'Delivered' ? (
    <button 
      onClick={() => navigate(`/dashboard/order/${order.orderId}`, { state: { order } })}
      className="px-3 py-2 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
    >
      Delivered
    </button>
  ) : (
    <button 
      onClick={() => navigate(`/dashboard/order/${order.orderId}`, { state: { order } })}
      className="px-4 py-2 rounded-lg bg-[#1A1A1A] border border-zinc-800 text-[10px] font-bold uppercase hover:bg-[#EB712B] hover:text-white transition-all"
    >
      Details
    </button>
  )}
</div>          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-8 text-xs text-zinc-500">
        <p>Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} of {filteredOrders.length}</p>
        <div className="flex gap-2">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded-lg disabled:opacity-30 hover:bg-zinc-800"><ChevronLeft size={14} /></button>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center border border-zinc-800 rounded-lg disabled:opacity-30 hover:bg-zinc-800"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default Order;