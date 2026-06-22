import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Import your auth/profile components
import CreateAccount from '../features/auth/CreateAccount'; 
import Login from '../features/auth/Login'; 
import ForgotPassword from '../features/auth/ForgotPassword'; 
import VerifyEmail from '../features/auth/VerifyEmail';
import AuthSubscription from '../features/auth/AuthSubscription'; // Added import for AuthSubscription
import CreateProfile from '../features/profile/CreateProfile'; 
import AthleteProfileForm from '../features/profile/AthleteProfileForm';
import SelectRole from '../features/profile/SelectRole';
import ProfileSetup from '../features/club/ProfileSetup'; 
import Subscriptions from '../features/club/Subscriptions';
import SelectRoleClub from '../features/club/SelectRoleClub';

// Dashboard / ClubSide components
import DashBoard, { DashboardOverview } from '../features/ClubSide/DashBoard';
import ProfileAccount from '../features/ClubSide/ProfileAccount';
import ManageClub from '../features/ClubSide/ManageClub';
import Activities from '../features/ClubSide/Activities';
import Product from '../features/ClubSide/Product';
import AddProduct from '../features/ClubSide/AddProduct';
import Order from '../features/ClubSide/Order';
import OrderDetail from '../features/ClubSide/OrderDetail';
import Wallet from '../features/ClubSide/Wallet';
import Subscription from '../features/ClubSide/Subscription';
import SubPaymentDet from '../features/ClubSide/SubPaymentDet';
import Leaderboard from '../features/ClubSide/Leaderboard';
import { ClubJoiningReq } from '../features/ClubSide/ClubJoiningReq';
import News from '../features/ClubSide/News';
import { NewsAdded } from '../features/ClubSide/NewsAdded';

// Import Discount Components
import Discount from '../features/ClubSide/Discount';
import AddDiscount from '../features/ClubSide/AddDiscount';

import AboutApp from '../features/ClubSide/AboutApp';
import ManageClubHome from '../features/ClubSide/ManageClubHome';
import EditClub from "../features/ClubSide/EditClub";
import { OrganizerSupport, AthleteSupport } from '../features/ClubSide/SupportHelp';

// Public side & Ride components
import Clubs from '../features/public-club/pages/UserClub';
import Ride from '../features/public-club/pages/Ride';
import RideJoining from '../features/public-club/pages/RideJoining'; 

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <Routes>
          {/* --- Public/Auth Routes --- */}
          <Route path="/" element={<CreateAccount />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth-subscription" element={<AuthSubscription />} /> {/* Added route for AuthSubscription */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/athlete-profile" element={<AthleteProfileForm />} />
          <Route path="/club-profile-setup" element={<ProfileSetup />} />
          <Route path="/club-subscriptions" element={<Subscriptions />} />
          <Route path="/select-role-club" element={<SelectRoleClub />} />
          <Route path="/select-role" element={<SelectRole />} />
          
          {/* --- Direct Root Level Routes --- */}
          <Route path="/dashboard" element={<DashBoard defaultView={<DashboardOverview />} />} />
          <Route path="/activities" element={<DashBoard defaultView={<Activities />} />} />
          <Route path="/product" element={<DashBoard defaultView={<Product />} />} />
          <Route path="/add-product" element={<DashBoard defaultView={<AddProduct />} />} />
          <Route path="/order" element={<DashBoard defaultView={<Order />} />} />
          <Route path="/order/:id" element={<DashBoard defaultView={<OrderDetail />} />} />
          <Route path="/profile" element={<DashBoard defaultView={<ProfileAccount />} />} /> 
          <Route path="/wallet" element={<DashBoard defaultView={<Wallet />} />} /> 
          <Route path="/subscription" element={<DashBoard defaultView={<Subscription />} />} />
          <Route path="/subscription/payment" element={<DashBoard defaultView={<SubPaymentDet />} />} />
          <Route path="/joining-requests" element={<DashBoard defaultView={<ClubJoiningReq />} />} />
          <Route path="/leader-board" element={<DashBoard defaultView={<Leaderboard />} />} />
          <Route path="/news" element={<DashBoard defaultView={<News />} />} />
          <Route path="/news/add" element={<DashBoard defaultView={<NewsAdded />} />} />
          
          {/* Club Management Discount Routes */}
          <Route path="/discount" element={<DashBoard defaultView={<Discount role="organizer" />} />} />
          <Route path="/discount/add" element={<DashBoard defaultView={<AddDiscount />} />} />
          
          {/* Athlete Promo Wallet Route */}
          <Route path="/my-promos" element={<DashBoard defaultView={<Discount role="athlete" />} />} />

          {/* Owner / Organizer Support Route */}
          <Route path="/support/owner" element={<DashBoard defaultView={<OrganizerSupport />} />} />

          {/* Athlete / User Support Route */}
          <Route path="/support/athlete" element={<DashBoard defaultView={<AthleteSupport />} />} />
          
          {/* Community/User Interface Route */}
          <Route path="/clubs" element={<DashBoard defaultView={<Clubs />} />} />

          {/* Base Ride Listing Route */}
          <Route path="/clubs/Ride" element={<DashBoard defaultView={<Ride />} />} />

          {/* Detailed Ride Joining Route */}
          <Route path="/dashboard/ride/:id" element={<DashBoard defaultView={<RideJoining />} />} />

          {/* Standalone routes with NO Sidebar/Header */}
          <Route path="/manage-club-home" element={<ManageClubHome />} />
          <Route path="/manage-club" element={<ManageClub />} />
          <Route path="/about-app" element={<AboutApp />} />
          <Route path="/edit-club" element={<EditClub />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};