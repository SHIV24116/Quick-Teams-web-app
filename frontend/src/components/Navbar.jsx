import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { toggleTheme } from '../store/themeSlice';
import {
  Users,
  Sun,
  Moon,
  Search,
  FolderGit2,
  Mail,
  User,
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { mode } = useSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              QT
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center space-x-1">
                <span>Quick Teams</span>
              </span>
              <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400 tracking-wide uppercase">
                Talent Workspace Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/')
                  ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Home
            </Link>

            {user && (
              <>
                <Link
                  to="/matches"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    isActive('/matches')
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Talent Match</span>
                </Link>

                <Link
                  to="/my-teams"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    isActive('/my-teams') || location.pathname.startsWith('/team/')
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>My Teams</span>
                </Link>

                <Link
                  to="/requests"
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                    isActive('/requests')
                      ? 'bg-brand-50 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Invites</span>
                </Link>
              </>
            )}
          </div>

          {/* Right Action Icons & Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center space-x-1 text-xs font-medium"
              title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {mode === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="text-[11px]">Dark</span>
                </>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : user.username[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user.name || user.username}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400"
            >
              {mode === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Home
          </Link>
          {user ? (
            <>
              <Link
                to="/matches"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Talent Match
              </Link>
              <Link
                to="/my-teams"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                My Teams
              </Link>
              <Link
                to="/requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Invites
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Profile Manager
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-semibold text-rose-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
