import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ClubService } from '../services/clubService';
import type { ClubState, Club } from '../types/clubTypes';
import { toast } from 'sonner';

const initialState: ClubState & { 
  currentClubMembers?: any[]; 
  currentJoinRequests?: any[];
  currentClubRides?: any[];
  currentClubNews?: any[];
  currentShopItems?: any[];
} = {
  myClubs: [],
  exploreClubs: [],
  currentClub: null,
  currentClubMembers: [],
  currentJoinRequests: [],
  currentClubRides: [],
  currentClubNews: [],
  currentShopItems: [],
  isLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyClubs = createAsyncThunk<Club[], void, { rejectValue: string }>(
  'club/fetchMyClubs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any;
      const role = state?.auth?.user?.role;
      
      // Dynamic logic: Organizers fetch owned clubs. Athletes fetch joined clubs.
      if (role === 'organizer' || role === 'owner') {
        const response = await ClubService.getAllClubs(true);
        return response?.data?.data || response?.data || [];
      } else {
        const response = await ClubService.getJoinedClubs();
        return response?.data?.data || response?.data || [];
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch your clubs.');
    }
  }
);

export const fetchExploreClubs = createAsyncThunk<Club[], void, { rejectValue: string }>(
  'club/fetchExploreClubs',
  async (_, { rejectWithValue }) => {
    try {
      // Athletes fetch all available clubs
      const response = await ClubService.getAllClubs(false);
      return response?.data?.data || response?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch explore clubs.');
    }
  }
);

export const fetchClubMembers = createAsyncThunk<any[], { clubId: number, limit?: number, offset?: number, search?: string }, { rejectValue: string }>(
  'club/fetchClubMembers',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ClubService.getClubMembers(params.clubId, params.limit, params.offset, params.search);
      return response?.data?.data || response?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch club members.');
    }
  }
);

export const fetchClubJoinRequests = createAsyncThunk<any[], { clubId: number, limit?: number, offset?: number }, { rejectValue: string }>(
  'club/fetchClubJoinRequests',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ClubService.getClubJoinRequests(params.clubId, params.limit, params.offset);
      return response?.data?.data || response?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch join requests.');
    }
  }
);

export const manageJoinRequestThunk = createAsyncThunk<any, { requestId: number, status: 'approved' | 'rejected' }, { rejectValue: string }>(
  'club/manageJoinRequest',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ClubService.manageJoinRequest(params.requestId, params.status);
      toast.success(`Request ${params.status} successfully.`);
      return { requestId: params.requestId, status: params.status, data: response };
    } catch (err: any) {
      toast.error(err.message || 'Failed to manage join request.');
      return rejectWithValue(err.message || 'Failed to manage join request.');
    }
  }
);

export const removeClubMemberThunk = createAsyncThunk<number, { clubId: number, memberId: number }, { rejectValue: string }>(
  'club/removeClubMember',
  async (params, { rejectWithValue }) => {
    try {
      await ClubService.removeClubMember(params.clubId, params.memberId);
      toast.success('Member removed successfully.');
      return params.memberId;
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove member.');
      return rejectWithValue(err.message || 'Failed to remove member.');
    }
  }
);

export const fetchClubRides = createAsyncThunk<any[], { clubId: number, status: string, search?: string, limit?: number, offset?: number }, { rejectValue: string }>(
  'club/fetchClubRides',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ClubService.getClubRides(params.clubId, params.status, params.search, params.limit, params.offset);
      return response?.data?.data || response?.data || response?.response?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch rides.');
    }
  }
);

export const fetchClubNews = createAsyncThunk<any[], { clubId: number, search?: string, limit?: number, offset?: number }, { rejectValue: string }>(
  'club/fetchClubNews',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ClubService.getAllNews(params.clubId, params.search, params.limit, params.offset);
      return response?.data?.data || response?.data || response?.response?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch news.');
    }
  }
);

export const fetchShopItems = createAsyncThunk<any[], { clubId: number, search?: string, limit?: number, offset?: number }, { rejectValue: string }>(
  'club/fetchShopItems',
  async (params, { rejectWithValue }) => {
    try {
      const response = await ClubService.getAllShopItems(params.clubId, params.search, params.limit, params.offset);
      return response?.data?.data || response?.data || response?.response?.data || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch shop items.');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const clubSlice = createSlice({
  name: 'club',
  initialState,
  reducers: {
    clearClubError(state) {
      state.error = null;
    },
    setCurrentClub(state, action) {
      state.currentClub = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Clubs
      .addCase(fetchMyClubs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyClubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myClubs = action.payload;
      })
      .addCase(fetchMyClubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching clubs';
      })
      // Fetch Explore Clubs
      .addCase(fetchExploreClubs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExploreClubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exploreClubs = action.payload;
      })
      .addCase(fetchExploreClubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching explore clubs';
      })
      // Fetch Club Members
      .addCase(fetchClubMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClubMembers = action.payload;
      })
      .addCase(fetchClubMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching club members';
      })
      // Fetch Join Requests
      .addCase(fetchClubJoinRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubJoinRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentJoinRequests = action.payload;
      })
      .addCase(fetchClubJoinRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching join requests';
      })
      // Manage Join Request
      .addCase(manageJoinRequestThunk.fulfilled, (state, action) => {
        // Remove the processed request from state
        if (state.currentJoinRequests) {
          state.currentJoinRequests = state.currentJoinRequests.filter(
            (req) => req.id !== action.payload.requestId
          );
        }
      })
      // Remove Club Member
      .addCase(removeClubMemberThunk.fulfilled, (state, action) => {
        // Remove the member from state
        if (state.currentClubMembers) {
          state.currentClubMembers = state.currentClubMembers.filter(
            (m) => m.userId !== action.payload
          );
        }
      })
      // Fetch Club Rides
      .addCase(fetchClubRides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubRides.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClubRides = action.payload;
      })
      .addCase(fetchClubRides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching club rides';
      })
      // Fetch Club News
      .addCase(fetchClubNews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClubNews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentClubNews = action.payload;
      })
      .addCase(fetchClubNews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching club news';
      })
      // Fetch Shop Items
      .addCase(fetchShopItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShopItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentShopItems = action.payload;
      })
      .addCase(fetchShopItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching shop items';
      });
  },
});

export const { clearClubError, setCurrentClub } = clubSlice.actions;
export default clubSlice.reducer;
