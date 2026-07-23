import { useState, useMemo } from 'react';
import { Search, ShoppingBag, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";
import { useGetMyPurchasesListQuery, useUpdateShopOrderStatusMutation } from '@/features/club/api/shopOrderApiSlice';
import { toast } from 'sonner';

const MyPurchases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const { data: purchasesResponse, isLoading, isError } = useGetMyPurchasesListQuery({
    limit: 50,
    offset: 0
  });

  const [updateShopOrderStatus] = useUpdateShopOrderStatusMutation();

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await updateShopOrderStatus({ orderId: Number(orderId) }).unwrap();
      toast.success('Order cancelled successfully.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancellingId(null);
    }
  };

  const purchases = useMemo(() => {
    const rows = purchasesResponse?.rows || [];
    const mapped = rows.map((item) => ({
      id: item.id?.toString() || Math.random().toString(),
      product: item.shop?.name || 'Unknown Item',
      category: item.shop?.size || 'Gear',
      price: item.totalPrice ? `$${parseFloat(item.totalPrice).toFixed(2)}` : '$0.00',
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
      status: item.statusName || 'Processing',
      img: item.shop?.image || '/Images/CycleImage.png',
      canCancel: !['Delivered', 'Cancelled'].includes(item.statusName || ''),
    }));

    if (!searchQuery) return mapped;

    const query = searchQuery.toLowerCase();
    return mapped.filter(item => 
      item.product.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  }, [purchasesResponse, searchQuery]);

  const columns: Column<any>[] = [
    {
      key: 'product',
      label: 'Item',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-4">
          <img src={item.img} alt={item.product} className="w-12 h-12 rounded-xl object-cover bg-surface border border-border" />
          <div>
            <div className="font-bold text-sm text-text-main">{item.product}</div>
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold">{item.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'id',
      label: 'Order ID',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-text-muted">#{item.id}</span>
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (item) => <span className="text-xs font-medium text-text-main">{item.date}</span>
    },
    {
      key: 'price',
      label: 'Amount',
      sortable: true,
      render: (item) => <span className="text-sm font-bold text-text-main">{item.price}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.status === 'Delivered' ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 size={12} /> Delivered
            </span>
          ) : item.status === 'Cancelled' ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
              <XCircle size={12} /> Cancelled
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20">
              {item.status}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'cancel',
      label: '',
      sortable: false,
      render: (item) => (
        item.canCancel ? (
          <button
            onClick={() => handleCancel(item.id)}
            disabled={cancellingId === item.id}
            className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-400 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {cancellingId === item.id ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
            {cancellingId === item.id ? 'Cancelling...' : 'Cancel'}
          </button>
        ) : null
      )
    }
  ];

  const TableSkeleton = () => (
    <div className="animate-pulse space-y-4 p-6 bg-surface rounded-3xl border border-border">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-hover/50" />
            <div className="space-y-2">
              <div className="w-32 h-4 bg-hover/50 rounded" />
              <div className="w-20 h-3 bg-hover/50 rounded" />
            </div>
          </div>
          <div className="w-24 h-4 bg-hover/50 rounded" />
          <div className="w-20 h-4 bg-hover/50 rounded" />
          <div className="w-20 h-4 bg-hover/50 rounded" />
          <div className="w-24 h-7 bg-hover/50 rounded-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full text-text-main font-sans min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-main flex items-center gap-3 tracking-tight">
              <ShoppingBag className="text-[#EB712B]" size={28} /> My Purchases
            </h1>
            <p className="text-sm text-text-muted mt-2 max-w-lg">Track your orders, view receipts, and manage your gear acquisitions.</p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Search purchases..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-xs font-bold focus:border-[#EB712B] focus:ring-1 focus:ring-[#EB712B] outline-none transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 bg-surface border border-border rounded-3xl">
            <h3 className="text-lg font-bold text-red-500">Failed to load purchases</h3>
            <p className="text-sm text-text-muted mt-2">Please try again later.</p>
          </div>
        ) : purchases.length > 0 ? (
          <div className="bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden">
            <DataTable data={purchases} columns={columns} />
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4 bg-surface border border-border rounded-3xl">
            <ShoppingBag size={48} className="text-border mb-4" />
            <h3 className="text-lg font-bold text-text-main">No purchases found</h3>
            <p className="text-sm text-text-muted">You haven't bought any items yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;
