import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

export const fetchMyTeams = createAsyncThunk(
  'teams/fetchMyTeams',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/teams/my');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch teams');
    }
  }
);

export const createTeam = createAsyncThunk(
  'teams/createTeam',
  async (teamData, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post('/teams', teamData);
      dispatch(fetchMyTeams());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create team');
    }
  }
);

export const fetchTeamDetails = createAsyncThunk(
  'teams/fetchTeamDetails',
  async (teamId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch team details');
    }
  }
);

export const makeAdmin = createAsyncThunk(
  'teams/makeAdmin',
  async ({ teamId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post(`/teams/${teamId}/make-admin/${userId}`);
      dispatch(fetchTeamDetails(teamId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to promote member');
    }
  }
);

export const removeMember = createAsyncThunk(
  'teams/removeMember',
  async ({ teamId, userId }, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.delete(`/teams/${teamId}/members/${userId}`);
      dispatch(fetchTeamDetails(teamId));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

export const leaveTeam = createAsyncThunk(
  'teams/leaveTeam',
  async (teamId, { rejectWithValue, dispatch }) => {
    try {
      const response = await API.post(`/teams/${teamId}/leave`);
      dispatch(fetchMyTeams());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave team');
    }
  }
);

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    myTeams: [],
    currentTeam: null,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearTeamAlerts: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchMyTeams
      .addCase(fetchMyTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.myTeams = action.payload;
      })
      .addCase(fetchMyTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createTeam
      .addCase(createTeam.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      // fetchTeamDetails
      .addCase(fetchTeamDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTeam = action.payload;
      })
      .addCase(fetchTeamDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // makeAdmin
      .addCase(makeAdmin.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      })
      // removeMember
      .addCase(removeMember.fulfilled, (state, action) => {
        state.successMessage = action.payload.message;
      });
  }
});

export const { clearTeamAlerts } = teamSlice.actions;
export default teamSlice.reducer;
