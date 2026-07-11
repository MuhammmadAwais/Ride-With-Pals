import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { ClubService } from '../services/clubService';
import { fetchMyClubs, fetchExploreClubs } from '../slices/clubSlice';
import { toast } from 'sonner';
import type { CreateClubPayload } from '../types/clubTypes';

export function useClub() {
  const dispatch = useAppDispatch();
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClub = async (payload: CreateClubPayload) => {
    setIsCreating(true);
    try {
      await ClubService.createClubProfile(payload);
      toast.success("Club created successfully!");
      dispatch(fetchMyClubs()); // Refresh the clubs list
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to create club");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinClub = async (clubId: number, invitationCode?: string) => {
    setIsJoining(true);
    try {
      await ClubService.joinClub(clubId, invitationCode);
      toast.success("Successfully joined the club!");
      // Refresh both lists to move it from Explore to My Clubs
      dispatch(fetchMyClubs());
      dispatch(fetchExploreClubs());
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to join club");
      return false;
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveClub = async (clubId: number) => {
    try {
      await ClubService.leaveClub(clubId);
      toast.success("Successfully left the club");
      dispatch(fetchMyClubs());
      dispatch(fetchExploreClubs());
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to leave club");
      return false;
    }
  };

  return {
    handleCreateClub,
    handleJoinClub,
    handleLeaveClub,
    isJoining,
    isCreating
  };
}
