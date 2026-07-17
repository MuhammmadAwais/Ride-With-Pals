import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { refreshUserInfo } from '@/features/auth/slices/authSlice';
import { LayoutDashboard, Users, Calendar, MessageSquare, User, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { APP_NAME } from '@/Constants';

export const DashboardLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  useEffect(() => {
    dispatch(refreshUserInfo())
      .unwrap()
      .finally(() => setIsLoadingInfo(false));
  }, [dispatch]);

  const navItems = [
    { label: 'Home', path: '/dashboard/home', icon: <LayoutDashboard size={18} /> },
    { label: 'Activities', path: '/dashboard/activities', icon: <Users size={18} /> },
    { label: 'Calendar', path: '/dashboard/calendar', icon: <Calendar size={18} /> },
    { label: 'Chat', path: '/dashboard/chat', icon: <MessageSquare size={18} /> },
    { label: 'Profile', path: '/dashboard/profile', icon: <User size={18} /> },
  ];

  const getPageTitle = () => {
    const item = navItems.find((n) => location.pathname.startsWith(n.path));
    return item ? item.label : 'Dashboard';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} — {APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen bg-main-bg text-text-main flex flex-col md:flex-row font-sans">
        {/* Sub-Layout Sidebar */}
        <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-border p-6 flex flex-col justify-between shrink-0 animate-fade-in">
          <div className="space-y-8">
            {/* Brand Logo / Section Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EB712B] flex items-center justify-center font-bold text-white text-sm">
                RWP
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wider uppercase text-text-main">Ride With Pals</h1>
                <p className="text-xs text-text-muted">Dashboard Portal</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 border-0 outline-none
                    ${isActive 
                      ? 'bg-[#EB712B] text-white shadow-[0_0_15px_rgba(235,113,43,0.3)]' 
                      : 'text-text-muted hover:text-text-main bg-transparent'
                    }
                  `}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* User Info Card */}
          <div className="hidden md:flex items-center gap-3 bg-main-bg p-4 rounded-2xl border border-border mt-8">
            {user?.avatar || user?.profileImage ? (
              <img 
                src={user?.avatar || user?.profileImage} 
                alt="User" 
                className="w-10 h-10 rounded-xl object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center font-bold text-text-muted">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-text-main">{user?.fullName || 'Pal Rider'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border px-8 flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-lg font-bold tracking-tight text-text-main">{getPageTitle()}</h2>
            <div className="text-xs text-text-muted font-medium">
              Role: <span className="text-[#EB712B] capitalize font-bold">{user?.role || 'Rider'}</span>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {isLoadingInfo ? (
              <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#EB712B]" size={36} />
              </div>
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
