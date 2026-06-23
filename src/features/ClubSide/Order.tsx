import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";

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
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Combined filtering logic: checks both the tab status and the search query string
  const filteredOrders = useMemo(() => {
    return allOrders.filter(order => {
      const matchesTab = activeTab === 'Active' 
        ? order.status !== 'Delivered' 
        : order.status === 'Delivered';
      
      const matchesSearch = order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            order.orderId.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const columns: Column<typeof allOrders[0]>[] = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (order) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-hover flex items-center justify-center overflow-hidden border border-border">
            <img src={order.image} alt={order.productName} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-text-main">{order.productName}</h3>
            <p className="text-[9px] md:text-[10px] text-text-muted font-medium uppercase">{order.category}</p>
          </div>
        </div>
      )
    },
    {
      key: 'orderId',
      label: 'Order ID',
      sortable: true,
      render: (order) => <p className="text-xs font-mono text-text-muted">#{order.orderId}</p>
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (order) => <p className="text-sm font-semibold text-text-main">{order.price}</p>
    },
    {
      key: 'recipient',
      label: 'Recipient',
      sortable: true,
      render: (order) => <p className="font-medium text-text-main">{order.recipient}</p>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (order) => <p className="text-xs text-text-muted">{order.date}</p>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => (
        <div className="flex justify-end">
          {order.status === 'Delivered' ? (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/order/${order.orderId}`, { state: { order } }); }}
              className="px-3 py-2 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
            >
              Delivered
            </button>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/order/${order.orderId}`, { state: { order } }); }}
              className="px-4 py-2 rounded-lg bg-surface border border-border text-[10px] font-bold uppercase hover:bg-[#EB712B] hover:text-white hover:border-[#EB712B] transition-all cursor-pointer text-text-main"
            >
              Details
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="w-full text-text-main font-sans min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Order Management</h1>
          <p className="text-text-muted text-xs md:text-sm">Oversee real-time logistics and athlete fulfillment streams.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          {/* Search Bar Container */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, athletes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-main placeholder-text-muted font-medium focus:outline-none focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] transition-all duration-300"
            />
          </div>

          {/* Tab Buttons Container */}
          <div className="bg-surface p-1 rounded-xl border border-border flex self-end shrink-0">
            <button 
              onClick={() => setActiveTab('Active')} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'Active' ? 'bg-[#EB712B] text-white' : 'text-text-muted hover:text-text-main'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab('Delivered')} 
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'Delivered' ? 'bg-[#EB712B] text-white' : 'text-text-muted hover:text-text-main'}`}
            >
              Delivered
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl">
        {filteredOrders.length > 0 ? (
          <DataTable data={filteredOrders} columns={columns} />
        ) : (
          <div className="text-center py-16 text-text-muted font-medium text-sm">
            No orders found under "{activeTab}" matching your filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Order;
