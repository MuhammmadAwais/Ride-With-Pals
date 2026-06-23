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

// ── New Polished Support Page ──
import Support from '@/features/support/Support';

// ── Standalone App Pages ──
import AboutApp from '@/features/ClubSide/AboutApp';
import ManageClubHome from '@/features/ClubSide/ManageClubHome';
import EditClub from '@/features/ClubSide/EditClub';

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
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/product" element={<Product />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/order" element={<Order />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<ProfileAccount />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/subscription/payment" element={<SubPaymentDet />} />
        <Route path="/joining-requests" element={<ClubJoiningReq />} />
        <Route path="/leader-board" element={<Leaderboard />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/add" element={<NewsAdded />} />
        
        <Route path="/discount" element={<Discount role="organizer" />} />
        <Route path="/discount/add" element={<AddDiscount />} />
        <Route path="/my-promos" element={<Discount role="athlete" />} />

        {/* Support Pages — Route to the new polished Support component */}
        <Route path="/support/owner" element={<Support />} />
        <Route path="/support/athlete" element={<Support />} />

        <Route path="/clubs" element={<Clubs />} />
        <Route path="/clubs/Ride" element={<Ride />} />
        <Route path="/dashboard/ride/:id" element={<RideJoining />} />
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