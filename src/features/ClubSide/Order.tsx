import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { useForClubOwnerOrderListQuery } from '@/features/club/api/shopOrderApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetJoinedClubsQuery } from '@/features/club/api/clubApiSlice';
import type { ResponseElement } from '@/api/types/shopOrderTypes';
import type { Club } from '@/features/club/types/clubTypes';

interface OrderRow {
  id?: string;
  orderId: string;
  productName: string;
  category: string;
  image: string;
  price: string;
  quantity: number;
  recipient: string;
  address: string;
  date: string;
  statusId: number;
  statusName: string;
  originalOrder: ResponseElement;
}

const extractArray = (data: unknown): ResponseElement[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as ResponseElement[];
  const obj = data as Record<string, unknown>;
  if (Array.isArray(obj?.response)) return obj.response as ResponseElement[];
  if (Array.isArray(obj?.data)) return obj.data as ResponseElement[];
  if (Array.isArray(obj?.rows)) return obj.rows as ResponseElement[];
  const responseObj = obj?.response as Record<string, unknown> | undefined;
  if (Array.isArray(responseObj?.rows)) return responseObj.rows as ResponseElement[];
  const dataObj = obj?.data as Record<string, unknown> | undefined;
  if (Array.isArray(dataObj?.rows)) return dataObj.rows as ResponseElement[];
  return [];
};

const TableSkeleton = () => (
  <div className="animate-pulse space-y-3 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center justify-between py-4 border-b border-border last:border-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-hover" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-hover rounded" />
            <div className="w-20 h-3 bg-hover rounded" />
          </div>
        </div>
        <div className="w-16 h-4 bg-hover rounded" />
        <div className="w-24 h-4 bg-hover rounded" />
        <div className="w-20 h-7 bg-hover rounded-full" />
      </div>
    ))}
  </div>
);

type OrderTab = 'All' | 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';

