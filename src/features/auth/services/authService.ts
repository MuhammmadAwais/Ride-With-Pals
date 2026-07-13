import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { AuthService as ApiAuthService, UserService as ApiUserService } from '@/api/backendApi';
import { setUser } from '../slices/authSlice';
import type { AppUser, LoginSuccessPayload, LoginFormValues } from '../types/authTypes';

export const useAuth = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginFormValues): Promise<LoginSuccessPayload | void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiAuthService.login(credentials);
      const user: AppUser = {
        ...response.response,
        role: response.response?.isAthleteProfile ? 'athlete' : 'organizer',
      };
      dispatch(setUser(user));
      toast.success('Logged in successfully!');
      return { user };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: LoginFormValues): Promise<LoginSuccessPayload | void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiAuthService.signup(credentials);
      const user: AppUser = {
        ...response.response,
        role: 'athlete',
      };
      dispatch(setUser(user));
      toast.success('Account created successfully!');
      return { user };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Signup failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const firebaseLogin = async (idToken: string): Promise<LoginSuccessPayload | void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiAuthService.firebaseLogin({ idToken });
      const user: AppUser = {
        ...response.response,
        role: response.response?.isAthleteProfile ? 'athlete' : 'organizer',
      };
      dispatch(setUser(user));
      toast.success('Logged in via Firebase successfully!');
      return { user };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Firebase Login failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiAuthService.forgotPassword({ email });
      toast.success(response.message || 'OTP sent successfully.');
      return { token: response.response?.token, message: response.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to send OTP.';
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const validateOtp = async (otp: number, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Assuming validateOTP is defined in ApiAuthService
      const response = await ApiAuthService.validateOTP({ OTP: otp }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(response.message || 'OTP validated successfully.');
      return { token: response.response?.token, message: response.message };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Invalid OTP.';
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (password: string, token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiAuthService.changePassword({ password }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(response.message || 'Password successfully updated.');
      return response.message;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to change password.';
      setError(msg);
      toast.error(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signup,
    firebaseLogin,
    forgotPassword,
    validateOtp,
    changePassword,
    isLoading,
    error,
  };
};

// We also keep the old AuthService for backward compatibility in Redux thunks if they are still used
export const AuthService = {
  signup: async (email: string, password: string): Promise<LoginSuccessPayload> => {
    const response = await ApiAuthService.signup({ email, password });
    return { user: { ...response.response, role: 'athlete' } };
  },
  login: async (email: string, password: string): Promise<LoginSuccessPayload> => {
    const response = await ApiAuthService.login({ email, password });
    return { user: { ...response.response, role: response.response?.isAthleteProfile ? 'athlete' : 'organizer' } };
  },
  firebaseLogin: async (idToken: string): Promise<LoginSuccessPayload> => {
    const response = await ApiAuthService.firebaseLogin({ idToken });
    return { user: { ...response.response, role: response.response?.isAthleteProfile ? 'athlete' : 'organizer' } };
  },
  userInfo: async (): Promise<AppUser> => {
    const response = await ApiUserService.userInfo();
    return { ...response.response, role: response.response?.isAthleteProfile ? 'athlete' : 'organizer' };
  }
};
