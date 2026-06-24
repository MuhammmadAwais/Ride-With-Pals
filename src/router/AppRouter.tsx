/**
 * @fileoverview Central App Router (React Router v6 data router).
 *
 * Architecture:
 * - Public routes (Auth, Onboarding) are rendered directly.
 * - Protected routes are wrapped in <ProtectedRoute> which checks Redux auth.
 * - Shell routes (Dashboard, Activities, etc.) are nested inside <AppLayout>.
 */
import { createBrowserRouter, createRoutesFromElements, Route, Navigate } from 'react-router-dom';

// ── Layouts & Guards ──
import Members from '@/features/ClubSide/Members';
import TermsConditions from '@/features/ClubSide/TermsConditions';
import PrivacyPolicy from '@/features/ClubSide/PrivacyPolicy';
import MyPurchases from '@/features/public-club/pages/MyPurchases';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// ── Auth & Public ──
import CreateAccount from '@/features/auth/CreateAccount';
import Login from '@/features/auth/Login';
import ForgotPassword from '@/features/auth/ForgotPassword';
import VerifyEmail from '@/features/auth/VerifyEmail';
import AuthSubscription from '@/features/auth/AuthSubscription';

// ── Onboarding & Profiles (Standalone) ──
import CreateProfile from '@/features/profile/CreateProfile';
import AthleteProfileForm from '@/features/profile/AthleteProfileForm';
import SelectRole from '@/features/profile/SelectRole';
import ProfileSetup from '@/features/club/ProfileSetup';
import Subscriptions from '@/features/club/Subscriptions';
import SelectRoleClub from '@/features/club/SelectRoleClub';

// ── App Pages (Protected Shell) ──
import { DashboardOverview } from '@/features/ClubSide/DashBoard';
import ProfileAccount from '@/features/ClubSide/ProfileAccount';
import ManageClub from '@/features/ClubSide/ManageClub';
import Activities from '@/features/ClubSide/Activities';
import Product from '@/features/ClubSide/Product';
import AddProduct from '@/features/ClubSide/AddProduct';
import Order from '@/features/ClubSide/Order';
import OrderDetail from '@/features/ClubSide/OrderDetail';
import Wallet from '@/features/ClubSide/Wallet';
import Subscription from '@/features/ClubSide/Subscription';
import SubPaymentDet from '@/features/ClubSide/SubPaymentDet';
import Leaderboard from '@/features/ClubSide/Leaderboard';
import { ClubJoiningReq } from '@/features/ClubSide/ClubJoiningReq';
import News from '@/features/ClubSide/News';
import { NewsAdded } from '@/features/ClubSide/NewsAdded';
import Discount from '@/features/ClubSide/Discount';
import AddDiscount from '@/features/ClubSide/AddDiscount';
import Clubs from '@/features/public-club/pages/UserClub';
import Ride from '@/features/public-club/pages/Ride';
import RideJoining from '@/features/public-club/pages/RideJoining';
import Marketplace from '@/features/public-club/pages/Marketplace';

// ── New Polished Support Page ──
import Support from '@/features/support/Support';

// ── Standalone App Pages ──
import AboutApp from '@/features/ClubSide/AboutApp';
import ManageClubHome from '@/features/ClubSide/ManageClubHome';
import EditClub from '@/features/ClubSide/EditClub';

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

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* ── Public Auth Routes ── */}
      <Route path="/">
        <Route index element={<CreateAccount />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="auth-subscription" element={<AuthSubscription />} />
      </Route>

      {/* ── Onboarding / Standalone Protected Routes ── */}
      {/* Note: wrapped in ProtectedRoute if they require auth, but for now we'll match original behavior 
          and just render them. You can wrap these in ProtectedRoute later if needed. */}
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/athlete-profile" element={<AthleteProfileForm />} />
      <Route path="/club-profile-setup" element={<ProfileSetup />} />
      <Route path="/club-subscriptions" element={<Subscriptions />} />
      <Route path="/select-role-club" element={<SelectRoleClub />} />
      <Route path="/select-role" element={<SelectRole />} />

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
        <Route path="/view/clubside">
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="activities" element={<Activities />} />
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
        </Route>

        {/* ── Athlete Interface (Userside) ── */}
        <Route path="/view/userside">
          <Route path="clubs" element={<Clubs />} />
          <Route path="rides" element={<Ride />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="purchases" element={<MyPurchases />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="news" element={<News />} />
          <Route path="promos" element={<Discount role="athlete" />} />
          <Route path="profile" element={<ProfileAccount role="athlete" />} />
          <Route path="support" element={<Support />} />
          <Route path="clubs/Ride" element={<Ride />} />
          <Route path="dashboard/ride/:id" element={<RideJoining />} />
        </Route>

        {/* ── Backwards Compatible Legacy Redirects ── */}
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
        <Route path="/athlete/wallet" element={<Navigate to="/view/userside/wallet" replace />} />
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
      <Route path="/manage-club" element={<ManageClub />} />
      <Route path="/about-app" element={<AboutApp />} />
      <Route path="/edit-club" element={<EditClub />} />

      {/* ── Catch-all fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </>
  )
);