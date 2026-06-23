/**
 * @fileoverview Elite Sidebar — "Floating Pill" Architecture.
 *
 * Features (sibling to admin panel Sidebar):
 *  - 288px wide, glass background, sticky desktop / mobile drawer
 *  - GSAP floating orange pill that animates to the active nav link
 *  - Dual nav sections: Club Management OR Athlete Interface (based on pathname)
 *  - Profile footer tile with chevron + popup menu (Settings, Sign Out)
 *  - GSAP-animated LogoutModal via createPortal → #modal-root
 *  - All spacing via #sidebar CSS rules in index.css (Tailwind v4 compatible)
 *
 * To add a nav item: add to CLUB_NAV_ITEMS or ATHLETE_NAV_ITEMS arrays below.
 */
import React, { useState, useRef, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Car, Wallet, UserCircle,
  Newspaper, Trophy, Percent, UserPlus, X, User,
  Settings, ChevronUp, LogOut, Compass, Bike,
  TicketPercent, MessageSquare, Headphones, FileText, ShieldCheck
} from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { createPortal } from 'react-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { logout } from '@/features/auth/slices/authSlice';
import { cn } from '@/lib/utils';
import { APP_NAME, ROUTES } from '@/Constants';
import { useTheme } from '@/hooks/useTheme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  route: string;
  icon: React.ReactElement;
}

interface NavDivider {
  type: 'divider';
}

type NavEntry = NavItem | NavDivider;

// ─── Nav Config ───────────────────────────────────────────────────────────────

const ICON_SIZE = 20;

/** Club Management nav (organizers / owners). */
const CLUB_NAV_ITEMS: NavEntry[] = [
  { label: 'Dashboard',        route: ROUTES.DASHBOARD,        icon: <LayoutDashboard size={ICON_SIZE} /> },
  { label: 'Activities',       route: ROUTES.ACTIVITIES,       icon: <Users size={ICON_SIZE} /> },
  { label: 'Product',          route: ROUTES.PRODUCT,          icon: <Car size={ICON_SIZE} /> },
  { label: 'Order',            route: ROUTES.ORDER,            icon: <Wallet size={ICON_SIZE} /> },
  { label: 'News',             route: ROUTES.NEWS,             icon: <Newspaper size={ICON_SIZE} /> },
  { label: 'Leaderboard',      route: ROUTES.LEADERBOARD,      icon: <Trophy size={ICON_SIZE} /> },
  { label: 'Discount',         route: ROUTES.DISCOUNT,         icon: <Percent size={ICON_SIZE} /> },
  { label: 'Joining Requests', route: ROUTES.JOINING_REQUESTS, icon: <UserPlus size={ICON_SIZE} /> },
  { label: 'Members',          route: ROUTES.MEMBERS,          icon: <Users size={ICON_SIZE} /> },
  { type: 'divider' },
  { label: 'Terms & Conditions', route: ROUTES.TERMS,          icon: <FileText size={ICON_SIZE} /> },
  { label: 'Privacy Policy',     route: ROUTES.PRIVACY,        icon: <ShieldCheck size={ICON_SIZE} /> },
  { label: 'Chat Support',     route: ROUTES.SUPPORT_OWNER,    icon: <Headphones size={ICON_SIZE} /> },
  { label: 'Profile',          route: ROUTES.PROFILE,          icon: <UserCircle size={ICON_SIZE} /> },
];

