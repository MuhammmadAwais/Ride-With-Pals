import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ClubService } from '../services/clubService';
import type { ClubState, Club } from '../types/clubTypes';
import { toast } from 'sonner';

const extractArray = (res: any) => {
  if (Array.isArray(res)) return res;
  if (res?.response?.rows && Array.isArray(res.response.rows)) return res.response.rows;
  if (res?.response?.data && Array.isArray(res.response.data)) return res.response.data;
  if (res?.response && Array.isArray(res.response)) return res.response;
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res?.data?.rows && Array.isArray(res.data.rows)) return res.data.rows;
  if (res?.data && Array.isArray(res.data)) return res.data;
  if (res?.rows && Array.isArray(res.rows)) return res.rows;
  return res?.response?.rows || res?.response?.data || res?.data?.data || res?.data || res?.response || res || [];
};

const initialState: ClubState & {
  currentClubMembers?: any[];
  currentJoinRequests?: any[];
  currentClubRides?: any[];
  currentClubNews?: any[];
  currentShopItems?: any[];
} = {
  myClubs: [],       // MANAGED clubs: clubs this user owns/admins (owned=true API call)
  joinedClubs: [],   // JOINED clubs: clubs this user is a member of (joined API call)
  exploreClubs: [],  // ALL public clubs for discovery
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

/**
 * Fetches ONLY clubs the current user OWNS or ADMINS.
 * Maps to GET /clubs?owned=true (equivalent to Flutter's getAllClubs(owned: true)).
 * Used to populate the Club Management sidebar.
 */
export const fetchMyClubs = createAsyncThunk<Club[], void, { rejectValue: string }>(
  'club/fetchMyClubs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ClubService.getAllClubs(true);
      return extractArray(response);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch managed clubs.');
    }
  }
);

/**
 * Fetches clubs the current user has JOINED as a regular member.
 * Maps to GET /clubs/joined (equivalent to Flutter's userJoinedClub()).
 * Used to populate the Athlete Interface "Joined Clubs" section.
 */
export const fetchJoinedClubs = createAsyncThunk<Club[], void, { rejectValue: string }>(
  'club/fetchJoinedClubs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ClubService.getJoinedClubs();
      return extractArray(response);
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch joined clubs.');
    }
  }
);

/**
 * Fetches ALL public clubs for discovery (Explore tab).
 */
export const fetchExploreClubs = createAsyncThunk<Club[], void, { rejectValue: string }>(
  'club/fetchExploreClubs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ClubService.getAllClubs(false);
      return extractArray(response);
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
      return extractArray(response);
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
      return extractArray(response);
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
      return extractArray(response);
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
      return extractArray(response);
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
      return extractArray(response);
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
      // Fetch My Clubs (managed/owned)
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
      // Fetch Joined Clubs (as regular member)
      .addCase(fetchJoinedClubs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJoinedClubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.joinedClubs = action.payload;
      })
      .addCase(fetchJoinedClubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Error fetching joined clubs';
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
        if (state.currentJoinRequests) {
          state.currentJoinRequests = state.currentJoinRequests.filter(
            (req) => req.id !== action.payload.requestId
          );
        }
      })
      // Remove Club Member
      .addCase(removeClubMemberThunk.fulfilled, (state, action) => {
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
      })
      // Reset state on logout
      .addCase('auth/logout', () => {
        return initialState;
      });
  },
});

export const { clearClubError, setCurrentClub } = clubSlice.actions;
export default clubSlice.reducer;
