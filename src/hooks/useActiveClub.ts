import { useCallback, useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { setCurrentClub } from '@/features/club/slices/clubSlice';
import type { Club } from '@/features/club/types/clubTypes';

/** Clear all possible club-related keys from localStorage (both user-scoped & legacy fallbacks). */
export const clearAllClubStorage = (uid?: string | number) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
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
};

/**
 * Custom hook to manage the currently active club context.
 * Replaces direct localStorage access with a reactive Redux single source of truth.
 * Automatically synchronizes with localStorage and validates against server-fetched myClubs.
 */
export const useActiveClub = () => {
  const dispatch = useAppDispatch();
  const currentClub = useAppSelector((state) => state.club.currentClub);
  const myClubs = useAppSelector((state) => state.club.myClubs);
  const isClubLoading = useAppSelector((state) => state.club.isLoading);
  const userId = useAppSelector((state) => state.auth.user?.id);

  // Generate user-specific localStorage keys to prevent leakage on account switching
  const keyId = userId ? `selectedClubId_${userId}` : 'selectedClubId';
  const keyName = userId ? `selectedClubName_${userId}` : 'selectedClubName';
  const keyLogo = userId ? `selectedClubLogo_${userId}` : 'selectedClubLogo';
  const keyBanner = userId ? `selectedClubBanner_${userId}` : 'selectedClubBanner';

  // 1. Initial hydration from localStorage on mount if Redux is empty
  useEffect(() => {
    if (!currentClub && userId) {
      const storedId = localStorage.getItem(keyId) || localStorage.getItem('selectedClubId');
      const storedName = localStorage.getItem(keyName) || localStorage.getItem('selectedClubName');
      const storedLogo = localStorage.getItem(keyLogo) || localStorage.getItem('selectedClubLogo');
      const storedBanner = localStorage.getItem(keyBanner) || localStorage.getItem('selectedClubBanner');
      
      if (storedId) {
        dispatch(setCurrentClub({
          id: Number(storedId),
          clubName: storedName || 'Unknown Club',
          logo: storedLogo || '',
          coverImage: storedBanner || '',
        } as Club));
      }
    }
  }, [currentClub, dispatch, userId, keyId, keyName, keyLogo, keyBanner]);

  const setActiveClub = useCallback((club: any) => {
    if (!club) return;
    const resolvedId = Number(club.id || club.clubId);
    const resolvedName = club.clubName || club.name || '';
    const resolvedLogo = club.logo || '';
    const resolvedBanner = club.coverImage || club.bannerImage || '';

    // 1. Update Redux (Triggers UI Reactivity)
    dispatch(setCurrentClub({
      ...club,
      id: resolvedId,
      clubName: resolvedName,
      logo: resolvedLogo,
      coverImage: resolvedBanner,
    } as Club));

    // 2. Persist to localStorage (User-scoped and fallback)
    if (resolvedId) {
      localStorage.setItem(keyId, resolvedId.toString());
      localStorage.setItem('selectedClubId', resolvedId.toString());
    }
    if (resolvedName) {
      localStorage.setItem(keyName, resolvedName);
      localStorage.setItem('selectedClubName', resolvedName);
    }
    if (resolvedLogo) {
      localStorage.setItem(keyLogo, resolvedLogo);
      localStorage.setItem('selectedClubLogo', resolvedLogo);
    } else {
      localStorage.removeItem(keyLogo);
      localStorage.removeItem('selectedClubLogo');
    }
    if (resolvedBanner) {
      localStorage.setItem(keyBanner, resolvedBanner);
      localStorage.setItem('selectedClubBanner', resolvedBanner);
    } else {
      localStorage.removeItem(keyBanner);
      localStorage.removeItem('selectedClubBanner');
    }
  }, [dispatch, keyId, keyName, keyLogo, keyBanner]);

  const clearActiveClub = useCallback(() => {
    dispatch(setCurrentClub(null));
    clearAllClubStorage(userId);
  }, [dispatch, userId]);

  // 2. Validation effect: Ensure selected club actually exists in server-fetched myClubs
  useEffect(() => {
    // Only perform validation once clubs have loaded or if myClubs list is updated
    if (!isClubLoading && Array.isArray(myClubs)) {
      if (myClubs.length === 0) {
        // User has NO manageable clubs on server — immediately wipe out any stale hydrated club
        if (currentClub !== null) {
          clearActiveClub();
        }
      } else {
        // User has at least 1 club. Verify whether currentClub belongs to myClubs
        if (currentClub) {
          const exists = myClubs.some((c: any) => Number(c?.id || c?.clubId) === Number(currentClub.id));
          if (!exists) {
            // Selected club was deleted or user lost access -> auto-switch to first valid club
            setActiveClub(myClubs[0]);
          }
        }
      }
    }
  }, [isClubLoading, myClubs, currentClub, clearActiveClub, setActiveClub]);

  return {
    activeClub: currentClub,
    clubId: currentClub?.id ? Number(currentClub.id) : null,
    setActiveClub,
    clearActiveClub,
  };
};
