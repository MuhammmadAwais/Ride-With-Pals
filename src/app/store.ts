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
import clubReducer from '@/features/club/slices/clubSlice';
import addRideReducer from '@/features/club/slices/addRideSlice';
import { STORAGE_KEYS } from '@/Constants';
import { apiSlice } from '@/api/apiSlice';

// ─── Root Reducer ─────────────────────────────────────────────────────────────

const rootReducer = combineReducers({
  auth: authReducer,
  club: clubReducer,
  addRide: addRideReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
  // Add new feature slices here (e.g., news: newsReducer)
});

// ─── Persist Config ───────────────────────────────────────────────────────────

const persistConfig = {
  key:       STORAGE_KEYS.PERSIST_ROOT,
  version:   1,
  storage,
  // Only persist auth — keeps other state ephemeral (re-fetched on load)
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer) as unknown as typeof rootReducer;

// ─── Store ────────────────────────────────────────────────────────────────────

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Required by redux-persist: these action types carry non-serializable values
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

// ─── Typed Exports ────────────────────────────────────────────────────────────

/** Full Redux state shape (from un-persisted rootReducer for accurate typing). */
export type RootState = ReturnType<typeof rootReducer>;

/** Typed dispatch — includes thunk middleware types. */
export type AppDispatch = typeof store.dispatch;
