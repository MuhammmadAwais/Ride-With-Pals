import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { ROUTES } from '@/Constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const isOtpVerified = useAppSelector((s) => s.auth.isOtpVerified);
  const user = useAppSelector((s) => s.auth.user);
  const myClubs = useAppSelector((s) => s.club.myClubs);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    // If the user's OTP is not verified, but they are logged in, we let the dummy OTP handle it.
    // We do not auto-bypass here anymore because they need to click the verify button manually on the VerifyEmail screen.
  }, [isAuthenticated, isOtpVerified, dispatch]);

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // User is authenticated. Route them based on onboarding completion status.

  // 1. Check if OTP is verified.
  if (!isOtpVerified) {
    if (location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
    return <>{children}</>;
  }

  // 2. Check if Athlete Profile is created.
  const isAthleteProfile = !!user?.isAthleteProfile;
  if (!isAthleteProfile) {
    if (location.pathname !== '/athlete-profile' && location.pathname !== '/create-profile') {
      return <Navigate to="/create-profile" replace />;
    }
    return <>{children}</>;
  }

  // 3. User is fully onboarded (Athlete Profile exists).
  // Allow them to visit the role selection page or other specific onboarding pages.
  const allowedOnboardingRoutes = ['/select-role', '/create-profile', '/club-profile-setup', '/club-subscriptions', '/select-role-club'];
  if (allowedOnboardingRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // 4. Club-side route guard: if user is trying to access /view/clubside/* but has no managed clubs,
  //    redirect them to the Athlete Interface instead of showing an empty dashboard.
  //    myClubs is loaded on app boot; if empty it means they don't own/admin any club.
  //    We allow access if myClubs hasn't loaded yet (length === 0 is ambiguous on first load),
  //    so we only block when we know the user's role is NOT owner/organizer.
  const isClubSideRoute = location.pathname.startsWith('/view/clubside');
  const userRole = user?.role;
  const isClubOwnerOrOrganizer = userRole === 'owner' || userRole === 'organizer';

  if (isClubSideRoute && !isClubOwnerOrOrganizer && myClubs.length === 0) {
    // Non-owner user trying to access club management — redirect to athlete interface
    return <Navigate to={ROUTES.CLUBS} replace />;
  }

  // If they hit /dashboard or any root-like protected path without a specific intent, route them based on their current active role.
  if (location.pathname === '/dashboard') {
      if (!user?.role) {
         return <Navigate to="/select-role" replace />;
      }
      if (user.role === 'owner' || user.role === 'organizer') {
         return <Navigate to="/view/clubside/dashboard" replace />;
      } else {
         return <Navigate to="/view/userside/clubs" replace />;
      }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
