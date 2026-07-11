import { useState } from "react";
import { AuthService } from "@/features/auth/services/authService";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { loginUser, registerUser, setUser } from "@/features/auth/slices/authSlice";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.sendForgotPasswordOtp(email);
      toast.success(response.message);
      return response.token; // Temporary token needed for validateOtp
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async (otp: number, tempToken: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.validateOtp(otp, tempToken);
      toast.success(response.message);
      return response.token; // New token for changePassword
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (tempToken: string) => {
    setIsLoading(true);
    try {
      const message = await AuthService.resendOtp(tempToken);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (newPassword: string, token: string) => {
    setIsLoading(true);
    try {
      const message = await AuthService.changePassword(newPassword, token);
      toast.success(message);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpsertProfile = async (profileData: any) => {
    setIsLoading(true);
    try {
      const updatedUser = await AuthService.upsertAthleteProfile(profileData);
      toast.success("Profile updated successfully");
      dispatch(setUser(updatedUser));
      return updatedUser;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const user = await AuthService.userInfo();
      dispatch(setUser(user));
      return user;
    } catch (error: any) {
      console.error("Failed to fetch user info", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleForgotPassword,
    handleValidateOtp,
    handleResendOtp,
    handleChangePassword,
    handleUpsertProfile,
    handleFetchUserInfo,
    // Provide access to thunks just in case we want a unified hook interface
    login: (credentials: any) => dispatch(loginUser(credentials)),
    register: (credentials: any) => dispatch(registerUser(credentials)),
  };
};
