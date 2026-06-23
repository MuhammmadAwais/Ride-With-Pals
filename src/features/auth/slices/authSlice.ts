/**
 * @fileoverview Auth Redux slice.
 *
 * State: user (AppUser | null), isAuthenticated, isLoading, error.
 * Actions: logout, clearError, setUser.
 * Thunk: loginUser (async, uses mockLogin service).
 *
 * Persisted via redux-persist (auth key whitelisted in store.ts).
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockLogin } from '@/features/auth/services/authService';
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

// ─── Async Thunk — Login ──────────────────────────────────────────────────────

/**
 * Authenticates the user via the auth service.
 * On success → stores user in Redux (persisted via redux-persist).
 * On failure → rejectWithValue triggers the rejected case below.
 */
export const loginUser = createAsyncThunk<
  LoginSuccessPayload,
  LoginFormValues,
  { rejectValue: string }
>(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      return await mockLogin(credentials.email, credentials.password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
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
     * Directly set user (e.g., after OTP/SSO flow where credentials don't
     * go through the loginUser thunk).
     */
    setUser(state, action: PayloadAction<AppUser>) {
      state.user            = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
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
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
