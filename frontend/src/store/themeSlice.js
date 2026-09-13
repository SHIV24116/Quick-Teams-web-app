import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const saved = localStorage.getItem('qt_theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const initialTheme = getInitialTheme();

if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    mode: initialTheme
  },
  reducers: {
    toggleTheme: (state) => {
      const nextTheme = state.mode === 'dark' ? 'light' : 'dark';
      state.mode = nextTheme;
      localStorage.setItem('qt_theme', nextTheme);

      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
