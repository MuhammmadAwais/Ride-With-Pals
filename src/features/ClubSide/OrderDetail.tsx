import { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  Package, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  XCircle, 
  Check, 
  Truck, 
  Store,
  AlertTriangle
} from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Trans } from '@lingui/react/macro';
import { t } from '@lingui/core/macro';
import { 
  useForClubOwnerUpdateOrderStatusMutation, 
  useCancelShopOrderMutation,
  useForClubOwnerOrderListQuery 
} from '@/features/club/api/shopOrderApiSlice';
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
    const addressObj = found.orderAddress as { street?: string; city?: string; state?: string; postalCode?: string; country?: string; phone?: string } | undefined;
    const addressStr = addressObj?.street 
      ? `${addressObj.street || ''}${addressObj.city ? `, ${addressObj.city}` : ''}${addressObj.country ? `, ${addressObj.country}` : ''}` 
      : (found.deliveryMethod || 'Pickup');
    return {
      id: found.id?.toString(),
      orderId: found.id?.toString() || '0',
      productName: found.shop?.name || 'Unknown Product',
      category: found.shop?.size || 'Uncategorized',
      image: found.shop?.image || '/Images/CycleImage.png',
      price: `€${found.totalPrice ? parseFloat(found.totalPrice).toFixed(2) : '0.00'}`,
      unitPrice: found.unitPrice ? `€${parseFloat(found.unitPrice).toFixed(2)}` : null,
      quantity: found.quantity || 1,
      recipient: found.buyer?.fullName || 'Unknown Athlete',
      recipientImage: found.buyer?.profileImage || '/default-avatar.png',
      phone: addressObj?.phone || found.buyer?.phone || null,
      email: found.buyer?.email || null,
      address: addressStr,
      addressDetails: addressObj,
      deliveryMethod: found.deliveryMethod || 'pickup',
      comments: found.comments || (found as any)?.comment || null,
      date: found.createdAt ? new Date(found.createdAt).toLocaleDateString() : 'N/A',
      statusId: found.statusId || 1,
      status: found.statusName || (found.statusId === 4 ? 'Delivered' : found.statusId === 2 ? 'Approved' : found.statusId === 3 ? 'Cancelled' : 'Pending'),
      originalOrder: found
    };
  };

  const order = stateOrder || fallbackOrder();

  const [statusOverride, setStatusOverride] = useState<number | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const currentStatusId = statusOverride ?? order?.statusId ?? (order?.status === 'Delivered' ? 4 : 1);
  const isPending = currentStatusId === 1;
  const isApproved = currentStatusId === 2;
  const isCancelled = currentStatusId === 3;
  const isDelivered = currentStatusId === 4;

  const [updateOrderStatus, { isLoading: isUpdating }] = useForClubOwnerUpdateOrderStatusMutation();
  const [cancelShopOrder, { isLoading: isCancelling }] = useCancelShopOrderMutation();

  const handleUpdateStatus = async (newStatusId: number) => {
    if (!order?.originalOrder?.id && !order?.orderId) return;
    const targetId = Number(order.originalOrder?.id || order.orderId);
    try {
      await updateOrderStatus({
        orderId: targetId,
        statusId: newStatusId,
      }).unwrap();
      setStatusOverride(newStatusId);
      if (newStatusId === 2) {
        toast.success(t`Order approved successfully!`);
      } else if (newStatusId === 4) {
        toast.success(t`Order marked as delivered successfully!`);
      }
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || t`Failed to update order status.`);
    }
  };

  const handleCancelOrder = async () => {
    if (!order?.originalOrder?.id && !order?.orderId) return;
    const targetId = Number(order.originalOrder?.id || order.orderId);
    try {
      await cancelShopOrder({ orderId: targetId }).unwrap();
      setStatusOverride(3);
      setIsCancelModalOpen(false);
      toast.success(t`Order cancelled successfully.`);
    } catch (err: unknown) {
      toast.error((err as { data?: { message?: string } })?.data?.message || t`Failed to cancel order.`);
    }
  };

  // Block non-owners / non-admins
  if (!permissions.isLoading && !permissions.isOwner && !permissions.isAdmin && effectiveClubId) {
    return (
      <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10 flex items-center justify-center">
        <div className="bg-surface border border-red-500/20 rounded-3xl p-12 text-center max-w-md space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center">
            <ShieldAlert size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-text-main"><Trans>Access Denied</Trans></h2>
          <p className="text-sm text-text-muted">
            <Trans>Only club administrators can view order details.</Trans>
          </p>
          <button
            onClick={() => navigate('/view/clubside/order')}
            className="px-6 py-3 bg-surface border border-border rounded-xl text-xs font-bold uppercase tracking-wider text-text-main hover:bg-hover transition-colors cursor-pointer"
          >
            <Trans>Back to Orders</Trans>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-text-main bg-main-bg font-sans p-6 md:p-10">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/view/clubside/order')} 
          className="group flex items-center gap-2 text-text-muted hover:text-text-main transition-all cursor-pointer bg-transparent border-0 outline-none"
        >
          <div className="p-2 rounded-full bg-surface group-hover:bg-hover border border-border">
            <ChevronLeft size={18} />
          </div>
          <span className="text-xs font-medium uppercase tracking-widest bg-transparent"><Trans>Back to Orders</Trans></span>
        </button>
      </div>

      {/* Main Title Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
        <div>
          <div className="text-[10px] text-[#EB712B] font-bold uppercase tracking-[0.2em] mb-2"><Trans>Order Reference</Trans></div>
          <h1 className="text-4xl font-extrabold text-text-main">#{id}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {isDelivered && (
            <span className="px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              <CheckCircle2 size={13} /> <Trans>Delivered</Trans>
            </span>
          )}
          {isApproved && (
            <span className="px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Check size={13} /> <Trans>Approved</Trans>
            </span>
          )}
          {isPending && (
            <span className="px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 bg-amber-500/10 text-amber-400 border-amber-500/20">
              <Clock size={13} /> <Trans>Pending Approval</Trans>
            </span>
          )}
          {isCancelled && (
            <span className="px-4 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 bg-rose-500/10 text-rose-400 border-rose-500/20">
              <XCircle size={13} /> <Trans>Cancelled</Trans>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Product Presentation & Notes */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-96 rounded-3xl overflow-hidden bg-surface border border-border group shadow-xl">
            <img 
              src={order?.image || "/Images/BottleImage4.png"} 
              alt={order?.productName || t`Product`} 
              className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 p-8 md:p-10 w-full flex justify-between items-end">
              <div>
                <span className="inline-block px-3 py-1 bg-[#EB712B]/20 text-[#EB712B] border border-[#EB712B]/30 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  {order?.category || t`Official Merchandise`}
                </span>
                <h2 className="text-3xl font-bold text-white mb-1">{order?.productName || t`Product Name`}</h2>
                <p className="text-white/70 text-sm">{order?.originalOrder?.shop?.description || t`No description provided.`}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60 uppercase tracking-widest font-semibold"><Trans>Total</Trans></div>
                <div className="text-3xl font-extrabold text-[#EB712B]">{order?.price || "€0.00"}</div>
              </div>
            </div>
          </div>

          {/* Buyer Special Instructions / Delivery Comments */}
          {order?.comments && (
            <div className="bg-surface p-6 rounded-3xl border border-[#EB712B]/30 shadow-xl relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-[#EB712B]/10 text-[#EB712B] border border-[#EB712B]/20 shrink-0">
                  <MessageSquare size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-text-main flex items-center gap-2">
                    <Trans>Buyer Special Instructions</Trans>
                  </h3>
                  <p className="text-sm text-text-muted mt-2 italic bg-main-bg/50 p-4 rounded-xl border border-border">
                    "{order.comments}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Technical Specifications */}
          <div className="bg-surface p-8 rounded-3xl border border-border shadow-xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-text-main">
              <Package size={18} className="text-[#EB712B]" />
              <Trans>Item & Order Specifications</Trans>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-main-bg p-4 rounded-2xl border border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1"><Trans>Quantity</Trans></p>
                <p className="text-base font-bold text-text-main">{order?.quantity || 1} <Trans>units</Trans></p>
              </div>
              <div className="bg-main-bg p-4 rounded-2xl border border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1"><Trans>Unit Price</Trans></p>
                <p className="text-base font-bold text-text-main">{order?.unitPrice || order?.price || '€0.00'}</p>
              </div>
              <div className="bg-main-bg p-4 rounded-2xl border border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1"><Trans>Size / Type</Trans></p>
                <p className="text-base font-bold text-text-main">{order?.originalOrder?.shop?.size || 'Standard'}</p>
              </div>
              <div className="bg-main-bg p-4 rounded-2xl border border-border">
                <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1"><Trans>Target Gender</Trans></p>
                <p className="text-base font-bold text-text-main">{order?.originalOrder?.shop?.gender || 'Unisex'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Customer, Logistics & Actions */}
        <div className="space-y-8">
          {/* Customer Profile & Address Card */}
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xl space-y-6">
            <h3 className="text-base font-bold uppercase tracking-wider text-text-main"><Trans>Customer & Fulfillment</Trans></h3>
            
            {/* Customer Details */}
            <div className="flex items-center gap-3.5 p-3.5 bg-main-bg rounded-2xl border border-border">
              <img 
                src={order?.recipientImage || '/default-avatar.png'} 
                alt={order?.recipient} 
                onError={(e) => (e.currentTarget.src = '/default-avatar.png')} 
                className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-text-main truncate">{order?.recipient || t`Club Athlete`}</div>
                {order?.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-[#EB712B] font-medium mt-0.5">
                    <Phone size={12} />
                    <span>{order.phone}</span>
                  </div>
                )}
                {order?.email && (
                  <div className="text-[11px] text-text-muted truncate mt-0.5">{order.email}</div>
                )}
              </div>
            </div>

            {/* Delivery Method / Shipping Address */}
            <div className="p-4 bg-main-bg rounded-2xl border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  {order?.deliveryMethod?.toLowerCase() === 'delivery' ? <Truck size={14} className="text-[#EB712B]" /> : <Store size={14} className="text-[#EB712B]" />}
                  {order?.deliveryMethod?.toLowerCase() === 'delivery' ? <Trans>Shipping Address</Trans> : <Trans>Club Pickup</Trans>}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#EB712B]/10 text-[#EB712B]">
                  {order?.deliveryMethod || 'Pickup'}
                </span>
              </div>
              <p className="text-sm font-medium text-text-main">
                {order?.address || t`Pick up at official club clubhouse.`}
              </p>
            </div>

            {/* Order Date */}
            <div className="flex justify-between items-center text-xs py-1 border-b border-border/50">
              <span className="text-text-muted flex items-center gap-1.5">
                <Calendar size={13} /> <Trans>Purchased On</Trans>
              </span>
              <span className="font-semibold text-text-main">{order?.date || 'N/A'}</span>
            </div>

            {/* Total Amount Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EB712B]/10 to-transparent border border-[#EB712B]/30 flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider"><Trans>Total Paid</Trans></span>
                <div className="text-2xl font-black text-[#EB712B]">{order?.price || "€0.00"}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#EB712B]/20 text-[#EB712B]">
                <Package size={20} />
              </div>
            </div>

            {/* Action Buttons Depending on State */}
            <div className="space-y-3 pt-2">
              {isPending && (
                <div className="space-y-2.5">
                  <button 
                    onClick={() => handleUpdateStatus(2)}
                    disabled={isUpdating}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-[#EB712B] text-white hover:bg-[#d66525] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#EB712B]/20 border-0"
                  >
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    <Trans>Approve Order</Trans>
                  </button>
                  <button 
                    onClick={() => setIsCancelModalOpen(true)}
                    disabled={isCancelling}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <XCircle size={16} />
                    <Trans>Cancel Order</Trans>
                  </button>
                </div>
              )}

              {isApproved && (
                <button 
                  onClick={() => handleUpdateStatus(4)}
                  disabled={isUpdating}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 border-0"
                >
                  {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <Trans>Mark as Delivered</Trans>
                </button>
              )}

              {isDelivered && (
                <div className="w-full py-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} /> <Trans>Order Completed & Delivered</Trans>
                </div>
              )}

              {isCancelled && (
                <div className="w-full py-3.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-center font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2">
                  <XCircle size={16} /> <Trans>Order Cancelled</Trans>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="bg-surface p-6 rounded-3xl border border-border shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 text-text-main">
              <Clock size={16} className="text-[#EB712B]" /> <Trans>Fulfillment Progress</Trans>
            </h3>
            <div className="relative border-l border-border ml-2.5 space-y-6">
              {[
                { name: t`Order Placed`, done: true, desc: t`Purchased via club store` },
                { name: t`Order Approved`, done: isApproved || isDelivered, desc: isCancelled ? t`Order cancelled` : t`Confirmed by club manager` },
                { name: t`Delivered`, done: isDelivered, desc: t`Received by athlete` }
              ].map((step, i) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full transition-colors ${
                    step.done ? 'bg-emerald-500' : isCancelled && i >= 1 ? 'bg-rose-500' : 'bg-border'
                  }`} />
                  <p className={`text-sm font-bold ${step.done ? 'text-text-main' : 'text-text-muted'}`}>{step.name}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main"><Trans>Cancel Order #{id}?</Trans></h3>
              <p className="text-xs text-text-muted mt-1.5 leading-relaxed">
                <Trans>Are you sure you want to cancel this order? This will cancel fulfillment and the athlete will be notified.</Trans>
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-3 bg-main-bg border border-border rounded-xl text-xs font-bold uppercase text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <Trans>Keep Order</Trans>
              </button>
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-0"
              >
                {isCancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                <Trans>Confirm Cancel</Trans>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
