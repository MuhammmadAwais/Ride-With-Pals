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

  // Initialize from localStorage on mount if Redux is empty
  useEffect(() => {
    if (!currentClub) {
      const storedId = localStorage.getItem('selectedClubId');
      const storedName = localStorage.getItem('selectedClubName');
      const storedLogo = localStorage.getItem('selectedClubLogo');
      const storedBanner = localStorage.getItem('selectedClubBanner');
      
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
  }, [currentClub, dispatch]);

  const setActiveClub = useCallback((club: Club) => {
    // 1. Update Redux (Triggers UI Reactivity)
    dispatch(setCurrentClub(club));

    // 2. Persist to localStorage (For hard refreshes)
    localStorage.setItem('selectedClubId', club.id.toString());
    localStorage.setItem('selectedClubName', club.clubName);
    if (club.logo) localStorage.setItem('selectedClubLogo', club.logo);
    if (club.coverImage) localStorage.setItem('selectedClubBanner', club.coverImage);
  }, [dispatch]);

  const clearActiveClub = useCallback(() => {
    dispatch(setCurrentClub(null));
    localStorage.removeItem('selectedClubId');
    localStorage.removeItem('selectedClubName');
    localStorage.removeItem('selectedClubLogo');
    localStorage.removeItem('selectedClubBanner');
  }, [dispatch]);

  return {
    activeClub: currentClub,
    clubId: currentClub?.id || null,
    setActiveClub,
    clearActiveClub,
  };
};
