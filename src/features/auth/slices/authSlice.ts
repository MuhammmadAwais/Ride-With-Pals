/**
 * @fileoverview Auth Redux slice.
 *
 * State: user (AppUser | null), isAuthenticated, isLoading, error.
 * Actions: logout, clearError, setUser.
 * Thunk: loginUser, registerUser (async, uses real AuthService).
 *
 * Persisted via redux-persist (auth key whitelisted in store.ts).
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '@/features/auth/services/authService';
import type {
  AuthState,
  AppUser,
  LoginFormValues,
  LoginSuccessPayload,
} from '@/features/auth/types/authTypes';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user:            null,
  isAuthenticated: false,
  isLoading:       false,
  error:           null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Authenticates the user via the auth service.
 */
export const loginUser = createAsyncThunk<
  LoginSuccessPayload,
  LoginFormValues,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      return await AuthService.login(credentials.email, credentials.password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      return rejectWithValue(message);
    }
  },
);

/**
 * Registers a new user via the auth service.
 */
export const registerUser = createAsyncThunk<
  LoginSuccessPayload,
  LoginFormValues,
  { rejectValue: string }
>(
  'auth/registerUser',
  async (credentials, { rejectWithValue }) => {
    try {
      return await AuthService.signup(credentials.email, credentials.password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      return rejectWithValue(message);
    }
  },
);

/**
 * Firebase login via ID token
 */
export const firebaseLoginThunk = createAsyncThunk<
  LoginSuccessPayload,
  string, // idToken
  { rejectValue: string }
>(
  'auth/firebaseLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      return await AuthService.firebaseLogin(idToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Firebase login failed.';
      return rejectWithValue(message);
    }
  },
);

/**
 * Refresh user info
 */
export const refreshUserInfo = createAsyncThunk<
  AppUser,
  void,
  { rejectValue: string }
>(
  'auth/refreshUserInfo',
  async (_, { rejectWithValue }) => {
    try {
      return await AuthService.userInfo();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user info.';
      return rejectWithValue(message);
    }
  },
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Clear auth state and user — called on logout. */
    logout(state) {
      state.user            = null;
      state.isAuthenticated = false;
      state.error           = null;
    },
    /** Clear the current error message. */
    clearError(state) {
      state.error = null;
    },
    /**
     * Directly set user (e.g., after OTP/SSO flow or profile update).
     */
    setUser(state, action: PayloadAction<AppUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading      = false;
        state.user           = action.payload.user;
        state.isAuthenticated = true;
        state.error          = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading      = false;
        state.isAuthenticated = false;
        state.error          = action.payload ?? 'An unexpected error occurred.';
      });
    
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading      = false;
        state.user           = action.payload.user;
        state.isAuthenticated = true;
        state.error          = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading      = false;
        state.isAuthenticated = false;
        state.error          = action.payload ?? 'An unexpected error occurred.';
      });

    // Firebase Login
    builder
      .addCase(firebaseLoginThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(firebaseLoginThunk.fulfilled, (state, action) => {
        state.isLoading      = false;
        state.user           = action.payload.user;
        state.isAuthenticated = true;
        state.error          = null;
      })
      .addCase(firebaseLoginThunk.rejected, (state, action) => {
        state.isLoading      = false;
        state.isAuthenticated = false;
        state.error          = action.payload ?? 'An unexpected error occurred.';
      });

    // Refresh User Info
    builder
      .addCase(refreshUserInfo.pending, (state) => {
        // Silently refresh info without blocking UI
        state.error = null;
      })
      .addCase(refreshUserInfo.fulfilled, (state, action) => {
        state.user = action.payload;
        // Keep existing isAuthenticated state
        if (state.user) state.isAuthenticated = true;
      })
      .addCase(refreshUserInfo.rejected, (state, action) => {
        // Don't log out the user on a simple info fetch fail, just store error
        state.error = action.payload ?? 'An unexpected error occurred while fetching user info.';
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
