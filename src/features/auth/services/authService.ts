import { backendApi } from "@/api/backendApi";
import type { AppUser, LoginSuccessPayload } from "@/features/auth/types/authTypes";

interface AuthResponse {
  statusCode: number;
  message?: string;
  response: AppUser;
}

export const AuthService = {
  /**
   * Register a new user with email and password.
   */
  signup: async (email: string, password: string): Promise<LoginSuccessPayload> => {
    try {
      const { data } = await backendApi.post<AuthResponse>("/user/signup", {
        email,
        password,
      });
      
      const user: AppUser = {
        ...data.response,
        // Assume default role is athlete unless specified otherwise
        role: "athlete",
      };

      return { user };
    } catch (error: any) {
      console.error("❌ [AuthService] signup failed:", error);
      throw new Error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  },

  /**
   * Log in an existing user.
   */
  login: async (email: string, password: string): Promise<LoginSuccessPayload> => {
    try {
      const { data } = await backendApi.post<AuthResponse>("/user/login", {
        email,
        password,
      });

      const user: AppUser = {
        ...data.response,
        // Compute role dynamically based on athlete profile if available
        role: data.response.isAthleteProfile ? "athlete" : "organizer",
      };

      return { user };
    } catch (error: any) {
      console.error("❌ [AuthService] login failed:", error);
      throw new Error(error.response?.data?.message || "Invalid email or password.");
    }
  },

  /**
   * Send an OTP to the given email for password recovery.
   * Returns a temporary token needed for OTP validation.
   */
  sendForgotPasswordOtp: async (email: string): Promise<{ token: string; message: string }> => {
    try {
      const { data } = await backendApi.get<AuthResponse>(`/user/forgot/password?email=${encodeURIComponent(email)}`);
      return { token: data.response.token, message: data.message || "OTP sent successfully." };
    } catch (error: any) {
      console.error("❌ [AuthService] sendForgotPasswordOtp failed:", error);
      throw new Error(error.response?.data?.message || "Failed to send OTP.");
    }
  },

  /**
   * Resend the OTP using the temporary token.
   */
  resendOtp: async (token: string): Promise<string> => {
    try {
      const { data } = await backendApi.put<any>(
        "/user/resend/otp",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.message || "OTP resent successfully.";
    } catch (error: any) {
      console.error("❌ [AuthService] resendOtp failed:", error);
      throw new Error(error.response?.data?.message || "Failed to resend OTP.");
    }
  },

  /**
   * Validate the OTP using the temporary token.
   * Returns a new token that allows password change.
   */
  validateOtp: async (otp: number, token: string): Promise<{ token: string; message: string }> => {
    try {
      const { data } = await backendApi.put<AuthResponse>(
        "/user/validate/otp",
        { OTP: otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return { token: data.response.token, message: data.message || "OTP validated successfully." };
    } catch (error: any) {
      console.error("❌ [AuthService] validateOtp failed:", error);
      throw new Error(error.response?.data?.message || "Invalid OTP.");
    }
  },

  /**
   * Change password using the token received from validateOtp.
   */
  changePassword: async (newPassword: string, token: string): Promise<string> => {
    try {
      const { data } = await backendApi.put<any>(
        "/user/change/password",
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data.message || "Password successfully updated.";
    } catch (error: any) {
      console.error("❌ [AuthService] changePassword failed:", error);
      throw new Error(error.response?.data?.message || "Failed to change password.");
    }
  },

  /**
   * Update the logged-in user's password (requires their current active auth token).
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
    try {
      const { data } = await backendApi.put<any>("/user/update/password", {
        password: currentPassword,
        newPassword: newPassword,
      });
      return data.message || "Password updated successfully.";
    } catch (error: any) {
      console.error("❌ [AuthService] updatePassword failed:", error);
      throw new Error(error.response?.data?.message || "Failed to update password.");
    }
  },

  /**
   * Upsert athlete profile details.
   */
  upsertAthleteProfile: async (profileData: any): Promise<AppUser> => {
    try {
      const { data } = await backendApi.put<AuthResponse>("/user/update/athlete/profile", profileData);
      const user: AppUser = {
        ...data.response,
        role: "athlete",
      };
      return user;
    } catch (error: any) {
      console.error("❌ [AuthService] upsertAthleteProfile failed:", error);
      throw new Error(error.response?.data?.message || "Failed to update profile.");
    }
  },

  /**
   * Fetch current user info.
   */
  userInfo: async (): Promise<AppUser> => {
    try {
      const { data } = await backendApi.get<AuthResponse>("/user/info");
      const user: AppUser = {
        ...data.response,
        role: data.response.isAthleteProfile ? "athlete" : "organizer",
      };
      return user;
    } catch (error: any) {
      console.error("❌ [AuthService] userInfo failed:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch user info.");
    }
  },

  /**
   * Upload a file (e.g., profile image).
   */
  uploadFile: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await backendApi.post<any>("/user/upload/file", formData);
      return data.response; // assuming the response contains the file URL
    } catch (error: any) {
      console.error("❌ [AuthService] uploadFile failed:", error);
      throw new Error(error.response?.data?.message || "Failed to upload file.");
    }
  },

  /**
   * Firebase login using ID token.
   */
  firebaseLogin: async (idToken: string): Promise<LoginSuccessPayload> => {
    try {
      const { data } = await backendApi.post<AuthResponse>("/user/login/firebase", { idToken });
      const user: AppUser = {
        ...data.response,
        role: data.response.isAthleteProfile ? "athlete" : "organizer",
      };
      return { user };
    } catch (error: any) {
      console.error("❌ [AuthService] firebaseLogin failed:", error);
      throw new Error(error.response?.data?.message || "Firebase login failed.");
    }
  },

  /**
   * Update FCM Token for push notifications.
   */
  updateFcmToken: async (fcmToken: string): Promise<string> => {
    try {
      const { data } = await backendApi.put<any>("/user/fcm-token", { fcmToken });
      return data.message || "FCM Token updated successfully.";
    } catch (error: any) {
      console.error("❌ [AuthService] updateFcmToken failed:", error);
      throw new Error(error.response?.data?.message || "Failed to update FCM Token.");
    }
  },

  /**
   * Update scale unit settings (e.g., metric/imperial).
   */
  updateScaleSettings: async (scale: string): Promise<string> => {
    try {
      const { data } = await backendApi.put<any>("/user/unit/settings", { scale: scale.toLowerCase() });
      return data.message || "Scale unit settings updated successfully.";
    } catch (error: any) {
      console.error("❌ [AuthService] updateScaleSettings failed:", error);
      throw new Error(error.response?.data?.message || "Failed to update scale unit settings.");
    }
  },

  /**
   * Check if an email exists in the system.
   */
  checkEmailExistence: async (email: string): Promise<boolean> => {
    try {
      const { data } = await backendApi.get<any>(`/user/check-email?email=${encodeURIComponent(email)}`);
      // Assuming it returns a truthy value or specific flag
      return !!data.response;
    } catch (error: any) {
      console.error("❌ [AuthService] checkEmailExistence failed:", error);
      throw new Error(error.response?.data?.message || "Failed to check email existence.");
    }
  },

  /**
   * Get another user's info by their user ID.
   */
  getOtherUserInfo: async (userId: number): Promise<AppUser> => {
    try {
      const { data } = await backendApi.get<AuthResponse>(`/user/details?userId=${userId}`);
      const user: AppUser = {
        ...data.response,
        role: data.response.isAthleteProfile ? "athlete" : "organizer",
      };
      return user;
    } catch (error: any) {
      console.error("❌ [AuthService] getOtherUserInfo failed:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch user details.");
    }
  }
};
