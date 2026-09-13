import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async (query = '', { rejectWithValue }) => {
    try {
      const response = await API.get(`/users/matches?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch matches');
    }
  }
);

export const sendInvite = createAsyncThunk(
  'match/sendInvite',
  async (inviteData, { rejectWithValue }) => {
    try {
      const response = await API.post('/invites', inviteData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invite');
    }
  }
);

export const fetchIncomingInvites = createAsyncThunk(
  'match/fetchIncomingInvites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/invites/incoming');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests');
    }
  }
);

export const acceptInvite = createAsyncThunk(
  'match/acceptInvite',
  async (reqId, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post(`/invites/${reqId}/accept`);
      dispatch(fetchIncomingInvites());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invite');
    }
  }
);

export const declineInvite = createAsyncThunk(
  'match/declineInvite',
  async (reqId, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post(`/invites/${reqId}/decline`);
      dispatch(fetchIncomingInvites());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to decline invite');
    }
  }
);

const matchSlice = createSlice({
  name: 'match',
  initialState: {
    matches: [],
    incomingInvites: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearMatchAlerts: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchMatches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // sendInvite
      .addCase(sendInvite.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      .addCase(sendInvite.rejected, (state, action) => {
        state.error = action.payload;
      })
      // fetchIncomingInvites
      .addCase(fetchIncomingInvites.fulfilled, (state, action) => {
        state.incomingInvites = action.payload;
      })
      // acceptInvite
      .addCase(acceptInvite.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      // declineInvite
      .addCase(declineInvite.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      });
  }
});

export const { clearMatchAlerts } = matchSlice.actions;
export default matchSlice.reducer;
