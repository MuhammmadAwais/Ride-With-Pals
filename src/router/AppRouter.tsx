/**
 * @fileoverview Central App Router (React Router v6 data router).
 *
 * Architecture:
 * - Public routes (Auth, Onboarding) are rendered directly.
 * - Protected routes are wrapped in <ProtectedRoute> which checks Redux auth.
 * - Shell routes (Dashboard, Activities, etc.) are nested inside <AppLayout>.
 */
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';

// ── Layouts & Guards ──
const Members = React.lazy(() => import('@/features/ClubSide/Members'));
const TermsConditions = React.lazy(() => import('@/features/ClubSide/TermsConditions'));
const PrivacyPolicy = React.lazy(() => import('@/features/ClubSide/PrivacyPolicy'));
const MyPurchases = React.lazy(() => import('@/features/public-club/pages/MyPurchases'));
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
const DashboardCalendar = React.lazy(() => import('@/features/dashboard/DashboardCalendar').then(m => ({ default: m.DashboardCalendar })));
const CreateRide = React.lazy(() => import('@/features/dashboard/CreateRide').then(m => ({ default: m.CreateRide })));

// ── Auth & Public ──
import React, { Suspense } from 'react';
const LandingPage = React.lazy(() => import('@/features/landing/LandingPage'));
const CreateAccount = React.lazy(() => import('@/features/auth/CreateAccount'));
const Login = React.lazy(() => import('@/features/auth/Login'));
const ForgotPassword = React.lazy(() => import('@/features/auth/ForgotPassword'));
const VerifyEmail = React.lazy(() => import('@/features/auth/VerifyEmail'));
const AuthSubscription = React.lazy(() => import('@/features/auth/AuthSubscription'));

// ── Onboarding & Profiles (Standalone) ──
const CreateProfile = React.lazy(() => import('@/features/profile/CreateProfile'));
const AthleteProfileForm = React.lazy(() => import('@/features/profile/AthleteProfileForm'));
const SelectRole = React.lazy(() => import('@/features/profile/SelectRole'));
const ProfileSetup = React.lazy(() => import('@/features/club/ProfileSetup'));
const Subscriptions = React.lazy(() => import('@/features/club/Subscriptions'));
const SelectRoleClub = React.lazy(() => import('@/features/club/SelectRoleClub'));

// ── App Pages (Protected Shell) ──
const DashboardOverview = React.lazy(() => import('@/features/ClubSide/DashBoard').then(m => ({ default: m.DashboardOverview })));
const ProfileAccount = React.lazy(() => import('@/features/ClubSide/ProfileAccount'));
const Activities = React.lazy(() => import('@/features/ClubSide/Activities'));
const Product = React.lazy(() => import('@/features/ClubSide/Product'));
const AddProduct = React.lazy(() => import('@/features/ClubSide/AddProduct'));
const Order = React.lazy(() => import('@/features/ClubSide/Order'));
const OrderDetail = React.lazy(() => import('@/features/ClubSide/OrderDetail'));
const Wallet = React.lazy(() => import('@/features/ClubSide/Wallet'));
const Subscription = React.lazy(() => import('@/features/ClubSide/Subscription'));
const SubPaymentDet = React.lazy(() => import('@/features/ClubSide/SubPaymentDet'));
const Leaderboard = React.lazy(() => import('@/features/ClubSide/Leaderboard'));
const ClubJoiningReq = React.lazy(() => import('@/features/ClubSide/ClubJoiningReq').then(m => ({ default: m.ClubJoiningReq })));
const News = React.lazy(() => import('@/features/ClubSide/News'));
const NewsAdded = React.lazy(() => import('@/features/ClubSide/NewsAdded').then(m => ({ default: m.NewsAdded })));
const Discount = React.lazy(() => import('@/features/ClubSide/Discount'));
const AddDiscount = React.lazy(() => import('@/features/ClubSide/AddDiscount'));
const Clubs = React.lazy(() => import('@/features/public-club/pages/UserClub'));
const Ride = React.lazy(() => import('@/features/public-club/pages/Ride'));
const RideJoining = React.lazy(() => import('@/features/public-club/pages/RideJoining'));
const UserCalendar = React.lazy(() => import('@/features/public-club/pages/UserCalendar'));


// ── New Architecture Audit Fixes ──
const SavedRides = React.lazy(() => import('@/features/public-club/pages/SavedRides'));
const ClubPermissions = React.lazy(() => import('@/features/ClubSide/ClubPermissions'));
const ClubMembership = React.lazy(() => import('@/features/ClubSide/ClubMembership'));
const StripeConnect = React.lazy(() => import('@/features/ClubSide/StripeConnect'));
const ClubDetails = React.lazy(() => import('@/features/public-club/pages/ClubDetails'));
const Shop = React.lazy(() => import('@/features/public-club/pages/Shop'));
const Marketplace = React.lazy(() => import('@/features/public-club/pages/Marketplace'));
const UserSubscription = React.lazy(() => import('@/features/public-club/pages/UserSubscription'));
const UserWallet = React.lazy(() => import('@/features/public-club/pages/UserWallet'));
/* eslint-disable react-refresh/only-export-components */

