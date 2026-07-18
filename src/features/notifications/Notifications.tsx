import React from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/Constants';
import { useGetUserNotificationQuery, useMarkAsReadNotificationsMutation } from '@/features/notifications/api/notificationApiSlice';
import { Bell, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Notifications: React.FC = () => {
  const { data, isLoading } = useGetUserNotificationQuery();
  const [markAsRead] = useMarkAsReadNotificationsMutation();

  const notifications = data?.rows || [];

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead({ notificationId: id }).unwrap();
    } catch (error) {
      console.error('Failed to mark as read', error);
      toast.error('Failed to mark notification as read');
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications — {APP_NAME}</title>
      </Helmet>
      
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in pb-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight uppercase">
              Notifications
            </h1>
            <p className="text-sm text-text-muted mt-1">Stay updated with your latest activity</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={32} className="animate-spin text-[#EB712B]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-2xl">
            <Bell size={48} className="text-text-muted mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold text-text-main">No notifications yet</h3>
            <p className="text-sm text-text-muted mt-2">When you get notifications, they'll show up here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => {
              const isUnread = !notif.isRead;
              return (
                <div 
                  key={notif.id}
                  className={cn(
                    "flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                    isUnread 
                      ? "bg-surface border-[#EB712B]/30 shadow-[0_4px_20px_rgba(235,113,43,0.05)]" 
                      : "bg-main-bg border-border opacity-70 hover:opacity-100"
                  )}
                >
                  {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EB712B] rounded-l-2xl" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("text-base truncate", isUnread ? "font-bold text-text-main" : "font-medium text-text-muted")}>
                      {notif.title || notif.message || notif.body || 'New Notification'}
                    </h4>
                    {notif.body && notif.title && (
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">
                        {notif.body}
                      </p>
                    )}
                    <p className="text-[11px] text-text-muted mt-3 font-bold tracking-wider uppercase flex items-center gap-2">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-start sm:items-center shrink-0">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs flex items-center gap-1.5 font-bold text-[#EB712B] bg-[#EB712B]/10 hover:bg-[#EB712B]/20 px-3 py-1.5 rounded-full transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;
