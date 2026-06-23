import { useState, useMemo } from 'react';
import { Search, ShoppingBag, CheckCircle2 } from 'lucide-react';
import DataTable from "@/components/ui/DataTable";
import type { Column } from "@/components/ui/DataTable";

const mockPurchases = [
  { id: 'ORD-001', product: 'Carbon Fiber Pro Bike', category: 'Equipment', price: '$2,500.00', date: 'Oct 24, 2026', status: 'Delivered', img: '/Images/CycleImage.png' },
  { id: 'ORD-002', product: 'Aero Helmet V2', category: 'Protection', price: '$120.00', date: 'Oct 18, 2026', status: 'Processing', img: '/Images/GirlImage11.png' },
  { id: 'ORD-003', product: 'Pro Gloves', category: 'Apparel', price: '$45.00', date: 'Oct 10, 2026', status: 'Delivered', img: '/Images/CycleGloves.jfif' },
  { id: 'ORD-004', product: 'Hydration Pack', category: 'Accessories', price: '$65.00', date: 'Sep 28, 2026', status: 'Delivered', img: '/Images/BottleImage4.png' },
];

const MyPurchases = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPurchases = useMemo(() => {
    return mockPurchases.filter(p => 
      p.product.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const columns: Column<typeof mockPurchases[0]>[] = [
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
      render: (item) => <span className="font-mono text-xs text-text-muted">{item.id}</span>
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
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20">
              {item.status}
            </span>
          )}
        </div>
      )
    }
  ];

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

        <div className="bg-surface rounded-3xl border border-border shadow-2xl overflow-hidden">
          {filteredPurchases.length > 0 ? (
            <DataTable data={filteredPurchases} columns={columns} />
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <ShoppingBag size={48} className="text-border mb-4" />
              <h3 className="text-lg font-bold text-text-main">No purchases found</h3>
              <p className="text-sm text-text-muted">You haven't bought any items yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;
