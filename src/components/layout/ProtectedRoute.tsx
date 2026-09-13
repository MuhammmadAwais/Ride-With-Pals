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
  const allowedOnboardingRoutes = ['/select-role', '/create-profile', '/club-profile-setup', '/club-subscriptions', '/select-role-club', '/auth-subscription'];
  if (allowedOnboardingRoutes.includes(location.pathname)) {
    return <>{children}</>;
  }

  // 4. Club-side route guard: if user is trying to access /view/clubside/* or /manage-club/*
  //    but has 0 managed clubs, redirect them to the Athlete Interface.
  const isClubSideRoute = location.pathname.startsWith('/view/clubside') || location.pathname.startsWith('/manage-club');
  const isClubLoading = useAppSelector((s) => s.club.isLoading);

  if (isClubSideRoute && !isClubLoading && Array.isArray(myClubs) && myClubs.length === 0) {
    return <Navigate to={ROUTES.CLUBS} replace />;
  }

  // If they hit /dashboard or any root-like protected path without a specific intent, route them based on active manageable clubs.
  if (location.pathname === '/dashboard') {
    if (Array.isArray(myClubs) && myClubs.length > 0) {
      return <Navigate to="/view/clubside/dashboard" replace />;
    } else {
      return <Navigate to="/view/userside/clubs" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
