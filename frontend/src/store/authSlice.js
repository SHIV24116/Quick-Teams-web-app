import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/axios';

const userFromStorage = localStorage.getItem('qt_user')
  ? JSON.parse(localStorage.getItem('qt_user'))
  : null;
const tokenFromStorage = localStorage.getItem('qt_token') || null;

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/login', credentials);
      localStorage.setItem('qt_token', response.data.token);
      localStorage.setItem('qt_user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('qt_token', response.data.token);
      localStorage.setItem('qt_user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/auth/me');
      localStorage.setItem('qt_user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      localStorage.setItem('qt_user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Profile update failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage,
    token: tokenFromStorage,
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('qt_token');
      localStorage.removeItem('qt_user');
      state.user = null;
      state.token = null;
      state.error = null;
      state.successMessage = null;
    },
    clearAuthAlerts: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = action.payload.message || 'Login successful';
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = action.payload.message || 'Registration successful';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Me
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.successMessage = action.payload.message || 'Profile updated';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearAuthAlerts } = authSlice.actions;
export default authSlice.reducer;
