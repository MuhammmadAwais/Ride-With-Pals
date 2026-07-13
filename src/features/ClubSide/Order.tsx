import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { ShopService } from '@/api/backendApi';

const Order = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Delivered'>('Active');
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const clubIdStr = localStorage.getItem("selectedClubId");
      if (!clubIdStr) return;
      
      const statusIds = activeTab === 'Active' ? [2] : [4];
      try {
        const res = await ShopService.forClubOwnerOrderList({ clubId: Number(clubIdStr), search: searchQuery, limit: 50, offset: 0 });
        
        const mappedOrders = (res?.data || res || []).map((o: any) => ({
          id: o.id?.toString(),
          orderId: o.orderNumber || o.id?.toString(),
          productName: o.shopItem?.title || 'Unknown Product',
          category: o.shopItem?.category?.name || 'Uncategorized',
          image: o.shopItem?.images?.[0] || '/Images/CycleImage.png',
          price: `$ ${o.amount?.toFixed(2) || o.totalAmount?.toFixed(2) || '0.00'}`,
          recipient: o.user?.firstName ? `${o.user.firstName} ${o.user.lastName}` : 'Unknown User',
          address: o.shippingAddress || 'N/A',
          date: new Date(o.createdAt).toLocaleDateString(),
          status: activeTab,
          originalOrder: o
        }));
        
        setOrders(mappedOrders);
      } catch (err: any) {
        if (err.response?.status !== 403) {
          console.error(err);
        }
      }
    };
    
    fetchOrders();
  }, [activeTab, searchQuery]);

  const filteredOrders = orders;

  const columns: Column<any>[] = [
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