const Order = () => {
  const [activeTab, setActiveTab] = useState<OrderTab>('All');
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { clubId: clubIdStr, setActiveClub } = useActiveClub();
  const myClubsFromReduxRaw = useAppSelector((state) => state.club.myClubs);
  const myClubsFromRedux = useMemo(() => myClubsFromReduxRaw || [], [myClubsFromReduxRaw]);
  const { data: joinedClubsData } = useGetJoinedClubsQuery();

  useEffect(() => {
    if (!clubIdStr) {
      const clubsList = (Array.isArray(joinedClubsData) && joinedClubsData.length > 0)
        ? joinedClubsData
        : (Array.isArray((joinedClubsData as { rows?: unknown[] })?.rows) ? (joinedClubsData as { rows?: unknown[] }).rows || [] : myClubsFromRedux);
      if (Array.isArray(clubsList) && clubsList.length > 0) {
        setActiveClub(clubsList[0] as Club);
      }
    }
  }, [clubIdStr, joinedClubsData, myClubsFromRedux, setActiveClub]);

  const effectiveClubId = clubIdStr ? Number(clubIdStr) : 0;

  const statusIdsParam = useMemo(() => {
    switch (activeTab) {
      case 'Pending': return '1';
      case 'Approved': return '2';
      case 'Delivered': return '4';
      case 'Cancelled': return '3';
      case 'All':
      default:
        return undefined;
    }
  }, [activeTab]);

  const { data: orderListResponse, isLoading, isError } = useForClubOwnerOrderListQuery(
    {
      clubId: effectiveClubId,
      limit: 100,
      offset: 0,
      statusIds: statusIdsParam,
    },
    { skip: !effectiveClubId }
  );

  const orders = useMemo(() => {
    const rows = extractArray(orderListResponse);
    const mapped: OrderRow[] = rows.map((o) => {
      const addressObj = o.orderAddress as { street?: string; city?: string } | undefined;
      const addressStr = addressObj?.street 
        ? `${addressObj.street || ''}, ${addressObj.city || ''}` 
        : (o.deliveryMethod || 'Pickup');
      
      const sId = Number(o.statusId || 1);
      const sName = o.statusName || (sId === 4 ? 'Delivered' : sId === 2 ? 'Approved' : sId === 3 ? 'Cancelled' : 'Pending');

      return {
        id: o.id?.toString(),
        orderId: o.id?.toString() || '0',
        productName: o.shop?.name || 'Unknown Product',
        category: o.shop?.size || 'Official Gear',
        image: o.shop?.image || '/Images/CycleImage.png',
        price: `€${o.totalPrice ? parseFloat(o.totalPrice).toFixed(2) : '0.00'}`,
        quantity: o.quantity || 1,
        recipient: o.buyer?.fullName || 'Athlete',
        address: addressStr,
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'N/A',
        statusId: sId,
        statusName: sName,
        originalOrder: o
      };
    });

    if (!searchQuery) return mapped;

    const query = searchQuery.toLowerCase();
    return mapped.filter(o => 
      o.productName.toLowerCase().includes(query) ||
      o.recipient.toLowerCase().includes(query) ||
      o.orderId.toLowerCase().includes(query)
    );
  }, [orderListResponse, searchQuery]);

  const columns: Column<OrderRow>[] = useMemo(() => [
    {
      key: 'productName',
      label: t`Product & Gear`,
      sortable: true,
      render: (order) => (
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center overflow-hidden border border-border shrink-0 shadow-sm">
            <img 
              src={order.image} 
              alt={order.productName} 
              onError={(e) => (e.currentTarget.src = '/Images/CycleImage.png')} 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-main hover:text-[#EB712B] transition-colors">{order.productName}</h3>
            <p className="text-[11px] text-text-muted font-medium uppercase mt-0.5">{order.category} • {order.quantity} qty</p>
          </div>
        </div>
      )
    },
    {
      key: 'orderId',
      label: t`Order ID`,
      sortable: true,
      render: (order) => <p className="text-xs font-mono font-bold text-text-muted">#{order.orderId}</p>
    },
    {
      key: 'price',
      label: t`Total Price`,
      sortable: true,
      render: (order) => <p className="text-sm font-extrabold text-[#EB712B]">{order.price}</p>
    },
    {
      key: 'recipient',
      label: t`Buyer`,
      sortable: true,
      render: (order) => (
        <div>
          <p className="font-semibold text-sm text-text-main">{order.recipient}</p>
          <p className="text-[11px] text-text-muted truncate max-w-[160px] mt-0.5">{order.address}</p>
        </div>
      )
    },
    {
      key: 'date',
      label: t`Date`,
      sortable: true,
      render: (order) => <p className="text-xs font-medium text-text-muted">{order.date}</p>
    },
    {
      key: 'status',
      label: t`Status`,
      sortable: true,
      render: (order) => {
        let badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        let label = t`Pending`;

        if (order.statusId === 4 || order.statusName.toLowerCase() === 'delivered') {
          badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
          label = t`Delivered`;
        } else if (order.statusId === 2 || order.statusName.toLowerCase() === 'approved') {
          badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
          label = t`Approved`;
        } else if (order.statusId === 3 || order.statusName.toLowerCase() === 'cancelled') {
          badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          label = t`Cancelled`;
        }

        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}>
            {label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: t`Action`,
      sortable: false,
      render: (order) => (
        <div className="flex justify-end">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/order/${order.orderId}`, { state: { order } }); }}
            className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-bold hover:bg-[#EB712B] hover:text-white hover:border-[#EB712B] transition-all cursor-pointer text-text-main flex items-center gap-1"
          >
            <span><Trans>Details</Trans></span>
            <ChevronRight size={14} />
          </button>
        </div>
      )
    }
  ], [navigate]);

  return (
    <div className="w-full text-text-main font-sans min-h-screen p-4 md:p-8 overflow-x-hidden">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1"><Trans>Shop Orders</Trans></h1>
          <p className="text-text-muted text-xs md:text-sm"><Trans>Manage athlete purchases, review incoming orders, and track fulfillment.</Trans></p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder={t`Search orders, athletes...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-text-main placeholder-text-muted font-medium focus:outline-none focus:border-[#EB712B] transition-all"
            />
          </div>

          <div className="bg-surface p-1 rounded-xl border border-border flex flex-wrap gap-1">
            {(['All', 'Pending', 'Approved', 'Delivered', 'Cancelled'] as OrderTab[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)} 
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-[#EB712B] text-white shadow-md shadow-[#EB712B]/20' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab === 'All' && <Trans>All</Trans>}
                {tab === 'Pending' && <Trans>Pending</Trans>}
                {tab === 'Approved' && <Trans>Approved</Trans>}
                {tab === 'Delivered' && <Trans>Delivered</Trans>}
                {tab === 'Cancelled' && <Trans>Cancelled</Trans>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!effectiveClubId ? (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl text-text-muted font-medium text-sm">
          <Trans>Please select a club to manage its orders.</Trans>
        </div>
      ) : isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl text-red-500 font-medium text-sm">
          <Trans>Failed to load orders. Please check your permissions or try again.</Trans>
        </div>
      ) : orders.length > 0 ? (
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-2xl">
          <DataTable data={orders} columns={columns} />
        </div>
      ) : (
        <div className="text-center py-16 bg-surface border border-border rounded-3xl text-text-muted font-medium text-sm">
          <Trans>No orders found under "{activeTab}".</Trans>
        </div>
      )}
    </div>
  );
};

export default Order;