/** Athlete Interface nav (community users). */
const ATHLETE_NAV_ITEMS: NavEntry[] = [
  { label: 'Explore Clubs',    route: ROUTES.CLUBS,               icon: <Compass size={ICON_SIZE} /> },
  { label: 'Rides',            route: ROUTES.RIDE,                icon: <Bike size={ICON_SIZE} /> },
  { label: 'Marketplace',      route: ROUTES.MARKETPLACE,         icon: <Car size={ICON_SIZE} /> },
  { label: 'My Purchases',     route: ROUTES.PURCHASES,           icon: <Wallet size={ICON_SIZE} /> },
  { label: 'Wallet',           route: ROUTES.WALLET_ATHLETE,      icon: <Wallet size={ICON_SIZE} /> },
  { label: 'Leaderboard',      route: ROUTES.LEADERBOARD_ATHLETE, icon: <Trophy size={ICON_SIZE} /> },
  { label: 'News',             route: ROUTES.NEWS_ATHLETE,        icon: <Newspaper size={ICON_SIZE} /> },
  { label: 'Discount',         route: ROUTES.MY_PROMOS,           icon: <TicketPercent size={ICON_SIZE} /> },
  { type: 'divider' },
  { label: 'Chat Support',     route: ROUTES.SUPPORT_ATHLETE,     icon: <MessageSquare size={ICON_SIZE} /> },
  { label: 'Profile',          route: ROUTES.PROFILE_ATHLETE,     icon: <UserCircle size={ICON_SIZE} /> },
];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Logout Confirmation Modal (GSAP + Portal) ────────────────────────────────

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ onConfirm, onCancel }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  // Entry animation
  useGSAP(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
    gsap.fromTo(
      cardRef.current,
      { scale: 0.88, opacity: 0, y: 24 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.7)' },
    );
  });

  // Exit animation before calling onCancel
  const handleCancel = useCallback(() => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(cardRef.current, { scale: 0.92, opacity: 0, y: 12, duration: 0.2, onComplete: onCancel });
  }, [onCancel]);

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ padding: '16px' }}>
      {/* Backdrop */}
      <div ref={overlayRef} className="absolute inset-0 bg-black/60 backdrop-blur-2xl" onClick={handleCancel} />

      {/* Modal card */}
      <div
        ref={cardRef}
        className="relative z-10 w-full text-center"
        style={{
          maxWidth: '400px',
          borderRadius: '24px',
          background: 'var(--color-secondary-bg)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
          padding: '36px 32px',
        }}
      >
        {/* Icon */}
        <div style={{
          margin: '0 auto 20px',
          width: '64px', height: '64px',
          borderRadius: '16px',
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.20)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LogOut size={28} color="#f87171" />
        </div>

        <h3 style={{ fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '20px', color: 'var(--color-main-text)', marginBottom: '8px' }}>
          Sign Out?
        </h3>
        <p style={{ fontFamily: 'var(--font-roboto)', fontSize: '14px', color: 'var(--color-secondary-text)', lineHeight: 1.6, marginBottom: '28px' }}>
          You'll be returned to the login screen. Any unsaved changes will be lost.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCancel}
            style={{
              flex: 1, padding: '12px', borderRadius: '14px',
              fontFamily: 'var(--font-poppins)', fontWeight: 600, fontSize: '14px',
              color: 'var(--color-main-text)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px', borderRadius: '14px',
              fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '14px',
              color: '#fff',
              background: '#ef4444',
              cursor: 'pointer', transition: 'filter 0.2s',
              border: 'none',
            }}
          >Sign Out</button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user     = useAppSelector((s) => s.auth.user);
  const { isDark } = useTheme();

  const [profileMenuOpen,  setProfileMenuOpen]  = useState(false);
  const [logoutModalOpen,  setLogoutModalOpen]  = useState(false);

  const navContainerRef = useRef<HTMLElement>(null);
  const pillRef         = useRef<HTMLDivElement>(null);

  // Determine which nav section to show based on current route
  const isAthleteSide =
    location.pathname.startsWith('/clubs') ||
    location.pathname.startsWith('/my-promos') ||
    location.pathname.startsWith('/athlete') ||
    location.pathname.startsWith('/support/athlete');

  const navItems = isAthleteSide ? ATHLETE_NAV_ITEMS : CLUB_NAV_ITEMS;
  const sectionLabel = isAthleteSide ? 'Athlete Interface' : 'Club Management';

  // ── GSAP Floating Pill — slides to the active link ──────────────────────
  useGSAP(
    () => {
      if (!navContainerRef.current || !pillRef.current) return;

      const allLinks = navContainerRef.current.querySelectorAll<HTMLAnchorElement>('[data-nav-link]');
      const activeLink = Array.from(allLinks).find(
        (el) => el.getAttribute('href') === location.pathname,
      );

      if (activeLink) {
        const cRect = navContainerRef.current.getBoundingClientRect();
        const lRect = activeLink.getBoundingClientRect();
        const top   = lRect.top - cRect.top + navContainerRef.current.scrollTop;

        gsap.to(pillRef.current, {
          y: top, height: lRect.height,
          opacity: 1, duration: 0.55, ease: 'expo.out',
        });
      } else {
        gsap.to(pillRef.current, { opacity: 0, duration: 0.2 });
      }
    },
    { dependencies: [location.pathname, isAthleteSide], scope: navContainerRef },
  );

  const handleLogoutConfirm = useCallback(() => {
    dispatch(logout());
    navigate(ROUTES.LOGIN, { replace: true });
  }, [dispatch, navigate]);

  const handleOpenLogout = useCallback(() => {
    setProfileMenuOpen(false);
    setLogoutModalOpen(true);
  }, []);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={onClose}
          aria-hidden="true"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside
        id="sidebar"
        className={cn(
          'fixed top-0 left-0 z-50 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          width: '288px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRight: '1px solid var(--color-border)',
          background: 'var(--color-glass-bg)',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Logo Header ── */}
        <div className="sidebar-logo-header">
          <img
            src={isDark ? '/Images/Logo.png' : '/Images/Logo.png'}
            alt={APP_NAME}
            style={{ height: '36px', objectFit: 'contain', cursor: 'pointer' }}
            draggable={false}
            onClick={() => navigate(ROUTES.DASHBOARD)}
          />
          <button
            onClick={onClose}
            aria-label="Close navigation"
            className="flex lg:hidden items-center justify-center"
            style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              color: 'var(--color-secondary-text)',
              background: 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'color 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav
          ref={navContainerRef}
          className="custom-scrollbar"
          style={{ position: 'relative', flex: 1, overflowY: 'auto', padding: '20px 16px' }}
        >
          {/* Section Label */}
          <div style={{ padding: '0 16px 12px', opacity: 0.8 }}>
            <span style={{ fontFamily: 'var(--font-roboto)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-secondary-text)' }}>
              {sectionLabel}
            </span>
          </div>

          {/* GSAP Floating Orange Pill (active indicator) */}
          <div
            ref={pillRef}
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '16px',
              right: '16px',
              top: 0,
              borderRadius: '16px',
              background: '#EB712B',
              pointerEvents: 'none',
              opacity: 0,
              willChange: 'transform, height, opacity',
            }}
          />

          {navItems.map((entry, idx) => {
            // Render divider
            if ('type' in entry && entry.type === 'divider') {
              return <div key={`div-${idx}`} className="nav-divider" />;
            }

            const item     = entry as NavItem;
            const isActive = location.pathname === item.route ||
              // Match sub-routes (e.g. /order/123 → active for /order)
              (item.route !== ROUTES.DASHBOARD && location.pathname.startsWith(item.route + '/'));

            return (
              <NavLink
                key={item.route}
                to={item.route}
                data-nav-link
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  color: isActive ? '#ffffff' : 'var(--color-secondary-text)',
                  textDecoration: 'none',
                  background: 'transparent',
                }}
                className={cn(!isActive && 'hover:!text-[var(--color-main-text)]')}
              >
                <span
                  style={{
                    flexShrink: 0,
                    transition: 'transform 0.3s',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    display: 'flex',
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── Profile Footer ── */}
        <div className="profile-footer">
          {/* Profile popup menu */}
          {profileMenuOpen && (
            <div className="profile-menu">
              <button
                onClick={() => { setProfileMenuOpen(false); }}
                style={{ color: 'var(--color-main-text)', background: 'transparent', border: 'none' }}
              >
                <Settings size={18} style={{ color: 'rgba(235,113,43,0.8)', flexShrink: 0 }} />
                <span>Settings</span>
              </button>
              <div className="profile-menu-divider" />
              <button
                onClick={handleOpenLogout}
                style={{ color: '#f87171', background: 'transparent', border: 'none' }}
              >
                <LogOut size={18} style={{ color: '#f87171', flexShrink: 0 }} />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Profile tile button */}
          <button
            onClick={() => setProfileMenuOpen((p) => !p)}
            aria-expanded={profileMenuOpen}
            aria-label="Open profile menu"
            className="profile-tile"
            style={{ border: '1px solid var(--color-border)', cursor: 'pointer', textAlign: 'left' }}
          >
            {/* Avatar */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              background: '#EB712B',
            }}>
              <User size={20} color="#fff" />
            </div>

            {/* Name + Role */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{
                fontFamily: 'var(--font-poppins)', fontWeight: 700, fontSize: '14px',
                color: 'var(--color-main-text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                lineHeight: 1.3, marginBottom: '2px',
              }}>
                {user?.name ?? 'Rider'}
              </p>
              <p style={{
                fontFamily: 'var(--font-poppins)', fontSize: '12px',
                color: 'var(--color-secondary-text)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textTransform: 'capitalize', letterSpacing: '0.02em',
              }}>
                {user?.role ?? 'Member'}
              </p>
            </div>

            {/* Chevron */}
            <ChevronUp
              size={16}
              style={{
                color: 'var(--color-secondary-text)',
                flexShrink: 0,
                transition: 'transform 0.3s',
                transform: profileMenuOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              }}
            />
          </button>
        </div>
      </aside>

      {/* Logout confirmation modal */}
      {logoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={() => setLogoutModalOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
