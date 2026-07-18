/**
 * @fileoverview Elite Navbar — glassmorphism top bar with live Notifications.
 *
 * Specs:
 *  - Height: 80px (via #navbar CSS class in index.css)
 *  - Surface: backdrop-blur-xl glass, no solid background
 *  - Left: hamburger (mobile only) + h1 page title
 *  - Right: theme toggle (GSAP icon flip), notification bell with live API
 *
 * Notifications Architecture (matches Flutter):
 *  - Club Management mode (/view/clubside/*) → fetches getClubNotifications with clubId
 *  - Athlete mode (/view/userside/*) → fetches getUserNotification (user-level)
 *  - Unread count badge shown on bell
 *  - Dropdown lists last 10 notifications with mark-as-read
 */
import React, { useRef, useState, useEffect } from 'react';
import { Menu, Bell, Sun, Moon, X, CheckCheck, Loader2 } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useActiveClub } from '@/hooks/useActiveClub';
import {
  useGetUserNotificationQuery,
  useGetClubNotificationsQuery,
  useMarkAsReadNotificationsMutation,
} from '@/features/notifications/api/notificationApiSlice';

export interface NavbarProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

// ── Notification Dropdown ──────────────────────────────────────────────────────

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isClubSide = location.pathname.includes('/view/clubside') || location.pathname.includes('/manage-club');
  const { clubId } = useActiveClub();

  // ✅ Fetch different APIs based on mode — mirrors Flutter's notification logic
  const {
    data: userNotifs,
    isLoading: isLoadingUser,
  } = useGetUserNotificationQuery(undefined, {
    skip: isClubSide, // only for athlete mode
    pollingInterval: 60000, // re-poll every minute
  });

  const {
    data: clubNotifs,
    isLoading: isLoadingClub,
  } = useGetClubNotificationsQuery(
    { clubId: clubId! },
    {
      skip: !isClubSide || !clubId, // only for club management mode
      pollingInterval: 60000,
    }
  );

  const [markAsRead, { isLoading: isMarking }] = useMarkAsReadNotificationsMutation();

  const isLoading = isClubSide ? isLoadingClub : isLoadingUser;
  const rawNotifications = isClubSide
    ? clubNotifs?.rows || []
    : userNotifs?.rows || [];

  const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
  const unreadNotifs = notifications.filter((n: any) => !n.isRead);

  const handleMarkAllRead = async () => {
    const unreadIds = unreadNotifs.map((n: any) => n.id).filter(Boolean);
    if (unreadIds.length === 0) return;
    try {
      await Promise.all(unreadIds.map(id => markAsRead({ notificationId: id }).unwrap()));
    } catch {
      // Silently fail — not critical
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full right-0 mt-3 w-80 bg-surface border border-border rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[#EB712B]" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-main">
            {isClubSide ? 'Club Alerts' : 'Notifications'}
          </span>
          {unreadNotifs.length > 0 && (
            <span className="px-1.5 py-0.5 bg-[#EB712B] text-white text-[9px] font-black rounded-full">
              {unreadNotifs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifs.length > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarking}
              className="text-[9px] font-bold uppercase tracking-wider text-[#EB712B] hover:text-[#ff8036] cursor-pointer flex items-center gap-1 disabled:opacity-50"
            >
              {isMarking ? <Loader2 size={10} className="animate-spin" /> : <CheckCheck size={10} />}
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-text-muted hover:text-text-main cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-[#EB712B]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Bell size={28} className="text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-xs text-text-muted font-bold uppercase tracking-wider">No notifications yet</p>
            <p className="text-[10px] text-text-muted mt-1">
              {isClubSide ? "Club activity will appear here." : "Your activity will appear here."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.slice(0, 15).map((notif: any, idx: number) => {
              const isUnread = !notif.isRead;
              return (
                <div
                  key={notif.id || idx}
                  className={cn(
                    'px-4 py-3 transition-colors hover:bg-hover cursor-default',
                    isUnread && 'bg-[#EB712B]/5'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator */}
                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', isUnread ? 'bg-[#EB712B]' : 'bg-transparent border border-border')} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs leading-snug truncate', isUnread ? 'font-bold text-text-main' : 'text-text-muted')}>
                        {notif.title || notif.message || notif.body || 'New notification'}
                      </p>
                      {notif.body && notif.title && (
                        <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2 leading-snug">{notif.body}</p>
                      )}
                      <p className="text-[9px] text-text-muted mt-1 font-medium">
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-2.5 border-t border-border bg-hover/50 flex items-center justify-between">
          <p className="text-[9px] text-text-muted uppercase tracking-wider font-bold">
            Showing {Math.min(notifications.length, 15)} of {notifications.length} notifications
          </p>
          <button
            className="text-[10px] font-bold text-[#EB712B] uppercase hover:underline"
            onClick={(e) => {
              e.preventDefault();
              if (!isClubSide) {
                navigate('/view/userside/notifications');
              }
              onClose();
            }}
          >
            See All
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Navbar ────────────────────────────────────────────────────────────────

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, pageTitle = 'Dashboard' }) => {
  const { isDark, toggleTheme } = useTheme();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { clubId } = useActiveClub();

  const isClubSide = location.pathname.includes('/view/clubside') || location.pathname.includes('/manage-club');

  // Fetch unread count for the badge
  const { data: userNotifs } = useGetUserNotificationQuery(undefined, {
    skip: isClubSide,
    pollingInterval: 60000,
  });
  const { data: clubNotifs } = useGetClubNotificationsQuery(
    { clubId: clubId! },
    { skip: !isClubSide || !clubId, pollingInterval: 60000 }
  );

  const activeNotifs = isClubSide
    ? clubNotifs?.rows || []
    : userNotifs?.rows || [];

  const unreadCount = Array.isArray(activeNotifs)
    ? activeNotifs.filter((n: any) => !n.isRead).length
    : 0;

  const sunRef  = useRef<SVGSVGElement>(null);
  const moonRef = useRef<SVGSVGElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  // ── GSAP icon flip animation when theme toggles ───────────────────────────
  useGSAP(
    () => {
      const iconEl = isDark ? sunRef.current : moonRef.current;
      if (!iconEl) return;
      gsap.fromTo(
        iconEl,
        { scale: 0.3, rotate: isDark ? -120 : 120, opacity: 0 },
        { scale: 1, rotate: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' },
      );
    },
    { dependencies: [isDark] },
  );

  return (
    <header id="navbar">
      {/* ── Left: Mobile hamburger + Page title ── */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className={cn(
            'lg:hidden flex items-center justify-center w-11 h-11 rounded-xl',
            'transition-all duration-300 hover:opacity-80',
          )}
          style={{ color: 'var(--color-secondary-text)' }}
        >
          <Menu size={24} aria-hidden="true" />
        </button>

        <h1
          className="font-poppins font-bold text-[22px] tracking-tight leading-tight"
          style={{ color: 'var(--color-main-text)' }}
        >
          {pageTitle}
        </h1>
      </div>

      {/* ── Right: Theme toggle + Notification bell ── */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle — GSAP icon flip on swap */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="relative flex items-center justify-center w-11 h-11 rounded-2xl transition-colors duration-300 hover:opacity-80"
          style={{ color: 'var(--color-secondary-text)' }}
        >
          {isDark ? (
            <Sun ref={sunRef} size={22} aria-hidden="true" className="text-amber-300" />
          ) : (
            <Moon ref={moonRef} size={22} aria-hidden="true" className="text-indigo-400" />
          )}
        </button>

        {/* ✅ Live Notification Bell with real API integration */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="View notifications"
            className="relative flex items-center justify-center w-11 h-11 rounded-2xl transition-colors duration-300 group hover:opacity-80"
            style={{ color: 'var(--color-secondary-text)' }}
          >
            <Bell size={22} className="group-hover:animate-notif-bounce" aria-hidden="true" />

            {/* Unread count badge */}
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[#EB712B] text-white text-[8px] font-black rounded-full flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : (
              /* Animated orange ping dot when no unread (static presence indicator) */
              <span className="absolute top-2.5 right-2.5 w-2 h-2" aria-label="Notifications active">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
            )}
          </button>

          {/* Dropdown */}
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
