import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, Package, MapPin, Calendar, Clock, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useForClubOwnerUpdateOrderStatusMutation, useForClubOwnerOrderListQuery } from '@/features/club/api/shopOrderApiSlice';
import { useActiveClub } from '@/hooks/useActiveClub';
import { useClubPermissions } from '@/hooks/useClubPermissions';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetJoinedClubsQuery } from '@/features/club/api/clubApiSlice';
import type { ResponseElement } from '@/api/types/shopOrderTypes';
import type { Club } from '@/features/club/types/clubTypes';

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

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

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
        console.log("📌 [Order Detail] Auto-selecting active club:", clubsList[0]);
        setActiveClub(clubsList[0] as Club);
      }
    }
  }, [clubIdStr, joinedClubsData, myClubsFromRedux, setActiveClub]);

  const effectiveClubId = clubIdStr ? Number(clubIdStr) : 0;
  const permissions = useClubPermissions(effectiveClubId || undefined);

  // Get the order data passed from the navigation state or fallback to API query
  const stateOrder = location.state?.order;
  const { data: orderListResponse } = useForClubOwnerOrderListQuery(
    { clubId: effectiveClubId, limit: 100 },
    { skip: !effectiveClubId || !!stateOrder }
  );

  const fallbackOrder = () => {
    const rows = extractArray(orderListResponse);
    const found = rows.find((o) => o.id?.toString() === id);
    if (!found) return undefined;
    const addressObj = found.orderAddress as { street?: string; city?: string } | undefined;
    const addressStr = addressObj?.street 
      ? `${addressObj.street || ''}, ${addressObj.city || ''}` 
      : (found.deliveryMethod || 'Pickup');
    return {
      id: found.id?.toString(),
      orderId: found.id?.toString() || '0',
      productName: found.shop?.name || 'Unknown Product',
      category: found.shop?.size || 'Uncategorized',
      image: found.shop?.image || '/Images/CycleImage.png',
      price: `€${found.totalPrice ? parseFloat(found.totalPrice).toFixed(2) : '0.00'}`,
      recipient: found.buyer?.fullName || 'Unknown User',
      address: addressStr,
      date: found.createdAt ? new Date(found.createdAt).toLocaleDateString() : 'N/A',
      status: found.statusId === 4 ? 'Delivered' : 'Active',
      originalOrder: found
    };
  };

  const order = stateOrder || fallbackOrder();

  const [deliveredOverride, setDeliveredOverride] = useState(false);
  const isDelivered = deliveredOverride || order?.status === 'Delivered';
  const [updateOrderStatus, { isLoading: isUpdating }] = useForClubOwnerUpdateOrderStatusMutation();

  const handleMarkDelivered = async () => {
    if (!order?.originalOrder?.id) return;
    try {
      console.log("📦 [Order Detail] Sending PUT /user/club/shop/order/status request:", {
        orderId: Number(order.originalOrder.id),
        statusId: 4
      });
      const response = await updateOrderStatus({
        orderId: Number(order.originalOrder.id),
        statusId: 4 // 4 = Delivered
      }).unwrap();
      console.log("📦 [Order Detail] Status update response:", response);
      setDeliveredOverride(true);
      toast.success('Order marked as delivered successfully!');
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || 'Failed to update order status.');
      console.error(err);
    }
  };

  // ✅ Block non-owners — they should never see another club's order details
  if (!permissions.isLoading && !permissions.isOwner && effectiveClubId) {
    return (
      <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10 flex items-center justify-center">
        <div className="bg-surface border border-red-500/20 rounded-3xl p-12 text-center max-w-md space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-text-main">Access Denied</h2>
          <p className="text-sm text-text-muted">
            Only club owners can view order details.
          </p>
          <button
            onClick={() => navigate('/view/clubside/order')}
            className="px-6 py-3 bg-surface border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-text-main hover:bg-hover transition-colors cursor-pointer"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10">
      {/* Navigation Header - fixed route to point to plain /order */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/view/clubside/order')} 
          className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-all cursor-pointer bg-transparent border-0 outline-none"
        >
          <div className="p-2 rounded-full bg-surface group-hover:bg-hover border border-border">
            <ChevronLeft size={18} />
          </div>
          <span className="text-xs font-medium uppercase tracking-widest bg-transparent">Back to Orders</span>
        </button>
      </div>

      {/* Main Title Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
        <div>
          <div className="text-[10px] text-[#EB712B] font-bold uppercase tracking-[0.2em] mb-2">Order Reference</div>
          {/* Dynamically displaying the correct ID */}
          <h1 className="text-4xl font-extrabold text-text-main">#{id}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${
            isDelivered 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <CheckCircle2 size={12} /> 
            {isDelivered ? 'Delivered' : (order?.status || 'In Progress')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-96 rounded-3xl overflow-hidden bg-surface border border-border group shadow-xl">
            <img src={order?.image || "/Images/BottleImage4.png"} alt="Product" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-main-bg via-transparent to-transparent" />
            <div className="absolute bottom-0 p-10">
              <h2 className="text-3xl font-bold mb-2 text-text-main">{order?.productName || "Product Name"}</h2>
              <p className="text-text-muted">{order?.category || "Category"}</p>
            </div>
          </div>

          <div className="bg-surface p-10 rounded-3xl border border-border shadow-xl">
            <h3 className="text-lg font-semibold mb-8 flex items-center gap-2 text-text-main">Technical Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-4">
              {[
                { l: 'Material', v: 'BPA-Free Polymer' }, { l: 'Capacity', v: '750ml' }, 
                { l: 'Insulation', v: 'Vacuum Seal' }, { l: 'Weight', v: '340g' }, 
                { l: 'SKU', v: id }, { l: 'Status', v: 'Pristine' }
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-2">{s.l}</p>
                  <p className="text-sm font-medium text-text-main">{s.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-surface p-5 rounded-3xl border border-border shadow-xl">
            <h3 className="text-lg font-semibold mb-6 text-text-main">Order Summary</h3>
            <div className="space-y-6 mb-8">
              {[
                { icon: <Package size={16}/>, l: 'Customer', v: order?.recipient || 'N/A' },
                { icon: <MapPin size={16}/>, l: 'Location', v: order?.originalOrder?.shop?.gender || 'Club Store' },
                { icon: <Calendar size={16}/>, l: 'Date', v: order?.date || 'N/A' }
              ].map((i) => (
                <div key={i.l} className="flex items-center gap-4">
                  <div className="text-text-muted">{i.icon}</div>
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm text-text-muted">{i.l}</span>
                    <span className="text-sm font-medium text-text-main">{i.v}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 rounded-2xl bg-main-bg border border-border mb-6 flex justify-between items-center">
              <span className="text-text-muted font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-[#EB712B]">{order?.price || "$0.00"}</span>
            </div>

            {isDelivered ? (
              <div className="w-full py-4 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-center font-bold text-sm uppercase tracking-widest">
                Delivered
              </div>
            ) : (
              <button 
                onClick={handleMarkDelivered}
                disabled={isUpdating}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-colors mb-3 cursor-pointer flex items-center justify-center gap-2 border-0 outline-none ${
                  isUpdating 
                    ? 'bg-[#EB712B]/50 text-white cursor-not-allowed' 
                    : 'bg-[#EB712B] text-white hover:bg-[#d66525]'
                }`}
              >
                {isUpdating && <Loader2 size={16} className="animate-spin" />}
                {isUpdating ? 'Updating...' : 'Mark as Delivered'}
              </button>
            )}
          </div>

          <div className="bg-surface p-8 rounded-3xl border border-border shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-main">
              <Clock size={18} /> Timeline
            </h3>
            <div className="relative border-l border-border ml-2 space-y-8">
              {['Order Placed', 'Processing', 'In Transit'].map((step, i) => (
                <div key={step} className="relative pl-6">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${i < 2 ? 'bg-emerald-500' : 'bg-border'}`} />
                  <p className={`text-sm font-semibold ${i < 2 ? 'text-text-main' : 'text-text-muted'}`}>{step}</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider">{order?.date || "N/A"}</p>
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
