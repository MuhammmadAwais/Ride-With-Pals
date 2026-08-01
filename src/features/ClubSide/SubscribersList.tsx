/**
 * @fileoverview SubscribersList — Owner-only view of all membership subscribers.
 *
 * APIs wired:
 * - useListSubscribedMemberQuery        GET  /user/club/membership/members
 * - useChangeClubMemberFeeStatusMutation POST /user/club/membership/manual-pay
 * - useSendSubscriptionReminderMutation  POST /user/club/subscription/reminder
 * - useSendSubscriptionReminderToEveryoneMutation POST /user/club/subscription/reminder/all
 */
import React, { useState, useMemo } from 'react';
import {
  Users,
  Bell,
  BellRing,
  CreditCard,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useListSubscribedMemberQuery,
  useChangeClubMemberFeeStatusMutation,
} from '@/features/club/api/membershipApiSlice';
import {
  useSendSubscriptionReminderMutation,
  useSendSubscriptionReminderToEveryoneMutation,
} from '@/features/subscriptions/api/subscriptionApiSlice';

const LIMIT = 10;

const StatusBadge = ({ status, paymentStatus }: { status: string; paymentStatus: string }) => {
  const isActive = status === 'active' && paymentStatus === 'paid';
  const isPending = paymentStatus === 'pending' || paymentStatus === 'unpaid';
  const isCancelled = status === 'cancelled';

  if (isActive) {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={10} /> Active
      </span>
    );
  }
  if (isPending) {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock size={10} /> Pending
      </span>
    );
  }
  if (isCancelled) {
    return (
      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={10} /> Cancelled
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-surface border border-border text-text-muted capitalize">
      {status}
    </span>
  );
};

interface SubscribersListProps {
  clubId: number;
}