// ── New Polished Support Page ──
const Support = React.lazy(() => import('@/features/support/Support'));

const Notifications = React.lazy(() => import('@/features/notifications/Notifications'));

// ── Standalone App Pages ──
const AboutApp = React.lazy(() => import('@/features/ClubSide/AboutApp'));
const ManageClubHome = React.lazy(() => import('@/features/ClubSide/ManageClubHome'));
const EditClub = React.lazy(() => import('@/features/ClubSide/EditClub'));

// ── Params-aware Legacy Redirect Helpers ──
import { useParams } from 'react-router-dom';

const LegacyOrderRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/view/clubside/order/${id}`} replace />;
};

const LegacyRideRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/view/userside/dashboard/ride/${id}`} replace />;
};

const LandingOrDashboard = () => {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const user = useAppSelector((s) => s.auth.user);
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <Suspense fallback={null}>
      <LandingPage />
    </Suspense>
  );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ── Public Auth Routes ── */}
      <Route path="/">
        <Route index element={<LandingOrDashboard />} />
        <Route path="signup" element={<CreateAccount />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="auth-subscription" element={<AuthSubscription />} />
      </Route>

      {/* ── Onboarding / Standalone Protected Routes ── */}
      {/* Note: wrapped in ProtectedRoute if they require auth, but for now we'll match original behavior 
          and just render them. You can wrap these in ProtectedRoute later if needed. */}
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/athlete-profile" element={<ProtectedRoute><AthleteProfileForm /></ProtectedRoute>} />
      <Route path="/club-profile-setup" element={<ProfileSetup />} />
      <Route path="/club-subscriptions" element={<Subscriptions />} />
      <Route path="/select-role-club" element={<SelectRoleClub />} />
      <Route path="/select-role" element={<SelectRole />} />

      {/* ── Dashboard Layout Shell & Child Routes ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<DashboardOverview />} />
        <Route path="activities" element={<Activities />} />
        <Route path="calendar" element={<DashboardCalendar />} />
        <Route path="rides/create" element={<CreateRide />} />
        <Route path="chat" element={<Support />} />
        <Route path="profile" element={<ProfileAccount />} />
      </Route>

      {/* ── Protected App Shell ── */}
      {/* All routes inside AppLayout will have the Sidebar and Navbar */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* ── Club Management (Clubside) ── */}
        <Route path="/manage-club" element={<Navigate to="/view/clubside/dashboard" replace />} />
        
        <Route path="/view/clubside">
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="activities" element={<Activities />} />
          <Route path="add-ride" element={<CreateRide />} />
          <Route path="product" element={<Product />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="order" element={<Order />} />
          <Route path="order/:id" element={<OrderDetail />} />
          <Route path="profile" element={<ProfileAccount />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="subscription/payment" element={<SubPaymentDet />} />
          <Route path="joining-requests" element={<ClubJoiningReq />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="members" element={<Members />} />
          <Route path="terms-conditions" element={<TermsConditions />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="news" element={<News />} />
          <Route path="news/add" element={<NewsAdded />} />
          <Route path="discount" element={<Discount role="organizer" />} />
          <Route path="discount/add" element={<AddDiscount />} />
          <Route path="support" element={<Support />} />
          <Route path="permissions" element={<ClubPermissions />} />
          <Route path="membership" element={<ClubMembership />} />
          <Route path="stripe-connect" element={<StripeConnect />} />
        </Route>

        {/* ── Athlete Interface (Userside) ── */}
        <Route path="/view/userside">
          <Route path="clubs" element={<Clubs />} />
          <Route path="club/:clubId" element={<ClubDetails />} />
          <Route path="activities" element={<Ride />} />
          <Route path="rides" element={<Ride />} />
          <Route path="calendar" element={<UserCalendar />} />
          <Route path="shop" element={<Shop />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="purchases" element={<MyPurchases />} />
          <Route path="subscription" element={<UserSubscription />} />
          <Route path="wallet" element={<UserWallet />} />
          <Route path="profile" element={<ProfileAccount role="athlete" />} />
          <Route path="support" element={<Support />} />
          <Route path="dashboard/ride/:id" element={<RideJoining />} />
          <Route path="saved-activities" element={<SavedRides />} />
          <Route path="saved-rides" element={<SavedRides />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ── Backwards Compatible Legacy Redirects ── */}
        <Route path="/calendar" element={<Navigate to="/view/userside/calendar" replace />} />
        <Route path="/dashboard" element={<Navigate to="/view/clubside/dashboard" replace />} />
        <Route path="/activities" element={<Navigate to="/view/clubside/activities" replace />} />
        <Route path="/product" element={<Navigate to="/view/clubside/product" replace />} />
        <Route path="/add-product" element={<Navigate to="/view/clubside/add-product" replace />} />
        <Route path="/order" element={<Navigate to="/view/clubside/order" replace />} />
        <Route path="/order/:id" element={<LegacyOrderRedirect />} />
        <Route path="/profile" element={<Navigate to="/view/clubside/profile" replace />} />
        <Route path="/wallet" element={<Navigate to="/view/clubside/wallet" replace />} />
        <Route path="/subscription" element={<Navigate to="/view/clubside/subscription" replace />} />
        <Route path="/subscription/payment" element={<Navigate to="/view/clubside/subscription/payment" replace />} />
        <Route path="/joining-requests" element={<Navigate to="/view/clubside/joining-requests" replace />} />
        <Route path="/leader-board" element={<Navigate to="/view/clubside/leaderboard" replace />} />
        <Route path="/members" element={<Navigate to="/view/clubside/members" replace />} />
        <Route path="/terms-conditions" element={<Navigate to="/view/clubside/terms-conditions" replace />} />
        <Route path="/privacy-policy" element={<Navigate to="/view/clubside/privacy-policy" replace />} />
        <Route path="/news" element={<Navigate to="/view/clubside/news" replace />} />
        <Route path="/news/add" element={<Navigate to="/view/clubside/news/add" replace />} />
        <Route path="/discount" element={<Navigate to="/view/clubside/discount" replace />} />
        <Route path="/discount/add" element={<Navigate to="/view/clubside/discount/add" replace />} />
        <Route path="/support/owner" element={<Navigate to="/view/clubside/support" replace />} />
        
        {/* ── Additional /dashboard/... legacy redirects ── */}
        <Route path="/dashboard/activities" element={<Navigate to="/view/clubside/activities" replace />} />
        <Route path="/dashboard/product" element={<Navigate to="/view/clubside/product" replace />} />
        <Route path="/dashboard/add-product" element={<Navigate to="/view/clubside/add-product" replace />} />
        <Route path="/dashboard/order" element={<Navigate to="/view/clubside/order" replace />} />
        <Route path="/dashboard/order/:id" element={<LegacyOrderRedirect />} />
        <Route path="/dashboard/profile" element={<Navigate to="/view/clubside/profile" replace />} />
        <Route path="/dashboard/wallet" element={<Navigate to="/view/clubside/wallet" replace />} />
        <Route path="/dashboard/subscription" element={<Navigate to="/view/clubside/subscription" replace />} />
        <Route path="/dashboard/subscription/payment" element={<Navigate to="/view/clubside/subscription/payment" replace />} />
        <Route path="/dashboard/joining-requests" element={<Navigate to="/view/clubside/joining-requests" replace />} />
        <Route path="/dashboard/leader-board" element={<Navigate to="/view/clubside/leaderboard" replace />} />
        <Route path="/dashboard/members" element={<Navigate to="/view/clubside/members" replace />} />
        <Route path="/dashboard/terms-conditions" element={<Navigate to="/view/clubside/terms-conditions" replace />} />
        <Route path="/dashboard/privacy-policy" element={<Navigate to="/view/clubside/privacy-policy" replace />} />
        <Route path="/dashboard/news" element={<Navigate to="/view/clubside/news" replace />} />
        <Route path="/dashboard/news/add" element={<Navigate to="/view/clubside/news/add" replace />} />
        <Route path="/dashboard/discount" element={<Navigate to="/view/clubside/discount" replace />} />
        <Route path="/dashboard/discount/add" element={<Navigate to="/view/clubside/discount/add" replace />} />

        <Route path="/clubs" element={<Navigate to="/view/userside/clubs" replace />} />
        <Route path="/athlete/rides" element={<Navigate to="/view/userside/rides" replace />} />
        <Route path="/athlete/marketplace" element={<Navigate to="/view/userside/marketplace" replace />} />
        <Route path="/athlete/purchases" element={<Navigate to="/view/userside/purchases" replace />} />
        <Route path="/athlete/leaderboard" element={<Navigate to="/view/userside/leaderboard" replace />} />
        <Route path="/athlete/news" element={<Navigate to="/view/userside/news" replace />} />
        <Route path="/athlete/promos" element={<Navigate to="/view/userside/promos" replace />} />
        <Route path="/athlete/profile" element={<Navigate to="/view/userside/profile" replace />} />
        <Route path="/support/athlete" element={<Navigate to="/view/userside/support" replace />} />
        <Route path="/clubs/Ride" element={<Navigate to="/view/userside/clubs/Ride" replace />} />
        <Route path="/dashboard/ride/:id" element={<LegacyRideRedirect />} />
      </Route>

      {/* ── Other Standalone Routes ── */}
      <Route path="/manage-club-home" element={<ManageClubHome />} />
      <Route path="/about-app" element={<AboutApp />} />
      <Route path="/edit-club" element={<EditClub />} />

      {/* ── Catch-all fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);