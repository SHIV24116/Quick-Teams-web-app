import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import teamReducer from './teamSlice';
import matchReducer from './matchSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    teams: teamReducer,
    match: matchReducer,
    theme: themeReducer,
  },
});
