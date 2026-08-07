/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { toast } from 'sonner';
import { ClubService as ApiClubService, RideService as ApiRideService, NewsService as ApiNewsService, ShopService as ApiShopService } from '@/api/backendApi';
import type { CreateClubPayload } from '../types/clubTypes';

export const useClub = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllClubs = async (owned?: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiClubService.clubs(owned ? { owned: true } : {});
      return response.response || response.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch clubs.';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchJoinedClubs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiClubService.getJoinedClubs();
      return response.response || response.data || [];
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch joined clubs.';
      setError(msg);
      toast.error(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClubById = async (clubId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiClubService.getClubInfoByID({ clubId });
      return response.response || response.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to fetch club details.';
      setError(msg);
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createClub = async (payload: CreateClubPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ApiClubService.createClubProfile(payload);
      toast.success('Club created successfully!');
      return response.response || response.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to create club.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const joinClub = async (clubId: number, invitationCode?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = { clubId };
      if (invitationCode) payload.invitationCode = invitationCode;
      const response = await ApiClubService.joinClub(payload);
      const successMsg = response.message || (response.response?.status === 'pending' ? 'Your request to join has been sent!' : 'Joined club successfully!');
      toast.success(successMsg);
      return response.response || response.data;
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to join club.';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchAllClubs,
    fetchJoinedClubs,
    fetchClubById,
    createClub,
    joinClub,
    isLoading,
    error,
  };
};

export const ClubService = {
  // Maintaining backwards compatibility for components that haven't migrated to hooks yet
  getAllClubs: async (owned?: boolean) => {
    const response = await ApiClubService.clubs(owned ? { owned: true } : {});
    return response;
  },
  getJoinedClubs: async () => {
    const response = await ApiClubService.getJoinedClubs();
    return response;
  },
  getClubById: async (clubId: number) => {
    const response = await ApiClubService.getClubInfoByID({ clubId });
    return response;
  },
  createClubProfile: async (payload: CreateClubPayload) => {
    const response = await ApiClubService.createClubProfile(payload);
    return response;
  },
  joinClub: async (clubId: number, invitationCode?: string) => {
    const payload: any = { clubId };
    if (invitationCode) payload.invitationCode = invitationCode;
    const response = await ApiClubService.joinClub(payload);
    return response;
  },
  editClub: async (payload: any) => {
    // Map visibility ("Public"/"Private") to clubPrivacyId (1/2)
    const clubPrivacyId = payload.visibility === 'Private' ? 2 : 1;

    // Map clubType string to clubTypeId number
    let clubTypeId = 1;
    if (payload.clubType === 'Running') {
      clubTypeId = 2;
    } else if (payload.clubType === 'Triathlon') {
      clubTypeId = 3;
    }

    const apiPayload = {
      clubId: payload.clubId,
      clubName: payload.clubName,
      clubPrivacyId,
      clubTypeId,
      email: payload.email,
      phone: payload.phone,
      location: payload.location,
      description: payload.description,
    };

    const response = await ApiClubService.updateClubInfoById(apiPayload);
    return response;
  },
  leaveClub: async (clubId: number) => {
    const response = await ApiClubService.leaveClub({ clubId });
    return response;
  },
  getClubMembers: async (clubId: number, limit = 10, offset = 0, search = '') => {
    const params: any = { clubId, limit, offset };
    if (search) params.search = search;
    const response = await ApiClubService.getClubMembersList(params);
    return response;
  },
  // Add Ride compatibility
  getPublicRides: async (searchQuery = "", limit = 10, offset = 0, clubId?: number) => {
    const params: any = { search: searchQuery, limit, offset };
    if (clubId) params.clubId = clubId;
    const response = await ApiRideService.getActivitiesData(params);
    return response;
  },
  getClubRides: async (clubId: number, status: string, search = "", limit = 10, offset = 0) => {
    const response = await ApiRideService.getClubRides({ clubId, status, search, limit, offset });
    return response;
  },
  // Add News Compatibility
  getAllNews: async (clubId: number, search = "", limit = 10, offset = 0) => {
    const response = await ApiNewsService.getAllNews({ clubId, search, limit, offset });
    return response;
  },
  addNews: async (data: any) => {
    const response = await ApiNewsService.addNews(data);
    return response;
  },
  // Shop compatibility
  getAllShopItems: async (clubId: number, search = "", limit = 10, offset = 0) => {
    const response = await ApiShopService.getTheShopItems({ clubId, search, limit, offset });
    return response;
  },
  updateShopItem: async (payload: any) => {
    const response = await ApiShopService.updateItemToShop(payload);
    return response;
  },
  addShopItem: async (payload: any) => {
    const response = await ApiShopService.addItemToShop(payload);
    return response;
  },
  getClubDashboardStats: async (clubId: number) => {
    const response = await ApiClubService.getClubDashboardStats({ clubId });
    return response;
  },
  getClubJoinRequests: async (clubId: number, limit = 10, offset = 0) => {
    const response = await ApiClubService.getClubJoinRequest({ clubId, limit, offset });
    return response;
  },
  manageJoinRequest: async (requestId: number, status: 'approved' | 'rejected') => {
    const response = await ApiClubService.manageJoinGroupRequest({ requestId, status });
    return response;
  },
  removeClubMember: async (clubId: number, memberId: number) => {
    const response = await ApiClubService.removeClubMember({ clubId, memberId });
    return response;
  }
};
