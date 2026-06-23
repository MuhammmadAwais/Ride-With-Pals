/** TypeScript types for auth state management. */

/** Represents an authenticated web app user. */
export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'organizer' | 'athlete' | 'owner';
  avatar?: string;
}

/** Redux auth slice shape. */
export interface AuthState {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
