import { apiSlice } from '@/api/apiSlice';
import {
  deleteClubFromState,
  fetchMyClubs,
  fetchJoinedClubs,
  fetchExploreClubs,
} from '@/features/club/slices/clubSlice';

/**
 * Remove ALL club-related keys from localStorage and sessionStorage.
 * Scans every key in localStorage to ensure no user-scoped or legacy key is left behind.
 */
export const clearAllClubStorage = (uid?: string | number) => {
  if (typeof window === 'undefined') return;

  if (window.localStorage) {
    if (uid) {
      localStorage.removeItem(`selectedClubId_${uid}`);
      localStorage.removeItem(`selectedClubName_${uid}`);
      localStorage.removeItem(`selectedClubLogo_${uid}`);
      localStorage.removeItem(`selectedClubBanner_${uid}`);
    }
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('selectedClubName');
    localStorage.removeItem('selectedClubLogo');
    localStorage.removeItem('selectedClubBanner');
    localStorage.removeItem('active_club_id');
    localStorage.removeItem('rwp_active_club');

    // Thorough sweep: remove any key matching selectedClub or active_club
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith('selectedClub') ||
          key.includes('selectedClub') ||
          key === 'active_club_id' ||
          key.includes('active_club') ||
          key.includes('activeClub') ||
          key.includes('currentClub'))
      ) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  }

  if (window.sessionStorage) {
    sessionStorage.removeItem('selected_club_plan');
    sessionStorage.removeItem('pending_paid_ride_id');
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && (k.startsWith('selected_club') || k.startsWith('geo_') || k.includes('club'))) {
        sessionKeys.push(k);
      }
    }
    sessionKeys.forEach((k) => sessionStorage.removeItem(k));
  }
};

/**
 * Permanently purge a deleted club from the entire browser:
 * - Cleans localStorage (both user-scoped and global keys)
 * - Cleans sessionStorage
 * - Purges Redux clubSlice state
 * - Invalidates RTK Query cache so queries never serve stale club responses
 * - Triggers a fresh background fetch of club lists from the server
 */
export const purgeClubFromBrowser = (clubId: number | string, dispatch?: any) => {
  if (typeof window === 'undefined') return;
  const numId = Number(clubId);

  // 1. Remove from localStorage
  if (window.localStorage) {
    // Check if the currently active club is the one being purged
    const activeStoredId = localStorage.getItem('selectedClubId');
    const isCurrentClubDeleted =
      !activeStoredId ||
      Number(activeStoredId) === numId ||
      activeStoredId === String(numId);

    if (isCurrentClubDeleted) {
      clearAllClubStorage();
    } else {
      // Remove any specific key referencing this clubId
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key);
        if (key.includes(String(numId)) || val === String(numId)) {
          toRemove.push(key);
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k));
    }
  }

  // 2. Remove from sessionStorage
  if (window.sessionStorage) {
    sessionStorage.removeItem('selected_club_plan');
    sessionStorage.removeItem('pending_paid_ride_id');
  }

  // 3. Purge Redux & RTK Query
  if (dispatch) {
    // Remove from clubSlice state
    dispatch(deleteClubFromState(numId));

    // Invalidate RTK Query cache
    dispatch(apiSlice.util.invalidateTags(['Club', 'Ride']));

    // Trigger fresh list fetch from backend
    dispatch(fetchMyClubs());
    dispatch(fetchJoinedClubs());
    dispatch(fetchExploreClubs());
  }
};
