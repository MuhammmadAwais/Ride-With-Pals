import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateAccount from '../features/auth/CreateAccount'; 
import Login from '../features/auth/Login'; 
import ForgotPassword from '../features/auth/ForgotPassword'; 
import VerifyEmail from '../features/auth/VerifyEmail';
import CreateProfile from '../features/profile/CreateProfile'; 
import AthleteProfileForm from '../features/profile/AthleteProfileForm';
import SelectRole from '../features/profile/SelectRole';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        
        <Route path="/athlete-profile" element={<AthleteProfileForm />} />

        <Route path="/select-role" element={<SelectRole />} />
        
        <Route path="/home" element={<div>Home Screen</div>} />
      </Routes>
    </BrowserRouter>
  );
};