import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { useForClubOwnerOrderListQuery } from '@/features/club/api/shopOrderApiSlice';

const Order = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Delivered'>('Active');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const clubIdStr = localStorage.getItem("selectedClubId");
  const clubId = clubIdStr ? Number(clubIdStr) : undefined;

  const { data: orderListResponse, isLoading, isError } = useForClubOwnerOrderListQuery(
    {
      clubId: clubId || 0,
      limit: 50,
      offset: 0,
      statusIds: activeTab === 'Active' ? '1,2,3' : '4',
    },
    { skip: !clubId }
  );

  const orders = useMemo(() => {
    const rows = orderListResponse?.rows || [];
    const mapped = rows.map((o) => ({
      id: o.id?.toString(),
      orderId: o.id?.toString(),
      productName: o.shop?.name || 'Unknown Product',
      category: o.shop?.size || 'Uncategorized',
      image: o.shop?.image || '/Images/CycleImage.png',
      price: `$ ${o.totalPrice ? parseFloat(o.totalPrice).toFixed(2) : '0.00'}`,
      recipient: o.buyer?.fullName || 'Unknown User',
      address: 'N/A',
      date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
      status: activeTab,
      originalOrder: o
    }));

    if (!searchQuery) return mapped;

    const query = searchQuery.toLowerCase();
    return mapped.filter(o => 
      o.productName.toLowerCase().includes(query) ||
      o.recipient.toLowerCase().includes(query) ||
      o.orderId.toLowerCase().includes(query)
    );
  }, [orderListResponse, activeTab, searchQuery]);

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

  const TableSkeleton = () => (
    <div className="animate-pulse space-y-3 p-4 bg-surface rounded-3xl border border-border">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-2xl bg-hover/50" />
            <div className="space-y-2">
              <div className="w-24 h-4 bg-hover/50 rounded" />
              <div className="w-16 h-3 bg-hover/50 rounded" />
            </div>
          </div>
          <div className="w-20 h-4 bg-hover/50 rounded" />
          <div className="w-16 h-4 bg-hover/50 rounded" />
          <div className="w-24 h-4 bg-hover/50 rounded" />
          <div className="w-16 h-4 bg-hover/50 rounded" />
          <div className="w-20 h-8 bg-hover/50 rounded-lg" />
        </div>
      ))}
    </div>
  );

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

      {!clubId ? (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl text-text-muted font-medium text-sm">
          Please select a club to manage its orders.
        </div>
      ) : isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl text-red-500 font-medium text-sm">
          Failed to load orders. Please check your permissions or try again.
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl">
          <DataTable data={orders} columns={columns} />
        </div>
      ) : (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl text-text-muted font-medium text-sm">
          No orders found under "{activeTab}" matching your filter.
        </div>
      )}
    </div>
  );
};

export default Order;
