import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { loginUser, registerUser, setUser } from "@/features/auth/slices/authSlice";
import { AuthService as ApiAuthService, UserService as ApiUserService } from "@/api/backendApi";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await ApiAuthService.forgotPassword({ email });
      toast.success(response.message || "OTP sent");
      return response.response?.token; 
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateOtp = async (otp: number, tempToken: string) => {
    setIsLoading(true);
    try {
      const response = await ApiAuthService.validateOTP({ OTP: otp }, { headers: { Authorization: `Bearer ${tempToken}` } });
      toast.success(response.message || "OTP validated");
      return response.response?.token;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (tempToken: string) => {
    setIsLoading(true);
    try {
      const response = await ApiAuthService.resendOTP({}, { headers: { Authorization: `Bearer ${tempToken}` } });
      toast.success(response.message || "OTP resent");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (newPassword: string, token: string) => {
    setIsLoading(true);
    try {
      const response = await ApiAuthService.changePassword({ password: newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(response.message || "Password updated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpsertProfile = async (profileData: any) => {
    setIsLoading(true);
    try {
      const response = await ApiUserService.upsertAthleteProfile(profileData);
      toast.success("Profile updated successfully");
      const updatedUser = response.response;
      dispatch(setUser({ ...updatedUser, role: updatedUser?.isAthleteProfile ? 'athlete' : 'organizer' }));
      return updatedUser;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchUserInfo = async () => {
    setIsLoading(true);
    try {
      const response = await ApiUserService.userInfo();
      const user = response.response;
      dispatch(setUser({ ...user, role: user?.isAthleteProfile ? 'athlete' : 'organizer' }));
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
    login: (credentials: any) => dispatch(loginUser(credentials)),
    register: (credentials: any) => dispatch(registerUser(credentials)),
  };
};