const SubscribersList: React.FC<SubscribersListProps> = ({ clubId }) => {
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [sendingReminderId, setSendingReminderId] = useState<number | null>(null);
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useListSubscribedMemberQuery({
    clubId: Number(clubId),
    limit: LIMIT,
    offset,
  }, { skip: !clubId });

  const [changeClubMemberFeeStatus] = useChangeClubMemberFeeStatusMutation();
  const [sendReminder] = useSendSubscriptionReminderMutation();
  const [sendReminderToEveryone, { isLoading: isSendingAll }] =
    useSendSubscriptionReminderToEveryoneMutation();

  const allRows = data?.rows || [];
  const total = data?.count || 0;
  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return allRows;
    const q = search.toLowerCase();
    return allRows.filter(
      (r: any) =>
        r.user?.fullName?.toLowerCase().includes(q) ||
        r.user?.email?.toLowerCase().includes(q) ||
        r.plan?.name?.toLowerCase().includes(q)
    );
  }, [allRows, search]);

  const handleMarkAsPaid = async (row: any) => {
    setMarkingPaidId(row.id);
    try {
      await changeClubMemberFeeStatus({
        clubId,
        userId: row.userId,
        planId: row.planId,
      }).unwrap();
      toast.success(`${row.user?.fullName || 'Member'} marked as paid!`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to mark as paid.');
    } finally {
      setMarkingPaidId(null);
    }
  };

  const handleSendReminder = async (row: any) => {
    setSendingReminderId(row.id);
    try {
      await sendReminder({ clubId, targetUserId: row.userId }).unwrap();
      toast.success(`Reminder sent to ${row.user?.fullName || 'member'}!`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reminder.');
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleSendAll = async () => {
    try {
      const res = await sendReminderToEveryone({ clubId }).unwrap();
      const count = (res as any)?.sentCount ?? 'all';
      toast.success(`Reminders sent to ${count} unpaid member(s)!`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to send reminders.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#222] rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="w-40 h-3 bg-[#222] rounded" />
              <div className="w-28 h-2 bg-[#222] rounded" />
            </div>
            <div className="w-20 h-6 bg-[#222] rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={15} />
          <input
            type="text"
            placeholder="Search by name, email or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border pl-11 pr-4 py-2.5 rounded-xl text-xs text-text-main placeholder-gray-500 focus:outline-none focus:border-[#EB712B]/50 transition-all"
          />
        </div>
        <button
          onClick={handleSendAll}
          disabled={isSendingAll}
          className="px-4 py-2.5 bg-[#EB712B] hover:bg-[#d05c19] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 cursor-pointer border-0 transition-all disabled:opacity-50 shrink-0"
        >
          {isSendingAll ? <Loader2 size={13} className="animate-spin" /> : <BellRing size={13} />}
          {isSendingAll ? 'Sending...' : 'Remind All Unpaid'}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Subscribers', value: total, icon: <Users size={16} /> },
          {
            label: 'Active',
            value: allRows.filter((r: any) => r.status === 'active').length,
            icon: <CheckCircle2 size={16} />,
          },
          {
            label: 'Pending Payment',
            value: allRows.filter((r: any) => r.paymentStatus === 'pending' || r.paymentStatus === 'unpaid').length,
            icon: <Clock size={16} />,
          },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="text-[#EB712B] shrink-0">{s.icon}</div>
            <div>
              <p className="text-xl font-black text-text-main">{s.value}</p>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {filteredRows.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-3">
          <Users size={36} className="text-text-muted mx-auto opacity-40" />
          <p className="text-sm font-bold text-text-muted">
            {search ? 'No subscribers match your search.' : 'No subscribers found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((row: any) => {
            const isPending = row.paymentStatus === 'pending' || row.paymentStatus === 'unpaid';
            const isSending = sendingReminderId === row.id;
            const isMarkingPaid = markingPaidId === row.id;

            return (
              <div
                key={row.id}
                className="bg-surface border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[#EB712B]/20 transition-all"
              >
                {/* Avatar + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={row.user?.profileImage || '/Images/ProfileImage.png'}
                    alt={row.user?.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/Images/ProfileImage.png';
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text-main truncate">
                      {row.user?.fullName || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-text-muted truncate">{row.user?.email}</p>
                  </div>
                </div>

                {/* Plan */}
                <div className="hidden sm:block shrink-0">
                  <p className="text-[9px] text-text-muted uppercase font-bold mb-0.5">Plan</p>
                  <p className="text-xs font-bold text-text-main">{row.plan?.name || row.planSnapshot?.name || '—'}</p>
                </div>

                {/* Period */}
                <div className="hidden sm:block shrink-0">
                  <p className="text-[9px] text-text-muted uppercase font-bold mb-0.5">Expires</p>
                  <p className="text-xs font-medium text-text-main">
                    {row.currentPeriodEnd
                      ? new Date(row.currentPeriodEnd).toLocaleDateString()
                      : '—'}
                  </p>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  <StatusBadge status={row.status} paymentStatus={row.paymentStatus} />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isPending && (
                    <button
                      onClick={() => handleMarkAsPaid(row)}
                      disabled={isMarkingPaid}
                      title="Mark as manually paid"
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isMarkingPaid ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <CreditCard size={14} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleSendReminder(row)}
                    disabled={isSending}
                    title="Send subscription reminder"
                    className="p-2 rounded-xl bg-[#EB712B]/10 hover:bg-[#EB712B]/20 border border-[#EB712B]/20 text-[#EB712B] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Bell size={14} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
            Page {currentPage} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOffset((prev) => Math.max(0, prev - LIMIT))}
              disabled={offset === 0 || isFetching}
              className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#EB712B]/30 disabled:opacity-40 cursor-pointer transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setOffset((prev) => prev + LIMIT)}
              disabled={offset + LIMIT >= total || isFetching}
              className="p-2 rounded-xl bg-surface border border-border text-text-muted hover:text-text-main hover:border-[#EB712B]/30 disabled:opacity-40 cursor-pointer transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscribersList;
