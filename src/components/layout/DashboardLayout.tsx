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

      <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
        {/* Sub-Layout Sidebar */}
        <aside className="w-full md:w-64 bg-[#0a0a0a] border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between shrink-0 animate-fade-in">
          <div className="space-y-8">
            {/* Brand Logo / Section Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#EB712B] flex items-center justify-center font-bold text-black text-sm">
                RWP
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wider uppercase">Ride With Pals</h1>
                <p className="text-xs text-gray-500">Dashboard Portal</p>
              </div>
            </div>

            {/* Nav Menu */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap border
                    ${isActive 
                      ? 'bg-[#EB712B]/10 text-[#EB712B] border-[#EB712B]/20 shadow-[0_0_15px_rgba(235,113,43,0.15)]' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'
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
          <div className="hidden md:flex items-center gap-3 bg-[#111] p-4 rounded-2xl border border-white/5 mt-8">
            {user?.avatar || user?.profileImage ? (
              <img 
                src={user?.avatar || user?.profileImage} 
                alt="User" 
                className="w-10 h-10 rounded-xl object-cover" 
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-gray-400">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate text-white">{user?.fullName || 'Pal Rider'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-lg font-bold tracking-tight text-white/90">{getPageTitle()}</h2>
            <div className="text-xs text-gray-500 font-medium">
              Role: <span className="text-[#EB712B] capitalize font-bold">{user?.role || 'Rider'}</span>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#070707]">
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
