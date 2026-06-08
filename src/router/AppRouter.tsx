import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../features/auth/Login';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/home" element={<div>Home Screen</div>} />
      </Routes>
    </BrowserRouter>
  );
};