/**
 * @fileoverview Redux store with redux-persist for auth state persistence.
 *
 * Architecture:
 *  - RTK's configureStore with a persisted reducer.
 *  - Only 'auth' slice is persisted (localStorage) — extend whitelist as needed.
 *  - serializableCheck ignores redux-persist internal actions.
 */
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/es/storage';
import authReducer from '@/features/auth/slices/authSlice';
import { STORAGE_KEYS } from '@/Constants';

// ─── Root Reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: authReducer,
  // Add new feature slices here (e.g., clubs: clubsReducer)
});

// ─── Persist Config ───────────────────────────────────────────────────────────

const persistConfig = {
  key:       STORAGE_KEYS.PERSIST_ROOT,
  version:   1,
  storage,
  // Only persist auth — keeps other state ephemeral (re-fetched on load)
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required by redux-persist: these action types carry non-serializable values
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// ─── Typed Exports ────────────────────────────────────────────────────────────

/** Full Redux state shape (from un-persisted rootReducer for accurate typing). */
export type RootState = ReturnType<typeof rootReducer>;

/** Typed dispatch — includes thunk middleware types. */
export type AppDispatch = typeof store.dispatch;
