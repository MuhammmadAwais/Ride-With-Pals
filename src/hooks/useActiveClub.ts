import { useCallback, useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { setCurrentClub } from '@/features/club/slices/clubSlice';
import type { Club } from '@/features/club/types/clubTypes';

/**
 * Custom hook to manage the currently active club context.
 * Replaces direct localStorage access with a reactive Redux single source of truth.
 * Automatically synchronizes with localStorage so refreshes remember the selected club.
 */
export const useActiveClub = () => {
  const dispatch = useAppDispatch();
  const currentClub = useAppSelector((state) => state.club.currentClub);
  const userId = useAppSelector((state) => state.auth.user?.id);

  // Generate user-specific localStorage keys to prevent leakage on account switching
  const keyId = userId ? `selectedClubId_${userId}` : 'selectedClubId';
  const keyName = userId ? `selectedClubName_${userId}` : 'selectedClubName';
  const keyLogo = userId ? `selectedClubLogo_${userId}` : 'selectedClubLogo';
  const keyBanner = userId ? `selectedClubBanner_${userId}` : 'selectedClubBanner';

  // Initialize from localStorage on mount or user switch if Redux is empty
  useEffect(() => {
    if (!currentClub && userId) {
      const storedId = localStorage.getItem(keyId);
      const storedName = localStorage.getItem(keyName);
      const storedLogo = localStorage.getItem(keyLogo);
      const storedBanner = localStorage.getItem(keyBanner);
      
      if (storedId) {
        // Hydrate a partial club just to keep the ID and visuals available
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
    // 1. Update Redux (Triggers UI Reactivity)
    dispatch(setCurrentClub(club as Club));

    // 2. Persist to localStorage (For hard refreshes)
    if (club.id) {
      localStorage.setItem(keyId, club.id.toString());
    }
    if (club.clubName || club.name) {
      localStorage.setItem(keyName, club.clubName || club.name);
    }
    if (club.logo) {
      localStorage.setItem(keyLogo, club.logo);
    } else {
      localStorage.removeItem(keyLogo);
    }
    if (club.coverImage) {
      localStorage.setItem(keyBanner, club.coverImage);
    } else {
      localStorage.removeItem(keyBanner);
    }
  }, [dispatch, keyId, keyName, keyLogo, keyBanner]);

  const clearActiveClub = useCallback(() => {
    dispatch(setCurrentClub(null));
    localStorage.removeItem(keyId);
    localStorage.removeItem(keyName);
    localStorage.removeItem(keyLogo);
    localStorage.removeItem(keyBanner);
  }, [dispatch, keyId, keyName, keyLogo, keyBanner]);

  return {
    activeClub: currentClub,
    clubId: currentClub?.id || null,
    setActiveClub,
    clearActiveClub,
  };
};
