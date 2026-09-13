import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchMe } from './store/authSlice';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ToastAlert from './components/ToastAlert';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import MyTeams from './pages/MyTeams';
import TeamWorkspace from './pages/TeamWorkspace';
import Requests from './pages/Requests';
import Profile from './pages/Profile';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (localStorage.getItem('qt_token')) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/matches" element={<Matches />} />
              <Route path="/my-teams" element={<MyTeams />} />
              <Route path="/team/:teamId" element={<TeamWorkspace />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </main>

        <Footer />
        <ToastAlert />
      </div>
    </Router>
  );
}

export default App;
