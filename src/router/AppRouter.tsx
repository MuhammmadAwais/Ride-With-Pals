import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';

// Import your components
import CreateAccount from '../features/auth/CreateAccount'; 
import Login from '../features/auth/Login'; 
import ForgotPassword from '../features/auth/ForgotPassword'; 
import VerifyEmail from '../features/auth/VerifyEmail';
import CreateProfile from '../features/profile/CreateProfile'; 
import AthleteProfileForm from '../features/profile/AthleteProfileForm';
import SelectRole from '../features/profile/SelectRole';
import ProfileSetup from '../features/club/ProfileSetup'; 
import Subscriptions from '../features/club/Subscriptions';
import SelectRoleClub from '../features/club/SelectRoleClub';

// Dashboard components
import DashBoard, { DashboardOverview } from '../features/home/DashBoard';
import ProfileAccount from '../features/home/ProfileAccount';
import ManageClub from '../features/home/ManageClub';
import Activities from '../features/home/Activities';
import Product from '../features/home/Product';
import AddProduct from '../features/home/AddProduct';
import Order from '../features/home/Order';
import OrderDetail from '../features/home/OrderDetail';
import Wallet from '../features/home/Wallet';
import Subscription from '../features/home/Subscription';


export const AppRouter = () => {
  return (
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <Routes>
          {/* --- Public/Auth Routes --- */}
          <Route path="/" element={<CreateAccount />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/athlete-profile" element={<AthleteProfileForm />} />
          <Route path="/club-profile-setup" element={<ProfileSetup />} />
          <Route path="/club-subscriptions" element={<Subscriptions />} />
          <Route path="/select-role-club" element={<SelectRoleClub />} />
          <Route path="/select-role" element={<SelectRole />} />

          {/* --- Dashboard Routes (Uses DashBoard as Layout) --- */}
          <Route path="/dashboard" element={<DashBoard />}>
            <Route index element={<DashboardOverview />} /> 
            <Route path="activities" element={<Activities />} />
            <Route path="product" element={<Product />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="order" element={<Order />} />
            <Route path="order/:id" element={<OrderDetail />} />
            <Route path="profile" element={<ProfileAccount />} /> 
            <Route path="wallet" element={<Wallet />} /> 
           <Route path="subscription" element={<Subscription />} />
          </Route>

          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/dashboard/manage-club" element={<ManageClub />} />
          
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};