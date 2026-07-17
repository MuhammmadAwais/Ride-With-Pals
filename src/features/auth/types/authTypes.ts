/** TypeScript types for auth state management. */

/** Represents an authenticated web app user. */
export interface AppUser {
  id: string | number;
  email: string;
  name?: string;
  token: string;
  isAthleteProfile?: boolean | number;
  role?: 'organizer' | 'athlete' | 'owner'; // Computed or fallback
  avatar?: string;
  // Other potential fields from upsert profile
  profileImage?: string;
  fullName?: string;
  dob?: string;
  country?: string;
  phone?: string;
}

/** Redux auth slice shape. */
export interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isOtpVerified?: boolean;
}

/** Form values submitted from the Login form. */
export interface LoginFormValues {
  email: string;
  password: string;
}

/** Payload returned on successful login. */
export interface LoginSuccessPayload {
  user: AppUser;
}
